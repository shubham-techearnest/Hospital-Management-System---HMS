-- V42: P1-F1 — UHID, hospital patient registration, duplicate detection RBAC

ALTER TABLE patient.patient_profiles
    ADD COLUMN IF NOT EXISTS uhid VARCHAR(20),
    ADD COLUMN IF NOT EXISTS legal_first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS legal_last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS registration_source VARCHAR(30) NOT NULL DEFAULT 'APP';

CREATE UNIQUE INDEX IF NOT EXISTS uq_patient_profiles_tenant_uhid
    ON patient.patient_profiles (tenant_id, uhid)
    WHERE deleted_at IS NULL AND uhid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_profiles_tenant_phone
    ON patient.patient_profiles (tenant_id, primary_phone)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patient_profiles_tenant_dob
    ON patient.patient_profiles (tenant_id, date_of_birth)
    WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS patient.uhid_sequences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    sequence_year   INT NOT NULL,
    last_value      BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_uhid_sequences_tenant_year UNIQUE (tenant_id, sequence_year)
);

CREATE TABLE IF NOT EXISTS patient.hospital_registrations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID REFERENCES hospital.branches (id),
    registered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    registered_by       UUID NOT NULL,
    registration_number VARCHAR(30),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_hospital_registrations_patient_hospital_branch
    ON patient.hospital_registrations (patient_id, hospital_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid))
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hospital_registrations_hospital
    ON patient.hospital_registrations (tenant_id, hospital_id, registered_at DESC)
    WHERE deleted_at IS NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('patient:registry', 'read', 'patient:registry:read', 'Search and view hospital patient registry'),
    ('patient:registry', 'write', 'patient:registry:write', 'Register patients at hospital desk'),
    ('patient:registry', 'duplicate_override', 'patient:registry:duplicate_override', 'Override duplicate detection when registering')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'RECEPTIONIST'
  AND p.code IN ('patient:registry:read', 'patient:registry:write')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code LIKE 'patient:registry:%'
ON CONFLICT DO NOTHING;
