# Affitalink

Affitalink is a small dashboard for collecting sale and discount links from affiliate networks.

## Product flow

1. Connect CJ Affiliate, Rakuten Advertising, impact.com, or eBay Deals.
2. Choose advertisers below the connection form on that network's page.
3. Open Links and choose a date range.
4. Select Get links.
5. Mark a link Checked after reviewing it; its check and time save immediately.
6. Search, browse 50 links per page, or export all matching results.

Get links reports saved counts and incomplete or failed collection. An unchanged
link keeps its check when collected again; changed benefit details clear it.

An account is optional. Guest credentials live only in the current tab. Guest advertiser choices live in `localStorage`. Guest coupons live in IndexedDB. Signed-in users save encrypted credentials, selections, and coupons to their Supabase workspace.

## Run locally

Use the Node version in `.nvmrc` and the pnpm version in `package.json`.

First-time setup with nvm:

```bash
nvm install
nvm use
npm install --global pnpm@11.27.1
pnpm install --frozen-lockfile
```

In each new terminal, run these commands from this project directory:

```bash
nvm use
pnpm dev
```

Open `http://localhost:7777`.

If pnpm reports `packages field missing or empty`, check `node --version` and
`pnpm --version`. This project requires Node `24.21.0` and pnpm `11.27.1`;
an older pnpm can fail while reading `pnpm-workspace.yaml` before the dev server starts.

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

Account collection requires `20261016000000_preserve_offer_records.sql`, and saving
checks also requires `20261016010000_save_offer_checks.sql`, in addition to earlier
migrations. Checks use the database clock and reject stale benefit details. Guest
storage upgrades the existing IndexedDB to version 2 automatically, retaining links
and adding collection outcomes in the same database. Guest checks use local time.

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

Storage integration checks:

- `tests/storage-postgres.sql` applies the migrations and tests actual SQL in a
  **new, disposable** database named `affitalink_storage_test`. Run it with
  `psql -d affitalink_storage_test -f tests/storage-postgres.sql` on a test PostgreSQL
  instance. It creates test roles and an `auth.users` stub; never use the app database.
- For real IndexedDB checks, temporarily create `pages/__storage-check.js` containing
  `export { default } from "../tests/support/StorageCheckPage";`. With the dev server
  running, open `http://affitalink-storage.localhost:7777/__storage-check`, run the
  checks, reload, then select **Check after reload** and **Clean test data**. The test
  refuses to overwrite an existing database. Remove the temporary page afterwards.
- For collection and checkbox UI scenarios, use a temporary `pages/__links-check.js`
  exporting `../tests/support/LinksWorkflowCheckPage`. At the same isolated host,
  open `/__links-check`, select **Prepare test**, and exercise the actual Links page
  with the response modes. **Inspect saved data** reads the real IndexedDB. Clean
  the test data and remove the temporary entry when finished; no external network
  credentials or requests are used.

## Vercel deployment

Use the Next.js framework preset, Node.js `24.x`, and the default install/build
commands in Vercel. `package.json` pins pnpm `11.27.1`; `pmOnFail: download` in
`pnpm-workspace.yaml` lets an older Vercel-provided pnpm download and run that
exact version. Keep the version pin and commit `pnpm-lock.yaml` with dependency
changes. Setting `pmOnFail` to `error` prevents this handoff and fails installation
when Vercel's bundled pnpm differs.

The hosting runtime must satisfy the engines in `package.json`. Local checks use
Node `24.21.0` from `.nvmrc`. A Vercel project still configured for Node `16.x`
should be updated to `24.x`; `package.json` takes precedence over that setting.

Next and its ESLint config are pinned to `16.3.8`. The lockfile also includes
patched `sharp` and `source-map-js`. Tailwind 3's `postcss-selector-parser` is
overridden to `7.1.6`; the generated project CSS was verified byte-for-byte
unchanged. Run the checks above before deployment and keep a separately verified
patched release for rollback.

As of 2026-10-16, `pnpm audit --prod` reports no known vulnerabilities. The full
audit still reports [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
in the `braces` dependency of the development tools (Tailwind/ESLint). No patched
version is available in the advisory. This dependency processes build-time file
patterns; it is not used by the coupon APIs. Recheck the advisory when updating
the build tools.

ESLint 9 is a temporary compatibility bridge. Move to ESLint 10 when the Next
lint stack supports it and the checks above remain clean.
