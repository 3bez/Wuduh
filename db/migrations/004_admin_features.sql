-- ══════════════════════════════════════════════════════════════════
-- 004 — Admin features: ban/suspend users + audit logging
-- ══════════════════════════════════════════════════════════════════

-- ── Ban / suspend ────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS banned     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "banReason" text;

CREATE INDEX IF NOT EXISTS users_banned_idx ON users(banned) WHERE banned = true;

-- ── Admin audit log ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action     text NOT NULL,           -- e.g. 'user.delete', 'user.ban', 'study.delete'
  target_type text NOT NULL,          -- 'user', 'study', 'export', 'session'
  target_id  text NOT NULL,           -- ID of the affected record
  detail     jsonb,                   -- optional extra context (old values, reason, etc.)
  ip         text,                    -- admin's IP address
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_action_idx   ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS audit_log_target_idx   ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS audit_log_created_idx  ON admin_audit_log("createdAt" DESC);
