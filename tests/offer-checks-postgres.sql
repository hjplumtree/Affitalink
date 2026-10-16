-- Runs after storage-postgres.sql in the disposable test database.
\set ON_ERROR_STOP on
select current_database() = 'affitalink_storage_test' as test_database \gset
\if :test_database
\else
  \quit 1
\endif
do $$
declare
  original public.coupon_snapshots;
  saved public.coupon_snapshots;
  before_check timestamptz;
begin
  select * into original from public.coupon_snapshots where id = 'old_id';
  assert not has_function_privilege('authenticated', 'public.set_offer_checked(text,text,boolean,jsonb)', 'EXECUTE');
  assert has_function_privilege('service_role', 'public.set_offer_checked(text,text,boolean,jsonb)', 'EXECUTE');
  before_check := clock_timestamp();
  select * into saved from public.set_offer_checked(original.workspace_id, original.id, true, to_jsonb(original));
  assert saved.checked and saved.checked_at >= before_check, 'check uses DB time';
  assert to_jsonb(saved) - 'checked' - 'checked_at' = to_jsonb(original) - 'checked' - 'checked_at', 'check updates no collection fields';
  select * into saved from public.set_offer_checked(original.workspace_id, original.id, false, to_jsonb(original));
  assert not saved.checked and saved.checked_at is null, 'uncheck clears time';
  assert not exists (select * from public.set_offer_checked('another_workspace', original.id, true, to_jsonb(original))), 'foreign workspace cannot change check';
  assert not exists (select * from public.set_offer_checked(original.workspace_id, 'missing', true, to_jsonb(original))), 'missing ID returns no row';

  update public.coupon_snapshots set terms = 'Changed after page load' where id = original.id;
  begin
    perform public.set_offer_checked(original.workspace_id, original.id, true, to_jsonb(original));
    raise exception 'expected stale content conflict';
  exception when serialization_failure then null;
  end;
  select * into saved from public.coupon_snapshots where id = original.id;
  assert not saved.checked and saved.checked_at is null, 'stale request must not set a check';
  select * into saved from public.set_offer_checked(original.workspace_id, original.id, true, to_jsonb(saved));
  assert saved.checked, 'freshly read details can be checked';

  -- A metadata-only refresh does not invalidate the displayed benefit.
  original := saved;
  update public.coupon_snapshots set raw_json = '{"metadata":"updated"}', last_seen_at = clock_timestamp() where id = original.id;
  select * into saved from public.set_offer_checked(original.workspace_id, original.id, false, to_jsonb(original));
  assert not saved.checked and saved.raw_json = '{"metadata":"updated"}'::jsonb, 'check must preserve concurrent metadata';
  raise notice 'PASS: real SQL check/uncheck, DB time, no data overwrite, workspace isolation, stale-content conflict, fresh retry, metadata preservation';
end;
$$;
