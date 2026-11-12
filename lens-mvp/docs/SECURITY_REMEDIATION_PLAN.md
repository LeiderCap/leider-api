# LensAnalysis.com Security Remediation — Authentication and Ownership Plan

This document is preparation only. It does not activate authentication, alter production routes, migrate records, or change live Supabase policies.

## Exact Clerk/Supabase identity mapping

Clerk remains the identity provider. A Clerk subject is a stable string such as `user_...`; it is not a UUID and must not be cast into one. The application mapping is therefore:

```text
Clerk JWT auth.jwt()->>'sub'
        ↓ exact string match
public.users.clerk_user_id (text, unique)
        ↓ relational lookup
public.users.id (uuid)
        ↓ ownership field
saved_cards.user_id / watchlists.user_id / *.owner_id (uuid)
```

The staged migration adds `public.users.clerk_user_id`, a unique partial index, `current_clerk_user_id()`, and `current_app_user_id()`. `current_clerk_user_id()` reads the verified Supabase JWT `sub` claim. `current_app_user_id()` resolves that subject to `public.users.id`. It returns NULL when the JWT is absent, invalid, or not provisioned in `public.users`; it never accepts a request-body or query-string identity.

The Clerk-to-Supabase JWT trust configuration is a staging prerequisite: Supabase Auth/JWT validation must accept the Clerk issuer and signing keys, and the server must pass the verified Clerk token to Supabase. The exact issuer/JWKS configuration is provider metadata and cannot be claimed until staging access is available. A Clerk server helper verifies the session at the Next.js boundary; the Supabase client then evaluates RLS using the same subject claim. Both layers must agree before access is granted.

For a private request, the server flow is: Clerk verifies the session; the handler obtains the Clerk subject server-side; the handler ignores caller-supplied `user_id`/`owner_id`; and Supabase RLS enforces `user_id = public.current_app_user_id()` or `owner_id = public.current_app_user_id()`. User A and User B therefore produce different UUID predicates even if they guess each other’s object IDs. Service-role server operations intentionally bypass RLS, but only after route authorization and with the strict service key; the service client never falls back to anon.

Do not infer identity from `user_id`, `session_id`, watchlist IDs, query parameters, or client state. Existing rows are not automatically mapped or reassigned.

## Proposed request boundary

1. Add Clerk middleware only for private route groups; keep public Lens report routes readable.
2. In each private API handler, call the server-side Clerk auth helper and reject missing identity with HTTP 401.
3. Use the verified Clerk subject as the application owner identity. Prefer a dedicated `clerk_user_id text NOT NULL` mapping during transition if the existing `users.id` UUID is not directly compatible.
4. Load the owner record server-side; never accept a caller-provided owner ID as authoritative.
5. Require ownership predicates for every read/update/delete and use Supabase RLS as a second boundary.
6. Return 403 for authenticated users accessing another owner’s object; avoid leaking whether an object exists where appropriate.

## Route changes required

### Saved cards

- `app/api/saved/route.ts`: replace `user_id` query/body reads with verified owner identity; retain `company_id` input only after validation; use service-role writes or authenticated RLS consistently.
- `components/SaveButton.tsx` and `app/saved/page.tsx`: obtain auth state and stop sending arbitrary user IDs.

### Watchlists

- `app/api/watchlists/route.ts`: derive owner; list/create only for current owner.
- `app/api/watchlists/[id]/companies/route.ts`: verify the watchlist belongs to current owner before add/delete.
- `app/watchlists/*` and `CreateWatchlistForm.tsx`: use authenticated session and handle 401/403 states.

### Memory

- `app/api/memory/route.ts`: add `owner_id` to new writes; reject anonymous private saves unless a deliberately public session-only mode is approved.
- `app/api/memory/session/[sessionId]/route.ts`: require owner and match `session_id` to owner; do not treat the session ID as authentication.
- `app/api/memory/item/[id]/route.ts`: select owner before delete; reject non-owner deletes.
- `saved_items.owner_id` is prepared by `sql/security_hardening_v1.sql`. Existing NULL-owner legacy rows must remain untouched and inaccessible to authenticated user queries until an approved linking flow exists.

### Private reports and blueprints

- `app/api/reports/*`: define whether report cache is public, paid-session scoped, or owner-scoped; do not use caller-supplied `sessionId` as proof of ownership.
- `app/api/blueprint/generate/route.ts`: write `owner_id` for authenticated users; preserve public generation only if the product explicitly accepts anonymous, non-private blueprints.
- `blueprints.owner_id` and `lens_reports.owner_id` are prepared by the staged migration.

### Public Lens reports

- Keep `app/lens/[id]/page.tsx` and `app/lens/[id]/[oid]/page.tsx` public for rows explicitly marked `is_public=true`.
- Do not expose raw Ground Truth, retrieval documents, identity cards, report cache, or service-role data through public routes.
- Preserve test-record exclusions: `is_test_record=true` rows must remain non-public and never become latest.

### Public-data exposure decision

Only `lens_analyses` has an intentional anonymous read policy, and only for `is_public = true`. The revised migration removes anonymous SELECT from `lens_scores`, `companies`, `cached_stock_prices`, and `opportunity_zone_cache` until a column-level review proves that those tables contain no private research, unpublished analysis, provider payloads, or internal scoring metadata. Their server-side routes must use the service client or an explicitly reviewed public projection/view before public access is reconsidered.

This is deliberately more conservative than the prior proposal. Existing public Lens URLs remain preserved through `lens_analyses.is_public`; raw Ground Truth, retrieval documents, reports, caches, and research scores are not made public merely because a table is called a cache.

## Legacy data policy

- Do not delete, rewrite, or automatically reassign existing records.
- Add nullable owner columns and leave legacy rows NULL.
- Document an owner-approved account-linking workflow before any legacy association is attempted.
- Preserve existing public Lens OIDs and public report URLs.

## Acceptance criteria before production activation

- Anonymous request to private saved/watchlist/memory routes returns 401.
- Authenticated user A cannot read, create under, update, or delete user B’s records.
- A guessed watchlist or memory item ID returns 403/404 without data leakage.
- Public `/lens/[ticker]` and `/lens/[ticker]/[oid]` continue to serve only published analyses.
- Test records cannot be loaded through public report routes.
- No API handler trusts `user_id`, `owner_id`, `session_id`, or route IDs without verified ownership.
- Clerk sign-in/sign-up works on staging with production domains excluded.
