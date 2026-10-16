begin;

alter table public.connectors
  drop constraint if exists connectors_network_check;

alter table public.connectors
  add constraint connectors_network_check
  check (network in ('cj', 'rakuten', 'impact', 'ebay', 'testnet'));

commit;
