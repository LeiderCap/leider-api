-- The Lens™ — Production Compatibility + Security Migration v2
-- PREPARATION ONLY. DO NOT EXECUTE WITHOUT EXPLICIT PRODUCTION APPROVAL.
--
-- Target: production Supabase project only, after a separately recorded preflight.
-- Scope: users.clerk_user_id, saved_items.owner_id, blueprints, lens_reports,
-- report_cache, private-table permissions/RLS, required indexes and FKs.
-- Go Deep is intentionally excluded because the feature is suspended.
--
-- Preservation rules:
--   * No application rows are deleted, reassigned, or rewritten.
--   * Existing rows in legacy session tables retain NULL owner_id.
--   * Rows with NULL owner_id are not exposed by authenticated ownership policies.
--   * Published Lens analyses/OIDs are outside this migration and remain public
--     according to their existing publication contract.
--
-- Run the read-only preflight in the companion migration plan first. Abort if
-- the actual schema differs materially from the approved preflight.

BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- ---------------------------------------------------------------------------
-- 1. Execution guard: required base objects and compatible companies key.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.users is missing';
  END IF;
  IF to_regclass('public.saved_items') IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.saved_items is missing';
  END IF;
  IF to_regclass('public.saved_cards') IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.saved_cards is missing';
  END IF;
  IF to_regclass('public.watchlists') IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.watchlists is missing';
  END IF;
  IF to_regclass('public.watchlist_companies') IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.watchlist_companies is missing';
  END IF;
  IF to_regclass('public.companies') IS NULL THEN
    RAISE EXCEPTION 'Preflight failed: public.companies is missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'companies'
      AND column_name = 'id' AND data_type = 'text'
  ) THEN
    RAISE EXCEPTION 'Preflight failed: public.companies.id must be text';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Identity bridge. Existing users remain intact; no Clerk IDs are inferred.
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS clerk_user_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_user_id
  ON public.users (clerk_user_id)
  WHERE clerk_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.current_clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT nullif(auth.jwt() ->> 'sub', '');
$$;

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT u.id
  FROM public.users AS u
  WHERE u.clerk_user_id = public.current_clerk_user_id()
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- 3. Create missing next-release tables only when absent.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  entity_name text,
  entity_type text,
  source_lens_card jsonb,
  blueprint jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lens_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
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

CREATE TABLE IF NOT EXISTS public.report_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  ticker text NOT NULL,
  report_type text NOT NULL,
  stripe_session_id text NOT NULL,
  company_name text NOT NULL,
  report_data jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS report_cache_lookup
  ON public.report_cache(ticker, report_type, stripe_session_id);

-- Existing-table shape guard. An existing table with a conflicting column type
-- aborts before policies or grants are changed.
DO $$
DECLARE
  required_column record;
BEGIN
  FOR required_column IN
    SELECT * FROM (VALUES
      ('users', 'id', 'uuid'),
      ('users', 'email', 'text'),
      ('users', 'clerk_user_id', 'text'),
      ('saved_items', 'id', 'uuid'),
      ('saved_items', 'session_id', 'text'),
      ('blueprints', 'id', 'uuid'),
      ('blueprints', 'blueprint', 'jsonb'),
      ('lens_reports', 'id', 'uuid'),
      ('lens_reports', 'free_report_json', 'jsonb'),
      ('report_cache', 'id', 'uuid'),
      ('report_cache', 'report_data', 'jsonb')
    ) AS required(table_name, column_name, data_type)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns AS c
      WHERE c.table_schema = 'public'
        AND c.table_name = required_column.table_name
        AND c.column_name = required_column.column_name
        AND c.data_type = required_column.data_type
    ) THEN
      RAISE EXCEPTION 'Production compatibility preflight failed: public.%.% must be %',
        required_column.table_name,
        required_column.column_name,
        required_column.data_type;
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Add owner columns without assigning legacy rows.
-- ---------------------------------------------------------------------------
ALTER TABLE public.saved_items
  ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.blueprints
  ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.lens_reports
  ADD COLUMN IF NOT EXISTS owner_id uuid;
ALTER TABLE public.report_cache
  ADD COLUMN IF NOT EXISTS owner_id uuid;

-- Validate types before adding foreign keys.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['saved_items','blueprints','lens_reports','report_cache'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns AS c
      WHERE c.table_schema = 'public' AND c.table_name = table_name
        AND c.column_name = 'owner_id' AND c.data_type = 'uuid'
    ) THEN
      RAISE EXCEPTION 'owner_id type check failed for public.%', table_name;
    END IF;
  END LOOP;
END $$;

-- Add only the intended owner FKs when they are not already present.
DO $$
DECLARE
  users_id smallint;
  source_id smallint;
BEGIN
  SELECT attnum INTO users_id FROM pg_attribute
    WHERE attrelid = 'public.users'::regclass AND attname = 'id' AND NOT attisdropped;

  SELECT attnum INTO source_id FROM pg_attribute
    WHERE attrelid = 'public.saved_items'::regclass AND attname = 'owner_id' AND NOT attisdropped;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype = 'f' AND conrelid = 'public.saved_items'::regclass
      AND confrelid = 'public.users'::regclass
      AND conkey = ARRAY[source_id]::smallint[]
      AND confkey = ARRAY[users_id]::smallint[]
  ) THEN
    ALTER TABLE public.saved_items
      ADD CONSTRAINT saved_items_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  SELECT attnum INTO source_id FROM pg_attribute
    WHERE attrelid = 'public.blueprints'::regclass AND attname = 'owner_id' AND NOT attisdropped;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype = 'f' AND conrelid = 'public.blueprints'::regclass
      AND confrelid = 'public.users'::regclass
      AND conkey = ARRAY[source_id]::smallint[]
      AND confkey = ARRAY[users_id]::smallint[]
  ) THEN
    ALTER TABLE public.blueprints
      ADD CONSTRAINT blueprints_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  SELECT attnum INTO source_id FROM pg_attribute
    WHERE attrelid = 'public.lens_reports'::regclass AND attname = 'owner_id' AND NOT attisdropped;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype = 'f' AND conrelid = 'public.lens_reports'::regclass
      AND confrelid = 'public.users'::regclass
      AND conkey = ARRAY[source_id]::smallint[]
      AND confkey = ARRAY[users_id]::smallint[]
  ) THEN
    ALTER TABLE public.lens_reports
      ADD CONSTRAINT lens_reports_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  SELECT attnum INTO source_id FROM pg_attribute
    WHERE attrelid = 'public.report_cache'::regclass AND attname = 'owner_id' AND NOT attisdropped;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype = 'f' AND conrelid = 'public.report_cache'::regclass
      AND confrelid = 'public.users'::regclass
      AND conkey = ARRAY[source_id]::smallint[]
      AND confkey = ARRAY[users_id]::smallint[]
  ) THEN
    ALTER TABLE public.report_cache
      ADD CONSTRAINT report_cache_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_saved_items_owner_id ON public.saved_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_owner_id ON public.blueprints(owner_id);
CREATE INDEX IF NOT EXISTS idx_lens_reports_owner_id ON public.lens_reports(owner_id);
CREATE INDEX IF NOT EXISTS idx_report_cache_owner_id ON public.report_cache(owner_id);

-- ---------------------------------------------------------------------------
-- 5. Remove every existing policy on the private tables, including unknown
-- historical names. This does not touch public Lens-analysis policies.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'users', 'saved_cards', 'watchlists', 'watchlist_companies',
        'saved_items', 'blueprints', 'lens_reports', 'report_cache'
      ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
      policy_row.policyname, policy_row.tablename);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 6. RLS: server-mediated-only design. Private application operations use
-- Clerk-verified server routes and the service-role client. Direct browser
-- Supabase JWT access is not a supported application workflow for this release.
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_manage_users
  ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.saved_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_manage_saved_cards
  ON public.saved_cards FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_manage_watchlists
  ON public.watchlists FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.watchlist_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_manage_watchlist_companies
  ON public.watchlist_companies FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_manage_saved_items
  ON public.saved_items FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_manage_blueprints
  ON public.blueprints FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.lens_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_manage_lens_reports
  ON public.lens_reports FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.report_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_manage_report_cache
  ON public.report_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 7. Explicit least-privilege table grants.
-- ---------------------------------------------------------------------------
REVOKE ALL PRIVILEGES ON TABLE
  public.users, public.saved_cards, public.watchlists,
  public.watchlist_companies, public.saved_items, public.blueprints,
  public.lens_reports, public.report_cache
FROM anon, authenticated, PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.users, public.saved_cards, public.watchlists,
  public.watchlist_companies, public.saved_items, public.blueprints,
  public.lens_reports, public.report_cache
TO service_role;

COMMIT;

-- Post-commit verification must be run separately. See the companion plan.
