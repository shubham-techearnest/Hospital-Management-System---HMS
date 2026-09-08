-- V81: Phase I2 — enterprise bed statuses + reservation link on admission requests

ALTER TABLE ipd.beds DROP CONSTRAINT IF EXISTS chk_ipd_bed_status;

ALTER TABLE ipd.beds
    ADD CONSTRAINT chk_ipd_bed_status CHECK (
        status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED', 'CLEANING')
    );

ALTER TABLE ipd.admission_requests
    ADD COLUMN IF NOT EXISTS reserved_bed_id UUID REFERENCES ipd.beds (id);

CREATE INDEX IF NOT EXISTS idx_ipd_admission_requests_reserved_bed
    ON ipd.admission_requests (reserved_bed_id)
    WHERE deleted_at IS NULL AND reserved_bed_id IS NOT NULL;
