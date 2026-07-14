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
  image_url text,
  description text,
  entry_fee_amount numeric not null,
  entry_fee_unit text not null default 'team',
  prize_pool numeric not null default 0,
  advance_amount numeric,
  first_prize numeric,
  second_prize numeric,
  start_date date not null,
  end_date date,
  date_note text,
  start_time text,
  rules text,
  other_contact text,
  trophy_details text,
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

-- Safe to re-run: adds the columns above to a "tournaments" table that
-- already exists from an earlier version of this file, without touching
-- existing rows.
alter table tournaments add column if not exists image_url text;
alter table tournaments add column if not exists description text;
alter table tournaments add column if not exists advance_amount numeric;
alter table tournaments add column if not exists first_prize numeric;
alter table tournaments add column if not exists second_prize numeric;
alter table tournaments add column if not exists start_time text;
alter table tournaments add column if not exists rules text;
alter table tournaments add column if not exists other_contact text;
alter table tournaments add column if not exists trophy_details text;

alter table tournaments enable row level security;

-- Public site (anon key) can only read tournaments marked "live".
-- Nothing else is exposed to anon — inserts happen through the
-- /api/tournaments/submit route using the service_role key, which forces
-- status = 'pending' server-side regardless of what the client sends.
-- The admin panel also uses the service_role key, which bypasses RLS entirely.
create policy "Public can read live tournaments"
  on tournaments for select
  using (status = 'live');

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  reason text not null default 'general'
    check (reason in ('general', 'player', 'organizer')),
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- No public policies here on purpose: inserts happen through the
-- /api/contact/submit route using the service_role key. Nothing is
-- exposed to the anon key — only the admin panel (also service_role)
-- reads these.
