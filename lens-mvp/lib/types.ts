export type LensRating = 'Emerging' | 'Developing' | 'Advanced' | 'Transforming' | 'Leading';

export type Company = {
  id: string;
  name: string;
  ticker?: string;
  industry: string;
  description: string;
  logo_url?: string;
};

export type LensScore = {
  company_id?: string;
  transformation_rating: LensRating;
  trust_score: LensRating;
  courage_score: LensRating;
  yield_score: LensRating;
  equity_reclamation: string;
  opportunity_value: string;
  confidence: 'Low' | 'Moderate' | 'High';
  top_unlock: string;
  constraints: string[];
  opportunities: string[];
  summary: string;
  updated_at: string;
};

export type LensSnapshot = Company & LensScore;
