# Production Compatibility and Security Migration Plan

**Status:** Preparation only; not executed

**Target production Supabase project:** `lens-mvp` (`agjziysrvdnvkrilsmrd`)

**Source branch reviewed:** `security-remediation/phase2`

**Go Deep:** Excluded. Go Deep is suspended for the next release and its table is not required by this package.

## Verified production gaps

The read-only comparison found that production is not schema-compatible with the current hardened application:

- `public.users.clerk_user_id` is missing.
- `public.saved_items.owner_id` is missing.
- `public.blueprints` is missing.
- `public.lens_reports` is missing.
- `public.report_cache` is missing.
- Production retains historical broad policies and role grants on several private tables.
- Staging has owner indexes and Clerk identity indexes that production lacks.

The current server authentication implementation in `lib/server-auth.ts` requires `users.clerk_user_id` and upserts by that column. The current production schema therefore cannot safely receive the current private-route deployment without compatibility work.

## Package contents

The unexecuted SQL migration is:

- [`sql/production_compatibility_security_v2.sql`](../sql/production_compatibility_security_v2.sql)

It is intentionally not a replay of the staging baseline. It creates only the missing next-release tables, validates their shape, adds compatibility columns, preserves existing rows, removes all policies on the selected private tables dynamically, and installs server-role-only policies for the server-mediated application architecture.

## Required approvals before execution

Each item below requires explicit approval:

1. A production metadata backup/export limited to schema metadata and approved operational records.
2. Adding `users.clerk_user_id` and the partial unique index.
3. Adding nullable `owner_id` columns and foreign keys to legacy session tables.
4. Creating `blueprints`, `lens_reports`, and `report_cache` in production.
5. Dropping and replacing every existing policy on `users`, `saved_cards`, `watchlists`, `watchlist_companies`, `saved_items`, `blueprints`, `lens_reports`, and `report_cache`.
6. Revoking `anon`, `authenticated`, and `PUBLIC` table privileges on those private tables, with no authenticated-role table policies in the server-mediated-only design.
7. Granting service-role DML on those tables.
8. Running the post-migration application and ownership test suite against production, preferably during a controlled maintenance window.

No ownership is inferred from email, session ID, or existing row content. Legacy rows remain preserved with `owner_id IS NULL` until a separately approved account-linking workflow exists.

## Preflight sequence

Run each query read-only and save the results with the migration approval record. The queries below use bounded output and do not export application records.

### 1. Confirm target and table presence

```sql
SELECT current_database() AS database_name,
       current_setting('server_version') AS server_version
LIMIT 1;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'companies', 'saved_cards', 'saved_items', 'watchlists',
    'watchlist_companies', 'blueprints', 'lens_reports', 'report_cache'
  )
ORDER BY table_name
LIMIT 50;
```

Abort unless this is the approved production project and the expected base objects are present.

### 2. Capture columns and types

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'companies', 'saved_cards', 'saved_items', 'watchlists',
    'watchlist_companies', 'blueprints', 'lens_reports', 'report_cache'
  )
ORDER BY table_name, ordinal_position
LIMIT 300;
```

Abort if an existing column conflicts with the migration’s expected type.

### 3. Capture constraints and indexes

```sql
SELECT tc.table_name,
       tc.constraint_name,
       tc.constraint_type,
       pg_get_constraintdef(pc.oid) AS definition
FROM information_schema.table_constraints tc
JOIN pg_constraint pc
  ON pc.conname = tc.constraint_name
JOIN pg_class cls
  ON cls.oid = pc.conrelid
JOIN pg_namespace ns
  ON ns.oid = cls.relnamespace
 AND ns.nspname = 'public'
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'users', 'companies', 'saved_cards', 'saved_items', 'watchlists',
    'watchlist_companies', 'blueprints', 'lens_reports', 'report_cache'
  )
ORDER BY tc.table_name, tc.constraint_name
LIMIT 300;

SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'companies', 'saved_cards', 'saved_items', 'watchlists',
    'watchlist_companies', 'blueprints', 'lens_reports', 'report_cache'
  )
ORDER BY tablename, indexname
LIMIT 300;
```

### 4. Capture all existing policies and RLS flags

```sql
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced,
       p.policyname,
       p.roles,
       p.cmd,
       p.qual,
       p.with_check
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p
  ON p.schemaname = 'public'
 AND p.tablename = c.relname
WHERE n.nspname = 'public'
  AND c.relname IN (
    'users', 'saved_cards', 'saved_items', 'watchlists',
    'watchlist_companies', 'blueprints', 'lens_reports', 'report_cache'
  )
ORDER BY c.relname, p.policyname
LIMIT 300;
```

### 5. Capture role grants

```sql
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'saved_cards', 'saved_items', 'watchlists',
    'watchlist_companies', 'blueprints', 'lens_reports', 'report_cache'
  )
  AND grantee IN ('anon', 'authenticated', 'service_role', 'public')
ORDER BY table_name, grantee, privilege_type
LIMIT 300;
```

### 6. Record preservation counts, not row contents

Before execution, record bounded metadata counts for audit comparison. Do not export private records.

```sql
SELECT 'users' AS table_name, count(*)::bigint AS row_count FROM public.users
UNION ALL SELECT 'saved_cards', count(*)::bigint FROM public.saved_cards
UNION ALL SELECT 'saved_items', count(*)::bigint FROM public.saved_items
UNION ALL SELECT 'watchlists', count(*)::bigint FROM public.watchlists
UNION ALL SELECT 'watchlist_companies', count(*)::bigint FROM public.watchlist_companies
LIMIT 20;
```

## Dependency order

1. Confirm the production project ID and save preflight results.
2. Confirm a rollback/restore point exists.
3. Apply `production_compatibility_security_v2.sql` in one transaction.
4. If any guard, type check, constraint, or policy operation fails, roll back the transaction and stop.
5. Run post-migration metadata and privilege verification.
6. Run application smoke tests and the server-mediated authorization suite.
7. Only after all gates pass, consider production promotion.

The migration deliberately creates missing tables before adding owner columns, foreign keys, and indexes. It does not assign existing legacy rows to users.

The staging correction to `app/watchlists/[id]/page.tsx` is a prerequisite for
revoking anonymous/authenticated table privileges: the page now verifies the
Clerk-derived application user and reads the owned watchlist through the
server-side service client. The previous anon-client page would have failed
after privilege revocation.

The SQL package also validates required existing-table columns and detects
owner foreign keys semantically by source relation/column and referenced
relation/column rather than relying only on historical constraint names.

## Post-migration verification

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users','saved_items','blueprints','lens_reports','report_cache')
  AND column_name IN ('clerk_user_id','owner_id')
ORDER BY table_name, column_name
LIMIT 50;

SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       p.policyname,
       p.roles,
       p.cmd
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p
  ON p.schemaname = 'public'
 AND p.tablename = c.relname
WHERE n.nspname = 'public'
  AND c.relname IN (
    'users','saved_cards','saved_items','watchlists',
    'watchlist_companies','blueprints','lens_reports','report_cache'
  )
ORDER BY c.relname, p.policyname
LIMIT 300;

SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'users','saved_cards','saved_items','watchlists',
    'watchlist_companies','blueprints','lens_reports','report_cache'
  )
  AND grantee IN ('anon','authenticated','service_role','public')
ORDER BY table_name, grantee, privilege_type
LIMIT 300;
```

Expected results:

- RLS enabled on all private tables.
- No anonymous or public read/write policy on private tables.
- Private operations are available only through server-mediated routes and service-role policies; direct browser-to-Supabase JWT access remains out of scope.
- Service-role has only the explicitly required DML on the migrated tables.
- Existing rows remain present; no legacy owner values are invented.
- Published Lens analysis/OID behavior remains governed by its separate public policy.

## Rollback considerations

### Before commit

The migration is transactional. Any failure before `COMMIT` should roll back all schema, policy, and grant changes.

### After commit

A rollback is not a blind reverse script. It requires owner approval and a fresh preflight because:

- New application rows may have been created in the new tables.
- Policy state may have changed after deployment.
- Removing owner columns would destroy authorization metadata.
- Dropping new tables could destroy newly generated user data.

The safe rollback is therefore:

1. Stop the affected deployment.
2. Restore the previous application version if needed.
3. Preserve the new tables and records unless a verified backup restoration is approved.
4. Restore prior policy/grant state from the captured metadata and approved SQL.
5. Reconcile any records created after migration before any destructive operation.

## Admin authorization recommendation

The current route is `GET /api/admin/expire-cache?ticker=...&secret=...` in `app/api/admin/expire-cache/route.ts`. The current staging setup should define `ADMIN_SECRET` only in the Vercel staging project’s Production environment.

Before production release, replace query-string authentication with a header, for example:

```text
Authorization: Bearer <admin secret>
```

or a dedicated header such as `x-lens-admin-secret`.

The route should reject query-string secrets after the transition. This prevents the secret from entering browser history, URL telemetry, access logs, and referrer data. This is a proposed application change, not implemented in this preparation package.

## Blueprint provider blocker

The staging Blueprint request reached the configured OpenAI-compatible endpoint and returned HTTP 429. The application only returns the status code to the browser; the provider response body is logged server-side. The available evidence does not distinguish quota exhaustion, billing restriction, rate limiting, or model access.

An authorized provider administrator must inspect usage, billing, rate-limit events, and model access. No billing or credential change is authorized by this package.

## Release decision

**Current status: NO-GO.**

The following must be resolved before production consideration:

1. Production schema compatibility migration must be reviewed and approved.
2. Production policy/grant hardening must be reviewed and approved.
3. Saved-card behavior must be tested against a valid company fixture or the route/UI identifier contract must be corrected.
4. `ADMIN_SECRET` must be configured in staging and tested; query-string authentication should be replaced before production.
5. Blueprint provider 429 cause must be resolved or Blueprint must remain unavailable.
6. The required zero-skip server-mediated User A/User B suite must complete in a secure runtime.
