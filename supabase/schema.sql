-- Run this once in your Supabase project's SQL editor
-- (Project → SQL Editor → New query → paste → Run)
--
-- NOTE: if you already ran an earlier version of this file, the old
-- "tournaments" table (name/sport/status/start_date/prize_pool only) needs
-- to be dropped first — this DELETES any rows already in it. Uncomment the
-- line below only if you're okay losing that data (there should be none
-- yet, since nothing in the app has written to it so far).
-- drop table if exists tournaments;

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport text not null,
  city text not null,
  venue text not null,
  format text,
  tag text,
  entry_fee_amount numeric not null,
  entry_fee_unit text not null default 'team',
  prize_pool numeric not null default 0,
  start_date date not null,
  end_date date,
  date_note text,
  hot boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'live', 'rejected', 'completed', 'cancelled')),
  rejection_reason text,
  organizer_name text not null,
  organizer_email text not null,
  organizer_phone text not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table tournaments enable row level security;

-- Public site (anon key) can only read tournaments marked "live".
-- Nothing else is exposed to anon — inserts happen through the
-- /api/tournaments/submit route using the service_role key, which forces
-- status = 'pending' server-side regardless of what the client sends.
-- The admin panel also uses the service_role key, which bypasses RLS entirely.
create policy "Public can read live tournaments"
  on tournaments for select
  using (status = 'live');
