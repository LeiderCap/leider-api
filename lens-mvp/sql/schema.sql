-- ============================================
-- TRANSFORMATION INTELLIGENCE™ DATA SCHEMA
-- ============================================
-- Phase 1 (MVP): companies, lens_scores,
--   saved_cards, watchlists, searches,
--   enterprise_inquiries
-- Phase 2: decision_records, dvi_scores
-- Phase 3: transformation_memory,
--   intelligence_compounding_scores
-- Graph Layer: transformation_graph (Phase 3+)
-- ============================================
-- transformation_events is created in Phase 1
-- but activated in Phase 3.
-- Events are the atomic unit of intelligence
-- compounding. Preserve them from day one.
-- ============================================

-- Lens MVP schema v1.0
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  membership_level text default 'free',
  created_at timestamptz default now()
);

create table if not exists companies (
  id text primary key,
  name text not null,
  ticker text,
  industry text,
  description text,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists lens_scores (
  company_id text primary key references companies(id) on delete cascade,
  tcs_score text not null,
  intelligence_score text not null,
  absorbability_score text not null,
  trust_score text not null,
  governance_score text not null,
  courage_score text not null,
  execution_score text not null,
  yield_score text not null,
  equity_reclamation text,
  transformation_capacity_gap text not null,
  opportunity_value text,
  confidence text,
  top_unlock text,
  constraints jsonb default '[]'::jsonb,
  opportunities jsonb default '[]'::jsonb,
  summary text,
  updated_at timestamptz default now()
);

create table if not exists searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  query text not null,
  created_at timestamptz default now()
);

create table if not exists saved_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  company_id text references companies(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, company_id)
);

create table if not exists watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists watchlist_companies (
  watchlist_id uuid references watchlists(id) on delete cascade,
  company_id text references companies(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (watchlist_id, company_id)
);

create table if not exists enterprise_inquiries (
  id uuid primary key default gen_random_uuid(),
  company_id text references companies(id),
  name text,
  email text,
  organization text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

-- ============================================
-- TRANSFORMATION EVENTS (Phase 1 foundation,
-- activated in Phase 3)
-- ============================================
CREATE TABLE IF NOT EXISTS transformation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id TEXT,
  entity_id TEXT,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transformation_events_user_id
  ON transformation_events(user_id);

CREATE INDEX IF NOT EXISTS idx_transformation_events_entity_id
  ON transformation_events(entity_id);

CREATE INDEX IF NOT EXISTS idx_transformation_events_event_type
  ON transformation_events(event_type);

CREATE INDEX IF NOT EXISTS idx_transformation_events_created_at
  ON transformation_events(created_at);

-- ============================================
-- DATA QUALITY: STALE PRIVATE-COMPANY CACHE
-- ============================================
-- Run manually in Supabase SQL editor to clear
-- bad cached data where public companies were
-- incorrectly scored with private-company fallbacks:
--
-- DELETE FROM lens_scores
-- WHERE top_unlock LIKE '%private companies require%';
--
-- After running, re-search affected companies to
-- regenerate correct scores via the AI pipeline.
-- ============================================

-- ============================================
-- v1.1 Migration — run in Supabase SQL Editor:
-- ============================================
-- ALTER TABLE lens_scores
--   ADD COLUMN IF NOT EXISTS tcs_numeric integer,
--   ADD COLUMN IF NOT EXISTS absorbability_numeric integer,
--   ADD COLUMN IF NOT EXISTS governance_numeric integer,
--   ADD COLUMN IF NOT EXISTS execution_numeric integer,
--   ADD COLUMN IF NOT EXISTS trust_numeric integer,
--   ADD COLUMN IF NOT EXISTS courage_numeric integer,
--   ADD COLUMN IF NOT EXISTS intelligence_numeric integer,
--   ADD COLUMN IF NOT EXISTS primary_constraint text,
--   ADD COLUMN IF NOT EXISTS secondary_constraint text,
--   ADD COLUMN IF NOT EXISTS system_constraint text,
--   ADD COLUMN IF NOT EXISTS gptp_stage text;
-- ============================================

-- ============================================
-- v1.2 Migration — Lens Analysis™ narrative fields
-- Run in Supabase SQL Editor:
-- ============================================
-- ALTER TABLE lens_scores
--   ADD COLUMN IF NOT EXISTS what_lens_sees text,
--   ADD COLUMN IF NOT EXISTS value_creation_model text,
--   ADD COLUMN IF NOT EXISTS hidden_assets text,
--   ADD COLUMN IF NOT EXISTS hidden_constraints text,
--   ADD COLUMN IF NOT EXISTS transformation_opportunities text,
--   ADD COLUMN IF NOT EXISTS analysis_summary text;
-- ============================================

-- ============================================
-- v1.3 Migration — Transformation Momentum™
-- Run in Supabase SQL Editor:
-- ============================================
-- ALTER TABLE lens_scores
--   ADD COLUMN IF NOT EXISTS transformation_momentum text;
-- ============================================

-- ============================================
-- WAITLIST TABLE — Stack the Deck™ Phase 2
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  feature text DEFAULT 'stack-the-deck',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- v1.4 Migration — Opportunity Visibility Gap™
-- Run in Supabase SQL Editor:
-- ============================================
-- ALTER TABLE lens_scores
--   ADD COLUMN IF NOT EXISTS opportunity_visibility_gap text;
-- ============================================

-- ============================================
-- v1.5 Migration — Question Scarcity Principle™ (QSP™)
-- Run in Supabase SQL Editor:
-- ============================================
-- ALTER TABLE lens_scores
--   ADD COLUMN IF NOT EXISTS strategic_question text,
--   ADD COLUMN IF NOT EXISTS transformational_question text;
-- ============================================

-- v1.6 Migration — Trust Quadrant Principle™ (TQP™)
-- Run in Supabase SQL Editor:
-- ============================================
-- ALTER TABLE lens_scores
--   ADD COLUMN IF NOT EXISTS trust_quadrant text,
--   ADD COLUMN IF NOT EXISTS trust_quadrant_explanation text,
--   ADD COLUMN IF NOT EXISTS trust_alignment_gap text,
--   ADD COLUMN IF NOT EXISTS trust_alignment_explanation text;
-- ============================================

-- ============================================
-- Clear cache to regenerate with new analysis fields:
-- delete from lens_scores;
-- delete from companies;
-- ============================================

-- v1.7 Migration — Industry Translation Layer™
-- Run in Supabase SQL Editor:
-- ============================================
-- ALTER TABLE lens_scores
--   ADD COLUMN IF NOT EXISTS detected_industry text,
--   ADD COLUMN IF NOT EXISTS constraint_translations jsonb;
-- ============================================

-- ─── v1.8 Go Deep™ — CTS™ Content Transformation System™ ────────────────────
-- Run in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS go_deep_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_input text NOT NULL,
  tcs_c_score integer,
  tier text,
  score_interpretation text,
  layers jsonb,
  builder jsonb,
  delta jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- ─── v1.9 Migration — Transformation Memory Layer™ ───────────────────────────
-- saved_items replaces saved_cards for session-based (no-auth) saves.
-- Run in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS saved_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text        NOT NULL,
  item_type   text        NOT NULL CHECK (item_type IN ('lens_card', 'go_deep_analysis', 'go_deep_rewrite')),
  title       text,
  content     jsonb,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_items_session_id ON saved_items(session_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_created_at ON saved_items(created_at);

-- Disable RLS so the service role key (and anon key) can write freely:
ALTER TABLE saved_items DISABLE ROW LEVEL SECURITY;

-- ─── v2.0 Migration — Transformation Blueprint™ ──────────────────────────────
-- Run in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS blueprints (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name     text,
  entity_type     text,
  source_lens_card jsonb,
  blueprint       jsonb,
  session_id      text,
  created_at      timestamp with time zone DEFAULT now()
);

ALTER TABLE blueprints DISABLE ROW LEVEL SECURITY;

-- enterprise_inquiries (updated schema with request_type and notes)
CREATE TABLE IF NOT EXISTS enterprise_inquiries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text,
  email        text,
  company      text,
  request_type text,
  notes        text,
  created_at   timestamp with time zone DEFAULT now()
);

ALTER TABLE enterprise_inquiries DISABLE ROW LEVEL SECURITY;

-- ─── v2.1 Migration — Opportunity ID™ (OID™) ─────────────────────────────────
-- Run in Supabase SQL Editor:
ALTER TABLE lens_scores ADD COLUMN IF NOT EXISTS opportunity_id text;

-- ─── v2.2 Migration — lens_reports (Stripe paywall) ─────────────────────────
-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS lens_reports (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name      text,
  ticker            text,
  user_email        text,
  free_report_json  jsonb,
  paid_report_json  jsonb,
  payment_status    text        DEFAULT 'free',
  stripe_session_id text,
  stripe_customer_id text,
  session_id        text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

ALTER TABLE lens_reports DISABLE ROW LEVEL SECURITY;

-- ─── v2.3 Migration — Discovery Intelligence™ ────────────────────────────────
-- Run in Supabase SQL Editor:
ALTER TABLE lens_scores ADD COLUMN IF NOT EXISTS discovery_intelligence jsonb;

-- ─── v2.4 Migration — Sources / Citations ────────────────────────────────────
-- Run in Supabase SQL Editor:
ALTER TABLE lens_scores ADD COLUMN IF NOT EXISTS sources jsonb;

-- ─── v2.5 Migration — lens_reports tier column ───────────────────────────────
-- Run in Supabase SQL Editor:
ALTER TABLE lens_reports ADD COLUMN IF NOT EXISTS tier text DEFAULT 'single';

-- ─── v2.6 Migration — Expand saved_items item_type constraint ────────────────
-- Run in Supabase SQL Editor:
-- Drops the old CHECK constraint and replaces it with one that includes
-- blueprint and mechanism_cashless_buyback item types.
ALTER TABLE saved_items DROP CONSTRAINT IF EXISTS saved_items_item_type_check;
ALTER TABLE saved_items ADD CONSTRAINT saved_items_item_type_check
  CHECK (item_type IN (
    'lens_card',
    'go_deep_analysis',
    'go_deep_rewrite',
    'blueprint',
    'mechanism_cashless_buyback'
  ));

-- ─── v2.7 Migration — Cached Stock Prices ────────────────────────────────────
-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS cached_stock_prices (
  ticker      text PRIMARY KEY,
  price       numeric NOT NULL,
  fetched_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE cached_stock_prices ENABLE ROW LEVEL SECURITY;

-- Allow public read (SELECT) — needed by the API route running with anon key
CREATE POLICY "public_select_cached_stock_prices"
  ON cached_stock_prices FOR SELECT
  USING (true);

-- Allow public insert — needed for first-time cache population
CREATE POLICY "public_insert_cached_stock_prices"
  ON cached_stock_prices FOR INSERT
  WITH CHECK (true);

-- Allow public update — needed for cache refresh after 24 hours
CREATE POLICY "public_update_cached_stock_prices"
  ON cached_stock_prices FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ─── v2.8 Migration — Opportunity Zone Cache ─────────────────────────────────
-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS opportunity_zone_cache (
  ticker                        text PRIMARY KEY,
  company_name                  text,
  market_cap                    numeric,
  price_change_3y               numeric,
  price_change_1y               numeric,
  sector                        text,
  sector_median_return_3y       numeric,
  fcf_yield                     numeric,
  share_count_trend             text,
  valuation_discount_vs_sector  numeric,
  segment_count                 integer,
  ceo_tenure_months             integer,
  activist_present              boolean DEFAULT false,
  operating_margin_trend        text,
  revenue_growth_vs_sector      text,
  peak_market_cap_10y           numeric,
  franchise_age_years           integer,
  opportunity_score             numeric,
  zones_assigned                text[],
  tier_assigned                 integer,
  cached_at                     timestamptz DEFAULT now(),
  narrative_why                 text,
  narrative_mechanisms          text[],
  narrative_tier_label          text
);

-- Enable RLS immediately
ALTER TABLE opportunity_zone_cache ENABLE ROW LEVEL SECURITY;

-- Public SELECT — needed by frontend and API routes using anon key
CREATE POLICY "public_select_opportunity_zone_cache"
  ON opportunity_zone_cache FOR SELECT
  USING (true);

-- Service role INSERT — used by screen/narrate API routes
CREATE POLICY "public_insert_opportunity_zone_cache"
  ON opportunity_zone_cache FOR INSERT
  WITH CHECK (true);

-- Service role UPDATE — used for cache refresh
CREATE POLICY "public_update_opportunity_zone_cache"
  ON opportunity_zone_cache FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ─── v2.9 Migration — PE Stack™ Inquiries ────────────────────────────────────
-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS pe_stack_inquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text NOT NULL,
  company         text NOT NULL,
  target_company  text,
  layers_selected text[] DEFAULT '{}',
  message         text,
  submitted_at    timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS immediately
ALTER TABLE pe_stack_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (form submissions)
CREATE POLICY "Allow anon insert pe_stack_inquiries" ON pe_stack_inquiries
  FOR INSERT TO anon WITH CHECK (true);

-- Deny all reads from anon (admin only via service role)
CREATE POLICY "Deny anon select pe_stack_inquiries" ON pe_stack_inquiries
  FOR SELECT TO anon USING (false);

-- ─── v3.0 Migration — Investor Stack™ Inquiries ──────────────────────────────
-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS investor_stack_inquiries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text NOT NULL,
  company         text NOT NULL,
  target_company  text,
  layers_selected text[] DEFAULT '{}',
  message         text,
  submitted_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE investor_stack_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert investor_stack_inquiries" ON investor_stack_inquiries
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Deny anon select investor_stack_inquiries" ON investor_stack_inquiries
  FOR SELECT TO anon USING (false);

-- ─── v3.1 Migration — Report Cache (Resilience Capacity + AI Governance) ─────
-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS report_cache (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker            text NOT NULL,
  report_type       text NOT NULL,  -- 'resilience_capacity' | 'ai_governance'
  stripe_session_id text NOT NULL,
  company_name      text NOT NULL,
  report_data       jsonb NOT NULL,
  generated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS report_cache_lookup
  ON report_cache (ticker, report_type, stripe_session_id);

ALTER TABLE report_cache DISABLE ROW LEVEL SECURITY;
