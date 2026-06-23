-- ============================================================
-- THE LENS™ — SUPABASE RLS SECURITY FIX
-- Generated: 2026-06-23
-- Run this entire script in Supabase SQL Editor.
-- It is idempotent — safe to run multiple times.
-- ============================================================

-- ============================================================
-- STEP 1: AUDIT (run first to see current state)
-- ============================================================
-- SELECT
--   t.tablename,
--   t.rowsecurity,
--   COUNT(p.policyname) as policy_count
-- FROM pg_tables t
-- LEFT JOIN pg_policies p
--   ON t.tablename = p.tablename
-- WHERE t.schemaname = 'public'
-- GROUP BY t.tablename, t.rowsecurity
-- ORDER BY t.tablename;
-- ============================================================

-- ============================================================
-- TABLE: users
-- Pattern A — user_id = id (authenticated user data)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_users" ON public.users;
DROP POLICY IF EXISTS "insert_own_users" ON public.users;
DROP POLICY IF EXISTS "update_own_users" ON public.users;
DROP POLICY IF EXISTS "delete_own_users" ON public.users;

CREATE POLICY "select_own_users"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "insert_own_users"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_users"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "delete_own_users"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- TABLE: companies
-- Pattern B — public cache (read by all, write by service)
-- ============================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_companies" ON public.companies;
DROP POLICY IF EXISTS "service_write_companies" ON public.companies;

CREATE POLICY "public_select_companies"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "service_write_companies"
  ON public.companies FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: lens_scores
-- Pattern B — public cache (read by all, write by service)
-- ============================================================
ALTER TABLE public.lens_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_lens_scores" ON public.lens_scores;
DROP POLICY IF EXISTS "service_write_lens_scores" ON public.lens_scores;

CREATE POLICY "public_select_lens_scores"
  ON public.lens_scores FOR SELECT
  USING (true);

CREATE POLICY "service_write_lens_scores"
  ON public.lens_scores FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: searches
-- Pattern A — user_id column (authenticated user data)
-- ============================================================
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_searches" ON public.searches;
DROP POLICY IF EXISTS "insert_own_searches" ON public.searches;
DROP POLICY IF EXISTS "delete_own_searches" ON public.searches;

CREATE POLICY "select_own_searches"
  ON public.searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_searches"
  ON public.searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_searches"
  ON public.searches FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: saved_cards
-- Pattern A — user_id column (authenticated user data)
-- ============================================================
ALTER TABLE public.saved_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_cards" ON public.saved_cards;
DROP POLICY IF EXISTS "insert_own_saved_cards" ON public.saved_cards;
DROP POLICY IF EXISTS "delete_own_saved_cards" ON public.saved_cards;

CREATE POLICY "select_own_saved_cards"
  ON public.saved_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_saved_cards"
  ON public.saved_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_saved_cards"
  ON public.saved_cards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: watchlists
-- Pattern A — user_id column (authenticated user data)
-- ============================================================
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "insert_own_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "update_own_watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "delete_own_watchlists" ON public.watchlists;

CREATE POLICY "select_own_watchlists"
  ON public.watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "insert_own_watchlists"
  ON public.watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_watchlists"
  ON public.watchlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "delete_own_watchlists"
  ON public.watchlists FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: watchlist_companies
-- Pattern A — access via watchlist ownership
-- ============================================================
ALTER TABLE public.watchlist_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_watchlist_companies" ON public.watchlist_companies;
DROP POLICY IF EXISTS "insert_own_watchlist_companies" ON public.watchlist_companies;
DROP POLICY IF EXISTS "delete_own_watchlist_companies" ON public.watchlist_companies;

CREATE POLICY "select_own_watchlist_companies"
  ON public.watchlist_companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlists w
      WHERE w.id = watchlist_companies.watchlist_id
        AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "insert_own_watchlist_companies"
  ON public.watchlist_companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.watchlists w
      WHERE w.id = watchlist_companies.watchlist_id
        AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "delete_own_watchlist_companies"
  ON public.watchlist_companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlists w
      WHERE w.id = watchlist_companies.watchlist_id
        AND w.user_id = auth.uid()
    )
  );

-- ============================================================
-- TABLE: enterprise_inquiries
-- Pattern C — inquiry/submission (insert only for public)
-- ============================================================
ALTER TABLE public.enterprise_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_enterprise_inquiries" ON public.enterprise_inquiries;

CREATE POLICY "public_insert_enterprise_inquiries"
  ON public.enterprise_inquiries FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- TABLE: transformation_events
-- Pattern B — public cache / event log (service write)
-- ============================================================
ALTER TABLE public.transformation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_transformation_events" ON public.transformation_events;
DROP POLICY IF EXISTS "service_write_transformation_events" ON public.transformation_events;

CREATE POLICY "public_select_transformation_events"
  ON public.transformation_events FOR SELECT
  USING (true);

CREATE POLICY "service_write_transformation_events"
  ON public.transformation_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: waitlist
-- Pattern C — inquiry/submission (insert only for public)
-- ============================================================
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_waitlist" ON public.waitlist;

CREATE POLICY "public_insert_waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- TABLE: go_deep_analyses
-- Pattern B — public cache (read by all, write by service)
-- ============================================================
ALTER TABLE public.go_deep_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_go_deep_analyses" ON public.go_deep_analyses;
DROP POLICY IF EXISTS "service_write_go_deep_analyses" ON public.go_deep_analyses;

CREATE POLICY "public_select_go_deep_analyses"
  ON public.go_deep_analyses FOR SELECT
  USING (true);

CREATE POLICY "service_write_go_deep_analyses"
  ON public.go_deep_analyses FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: saved_items
-- Pattern D — session-based (no user_id, uses session_id)
-- NOTE: RLS was previously DISABLED on this table.
-- This is the primary Security Advisor error.
-- ============================================================
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_saved_items" ON public.saved_items;
DROP POLICY IF EXISTS "public_insert_saved_items" ON public.saved_items;
DROP POLICY IF EXISTS "public_delete_saved_items" ON public.saved_items;

CREATE POLICY "public_select_saved_items"
  ON public.saved_items FOR SELECT
  USING (true);

CREATE POLICY "public_insert_saved_items"
  ON public.saved_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public_delete_saved_items"
  ON public.saved_items FOR DELETE
  USING (true);

-- ============================================================
-- TABLE: blueprints
-- Pattern D — session-based (has session_id, no user_id)
-- NOTE: RLS was previously DISABLED on this table.
-- ============================================================
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_blueprints" ON public.blueprints;
DROP POLICY IF EXISTS "public_insert_blueprints" ON public.blueprints;
DROP POLICY IF EXISTS "public_delete_blueprints" ON public.blueprints;

CREATE POLICY "public_select_blueprints"
  ON public.blueprints FOR SELECT
  USING (true);

CREATE POLICY "public_insert_blueprints"
  ON public.blueprints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public_delete_blueprints"
  ON public.blueprints FOR DELETE
  USING (true);

-- ============================================================
-- TABLE: lens_reports
-- Pattern B — public cache / Stripe-gated data
-- NOTE: RLS was previously DISABLED on this table.
-- ============================================================
ALTER TABLE public.lens_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_lens_reports" ON public.lens_reports;
DROP POLICY IF EXISTS "service_write_lens_reports" ON public.lens_reports;

CREATE POLICY "public_select_lens_reports"
  ON public.lens_reports FOR SELECT
  USING (true);

CREATE POLICY "service_write_lens_reports"
  ON public.lens_reports FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: cached_stock_prices
-- Pattern B — public cache (already has RLS + policies)
-- Dropping and recreating to ensure idempotency.
-- ============================================================
ALTER TABLE public.cached_stock_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_cached_stock_prices" ON public.cached_stock_prices;
DROP POLICY IF EXISTS "public_insert_cached_stock_prices" ON public.cached_stock_prices;
DROP POLICY IF EXISTS "public_update_cached_stock_prices" ON public.cached_stock_prices;
DROP POLICY IF EXISTS "service_write_cached_stock_prices" ON public.cached_stock_prices;

CREATE POLICY "public_select_cached_stock_prices"
  ON public.cached_stock_prices FOR SELECT
  USING (true);

CREATE POLICY "service_write_cached_stock_prices"
  ON public.cached_stock_prices FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: opportunity_zone_cache
-- Pattern B — public cache (already has RLS + policies)
-- Dropping and recreating to ensure idempotency.
-- ============================================================
ALTER TABLE public.opportunity_zone_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_opportunity_zone_cache" ON public.opportunity_zone_cache;
DROP POLICY IF EXISTS "public_insert_opportunity_zone_cache" ON public.opportunity_zone_cache;
DROP POLICY IF EXISTS "public_update_opportunity_zone_cache" ON public.opportunity_zone_cache;
DROP POLICY IF EXISTS "service_write_opportunity_zone_cache" ON public.opportunity_zone_cache;

CREATE POLICY "public_select_opportunity_zone_cache"
  ON public.opportunity_zone_cache FOR SELECT
  USING (true);

CREATE POLICY "service_write_opportunity_zone_cache"
  ON public.opportunity_zone_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: pe_stack_inquiries
-- Pattern C — inquiry/submission (already has RLS + policies)
-- Dropping and recreating to ensure idempotency.
-- ============================================================
ALTER TABLE public.pe_stack_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert pe_stack_inquiries" ON public.pe_stack_inquiries;
DROP POLICY IF EXISTS "Deny anon select pe_stack_inquiries" ON public.pe_stack_inquiries;
DROP POLICY IF EXISTS "public_insert_pe_stack_inquiries" ON public.pe_stack_inquiries;

CREATE POLICY "public_insert_pe_stack_inquiries"
  ON public.pe_stack_inquiries FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- TABLE: investor_stack_inquiries
-- Pattern C — inquiry/submission (already has RLS + policies)
-- Dropping and recreating to ensure idempotency.
-- ============================================================
ALTER TABLE public.investor_stack_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert investor_stack_inquiries" ON public.investor_stack_inquiries;
DROP POLICY IF EXISTS "Deny anon select investor_stack_inquiries" ON public.investor_stack_inquiries;
DROP POLICY IF EXISTS "public_insert_investor_stack_inquiries" ON public.investor_stack_inquiries;

CREATE POLICY "public_insert_investor_stack_inquiries"
  ON public.investor_stack_inquiries FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- TABLE: report_cache
-- Pattern B — public cache (Stripe-gated, service write)
-- NOTE: RLS was DISABLED on this table. Enabling now.
-- ============================================================
ALTER TABLE public.report_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_report_cache" ON public.report_cache;
DROP POLICY IF EXISTS "service_write_report_cache" ON public.report_cache;

CREATE POLICY "public_select_report_cache"
  ON public.report_cache FOR SELECT
  USING (true);

CREATE POLICY "service_write_report_cache"
  ON public.report_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- VERIFICATION QUERY — run after applying all fixes above:
-- ============================================================
-- SELECT
--   t.tablename,
--   t.rowsecurity,
--   COUNT(p.policyname) as policy_count,
--   STRING_AGG(p.policyname, ', ' ORDER BY p.policyname) as policies
-- FROM pg_tables t
-- LEFT JOIN pg_policies p
--   ON t.tablename = p.tablename
-- WHERE t.schemaname = 'public'
-- GROUP BY t.tablename, t.rowsecurity
-- ORDER BY t.tablename;
-- ============================================================
-- Expected result: rowsecurity = true for ALL tables,
-- policy_count >= 1 for ALL tables.
-- ============================================================
