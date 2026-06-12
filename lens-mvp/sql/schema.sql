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
