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
  primary_constraint?: string;
  secondary_constraint?: string;
  system_constraint?: string | null;
  gptp_stage?: 'Substitution' | 'Reorganization' | 'Transformation';
  transformation_momentum?: TransformationMomentum;
  opportunity_visibility_gap?: 'High' | 'Moderate' | 'Low';
  strategic_question?: string;
  transformational_question?: string;
  trust_quadrant?: string;
  trust_quadrant_explanation?: string;
  trust_alignment_gap?: string;
  trust_alignment_explanation?: string;

  // v1.7 Industry Translation Layer™
  detected_industry?: string;
  constraint_translations?: Record<string, string>;

  updated_at: string;
}
