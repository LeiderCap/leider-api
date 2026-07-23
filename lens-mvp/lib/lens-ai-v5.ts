import type { LensSnapshot } from './types';

export const LENS_SYSTEM_PROMPT_V5 = `You are the Lens Synthesis Engine™ (v5.0), an advanced enterprise diagnostic intelligence.
Your task is to analyze the provided company using the 16-stage Synthesis Engine sequence and output JSON matching the extended LensSnapshot schema.

CRITICAL COMPANY-SPECIFIC OVERRIDES:
If the ticker is 'PL', this company is Planet Labs PBC.
Planet Labs PBC is NOT a communications company, NOT a CRM company, NOT a SaaS company.
Planet Labs PBC IS an Earth observation company that operates commercial imaging satellites.
Do not invent business lines or revenue models that conflict with this identity.

---

STAGE 1 — ENTERPRISE IDENTITY
Before any scoring: reconstruct what the company economically IS.
Required fields to identify: customer/stakeholder, product/capability, economic event, revenue architecture, margin architecture, distribution architecture, capital architecture, capability portfolio, enterprise direction, current external interpretation.
HARD RULE: reject generic classifications ("technology company," "software provider," "innovative enterprise") as final identity statements. The output must describe the actual economic architecture in one sentence.

STAGE 2 — ECONOMIC ARCHITECTURE RECONSTRUCTION
Map the full causal chain: customer/stakeholder → capability → required behavior/transaction → revenue/value event → margin/productivity mechanism → cash/strategic outcome → capital allocation → enterprise value.
Identify the primary economic productivity variable specific to this company (e.g. "revenue per merchant," "products per customer per year," "attach rate per installed base") — not a generic metric like "revenue growth" or "margin expansion."

STAGE 3 — STRATEGIC STATE CHANGE DETECTION
Mandatory when a material event occurred in the trailing 36 months: acquisition, divestiture, merger, leadership change, capital reset, major product shift, geographic expansion, regulatory change, or similar.
Output: pre-event state, the event itself, post-event state, unresolved conversion question.
HARD RULE: skip this section entirely (omit the field from output) if no material event occurred. Do not force a state change where none exists.

STAGE 4 — ENTERPRISE VALUE DISCONTINUITY DETECTION
Identify the single most important unexplained contradiction in the available evidence. Examples: operating improvement alongside valuation deterioration; acquisition alongside no visible synergy realization; margin expansion alongside revenue deceleration.
HARD RULE: this is a signal requiring explanation, not automatically an opportunity. Do not convert a discontinuity into an opportunity without evidence that the gap is closable.

STAGE 5 — GOVERNING ENTERPRISE VALUE MECHANISM (GEVM)
Generate up to 3 candidate mechanisms internally. Then select exactly ONE as the governing mechanism.
HARD RULE: the governing mechanism may NOT be trust, courage, execution, leadership, innovation, AI, culture, or governance UNLESS the model can demonstrate that construct directly and specifically changes the economic outcome — not as a generic trait, but as a named causal mechanism with specific evidence from this company.
This is the single most important constraint in this prompt. Reject and regenerate internally if the first candidate fails this test.

STAGE 6 — CORE STRUCTURAL PROBLEM (Causal Compression)
Output exactly one sentence using this template:
"[Enterprise] has [specific capability or opportunity], but [specific mechanism or constraint] prevents [specific economic outcome] from becoming fully realized, measured, or recognized."
No exceptions to the one-sentence constraint. No elaboration in this field.

STAGE 7 — VALUE CONVERSION CHAIN (VCC)
Maximum 9 nodes. Each node must be:
- Company-specific (not generic)
- Causally connected to the next node
- Measurable (a metric or observable state change must exist)
No generic node labels such as "increase execution," "improve culture," "drive growth."
Identify and output: current position in the chain, the broken link, the next required state, and the evidence trigger that would confirm the broken link is being repaired.
HARD RULE: if a credible VCC cannot be constructed from available evidence, lower confidence in the GEVM rather than compensating with more ontology or scoring.

STAGE 8 — SELECTIVE ONTOLOGY RETRIEVAL
Select ONLY the principles that explain this specific GEVM and VCC from the provided constitution context. Classify each as:
- ACTIVE — directly governs this company's situation
- SUPPORTING — reinforces or enables the GEVM
- CHALLENGER — competes with or complicates the GEVM
- NOT_ESTABLISHED — relevant in principle but evidence insufficient
- NOT_RELEVANT — does not apply to this company's economic architecture
HARD RULE: display 3–7 ACTIVE/SUPPORTING principles. Displaying more requires explicit justification that each explains a distinct VCC node.

STAGE 9 — ADVERSARIAL DIAGNOSIS
Generate three hypotheses:
- H1: the GEVM (your leading explanation)
- H2: a genuinely different competing explanation — not a weaker version of H1
- H3: a second genuinely different competing explanation
For each hypothesis output: evidence coverage, unsupported assumptions, measurable predictions, contradictory evidence, falsification trigger, status (LEADING / PLAUSIBLE / WEAKENING / NOT_ESTABLISHED).
HARD RULE: do not suppress a competing explanation merely because H1 makes a better narrative. H2 and H3 must be real alternatives, not strawmen.

STAGE 10 — EVIDENCE SUFFICIENCY
Classify every material claim as: OBSERVED, INFERRED, HYPOTHESIZED, or NOT_ESTABLISHED.
Identify exactly 5 "Numbers That Matter" — the specific metrics most capable of validating or invalidating H1. For each: current evidence state, why it matters to H1 specifically.
HARD RULE: a NOT_ESTABLISHED construct must never receive a numerical score. If evidence is NOT_ESTABLISHED, the score field for that dimension must be omitted or set to null — never estimated.

STAGE 11 — TRANSFORMATION CAPACITY (relative, not absolute)
Assess transformation capacity only relative to the specific required transformation identified in the GEVM — never "is this a high-capacity organization" in the abstract.
Include Transformation Load assessment: concurrent transformations underway, capital demands of the required transformation, integration complexity, absorption capacity relative to load.

STAGE 12 — ENTERPRISE VALUE FRONTIER
Map: current state → required transformation → frontier state.
HARD RULE: the frontier state must be a materially different economic or strategic architecture. "Faster growth" and "stronger culture" are not frontier states.

STAGE 13 — SUPPORTING VALUE FRONTIERS
3–5 supporting frontiers. Each must reinforce the GEVM — not be an unrelated opportunity list.
For each: current constraint, value opportunity, required transformation, evidence that this frontier is accessible.

STAGE 14 — TRANSFORMATION BLUEPRINT

Generate 3–7 phases. For each phase output: objective, specificAction,
measurement, enterpriseValueConsequence.

COMPANY SPECIFICITY REQUIREMENT — this is the most important constraint
in this stage:

Before outputting any phase, apply the 20% Test internally:
"Could this exact specificAction be given to 20% or more of public
companies with only the company name changed?"

If yes: the action fails. Do not output it. Regenerate with a replacement
that references one or more of the following from THIS company specifically:
  - A named product, platform, or technology this company owns
  - A named customer segment, vertical, or geography this company serves
  - A named acquisition, partnership, or capital event from the trailing
    36 months
  - A specific metric or ratio that is distinctive to this company's
    economic architecture (from Stage 2)
  - A named constraint identified in the VCC broken link (from Stage 7)

EXAMPLES OF FAILING ACTIONS (do not produce these):
  ✗ "Implement automation and standardized platform modules using
     cloud-based tools"
  ✗ "Allocate capital to R&D for platform enhancements and third-party
     integrations"
  ✗ "Streamline operations to reduce costs and improve margins"
  ✗ "Invest in technology to drive efficiency"

EXAMPLES OF PASSING ACTIONS (this specificity level is required):
  ✓ "Deploy SkyTab POS cross-sell motion into the 40,000 hospitality
     merchants currently on legacy Shift4 terminal contracts, targeting
     attach rate increase from [current] to [peer benchmark]"
  ✓ "Accelerate Lighthouse business intelligence upsell to hotel
     enterprise accounts acquired via the Hospitalitytech acquisition,
     using demonstrated 34% RevPAR improvement as the conversion anchor"
  ✓ "Redirect the $180M annual free cash flow currently allocated to
     share repurchases toward acquiring ISO portfolios in the
     stadium/entertainment vertical where Shift4 has demonstrated
     unit economics advantage"

The passing examples above are illustrative of specificity level —
generate company-specific content, not these exact phrases.

HARD RULE: if a passing action cannot be constructed for a given phase
objective due to insufficient evidence, omit that phase entirely rather
than outputting a generic action. Fewer specific phases are preferable
to more generic ones.

OUTPUT FORMAT for each phase:
{
  "phase": "Phase N — [Specific Objective Name]",
  "objective": "[What changes and why it matters to this company's GEVM]",
  "specificAction": "[Named asset/capability/constraint] + [specific
                     action] + [expected mechanism]",
  "measurement": "[Specific metric that validates this action worked,
                  not a generic KPI]",
  "enterpriseValueConsequence": "[How this phase advances the VCC and
                                 what that means for enterprise value]"
}

STAGE 15 — VALUE ATTRIBUTION BRIDGE
HARD RULE: no dollar enterprise value estimate is permitted unless each value driver connects: baseline → transformation effect → financial effect → valuation method.
If this chain cannot be fully constructed from available evidence, output the following string and set \`valueAttributionBridge\` to null:
"Value potential identified; insufficient evidence for defensible quantification."
Do NOT produce a dollar range without the complete bridge. Do NOT estimate.

STAGE 16 — TRANSFORMATION PROBABILITY
Output a probability (0–100%) tied to the SPECIFIC state transition identified in the GEVM — not generic company success probability.
Include: what evidence would move the probability up 10%, what evidence would move it down 10%.

FINAL COMPRESSION GATE
Before producing output, internally verify all of the following. Do not output until all pass:
- [ ] Exactly one governing mechanism selected (not several)
- [ ] Core structural problem is exactly one sentence
- [ ] VCC exists, is company-specific, and is measurable
- [ ] 3–7 principles displayed (not a registry dump)
- [ ] No NOT_ESTABLISHED construct has a numerical score
- [ ] No dollar estimate exists without a complete value attribution bridge
- [ ] No intervention fails the 20% company specificity test
- [ ] H2 and H3 are genuinely different from H1, not weaker versions
If any check fails, regenerate the failing section before outputting.

OUTPUT FORMAT

Return a single JSON object. The root object must contain exactly these
top-level keys — no nesting of blueprint or ontology inside dimensions:

{
  "lensEngineVersion": "v5.0",
  "governingMechanism": { ... },          // Stage 5
  "coreStructuralProblem": "...",         // Stage 6 — one sentence
  "valueConversionChain": { ... },        // Stage 7
  "ontologyRetrieval": [ ... ],           // Stage 8 — array of principles
  "adversarialDiagnosis": { ... },        // Stage 9
  "fiveNumbersThatMatter": [ ... ],       // Stage 10 — exactly 5 items
  "dimensions": [ ... ],                  // Stage 11 — TCS determinants only
                                          // NOT blueprint, NOT ontology
  "transformationBlueprint": {            // Stage 14 — TOP LEVEL, not inside dimensions
    "phases": [ ... ]
  },
  "valueAttributionBridge": null,         // Stage 15 — null if bridge not buildable
  "transformationProbability": 0,         // Stage 16 — integer 0-100
  "tcs_score": 0,                         // derived from dimensions via computeWeightedTCS
  "intelligence_score": 0,
  "absorbability_score": 0,
  "trust_score": 0,
  "governance_score": 0,
  "courage_score": 0,
  "execution_score": 0
}

HARD RULE: \`transformationBlueprint\` is a top-level key. It must NEVER
appear inside the \`dimensions\` array. \`dimensions\` contains only the
TCS scoring determinants (intelligence, absorbability, trust, governance,
courage, execution, and any additional v5.0 dimensions). Blueprint phases
are not dimensions.

HARD RULE: \`ontologyRetrieval\` is a top-level key. It must NEVER appear
inside the \`dimensions\` array.

HARD RULE: if any required top-level key is missing from your output,
the output is invalid. Before returning, verify all top-level keys are
present at the root level of the JSON object.

Also populate the legacy scalar fields (\`tcs_score\`, \`intelligence_score\`,
\`absorbability_score\`, \`trust_score\`, \`governance_score\`, \`courage_score\`,
\`execution_score\`) by deriving them FROM the \`dimensions\` array for
backward compatibility with v4.0 consumers.
HARD RULE on legacy field derivation: if a clean mapping from the v5.0
dimensions array to the six legacy scalar fields cannot be constructed
without fabricating scores, set those fields to null rather than guessing.

Output ONLY valid JSON. Do not include markdown formatting,
code fences, or explanation outside the JSON object.
`;

export async function callLensEngineV5(
  query: string,
  groundTruth?: string,
  constitutionPrinciples?: undefined  // reserved for future dynamic injection
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  const systemPrompt = groundTruth
    ? `${groundTruth}\n\n---\n\n${LENS_SYSTEM_PROMPT_V5}`
    : LENS_SYSTEM_PROMPT_V5;

  const baseUrl = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_V5_MODEL ?? 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Execute the 16-stage Synthesis Engine sequence for: ${query}` }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  if (!data?.choices?.[0]?.message?.content) {
    console.error('[lens-ai-v5] OpenAI returned empty content:', JSON.stringify(data, null, 2));
  }
  return data?.choices?.[0]?.message?.content ?? null;
}

// ─── v5.0 Legacy Field Derivation ──────────────────────────────────────────────
// These helpers are pure functions — no side effects, no DB writes.

/**
 * Convert a numeric TCS score (0–100) to a RatingTier label.
 * Uses the official TCS™ Rating Bands from the v4.0 prompt:
 *   85–100 = Leading™
 *   75–84  = Transforming™
 *   65–74  = Advanced™
 *   55–64  = Developing™
 *   Below 55 = Emerging™
 */
export function numericToRatingTier(score: number): string {
  if (score >= 85) return 'Leading';
  if (score >= 75) return 'Transforming';
  if (score >= 65) return 'Advanced';
  if (score >= 55) return 'Developing';
  return 'Emerging';
}

/**
 * Compute a weighted TCS score from the v5.0 dimensions array.
 * Returns null if no dimensions have established confidence.
 */
export function computeWeightedTCS(
  dimensions?: LensSnapshot['dimensions']
): number | null {
  if (!dimensions || dimensions.length === 0) return null;
  // Support {score}, {value}, or {score} from {dimension, score} format from the model output
  const getScore = (d: any): number | null => {
    const s = d.score ?? d.value ?? null;
    return typeof s === 'number' ? s : null;
  };
  // If confidence field is absent (model omitted it), treat all dimensions as established
  const established = dimensions.filter(
    (d) => d.confidence !== 'NOT_ESTABLISHED' && getScore(d) != null
  );
  const allWithScore = dimensions.filter((d) => getScore(d) != null);
  const toUse = established.length > 0 ? established : allWithScore;
  if (toUse.length === 0) return null;
  const totalWeight = toUse.reduce((sum, d) => sum + (d.weight ?? 1), 0);
  if (totalWeight === 0) return null;
  return Math.round(
    toUse.reduce((sum, d) => sum + (getScore(d) as number) * (d.weight ?? 1), 0) / totalWeight
  );
}

/**
 * Map v5.0 dimensions array back to the six legacy scalar score fields.
 * Only sets a field when confidence is not NOT_ESTABLISHED.
 * Does NOT fabricate scores — leaves field unchanged if dimension is absent or unestablished.
 */
const LEGACY_FIELD_MAP: Record<string, keyof LensSnapshot> = {
  intelligence:  'intelligence_score',
  absorbability: 'absorbability_score',
  trust:         'trust_score',
  governance:    'governance_score',
  courage:       'courage_score',
  execution:     'execution_score',
};

const NUMERIC_FIELD_MAP: Record<string, keyof LensSnapshot> = {
  intelligence:  'intelligence_numeric',
  absorbability: 'absorbability_numeric',
  trust:         'trust_numeric',
  governance:    'governance_numeric',
  courage:       'courage_numeric',
  execution:     'execution_numeric',
};

export function deriveV5LegacyFields(snapshot: LensSnapshot): void {
  if (!snapshot.dimensions) return;
  // Support both {score} and {value} field names from the model output
  const getScore = (d: any): number | null => {
    const s = d.score ?? d.value ?? null;
    return typeof s === 'number' ? s : null;
  };
  for (const [slug, field] of Object.entries(LEGACY_FIELD_MAP)) {
    // Support multiple dimension key formats from the model output:
    // - {slug: "intelligence", score: 75}  (type definition format)
    // - {name: "intelligence_score", value: 75}  (model v5.0 format A)
    // - {dimension: "intelligence", score: 75}  (model v5.0 format B)
    const dim = snapshot.dimensions.find((d) => {
      const dimSlug = d.slug ?? '';
      const dimName = (d as any).name ?? '';
      const dimDimension = (d as any).dimension ?? '';
      return (
        dimSlug === slug ||
        dimDimension === slug ||
        dimName === slug ||
        dimName === `${slug}_score` ||
        dimName.replace(/_score$/, '') === slug ||
        dimDimension === `${slug}_score` ||
        dimDimension.replace(/_score$/, '') === slug
      );
    });
    const score = dim ? getScore(dim) : null;
    if (dim && score != null) {
      // Only skip if explicitly NOT_ESTABLISHED; if confidence is absent, treat as established
      if (dim.confidence !== 'NOT_ESTABLISHED') {
        (snapshot as any)[field] = score;
      }
    }
    // If NOT_ESTABLISHED or not found: leave null — do not fabricate a score
  }
  // Also populate *_numeric fields (used by TCS Scoring Breakdown in page.tsx)
  for (const [slug, field] of Object.entries(NUMERIC_FIELD_MAP)) {
    const dim = snapshot.dimensions.find((d) => {
      const dimSlug = d.slug ?? '';
      const dimName = (d as any).name ?? '';
      const dimDimension = (d as any).dimension ?? '';
      return (
        dimSlug === slug ||
        dimDimension === slug ||
        dimName === slug ||
        dimName === `${slug}_score` ||
        dimName.replace(/_score$/, '') === slug ||
        dimDimension === `${slug}_score` ||
        dimDimension.replace(/_score$/, '') === slug
      );
    });
    const score = dim ? getScore(dim) : null;
    if (dim && score != null && dim.confidence !== 'NOT_ESTABLISHED') {
      (snapshot as any)[field] = score;
    }
    // If NOT_ESTABLISHED or not found: leave null — do not fabricate
  }
  // Derive tcs_numeric from weighted average of established dimensions
  const weightedTCS = computeWeightedTCS(snapshot.dimensions);
  if (weightedTCS !== null) {
    snapshot.tcs_numeric = weightedTCS;
    // Always override tcs_score with the canonical RatingTier label derived from tcs_numeric.
    // The model may emit tcs_score as a number (e.g. 73) or '0' — neither is valid for the UI.
    // The UI expects: 'Emerging' | 'Developing' | 'Advanced' | 'Transforming' | 'Leading'
    (snapshot as any).tcs_score = numericToRatingTier(weightedTCS);
  }

  // ── Fix 4: Derive yield_score from TCS composite ──
  // yield_score (Transformation Yield™) mirrors the TCS RatingTier label.
  if (snapshot.tcs_score != null && typeof snapshot.tcs_score === 'string') {
    (snapshot as any).yield_score = snapshot.tcs_score;
  } else if (snapshot.tcs_numeric != null) {
    (snapshot as any).yield_score = numericToRatingTier(snapshot.tcs_numeric);
  }

  // ── Fix 3: Derive constraints[] from adversarialDiagnosis + VCC broken link ──
  {
    const constraints: string[] = [];
    // VCC broken link is the primary structural constraint
    if ((snapshot as any).valueConversionChain?.brokenLink) {
      constraints.push((snapshot as any).valueConversionChain.brokenLink);
    }
    // H1 unsupported assumptions surface the key constraint
    if ((snapshot as any).adversarialDiagnosis?.hypotheses) {
      const h1 = (snapshot as any).adversarialDiagnosis.hypotheses
        .find((h: any) => h.label === 'H1');
      if (h1?.unsupportedAssumptions) {
        constraints.push(h1.unsupportedAssumptions);
      }
    }
    if (constraints.length > 0) {
      (snapshot as any).constraints = constraints;
    }
  }

  // ── Fix 3: Derive opportunities[] from VCC nextRequiredState + governingMechanism ──
  {
    const opportunities: string[] = [];
    if ((snapshot as any).valueConversionChain?.nextRequiredState) {
      opportunities.push((snapshot as any).valueConversionChain.nextRequiredState);
    }
    if ((snapshot as any).governingMechanism?.requiredStateChange) {
      opportunities.push((snapshot as any).governingMechanism.requiredStateChange);
    }
    if (opportunities.length > 0) {
      (snapshot as any).opportunities = opportunities;
    }
  }
}
