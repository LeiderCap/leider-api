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
