# Affitalink

Affitalink is a small dashboard for fetching coupons from affiliate networks.

## Product flow

1. Connect CJ Affiliate, Rakuten Advertising, impact.com, or eBay Deals.
2. Choose advertisers.
3. Choose a date range.
4. Fetch coupons.
5. Search, inspect, or export the saved results.

An account is optional. Guest credentials live only in the current tab. Guest advertiser choices live in `localStorage`. Guest coupons live in IndexedDB. Signed-in users save encrypted credentials, selections, and coupons to their Supabase workspace.

## Run locally

Use the Node version in `.nvmrc` and the pnpm version in `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm dev
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
migrations through the CLI so Supabase records them:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The project ref is in the Supabase dashboard URL. Do not paste a database password,
secret key, or `AFFITALINK_SECRET` into chat or commit it to Git.
Do not paste tracked migrations into the SQL Editor; `db push` must record them in
Supabase's migration history.

### eBay Deals

eBay needs a Developer Program account, production application keys, an eBay Partner
Network account, and approved Buy API production access. In Affitalink, enter the
Client ID, Client Secret, marketplace ID, and delivery country. eBay is one marketplace,
so the Advertisers screen shows one selectable source named `eBay Deals`.

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
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit --prod
pnpm audit
```

## Deployment gate

Next `16.3.6` is the validated local upgrade baseline, but it must not be
deployed before the announced `16.3.7` security release is installed and the
checks above pass again. The hosting platform must satisfy the engines in
`package.json`; use the `.nvmrc` version unless another Node 24 release is
separately verified. Keep a separately verified patched release for rollback;
do not roll back to the vulnerable Next `14.2.35` baseline.

ESLint 9 is a temporary compatibility bridge. Move to ESLint 10 when the Next
lint stack supports it and the checks above remain clean.
