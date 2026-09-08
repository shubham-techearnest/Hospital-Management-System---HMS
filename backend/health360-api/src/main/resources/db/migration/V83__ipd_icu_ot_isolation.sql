-- V83: Phase I5 — ICU escalate/step-down fields, isolation, blood stub

ALTER TABLE ipd.admissions
    ADD COLUMN IF NOT EXISTS isolation_required BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS care_level VARCHAR(40),
    ADD COLUMN IF NOT EXISTS active_icu_stay_id UUID;

CREATE INDEX IF NOT EXISTS idx_ipd_admissions_active_icu
    ON ipd.admissions (active_icu_stay_id)
    WHERE deleted_at IS NULL AND active_icu_stay_id IS NOT NULL;

CREATE TABLE ipd.blood_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    product_type    VARCHAR(40) NOT NULL DEFAULT 'PRBC',
    units           INTEGER NOT NULL DEFAULT 1,
    urgency         VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    indication      TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    notes           TEXT,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    requested_by    UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_blood_status CHECK (
        status IN ('REQUESTED', 'ACKNOWLEDGED', 'FULFILLED', 'CANCELLED')
    ),
    CONSTRAINT chk_ipd_blood_urgency CHECK (
        urgency IN ('ROUTINE', 'URGENT', 'EMERGENCY')
    )
);

CREATE INDEX idx_ipd_blood_requests_admission
    ON ipd.blood_requests (admission_id, requested_at DESC)
    WHERE deleted_at IS NULL;
