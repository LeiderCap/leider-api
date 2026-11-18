# Staging Security Runbook

This runbook is non-production. Do not point it at the production Supabase project or Vercel production environment.

## Environment

- Create a separate Supabase staging project.
- Use separate OpenAI/FMP/Stripe/Clerk credentials or tightly limited test credentials.
- Set `NEXT_PUBLIC_APP_URL` to the staging URL.
- Keep `LENS_V5_DRYRUN_SECRET` distinct from production.
- The supported private path is Clerk session -> server-side `getAppAuthContext()` -> Supabase service-role query scoped to the resolved `public.users.id` UUID. Direct Clerk-to-Supabase JWT authentication is optional defense-in-depth only and is not a release prerequisite.
- Apply existing migrations, run the hardening migration preflight, then review `sql/security_hardening_v1.sql` with the owner before execution.

## Checks

### Build and static checks

```bash
npm ci
npm run lint
pnpm exec tsc --noEmit
npm run build
npm run test:security
```

Acceptance: type checking, build, and required server-mediated security tests pass; lint has zero errors; no `.env.local` is tracked; no secret values appear in logs or build output.

### Client boundary checks

- Without `SUPABASE_SERVICE_ROLE_KEY`, privileged server routes fail closed.
- With only public anon variables, intentionally public inquiry routes can use RLS-limited inserts.
- No source route contains a `SUPABASE_SERVICE_ROLE_KEY ?? NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback.

### RLS checks

Using the staging application with two authenticated Clerk sessions and anonymous requests:

- Anonymous can select only published Lens analyses.
- Anonymous cannot read Ground Truth, retrieval documents, raw report cache, saved items, blueprints, or private reports.
- User A cannot read or mutate User B’s saved cards, watchlists, watchlist companies, memory, blueprints, or reports.
- Service role can perform server writes only from server-side routes.
- Public inquiry/waitlist insert-only behavior remains available.

### Integration test prerequisites

Set these variables only in the isolated staging shell or CI secret store; do not commit them:

```text
STAGING_APP_URL
STAGING_USER_A_COOKIE
STAGING_USER_B_COOKIE
STAGING_SUPABASE_URL
STAGING_SERVICE_ROLE_KEY
```

The optional direct Supabase JWT/RLS defense-in-depth test additionally accepts:

```text
STAGING_SUPABASE_ANON_KEY
STAGING_USER_A_JWT
STAGING_USER_B_JWT
STAGING_USER_A_APP_UUID
STAGING_USER_B_APP_UUID
```

Then run:

```bash
npm run test:security
```

`tests/security/staging-rbac.test.ts` always runs the server-mediated authorization contract. With the application-session variables present, it creates temporary memory and watchlist records through the real application routes, verifies User A/User B isolation and no-op deletion semantics, and cleans up synthetic rows. The direct Supabase JWT/RLS test remains separate and optional because direct browser-to-Supabase JWT authentication is not part of the supported application workflow.

Without the server-mediated staging variables, the required application integration test fails with an explicit missing-configuration error rather than being skipped. Inject secure staging session cookies and rerun before release. The optional direct-RLS test may remain skipped by design.

The preflight must also inventory `pg_policies` dynamically. The migration does not rely solely on repository policy names: it enumerates and drops every policy on protected tables, and it raises before mutation when required tables or columns are absent.

### Public Lens regression

- Search page loads.
- Public `/lens/four` report loads.
- Permanent OID report loads.
- A dry-run test record is not public, not latest, and does not displace the live record.

### Rollback gate

Do not promote if any private route becomes publicly readable, if any public report disappears, if the service-role key is not required for privileged writes, or if test records appear in public latest selection.
