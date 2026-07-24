-- v5_dryrun_migration.sql
-- Phase 3: Lens Synthesis Engine v5.0 Dry-Run Test Path
-- Sprint: LSE-P3
-- Additive only — no existing columns modified
-- Prerequisite: v5_foundation_migration.sql must already be applied
-- DO NOT squash with prior migrations

ALTER TABLE lens_analyses
  ADD COLUMN IF NOT EXISTS is_test_record BOOLEAN NOT NULL DEFAULT false;

-- Index for efficient filtering of test records
CREATE INDEX IF NOT EXISTS idx_lens_analyses_is_test_record
  ON lens_analyses (is_test_record)
  WHERE is_test_record = true;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'lens_analyses'
  AND column_name = 'is_test_record';
