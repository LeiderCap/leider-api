-- v5_foundation_migration.sql
-- Phase 1: Lens Synthesis Engine v5.0 Foundation
-- Sprint: LSE-P1
-- Additive only — no existing columns modified
-- Prerequisite: financial_grounding_migration.sql must already be applied
-- DO NOT squash with prior migrations

ALTER TABLE lens_analyses
  ADD COLUMN IF NOT EXISTS lens_engine_version TEXT DEFAULT 'v4.0',
  ADD COLUMN IF NOT EXISTS governing_mechanism TEXT NULL,
  ADD COLUMN IF NOT EXISTS core_structural_problem TEXT NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lens_analyses'
  AND column_name IN ('lens_engine_version', 'governing_mechanism', 'core_structural_problem')
ORDER BY column_name;
