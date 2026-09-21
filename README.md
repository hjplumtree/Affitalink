# Affitalink

Affitalink is a small dashboard for fetching coupons from affiliate networks.

## Product flow

1. Connect CJ Affiliate, Rakuten Advertising, or impact.com.
2. Choose advertisers.
3. Choose a date range.
4. Fetch coupons.
5. Search, inspect, or export the saved results.

An account is optional. Guest credentials live only in the current tab. Guest advertiser choices live in `localStorage`. Guest coupons live in IndexedDB. Signed-in users save encrypted credentials, selections, and coupons to their Supabase workspace.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:7777`.

## Environment

Account sync needs:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
AFFITALINK_SECRET=
```

Generate `AFFITALINK_SECRET` once with `openssl rand -hex 32`. Keep it stable and
back it up. Changing it makes saved network credentials unreadable.

Guest mode does not need Supabase. Network requests still need valid network credentials.

## Database

Use the Supabase account that owns the new Affitalink project. Apply the tracked
migration through the CLI so Supabase records it:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The project ref is in the Supabase dashboard URL. Do not paste a database password,
secret key, or `AFFITALINK_SECRET` into chat or commit it to Git.

| Table | Purpose |
| --- | --- |
| `workspaces` | One personal synced workspace per user |
| `connectors` | Network status and encrypted credentials |
| `advertiser_selections` | One checkbox row per advertiser |
| `coupon_snapshots` | Saved normalized coupons |
| `sync_runs` | Fetch history and date range |

Operational tables are server-only. Browser clients authenticate with the publishable key;
the server validates the user and uses the secret key for workspace data.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```
