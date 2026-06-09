# The Lens™ AI Prompt

The active system prompt lives in `lib/lens-ai.ts` as `LENS_SYSTEM_PROMPT`.

The model must return only JSON using this shape:

```json
{
  "name": "canonical name",
  "ticker": "ticker if public company, otherwise empty string",
  "industry": "industry or category",
  "description": "one sentence description",
  "transformation_rating": "Emerging | Developing | Advanced | Transforming | Leading",
  "trust_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "courage_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "yield_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "equity_reclamation": "percentage or range, e.g. 12% or N/A",
  "opportunity_value": "estimated value range or qualitative range",
  "confidence": "Low | Moderate | High",
  "top_unlock": "highest-leverage unlock",
  "constraints": ["constraint 1", "constraint 2", "constraint 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "summary": "short Lens narrative explaining why this matters"
}
```

The scoring lens is:

- Transformation Capacity™
- Trust Infrastructure™
- Structural Courage™
- Transformation Yield™
- Value Unlock Potential™
- Equity Reclamation™ where relevant
- AIROI™ where relevant

The model must be honest about uncertainty and avoid false precision.
