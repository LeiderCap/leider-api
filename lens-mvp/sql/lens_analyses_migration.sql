-- ============================================================
-- Sprint 1A: lens_analyses table
-- Persistent storage for every completed Lens Analysis™
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lens_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  oid text UNIQUE NOT NULL,
    -- format: OID-{YYYY}-{TICKER}-{NNN}
    -- e.g. OID-2026-PL-001
  ticker text NOT NULL,
  company_name text NOT NULL,
  exchange text,

  -- Ground Truth reference
  ground_truth_id text,
    -- references lens_ground_truths
    -- GT-2026-PL-001 format

  -- Analysis content (full JSON)
  analysis_json jsonb NOT NULL,
    -- complete Lens Analysis output including all sections

  -- Top-level summary fields (indexed for fast queries)
  tcs_score integer,
  tcs_label text,
  opportunity_zone text,
  unlock_potential_low bigint,
  unlock_potential_high bigint,
  top_mechanism text,

  -- Metadata
  lens_version text DEFAULT '4.0',
  prompt_version text DEFAULT '1.0',
  model_version text DEFAULT 'gpt-4o-mini',
  constitution_version text DEFAULT '4.2',
  identity_status text,
    -- PASS | NEEDS_REVIEW
  source_confidence numeric,

  -- Document metadata
  is_public boolean DEFAULT true,
  is_latest boolean DEFAULT true,
    -- false for superseded analyses

  -- Timestamps
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz
    -- null = never expires
    -- set to 30 days for auto-refresh
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lens_analyses_ticker
  ON public.lens_analyses(ticker);

CREATE INDEX IF NOT EXISTS idx_lens_analyses_oid
  ON public.lens_analyses(oid);

CREATE INDEX IF NOT EXISTS idx_lens_analyses_latest
  ON public.lens_analyses(ticker, is_latest)
  WHERE is_latest = true;

-- Enable RLS immediately
ALTER TABLE public.lens_analyses
  ENABLE ROW LEVEL SECURITY;

-- Public read access for published analyses
CREATE POLICY "public_select_analyses"
  ON public.lens_analyses
  FOR SELECT USING (is_public = true);

-- Service role can insert
CREATE POLICY "service_insert_analyses"
  ON public.lens_analyses
  FOR INSERT WITH CHECK (true);

-- Service role can update (e.g. set is_latest = false)
CREATE POLICY "service_update_analyses"
  ON public.lens_analyses
  FOR UPDATE USING (true);
