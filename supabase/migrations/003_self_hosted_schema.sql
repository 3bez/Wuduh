-- ══════════════════════════════════════════════════════════════════
-- Wuduh — PostgreSQL Schema (self-hosted, no Supabase)
-- THIS IS THE ONLY MIGRATION THAT APPLIES TO THE CURRENT STACK.
-- Run this on a fresh PostgreSQL 17 instance.
--
-- Note on column naming:
--   Better Auth tables use camelCase columns (emailVerified, userId, etc.)
--   because Better Auth's initializer renames them. Our Wuduh tables
--   also use camelCase to match. All queries in the codebase use
--   quoted camelCase identifiers e.g. "userId", "startupName".
-- ══════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────
CREATE TYPE language     AS ENUM ('en', 'ar');
CREATE TYPE study_status AS ENUM ('draft', 'complete', 'exported');
CREATE TYPE answer_status AS ENUM ('done', 'skipped');

-- ── Better Auth tables ────────────────────────────────────────────
-- Managed by Better Auth. Column names are camelCase.

CREATE TABLE users (
  id              text PRIMARY KEY,
  email           text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  name            text,
  image           text,
  "createdAt"     timestamptz NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id          text PRIMARY KEY,
  "userId"    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       text NOT NULL UNIQUE,
  "expiresAt" timestamptz NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id                       text PRIMARY KEY,
  "userId"                 text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "accountId"              text NOT NULL,
  "providerId"             text NOT NULL,
  "accessToken"            text,
  "refreshToken"           text,
  "accessTokenExpiresAt"   timestamptz,
  "refreshTokenExpiresAt"  timestamptz,
  scope                    text,
  "idToken"                text,
  password                 text,
  "createdAt"              timestamptz NOT NULL DEFAULT now(),
  "updatedAt"              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE verifications (
  id          text PRIMARY KEY,
  identifier  text NOT NULL,
  value       text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- ── Wuduh tables ─────────────────────────────────────────────────
-- Application data. Column names also use camelCase for consistency.

CREATE TABLE profiles (
  id                  text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  "fullName"          text,
  "preferredLanguage" language,
  "createdAt"         timestamptz NOT NULL DEFAULT now(),
  "updatedAt"         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE studies (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"              text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "startupName"         text,
  language              language NOT NULL DEFAULT 'en',
  status                study_status NOT NULL DEFAULT 'draft',
  "logoUrl"             text,
  "completionPercentage" integer NOT NULL DEFAULT 0
    CHECK ("completionPercentage" BETWEEN 0 AND 100),
  "createdAt"           timestamptz NOT NULL DEFAULT now(),
  "updatedAt"           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE answers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "studyId"   uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  "cardId"    text NOT NULL,
  answer      jsonb,
  status      answer_status NOT NULL DEFAULT 'done',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("studyId", "cardId")
);

CREATE TABLE exports (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "studyId"            uuid NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  "userId"             text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pdf_url              text,
  language             language NOT NULL,
  "completionSnapshot" integer NOT NULL DEFAULT 0,
  "createdAt"          timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX sessions_user_id_idx         ON sessions("userId");
CREATE INDEX sessions_token_idx           ON sessions(token);
CREATE INDEX accounts_user_id_idx         ON accounts("userId");
CREATE INDEX verifications_identifier_idx ON verifications(identifier);
CREATE INDEX studies_user_id_idx          ON studies("userId");
CREATE INDEX answers_study_id_idx         ON answers("studyId");
CREATE INDEX answers_card_id_idx          ON answers("cardId");
CREATE INDEX exports_study_id_idx         ON exports("studyId");
CREATE INDEX exports_user_id_idx          ON exports("userId");

-- ── Trigger functions ─────────────────────────────────────────────

-- For Better Auth tables (camelCase updatedAt)
CREATE OR REPLACE FUNCTION set_updated_at_camel()
RETURNS trigger AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- For Wuduh tables (also camelCase updatedAt)
CREATE OR REPLACE FUNCTION set_updated_at_snake()
RETURNS trigger AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Better Auth table triggers
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at_camel();
CREATE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at_camel();
CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at_camel();
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at_camel();

-- Wuduh table triggers
CREATE TRIGGER set_studies_updated_at
  BEFORE UPDATE ON studies FOR EACH ROW EXECUTE FUNCTION set_updated_at_camel();
CREATE TRIGGER set_answers_updated_at
  BEFORE UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION set_updated_at_camel();

-- ── Auto-create profile on user creation ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, "fullName")
  VALUES (NEW.id, NEW.name)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
  AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
