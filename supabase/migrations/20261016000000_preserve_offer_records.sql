-- Preserve source identity, raw collection outcomes, and checks during recollection.
begin;

alter table public.coupon_snapshots
  add column source_offer_id text not null default '',
  add column checked boolean not null default false,
  add column checked_at timestamptz,
  add constraint coupon_snapshots_check_time check (
    (checked and checked_at is not null) or (not checked and checked_at is null)
  );

-- Existing logical keys already contain the source ID, including any colons.
update public.coupon_snapshots
set source_offer_id = substring(logical_key from length(network || ':' || merchant_id || ':') + 1)
where starts_with(logical_key, network || ':' || merchant_id || ':');

alter table public.sync_runs
  add column excluded_json jsonb not null default '[]'::jsonb
    check (jsonb_typeof(excluded_json) = 'array');

create or replace function public.save_sync_result(
  connector_update jsonb,
  sync_run jsonb,
  coupons jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(connector_update) <> 'object'
    or jsonb_typeof(sync_run) <> 'object'
    or jsonb_typeof(coupons) <> 'array' then
    raise exception 'invalid sync result';
  end if;

  if not exists (
    select 1 from public.connectors existing
    where existing.id = sync_run ->> 'connector_id'
      and existing.workspace_id = sync_run ->> 'workspace_id'
      and existing.network = sync_run ->> 'network'
  ) then
    raise exception 'connector does not belong to this workspace';
  end if;

  if exists (
    select 1 from jsonb_array_elements(coupons) coupon
    where coupon ->> 'workspace_id' is distinct from sync_run ->> 'workspace_id'
      or coupon ->> 'connector_id' is distinct from sync_run ->> 'connector_id'
      or coupon ->> 'network' is distinct from sync_run ->> 'network'
  ) then
    raise exception 'coupon does not belong to this sync';
  end if;

  insert into public.coupon_snapshots (
    id, workspace_id, connector_id, network, logical_key, source_offer_id, merchant_id,
    merchant_name, title, description, terms, coupon_code, destination_url,
    source_url, starts_at, ends_at, raw_json, status, last_seen_at, updated_at
  )
  select coupon.id, coupon.workspace_id, coupon.connector_id, coupon.network,
    coupon.logical_key, coupon.source_offer_id, coupon.merchant_id, coupon.merchant_name, coupon.title,
    coalesce(coupon.description, ''), coalesce(coupon.terms, ''),
    coalesce(coupon.coupon_code, ''), coalesce(coupon.destination_url, ''),
    coalesce(coupon.source_url, ''), coupon.starts_at, coupon.ends_at,
    coalesce(coupon.raw_json, '{}'::jsonb), coalesce(coupon.status, 'active'),
    coupon.last_seen_at, coupon.updated_at
  from jsonb_to_recordset(coupons) as coupon(
    id text, workspace_id text, connector_id text, network text, logical_key text, source_offer_id text,
    merchant_id text, merchant_name text, title text, description text, terms text,
    coupon_code text, destination_url text, source_url text, starts_at timestamptz,
    ends_at timestamptz, raw_json jsonb, status text, last_seen_at timestamptz,
    updated_at timestamptz
  )
  on conflict (connector_id, logical_key) do update set
    -- Compare under the upsert's row lock, against the latest saved check.
    -- Keep these fields aligned with lib/offerRecord.cjs.
    checked = case when row(coupon_snapshots.network, coupon_snapshots.merchant_id, coupon_snapshots.merchant_name, coupon_snapshots.title, coupon_snapshots.description, coupon_snapshots.terms, coupon_snapshots.coupon_code, coupon_snapshots.destination_url, coupon_snapshots.starts_at, coupon_snapshots.ends_at)
      is not distinct from row(excluded.network, excluded.merchant_id, excluded.merchant_name, excluded.title, excluded.description, excluded.terms, excluded.coupon_code, excluded.destination_url, excluded.starts_at, excluded.ends_at) then coupon_snapshots.checked else false end,
    checked_at = case when row(coupon_snapshots.network, coupon_snapshots.merchant_id, coupon_snapshots.merchant_name, coupon_snapshots.title, coupon_snapshots.description, coupon_snapshots.terms, coupon_snapshots.coupon_code, coupon_snapshots.destination_url, coupon_snapshots.starts_at, coupon_snapshots.ends_at)
      is not distinct from row(excluded.network, excluded.merchant_id, excluded.merchant_name, excluded.title, excluded.description, excluded.terms, excluded.coupon_code, excluded.destination_url, excluded.starts_at, excluded.ends_at) then coupon_snapshots.checked_at else null end,
    source_offer_id = excluded.source_offer_id,
    merchant_id = excluded.merchant_id,
    merchant_name = excluded.merchant_name,
    title = excluded.title,
    description = excluded.description,
    terms = excluded.terms,
    coupon_code = excluded.coupon_code,
    destination_url = excluded.destination_url,
    source_url = excluded.source_url,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    raw_json = excluded.raw_json,
    status = excluded.status,
    last_seen_at = excluded.last_seen_at,
    updated_at = excluded.updated_at;

  insert into public.sync_runs (
    id, workspace_id, connector_id, network, status, fetched_count,
    normalized_count, partial_failures_json, excluded_json, requested_from, requested_to,
    created_at, completed_at
  ) values (
    sync_run ->> 'id', sync_run ->> 'workspace_id', sync_run ->> 'connector_id',
    sync_run ->> 'network', sync_run ->> 'status',
    (sync_run ->> 'fetched_count')::integer,
    (sync_run ->> 'normalized_count')::integer,
    coalesce(sync_run -> 'partial_failures_json', '[]'::jsonb),
    coalesce(sync_run -> 'excluded_json', '[]'::jsonb),
    nullif(sync_run ->> 'requested_from', '')::date,
    nullif(sync_run ->> 'requested_to', '')::date,
    (sync_run ->> 'created_at')::timestamptz,
    (sync_run ->> 'completed_at')::timestamptz
  );

  update public.connectors existing set
    status = connector_update ->> 'status',
    sync_status = connector_update ->> 'sync_status',
    last_sync_at = nullif(connector_update ->> 'last_sync_at', '')::timestamptz,
    last_successful_sync_at = nullif(connector_update ->> 'last_successful_sync_at', '')::timestamptz,
    last_error_json = nullif(connector_update -> 'last_error_json', 'null'::jsonb)
  where existing.id = sync_run ->> 'connector_id';
end;
$$;

commit;
