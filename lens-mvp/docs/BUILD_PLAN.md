# Lens MVP Build Plan

## Current state

The MVP includes the shell, seed cards, AI generation route, optional Supabase cache, and enterprise Blueprint™ inquiry route.

## Immediate priority

The AI layer is now implemented in:

- `app/api/lens/route.ts`
- `lib/lens-ai.ts`
- `lib/lens-service.ts`

Search now follows this order:

1. Seed card match
2. Supabase cached card, if configured
3. AI generation through Anthropic, then OpenAI fallback
4. Optional Supabase upsert

## Week 1

- Improve generated JSON reliability
- Add evidence/confidence metadata
- Add rate limiting
- Add PostHog events
- Add empty/error states

## Week 2

- Add Clerk auth
- Save cards to user account
- Watchlists
- User search history

## Week 3

- Stripe Founding Member™ tier
- Member-gated watchlists and alerts
- Email capture with Resend

## Week 4

- Public ranking pages
- Fortune 100 seed expansion
- Enterprise inquiry dashboard
- Launch prep
