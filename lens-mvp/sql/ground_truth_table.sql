-- ── Truth Engine™ — Ground Truth Object™ Table ─────────────────────────────
-- Run this in the Supabase SQL Editor.
-- This table stores the permanent, versioned Ground Truth Object for every
-- Lens run. Every row is immutable once created.
--
-- Constitutional basis: TI-015 (Evidence Sufficiency Law™), TI-010 (LKAS™)

CREATE TABLE IF NOT EXISTS public.lens_ground_truths (
  id                    uuid primary key default gen_random_uuid(),
  ground_truth_id       text unique not null,  -- GT-YYYY-TICKER-NNN
  ticker                text not null,
  version               text default '1.0',
  company_identity      jsonb,
  verified_facts        jsonb,
  citations             jsonb,
  confidence_scores     jsonb,
  retrieved_documents   jsonb,
  identity_status       text,
  failure_reasons       text[],
  minimum_sources_met   boolean,
  ticker_name_match     boolean,
  source_hash           text,
  audit_id              uuid,
  prompt_version        text,
  model_version         text,
  constitution_version  text,
  generated_at          timestamptz default now()
);

-- Index for fast ticker + recency lookups
CREATE INDEX IF NOT EXISTS idx_lens_ground_truths_ticker_generated
  ON public.lens_ground_truths (ticker, generated_at DESC);

-- Row Level Security
ALTER TABLE public.lens_ground_truths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_gts"
  ON public.lens_ground_truths
  FOR SELECT USING (true);

CREATE POLICY "service_insert_gts"
  ON public.lens_ground_truths
  FOR INSERT WITH CHECK (true);
