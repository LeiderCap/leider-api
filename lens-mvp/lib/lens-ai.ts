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
  ticker: z.string().nullable().optional().default(''),
  industry: z.string().nullable().optional().default('Unknown'),
  description: z.string().nullable().optional(),
  
  tcs_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  
  intelligence_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  absorbability_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  trust_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  governance_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  courage_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  execution_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  
  yield_score: z.enum(['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading']),
  equity_reclamation: z.string().nullable().optional(),
  transformation_capacity_gap: z.enum(['Minimal', 'Moderate', 'Significant', 'Critical']),
  
  opportunity_value: z.string().nullable().optional(),
  confidence: z.enum(['Low', 'Moderate', 'High']),
  top_unlock: z.string().nullable().optional(),
  
  what_lens_sees: z.string().nullable().optional(),
  value_creation_model: z.string().nullable().optional(),
  hidden_assets: z.string().nullable().optional(),
  hidden_constraints: z.string().nullable().optional(),
  transformation_opportunities: z.string().nullable().optional(),
  analysis_summary: z.string().nullable().optional(),

  constraints: z.array(z.string()).min(1).max(5),
  opportunities: z.array(z.string()).min(1).max(5),
  summary: z.string().nullable().optional(),

  // v1.1 numerical scoring
  tcs_numeric: z.number().min(0).max(100),
  absorbability_numeric: z.number().min(0).max(100),
  governance_numeric: z.number().min(0).max(100),
  execution_numeric: z.number().min(0).max(100),
  trust_numeric: z.number().min(0).max(100),
  courage_numeric: z.number().min(0).max(100),
  intelligence_numeric: z.number().min(0).max(100),
  primary_constraint: z.string().nullable().optional(),
  secondary_constraint: z.string().nullable().optional(),
  system_constraint: z.string().nullable().optional(),
  gptp_stage: z.enum(['Substitution', 'Reorganization', 'Transformation']),
  transformation_momentum: z.enum(['Accelerating', 'Stable', 'Decelerating', 'Unknown']).default('Unknown'),
  opportunity_visibility_gap: z.enum(['High', 'Moderate', 'Low']).default('Moderate'),
  strategic_question: z.string().nullable().optional(),
  transformational_question: z.string().nullable().optional(),
  trust_quadrant: z.string().nullable().optional(),
  trust_quadrant_explanation: z.string().nullable().optional(),
  trust_alignment_gap: z.string().nullable().optional(),
  trust_alignment_explanation: z.string().nullable().optional(),

  // v1.8 Opportunity ID™
  opportunity_id: z.string().nullable().optional(),

  // v2.0 Sources / Citations
  sources: z.array(z.object({
    name: z.string(),
    year: z.string().nullable().optional(),
  })).nullable().optional(),

  // v1.9 Discovery Intelligence™
  discovery_intelligence: z.object({
    emerging_signals:          z.string().nullable().optional(),
    yet_opportunities:         z.string().nullable().optional(),
    discovery_gap:             z.string().nullable().optional(),
    recommended_experiments:   z.array(z.string()).nullable().optional(),
  }).nullable().optional(),

  // v1.7 Industry Translation Layer™
  detected_industry: z.string().nullable().optional(),
  // constraint_translations: individual keys may be null or absent when score >= 70
  constraint_translations: z.object({
    intelligence:   z.string().nullable().optional(),
    absorbability:  z.string().nullable().optional(),
    trust:          z.string().nullable().optional(),
    governance:     z.string().nullable().optional(),
    courage:        z.string().nullable().optional(),
    execution:      z.string().nullable().optional(),
  }).nullable().optional(),
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

IMPORTANT ARRAY LIMITS (strictly enforced):
- constraints: return EXACTLY 3 to 5 items. Never fewer than 3, never more than 5.
- opportunities: return EXACTLY 3 to 5 items. Never fewer than 3, never more than 5.

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
  "transformation_momentum": "Accelerating | Stable | Decelerating | Unknown",
  "opportunity_visibility_gap": "High | Moderate | Low",
  "strategic_question": "The single most important Class III Strategic Question™ this organization should be asking right now — specific to their actual situation, not generic.",
  "transformational_question": "The single Class IV Transformational Question™ that, if answered, would unlock the greatest transformation potential for this organization.",
  "trust_quadrant": "Rational Repair | Emotional Repair | Rational Replace | Emotional Replace | Mixed (only include when trust_numeric < 70, otherwise omit)",
  "trust_quadrant_explanation": "One sentence explaining what this trust quadrant means specifically for this organization in their industry language, not framework language. (only include when trust_numeric < 70)",
  "trust_alignment_gap": "High | Moderate | Low | None (only include when trust_numeric < 70, otherwise omit)",
  "trust_alignment_explanation": "One sentence describing the likely gap between where leadership thinks trust is and where stakeholders actually are. (only include when trust_numeric < 70)",

  "detected_industry": "The detected industry category — one of: Pharmaceutical / Life Sciences | Healthcare / Hospital Systems | Financial Services | Technology | Government / Public Sector | Real Estate | Manufacturing | Retail / Consumer | Energy | Education | Other",
  "constraint_translations": {
    "absorbability": "",
    "execution": "",
    "governance": "",
    "trust": "",
    "intelligence": "",
    "courage": ""
  },

  "opportunity_id": "OID-[YEAR]-[ENTITY]-[CATEGORY]-001 where YEAR=2026, ENTITY=3-6 letter uppercase code derived from the entity name (e.g. MSFT, FERRING, APPLE, ERIE, CA), CATEGORY=TCA|WFT|GOV|AI|TRU based on primary constraint (default TCA). Example: OID-2026-FERRING-TCA-001",
  "discovery_intelligence": {
    "emerging_signals": "2-3 sentences: what patterns are appearing in this company's market, technology adoption, or organizational behavior that signal emerging change",
    "yet_opportunities": "2-3 sentences: what opportunities may exist but are not currently being pursued by this company — adjacent markets, underutilized assets, or capabilities not yet deployed",
    "discovery_gap": "1-2 sentences: what future value appears underexplored or invisible to current leadership based on the TCS™ profile",
    "recommended_experiments": ["3 specific, low-cost, time-bounded experiments this company could run to test undiscovered opportunities — each as a complete action sentence"]
  },
  "sources": [
    { "name": "Publication Name", "year": "2024" }
  ]
}

CONSTRAINT_TRANSLATIONS INSTRUCTION:
For each of the six domains (absorbability, execution, governance, trust, intelligence, courage),
check the corresponding numeric score. If the score is below 70, populate the constraint_translations
field for that domain with the industry-specific translation text from the INDUSTRY TRANSLATION LAYER
section of this prompt. If the score is 70 or above, set the field to an empty string "".
IMPORTANT: Do NOT echo these instructions into the output. Do NOT write phrases like
"only include if absorbability_numeric < 70" or "Industry-specific translation of the X constraint"
in any output field. Generate the actual translated text or leave the field empty.

IMPORTANT: The following fields must be returned with EXACT values as listed below.
Do not paraphrase, abbreviate, capitalize differently, or use any other value.

trust_quadrant must be exactly one of (when trust_numeric < 70):
"Rational Repair", "Emotional Repair", "Rational Replace", "Emotional Replace", "Mixed"

trust_alignment_gap must be exactly one of (when trust_numeric < 70):
"High", "Moderate", "Low", "None"

transformation_momentum must be exactly one of:
"Accelerating", "Stable", "Decelerating", "Unknown"

opportunity_visibility_gap must be exactly one of:
"High", "Moderate", "Low"

For opportunity_visibility_gap:
- High = large gap between available and visible opportunities; significant hidden value exists
- Moderate = some opportunities visible, others hidden; partial visibility
- Low = organization has good visibility into its own opportunities; gap is small

QUESTION SCARCITY PRINCIPLE™ (QSP™):
Your purpose is not to generate answers. Your purpose is to help discover better questions.

For strategic_question: Identify the single most important Class III Strategic Question™ this
organization needs to be asking that it is probably not asking. Class III questions are designed
to reveal opportunities: What are we missing? What assumptions are constraining us? Where is
value trapped? Make it specific to this organization's actual situation.

For transformational_question: Identify the single Class IV Transformational Question™ that
would unlock disproportionate value if this organization could answer it. Class IV questions
expand possibility space: What becomes possible if this constraint disappears? What transformation
would create disproportionate value? What future can now be created that was previously impossible?

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

---

N-OF-1 TRANSFORMATION PRINCIPLE™

If the query is about an individual person, career, personal goal, or individual challenge
(e.g. "John Smith", "my career", "becoming a CEO", "personal leadership development"):

- Apply Human Transformation Intelligence™ (HTI™) framing throughout all narrative fields
- Replace organizational language with personal language in what_lens_sees, hidden_assets,
  hidden_constraints, transformation_opportunities, and analysis_summary
- TCS™ becomes HTC™ (Human Transformation Capacity™) — score the individual's capacity to
  learn, adapt, absorb change, integrate capability, and sustain improvement
- Constraints become personal capability gaps, not organizational bottlenecks
- top_unlock becomes the individual's highest-leverage personal transformation opportunity
- what_lens_sees should address the individual directly — what does The Lens™ see about
  this specific person's transformation potential?
- The six domains still apply but through a personal lens:
  Absorbability™ = Learning Capacity™ (how quickly they absorb new ideas)
  Governance™ = Self-Direction™ (how effectively they authorize their own change)
  Execution™ = Follow-Through™ (their ability to complete what they start)
  Trust™ = Relationship Capital™ (the strength of their network)
  Courage™ = Action Bias™ (their willingness to act on what they know)
  Intelligence™ = Self-Awareness™ (their ability to generate personal insight)

This is the N-of-1 Transformation™ principle: every individual requires a unique
transformation pathway. Population averages explain behavior. They rarely optimize
transformation. HTI™ optimizes for the individual.

---

TRUST QUADRANT PRINCIPLE™ (TQP™)

CRITICAL — PUBLIC SIGNALS ONLY:
You do NOT have access to internal company information. You only have access to publicly
available signals such as: public reviews (Glassdoor, Indeed, etc.), news coverage, leadership
communications, public statements, earnings calls, hiring patterns, and industry context.

Never phrase trust or culture conclusions as if you have direct knowledge of internal team
dynamics. Never say things like "among team members" or "within the organization" as if
reporting from inside. Never claim to know what employees feel or what leadership believes
internally.

Instead, frame all trust, culture, and governance sections as inferences from public signals:
- "Based on publicly available information, this suggests..."
- "Public signals point to..."
- "Available indicators suggest..."
- "Limited public data makes this difficult to assess directly, but..."

If the company is small, private, or has limited public footprint (solo-founder, startup,
private company with few public reviews or press mentions), explicitly note that confidence
is lower due to limited available data. Do not generate confident claims anyway.

Correct: "Based on available public information, this organization may benefit from both
structural clarity and stronger alignment communication — though limited public data on
internal dynamics means this assessment carries lower confidence."

Incorrect (do NOT use): "This indicates a need for emotional repair through fostering empathy
and alignment among team members."

Tie every trust and culture claim to the existing confidence marker system: use — Low Confidence
for companies with limited public footprint, — Moderate Confidence for inferences from partial
public signals, and — High Confidence only when multiple reputable public sources directly
address the trust or culture situation.

When trust_numeric is below 70, identify which Trust Quadrant the organization is operating in
and populate all four trust quadrant fields. When trust_numeric is 70 or above, omit all four
trust quadrant fields from the response.

Quadrant I — Rational Repair™
"The system works but needs improvement."
Stakeholders believe problems are solvable through evidence and incremental change.
Signs: operational friction, process complaints, efficiency gaps.

Quadrant II — Emotional Repair™
"The system may work but I need to believe you care."
Stakeholders seek empathy, alignment, shared values.
Signs: workforce disengagement, culture complaints, communication breakdowns.

Quadrant III — Rational Replace™
"The current system cannot achieve the desired outcome."
Stakeholders believe structural change is required.
Signs: calls for new operating models, platform replacement discussions, disruption vulnerability.

Quadrant IV — Emotional Replace™
"The existing system has lost legitimacy."
Stakeholders seek accountability, renewal, symbolic change.
Signs: leadership crisis, institutional distrust, identity challenges.

For trust_alignment_gap:
- High = leadership and stakeholders are operating from fundamentally different trust assumptions
- Moderate = some misalignment exists; leadership may be underestimating the depth of trust deficit
- Low = leadership has reasonable awareness of the trust situation
- None = trust is strong (use only when trust_numeric >= 70)

For trust_quadrant_explanation: translate the quadrant into the organization's specific industry
language. Do not use the quadrant name or framework terminology in the explanation.
Frame the explanation as inference from public signals, not internal knowledge. Begin with
phrasing like "Based on available public information..." or "Public signals suggest..."
For companies with limited public footprint, add a note that confidence is lower.

For trust_alignment_explanation: describe the likely gap between where leadership thinks trust
is and where stakeholders actually are — but only based on publicly observable signals such as
public statements, Glassdoor reviews, news coverage, or analyst commentary. Never claim to know
what leadership privately believes. Use hedged language: "Available signals suggest...",
"Public indicators point to...", or "Based on limited public data, this is difficult to assess
directly, but..."

---

INDUSTRY TRANSLATION LAYER™

For every constrained domain (score below 70), detect the organization's industry and apply
the closest industry-specific translation below. Use this translation as the primary language
in constraint diagnostics, hidden_constraints, and analysis narrative fields.
NEVER use the generic framework term (e.g. "Absorbability constrained") as the primary
user-facing text. Always translate into the industry's natural language.

Industry detection: infer from the entity's business model, products, services, and sector.
Match to the closest industry below. Use DEFAULT if no close match exists.

---

ABSORBABILITY TRANSLATIONS:

PHARMACEUTICAL / LIFE SCIENCES:
Absorbability constrained →
"New scientific intelligence is being generated faster than the organization can operationalize it. Clinical insights from one program aren't reaching the teams running adjacent programs. AI tools are being deployed but adoption is inconsistent across functions. The organization is consuming intelligence without transforming it into capability."

HEALTHCARE / HOSPITAL SYSTEMS:
Absorbability constrained →
"New clinical protocols, technologies, and care models are being introduced faster than staff can absorb them. Change fatigue is real. Training programs aren't keeping pace with transformation requirements. Care quality varies because intelligence absorption is uneven across the system."

FINANCIAL SERVICES:
Absorbability constrained →
"New regulatory requirements, market intelligence, and technology capabilities are arriving faster than the organization can integrate them. Teams are overwhelmed by the volume of change. New tools are deployed but not fully adopted. Intelligence exists but isn't becoming capability."

TECHNOLOGY:
Absorbability constrained →
"The organization is adopting new tools, platforms, and methodologies faster than teams can effectively integrate them. Technical debt is accumulating. New capabilities are deployed before existing ones are fully leveraged. Speed of adoption is outpacing depth of adoption."

GOVERNMENT / PUBLIC SECTOR:
Absorbability constrained →
"Policy changes, new mandates, and technology deployments are arriving faster than agencies can absorb them. Workforce training isn't keeping pace. New systems are implemented but adoption is shallow. The organization struggles to operationalize what it receives."

REAL ESTATE:
Absorbability constrained →
"Market intelligence, new technologies, and changing tenant requirements are arriving faster than the organization can integrate them into operations and strategy. PropTech tools are deployed but underutilized. Data exists but isn't becoming decisions."

MANUFACTURING:
Absorbability constrained →
"New automation technologies, process improvements, and operational intelligence are being introduced faster than the workforce can absorb them. Implementation quality varies across facilities. New systems go live before old ones are fully optimized."

RETAIL / CONSUMER:
Absorbability constrained →
"Consumer intelligence, new channels, and technology platforms are arriving faster than the organization can act on them. Data is abundant but insight extraction is slow. New tools are deployed before existing capabilities are fully leveraged."

ENERGY:
Absorbability constrained →
"New technologies, regulatory requirements, and market intelligence are arriving faster than the organization can integrate them. Transition-related capability development is not keeping pace with transition speed."

EDUCATION:
Absorbability constrained →
"New teaching methodologies, technologies, and student outcome data are arriving faster than faculty and staff can absorb them. Professional development isn't keeping pace. Innovation is happening at the edges but not scaling to the institution."

DEFAULT:
Absorbability constrained →
"The organization is receiving more intelligence than it can effectively operationalize. New tools, processes, and capabilities are being introduced faster than people can absorb them. The result is shallow adoption, inconsistent implementation, and intelligence that exists but doesn't become capability."

---

EXECUTION TRANSLATIONS:

PHARMACEUTICAL / LIFE SCIENCES:
Execution constrained →
"Programs are moving through development more slowly than the science warrants. Trial execution has preventable delays. Regulatory submissions take longer than industry benchmarks. Launch execution leaves early market share on the table. The organization plans well but implementation consistently falls short of potential."

HEALTHCARE / HOSPITAL SYSTEMS:
Execution constrained →
"Care delivery is inconsistent across settings, shifts, and providers. Quality improvement initiatives are launched but not sustained. Operational changes are implemented partially rather than fully. The gap between protocol and practice is wider than it should be."

FINANCIAL SERVICES:
Execution constrained →
"Product launches take longer than competitive timelines require. Risk management frameworks are designed well but implemented inconsistently. Client commitments aren't always followed through with the speed clients expect. Operational follow-through is the constraint, not strategy."

TECHNOLOGY:
Execution constrained →
"Product roadmap delivery is inconsistent. Features ship late or incomplete. Engineering velocity doesn't match market opportunity. The organization has strong product thinking but struggles to ship at the speed the market requires."

GOVERNMENT / PUBLIC SECTOR:
Execution constrained →
"Programs are designed well but implemented inconsistently. Citizen outcomes vary significantly from what program design intended. Budget is allocated but not deployed effectively. The gap between policy intent and program reality is material."

REAL ESTATE:
Execution constrained →
"Development projects run over budget or timeline more often than industry benchmarks. Asset management decisions aren't implemented with the speed market conditions require. Leasing and disposition execution leaves value unrealized."

MANUFACTURING:
Execution constrained →
"Production targets are missed more often than operational data would predict. Quality systems are designed well but implementation is uneven. Continuous improvement initiatives are launched but not sustained. Operational follow-through is inconsistent across shifts and facilities."

RETAIL / CONSUMER:
Execution constrained →
"Promotional execution is inconsistent across channels and markets. Merchandising strategy doesn't always reach the shelf as designed. New product launches underperform their potential due to execution gaps rather than demand gaps."

ENERGY:
Execution constrained →
"Project delivery timelines and budgets are inconsistent. Operational performance varies more than asset quality would predict. Maintenance and improvement programs are designed well but implemented unevenly."

EDUCATION:
Execution constrained →
"Curriculum improvements are designed but not consistently implemented. Student support programs exist but aren't reliably delivered. The gap between institutional intent and student experience is wider than it needs to be."

DEFAULT:
Execution constrained →
"The organization plans well but consistently falls short in implementation. Initiatives launch but don't sustain. Commitments are made but delivery is uneven. The constraint is not strategy or intelligence — it is the capacity to convert plans into realized outcomes consistently and at scale."

---

GOVERNANCE TRANSLATIONS:

PHARMACEUTICAL / LIFE SCIENCES:
Governance constrained →
"Scientific insights are moving too slowly from discovery to commercial strategy. R&D, regulatory, and commercial teams are operating from different intelligence — creating misalignment that costs pipeline velocity and market timing. Decision rights are unclear at critical program inflection points."

HEALTHCARE / HOSPITAL SYSTEMS:
Governance constrained →
"Clinical decision-making and administrative decision-making are misaligned. Physician intelligence isn't flowing into operational strategy fast enough. Committee structures are creating decision delays that affect care quality and operational performance."

FINANCIAL SERVICES:
Governance constrained →
"Risk decisions and growth decisions are operating from different frameworks. Intelligence generated in risk isn't informing product strategy. Approval processes are creating delays that cost competitive positioning."

TECHNOLOGY:
Governance constrained →
"Product, engineering, and go-to-market are moving at different velocities. Customer intelligence generated in sales isn't reaching product roadmap decisions fast enough. Decision rights between business units are creating coordination friction."

GOVERNMENT / PUBLIC SECTOR:
Governance constrained →
"Policy decisions are being made without sufficient operational intelligence. Program outcomes aren't feeding back into policy design. Inter-agency coordination is creating gaps where accountability is unclear."

REAL ESTATE:
Governance constrained →
"Investment decisions are moving slower than market opportunities require. Deal intelligence isn't flowing from acquisitions to asset management. Decision rights between partners, operators, and investors are creating friction."

MANUFACTURING:
Governance constrained →
"Operational decisions are moving through approval structures slower than production requirements demand. Quality and safety governance is strong but strategic governance is fragmented. Cross-facility coordination creates decision delays."

RETAIL / CONSUMER:
Governance constrained →
"Brand, merchandising, and supply chain decisions are misaligned. Market intelligence from stores isn't reaching category strategy fast enough. Decision velocity is slower than consumer and competitive dynamics require."

ENERGY:
Governance constrained →
"Capital allocation decisions are moving slower than market opportunities require. Regulatory and operational decision-making are not well coordinated. Project governance creates delays that cost competitive positioning."

EDUCATION:
Governance constrained →
"Academic and administrative decision-making are misaligned. Faculty intelligence isn't flowing into institutional strategy. Committee structures are slowing decisions that student outcomes require."

DEFAULT:
Governance constrained →
"Decision-making is slower and more fragmented than the organization's intelligence warrants. The right decisions aren't being made by the right people at the right time. Accountability is unclear at key decision points. The result is coordination friction that slows transformation."

---

TRUST TRANSLATIONS:

PHARMACEUTICAL / LIFE SCIENCES:
Trust constrained →
"Cross-functional alignment is breaking down between R&D, regulatory affairs, and commercial. Clinical learnings aren't feeding back into trial design. Regulatory intelligence isn't informing R&D priorities. The functions that need to operate as one system are operating as separate organizations."

HEALTHCARE / HOSPITAL SYSTEMS:
Trust constrained →
"Care coordination is breaking down between departments, shifts, and care settings. Patient intelligence isn't following the patient through the system. Provider trust in administrative decisions is low. The system knows more than it acts on because trust deficits prevent coordination."

FINANCIAL SERVICES:
Trust constrained →
"Client intelligence isn't flowing from relationship managers to product teams. Internal trust between business lines is creating information hoarding. The organization knows more about clients and markets than it acts on."

TECHNOLOGY:
Trust constrained →
"Cross-functional execution is breaking down. Engineering doesn't trust product prioritization. Sales doesn't trust product timelines. Leadership alignment is inconsistent. Teams are building in parallel rather than in sequence."

GOVERNMENT / PUBLIC SECTOR:
Trust constrained →
"Inter-agency trust deficits are preventing intelligence sharing. Citizens don't trust program communications. Internal trust between political and operational leadership is creating execution gaps."

REAL ESTATE:
Trust constrained →
"Operator, investor, and tenant intelligence is fragmented. Partner alignment is inconsistent. The organization isn't acting on what it knows about market conditions because trust deficits prevent coordination."

MANUFACTURING:
Trust constrained →
"Operations, quality, and commercial teams aren't operating from shared intelligence. Frontline operational knowledge isn't flowing to strategic decision-making. Management and workforce trust deficits are limiting transformation capacity."

RETAIL / CONSUMER:
Trust constrained →
"Store-level intelligence isn't flowing to corporate strategy. Brand and commercial teams aren't aligned. Consumer trust in the brand is under pressure. Internal misalignment is visible to customers."

ENERGY:
Trust constrained →
"Operational and strategic teams aren't operating from shared intelligence. Regulatory relationships require rebuilding. Community trust is affecting operating license. Internal alignment on transformation direction is inconsistent."

EDUCATION:
Trust constrained →
"Faculty don't trust administrative direction. Students don't trust institutional communications. Community trust in the institution's mission and outcomes is under pressure. Internal alignment is preventing transformation."

DEFAULT:
Trust constrained →
"The coordination infrastructure required for transformation is weak. Teams aren't operating from shared intelligence. Information is being hoarded rather than shared. The organization knows more than it acts on because trust deficits prevent the coordination transformation requires."

---

INTELLIGENCE TRANSLATIONS:

PHARMACEUTICAL / LIFE SCIENCES:
Intelligence constrained →
"Scientific knowledge is being generated but isn't becoming organizational capability. Insights from trials, regulatory submissions, and market interactions are leaking rather than compounding. AI tools are being deployed but the intelligence they generate isn't flowing to where decisions are made."

HEALTHCARE / HOSPITAL SYSTEMS:
Intelligence constrained →
"Clinical data is abundant but insight extraction is slow. Patient outcome intelligence isn't flowing to care protocol design. Operational data exists but isn't becoming operational decisions. The organization is data-rich and insight-poor."

FINANCIAL SERVICES:
Intelligence constrained →
"Market intelligence, client data, and risk signals exist but aren't flowing to where decisions are made. AI tools are deployed but intelligence generation is inconsistent. The organization is making decisions on less intelligence than it actually possesses."

TECHNOLOGY:
Intelligence constrained →
"Customer intelligence from support, sales, and usage data isn't flowing to product and engineering decisions fast enough. The organization is generating more user intelligence than it acts on. Decision support systems aren't keeping pace with the intelligence available."

GOVERNMENT / PUBLIC SECTOR:
Intelligence constrained →
"Program performance data exists but isn't flowing to policy decisions. Citizen intelligence isn't informing service design. The organization is measuring activity rather than outcomes. Available intelligence isn't becoming policy or operational decisions."

REAL ESTATE:
Intelligence constrained →
"Market data, tenant intelligence, and asset performance data exist but aren't flowing to investment and operational decisions fast enough. The organization is making decisions on less intelligence than the market provides."

MANUFACTURING:
Intelligence constrained →
"Operational data from the floor isn't flowing to strategic decisions. Quality and maintenance intelligence exists but isn't compounding into capability. The organization has more operational intelligence than it acts on."

RETAIL / CONSUMER:
Intelligence constrained →
"Consumer data, sales intelligence, and competitive signals exist but aren't flowing to category, brand, and supply chain decisions fast enough. The organization is generating more consumer intelligence than it acts on."

ENERGY:
Intelligence constrained →
"Operational, market, and regulatory intelligence exists but isn't flowing to strategic decisions fast enough. The organization is making capital allocation decisions on less intelligence than it actually possesses."

EDUCATION:
Intelligence constrained →
"Student outcome data, faculty intelligence, and market signals exist but aren't flowing to curriculum and institutional strategy decisions. The organization knows more about student needs than it acts on."

DEFAULT:
Intelligence constrained →
"The organization is generating more intelligence than it acts on. Data exists but insight extraction is slow. AI tools are deployed but intelligence isn't flowing to where decisions are made. The constraint is not intelligence availability — it is intelligence activation."

---

APPLICATION RULES FOR INDUSTRY TRANSLATIONS:

1. Detect the entity's industry from its business model, products, services, and sector.
2. For each constrained domain (score below 70), apply the industry-specific translation above.
3. Use the translation text in hidden_constraints and constraint diagnostic language.
4. The translation becomes the primary text the user reads — not the generic framework term.
5. Keep the framework term (e.g. "Governance™") as a label only.
6. Never output "Governance constrained" or "Absorbability constrained" as primary user-facing text.
7. Always translate into the industry's natural language.
8. If an entity spans multiple industries, use the closest primary industry match.

---

STEP 1 — PUBLIC/PRIVATE VERIFICATION (MANDATORY):

Determine whether this company is publicly traded BEFORE generating any analysis.

RULE 1 — TICKER IN QUERY: If the user's query contains a stock ticker symbol (1-5 uppercase
letters, e.g. "CYBN", "HCA", "MSFT", or with exchange prefix like "NYSE:HCA"), treat this as
DEFINITIVE PROOF the company is publicly traded. Set the ticker field to those letters.
NEVER use private-company language for any query that contains a ticker symbol.

RULE 2 — WELL-KNOWN PUBLIC COMPANIES: For large, well-known companies (Fortune 500, major
hospital systems, major banks, major tech companies), use your training knowledge to set the
correct ticker. Do not default to private-company messaging for companies you know are public.

RULE 3 — SMALL-CAP / UNKNOWN COMPANIES: For smaller or less-known companies where you are
uncertain, default to treating them as public if ANY of these are true:
- The query contains a ticker-pattern string (1-5 uppercase letters)
- The company name matches a known public company in your training data
- The query explicitly mentions NYSE, NASDAQ, or another exchange

Only use private-company fallback messaging when you have genuine reason to believe the company
is private AND the query contains no ticker-pattern input.

CRITICAL: A query like "CYBN" or "HCA" or "MSFT" is a ticker symbol. NEVER classify a
ticker-symbol query as a private company. This is the most important rule in this prompt.

If the company IS publicly traded:
- Set the "ticker" field to the confirmed ticker symbol (e.g. "HCA", "MSFT", "CYBN")
- Do NOT use any "private company" language anywhere in the output
- Do NOT set top_unlock to the private-company placeholder
- Proceed with full analysis

If the company is genuinely NOT publicly traded (no ticker, confirmed private):
- Set the "ticker" field to an empty string ""
- Use the private-company fallback text only for top_unlock and equity_reclamation

---

CITATION INSTRUCTIONS:

You have access to web search. Before generating your analysis, search for recent news,
financial data, earnings reports, and analyst coverage for the company. Use this information
to ground your analysis in current facts.

For every specific claim you make in the analysis fields (what_lens_sees, value_creation_model,
hidden_assets, hidden_constraints, transformation_opportunities, analysis_summary,
discovery_intelligence.emerging_signals, discovery_intelligence.yet_opportunities), add an
inline citation in this format: [Source: Publication Name, Year] immediately after the claim.

For the 4-6 most significant claims in the report — those that most affect the conclusions about
transformation potential (financial performance, strategic direction, transformation capacity) —
add a confidence marker immediately after the citation, like this:

[Source: Publication Name, Year] — High Confidence
[Source: Publication Name, Year] — Moderate Confidence
[Source: Publication Name, Year] — Low Confidence

Confidence criteria:
- High Confidence: directly stated in recent, reputable sources (earnings reports, official filings, major financial press)
- Moderate Confidence: reasonably inferred from available evidence but not explicitly confirmed
- Low Confidence: speculative or based on limited/older information

Do NOT add a confidence marker to every sentence. Reserve it for the 4-6 most significant claims only.

Example:
"The company reported revenue growth of 12% in fiscal 2024 [Source: Bloomberg, 2024] — High Confidence, driven primarily by expansion in its cloud division. Analysts suggest this growth may be difficult to sustain given increasing competitive pressure [Source: Wall Street Journal, 2024] — Moderate Confidence."

Search for:
- Recent earnings reports and financial performance
- Major strategic announcements
- Industry trends affecting this company
- Analyst ratings and price targets
- Any recent leadership changes or restructuring

Only cite real sources you find through web search. Do not fabricate citations.

After generating the analysis, populate the "sources" field with a deduplicated list of all
sources cited. Each source should be an object with "name" (publication/source name) and
"year" (year as string). Example:
"sources": [
  { "name": "Bloomberg", "year": "2024" },
  { "name": "Wall Street Journal", "year": "2024" }
]

If no specific sources were found through search, return an empty array for sources: []
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

/** Returns true if the query looks like a stock ticker (1-5 uppercase letters, optionally with exchange prefix like NYSE:CYBN) */
function looksLikeTicker(q: string): boolean {
  const clean = q.trim();
  // Matches: CYBN, HCA, MSFT, NYSE:CYBN, NASDAQ:MSFT, AMEX:CYBN
  return /^(?:(?:NYSE|NASDAQ|AMEX|NYSE\s*AMERICAN|TSX|LSE|ASX)\s*:?\s*)?([A-Z]{1,5})$/.test(clean);
}

/** Extract the raw ticker letters from a query like "NYSE:CYBN" or "CYBN" */
function extractTickerFromQuery(q: string): string {
  const m = q.trim().match(/([A-Z]{1,5})$/);
  return m ? m[1] : q.trim().toUpperCase();
}

/**
 * Deterministic name-to-ticker lookup table for well-known public companies.
 * Covers Fortune 500, common search targets, and companies previously misclassified.
 * Keys are lowercase normalized company names (no punctuation, no "inc"/"corp" suffixes).
 * This is the ONLY reliable fix for name-based searches — the AI cannot search the web.
 */
const NAME_TO_TICKER: Record<string, { ticker: string; exchange: string }> = {
  // Technology
  'microsoft': { ticker: 'MSFT', exchange: 'NASDAQ' },
  'apple': { ticker: 'AAPL', exchange: 'NASDAQ' },
  'google': { ticker: 'GOOGL', exchange: 'NASDAQ' },
  'alphabet': { ticker: 'GOOGL', exchange: 'NASDAQ' },
  'amazon': { ticker: 'AMZN', exchange: 'NASDAQ' },
  'meta': { ticker: 'META', exchange: 'NASDAQ' },
  'facebook': { ticker: 'META', exchange: 'NASDAQ' },
  'nvidia': { ticker: 'NVDA', exchange: 'NASDAQ' },
  'salesforce': { ticker: 'CRM', exchange: 'NYSE' },
  'oracle': { ticker: 'ORCL', exchange: 'NYSE' },
  'ibm': { ticker: 'IBM', exchange: 'NYSE' },
  'intel': { ticker: 'INTC', exchange: 'NASDAQ' },
  'amd': { ticker: 'AMD', exchange: 'NASDAQ' },
  'advanced micro devices': { ticker: 'AMD', exchange: 'NASDAQ' },
  'qualcomm': { ticker: 'QCOM', exchange: 'NASDAQ' },
  'cisco': { ticker: 'CSCO', exchange: 'NASDAQ' },
  'adobe': { ticker: 'ADBE', exchange: 'NASDAQ' },
  'servicenow': { ticker: 'NOW', exchange: 'NYSE' },
  'workday': { ticker: 'WDAY', exchange: 'NASDAQ' },
  'snowflake': { ticker: 'SNOW', exchange: 'NYSE' },
  'palantir': { ticker: 'PLTR', exchange: 'NYSE' },
  'confluent': { ticker: 'CFLT', exchange: 'NASDAQ' },
  'databricks': { ticker: 'DBX', exchange: 'NASDAQ' },
  'splunk': { ticker: 'SPLK', exchange: 'NASDAQ' },
  'twilio': { ticker: 'TWLO', exchange: 'NYSE' },
  'datadog': { ticker: 'DDOG', exchange: 'NASDAQ' },
  'cloudflare': { ticker: 'NET', exchange: 'NYSE' },
  'crowdstrike': { ticker: 'CRWD', exchange: 'NASDAQ' },
  'palo alto networks': { ticker: 'PANW', exchange: 'NASDAQ' },
  'fortinet': { ticker: 'FTNT', exchange: 'NASDAQ' },
  'veeva systems': { ticker: 'VEEV', exchange: 'NYSE' },
  'veeva': { ticker: 'VEEV', exchange: 'NYSE' },
  'sap': { ticker: 'SAP', exchange: 'NYSE' },
  'zoom': { ticker: 'ZM', exchange: 'NASDAQ' },
  'zoom video': { ticker: 'ZM', exchange: 'NASDAQ' },
  'slack': { ticker: 'WORK', exchange: 'NYSE' },
  'shopify': { ticker: 'SHOP', exchange: 'NYSE' },
  'square': { ticker: 'SQ', exchange: 'NYSE' },
  'block': { ticker: 'SQ', exchange: 'NYSE' },
  'stripe': { ticker: '', exchange: '' }, // private
  'uber': { ticker: 'UBER', exchange: 'NYSE' },
  'lyft': { ticker: 'LYFT', exchange: 'NASDAQ' },
  'airbnb': { ticker: 'ABNB', exchange: 'NASDAQ' },
  'doordash': { ticker: 'DASH', exchange: 'NYSE' },
  'instacart': { ticker: 'CART', exchange: 'NASDAQ' },
  'maplebear': { ticker: 'CART', exchange: 'NASDAQ' },
  'twitter': { ticker: 'X', exchange: 'PRIVATE' }, // now private
  'x': { ticker: '', exchange: '' }, // private
  'linkedin': { ticker: '', exchange: '' }, // owned by Microsoft, not separately listed
  'netflix': { ticker: 'NFLX', exchange: 'NASDAQ' },
  'spotify': { ticker: 'SPOT', exchange: 'NYSE' },
  'pinterest': { ticker: 'PINS', exchange: 'NYSE' },
  'snap': { ticker: 'SNAP', exchange: 'NYSE' },
  'snapchat': { ticker: 'SNAP', exchange: 'NYSE' },
  'reddit': { ticker: 'RDDT', exchange: 'NYSE' },
  'roblox': { ticker: 'RBLX', exchange: 'NYSE' },
  'unity': { ticker: 'U', exchange: 'NYSE' },
  'unity software': { ticker: 'U', exchange: 'NYSE' },
  'autodesk': { ticker: 'ADSK', exchange: 'NASDAQ' },
  'intuit': { ticker: 'INTU', exchange: 'NASDAQ' },
  'verisign': { ticker: 'VRSN', exchange: 'NASDAQ' },
  'akamai': { ticker: 'AKAM', exchange: 'NASDAQ' },
  'f5': { ticker: 'FFIV', exchange: 'NASDAQ' },
  'juniper networks': { ticker: 'JNPR', exchange: 'NYSE' },
  'hp': { ticker: 'HPQ', exchange: 'NYSE' },
  'hewlett packard': { ticker: 'HPQ', exchange: 'NYSE' },
  'hpe': { ticker: 'HPE', exchange: 'NYSE' },
  'hewlett packard enterprise': { ticker: 'HPE', exchange: 'NYSE' },
  'dell': { ticker: 'DELL', exchange: 'NYSE' },
  'dell technologies': { ticker: 'DELL', exchange: 'NYSE' },
  'vmware': { ticker: 'VMW', exchange: 'NYSE' },
  'broadcom': { ticker: 'AVGO', exchange: 'NASDAQ' },
  'micron': { ticker: 'MU', exchange: 'NASDAQ' },
  'micron technology': { ticker: 'MU', exchange: 'NASDAQ' },
  'western digital': { ticker: 'WDC', exchange: 'NASDAQ' },
  'seagate': { ticker: 'STX', exchange: 'NASDAQ' },
  'corning': { ticker: 'GLW', exchange: 'NYSE' },
  'applied materials': { ticker: 'AMAT', exchange: 'NASDAQ' },
  'lam research': { ticker: 'LRCX', exchange: 'NASDAQ' },
  'kla': { ticker: 'KLAC', exchange: 'NASDAQ' },
  'asml': { ticker: 'ASML', exchange: 'NASDAQ' },
  'tsmc': { ticker: 'TSM', exchange: 'NYSE' },
  'taiwan semiconductor': { ticker: 'TSM', exchange: 'NYSE' },
  'samsung': { ticker: '005930', exchange: 'KRX' },
  // Financial Services / Research
  'gartner': { ticker: 'IT', exchange: 'NYSE' },
  'factset': { ticker: 'FDS', exchange: 'NASDAQ' },
  'factset research': { ticker: 'FDS', exchange: 'NASDAQ' },
  'factset research systems': { ticker: 'FDS', exchange: 'NASDAQ' },
  'morningstar': { ticker: 'MORN', exchange: 'NASDAQ' },
  'bloomberg': { ticker: '', exchange: '' }, // private
  'refinitiv': { ticker: '', exchange: '' }, // owned by LSEG
  'msci': { ticker: 'MSCI', exchange: 'NYSE' },
  'sp global': { ticker: 'SPGI', exchange: 'NYSE' },
  's&p global': { ticker: 'SPGI', exchange: 'NYSE' },
  'moody': { ticker: 'MCO', exchange: 'NYSE' },
  "moody's": { ticker: 'MCO', exchange: 'NYSE' },
  'fitch': { ticker: '', exchange: '' }, // private
  'jpmorgan': { ticker: 'JPM', exchange: 'NYSE' },
  'jp morgan': { ticker: 'JPM', exchange: 'NYSE' },
  'goldman sachs': { ticker: 'GS', exchange: 'NYSE' },
  'morgan stanley': { ticker: 'MS', exchange: 'NYSE' },
  'bank of america': { ticker: 'BAC', exchange: 'NYSE' },
  'wells fargo': { ticker: 'WFC', exchange: 'NYSE' },
  'citigroup': { ticker: 'C', exchange: 'NYSE' },
  'citi': { ticker: 'C', exchange: 'NYSE' },
  'blackrock': { ticker: 'BLK', exchange: 'NYSE' },
  'vanguard': { ticker: '', exchange: '' }, // private/mutual
  'fidelity': { ticker: '', exchange: '' }, // private
  'charles schwab': { ticker: 'SCHW', exchange: 'NYSE' },
  'schwab': { ticker: 'SCHW', exchange: 'NYSE' },
  'td ameritrade': { ticker: '', exchange: '' }, // acquired by Schwab
  'ameriprise': { ticker: 'AMP', exchange: 'NYSE' },
  'raymond james': { ticker: 'RJF', exchange: 'NYSE' },
  'stifel': { ticker: 'SF', exchange: 'NYSE' },
  'piper sandler': { ticker: 'PIPR', exchange: 'NYSE' },
  'erie indemnity': { ticker: 'ERIE', exchange: 'NASDAQ' },
  'erie': { ticker: 'ERIE', exchange: 'NASDAQ' },
  'travelers': { ticker: 'TRV', exchange: 'NYSE' },
  'allstate': { ticker: 'ALL', exchange: 'NYSE' },
  'progressive': { ticker: 'PGR', exchange: 'NYSE' },
  'berkshire hathaway': { ticker: 'BRK.B', exchange: 'NYSE' },
  'berkshire': { ticker: 'BRK.B', exchange: 'NYSE' },
  'visa': { ticker: 'V', exchange: 'NYSE' },
  'mastercard': { ticker: 'MA', exchange: 'NYSE' },
  'american express': { ticker: 'AXP', exchange: 'NYSE' },
  'amex': { ticker: 'AXP', exchange: 'NYSE' },
  'paypal': { ticker: 'PYPL', exchange: 'NASDAQ' },
  'fiserv': { ticker: 'FI', exchange: 'NASDAQ' },
  'fis': { ticker: 'FIS', exchange: 'NYSE' },
  'jack henry': { ticker: 'JKHY', exchange: 'NASDAQ' },
  'ss&c technologies': { ticker: 'SSNC', exchange: 'NASDAQ' },
  'broadridge': { ticker: 'BR', exchange: 'NYSE' },
  'intercontinental exchange': { ticker: 'ICE', exchange: 'NYSE' },
  'nasdaq': { ticker: 'NDAQ', exchange: 'NASDAQ' },
  'cboe': { ticker: 'CBOE', exchange: 'CBOE' },
  'cme group': { ticker: 'CME', exchange: 'NASDAQ' },
  // Healthcare
  'hca healthcare': { ticker: 'HCA', exchange: 'NYSE' },
  'hca': { ticker: 'HCA', exchange: 'NYSE' },
  'unitedhealth': { ticker: 'UNH', exchange: 'NYSE' },
  'unitedhealth group': { ticker: 'UNH', exchange: 'NYSE' },
  'cvs health': { ticker: 'CVS', exchange: 'NYSE' },
  'cvs': { ticker: 'CVS', exchange: 'NYSE' },
  'cigna': { ticker: 'CI', exchange: 'NYSE' },
  'humana': { ticker: 'HUM', exchange: 'NYSE' },
  'elevance health': { ticker: 'ELV', exchange: 'NYSE' },
  'anthem': { ticker: 'ELV', exchange: 'NYSE' },
  'centene': { ticker: 'CNC', exchange: 'NYSE' },
  'molina healthcare': { ticker: 'MOH', exchange: 'NYSE' },
  'tenet healthcare': { ticker: 'THC', exchange: 'NYSE' },
  'tenet': { ticker: 'THC', exchange: 'NYSE' },
  'community health systems': { ticker: 'CYH', exchange: 'NYSE' },
  'universal health services': { ticker: 'UHS', exchange: 'NYSE' },
  'davita': { ticker: 'DVA', exchange: 'NYSE' },
  'fresenius': { ticker: 'FMS', exchange: 'NYSE' },
  'mckesson': { ticker: 'MCK', exchange: 'NYSE' },
  'amerisourcebergen': { ticker: 'ABC', exchange: 'NYSE' },
  'cardinal health': { ticker: 'CAH', exchange: 'NYSE' },
  'johnson & johnson': { ticker: 'JNJ', exchange: 'NYSE' },
  'johnson and johnson': { ticker: 'JNJ', exchange: 'NYSE' },
  'pfizer': { ticker: 'PFE', exchange: 'NYSE' },
  'merck': { ticker: 'MRK', exchange: 'NYSE' },
  'abbvie': { ticker: 'ABBV', exchange: 'NYSE' },
  'eli lilly': { ticker: 'LLY', exchange: 'NYSE' },
  'lilly': { ticker: 'LLY', exchange: 'NYSE' },
  'bristol myers squibb': { ticker: 'BMY', exchange: 'NYSE' },
  'amgen': { ticker: 'AMGN', exchange: 'NASDAQ' },
  'gilead': { ticker: 'GILD', exchange: 'NASDAQ' },
  'biogen': { ticker: 'BIIB', exchange: 'NASDAQ' },
  'regeneron': { ticker: 'REGN', exchange: 'NASDAQ' },
  'vertex': { ticker: 'VRTX', exchange: 'NASDAQ' },
  'vertex pharmaceuticals': { ticker: 'VRTX', exchange: 'NASDAQ' },
  'moderna': { ticker: 'MRNA', exchange: 'NASDAQ' },
  'biontech': { ticker: 'BNTX', exchange: 'NASDAQ' },
  'astrazeneca': { ticker: 'AZN', exchange: 'NASDAQ' },
  'novartis': { ticker: 'NVS', exchange: 'NYSE' },
  'roche': { ticker: 'RHHBY', exchange: 'OTC' },
  'sanofi': { ticker: 'SNY', exchange: 'NASDAQ' },
  'bayer': { ticker: 'BAYRY', exchange: 'OTC' },
  'cybin': { ticker: 'CYBN', exchange: 'NYSE AMERICAN' },
  'cybin inc': { ticker: 'CYBN', exchange: 'NYSE AMERICAN' },
  // Retail / Consumer
  'walmart': { ticker: 'WMT', exchange: 'NYSE' },
  'costco': { ticker: 'COST', exchange: 'NASDAQ' },
  'target': { ticker: 'TGT', exchange: 'NYSE' },
  'home depot': { ticker: 'HD', exchange: 'NYSE' },
  'lowes': { ticker: 'LOW', exchange: 'NYSE' },
  "lowe's": { ticker: 'LOW', exchange: 'NYSE' },
  'dollar general': { ticker: 'DG', exchange: 'NYSE' },
  'dollar tree': { ticker: 'DLTR', exchange: 'NASDAQ' },
  'kroger': { ticker: 'KR', exchange: 'NYSE' },
  'albertsons': { ticker: 'ACI', exchange: 'NYSE' },
  'walgreens': { ticker: 'WBA', exchange: 'NASDAQ' },
  'starbucks': { ticker: 'SBUX', exchange: 'NASDAQ' },
  'mcdonalds': { ticker: 'MCD', exchange: 'NYSE' },
  "mcdonald's": { ticker: 'MCD', exchange: 'NYSE' },
  'yum brands': { ticker: 'YUM', exchange: 'NYSE' },
  'restaurant brands': { ticker: 'QSR', exchange: 'NYSE' },
  'chipotle': { ticker: 'CMG', exchange: 'NYSE' },
  'nike': { ticker: 'NKE', exchange: 'NYSE' },
  'gap': { ticker: 'GPS', exchange: 'NYSE' },
  'pvh': { ticker: 'PVH', exchange: 'NYSE' },
  'ralph lauren': { ticker: 'RL', exchange: 'NYSE' },
  'tapestry': { ticker: 'TPR', exchange: 'NYSE' },
  'capri holdings': { ticker: 'CPRI', exchange: 'NYSE' },
  'kb home': { ticker: 'KBH', exchange: 'NYSE' },
  'kb homes': { ticker: 'KBH', exchange: 'NYSE' },
  'lennar': { ticker: 'LEN', exchange: 'NYSE' },
  'dr horton': { ticker: 'DHI', exchange: 'NYSE' },
  'pultegroup': { ticker: 'PHM', exchange: 'NYSE' },
  'toll brothers': { ticker: 'TOL', exchange: 'NYSE' },
  // Energy
  'exxon': { ticker: 'XOM', exchange: 'NYSE' },
  'exxonmobil': { ticker: 'XOM', exchange: 'NYSE' },
  'chevron': { ticker: 'CVX', exchange: 'NYSE' },
  'shell': { ticker: 'SHEL', exchange: 'NYSE' },
  'bp': { ticker: 'BP', exchange: 'NYSE' },
  'conocophillips': { ticker: 'COP', exchange: 'NYSE' },
  'pioneer natural resources': { ticker: 'PXD', exchange: 'NYSE' },
  'schlumberger': { ticker: 'SLB', exchange: 'NYSE' },
  'halliburton': { ticker: 'HAL', exchange: 'NYSE' },
  'baker hughes': { ticker: 'BKR', exchange: 'NASDAQ' },
  'nextera energy': { ticker: 'NEE', exchange: 'NYSE' },
  'duke energy': { ticker: 'DUK', exchange: 'NYSE' },
  'southern company': { ticker: 'SO', exchange: 'NYSE' },
  'dominion energy': { ticker: 'D', exchange: 'NYSE' },
  'american electric power': { ticker: 'AEP', exchange: 'NASDAQ' },
  // Transportation / Airlines
  'delta air lines': { ticker: 'DAL', exchange: 'NYSE' },
  'delta': { ticker: 'DAL', exchange: 'NYSE' },
  'united airlines': { ticker: 'UAL', exchange: 'NASDAQ' },
  'american airlines': { ticker: 'AAL', exchange: 'NASDAQ' },
  'southwest airlines': { ticker: 'LUV', exchange: 'NYSE' },
  'southwest': { ticker: 'LUV', exchange: 'NYSE' },
  'jetblue': { ticker: 'JBLU', exchange: 'NASDAQ' },
  'alaska airlines': { ticker: 'ALK', exchange: 'NYSE' },
  'union pacific': { ticker: 'UNP', exchange: 'NYSE' },
  'csx': { ticker: 'CSX', exchange: 'NASDAQ' },
  'norfolk southern': { ticker: 'NSC', exchange: 'NYSE' },
  'bnsf': { ticker: '', exchange: '' }, // owned by Berkshire
  'fedex': { ticker: 'FDX', exchange: 'NYSE' },
  'ups': { ticker: 'UPS', exchange: 'NYSE' },
  'united parcel service': { ticker: 'UPS', exchange: 'NYSE' },
  // Telecom
  'tmobile': { ticker: 'TMUS', exchange: 'NASDAQ' },
  't-mobile': { ticker: 'TMUS', exchange: 'NASDAQ' },
  'verizon': { ticker: 'VZ', exchange: 'NYSE' },
  'att': { ticker: 'T', exchange: 'NYSE' },
  'at&t': { ticker: 'T', exchange: 'NYSE' },
  'comcast': { ticker: 'CMCSA', exchange: 'NASDAQ' },
  'charter communications': { ticker: 'CHTR', exchange: 'NASDAQ' },
  'dish network': { ticker: 'DISH', exchange: 'NASDAQ' },
  // Industrial / Manufacturing
  'general electric': { ticker: 'GE', exchange: 'NYSE' },
  'ge': { ticker: 'GE', exchange: 'NYSE' },
  'honeywell': { ticker: 'HON', exchange: 'NASDAQ' },
  '3m': { ticker: 'MMM', exchange: 'NYSE' },
  'caterpillar': { ticker: 'CAT', exchange: 'NYSE' },
  'deere': { ticker: 'DE', exchange: 'NYSE' },
  'john deere': { ticker: 'DE', exchange: 'NYSE' },
  'emerson electric': { ticker: 'EMR', exchange: 'NYSE' },
  'parker hannifin': { ticker: 'PH', exchange: 'NYSE' },
  'illinois tool works': { ticker: 'ITW', exchange: 'NASDAQ' },
  'dover': { ticker: 'DOV', exchange: 'NYSE' },
  'xylem': { ticker: 'XYL', exchange: 'NYSE' },
  'roper technologies': { ticker: 'ROP', exchange: 'NASDAQ' },
  'danaher': { ticker: 'DHR', exchange: 'NYSE' },
  'thermo fisher': { ticker: 'TMO', exchange: 'NYSE' },
  'thermo fisher scientific': { ticker: 'TMO', exchange: 'NYSE' },
  'agilent': { ticker: 'A', exchange: 'NYSE' },
  'waters': { ticker: 'WAT', exchange: 'NYSE' },
  'mettler toledo': { ticker: 'MTD', exchange: 'NYSE' },
  'lockheed martin': { ticker: 'LMT', exchange: 'NYSE' },
  'boeing': { ticker: 'BA', exchange: 'NYSE' },
  'raytheon': { ticker: 'RTX', exchange: 'NYSE' },
  'rtx': { ticker: 'RTX', exchange: 'NYSE' },
  'northrop grumman': { ticker: 'NOC', exchange: 'NYSE' },
  'general dynamics': { ticker: 'GD', exchange: 'NYSE' },
  'l3harris': { ticker: 'LHX', exchange: 'NYSE' },
  // Consumer Goods
  'procter gamble': { ticker: 'PG', exchange: 'NYSE' },
  'procter & gamble': { ticker: 'PG', exchange: 'NYSE' },
  'colgate': { ticker: 'CL', exchange: 'NYSE' },
  'colgate palmolive': { ticker: 'CL', exchange: 'NYSE' },
  'unilever': { ticker: 'UL', exchange: 'NYSE' },
  'kimberly clark': { ticker: 'KMB', exchange: 'NYSE' },
  'church dwight': { ticker: 'CHD', exchange: 'NYSE' },
  'henkel': { ticker: 'HENKY', exchange: 'OTC' },
  'coca cola': { ticker: 'KO', exchange: 'NYSE' },
  'pepsi': { ticker: 'PEP', exchange: 'NASDAQ' },
  'pepsico': { ticker: 'PEP', exchange: 'NASDAQ' },
  'nestle': { ticker: 'NSRGY', exchange: 'OTC' },
  'mondelez': { ticker: 'MDLZ', exchange: 'NASDAQ' },
  'kraft heinz': { ticker: 'KHC', exchange: 'NASDAQ' },
  'general mills': { ticker: 'GIS', exchange: 'NYSE' },
  'kellogg': { ticker: 'K', exchange: 'NYSE' },
  'campbell soup': { ticker: 'CPB', exchange: 'NYSE' },
  'hershey': { ticker: 'HSY', exchange: 'NASDAQ' },
  'church & dwight': { ticker: 'CHD', exchange: 'NYSE' },
};

/**
 * Normalize a company name for lookup: lowercase, strip common suffixes,
 * remove punctuation except & and spaces.
 */
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,\.]/g, '')
    .replace(/\b(inc|corp|corporation|company|co|ltd|llc|plc|group|holdings|technologies|technology|systems|solutions|services|international|global|enterprises|partners|associates|industries|industries)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Look up a company name in the deterministic ticker table.
 * Returns { ticker, exchange } if found, null otherwise.
 */
function lookupTickerByName(query: string): { ticker: string; exchange: string } | null {
  const normalized = normalizeCompanyName(query);
  // Direct match
  if (NAME_TO_TICKER[normalized]) return NAME_TO_TICKER[normalized];
  // Partial match: check if any key is contained in the query or vice versa
  for (const [key, val] of Object.entries(NAME_TO_TICKER)) {
    if (val.ticker && (normalized.includes(key) || key.includes(normalized))) {
      return val;
    }
  }
  return null;
}

// ── v2.1 FMP-Anchored Unlock Potential™ ────────────────────────────────────────

interface FmpUnlockFinancials {
  marketCap: number | null;
  price: number | null;
  sector: string | null;
  peRatio: number | null;
  pbRatio: number | null;
  evToEbitda: number | null;
  returnOnEquity: number | null;
  freeCashFlowYield: number | null;
  priceChange1Y: number | null;
  priceChange3Y: number | null;
}

interface UnlockPotentialResult {
  unlock_potential_display: string;
  confidence: 'High' | 'Moderate' | 'Low';
  primary_driver: string;
  disclaimer: string;
}

async function fetchUnlockFinancials(ticker: string): Promise<FmpUnlockFinancials> {
  const apiKey = process.env.FMP_API_KEY;
  const base = 'https://financialmodelingprep.com/stable';
  const empty: FmpUnlockFinancials = {
    marketCap: null, price: null, sector: null, peRatio: null, pbRatio: null,
    evToEbitda: null, returnOnEquity: null, freeCashFlowYield: null,
    priceChange1Y: null, priceChange3Y: null,
  };
  if (!apiKey) return empty;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const [profileRes, metricsRes, priceRes] = await Promise.all([
      fetch(`${base}/profile?symbol=${ticker}&apikey=${apiKey}`, { signal: controller.signal }),
      fetch(`${base}/key-metrics?symbol=${ticker}&period=annual&limit=1&apikey=${apiKey}`, { signal: controller.signal }),
      fetch(`${base}/stock-price-change?symbol=${ticker}&apikey=${apiKey}`, { signal: controller.signal }),
    ]);
    clearTimeout(timeout);

    const [profileData, metricsData, priceData] = await Promise.all([
      profileRes.ok ? profileRes.json() : [],
      metricsRes.ok ? metricsRes.json() : [],
      priceRes.ok ? priceRes.json() : [],
    ]);

    const profile = Array.isArray(profileData) && profileData.length > 0 ? profileData[0] : {};
    const metrics = Array.isArray(metricsData) && metricsData.length > 0 ? metricsData[0] : {};
    const priceChange = Array.isArray(priceData) && priceData.length > 0 ? priceData[0] : {};

    return {
      marketCap: profile.marketCap ?? null,
      price: profile.price ?? null,
      sector: profile.sector ?? null,
      peRatio: metrics.peRatio ?? null,
      pbRatio: metrics.pbRatio ?? null,
      evToEbitda: metrics.evToEbitda ?? null,
      returnOnEquity: metrics.returnOnEquity ?? null,
      freeCashFlowYield: metrics.freeCashFlowYield ?? null,
      priceChange1Y: priceChange['1Y'] ?? null,
      priceChange3Y: priceChange['3Y'] ?? null,
    };
  } catch (err) {
    console.warn('[lens-ai] fetchUnlockFinancials failed for', ticker, err);
    return empty;
  }
}

function formatMarketCapDisplay(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

async function generateUnlockPotential(
  ticker: string,
  companyName: string,
  financials: FmpUnlockFinancials,
  tcgScore: string,
): Promise<UnlockPotentialResult | null> {
  const { marketCap, sector, peRatio, pbRatio, evToEbitda, returnOnEquity,
    freeCashFlowYield, priceChange1Y, priceChange3Y } = financials;

  // If we have no market cap we cannot anchor the estimate — skip
  if (!marketCap || marketCap <= 0) return null;

  const mcDisplay = formatMarketCapDisplay(marketCap);
  const pct = (v: number | null) => v !== null ? `${(v * 100).toFixed(1)}%` : 'N/A';
  const num = (v: number | null, dp = 1) => v !== null ? v.toFixed(dp) : 'N/A';

  const userPrompt = `Company: ${companyName} (${ticker})
Sector: ${sector ?? 'Unknown'}
Current Market Cap: ${mcDisplay}
P/E Ratio: ${num(peRatio)}
P/B Ratio: ${num(pbRatio)}
EV/EBITDA: ${num(evToEbitda)}
1Y Price Change: ${num(priceChange1Y)}%
3Y Price Change: ${num(priceChange3Y)}%
Free Cash Flow Yield: ${pct(freeCashFlowYield)}
Return on Equity: ${pct(returnOnEquity)}
Transformation Capacity Gap: ${tcgScore}

Using this data, estimate the Unlock Potential for this company.

The range must be anchored to the actual market cap (${mcDisplay}). A $5B company cannot have a $50B unlock potential. A $500B company will not have a $1.5B unlock potential.

Typical unlock ranges as % of market cap by Transformation Capacity Gap:
- Critical: 25-60% of market cap
- Significant: 15-35% of market cap
- Moderate: 10-25% of market cap
- Minimal: 5-15% of market cap

Return ONLY this JSON (no markdown, no preamble):
{
  "unlock_potential_display": "$[X]B\u2013$[Y]B",
  "confidence": "High|Moderate|Low",
  "primary_driver": "one sentence explaining the largest value gap driver",
  "disclaimer": "Lens-estimated value gap. Not a projection or investment recommendation."
}`;

  const systemPrompt = `You are The Lens™ enterprise value analyst. You estimate the Unlock Potential for publicly traded companies based on real financial data. Unlock Potential = the estimated gap between current enterprise value and potential enterprise value if transformation mechanisms are executed. This is a directional estimate with confidence levels, not a deterministic model. Return ONLY valid JSON. No markdown, no prose, no code fences.`;

  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          temperature: 0.1,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.content?.map((p: any) => p?.text ?? '').join('') ?? '';
        const parsed = JSON.parse(extractJson(text));
        return {
          unlock_potential_display: parsed.unlock_potential_display ?? '',
          confidence: parsed.confidence ?? 'Moderate',
          primary_driver: parsed.primary_driver ?? '',
          disclaimer: parsed.disclaimer ?? 'Lens-estimated value gap. Not a projection or investment recommendation.',
        };
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content ?? '';
        const parsed = JSON.parse(extractJson(text));
        return {
          unlock_potential_display: parsed.unlock_potential_display ?? '',
          confidence: parsed.confidence ?? 'Moderate',
          primary_driver: parsed.primary_driver ?? '',
          disclaimer: parsed.disclaimer ?? 'Lens-estimated value gap. Not a projection or investment recommendation.',
        };
      }
    }
  } catch (err) {
    console.warn('[lens-ai] generateUnlockPotential failed for', ticker, err);
  }
  return null;
}

function hasPrivateFallback(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('private companies require') ||
    lower.includes('appears to be a private company') ||
    lower.includes('request an enterprise analysis') ||
    lower.includes('request a blueprint') ||
    lower.includes('private company')
  );
}

export async function generateLensSnapshot(
  query: string,
  hint?: { ticker?: string; exchange?: string }
): Promise<LensSnapshot> {
  // ── PRE-GENERATION TICKER DETECTION ──────────────────────────────────────
  // Layer 0: Explicit hint from autocomplete selection (most reliable)
  // When a user selects from the FMP autocomplete, we pass the confirmed
  // ticker and exchange directly — bypassing all AI inference.
  const queryTrim = query.trim();
  const isTickerQuery = looksLikeTicker(queryTrim);

  let confirmedTicker: string | null = hint?.ticker ?? null;
  let confirmedExchange: string | null = hint?.exchange ?? null;
  if (confirmedTicker) {
    console.log('[lens-ai] Layer 0 hint: ticker=', confirmedTicker, 'exchange=', confirmedExchange);
  }

  // Layer 1: Ticker-pattern detection (e.g. "CYBN", "NYSE:HCA")
  if (!confirmedTicker) {
    confirmedTicker = isTickerQuery ? extractTickerFromQuery(queryTrim) : null;
  }

  // Layer 2: Name-based deterministic lookup (e.g. "gartner", "hca healthcare")
  // This is the fix for companies like Gartner (NYSE: IT) that the AI misclassifies
  // because it cannot search the web and doesn't reliably know unusual tickers.
  if (!confirmedTicker) {
    const nameMatch = lookupTickerByName(queryTrim);
    if (nameMatch && nameMatch.ticker) {
      confirmedTicker = nameMatch.ticker;
      confirmedExchange = nameMatch.exchange;
      console.log('[lens-ai] Name lookup match:', queryTrim, '→ ticker:', confirmedTicker, 'exchange:', confirmedExchange);
    } else if (nameMatch && !nameMatch.ticker) {
      // Explicitly known private company — skip enrichment
      console.log('[lens-ai] Name lookup: confirmed private company:', queryTrim);
    }
  }

  let enrichedQuery = queryTrim;
  if (confirmedTicker) {
    const exchangeHint = confirmedExchange ? ` on ${confirmedExchange}` : '';
    enrichedQuery = `${queryTrim} (stock ticker: ${confirmedTicker}${exchangeHint}, publicly traded — do NOT classify as private)`;
    console.log('[lens-ai] Pre-generation enrichment:', queryTrim, '→', enrichedQuery.slice(0, 100));
  }

  // Fetch FMP financials in parallel with the main AI call (for confirmed public tickers)
  const fmpFinancialsPromise = confirmedTicker
    ? fetchUnlockFinancials(confirmedTicker)
    : Promise.resolve(null);

  const [text, fmpFinancials] = await Promise.all([
    (async () => (await callAnthropic(enrichedQuery)) ?? (await callOpenAI(enrichedQuery)))(),
    fmpFinancialsPromise,
  ]);

  if (!text) {
    throw new Error('No AI provider configured. Add ANTHROPIC_API_KEY or OPENAI_API_KEY to .env.local.');
  }

  // Normalize AI output before Zod validation to handle casing/phrasing variations
  const TRUST_QUADRANT_MAP: Record<string, string> = {
    'rational repair':   'Rational Repair',
    'emotional repair':  'Emotional Repair',
    'rational replace':  'Rational Replace',
    'emotional replace': 'Emotional Replace',
    'mixed':             'Mixed',
  };
  const TRUST_ALIGNMENT_GAP_MAP: Record<string, string> = {
    'high':     'High',
    'moderate': 'Moderate',
    'low':      'Low',
    'none':     'None',
  };
  const TRANSFORMATION_MOMENTUM_MAP: Record<string, string> = {
    'accelerating': 'Accelerating',
    'stable':       'Stable',
    'decelerating': 'Decelerating',
    'unknown':      'Unknown',
  };
  const OVG_MAP: Record<string, string> = {
    'high':     'High',
    'moderate': 'Moderate',
    'low':      'Low',
  };

  const rawOutput = JSON.parse(extractJson(text));

  if (rawOutput.trust_quadrant) {
    rawOutput.trust_quadrant =
      TRUST_QUADRANT_MAP[rawOutput.trust_quadrant.toLowerCase().trim()] ??
      rawOutput.trust_quadrant;
  }
  if (rawOutput.trust_alignment_gap) {
    rawOutput.trust_alignment_gap =
      TRUST_ALIGNMENT_GAP_MAP[rawOutput.trust_alignment_gap.toLowerCase().trim()] ??
      rawOutput.trust_alignment_gap;
  }
  if (rawOutput.transformation_momentum) {
    rawOutput.transformation_momentum =
      TRANSFORMATION_MOMENTUM_MAP[rawOutput.transformation_momentum.toLowerCase().trim()] ??
      rawOutput.transformation_momentum;
  }
  if (rawOutput.opportunity_visibility_gap) {
    rawOutput.opportunity_visibility_gap =
      OVG_MAP[rawOutput.opportunity_visibility_gap.toLowerCase().trim()] ??
      rawOutput.opportunity_visibility_gap;
  }

  // Truncate arrays that have .max() limits in the Zod schema
  if (Array.isArray(rawOutput.constraints) && rawOutput.constraints.length > 5) {
    rawOutput.constraints = rawOutput.constraints.slice(0, 5);
  }
  if (Array.isArray(rawOutput.opportunities) && rawOutput.opportunities.length > 5) {
    rawOutput.opportunities = rawOutput.opportunities.slice(0, 5);
  }

  // ── POST-GENERATION CLASSIFICATION OVERRIDE ─────────────────────────────────
  // If we confirmed a ticker pre-generation but the AI still produced private-company
  // fallback language (e.g. for obscure small-caps like CYBN), override it here.
  const aiTicker = rawOutput.ticker || '';
  const effectiveTicker = confirmedTicker || (aiTicker && !hasPrivateFallback(aiTicker) ? aiTicker : null);

  if (confirmedTicker && hasPrivateFallback(rawOutput.top_unlock ?? '')) {
    console.log('[lens-ai] POST-GENERATION OVERRIDE: AI returned private fallback for confirmed public ticker', confirmedTicker, '— overriding top_unlock');
    rawOutput.ticker = confirmedTicker;
    rawOutput.top_unlock = `Accelerate transformation by leveraging ${confirmedTicker}'s public market position — identify the highest-leverage capability gap between current TCS profile and sector leaders to unlock measurable equity value.`;
    rawOutput.equity_reclamation = rawOutput.equity_reclamation && !hasPrivateFallback(rawOutput.equity_reclamation)
      ? rawOutput.equity_reclamation
      : '5%-15%';
    rawOutput.opportunity_value = rawOutput.opportunity_value && !hasPrivateFallback(rawOutput.opportunity_value)
      ? rawOutput.opportunity_value
      : 'Estimate requires full analysis — request a Blueprint™ for precise valuation.';
  }

  // Log final classification result for Vercel logs
  const finalTicker = rawOutput.ticker || '';
  const finalTopUnlock = rawOutput.top_unlock || '';
  const isPublic = !!finalTicker && !hasPrivateFallback(finalTopUnlock);
  console.log('[lens-ai] Classification result:', {
    query: queryTrim,
    confirmedTicker,
    aiTicker,
    finalTicker,
    isPublic,
    topUnlockPreview: finalTopUnlock.slice(0, 80),
  });

  const parsed = LensAiSchema.parse(rawOutput);
  // ID is always derived from the canonical company name returned by the AI.
  // This prevents collisions where short queries like "oak" produce the same
  // slug for unrelated companies (e.g. "Oaktree Capital" vs "Oak Street Health").
  // Tickers are intentionally NOT used as the primary ID source because two
  // different companies can share a ticker across exchanges.
  const id = slugify(parsed.name || query);

  // v2.1 FMP-anchored Unlock Potential™ — run after main parse so we have TCG
  let unlockResult: UnlockPotentialResult | null = null;
  if (confirmedTicker && fmpFinancials) {
    unlockResult = await generateUnlockPotential(
      confirmedTicker,
      parsed.name,
      fmpFinancials,
      parsed.transformation_capacity_gap,
    );
    if (unlockResult) {
      console.log('[lens-ai] Unlock Potential™ generated:', unlockResult.unlock_potential_display, 'confidence:', unlockResult.confidence);
    }
  }

  return {
    id,
    name: parsed.name,
    ticker: parsed.ticker || undefined,
    industry: parsed.industry ?? 'Unknown',
    description: parsed.description ?? '',
    logo_url: undefined,
    
    tcs_score: parsed.tcs_score,
    intelligence_score: parsed.intelligence_score,
    absorbability_score: parsed.absorbability_score,
    trust_score: parsed.trust_score,
    governance_score: parsed.governance_score,
    courage_score: parsed.courage_score,
    execution_score: parsed.execution_score,
    
    yield_score: parsed.yield_score,
    equity_reclamation: parsed.equity_reclamation ?? '',
    transformation_capacity_gap: parsed.transformation_capacity_gap,
    
    // v2.1: Use FMP-anchored range if available, fall back to AI estimate
    opportunity_value: unlockResult?.unlock_potential_display || parsed.opportunity_value || '',
    confidence: (unlockResult?.confidence ?? parsed.confidence) as 'Low' | 'Moderate' | 'High',
    top_unlock: parsed.top_unlock ?? '',
    unlock_primary_driver: unlockResult?.primary_driver ?? null,
    unlock_disclaimer: unlockResult?.disclaimer ?? null,
    
    // v1.2 Lens Analysis™ narrative fields
    what_lens_sees: parsed.what_lens_sees ?? '',
    value_creation_model: parsed.value_creation_model ?? '',
    hidden_assets: parsed.hidden_assets ?? '',
    hidden_constraints: parsed.hidden_constraints ?? '',
    transformation_opportunities: parsed.transformation_opportunities ?? '',
    analysis_summary: parsed.analysis_summary ?? '',

    constraints: parsed.constraints,
    opportunities: parsed.opportunities,
    summary: parsed.summary ?? '',

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
    opportunity_visibility_gap: parsed.opportunity_visibility_gap ?? 'Moderate',
    strategic_question: parsed.strategic_question,
    transformational_question: parsed.transformational_question,
    trust_quadrant: parsed.trust_quadrant,
    trust_quadrant_explanation: parsed.trust_quadrant_explanation,
    trust_alignment_gap: parsed.trust_alignment_gap,
    trust_alignment_explanation: parsed.trust_alignment_explanation,

    // v1.7 Industry Translation Layer™
    detected_industry: parsed.detected_industry,
    constraint_translations: parsed.constraint_translations,

    // v1.8 Opportunity ID™
    opportunity_id: parsed.opportunity_id ?? null,

    // v1.9 Discovery Intelligence™
    discovery_intelligence: parsed.discovery_intelligence ?? null,

    // v2.0 Sources / Citations
    sources: parsed.sources ?? null,

    updated_at: new Date().toISOString()
  };
}
