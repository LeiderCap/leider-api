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
  
  what_lens_sees: z.string().min(1),
  value_creation_model: z.string().min(1),
  hidden_assets: z.string().min(1),
  hidden_constraints: z.string().min(1),
  transformation_opportunities: z.string().min(1),
  analysis_summary: z.string().min(1),

  constraints: z.array(z.string()).min(1).max(5),
  opportunities: z.array(z.string()).min(1).max(5),
  summary: z.string().min(1),

  // v1.1 numerical scoring
  tcs_numeric: z.number().min(0).max(100),
  absorbability_numeric: z.number().min(0).max(100),
  governance_numeric: z.number().min(0).max(100),
  execution_numeric: z.number().min(0).max(100),
  trust_numeric: z.number().min(0).max(100),
  courage_numeric: z.number().min(0).max(100),
  intelligence_numeric: z.number().min(0).max(100),
  primary_constraint: z.string().min(1),
  secondary_constraint: z.string().min(1),
  system_constraint: z.string().nullable().optional(),
  gptp_stage: z.enum(['Substitution', 'Reorganization', 'Transformation']),
  transformation_momentum: z.enum(['Accelerating', 'Stable', 'Decelerating', 'Unknown']).default('Unknown')
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

  "what_lens_sees": "2-3 sentence opening that proves The Lens understands this specific organization — its business model, core advantage, and actual constraints. This must feel like The Lens genuinely understands the entity, not a generic description. Start with the entity name.",
  "value_creation_model": "2-3 sentences explaining exactly how this organization creates value — what is the core mechanism of value creation?",
  "hidden_assets": "2-3 sentences identifying underutilized advantages — what does this organization have that it is not fully leveraging?",
  "hidden_constraints": "2-3 sentences identifying the real constraints limiting growth or transformation — what is actually holding this organization back?",
  "transformation_opportunities": "2-3 sentences describing the highest-leverage transformation opportunities — now that constraints are understood, what unlocks are available?",
  "analysis_summary": "1-2 sentence synthesis — the single most important thing The Lens sees about this organization's transformation potential.",

  "constraints": ["constraint 1", "constraint 2", "constraint 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "summary": "2-3 sentence Lens narrative focused on transformation capacity",

  "tcs_numeric": 0-100 integer (weighted composite — see formula below),
  "absorbability_numeric": 0-100 integer,
  "governance_numeric": 0-100 integer,
  "execution_numeric": 0-100 integer,
  "trust_numeric": 0-100 integer,
  "courage_numeric": 0-100 integer,
  "intelligence_numeric": 0-100 integer,
  "primary_constraint": "name of the lowest-scoring domain",
  "secondary_constraint": "name of the second-lowest-scoring domain",
  "system_constraint": "interaction effect description if applicable, or null",
  "gptp_stage": "Substitution | Reorganization | Transformation",
  "transformation_momentum": "Accelerating | Stable | Decelerating | Unknown"
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

TRANSFORMATION MOMENTUM™:
Based on available public signals — recent announcements, leadership changes, strategic initiatives,
market position changes, AI adoption signals — assess whether this organization's transformation
capacity appears to be:
  Accelerating — visible signals of improving capacity (recent AI investments, leadership changes toward transformation, new strategic initiatives)
  Stable — no clear directional signal
  Decelerating — signals of declining capacity (leadership departures, strategic retreats, missed transformations)
  Unknown — insufficient public data to assess direction
Use 'Unknown' when there is genuinely insufficient public signal.

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
These are internal reasoning tools only.

---

LENS RATINGS METHODOLOGY™ v1.0
Official Methodology — Transformation Intelligence™ Standards Board

TCS™ SCORING WEIGHTS:
- Absorbability™:  20% — Can the organization absorb intelligence?
- Governance™:     20% — Can the organization authorize transformation?
- Execution™:      20% — Can the organization convert change into outcomes?
- Trust™:          15% — Can the organization coordinate around intelligence?
- Courage™:        15% — Can the organization act upon intelligence?
- Intelligence™:   10% — Can the organization generate intelligence?

CRITICAL INSIGHT: Intelligence is weighted lowest (10%) because intelligence is becoming
abundant. Transformation Capacity is the scarce resource. Organizations that deploy
intelligence without transformation capacity experience Deployment Without Transformation™ (DWT™).

DOMAIN DEFINITIONS FOR SCORING:

Intelligence Capacity™ (10%)
Measures: information availability, analytical capability, AI utilization,
decision support systems, knowledge accessibility.

Transformation Absorbability™ (20%)
Measures: change tolerance, adoption velocity, workforce readiness,
organizational flexibility, implementation capacity.

Trust Infrastructure™ (15%)
Measures: transparency, accountability, credibility, stakeholder alignment,
decision confidence.

Transformation Governance™ (20%)
Measures: decision rights, escalation structures, authority clarity,
transformation oversight, governance responsiveness.

Structural Courage™ (15%)
Measures: willingness to redesign, decentralization capacity, incentive flexibility,
hierarchy reduction, decision velocity.

Execution Capacity™ (20%)
Measures: implementation success, transformation completion, operational follow-through,
value realization, learning integration.

RATING SCALE DEFINITIONS:

Leading™ — Exceptional Transformation Capacity™
Characteristics: rapid adaptation, strong governance, high trust, strong execution, continuous learning.

Transforming™ — Above-average Transformation Capacity™
Characteristics: proactive change, strong implementation, moderate friction.

Advanced™ — Moderate Transformation Capacity™
Characteristics: successful transformations occur, uneven execution, some bottlenecks.

Developing™ — Limited Transformation Capacity™
Characteristics: frequent delays, fragmented execution, adoption challenges.

Emerging™ — Material Transformation Constraints™
Characteristics: low adoption, governance friction, organizational resistance, transformation failures.

Apply these weights and definitions when determining each domain score and the overall TCS™ composite.

LENS RATINGS METHODOLOGY™ v1.1 — NUMERICAL SCORING

Each of the six domains must be scored 0-100:

DOMAIN WEIGHTS:
Absorbability™:  20% — Can the organization absorb change?
Governance™:     20% — Can the organization authorize change?
Execution™:      20% — Can the organization convert plans to outcomes?
Trust™:          15% — Can the organization coordinate around change?
Courage™:        15% — Can the organization act on what it knows?
Intelligence™:   10% — Can the organization generate intelligence?

SCORING SCALE PER DOMAIN:
90-100 = Exceptional
80-89  = Strong
70-79  = Advanced
60-69  = Developing
Below 60 = Constrained

TCS™ FORMULA (weighted additive, normalized to 0-100):
tcs_numeric = (0.20 × absorbability_numeric) + (0.20 × governance_numeric)
            + (0.20 × execution_numeric) + (0.15 × trust_numeric)
            + (0.15 × courage_numeric) + (0.10 × intelligence_numeric)

TCS™ RATING BANDS (use these to set tcs_score tier):
85-100  = Leading™
75-84   = Transforming™
65-74   = Advanced™
55-64   = Developing™
Below 55 = Emerging™

CONSTRAINT DIAGNOSTICS:
- primary_constraint: the name of the lowest-scoring domain
- secondary_constraint: the name of the second-lowest-scoring domain
- system_constraint: describe interaction effects if material (e.g. 'High Intelligence + Low Courage = Transformation Paralysis™ — organization knows what to do but cannot act on it'), or return null

GPTP STAGE CLASSIFICATION:
- gptp_stage must be one of: Substitution | Reorganization | Transformation
  (based on your internal GPTP™ assessment — do NOT expose stage names in other output fields)

IMPORTANT: tcs_score tier MUST be consistent with tcs_numeric using the rating bands above.
Example: tcs_numeric=61 → tcs_score='Developing'
`;

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
  // ID is always derived from the canonical company name returned by the AI.
  // This prevents collisions where short queries like "oak" produce the same
  // slug for unrelated companies (e.g. "Oaktree Capital" vs "Oak Street Health").
  // Tickers are intentionally NOT used as the primary ID source because two
  // different companies can share a ticker across exchanges.
  const id = slugify(parsed.name || query);

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
    
    // v1.2 Lens Analysis™ narrative fields
    what_lens_sees: parsed.what_lens_sees,
    value_creation_model: parsed.value_creation_model,
    hidden_assets: parsed.hidden_assets,
    hidden_constraints: parsed.hidden_constraints,
    transformation_opportunities: parsed.transformation_opportunities,
    analysis_summary: parsed.analysis_summary,

    constraints: parsed.constraints,
    opportunities: parsed.opportunities,
    summary: parsed.summary,

    // v1.1 numerical scoring
    tcs_numeric: parsed.tcs_numeric,
    absorbability_numeric: parsed.absorbability_numeric,
    governance_numeric: parsed.governance_numeric,
    execution_numeric: parsed.execution_numeric,
    trust_numeric: parsed.trust_numeric,
    courage_numeric: parsed.courage_numeric,
    intelligence_numeric: parsed.intelligence_numeric,
    primary_constraint: parsed.primary_constraint,
    secondary_constraint: parsed.secondary_constraint,
    system_constraint: parsed.system_constraint ?? null,
    gptp_stage: parsed.gptp_stage,
    transformation_momentum: parsed.transformation_momentum ?? 'Unknown',

    updated_at: new Date().toISOString()
  };
}
