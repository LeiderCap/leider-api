export type RatingTier = 'Emerging' | 'Developing' | 'Advanced' | 'Transforming' | 'Leading';
export type ConfidenceLevel = 'Low' | 'Moderate' | 'High';
export type CapacityGap = 'Minimal' | 'Moderate' | 'Significant' | 'Critical';

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
  constraints: string[];
  opportunities: string[];
  summary: string;

  updated_at: string;
}
