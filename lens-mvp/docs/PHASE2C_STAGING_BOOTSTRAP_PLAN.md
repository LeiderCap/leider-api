# Phase 2C — Staging Bootstrap and Security Verification Plan

**Status: preparation only. No SQL in this plan has been executed.**

## Target

- Supabase project: `lens-staging`
- Project ID: `mntxmnjdhafhhhoqkgqe`
- Scope: staging only
- Production databases, credentials, deployments, and records are out of scope.

The read-only preflight performed before this plan found zero public tables, zero migrations, and zero public RLS policies in the target project.

## Repository migration inventory

| File | Role | Decision |
|---|---|---|
| `sql/schema.sql` | Historical aggregate schema plus inline v1–v3 migrations and permissive policy definitions | Do not replay as-is; used as a reference only |
| `sql/lens_analyses_migration.sql` | `lens_analyses` table and indexes, with initial public/service policies | Table definition superseded by canonical baseline; policies superseded by hardening |
| `sql/ground_truth_table.sql` | Ground Truth table and permissive public policies | Table definition superseded by baseline; policies excluded |
| `sql/retrieval_pipeline_tables.sql` | Retrieval audit, retrieved documents, identity cards, and permissive policies | Table definition superseded by baseline; policies excluded |
| `sql/rls_fix_v1.sql` | Historical RLS policy set using `auth.uid()` and broad public/cache permissions | Do not execute; conflicts with Clerk subject mapping and v1 hardening |
| `sql/financial_grounding_migration.sql` | Additive financial-grounding column/index | Folded into canonical baseline |
| `sql/v5_foundation_migration.sql` | Additive v5 columns | Folded into canonical baseline |
| `sql/v5_dryrun_migration.sql` | Additive `is_test_record` column/index | Folded into canonical baseline |
| `sql/security_hardening_v1.sql` | Dynamic policy cleanup, Clerk mapping, owner columns, final RLS | Execute second, after baseline approval |
| `sql/staging_baseline_v1.sql` | New clean staging baseline; tables/indexes only, no policies | Proposed first execution |

## Proposed execution sequence for approval

This is the exact sequence proposed for the staging project. It is not yet approved for execution.

### 0. Preflight, read-only

Run against project `mntxmnjdhafhhhoqkgqe`:

1. Confirm project status is `ACTIVE_HEALTHY`.
2. Query `pg_tables` for public tables.
3. Query `pg_policies` for public policies.
4. Query `information_schema.columns` for public columns.
5. Query Supabase migration metadata.
6. Confirm the database remains empty or record any owner-approved objects added since the previous preflight.

Abort if the target project ID differs or if unexpected non-empty application objects are present.

### 1. Canonical schema bootstrap

Execute exactly:

```text
sql/staging_baseline_v1.sql
```

This creates the required runtime tables, compatibility columns, foreign keys, indexes, v5 fields, financial grounding fields, and dry-run test-record fields. It intentionally creates no RLS policies.

Expected core tables include:

```text
users
companies
lens_scores
searches
saved_cards
watchlists
watchlist_companies
enterprise_inquiries
transformation_events
waitlist
go_deep_analyses
saved_items
blueprints
lens_reports
cached_stock_prices
opportunity_zone_cache
pe_stack_inquiries
investor_stack_inquiries
lens_retrieval_audits
lens_retrieved_documents
lens_identity_cards
lens_ground_truths
lens_analyses
report_cache
```

### 2. Baseline verification, read-only

Confirm all required tables and columns from the hardening preflight exist. Confirm there are still no application policies, or that any policy created by the provider is explicitly reviewed before continuing.

### 3. Security hardening

After specific approval of the sequence, execute exactly:

```text
sql/security_hardening_v1.sql
```

The hardening migration:

- Fails before mutation if required tables/columns are absent.
- Adds the Clerk subject mapping.
- Dynamically removes conflicting policies on protected tables.
- Enables RLS on protected relations.
- Makes published Lens analyses the only anonymous-readable research object.
- Restricts raw ground truth/retrieval data to `service_role`.
- Restricts saved, watchlist, memory, blueprint, and report rows by resolved application UUID.
- Keeps inquiry and waitlist inserts anonymous and insert-only.
- Restricts stock-price and opportunity-zone caches to service-role management.

### 4. Post-hardening policy verification, read-only

Query and save only policy metadata, not application records:

- `pg_policies` by table, role, command, `qual`, and `with_check`.
- `pg_tables.rowsecurity` for every protected table.
- Required owner-column and Clerk mapping columns.

Expected public behavior:

- Anonymous: SELECT only `lens_analyses.is_public = true`.
- Anonymous: INSERT only to approved inquiry/waitlist tables.
- Anonymous: no access to raw evidence, caches, memory, blueprints, reports, or unpublished analyses.
- Authenticated User A/B: access only to rows mapped through `public.users.clerk_user_id` and `public.users.id`.
- Service role: server-managed writes and test cleanup.

## Rollback approach

Because the staging project is empty, the safest rollback before functional testing is a staging-only reset by the project owner after capturing policy/schema metadata. Do not issue destructive reset SQL automatically.

For a non-destructive rollback of the hardening layer:

1. Stop the application from writing to staging.
2. Capture current policy and schema metadata.
3. Remove only the newly introduced hardening policies/functions/indexes after owner review.
4. Do not drop baseline tables or delete records unless separately approved.
5. Restore the previous application commit or point the staging deployment back to the prior branch.

No production rollback is included in this plan.

## Clerk staging checklist

The owner must complete these actions in the Clerk staging dashboard:

1. Open the existing staging Clerk application; do not use the production instance.
2. Confirm the staging application publishable key and secret-key configuration are available to the staging deployment secret store.
3. Create or confirm two test users, named conceptually **User A** and **User B**, using owner-controlled test email addresses.
4. Enable or create a JWT template named `supabase` for staging.
5. Configure the template issuer and claims according to the staging Supabase JWT verification configuration.
6. Confirm the JWT `sub` claim remains the Clerk user ID (`user_...`).
7. Provide the staging app with the two user JWTs through the isolated secret store or shell only; do not paste them into chat.
8. Record each Clerk user ID and the corresponding `public.users.id` UUID after provisioning.
9. Configure Supabase staging to trust the Clerk issuer/JWKS and verify the JWT audience/issuer settings.

The owner does **not** need to send secret keys, JWTs, or connection strings in chat. The required action is dashboard configuration plus secure injection into the isolated staging environment.

## Release gates after execution

Do not promote until all of the following execute successfully:

- Static security tests with zero skips.
- User A/User B/anonymous/service-role RBAC suite.
- Public published/unpublished Lens report checks.
- Permanent OID lookup checks.
- Search flow regression.
- v4 generation regression.
- v5 generation regression.
- Dry-run test-record visibility/latest-record isolation.
- Build and TypeScript checks.
- No production deployment or production data changes.
