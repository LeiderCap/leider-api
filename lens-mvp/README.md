# The Lens™ MVP

Discovery engine for the Transformation Layer™.

## Quick start

```bash
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Configuration

### Minimum (local dev, seed data only)
No keys needed — seed cards for Erie, Microsoft, California work out of the box.

### Live Lens generation
Add `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`) to `.env.local`.
Any search will now generate a live Lens Snapshot™ via AI and cache it in memory (or Supabase if configured).

### Full production
Add Supabase credentials to persist all generated Lens Cards, enterprise inquiries, and future user data.
Run `sql/schema.sql` in your Supabase SQL editor.

## What's built

| Surface | Status |
|---|---|
| Homepage with website strategy | ✅ |
| Lens Search™ | ✅ |
| Lens Cards™ | ✅ |
| Lens Snapshots™ (detail pages) | ✅ |
| Live AI generation (Anthropic + OpenAI) | ✅ |
| Supabase cache layer | ✅ |
| Blueprint™ enterprise inquiry form | ✅ |
| Seed data (Erie, Microsoft, California) | ✅ |
| SQL schema | ✅ |

## Next (week 2–4)
- Clerk auth + saved cards + watchlists
- Stripe Founding Member™ checkout ($12/year)
- OG image generation for shareable cards
- Public Fortune 1000 rankings page
- PostHog analytics
- Resend email notifications for Blueprint inquiries

## Stack
Next.js · TypeScript · Tailwind · Supabase · Clerk (upcoming) · Stripe (upcoming) · Vercel
