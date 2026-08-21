-- V43: P1-F2 — Encounter-scoped clinical vitals + RBAC

CREATE TABLE IF NOT EXISTS clinical.vital_signs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id            UUID NOT NULL REFERENCES clinical.encounters (id),
    systolic_bp             INTEGER CHECK (systolic_bp IS NULL OR (systolic_bp BETWEEN 40 AND 300)),
    diastolic_bp            INTEGER CHECK (diastolic_bp IS NULL OR (diastolic_bp BETWEEN 20 AND 200)),
    heart_rate              INTEGER CHECK (heart_rate IS NULL OR (heart_rate BETWEEN 20 AND 300)),
    temperature             DECIMAL(4, 1),
    respiratory_rate        INTEGER,
    spo2                    INTEGER CHECK (spo2 IS NULL OR (spo2 BETWEEN 50 AND 100)),
    blood_glucose           DECIMAL(5, 1),
    glucose_reading_type    VARCHAR(20),
    notes                   VARCHAR(500),
    recorded_at             TIMESTAMPTZ NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_clinical_vitals_encounter_recorded
    ON clinical.vital_signs (encounter_id, recorded_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clinical_vitals_tenant_recorded
    ON clinical.vital_signs (tenant_id, recorded_at DESC)
    WHERE deleted_at IS NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('clinical:vitals', 'read', 'clinical:vitals:read', 'View encounter-scoped clinical vitals'),
    ('clinical:vitals', 'write', 'clinical:vitals:write', 'Record encounter-scoped clinical vitals')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'RECEPTIONIST'
  AND p.code = 'clinical:vitals:read'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('NURSE', 'ICU_NURSE', 'DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN ('clinical:vitals:read', 'clinical:vitals:write')
ON CONFLICT DO NOTHING;
