-- ══════════════════════════════════════════════════════════════════
-- Wuduh — Phase 1 Database Schema
-- Run this in: Supabase → SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────
create type language as enum ('en', 'ar');
create type study_status as enum ('draft', 'complete', 'exported');
create type answer_status as enum ('done', 'skipped');


-- ── profiles ─────────────────────────────────────────────────────
-- Extends auth.users with Wuduh-specific fields.
-- A row is auto-created when a user signs up (see trigger below).
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  preferred_language  language,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── studies ──────────────────────────────────────────────────────
-- One row per founder study. MVP allows multiple studies per user.
create table public.studies (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  startup_name          text,
  language              language not null default 'en',
  status                study_status not null default 'draft',
  logo_url              text,
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index studies_user_id_idx on public.studies(user_id);

-- Row Level Security
alter table public.studies enable row level security;

create policy "Users can view their own studies"
  on public.studies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own studies"
  on public.studies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own studies"
  on public.studies for update
  using (auth.uid() = user_id);


-- ── answers ──────────────────────────────────────────────────────
-- One row per card per study. JSONB answer stores different shapes
-- depending on card type (text, table rows, file URL).
create table public.answers (
  id          uuid primary key default gen_random_uuid(),
  study_id    uuid not null references public.studies(id) on delete cascade,
  card_id     text not null,             -- e.g. 'C0', 'S1_01'
  answer      jsonb,                     -- null until answered
  status      answer_status not null default 'done',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Each card can only have one answer per study
  unique (study_id, card_id)
);

create index answers_study_id_idx on public.answers(study_id);
create index answers_card_id_idx  on public.answers(card_id);

-- Row Level Security
alter table public.answers enable row level security;

create policy "Users can view answers for their own studies"
  on public.answers for select
  using (
    exists (
      select 1 from public.studies
      where studies.id = answers.study_id
        and studies.user_id = auth.uid()
    )
  );

create policy "Users can insert answers for their own studies"
  on public.answers for insert
  with check (
    exists (
      select 1 from public.studies
      where studies.id = answers.study_id
        and studies.user_id = auth.uid()
    )
  );

create policy "Users can update answers for their own studies"
  on public.answers for update
  using (
    exists (
      select 1 from public.studies
      where studies.id = answers.study_id
        and studies.user_id = auth.uid()
    )
  );


-- ── exports ──────────────────────────────────────────────────────
-- One row per export event. Used for history and re-download.
create table public.exports (
  id                  uuid primary key default gen_random_uuid(),
  study_id            uuid not null references public.studies(id) on delete cascade,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  pdf_url             text,
  language            language not null,
  completion_snapshot integer not null default 0,
  created_at          timestamptz not null default now()
);

create index exports_study_id_idx on public.exports(study_id);
create index exports_user_id_idx  on public.exports(user_id);

-- Row Level Security
alter table public.exports enable row level security;

create policy "Users can view their own exports"
  on public.exports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own exports"
  on public.exports for insert
  with check (auth.uid() = user_id);


-- ── updated_at triggers ──────────────────────────────────────────
-- Automatically update the updated_at column on every row change.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_studies_updated_at
  before update on public.studies
  for each row execute function public.set_updated_at();

create trigger set_answers_updated_at
  before update on public.answers
  for each row execute function public.set_updated_at();


-- ── Storage bucket ───────────────────────────────────────────────
-- Create a bucket for founder logos and uploads.
-- Run this separately if the bucket doesn't already exist.

insert into storage.buckets (id, name, public)
values ('wuduh-uploads', 'wuduh-uploads', false)
on conflict (id) do nothing;

-- RLS on storage: users can only access their own folder
create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'wuduh-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update files in their own folder"
  on storage.objects for update
  using (
    bucket_id = 'wuduh-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view files in their own folder"
  on storage.objects for select
  using (
    bucket_id = 'wuduh-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete files in their own folder"
  on storage.objects for delete
  using (
    bucket_id = 'wuduh-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
