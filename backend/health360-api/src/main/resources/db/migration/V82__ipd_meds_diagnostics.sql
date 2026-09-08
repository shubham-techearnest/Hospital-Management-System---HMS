-- V82: Phase I4 — eMAR outcomes, med reconciliation, critical lab ack

ALTER TABLE pharmacy.medication_administrations
    ADD COLUMN IF NOT EXISTS outcome VARCHAR(20) NOT NULL DEFAULT 'GIVEN',
    ADD COLUMN IF NOT EXISTS reason_code VARCHAR(40),
    ADD COLUMN IF NOT EXISTS reason_text TEXT;

ALTER TABLE pharmacy.medication_administrations
    DROP CONSTRAINT IF EXISTS chk_med_admin_outcome;

ALTER TABLE pharmacy.medication_administrations
    ADD CONSTRAINT chk_med_admin_outcome CHECK (
        outcome IN ('GIVEN', 'OMITTED', 'REFUSED')
    );

ALTER TABLE laboratory.lab_reports
    ADD COLUMN IF NOT EXISTS critical BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS critical_acknowledged_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS critical_acknowledged_by UUID,
    ADD COLUMN IF NOT EXISTS critical_ack_note TEXT;

CREATE INDEX IF NOT EXISTS idx_lab_reports_critical_pending
    ON laboratory.lab_reports (encounter_id, released_at DESC)
    WHERE deleted_at IS NULL AND critical = TRUE AND critical_acknowledged_at IS NULL;

CREATE TABLE ipd.medication_reconciliations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    recon_type      VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    summary_text    TEXT,
    decisions_json  JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_by    UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_med_recon_type CHECK (recon_type IN ('ADMIT', 'DISCHARGE')),
    CONSTRAINT chk_ipd_med_recon_status CHECK (status IN ('DRAFT', 'COMPLETED'))
);

CREATE INDEX idx_ipd_med_recon_admission
    ON ipd.medication_reconciliations (admission_id, recon_type, completed_at DESC)
    WHERE deleted_at IS NULL;
