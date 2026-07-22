-- Financial Grounding Module — Additive Migration
-- Sprint: Financial Grounding Layer for Equity Reclamation™
-- Constitutional reference: TI-013, TI-014, TI-015
--
-- This migration adds a single nullable JSONB column to lens_analyses.
-- It is fully additive — no existing columns are modified or dropped.
-- Existing records will have financial_grounding = NULL until re-analyzed.

ALTER TABLE public.lens_analyses
  ADD COLUMN IF NOT EXISTS financial_grounding JSONB DEFAULT NULL;

-- Optional: index for querying analyses that have grounding data
CREATE INDEX IF NOT EXISTS idx_lens_analyses_has_grounding
  ON public.lens_analyses ((financial_grounding IS NOT NULL));

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lens_analyses'
  AND column_name = 'financial_grounding';
