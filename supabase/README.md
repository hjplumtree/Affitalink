# Supabase setup

## Fresh project

1. Create an empty Supabase project.
2. From this repository run `npx supabase login`.
3. Run `npx supabase link --project-ref YOUR_PROJECT_REF`.
4. Run `npx supabase db push`.
5. Copy the project URL, publishable key, and secret key into `.env.local`.
6. Restart Affitalink.

The tracked [initial migration](./migrations/20260921000000_initial_schema.sql)
creates five tables, server-only data access, indexes, and the signup
trigger. Every existing or new user receives one private workspace.

Do not paste this migration into SQL Editor. That bypasses Supabase's migration
history and can make a later `db push` try to apply the same schema again.

## Access model

Every API request validates the signed-in user and resolves their personal workspace.
All connector, advertiser, fetch, and coupon data stays behind the server API. Browser
clients never receive direct database access to operational tables.
