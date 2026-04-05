create schema if not exists private;

create table if not exists workspaces (
  id text primary key,
  name text not null
);

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspace_memberships (
  id bigint generated always as identity primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index if not exists workspace_memberships_user_idx
  on workspace_memberships (user_id);

create index if not exists workspace_memberships_workspace_idx
  on workspace_memberships (workspace_id);

create table if not exists connectors (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  network text not null,
  auth_encrypted text,
  merchants_json jsonb not null default '[]'::jsonb,
  status text not null default 'not_connected',
  sync_status text not null default 'idle',
  last_tested_at timestamptz,
  last_sync_at timestamptz,
  last_successful_sync_at timestamptz,
  last_error_json jsonb
);

create unique index if not exists connectors_workspace_network_idx
  on connectors (workspace_id, network);

create table if not exists sync_runs (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  connector_id text not null references connectors(id) on delete cascade,
  network text not null,
  status text not null,
  fetched_count integer not null default 0,
  normalized_count integer not null default 0,
  review_items_created integer not null default 0,
  partial_failures_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  completed_at timestamptz not null
);

create table if not exists coupon_snapshots (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  connector_id text not null references connectors(id) on delete cascade,
  network text not null,
  logical_key text not null,
  merchant_id text not null,
  merchant_name text not null,
  title text not null,
  description text not null default '',
  coupon_code text not null default '',
  destination_url text not null default '',
  source_url text not null default '',
  starts_at text not null default '',
  ends_at text not null default '',
  raw_json jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  publish_status text not null default 'draft',
  published_at timestamptz,
  last_seen_at timestamptz,
  updated_at timestamptz not null,
  created_at timestamptz not null
);

alter table coupon_snapshots
  add column if not exists publish_status text not null default 'draft';

alter table coupon_snapshots
  add column if not exists published_at timestamptz;

create unique index if not exists coupon_snapshots_connector_logical_key_idx
  on coupon_snapshots (connector_id, logical_key);

create table if not exists review_items (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  connector_id text not null references connectors(id) on delete cascade,
  logical_key text not null,
  merchant_id text not null,
  merchant_name text not null,
  title text not null,
  change_type text not null,
  reason text not null,
  confidence text not null,
  status text not null,
  before_snapshot_json jsonb,
  after_snapshot_json jsonb,
  sync_run_id text not null references sync_runs(id) on delete cascade,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists early_access_requests (
  id text primary key,
  email text not null,
  name text not null default '',
  site_url text not null default '',
  notes text not null default '',
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create unique index if not exists early_access_requests_email_idx
  on early_access_requests (email);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email)
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure private.handle_new_user();

create or replace function private.is_workspace_member(target_workspace_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_memberships membership
    where membership.workspace_id = target_workspace_id
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_workspace_admin(target_workspace_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_memberships membership
    where membership.workspace_id = target_workspace_id
      and membership.user_id = (select auth.uid())
      and membership.role in ('owner', 'admin')
  );
$$;

create or replace function public.create_workspace_for_current_user(workspace_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id text;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  new_workspace_id := 'workspace_' || substr(md5(gen_random_uuid()::text), 1, 12);

  insert into public.workspaces (id, name)
  values (new_workspace_id, workspace_name);

  insert into public.workspace_memberships (workspace_id, user_id, role)
  values (new_workspace_id, auth.uid(), 'owner');

  return new_workspace_id;
end;
$$;

revoke all on function private.is_workspace_member(text) from public;
revoke all on function private.is_workspace_admin(text) from public;
grant execute on function private.is_workspace_member(text) to authenticated;
grant execute on function private.is_workspace_admin(text) to authenticated;
grant execute on function public.create_workspace_for_current_user(text) to authenticated;

alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table workspace_memberships enable row level security;
alter table connectors enable row level security;
alter table sync_runs enable row level security;
alter table coupon_snapshots enable row level security;
alter table review_items enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
on profiles
for select
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own"
on profiles
for insert
to authenticated
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
on profiles
for update
to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()))
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

drop policy if exists "workspaces_select_member" on workspaces;
create policy "workspaces_select_member"
on workspaces
for select
to authenticated
using ((select auth.uid()) is not null and private.is_workspace_member(id));

drop policy if exists "workspaces_update_admin" on workspaces;
create policy "workspaces_update_admin"
on workspaces
for update
to authenticated
using ((select auth.uid()) is not null and private.is_workspace_admin(id))
with check ((select auth.uid()) is not null and private.is_workspace_admin(id));

drop policy if exists "workspace_memberships_select_member" on workspace_memberships;
create policy "workspace_memberships_select_member"
on workspace_memberships
for select
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_member(workspace_id)
);

drop policy if exists "workspace_memberships_insert_admin" on workspace_memberships;
create policy "workspace_memberships_insert_admin"
on workspace_memberships
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
);

drop policy if exists "workspace_memberships_update_admin" on workspace_memberships;
create policy "workspace_memberships_update_admin"
on workspace_memberships
for update
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
)
with check (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
);

drop policy if exists "workspace_memberships_delete_admin" on workspace_memberships;
create policy "workspace_memberships_delete_admin"
on workspace_memberships
for delete
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
);

drop policy if exists "connectors_select_member" on connectors;
create policy "connectors_select_member"
on connectors
for select
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_member(workspace_id)
);

drop policy if exists "connectors_write_admin" on connectors;
create policy "connectors_write_admin"
on connectors
for all
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
)
with check (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
);

drop policy if exists "sync_runs_select_member" on sync_runs;
create policy "sync_runs_select_member"
on sync_runs
for select
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_member(workspace_id)
);

drop policy if exists "sync_runs_write_admin" on sync_runs;
create policy "sync_runs_write_admin"
on sync_runs
for all
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
)
with check (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
);

drop policy if exists "coupon_snapshots_select_member" on coupon_snapshots;
create policy "coupon_snapshots_select_member"
on coupon_snapshots
for select
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_member(workspace_id)
);

drop policy if exists "coupon_snapshots_write_admin" on coupon_snapshots;
create policy "coupon_snapshots_write_admin"
on coupon_snapshots
for all
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
)
with check (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
);

drop policy if exists "review_items_select_member" on review_items;
create policy "review_items_select_member"
on review_items
for select
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_member(workspace_id)
);

drop policy if exists "review_items_write_admin" on review_items;
create policy "review_items_write_admin"
on review_items
for all
to authenticated
using (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
)
with check (
  (select auth.uid()) is not null
  and private.is_workspace_admin(workspace_id)
);
