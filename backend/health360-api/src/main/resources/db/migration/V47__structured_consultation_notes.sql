-- V47: P2-F3 — Structured consultation sections + draft/final status on clinical.notes

ALTER TABLE clinical.notes
    ADD COLUMN IF NOT EXISTS chief_complaint TEXT,
    ADD COLUMN IF NOT EXISTS hpi TEXT,
    ADD COLUMN IF NOT EXISTS examination TEXT,
    ADD COLUMN IF NOT EXISTS assessment TEXT,
    ADD COLUMN IF NOT EXISTS plan TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'FINAL',
    ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS finalized_by UUID;

ALTER TABLE clinical.notes DROP CONSTRAINT IF EXISTS chk_notes_status;
ALTER TABLE clinical.notes ADD CONSTRAINT chk_notes_status
    CHECK (status IN ('DRAFT', 'FINAL'));

-- Existing notes remain FINAL (default). Backfill finalized_at for legacy rows.
UPDATE clinical.notes
SET finalized_at = COALESCE(recorded_at, created_at),
    finalized_by = created_by
WHERE status = 'FINAL'
  AND finalized_at IS NULL
  AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notes_encounter_status
    ON clinical.notes (encounter_id, status, recorded_at DESC)
    WHERE deleted_at IS NULL;
