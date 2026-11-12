# Staging Security Runbook

This runbook is non-production. Do not point it at the production Supabase project or Vercel production environment.

## Environment

- Create a separate Supabase staging project.
- Use separate OpenAI/FMP/Stripe/Clerk credentials or tightly limited test credentials.
- Set `NEXT_PUBLIC_APP_URL` to the staging URL.
- Keep `LENS_V5_DRYRUN_SECRET` distinct from production.
- Apply existing migrations, then review `sql/security_hardening_v1.sql` with the owner before execution.

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

### Public Lens regression

- Search page loads.
- Public `/lens/four` report loads.
- Permanent OID report loads.
- A dry-run test record is not public, not latest, and does not displace the live record.

### Rollback gate

Do not promote if any private route becomes publicly readable, if any public report disappears, if the service-role key is not required for privileged writes, or if test records appear in public latest selection.
