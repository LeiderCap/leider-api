import { z } from 'zod';
import { LensSnapshot } from './types';
import { slugify } from './ids';

const LensAiSchema = z.object({
  name: z.string().min(1),
  ticker: z.string().optional().default(''),
  industry: z.string().min(1).default('Unknown'),
  description: z.string().min(1),
  transformation_rating: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  trust_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  courage_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  yield_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  equity_reclamation: z.string().min(1),
  opportunity_value: z.string().min(1),
  confidence: z.enum(['Low', 'Moderate', 'High']),
  top_unlock: z.string().min(1),
  constraints: z.array(z.string()).min(1).max(5),
  opportunities: z.array(z.string()).min(1).max(5),
  summary: z.string().min(1)
});

export const LENS_SYSTEM_PROMPT = `You are The Lens™, the discovery engine for Transformation Intelligence™.

Analyze the user's query as a company, organization, sector, government, technology, trend, or topic.

Return ONLY valid JSON. Do not include markdown, prose, or code fences.

Use this exact JSON shape:
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

Evaluate through these lenses:
- Transformation Capacity™
- Trust Infrastructure™
- Structural Courage™
- Transformation Yield™
- Value Unlock Potential™
- Equity Reclamation™ where relevant
- AIROI™ where relevant

Important: Be honest about uncertainty. Do not invent precise financial values when confidence is low. Use ranges and mark confidence appropriately.`;

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI response did not contain JSON.');
  return match[0];
}

async function callAnthropic(query: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022',
      max_tokens: 1400,
      temperature: 0.2,
      system: LENS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Create a Lens Snapshot™ for: ${query}` }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data?.content?.map((part: any) => part?.text ?? '').join('\n') ?? '';
  return text;
}

async function callOpenAI(query: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: LENS_SYSTEM_PROMPT },
        { role: 'user', content: `Create a Lens Snapshot™ for: ${query}` }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function generateLensSnapshot(query: string): Promise<LensSnapshot> {
  const text = (await callAnthropic(query)) ?? (await callOpenAI(query));

  if (!text) {
    throw new Error('No AI provider configured. Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env.local.');
  }

  const parsed = LensAiSchema.parse(JSON.parse(extractJson(text)));
  const id = slugify(parsed.ticker || parsed.name || query);

  return {
    id,
    name: parsed.name,
    ticker: parsed.ticker || undefined,
    industry: parsed.industry,
    description: parsed.description,
    logo_url: undefined,
    transformation_rating: parsed.transformation_rating,
    trust_score: parsed.trust_score,
    courage_score: parsed.courage_score,
    yield_score: parsed.yield_score,
    equity_reclamation: parsed.equity_reclamation,
    opportunity_value: parsed.opportunity_value,
    confidence: parsed.confidence,
    top_unlock: parsed.top_unlock,
    constraints: parsed.constraints,
    opportunities: parsed.opportunities,
    summary: parsed.summary,
    updated_at: new Date().toISOString()
  };
}
