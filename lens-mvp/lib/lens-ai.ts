import { z } from 'zod';
import { LensSnapshot } from './types';
import { slugify } from './ids';

const LensAiSchema = z.object({
  name: z.string().min(1),
  ticker: z.string().optional().default(''),
  industry: z.string().min(1).default('Unknown'),
  description: z.string().min(1),
  
  tcs_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  
  intelligence_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  absorbability_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  trust_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  governance_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  courage_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  execution_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  
  yield_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  equity_reclamation: z.string().min(1),
  transformation_capacity_gap: z.enum(['Minimal', 'Moderate', 'Significant', 'Critical']),
  
  opportunity_value: z.string().min(1),
  confidence: z.enum(['Low', 'Moderate', 'High']),
  top_unlock: z.string().min(1),
  
  constraints: z.array(z.string()).min(1).max(5),
  opportunities: z.array(z.string()).min(1).max(5),
  summary: z.string().min(1)
});

export const LENS_SYSTEM_PROMPT = `You are The Lens™, the measurement system for Transformation Capacity™.

Your primary purpose is to measure how effectively an organization, government,
industry, or individual can convert intelligence into realized outcomes.

The central question you answer is:
"Can this entity actually transform fast enough to realize the value of the
intelligence it now possesses?"

Return ONLY valid JSON. No markdown, no prose, no code fences.

Use this exact JSON shape:
{
  "name": "canonical name",
  "ticker": "ticker if public, otherwise empty string",
  "industry": "industry or category",
  "description": "one sentence description",

  "tcs_score": "Emerging | Developing | Advanced | Transforming | Leading",

  "intelligence_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "absorbability_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "trust_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "governance_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "courage_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "execution_score": "Emerging | Developing | Advanced | Transforming | Leading",

  "yield_score": "Emerging | Developing | Advanced | Transforming | Leading",
  "equity_reclamation": "percentage or range e.g. 12% or N/A",
  "transformation_capacity_gap": "Minimal | Moderate | Significant | Critical",

  "opportunity_value": "estimated value range",
  "confidence": "Low | Moderate | High",
  "top_unlock": "single highest-leverage transformation unlock",

  "constraints": ["constraint 1", "constraint 2", "constraint 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "summary": "2-3 sentence Lens narrative focused on transformation capacity"
}

Evaluate through these lenses:
- Intelligence: quality and availability of intelligence inputs
- Absorbability: organizational capacity to absorb and implement change
- Trust: trust infrastructure across leadership, systems, and governance
- Governance: decision velocity, accountability, and structural clarity
- Courage: willingness to make difficult, necessary transformation decisions
- Execution: track record and capacity for sustained implementation
- Transformation Yield™: value realized per unit of intelligence invested
- Equity Reclamation™: gap between intrinsic and realized value where relevant

Be honest about uncertainty. Use ranges. Mark confidence appropriately.
Do not invent precise financial values when confidence is low.`;

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
      model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
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
    
    tcs_score: parsed.tcs_score,
    intelligence_score: parsed.intelligence_score,
    absorbability_score: parsed.absorbability_score,
    trust_score: parsed.trust_score,
    governance_score: parsed.governance_score,
    courage_score: parsed.courage_score,
    execution_score: parsed.execution_score,
    
    yield_score: parsed.yield_score,
    equity_reclamation: parsed.equity_reclamation,
    transformation_capacity_gap: parsed.transformation_capacity_gap,
    
    opportunity_value: parsed.opportunity_value,
    confidence: parsed.confidence,
    top_unlock: parsed.top_unlock,
    
    constraints: parsed.constraints,
    opportunities: parsed.opportunities,
    summary: parsed.summary,
    
    updated_at: new Date().toISOString()
  };
}
