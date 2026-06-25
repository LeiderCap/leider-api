export type RatingTier = 'Emerging' | 'Developing' | 'Advanced' | 'Transforming' | 'Leading';
export type ConfidenceLevel = 'Low' | 'Moderate' | 'High';
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
}
