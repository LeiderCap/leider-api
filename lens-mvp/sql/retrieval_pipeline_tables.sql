-- ============================================================
-- Retrieval Pipeline Inspector™ + Company Identity Verification Gate™
-- Run this in Supabase SQL Editor
-- ============================================================

-- Table 1: lens_retrieval_audits
CREATE TABLE IF NOT EXISTS public.lens_retrieval_audits (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  company_name text,
  query_used text,
  identity_status text,
  source_confidence numeric,
  business_description_confidence numeric,
  ticker_name_match boolean,
  minimum_sources_met boolean,
  identity_card jsonb,
  failure_reasons text[],
  created_at timestamptz default now()
);

ALTER TABLE public.lens_retrieval_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_audits"
  ON public.lens_retrieval_audits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_select_audits"
  ON public.lens_retrieval_audits
  FOR SELECT USING (true);

-- Table 2: lens_retrieved_documents
CREATE TABLE IF NOT EXISTS public.lens_retrieved_documents (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.lens_retrieval_audits(id),
  ticker text not null,
  source_type text,
  title text,
  url text,
  relevance_score numeric,
  tokens_used integer,
  included_in_prompt boolean,
  excluded_reason text,
  retrieved_at timestamptz default now()
);

ALTER TABLE public.lens_retrieved_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_docs"
  ON public.lens_retrieved_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_select_docs"
  ON public.lens_retrieved_documents
  FOR SELECT USING (true);

-- Table 3: lens_identity_cards
CREATE TABLE IF NOT EXISTS public.lens_identity_cards (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.lens_retrieval_audits(id),
  ticker text not null,
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
  created_at timestamptz default now()
);

ALTER TABLE public.lens_identity_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_cards"
  ON public.lens_identity_cards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_select_cards"
  ON public.lens_identity_cards
  FOR SELECT USING (true);
