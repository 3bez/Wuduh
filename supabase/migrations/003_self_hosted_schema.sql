-- ══════════════════════════════════════════════════════════════════
-- Wuduh — PostgreSQL Schema (self-hosted, no Supabase)
-- Run this in Coolify → Terminal → psql
-- ══════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────
create type language as enum ('en', 'ar');
create type study_status as enum ('draft', 'complete', 'exported');
create type answer_status as enum ('done', 'skipped');

-- ── users ────────────────────────────────────────────────────────
-- Managed by Better Auth
create table users (
  id                  text primary key,
  email               text not null unique,
  email_verified      boolean not null default false,
  name                text,
  image               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── sessions ─────────────────────────────────────────────────────
-- Managed by Better Auth
create table sessions (
  id          text primary key,
  user_id     text not null references users(id) on delete cascade,
  token       text not null unique,
  expires_at  timestamptz not null,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index sessions_user_id_idx on sessions(user_id);
create index sessions_token_idx   on sessions(token);

-- ── accounts ─────────────────────────────────────────────────────
-- Managed by Better Auth (OAuth + email/password)
create table accounts (
  id                    text primary key,
  user_id               text not null references users(id) on delete cascade,
  account_id            text not null,
  provider_id           text not null,
  access_token          text,
  refresh_token         text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope                 text,
  id_token              text,
  password              text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index accounts_user_id_idx on accounts(user_id);

-- ── verifications ─────────────────────────────────────────────────
-- Managed by Better Auth (email verification, password reset)
create table verifications (
  id          text primary key,
  identifier  text not null,
  value       text not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index verifications_identifier_idx on verifications(identifier);

-- ── profiles ─────────────────────────────────────────────────────
-- Wuduh-specific user data
create table profiles (
  id                  text primary key references users(id) on delete cascade,
  full_name           text,
  preferred_language  language,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── studies ──────────────────────────────────────────────────────
create table studies (
  id                    uuid primary key default gen_random_uuid(),
  user_id               text not null references users(id) on delete cascade,
  startup_name          text,
  language              language not null default 'en',
  status                study_status not null default 'draft',
  logo_url              text,
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index studies_user_id_idx on studies(user_id);

-- ── answers ──────────────────────────────────────────────────────
create table answers (
  id          uuid primary key default gen_random_uuid(),
  study_id    uuid not null references studies(id) on delete cascade,
  card_id     text not null,
  answer      jsonb,
  status      answer_status not null default 'done',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (study_id, card_id)
);

create index answers_study_id_idx on answers(study_id);
create index answers_card_id_idx  on answers(card_id);

-- ── exports ──────────────────────────────────────────────────────
create table exports (
  id                  uuid primary key default gen_random_uuid(),
  study_id            uuid not null references studies(id) on delete cascade,
  user_id             text not null references users(id) on delete cascade,
  pdf_url             text,
  language            language not null,
  completion_snapshot integer not null default 0,
  created_at          timestamptz not null default now()
);

create index exports_study_id_idx on exports(study_id);
create index exports_user_id_idx  on exports(user_id);

-- ── updated_at trigger ───────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_users_updated_at
  before update on users
  for each row execute function set_updated_at();

create trigger set_sessions_updated_at
  before update on sessions
  for each row execute function set_updated_at();

create trigger set_accounts_updated_at
  before update on accounts
  for each row execute function set_updated_at();

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger set_studies_updated_at
  before update on studies
  for each row execute function set_updated_at();

create trigger set_answers_updated_at
  before update on answers
  for each row execute function set_updated_at();

-- ── Auto-create profile on user creation ─────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.name)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql;

create trigger on_user_created
  after insert on users
  for each row execute function handle_new_user();
