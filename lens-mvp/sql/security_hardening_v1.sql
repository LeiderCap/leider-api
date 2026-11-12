-- The Lens™ — Security Hardening v1
-- PREPARATION ONLY: do not execute against production without owner approval.
-- Apply after the existing schema and migration files, in a staging project first.
--
-- Design goals:
--   1. Public Lens reports remain readable only when explicitly published.
--   2. Raw Ground Truth/retrieval/analysis writes are service-role only.
--   3. Clerk JWT subjects map to public.users.clerk_user_id; ownership fields
--      store the stable public.users.id UUID resolved from that subject.
--   4. Legacy session rows are not deleted or reassigned. New owner_id columns
--      remain NULL for legacy rows until an approved account-linking workflow exists.
--   5. Public inquiry/waitlist submissions remain insert-only.

-- ---------------------------------------------------------------------------
-- PRE-FLIGHT AUDIT (run separately in staging; do not assume migration state)
-- ---------------------------------------------------------------------------
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name IN (
--     'saved_cards', 'watchlists', 'watchlist_companies', 'saved_items',
--     'blueprints', 'lens_reports', 'lens_analyses', 'lens_ground_truths',
--     'lens_retrieval_audits', 'lens_retrieved_documents', 'lens_identity_cards',
--     'report_cache'
--   )
-- ORDER BY table_name, ordinal_position;

-- EXECUTION GUARD: fail before any schema/policy mutation if the inspected
-- staging schema is not compatible with this migration. This deliberately
-- requires the real tables/columns instead of relying on named DROP POLICY
-- statements to hide schema drift.
DO $$
DECLARE
  required_table text;
  missing_tables text;
  required_column record;
BEGIN
  SELECT string_agg(table_name, ', ' ORDER BY table_name)
    INTO missing_tables
  FROM unnest(ARRAY[
    'users', 'lens_analyses', 'lens_ground_truths', 'lens_retrieval_audits',
    'lens_retrieved_documents', 'lens_identity_cards', 'saved_cards',
    'watchlists', 'watchlist_companies', 'saved_items', 'blueprints',
    'lens_reports', 'report_cache', 'transformation_events',
    'go_deep_analyses', 'companies', 'lens_scores', 'cached_stock_prices',
    'opportunity_zone_cache', 'enterprise_inquiries', 'waitlist',
    'pe_stack_inquiries', 'investor_stack_inquiries'
  ]) AS required(table_name)
  WHERE to_regclass('public.' || table_name) IS NULL;

  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Security hardening preflight failed; missing public tables: %', missing_tables;
  END IF;

  FOR required_column IN
    SELECT * FROM (VALUES
      ('users', 'id'),
      ('lens_analyses', 'is_public'),
      ('saved_cards', 'user_id'),
      ('watchlists', 'user_id'),
      ('watchlist_companies', 'watchlist_id'),
      ('saved_items', 'session_id'),
      ('blueprints', 'session_id'),
      ('lens_reports', 'session_id')
    ) AS columns(table_name, column_name)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = required_column.table_name
        AND c.column_name = required_column.column_name
    ) THEN
      RAISE EXCEPTION 'Security hardening preflight failed; missing public.%.% column',
        required_column.table_name, required_column.column_name;
    END IF;
  END LOOP;
END $$;

-- Clerk/Supabase identity bridge. Supabase must be configured to validate the
-- Clerk JWT issuer in staging. auth.jwt()->>'sub' is the Clerk subject such as
-- user_..., while owner_id/user_id remain UUIDs from public.users.id.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS clerk_user_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_user_id
  ON public.users(clerk_user_id)
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
  FROM public.users u
  WHERE u.clerk_user_id = public.current_clerk_user_id()
  LIMIT 1;
$$;

-- Remove every existing policy on each protected table, including policy names
-- not present in repository migrations. The preflight above ensures these
-- relations exist before this dynamic cleanup runs.
DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'users', 'lens_analyses', 'lens_ground_truths', 'lens_retrieval_audits',
        'lens_retrieved_documents', 'lens_identity_cards', 'saved_cards',
        'watchlists', 'watchlist_companies', 'saved_items', 'blueprints',
        'lens_reports', 'report_cache', 'transformation_events',
        'go_deep_analyses', 'companies', 'lens_scores', 'cached_stock_prices',
        'opportunity_zone_cache', 'enterprise_inquiries', 'waitlist',
        'pe_stack_inquiries', 'investor_stack_inquiries'
      ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
      policy_row.policyname, policy_row.tablename);
  END LOOP;
END $$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_self_by_clerk_subject"
  ON public.users FOR SELECT TO authenticated
  USING (clerk_user_id = public.current_clerk_user_id());
CREATE POLICY "service_role_manage_users"
  ON public.users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- OWNER COLUMNS FOR LEGACY SESSION-BASED TABLES
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.saved_items
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.blueprints
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.lens_reports
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.report_cache
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_saved_items_owner_id
  ON public.saved_items(owner_id);

CREATE INDEX IF NOT EXISTS idx_blueprints_owner_id
  ON public.blueprints(owner_id);

CREATE INDEX IF NOT EXISTS idx_lens_reports_owner_id
  ON public.lens_reports(owner_id);

CREATE INDEX IF NOT EXISTS idx_report_cache_owner_id
  ON public.report_cache(owner_id);

-- ---------------------------------------------------------------------------
-- PUBLIC ANALYSIS: preserve intentionally public Lens reports
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.lens_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_analyses" ON public.lens_analyses;
DROP POLICY IF EXISTS "service_insert_analyses" ON public.lens_analyses;
DROP POLICY IF EXISTS "service_update_analyses" ON public.lens_analyses;

CREATE POLICY "published_analyses_are_public"
  ON public.lens_analyses FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "service_role_insert_analyses"
  ON public.lens_analyses FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "service_role_update_analyses"
  ON public.lens_analyses FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_role_delete_analyses"
  ON public.lens_analyses FOR DELETE TO service_role
  USING (true);

-- ---------------------------------------------------------------------------
-- RAW PIPELINE DATA: server/service role only
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'lens_ground_truths',
    'lens_retrieval_audits',
    'lens_retrieved_documents',
    'lens_identity_cards'
  ] LOOP
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "public_select_gts" ON public.lens_ground_truths;
DROP POLICY IF EXISTS "service_insert_gts" ON public.lens_ground_truths;
CREATE POLICY "service_role_manage_ground_truth"
  ON public.lens_ground_truths FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_audits" ON public.lens_retrieval_audits;
DROP POLICY IF EXISTS "public_select_audits" ON public.lens_retrieval_audits;
CREATE POLICY "service_role_manage_retrieval_audits"
  ON public.lens_retrieval_audits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_docs" ON public.lens_retrieved_documents;
DROP POLICY IF EXISTS "public_select_docs" ON public.lens_retrieved_documents;
CREATE POLICY "service_role_manage_retrieved_documents"
  ON public.lens_retrieved_documents FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_cards" ON public.lens_identity_cards;
DROP POLICY IF EXISTS "public_select_cards" ON public.lens_identity_cards;
CREATE POLICY "service_role_manage_identity_cards"
  ON public.lens_identity_cards FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- AUTHENTICATED USER-OWNED TABLES
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.saved_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_saved_cards" ON public.saved_cards;
DROP POLICY IF EXISTS "insert_own_saved_cards" ON public.saved_cards;
DROP POLICY IF EXISTS "delete_own_saved_cards" ON public.saved_cards;
CREATE POLICY "users_select_own_saved_cards"
  ON public.saved_cards FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id());
CREATE POLICY "users_insert_own_saved_cards"
  ON public.saved_cards FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_app_user_id());
CREATE POLICY "users_delete_own_saved_cards"
  ON public.saved_cards FOR DELETE TO authenticated
  USING (user_id = public.current_app_user_id());
CREATE POLICY "service_role_manage_saved_cards"
  ON public.saved_cards FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.watchlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "insert_own_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "update_own_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "delete_own_watchlists" ON public.watchlists;
CREATE POLICY "users_select_own_watchlists"
  ON public.watchlists FOR SELECT TO authenticated
  USING (user_id = public.current_app_user_id());
CREATE POLICY "users_insert_own_watchlists"
  ON public.watchlists FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_app_user_id());
CREATE POLICY "users_update_own_watchlists"
  ON public.watchlists FOR UPDATE TO authenticated
  USING (user_id = public.current_app_user_id()) WITH CHECK (user_id = public.current_app_user_id());
CREATE POLICY "users_delete_own_watchlists"
  ON public.watchlists FOR DELETE TO authenticated
  USING (user_id = public.current_app_user_id());
CREATE POLICY "service_role_manage_watchlists"
  ON public.watchlists FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.watchlist_companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_watchlist_companies" ON public.watchlist_companies;
DROP POLICY IF EXISTS "insert_own_watchlist_companies" ON public.watchlist_companies;
DROP POLICY IF EXISTS "delete_own_watchlist_companies" ON public.watchlist_companies;
CREATE POLICY "users_select_own_watchlist_companies"
  ON public.watchlist_companies FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.watchlists w
    WHERE w.id = watchlist_companies.watchlist_id AND w.user_id = public.current_app_user_id()
  ));
CREATE POLICY "users_insert_own_watchlist_companies"
  ON public.watchlist_companies FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.watchlists w
    WHERE w.id = watchlist_companies.watchlist_id AND w.user_id = public.current_app_user_id()
  ));
CREATE POLICY "users_delete_own_watchlist_companies"
  ON public.watchlist_companies FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.watchlists w
    WHERE w.id = watchlist_companies.watchlist_id AND w.user_id = public.current_app_user_id()
  ));
CREATE POLICY "service_role_manage_watchlist_companies"
  ON public.watchlist_companies FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Legacy session rows stay unassigned and are not deleted/reassigned.
ALTER TABLE IF EXISTS public.saved_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_saved_items" ON public.saved_items;
DROP POLICY IF EXISTS "public_insert_saved_items" ON public.saved_items;
DROP POLICY IF EXISTS "public_delete_saved_items" ON public.saved_items;
CREATE POLICY "users_select_own_saved_items"
  ON public.saved_items FOR SELECT TO authenticated
  USING (owner_id = public.current_app_user_id());
CREATE POLICY "users_insert_own_saved_items"
  ON public.saved_items FOR INSERT TO authenticated
  WITH CHECK (owner_id = public.current_app_user_id());
CREATE POLICY "users_delete_own_saved_items"
  ON public.saved_items FOR DELETE TO authenticated
  USING (owner_id = public.current_app_user_id());
CREATE POLICY "service_role_manage_saved_items"
  ON public.saved_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.blueprints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_blueprints" ON public.blueprints;
DROP POLICY IF EXISTS "public_insert_blueprints" ON public.blueprints;
DROP POLICY IF EXISTS "public_delete_blueprints" ON public.blueprints;
CREATE POLICY "users_select_own_blueprints"
  ON public.blueprints FOR SELECT TO authenticated
  USING (owner_id = public.current_app_user_id());
CREATE POLICY "users_insert_own_blueprints"
  ON public.blueprints FOR INSERT TO authenticated
  WITH CHECK (owner_id = public.current_app_user_id());
CREATE POLICY "users_delete_own_blueprints"
  ON public.blueprints FOR DELETE TO authenticated
  USING (owner_id = public.current_app_user_id());
CREATE POLICY "service_role_manage_blueprints"
  ON public.blueprints FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.lens_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_lens_reports" ON public.lens_reports;
DROP POLICY IF EXISTS "service_write_lens_reports" ON public.lens_reports;
CREATE POLICY "users_select_own_lens_reports"
  ON public.lens_reports FOR SELECT TO authenticated
  USING (owner_id = public.current_app_user_id());
CREATE POLICY "service_role_manage_lens_reports"
  ON public.lens_reports FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- PRIVATE CACHES AND EVENT LOGS: service role only
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.report_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_report_cache" ON public.report_cache;
DROP POLICY IF EXISTS "service_write_report_cache" ON public.report_cache;
CREATE POLICY "service_role_manage_report_cache"
  ON public.report_cache FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.transformation_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_transformation_events" ON public.transformation_events;
DROP POLICY IF EXISTS "service_write_transformation_events" ON public.transformation_events;
CREATE POLICY "service_role_manage_transformation_events"
  ON public.transformation_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.go_deep_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_go_deep_analyses" ON public.go_deep_analyses;
DROP POLICY IF EXISTS "service_write_go_deep_analyses" ON public.go_deep_analyses;
CREATE POLICY "service_role_manage_go_deep_analyses"
  ON public.go_deep_analyses FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- PUBLIC SUBMISSION TABLES: anonymous insert only, no read/update/delete
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.enterprise_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_enterprise_inquiries" ON public.enterprise_inquiries;
CREATE POLICY "anon_insert_enterprise_inquiries"
  ON public.enterprise_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_waitlist" ON public.waitlist;
CREATE POLICY "anon_insert_waitlist"
  ON public.waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.pe_stack_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon insert pe_stack_inquiries" ON public.pe_stack_inquiries;
DROP POLICY IF EXISTS "public_insert_pe_stack_inquiries" ON public.pe_stack_inquiries;
CREATE POLICY "anon_insert_pe_stack_inquiries"
  ON public.pe_stack_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.investor_stack_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon insert investor_stack_inquiries" ON public.investor_stack_inquiries;
DROP POLICY IF EXISTS "public_insert_investor_stack_inquiries" ON public.investor_stack_inquiries;
CREATE POLICY "anon_insert_investor_stack_inquiries"
  ON public.investor_stack_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- CACHES: service role only until column-level privacy review proves that
-- each table contains no private research, unpublished analysis, or provider
-- data that should not be exposed through the public anon role.
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_companies" ON public.companies;
DROP POLICY IF EXISTS "service_write_companies" ON public.companies;
CREATE POLICY "service_role_manage_companies"
  ON public.companies FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.lens_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_lens_scores" ON public.lens_scores;
DROP POLICY IF EXISTS "service_write_lens_scores" ON public.lens_scores;
CREATE POLICY "service_role_manage_lens_scores"
  ON public.lens_scores FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.cached_stock_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_cached_stock_prices" ON public.cached_stock_prices;
DROP POLICY IF EXISTS "public_insert_cached_stock_prices" ON public.cached_stock_prices;
DROP POLICY IF EXISTS "public_update_cached_stock_prices" ON public.cached_stock_prices;
DROP POLICY IF EXISTS "service_write_cached_stock_prices" ON public.cached_stock_prices;
CREATE POLICY "service_role_manage_cached_stock_prices"
  ON public.cached_stock_prices FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.opportunity_zone_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_opportunity_zone_cache" ON public.opportunity_zone_cache;
DROP POLICY IF EXISTS "public_insert_opportunity_zone_cache" ON public.opportunity_zone_cache;
DROP POLICY IF EXISTS "public_update_opportunity_zone_cache" ON public.opportunity_zone_cache;
DROP POLICY IF EXISTS "service_write_opportunity_zone_cache" ON public.opportunity_zone_cache;
CREATE POLICY "service_role_manage_opportunity_zone_cache"
  ON public.opportunity_zone_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- POST-FLIGHT VERIFICATION (run in staging after review)
-- ---------------------------------------------------------------------------
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
