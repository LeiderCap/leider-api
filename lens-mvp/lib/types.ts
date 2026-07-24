export type RatingTier = 'Emerging' | 'Developing' | 'Advanced' | 'Transforming' | 'Leading';
export type ConfidenceLevel = 'Low' | 'Moderate' | 'High';

export interface FinancialGroundingBundle {
  inputs: {
    enterprise_value: number | null;
    sector: string | null;
    mktCap: number | null;
    ebitda: number | null;
    ev_ebitda_current: number | null;
    data_completeness: 'complete' | 'partial';
  };
  peer_frontier: {
    peer_ev_ebitda_median: number | null;
    peer_source: 'fmp_sector_endpoint' | 'sector_fallback' | null;
    peer_count: number;
    trades_at_premium: boolean;
    ev_gap_base: number;
    ev_gap_upside: number;
  };
  equity_reclamation: {
    er_base: number | null;
    er_upside: number | null;
    er_source: 'multiple_gap' | 'operational_transformation' | null;
    eri_base: number | null;
    eri_upside: number | null;
    confidence: 'High' | 'Moderate-High' | 'Moderate' | 'Low';
    p_realization: number;
    mechanism_efficiency: number;
    derivation_method: string;
  };
  generated_at: string;
  fmp_data_completeness: 'complete' | 'partial';
}
export type CapacityGap = 'Minimal' | 'Moderate' | 'Significant' | 'Critical';
export type TransformationMomentum = 'Accelerating' | 'Stable' | 'Decelerating' | 'Unknown';

export type Company = {
  id: string;
  name: string;
  ticker?: string;
  industry: string;
  description: string;
  logo_url?: string;
};

export interface LensSnapshot {
  id: string;
  name: string;
  ticker?: string;
  industry: string;
  description: string;
  logo_url?: string;
  company_id?: string;

  // Primary headline score
  tcs_score: RatingTier;                    // Transformation Capacity Score™

  // Six TCS™ determinants
  intelligence_score: RatingTier;
  absorbability_score: RatingTier;
  trust_score: RatingTier;
  governance_score: RatingTier;
  courage_score: RatingTier;
  execution_score: RatingTier;

  // Supporting scores
  yield_score: RatingTier;                  // Transformation Yield™
  equity_reclamation: string;               // e.g. "12%" or "N/A"
  transformation_capacity_gap: CapacityGap; // TCG™

  // Opportunity
  opportunity_value: string;
  confidence: ConfidenceLevel;
  top_unlock: string;

  // Narrative
  what_lens_sees: string;
  value_creation_model: string;
  hidden_assets: string;
  hidden_constraints: string;
  transformation_opportunities: string;
  analysis_summary: string;
  
  // Legacy Narrative (kept for backwards compatibility during transition)
  constraints: string[];
  opportunities: string[];
  summary: string;

  // v1.1 numerical scoring
  tcs_numeric?: number;
  absorbability_numeric?: number;
  governance_numeric?: number;
  execution_numeric?: number;
  trust_numeric?: number;
  courage_numeric?: number;
  intelligence_numeric?: number;
  primary_constraint?: string | null;
  secondary_constraint?: string | null;
  system_constraint?: string | null;
  gptp_stage?: 'Substitution' | 'Reorganization' | 'Transformation';
  transformation_momentum?: TransformationMomentum;
  opportunity_visibility_gap?: 'High' | 'Moderate' | 'Low';
  strategic_question?: string | null;
  transformational_question?: string | null;
  trust_quadrant?: string | null;
  trust_quadrant_explanation?: string | null;
  trust_alignment_gap?: string | null;
  trust_alignment_explanation?: string | null;

  // v2.1 FMP-anchored Unlock Potential™
  unlock_primary_driver?: string | null;
  unlock_disclaimer?: string | null;
  unlock_source?: 'cashless_buyback' | 'lens_estimate' | null;
  unlock_market_cap?: string | null;       // e.g. "$150.2B"
  unlock_tier_label?: string | null;       // e.g. "Moderate"
  unlock_tier_pct_low?: number | null;     // e.g. 10
  unlock_tier_pct_high?: number | null;    // e.g. 25
  unlock_low?: string | null;              // e.g. "$15.0B"
  unlock_high?: string | null;             // e.g. "$37.5B"

  // v1.8 Opportunity ID™
  opportunity_id?: string | null;

  // v2.0 Sources / Citations
  sources?: { name: string; year?: string | null }[] | null;

  // v1.9 Discovery Intelligence™
  discovery_intelligence?: {
    emerging_signals?: string | null;
    yet_opportunities?: string | null;
    discovery_gap?: string | null;
    recommended_experiments?: string[] | null;
  } | null;

  // v1.7 Industry Translation Layer™
  detected_industry?: string | null;
  constraint_translations?: {
    intelligence?: string | null;
    absorbability?: string | null;
    trust?: string | null;
    governance?: string | null;
    courage?: string | null;
    execution?: string | null;
  } | null;

  updated_at: string;

  // v3.1 Expression Gap Analysis™ — 3-layer schema
  expression_gap_analysis?: {
    potential_layer?: {
      headline?: string | null;
      potential_enterprise_value?: string | null;
    } | null;
    expression_layer?: {
      primary_failure_mode?: string | null;
      failure_description?: string | null;
      secondary_failure_mode?: string | null;
      expression_gap_estimate?: string | null;
    } | null;
    reclamation_layer?: {
      primary_mechanism?: string | null;
      mechanism_rationale?: string | null;
      supporting_mechanisms?: string[] | null;
    } | null;
  } | null;
  // v4.0 Evidence Architecture™ + Truth Engine™ metadata
  evidence_architecture?: {
    absorbability?: {
      evidence?: Array<{ claim: string; sourceTitle: string; sourceType: string; confidence: number; groundTruthSupported: boolean }> | null;
      inferenceCount?: number | null;
      evidenceCount?: number | null;
      dimensionConfidence?: number | null;
    } | null;
    governance?: {
      evidence?: Array<{ claim: string; sourceTitle: string; sourceType: string; confidence: number; groundTruthSupported: boolean }> | null;
      inferenceCount?: number | null;
      evidenceCount?: number | null;
      dimensionConfidence?: number | null;
    } | null;
    execution?: {
      evidence?: Array<{ claim: string; sourceTitle: string; sourceType: string; confidence: number; groundTruthSupported: boolean }> | null;
      inferenceCount?: number | null;
      evidenceCount?: number | null;
      dimensionConfidence?: number | null;
    } | null;
    trust?: {
      evidence?: Array<{ claim: string; sourceTitle: string; sourceType: string; confidence: number; groundTruthSupported: boolean }> | null;
      inferenceCount?: number | null;
      evidenceCount?: number | null;
      dimensionConfidence?: number | null;
    } | null;
    courage?: {
      evidence?: Array<{ claim: string; sourceTitle: string; sourceType: string; confidence: number; groundTruthSupported: boolean }> | null;
      inferenceCount?: number | null;
      evidenceCount?: number | null;
      dimensionConfidence?: number | null;
    } | null;
    intelligence?: {
      evidence?: Array<{ claim: string; sourceTitle: string; sourceType: string; confidence: number; groundTruthSupported: boolean }> | null;
      inferenceCount?: number | null;
      evidenceCount?: number | null;
      dimensionConfidence?: number | null;
    } | null;
  } | null;
  groundTruthId?: string | null;
  lensVersion?: string | null;
  truthEngineVersion?: string | null;
  analysisGeneratedAt?: string | null;

  // v4.1 Financial Grounding Module™
  financial_grounding?: FinancialGroundingBundle | null;

  intermediary_systems_analysis?: {
    primary_intermediary_system?: {
      name?: string | null;
      description?: string | null;
      ise_score?: number | null;
      ise_label?: string | null;
    } | null;
    primary_friction_source?: {
      category?: string | null;
      description?: string | null;
    } | null;
    highest_leverage_improvement?: {
      action?: string | null;
      rationale?: string | null;
      estimated_ise_improvement?: string | null;
    } | null;
    enterprise_value_implication?: string | null;
    transformation_conversion_stack?: {
      transformation_capacity?: number | null;
      intermediary_system_efficiency?: number | null;
      narrative?: string | null;
    } | null;
  } | null;

  // ─── v5.0 Lens Synthesis Engine fields ─────────────────────────────────────
  // All fields below are optional and unused by v4.0 code paths.
  // Sprint: LSE-P1 — Phase 1: Foundation (additive only)

  // ─── v5.0 TCS Dimensions ─────────────────────────────────────────────────────
  // Matches model output: name + score + description only.
  // weight, slug, tiPrincipleId are not emitted by the model in v5.0.
  dimensions?: Array<{
    name: string;
    score: number;                    // 0–100
    description?: string;             // model-provided rationale for this score
    // Optional extended fields (may be present in future model versions)
    weight?: number;                  // 0–1
    slug?: string;
    confidence?: 'HIGH' | 'MODERATE' | 'LOW' | 'NOT_ESTABLISHED';
    tiPrincipleId?: string;           // e.g. "TI-015"
    evidence?: Array<{
      claim: string;
      source: string;
      confidence: string;
    }>;
  }>;

  // ─── v5.0 Governing Mechanism ─────────────────────────────────────────────
  // Model emits: { description, rationale } (not name/whyItMatters/etc.)
  governingMechanism?: {
    description: string;
    rationale?: string;
    // Optional extended fields
    name?: string;
    whyItMatters?: string;
    whyUnrealized?: string;
    requiredStateChange?: string;
  };

  coreStructuralProblem?: string;     // single sentence diagnostic

  // ─── v5.0 Strategic State Change (Stage 3) ────────────────────────────────
  // Populated when a material event occurred in the trailing 36 months.
  // null when no such event occurred — do not omit silently.
  strategicStateChange?: {
    preEventState: string;          // company state before the event
    event: string;                  // the material event (acquisition, divestiture, etc.)
    postEventState: string;         // company state after the event
    unresolvedConversionQuestion: string;  // the open question the market is pricing
  } | null;

  // ─── v5.0 Value Conversion Chain ──────────────────────────────────────────
  // Model emits nodes as string[] and brokenLink as a string description.
  valueConversionChain?: {
    nodes: Array<string | { label: string; measurable?: boolean }>;
    brokenLink?: string;
    currentPosition?: string;
    nextRequiredState?: string;
    evidenceTrigger?: string;
  };

  // ─── v5.0 Adversarial Diagnosis ───────────────────────────────────────────
  // Model emits as { H1: {...}, H2: {...}, H3: {...} } (keyed object, not array).
  adversarialDiagnosis?: {
    // Keyed format (model output)
    H1?: {
      description: string;
      evidenceCoverage: string;
      unsupportedAssumptions: string;
      measurablePredictions?: string;
      status?: 'LEADING' | 'PLAUSIBLE' | 'WEAKENING' | 'NOT_ESTABLISHED';
    };
    H2?: {
      description: string;
      evidenceCoverage: string;
      unsupportedAssumptions: string;
      measurablePredictions?: string;
      status?: 'LEADING' | 'PLAUSIBLE' | 'WEAKENING' | 'NOT_ESTABLISHED';
    };
    H3?: {
      description: string;
      evidenceCoverage: string;
      unsupportedAssumptions: string;
      measurablePredictions?: string;
      status?: 'LEADING' | 'PLAUSIBLE' | 'WEAKENING' | 'NOT_ESTABLISHED';
    };
    // Array format (alternative model output — both must be handled)
    hypotheses?: Array<{
      label: 'H1' | 'H2' | 'H3';
      description: string;
      evidenceCoverage: string;
      unsupportedAssumptions: string;
      status: 'LEADING' | 'PLAUSIBLE' | 'WEAKENING' | 'NOT_ESTABLISHED';
    }>;
  };

  // ─── v5.0 Five Numbers That Matter ────────────────────────────────────────
  // Model emits: { metric, evidenceState: 'INFERRED'|'OBSERVED'|..., importance }
  fiveNumbersThatMatter?: Array<{
    metric: string;
    evidenceState: 'OBSERVED' | 'PARTIAL' | 'UNAVAILABLE' | 'INFERRED';
    importance?: string;              // model field name
    whyItMatters?: string;           // alternative field name
  }>;

  // ─── v5.0 Ontology Retrieval ──────────────────────────────────────────────
  // Model emits: { principle, classification, rationale }
  ontologyRetrieval?: Array<{
    principle?: string;               // model field name
    tiPrincipleId?: string;          // alternative field name
    classification?: string;          // model field name (ACTIVE/SUPPORTING/etc.)
    state?: 'ACTIVE' | 'SUPPORTING' | 'CHALLENGER' | 'NOT_ESTABLISHED' | 'NOT_RELEVANT';
    rationale?: string;
    whyRelevant?: string;            // alternative field name
  }>;

  valueAttributionBridge?: Array<{
    valueDriver: string;
    baseline: string;
    transformationEffect: string;
    financialEffect: string;
    valuationMethod: string;
  }> | null;
  // NOTE: null when no defensible bridge exists.
  // Do NOT default to empty array — null is semantically distinct from [].

  lensEngineVersion?: 'v4.0' | 'v5.0';
  // Tags which architecture produced this snapshot.
  // All existing analyses are implicitly v4.0.
  // Do not backfill — leave existing records untagged.

  transformationBlueprint?: {
    phases: Array<{
      phase: string;
      objective: string;
      specificAction: string;
      measurement: string;
      enterpriseValueConsequence: string;
    }>;
  } | null;

  transformationProbability?: number | null;  // Stage 16 — integer 0-100

  // ─── v5.0 Lens Synthesis Engine fields above ───────────────────────────────
  // All fields below this line were present in v4.0 and must not be modified.
  // All fields above this line are optional and unused by v4.0 code paths.
}
