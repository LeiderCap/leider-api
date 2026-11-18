# Release Security Architecture and Readiness

## Architecture decision

The Lens uses **server-mediated authorization** for private application workflows:

1. Clerk authenticates the browser session.
2. Server routes call `getAppAuthContext()` from `lib/server-auth.ts`.
3. The server resolves the Clerk subject to `public.users.id` and provisions the application user when necessary.
4. Private operations use the explicit Supabase service-role client on the server.
5. Every private query scopes records to the server-derived application-user UUID or to another documented administrative boundary.

Direct browser-to-Supabase Clerk JWT authentication is **not a supported application workflow and is out of scope for this release**. Clerk JWT templates and Supabase JWT trust configuration must not be changed as part of this release.

The direct Supabase JWT/RLS test remains in `tests/security/staging-rbac.test.ts` as optional defense-in-depth coverage. It is not a release gate and must be run only in an environment that intentionally configures Supabase to trust Clerk JWTs.

## Required release tests

The required automated suite is the server-mediated path. It exercises application HTTP routes with authenticated Clerk session cookies supplied through a secure staging shell or CI secret store. It verifies:

- authenticated User A and User B ownership binding;
- cross-user memory reads return no records;
- cross-user memory deletion is an indistinguishable no-op with `deleted: false`;
- owner deletion returns `deleted: true`;
- User A watchlists are not visible to User B;
- temporary records are removed during cleanup;
- the service-role key is used only for server-side cleanup and never sent to the browser.

Required variables for that suite are `STAGING_APP_URL`, `STAGING_USER_A_COOKIE`, `STAGING_USER_B_COOKIE`, `STAGING_SUPABASE_URL`, and `STAGING_SERVICE_ROLE_KEY`. Values belong only in the staging shell or CI secret store.

The static contract test is always required and verifies that private routes use `getAppAuthContext()`, do not authorize from caller-supplied owner IDs, and use a fail-closed service client.

## Route authorization matrix

| Route | Boundary | Verification status |
|---|---|---|
| `/api/saved` | Clerk session; `saved_cards.user_id = appUserId` | Static contract plus staging browser/API verification |
| `/api/watchlists` | Clerk session; `watchlists.user_id = appUserId` | Static contract plus User A/User B staging verification |
| `/api/watchlists/[id]/companies` | Clerk session plus parent-watchlist ownership | Static contract; targeted staging route test required before production |
| `/api/memory` | Clerk session; inserts `owner_id = appUserId` | Required server-mediated staging test |
| `/api/memory/session/[sessionId]` | Clerk session; filters by `owner_id = appUserId` | Required server-mediated cross-user read test |
| `/api/memory/item/[id]` | Clerk session; owner-scoped delete | Required server-mediated deletion test; corrected in commit `4bd4da2` |
| `/api/blueprint/generate` | Clerk session; saves with `owner_id = appUserId` | Static contract; generation requires staging OpenAI configuration for E2E testing |
| `/api/blueprint` | Public inquiry route; not the private generated-blueprint retrieval boundary | Separate product/inquiry behavior; do not classify as private owner route without schema review |
| Private report generators | Clerk session; owner-scoped `report_cache` reads/writes | Static contract; targeted E2E requires provider/API configuration |
| `/api/go-deep` and `/api/go-deep-rewrite` | Intentionally suspended for this release; active handlers return 404 without provider or database access; legacy implementations retained in source control | Focused suspension regression tests pass; reactivation requires a new product and security review |
| `/api/admin/expire-cache` | `ADMIN_SECRET` equality check; service-role update | Static review; invalid-secret rejection must be tested with staging secret |
| `/api/stripe/webhook` | Stripe signature verification before service-role updates | Invalid-signature rejection test required; no real transaction needed |

## Database migration inventory

The staging branch contains the following relevant SQL artifacts:

- `sql/staging_baseline_v1.sql` — canonical staging schema bootstrap.
- `sql/security_hardening_v1.sql` — RLS, identity bridge, policy cleanup, and conservative public-read boundaries.
- The explicit service-role DML grant migration applied to staging after the initial permission diagnosis — grants only the approved DML privileges on explicitly named tables.
- Historical SQL files remain source artifacts and must not be blindly replayed against production.

Production database policies and credentials are outside this release verification and must remain unchanged.

## Environment and permissions

Staging must provide the existing application variables for the staging Supabase project, Clerk Development instance, and provider integrations. Production values must never be copied into staging.

The server requires `SUPABASE_SERVICE_ROLE_KEY` for privileged operations and must fail closed when it is absent. No route may fall back from the service-role key to the public anon key.

The admin cache-expiration route requires `ADMIN_SECRET`; it must not be passed in ordinary browser navigation or logged. Stripe webhook tests use invalid signatures only and must not create real transactions.

## Rollback

1. Stop promotion immediately if any required authorization test fails, if a private record is publicly readable, or if the service-role client falls back to anon credentials.
2. Revert the staging deployment to the last known-good staging commit.
3. Do not merge the remediation branch into `main`.
4. Do not run any production SQL rollback or migration as part of staging rollback.
5. Remove only synthetic staging records created by the test run, then verify their absence.
6. Preserve production reports, OIDs, credentials, RLS policies, and records.

## Release recommendation

The deletion correction is staging-verified. Release remains **NO-GO** until the required server-mediated staging suite runs with zero skips, the remaining targeted private-route checks are completed, the optional direct-RLS test is explicitly marked out of scope, and the existing `tests/security/staging-rbac.test.ts` TypeScript errors are absent.
