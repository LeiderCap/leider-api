# Credential Rotation Inventory — Preparation Only

No credential values are recorded in this document. No credentials were rotated.

## Why rotation is required

`lens-mvp/.env.local` was tracked in Git history and contains multiple non-empty assignments. Treat those assignments as potentially exposed until each provider confirms the value is non-sensitive, invalid, or rotated.

## Inventory

| Provider/system | Variable names | Exposure/source status | Required action |
|---|---|---|---|
| OpenAI-compatible model provider | `OPENAI_API_KEY`, `OPENAI_API_BASE`, `OPENAI_MODEL`, `OPENAI_V5_MODEL` | Non-empty model/config assignment observed; key assignment must be verified in provider history | Revoke/replace any historical key; verify model access and usage logs |
| Anthropic | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Source/config names; live value status unknown | Rotate if present in any provider or deployment environment |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | URL/key-shaped assignments observed in tracked env material; values withheld | Rotate service-role and anon keys if historical values were real; verify project audit logs |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Non-empty assignments observed in tracked env material; values withheld | Rotate secret key if real; verify allowed domains and sessions |
| Financial Modeling Prep | `FMP_API_KEY`, `NEXT_PUBLIC_FMP_API_KEY` | Non-empty server key assignment observed; public-key name requires client-bundle review | Rotate server key if real; eliminate public exposure unless explicitly intended |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs | Names found in source; live values not inspected | Rotate secrets if present in tracked history; revalidate webhook endpoint |
| Resend | `RESEND_API_KEY`, `BLUEPRINT_NOTIFY_EMAIL` | Names found in source; live values not inspected | Rotate API key if present in tracked history |
| Lens/admin | `ADMIN_SECRET`, `LENS_V5_DRYRUN_SECRET` | Names found in source; live values not inspected | Rotate and move admin authentication from query strings to headers |
| Deployment/app | `NEXT_PUBLIC_APP_URL`, `NODE_ENV` | Configuration only | Verify Vercel environment scopes and preview/production separation |

## Approval and sequence

1. Owner authorizes provider dashboard inspection.
2. Export only variable names and environment scope metadata, never values.
3. Revoke/replace provider credentials in the provider dashboard.
4. Update Vercel production/preview variables with new values.
5. Verify application health in staging and production canary.
6. Remove `.env.local` from Git tracking; rewrite history only after separate owner approval.
7. Review provider audit logs for use of historical credentials.
