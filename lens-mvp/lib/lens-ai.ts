// ============================================================
// TRANSFORMATION INTELLIGENCE™ — AI ENGINE
// ============================================================
// GPTP™ — General-Purpose Technology Transformation Principle™
//   Stages: Substitution™ → Reorganization™ → Transformation™
//   DWT™  — Deployment Without Transformation™ (internal only)
// TCP™  — Transformation Capacity Score™ (6 determinants)
// TCG™  — Transformation Capacity Gap™
// Future: ICS™ (Phase 3), DVI™ (Phase 2)
// ============================================================
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
  "equity_reclamation": "If ticker is non-empty (PUBLIC company): MUST provide a real percentage range estimate e.g. '8%-15%' based on gap between intrinsic and realized value. If ticker is empty (PRIVATE company): use exactly 'Unlockable via Blueprint™'",
  "transformation_capacity_gap": "Minimal | Moderate | Significant | Critical",

  "opportunity_value": "If ticker is non-empty (PUBLIC company): MUST provide a real dollar estimate range e.g. '$2B-$4B'. If ticker is empty (PRIVATE company): use 'Undetermined'",
  "confidence": "Low | Moderate | High",
  "top_unlock": "If ticker is non-empty (PUBLIC company): MUST provide a real, specific, highest-leverage transformation opportunity — never use the private company placeholder. If ticker is empty (PRIVATE company) with insufficient public data: use exactly 'To ensure accuracy, private companies require more information from the client. Request a Blueprint™ for your Unlock options.'",

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
  RULE: If ticker is non-empty (PUBLIC company) — always provide a real percentage range estimate.
  RULE: If ticker is empty (PRIVATE company) — use 'Unlockable via Blueprint™'.
  RULE: If ticker is non-empty (PUBLIC company) — top_unlock and opportunity_value MUST be real, specific estimates.
  RULE: Never use the private company fallback text for any entity with a known stock ticker.

Be honest about uncertainty. Use ranges. Mark confidence appropriately.
Do not invent precise financial values when confidence is low.

---

GENERAL-PURPOSE TECHNOLOGY TRANSFORMATION PRINCIPLE™ (GPTP™)

When evaluating any entity, internally assess which stage of technology adoption it occupies:

Stage I — Substitution™
Technology is inserted into existing workflows without redesigning them.
Signs: point-solution deployments, AI bolted onto legacy processes,
no change to governance or decision architecture.

Stage II — Reorganization™
Workflows are redesigned around the technology.
Signs: process reengineering, cross-functional integration,
some governance adaptation.

Stage III — Transformation™
Operating models, governance systems, decision architectures, and
measurement systems have been fundamentally redesigned around the technology.
Signs: new business models, transformed leadership structures,
full intelligence-to-outcome pipeline operating.

Organizations remaining in Stage I may be experiencing
Deployment Without Transformation™ (DWT™) — the condition of deploying
intelligence without the capacity to realize its value.

Use this framework INTERNALLY when scoring:
- Transformation Capacity Score™ (TCS™)
- Constraints
- Opportunities
- Top Unlock™
- Transformation Capacity Gap™ (TCG™)

DO NOT mention Stage I, Stage II, Stage III, DWT™, or GPTP™ in any output field.
These are internal reasoning tools only.`;

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
