# Go Deep™ data contract

## Current release status

Go Deep™ is suspended and excluded from the current LensAnalysis release. The
page and both API endpoints return 404 without invoking the model provider or
accessing the database. The prior implementation remains in the adjacent
`legacy-page.tsx` and `legacy-route.ts` files for possible future reactivation.

## Deferred transient contract

When reactivated, the intended Go Deep™ contract is **public transient analysis**.

- `POST /api/go-deep` accepts anonymous content and returns the generated analysis.
- The route does not automatically insert the submitted content or generated result into `public.go_deep_analyses`.
- `POST /api/go-deep-rewrite` also returns a transient rewrite and does not automatically persist the submitted content, delta, or generated rewrite.
- Input is bounded to 20,000 characters and the request body is bounded to approximately 24,000 bytes before model processing. Model output is capped at 2,500 tokens.
- The existing `go_deep_analyses` table, schema, existing rows, and RLS policies are unchanged by this release.

## Explicit saving

A user may explicitly save a generated analysis or rewrite through the existing authenticated memory flow. That flow requires a Clerk session, resolves the application user server-side, and writes `owner_id` from the server-derived application identity. Client-supplied user or owner IDs are not used for authorization.

## Provider-processing disclosure

Transient within this application does **not** mean zero retention or absolute confidentiality. Submitted content is sent to the configured OpenAI-compatible model provider for processing. Provider retention, logging, abuse monitoring, and other handling are governed by the configured provider and account terms. Users should not submit information that they are not authorized to process through that provider.

## Abuse and cost controls

This release applies request-size and model-output bounds using the existing route infrastructure and introduces no new paid dependency or external rate-limiting service. A distributed rate limiter remains a future operational control if public traffic or provider-cost exposure requires it.
