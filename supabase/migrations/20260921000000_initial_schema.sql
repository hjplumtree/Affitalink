-- Affitalink baseline schema for a new Supabase project.
-- Apply with `npx supabase db push` so Supabase records the migration.

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.workspaces (
  id text primary key,
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (id = owner_user_id::text)
);

create table public.connectors (
  id text primary key,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  network text not null check (network in ('cj', 'rakuten', 'impact', 'testnet')),
  auth_encrypted text,
  status text not null default 'not_connected'
    check (status in ('not_connected', 'connected')),
  sync_status text not null default 'idle'
    check (sync_status in ('idle', 'success', 'partial_failure', 'failed')),
  last_tested_at timestamptz,
  last_sync_at timestamptz,
  last_successful_sync_at timestamptz,
  last_error_json jsonb,
  unique (workspace_id, network),
  unique (id, workspace_id, network)
);

create table public.advertiser_selections (
  id bigint generated always as identity primary key,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  connector_id text not null,
  network text not null,
  advertiser_id text not null,
  advertiser_name text not null,
  selected boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connector_id, advertiser_id),
  foreign key (connector_id, workspace_id, network)
    references public.connectors(id, workspace_id, network) on delete cascade
);

create table public.sync_runs (
  id text primary key,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  connector_id text not null,
  network text not null,
  status text not null check (status in ('success', 'partial_failure', 'failed')),
  fetched_count integer not null default 0 check (fetched_count >= 0),
  normalized_count integer not null default 0 check (normalized_count >= 0),
  partial_failures_json jsonb not null default '[]'::jsonb
    check (jsonb_typeof(partial_failures_json) = 'array'),
  requested_from date,
  requested_to date,
  created_at timestamptz not null default now(),
  completed_at timestamptz not null default now(),
  check (requested_from is null or requested_to is null or requested_from <= requested_to),
  foreign key (connector_id, workspace_id, network)
    references public.connectors(id, workspace_id, network) on delete cascade
);

create table public.coupon_snapshots (
  id text primary key,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  connector_id text not null,
  network text not null,
  logical_key text not null,
  merchant_id text not null,
  merchant_name text not null,
  title text not null,
  description text not null default '',
  terms text not null default '',
  coupon_code text not null default '',
  destination_url text not null default '',
  source_url text not null default '',
  starts_at timestamptz,
  ends_at timestamptz,
  raw_json jsonb not null default '{}'::jsonb
    check (jsonb_typeof(raw_json) = 'object'),
  status text not null default 'active' check (status in ('active', 'expired')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connector_id, logical_key),
  foreign key (connector_id, workspace_id, network)
    references public.connectors(id, workspace_id, network) on delete cascade
);

create index advertiser_selections_connector_name_idx
  on public.advertiser_selections (connector_id, advertiser_name);
create index sync_runs_workspace_created_idx
  on public.sync_runs (workspace_id, created_at desc);
create index coupon_snapshots_workspace_updated_idx
  on public.coupon_snapshots (workspace_id, updated_at desc);
create index coupon_snapshots_connector_idx
  on public.coupon_snapshots (connector_id);
create index coupon_snapshots_active_dates_idx
  on public.coupon_snapshots (workspace_id, starts_at, ends_at);

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspaces (id, owner_user_id, name)
  values (new.id::text, new.id, 'My workspace')
  on conflict (owner_user_id) do nothing;
  return new;
end;
$$;

create function public.save_connector(connector jsonb, advertisers jsonb)
returns setof public.connectors
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(connector) <> 'object' then
    raise exception 'connector must be a JSON object';
  end if;
  if jsonb_typeof(advertisers) <> 'array' then
    raise exception 'advertisers must be a JSON array';
  end if;

  if exists (
    select 1 from public.connectors existing
    where existing.id = connector ->> 'id'
      and (
        existing.workspace_id <> connector ->> 'workspace_id'
        or existing.network <> connector ->> 'network'
      )
  ) then
    raise exception 'connector identity cannot change';
  end if;

  insert into public.connectors (
    id, workspace_id, network, auth_encrypted, status, sync_status,
    last_tested_at, last_sync_at, last_successful_sync_at, last_error_json
  ) values (
    connector ->> 'id', connector ->> 'workspace_id', connector ->> 'network',
    connector ->> 'auth_encrypted', connector ->> 'status', connector ->> 'sync_status',
    nullif(connector ->> 'last_tested_at', '')::timestamptz,
    nullif(connector ->> 'last_sync_at', '')::timestamptz,
    nullif(connector ->> 'last_successful_sync_at', '')::timestamptz,
    nullif(connector -> 'last_error_json', 'null'::jsonb)
  )
  on conflict (id) do update set
    auth_encrypted = excluded.auth_encrypted,
    status = excluded.status,
    sync_status = excluded.sync_status,
    last_tested_at = excluded.last_tested_at,
    last_sync_at = excluded.last_sync_at,
    last_successful_sync_at = excluded.last_successful_sync_at,
    last_error_json = excluded.last_error_json;

  delete from public.advertiser_selections selection
  where selection.connector_id = connector ->> 'id';

  insert into public.advertiser_selections (
    workspace_id, connector_id, network, advertiser_id, advertiser_name, selected
  )
  select connector ->> 'workspace_id', connector ->> 'id', connector ->> 'network',
    advertiser.id, advertiser.name, coalesce(advertiser.selected, false)
  from jsonb_to_recordset(advertisers) as advertiser(
    id text, name text, selected boolean
  );

  return query select saved.* from public.connectors saved
  where saved.id = connector ->> 'id';
end;
$$;

create function public.save_sync_result(
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

  insert into public.coupon_snapshots (
    id, workspace_id, connector_id, network, logical_key, merchant_id,
    merchant_name, title, description, terms, coupon_code, destination_url,
    source_url, starts_at, ends_at, raw_json, status, last_seen_at, updated_at
  )
  select coupon.id, coupon.workspace_id, coupon.connector_id, coupon.network,
    coupon.logical_key, coupon.merchant_id, coupon.merchant_name, coupon.title,
    coalesce(coupon.description, ''), coalesce(coupon.terms, ''),
    coalesce(coupon.coupon_code, ''), coalesce(coupon.destination_url, ''),
    coalesce(coupon.source_url, ''), coupon.starts_at, coupon.ends_at,
    coalesce(coupon.raw_json, '{}'::jsonb), coalesce(coupon.status, 'active'),
    coupon.last_seen_at, coupon.updated_at
  from jsonb_to_recordset(coupons) as coupon(
    id text, workspace_id text, connector_id text, network text, logical_key text,
    merchant_id text, merchant_name text, title text, description text, terms text,
    coupon_code text, destination_url text, source_url text, starts_at timestamptz,
    ends_at timestamptz, raw_json jsonb, status text, last_seen_at timestamptz,
    updated_at timestamptz
  )
  on conflict (connector_id, logical_key) do update set
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
    normalized_count, partial_failures_json, requested_from, requested_to,
    created_at, completed_at
  ) values (
    sync_run ->> 'id', sync_run ->> 'workspace_id', sync_run ->> 'connector_id',
    sync_run ->> 'network', sync_run ->> 'status',
    (sync_run ->> 'fetched_count')::integer,
    (sync_run ->> 'normalized_count')::integer,
    coalesce(sync_run -> 'partial_failures_json', '[]'::jsonb),
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

create function public.replace_advertiser_selections(
  target_workspace_id text,
  target_connector_id text,
  target_network text,
  advertisers jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(advertisers) <> 'array' then
    raise exception 'advertisers must be a JSON array';
  end if;

  if not exists (
    select 1 from public.connectors existing
    where existing.id = target_connector_id
      and existing.workspace_id = target_workspace_id
      and existing.network = target_network
  ) then
    raise exception 'connector does not belong to this workspace';
  end if;

  delete from public.advertiser_selections selection
  where selection.connector_id = target_connector_id;

  insert into public.advertiser_selections (
    workspace_id, connector_id, network, advertiser_id, advertiser_name, selected
  )
  select target_workspace_id, target_connector_id, target_network,
    advertiser.id, advertiser.name, coalesce(advertiser.selected, false)
  from jsonb_to_recordset(advertisers) as advertiser(
    id text, name text, selected boolean
  );
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure private.handle_new_user();

insert into public.workspaces (id, owner_user_id, name)
select users.id::text, users.id, 'My workspace' from auth.users users
on conflict (owner_user_id) do nothing;

revoke execute on function private.handle_new_user() from public, anon, authenticated;
revoke execute on function public.save_connector(jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.save_sync_result(jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.replace_advertiser_selections(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.save_connector(jsonb, jsonb) to service_role;
grant execute on function public.save_sync_result(jsonb, jsonb, jsonb) to service_role;
grant execute on function public.replace_advertiser_selections(text, text, text, jsonb) to service_role;

alter table public.workspaces enable row level security;
alter table public.connectors enable row level security;
alter table public.advertiser_selections enable row level security;
alter table public.sync_runs enable row level security;
alter table public.coupon_snapshots enable row level security;

revoke all on table public.workspaces from anon, authenticated;
revoke all on table public.connectors from anon, authenticated;
revoke all on table public.advertiser_selections from anon, authenticated;
revoke all on table public.sync_runs from anon, authenticated;
revoke all on table public.coupon_snapshots from anon, authenticated;

grant all on table public.workspaces to service_role;
grant all on table public.connectors to service_role;
grant all on table public.advertiser_selections to service_role;
grant all on table public.sync_runs to service_role;
grant all on table public.coupon_snapshots to service_role;
grant usage, select on all sequences in schema public to service_role;

commit;
