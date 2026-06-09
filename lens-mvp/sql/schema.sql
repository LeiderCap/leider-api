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
  transformation_rating text not null,
  trust_score text not null,
  courage_score text not null,
  yield_score text not null,
  equity_reclamation text,
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
