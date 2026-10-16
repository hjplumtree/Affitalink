-- Run only in a new disposable PostgreSQL database named affitalink_storage_test.
\set ON_ERROR_STOP on
select current_database() = 'affitalink_storage_test' as test_database \gset
\if :test_database
\else
  \echo 'Use a disposable affitalink_storage_test database.'
  \quit 1
\endif

create role anon;
create role authenticated;
create role service_role;
create schema auth;
create table auth.users (id uuid primary key);
\ir ../supabase/migrations/20260921000000_initial_schema.sql
\ir ../supabase/migrations/20260923000000_add_ebay_network.sql

insert into auth.users values ('11111111-1111-4111-8111-111111111111');
insert into public.connectors (id, workspace_id, network, status)
values ('test_connector', '11111111-1111-4111-8111-111111111111', 'cj', 'connected');
insert into public.coupon_snapshots (
  id, workspace_id, connector_id, network, logical_key, merchant_id, merchant_name,
  title, description, terms, coupon_code, destination_url, starts_at, ends_at, raw_json
) values (
  'old_id', '11111111-1111-4111-8111-111111111111', 'test_connector', 'cj', 'cj:9:group:42', '9', 'Shop',
  'Sale', E'한글, "offer"\nsecond line', 'Members only', 'Save-0', 'https://example.com/?a=1&b=2',
  '2026-10-01T00:00:00Z', '2026-10-31T23:59:59Z', '{"extra":[0,false,{"$":{"lang":"ko"},"_":"정보"}]}'
);
\ir ../supabase/migrations/20261016000000_preserve_offer_records.sql

do $$
declare
  coupon jsonb;
  original public.coupon_snapshots;
  saved public.coupon_snapshots;
  run jsonb;
  connector jsonb;
  changed jsonb;
  field text;
  run_number integer := 0;
  before_runs integer;
begin
  select * into original from public.coupon_snapshots where id = 'old_id';
  assert original.source_offer_id = 'group:42', 'migration must preserve colon-containing IDs';
  assert not original.checked and original.checked_at is null, 'legacy check defaults';
  assert original.raw_json #> '{extra,1}' = 'false'::jsonb, 'migration must preserve raw source';
  assert not has_function_privilege('authenticated', 'public.save_sync_result(jsonb,jsonb,jsonb)', 'EXECUTE'), 'RPC stays server-only';
  assert has_function_privilege('service_role', 'public.save_sync_result(jsonb,jsonb,jsonb)', 'EXECUTE');

  coupon := to_jsonb(original) || jsonb_build_object(
    'id', 'different_incoming_id', 'raw_json', '{"unknown":[0,false,{"nested":"value"}]}'::jsonb,
    'updated_at', '2026-10-16T10:00:00Z', 'last_seen_at', '2026-10-16T10:00:00Z'
  );
  connector := jsonb_build_object('status', 'connected', 'sync_status', 'partial_failure', 'last_sync_at', '2026-10-16T10:00:00Z');
  run := jsonb_build_object(
    'id', 'run_0', 'workspace_id', original.workspace_id, 'connector_id', original.connector_id,
    'network', 'cj', 'status', 'partial_failure', 'fetched_count', 3, 'normalized_count', 1,
    'partial_failures_json', '[{"stage":"conversion","message":"bad date","raw":{"date":"bad","zero":0}}]'::jsonb,
    'excluded_json', '[{"reason":"not_a_benefit","raw":{"kind":"ad","values":[0,false]}}]'::jsonb,
    'created_at', '2026-10-16T10:00:00Z', 'completed_at', '2026-10-16T10:01:00Z'
  );

  -- A check saved after collection started must survive an unchanged upsert.
  update public.coupon_snapshots set checked = true, checked_at = '2026-10-16T09:00:00Z' where id = 'old_id';
  perform public.save_sync_result(connector, run, jsonb_build_array(coupon));
  select * into saved from public.coupon_snapshots where id = 'old_id';
  assert saved.checked and saved.checked_at = '2026-10-16T09:00:00Z', 'same content must retain latest check';
  assert saved.id = original.id and saved.created_at = original.created_at, 'identity and creation time must survive';
  assert saved.description = original.description and saved.raw_json = coupon -> 'raw_json', 'text and full raw round trip';
  assert (select count(*) from public.coupon_snapshots) = 1, 'no duplicate row';
  assert (select partial_failures_json from public.sync_runs where id = 'run_0') = run -> 'partial_failures_json', 'failure raw round trip';
  assert (select excluded_json from public.sync_runs where id = 'run_0') = run -> 'excluded_json', 'excluded raw round trip';

  foreach field in array array['merchant_name','title','description','terms','coupon_code','destination_url','starts_at','ends_at'] loop
    run_number := run_number + 1;
    update public.coupon_snapshots set checked = true, checked_at = '2026-10-16T09:00:00Z' where id = 'old_id';
    changed := jsonb_set(coupon, array[field], to_jsonb(case when field in ('starts_at','ends_at') then '2026-10-15T00:00:00Z' else 'changed' end));
    perform public.save_sync_result(connector, run || jsonb_build_object('id', 'changed_' || run_number), jsonb_build_array(changed));
    select * into saved from public.coupon_snapshots where id = 'old_id';
    assert not saved.checked and saved.checked_at is null, 'changed detail must clear check: ' || field;
    perform public.save_sync_result(connector, run || jsonb_build_object('id', 'restore_' || run_number), jsonb_build_array(coupon));
  end loop;

  -- Unknown/failed items must not delete existing rows or overwrite their checks.
  update public.coupon_snapshots set checked = true, checked_at = '2026-10-16T09:00:00Z' where id = 'old_id';
  perform public.save_sync_result(connector, run || '{"id":"empty","normalized_count":0}', '[]');
  assert (select checked from public.coupon_snapshots where id = 'old_id'), 'absent records survive';

  select count(*) into before_runs from public.sync_runs;
  begin
    -- Failure after the upsert must roll back the changed coupon as well.
    perform public.save_sync_result(connector, run || '{"id":"invalid","status":"invalid"}', jsonb_build_array(coupon || '{"title":"must roll back"}'));
    raise exception 'expected check violation';
  exception when check_violation then null;
  end;
  assert (select title from public.coupon_snapshots where id = 'old_id') = original.title, 'failed transaction rolls back content';
  assert (select checked from public.coupon_snapshots where id = 'old_id'), 'failed transaction rolls back check reset';
  assert (select count(*) from public.sync_runs) = before_runs, 'failed transaction does not add history';

  begin
    perform public.save_sync_result(connector, run || '{"id":"wrong_owner"}', jsonb_build_array(coupon || '{"workspace_id":"another"}'));
    raise exception 'expected ownership error';
  exception when raise_exception then
    if sqlerrm <> 'coupon does not belong to this sync' then raise; end if;
  end;
  raise notice 'PASS: migration, defaults, source identity, check retention/reset, raw/outcomes, no duplicates, rollback, workspace isolation, RPC permissions';
end;
$$;
\ir ../supabase/migrations/20261016010000_save_offer_checks.sql
\ir offer-checks-postgres.sql
