-- The Lens™ — canonical staging baseline v1
-- STAGING ONLY. This file intentionally creates schema objects without historical
-- RLS policies. Apply security_hardening_v1.sql immediately afterward.
-- Do not execute against production.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  membership_level text DEFAULT 'free',
  clerk_user_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id text PRIMARY KEY,
  name text NOT NULL,
  ticker text,
  industry text,
  description text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lens_scores (
  company_id text PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  tcs_score text NOT NULL,
  intelligence_score text NOT NULL,
  absorbability_score text NOT NULL,
  trust_score text NOT NULL,
  governance_score text NOT NULL,
  courage_score text NOT NULL,
  execution_score text NOT NULL,
  yield_score text NOT NULL,
  equity_reclamation text,
  transformation_capacity_gap text NOT NULL,
  opportunity_value text,
  confidence text,
  top_unlock text,
  constraints jsonb DEFAULT '[]'::jsonb,
  opportunities jsonb DEFAULT '[]'::jsonb,
  summary text,
  tcs_numeric integer,
  absorbability_numeric integer,
  governance_numeric integer,
  execution_numeric integer,
  trust_numeric integer,
  courage_numeric integer,
  intelligence_numeric integer,
  primary_constraint text,
  secondary_constraint text,
  system_constraint text,
  gptp_stage text,
  what_lens_sees text,
  value_creation_model text,
  hidden_assets text,
  hidden_constraints text,
  transformation_opportunities text,
  analysis_summary text,
  transformation_momentum text,
  opportunity_visibility_gap text,
  strategic_question text,
  transformational_question text,
  trust_quadrant text,
  trust_quadrant_explanation text,
  trust_alignment_gap text,
  trust_alignment_explanation text,
  detected_industry text,
  constraint_translations jsonb,
  opportunity_id text,
  discovery_intelligence jsonb,
  sources jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  query text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  company_id text REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id)
);

CREATE TABLE IF NOT EXISTS public.watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.watchlist_companies (
  watchlist_id uuid REFERENCES public.watchlists(id) ON DELETE CASCADE,
  company_id text REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (watchlist_id, company_id)
);

CREATE TABLE IF NOT EXISTS public.enterprise_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text,
  name text,
  email text,
  organization text,
  company text,
  request_type text,
  message text,
  notes text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transformation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id text,
  entity_id text,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  feature text DEFAULT 'stack-the-deck',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.go_deep_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_input text NOT NULL,
  tcs_c_score integer,
  tier text,
  score_interpretation text,
  layers jsonb,
  builder jsonb,
  delta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('lens_card', 'go_deep_analysis', 'go_deep_rewrite', 'blueprint', 'mechanism_cashless_buyback')),
  title text,
  content jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  entity_name text,
  entity_type text,
  source_lens_card jsonb,
  blueprint jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lens_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  ticker text,
  user_email text,
  free_report_json jsonb,
  paid_report_json jsonb,
  payment_status text DEFAULT 'free',
  stripe_session_id text,
  stripe_customer_id text,
  session_id text,
  tier text DEFAULT 'single',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cached_stock_prices (
  ticker text PRIMARY KEY,
  price numeric NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.opportunity_zone_cache (
  ticker text PRIMARY KEY,
  company_name text,
  market_cap numeric,
  price_change_3y numeric,
  price_change_1y numeric,
  sector text,
  sector_median_return_3y numeric,
  fcf_yield numeric,
  share_count_trend text,
  valuation_discount_vs_sector numeric,
  segment_count integer,
  ceo_tenure_months integer,
  activist_present boolean DEFAULT false,
  operating_margin_trend text,
  revenue_growth_vs_sector text,
  peak_market_cap_10y numeric,
  franchise_age_years integer,
  opportunity_score numeric,
  zones_assigned text[],
  tier_assigned integer,
  cached_at timestamptz DEFAULT now(),
  narrative_why text,
  narrative_mechanisms text[],
  narrative_tier_label text
);

CREATE TABLE IF NOT EXISTS public.pe_stack_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  target_company text,
  layers_selected text[] DEFAULT '{}',
  message text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investor_stack_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  target_company text,
  layers_selected text[] DEFAULT '{}',
  message text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lens_retrieval_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  company_name text,
  query_used text,
  identity_status text,
  source_confidence numeric,
  business_description_confidence numeric,
  ticker_name_match boolean,
  minimum_sources_met boolean,
  identity_card jsonb,
  failure_reasons text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lens_retrieved_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES public.lens_retrieval_audits(id),
  ticker text NOT NULL,
  source_type text,
  title text,
  url text,
  relevance_score numeric,
  tokens_used integer,
  included_in_prompt boolean,
  excluded_reason text,
  retrieved_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lens_identity_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES public.lens_retrieval_audits(id),
  ticker text NOT NULL,
  legal_name text,
  exchange text,
  business_description text,
  products text[],
  customer_segments text[],
  revenue_model text[],
  markets_served text[],
  strategic_priorities text[],
  primary_risks text[],
  source_citations text[],
  source_confidence numeric,
  identity_status text,
  failure_reasons text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lens_ground_truths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ground_truth_id text UNIQUE NOT NULL,
  ticker text NOT NULL,
  version text DEFAULT '1.0',
  company_identity jsonb,
  verified_facts jsonb,
  citations jsonb,
  confidence_scores jsonb,
  retrieved_documents jsonb,
  identity_status text,
  failure_reasons text[],
  minimum_sources_met boolean,
  ticker_name_match boolean,
  source_hash text,
  audit_id uuid,
  prompt_version text,
  model_version text,
  constitution_version text,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lens_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oid text UNIQUE NOT NULL,
  ticker text NOT NULL,
  company_name text NOT NULL,
  exchange text,
  ground_truth_id text,
  analysis_json jsonb NOT NULL,
  tcs_score integer,
  tcs_label text,
  opportunity_zone text,
  unlock_potential_low bigint,
  unlock_potential_high bigint,
  top_mechanism text,
  lens_version text DEFAULT '4.0',
  prompt_version text DEFAULT '1.0',
  model_version text DEFAULT 'gpt-4o-mini',
  constitution_version text DEFAULT '4.2',
  lens_engine_version text DEFAULT 'v4.0',
  governing_mechanism text,
  core_structural_problem text,
  identity_status text,
  source_confidence numeric,
  financial_grounding jsonb,
  is_public boolean DEFAULT true,
  is_latest boolean DEFAULT true,
  is_test_record boolean NOT NULL DEFAULT false,
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.report_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  report_type text NOT NULL,
  stripe_session_id text NOT NULL,
  company_name text NOT NULL,
  report_data jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lens_analyses_ticker ON public.lens_analyses(ticker);
CREATE INDEX IF NOT EXISTS idx_lens_analyses_oid ON public.lens_analyses(oid);
CREATE INDEX IF NOT EXISTS idx_lens_analyses_latest ON public.lens_analyses(ticker, is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_lens_analyses_is_test_record ON public.lens_analyses(is_test_record) WHERE is_test_record = true;
CREATE INDEX IF NOT EXISTS idx_lens_ground_truths_ticker_generated ON public.lens_ground_truths(ticker, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_items_session_id ON public.saved_items(session_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_created_at ON public.saved_items(created_at);
CREATE INDEX IF NOT EXISTS report_cache_lookup ON public.report_cache(ticker, report_type, stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_transformation_events_user_id ON public.transformation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_transformation_events_entity_id ON public.transformation_events(entity_id);
CREATE INDEX IF NOT EXISTS idx_transformation_events_event_type ON public.transformation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_transformation_events_created_at ON public.transformation_events(created_at);

-- No RLS policies are defined here. security_hardening_v1.sql is the next step.

COMMIT;
