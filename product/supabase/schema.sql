-- Muse prototype schema (future Supabase / Postgres)
-- Do NOT treat as a live production schema without review.
-- Run in Supabase SQL editor when you are ready to leave the local JSON prototype.

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
  -- offer terms
  raise_amount numeric not null,
  share_pct numeric not null,
  term_months int not null,
  cap_multiple numeric not null,
  -- traction / revenue (prototype: denormalized JSON ok later)
  traction jsonb not null default '{}',
  revenue jsonb not null default '{}',
  pricing jsonb not null default '{}',
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
  -- prototype: no payment_intent_id yet
  payment_processed boolean not null default false
);

create index if not exists listings_status_idx on listings(status);
create index if not exists investments_listing_idx on investments(listing_id);
create index if not exists investments_email_idx on investments(fan_email);

comment on table listings is 'PROTOTYPE — not a live securities ledger';
comment on table investments is 'PROTOTYPE — commitments are simulated; payment_processed stays false until Stripe exists';
