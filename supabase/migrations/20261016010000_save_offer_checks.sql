begin;

create function public.set_offer_checked(
  target_workspace_id text,
  target_offer_id text,
  is_checked boolean,
  expected_offer jsonb
)
returns setof public.coupon_snapshots
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved public.coupon_snapshots;
  expected record;
begin
  if is_checked is null or jsonb_typeof(expected_offer) is distinct from 'object' then
    raise exception 'invalid check request';
  end if;

  select * into saved from public.coupon_snapshots
  where id = target_offer_id and workspace_id = target_workspace_id
  for update;
  if not found then return; end if;

  select * into expected from jsonb_to_record(expected_offer) as item(
    network text, merchant_id text, merchant_name text, title text, description text,
    terms text, coupon_code text, destination_url text, starts_at timestamptz, ends_at timestamptz
  );
  -- Match the same benefit fields as save_sync_result and lib/offerRecord.cjs.
  if row(saved.network, saved.merchant_id, saved.merchant_name, saved.title,
      saved.description, saved.terms, saved.coupon_code, saved.destination_url, saved.starts_at, saved.ends_at)
    is distinct from row(expected.network, expected.merchant_id, expected.merchant_name, expected.title,
      expected.description, expected.terms, expected.coupon_code, expected.destination_url, expected.starts_at, expected.ends_at) then
    raise exception 'link changed' using errcode = '40001';
  end if;

  return query update public.coupon_snapshots
  set checked = is_checked, checked_at = case when is_checked then clock_timestamp() else null end
  where id = saved.id and workspace_id = target_workspace_id
  returning *;
end;
$$;

revoke execute on function public.set_offer_checked(text, text, boolean, jsonb) from public, anon, authenticated;
grant execute on function public.set_offer_checked(text, text, boolean, jsonb) to service_role;

commit;
