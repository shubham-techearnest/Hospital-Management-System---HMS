-- V80: Phase I1 — IPD admission requests (OPD → IPD lifecycle)

CREATE TABLE ipd.admission_requests (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id               UUID NOT NULL REFERENCES hospital.branches (id),
    patient_id              UUID NOT NULL REFERENCES patient.patient_profiles (id),
    source_encounter_id     UUID REFERENCES clinical.encounters (id),
    referring_doctor_id     UUID,
    attending_doctor_id     UUID,
    department_id           UUID REFERENCES hospital.departments (id),
    request_number          VARCHAR(50) NOT NULL,
    admission_source        VARCHAR(40) NOT NULL,
    admission_type          VARCHAR(40) NOT NULL,
    status                  VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    priority                VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    reason_for_admission    TEXT,
    provisional_diagnosis   TEXT,
    requested_care_level    VARCHAR(40),
    requested_room_category VARCHAR(40),
    expected_los_days       INTEGER,
    planned_procedure       TEXT,
    isolation_required      BOOLEAN NOT NULL DEFAULT FALSE,
    special_requirements    TEXT,
    notes                   TEXT,
    requested_admit_at      TIMESTAMPTZ,
    scheduled_admit_at      TIMESTAMPTZ,
    reviewed_at             TIMESTAMPTZ,
    reviewed_by             UUID,
    review_notes            TEXT,
    rejection_reason        TEXT,
    resulting_admission_id  UUID REFERENCES ipd.admissions (id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_admission_request_status CHECK (
        status IN (
            'REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED',
            'SCHEDULED', 'CANCELLED', 'ADMITTED'
        )
    ),
    CONSTRAINT chk_ipd_admission_request_source CHECK (
        admission_source IN (
            'OPD', 'EMERGENCY', 'DIRECT', 'REFERRAL', 'TRANSFER_IN',
            'PLANNED_SURGERY', 'DAY_CARE', 'ICU_TRANSFER', 'HDU_TRANSFER', 'OTHER'
        )
    ),
    CONSTRAINT chk_ipd_admission_request_type CHECK (
        admission_type IN (
            'ELECTIVE', 'EMERGENCY', 'URGENT', 'ROUTINE', 'PLANNED',
            'SURGICAL', 'MEDICAL', 'OBSERVATION', 'ICU', 'HDU',
            'ISOLATION', 'MATERNITY', 'PEDIATRIC', 'ONCOLOGY', 'OTHER'
        )
    ),
    CONSTRAINT chk_ipd_admission_request_priority CHECK (
        priority IN ('ROUTINE', 'URGENT', 'EMERGENCY')
    )
);

CREATE UNIQUE INDEX uq_ipd_admission_requests_number
    ON ipd.admission_requests (hospital_id, request_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_ipd_admission_requests_scope_status
    ON ipd.admission_requests (tenant_id, hospital_id, branch_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_ipd_admission_requests_patient
    ON ipd.admission_requests (patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_ipd_admission_requests_source_encounter
    ON ipd.admission_requests (source_encounter_id)
    WHERE deleted_at IS NULL AND source_encounter_id IS NOT NULL;

ALTER TABLE ipd.admissions
    ADD COLUMN IF NOT EXISTS admission_request_id UUID REFERENCES ipd.admission_requests (id),
    ADD COLUMN IF NOT EXISTS admission_source VARCHAR(40),
    ADD COLUMN IF NOT EXISTS admission_type VARCHAR(40);

CREATE INDEX IF NOT EXISTS idx_ipd_admissions_request
    ON ipd.admissions (admission_request_id)
    WHERE deleted_at IS NULL AND admission_request_id IS NOT NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('ipd:admission-request', 'read', 'ipd:admission-request:read', 'View IPD admission requests'),
    ('ipd:admission-request', 'create', 'ipd:admission-request:create', 'Create IPD admission requests'),
    ('ipd:admission-request', 'review', 'ipd:admission-request:review', 'Review / approve / schedule IPD admission requests')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND r.deleted_at IS NULL
  AND p.code IN (
      'ipd:admission-request:read',
      'ipd:admission-request:create',
      'ipd:admission-request:review'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND r.deleted_at IS NULL
  AND p.code IN ('ipd:admission-request:read', 'ipd:admission-request:create')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'RECEPTIONIST'
  AND r.deleted_at IS NULL
  AND p.code IN ('ipd:admission-request:read', 'ipd:admission-request:create')
ON CONFLICT DO NOTHING;
