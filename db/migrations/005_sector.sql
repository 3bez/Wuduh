-- ══════════════════════════════════════════════════════════════════
-- 005 — Add sector column to studies
-- Existing studies default to 'general' (the full 58-card universal study).
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE studies
  ADD COLUMN IF NOT EXISTS sector text NOT NULL DEFAULT 'general';

CREATE INDEX IF NOT EXISTS studies_sector_idx ON studies(sector);
