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
  escrow_status text not null default 'collecting'
    check (escrow_status in ('collecting','holding','released','refunded')),
  escrow_balance numeric not null default 0,
  artist_released_amount numeric not null default 0,
  platform_fee_collected numeric not null default 0,
  raise_closed_at timestamptz,
  escrow_released_at timestamptz,
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
  custody text not null default 'in_escrow'
    check (custody in ('in_escrow','released_to_artist','refunded')),
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

create table if not exists escrow_events (
  id text primary key,
  listing_id text not null references listings(id),
  created_at timestamptz not null default now(),
  type text not null check (type in ('deposit','raise_closed','release_to_artist','platform_fee','note')),
  amount numeric not null default 0,
  note text
);

create index if not exists listings_status_idx on listings(status);
create index if not exists investments_listing_idx on investments(listing_id);
create index if not exists investments_email_idx on investments(fan_email);
create index if not exists documents_listing_idx on documents(listing_id);
create index if not exists escrow_events_listing_idx on escrow_events(listing_id);

comment on table listings is 'PROTOTYPE — not a live securities ledger';
comment on table investments is 'PROTOTYPE — commitments simulated; payment_processed stays false';
comment on table documents is 'PROTOTYPE — financial doc stubs; verified is manual flag only';
comment on table escrow_events is 'PROTOTYPE — simulated fiat escrow audit trail; no real bank movement';

-- Storage: create a public or private bucket named "muse-docs" in Supabase Dashboard
-- Storage → New bucket → muse-docs (private recommended)

-- Optional migration for existing DBs:
-- alter table listings add column if not exists escrow_status text default 'collecting';
-- alter table listings add column if not exists escrow_balance numeric default 0;
-- alter table listings add column if not exists artist_released_amount numeric default 0;
-- alter table listings add column if not exists platform_fee_collected numeric default 0;
-- alter table listings add column if not exists raise_closed_at timestamptz;
-- alter table listings add column if not exists escrow_released_at timestamptz;
-- alter table investments add column if not exists custody text default 'in_escrow';
