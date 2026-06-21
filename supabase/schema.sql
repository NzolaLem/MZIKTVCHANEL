-- MzikTV Tickets — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- The backend talks to these tables with the service-role key, which bypasses
-- Row Level Security. RLS is enabled with NO policies so that the public/anon
-- key can never read guest data even if it leaks.

create table if not exists guests (
  id text primary key,
  full_name text not null,
  normalized_name text not null,
  gender text not null,
  access_code text not null,
  event_slug text not null,
  ticket_type_id text not null,
  invite_label text not null,
  source text not null default 'admin',
  password_hash text not null,
  created_at timestamptz not null default now(),
  checked_in_at timestamptz
);

-- One guest per (name, invite code). Prevents duplicate guest-list entries and
-- lets the backend rely on the DB to reject duplicates atomically.
create unique index if not exists guests_name_code_idx
  on guests (normalized_name, access_code);

create table if not exists tickets (
  id text primary key,
  guest_id text not null references guests (id) on delete cascade,
  event_id text not null,
  issued_at timestamptz not null default now(),
  checked_in_at timestamptz,
  token_hash text,
  token_version integer not null default 2
);

create index if not exists tickets_guest_idx on tickets (guest_id);
create unique index if not exists tickets_guest_event_idx on tickets (guest_id, event_id);

create table if not exists checkins (
  id text primary key,
  ticket_id text not null,
  guest_id text not null references guests (id) on delete cascade,
  event_id text not null,
  checked_in_at timestamptz not null default now()
);

create index if not exists checkins_guest_idx on checkins (guest_id);
create unique index if not exists checkins_ticket_idx on checkins (ticket_id);
create unique index if not exists checkins_guest_event_idx on checkins (guest_id, event_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'checkins_ticket_id_fkey'
  ) then
    alter table checkins
      add constraint checkins_ticket_id_fkey
      foreign key (ticket_id) references tickets (id) on delete cascade;
  end if;
end $$;

-- Lock the tables down to the service role only.
alter table guests enable row level security;
alter table tickets enable row level security;
alter table checkins enable row level security;
