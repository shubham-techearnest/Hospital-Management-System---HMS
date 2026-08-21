-- V48: P2-F4 — E-prescription (clinical.prescriptions) separate from pharmacy fulfillment

CREATE TABLE clinical.prescriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id            UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id              UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id               UUID NOT NULL REFERENCES hospital.branches (id),
    prescription_number     VARCHAR(50) NOT NULL,
    status                  VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    notes                   TEXT,
    prescribed_by           UUID,
    signed_at               TIMESTAMPTZ,
    signed_by               UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_prescription_status CHECK (
        status IN ('DRAFT', 'SIGNED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_prescriptions_number_tenant
    ON clinical.prescriptions (tenant_id, prescription_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_prescriptions_encounter
    ON clinical.prescriptions (encounter_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_prescriptions_patient_status
    ON clinical.prescriptions (patient_id, status, signed_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE clinical.prescription_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    prescription_id         UUID NOT NULL REFERENCES clinical.prescriptions (id),
    medicine_id             UUID REFERENCES pharmacy.medicines (id),
    medicine_code           VARCHAR(30),
    medicine_name           VARCHAR(300) NOT NULL,
    dose_text               VARCHAR(100),
    route                   VARCHAR(30),
    frequency               VARCHAR(100),
    duration_days           INTEGER,
    quantity                INTEGER NOT NULL DEFAULT 1,
    instructions            TEXT,
    safety_warning          VARCHAR(500),
    sort_order              INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_prescription_items_rx
    ON clinical.prescription_items (prescription_id, sort_order)
    WHERE deleted_at IS NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('clinical:prescription', 'read', 'clinical:prescription:read', 'View clinical e-prescriptions'),
    ('clinical:prescription', 'write', 'clinical:prescription:write', 'Create and update draft e-prescriptions'),
    ('clinical:prescription', 'sign', 'clinical:prescription:sign', 'Sign e-prescriptions (immutable)')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN (
      'clinical:prescription:read',
      'clinical:prescription:write',
      'clinical:prescription:sign'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('PHARMACIST', 'NURSE', 'RECEPTIONIST')
  AND p.code = 'clinical:prescription:read'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code = 'clinical:prescription:read'
ON CONFLICT DO NOTHING;
