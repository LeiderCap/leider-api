# Staging Security Runbook

This runbook is non-production. Do not point it at the production Supabase project or Vercel production environment.

## Environment

- Create a separate Supabase staging project.
- Use separate OpenAI/FMP/Stripe/Clerk credentials or tightly limited test credentials.
- Set `NEXT_PUBLIC_APP_URL` to the staging URL.
- Keep `LENS_V5_DRYRUN_SECRET` distinct from production.
- Configure Supabase JWT verification for the Clerk issuer/JWKS in staging only. The JWT `sub` must match `public.users.clerk_user_id`; ownership fields continue to use the resolved `public.users.id` UUID.
- Apply existing migrations, run the hardening migration preflight, then review `sql/security_hardening_v1.sql` with the owner before execution.

## Checks

### Build and static checks

```bash
npm ci
npm run lint
npm run build
npm run test:security
```

Acceptance: all commands pass; no `.env.local` is tracked; no secret values appear in logs or build output.

### Client boundary checks

- Without `SUPABASE_SERVICE_ROLE_KEY`, privileged server routes fail closed.
- With only public anon variables, intentionally public inquiry routes can use RLS-limited inserts.
- No source route contains a `SUPABASE_SERVICE_ROLE_KEY ?? NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback.

### RLS checks

Using separate anonymous and authenticated staging clients:

- Anonymous can select only published Lens analyses.
- Anonymous cannot read Ground Truth, retrieval documents, raw report cache, saved items, blueprints, or private reports.
- User A cannot read or mutate User B’s saved cards, watchlists, watchlist companies, memory, blueprints, or reports.
- Service role can perform server writes.
- Public inquiry/waitlist insert-only behavior remains available.

### Integration test prerequisites

Set these variables only in the isolated staging shell or CI secret store; do not commit them:

```text
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_SERVICE_ROLE_KEY
STAGING_USER_A_JWT
STAGING_USER_B_JWT
STAGING_USER_A_APP_UUID
STAGING_USER_B_APP_UUID
```

Then run:

```bash
npm run test:security
```

`tests/security/staging-rbac.test.ts` creates temporary User A-owned watchlist, memory, blueprint, private report, and published/unpublished analysis rows using the service role. It verifies anonymous published/unpublished reads, User A reads, User B cross-user reads, guessed identifiers, forged writes, cross-user deletes, service-role access, and anonymous access to unreviewed cache tables. The `finally` block removes only the test rows it created.

Without all staging variables, the integration test is skipped and reports that it was not executed. A skipped test is not evidence of security; staging execution is a release gate.

The preflight must also inventory `pg_policies` dynamically. The migration does not rely solely on repository policy names: it enumerates and drops every policy on protected tables, and it raises before mutation when required tables or columns are absent.

### Public Lens regression

- Search page loads.
- Public `/lens/four` report loads.
- Permanent OID report loads.
- A dry-run test record is not public, not latest, and does not displace the live record.

### Rollback gate

Do not promote if any private route becomes publicly readable, if any public report disappears, if the service-role key is not required for privileged writes, or if test records appear in public latest selection.
