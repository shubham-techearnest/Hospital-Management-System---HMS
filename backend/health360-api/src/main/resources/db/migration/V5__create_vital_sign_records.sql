-- V5: Vital sign records (append-only) — S4 US-PAT-009

CREATE TABLE patient.vital_sign_records (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    patient_id              UUID NOT NULL REFERENCES patient.patient_profiles (id),
    systolic_bp             INTEGER CHECK (systolic_bp IS NULL OR (systolic_bp BETWEEN 40 AND 300)),
    diastolic_bp            INTEGER CHECK (diastolic_bp IS NULL OR (diastolic_bp BETWEEN 20 AND 200)),
    heart_rate              INTEGER CHECK (heart_rate IS NULL OR (heart_rate BETWEEN 20 AND 300)),
    temperature             DECIMAL(4, 1),
    respiratory_rate        INTEGER,
    spo2                    INTEGER CHECK (spo2 IS NULL OR (spo2 BETWEEN 50 AND 100)),
    blood_glucose           DECIMAL(5, 1),
    glucose_reading_type    VARCHAR(20),
    recorded_at             TIMESTAMPTZ NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID NOT NULL
);

CREATE INDEX idx_vitals_patient_recorded ON patient.vital_sign_records (patient_id, recorded_at DESC);
CREATE INDEX idx_vitals_tenant_recorded ON patient.vital_sign_records (tenant_id, recorded_at DESC);
