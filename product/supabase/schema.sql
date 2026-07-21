-- Muse prototype schema (Supabase / Postgres)
-- Run in Supabase SQL editor. Still PROTOTYPE — not a live securities ledger.

create extension if not exists "pgcrypto";

create table if not exists artists (
  id text primary key,
  created_at timestamptz not null default now(),
  stage_name text not null,
  legal_name text,
  email text not null,
  genre text,
  location text,
  bio text,
  links text,
  raise_purpose text
);

create table if not exists listings (
  id text primary key,
  artist_id text not null references artists(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null check (status in ('draft','pending_review','live','funded','closed')),
  raise_amount numeric not null,
  share_pct numeric not null,
  term_months int not null,
  cap_multiple numeric not null,
  traction jsonb not null default '{}',
  revenue jsonb not null default '{}',
  pricing jsonb not null default '{}',
  profile jsonb not null default '{}',
  raised_amount numeric not null default 0,
  auto_approved boolean not null default false,
  prototype boolean not null default true
);

create table if not exists investments (
  id text primary key,
  listing_id text not null references listings(id),
  created_at timestamptz not null default now(),
  fan_name text,
  fan_email text not null,
  amount numeric not null,
  fan_fraction numeric not null,
  status text not null check (status in ('interest','committed')),
  payment_processed boolean not null default false
);

create table if not exists payouts (
  id text primary key,
  listing_id text not null references listings(id),
  created_at timestamptz not null default now(),
  period_label text not null,
  defined_net numeric not null,
  pool_amount numeric not null,
  distributions jsonb not null default '[]',
  note text
);

create table if not exists documents (
  id text primary key,
  listing_id text not null references listings(id),
  artist_id text not null,
  created_at timestamptz not null default now(),
  filename text not null,
  mime_type text not null,
  size_bytes int not null,
  category text not null,
  storage_path text not null,
  verified boolean not null default false,
  prototype boolean not null default true
);

create index if not exists listings_status_idx on listings(status);
create index if not exists investments_listing_idx on investments(listing_id);
create index if not exists investments_email_idx on investments(fan_email);
create index if not exists documents_listing_idx on documents(listing_id);

comment on table listings is 'PROTOTYPE — not a live securities ledger';
comment on table investments is 'PROTOTYPE — commitments simulated; payment_processed stays false';
comment on table documents is 'PROTOTYPE — financial doc stubs; verified is manual flag only';

-- Storage: create a public or private bucket named "muse-docs" in Supabase Dashboard
-- Storage → New bucket → muse-docs (private recommended)
