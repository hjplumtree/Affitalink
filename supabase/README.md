## Supabase Setup

This repo now assumes Supabase is the only runtime backend.

### What `schema.sql` does

- creates core app tables
- adds `profiles` and `workspace_memberships`
- enables RLS on every exposed table
- adds membership-based policies
- adds a signup trigger that creates a `profiles` row
- adds `create_workspace_for_current_user(text)` for first-workspace bootstrap

### Important reality check

The current Next.js server code still uses the Supabase server secret key for backend writes.
That means RLS is not yet the primary enforcement layer for server-side operations.
Service-role style access bypasses RLS by design.

So today the security model is:

- browser/client access should eventually rely on authenticated user tokens + RLS
- server-side API routes currently rely on trusted backend code + secret key

That is acceptable as an intermediate state, but it is not the final auth model.

### Apply the schema

Run `supabase/schema.sql` in the Supabase SQL Editor.

### Bootstrap a first workspace

After signing in with a real Supabase user session, run:

```sql
select public.create_workspace_for_current_user('Default workspace');
```

That creates:

- one `workspaces` row
- one `workspace_memberships` row with `owner`

### Next auth step

The next app-side step is to stop assuming `workspace_default` and instead resolve:

- current authenticated user
- current workspace membership
- current workspace id per request

Until that is wired, the schema is ready, but the UI is not yet using it end-to-end.
