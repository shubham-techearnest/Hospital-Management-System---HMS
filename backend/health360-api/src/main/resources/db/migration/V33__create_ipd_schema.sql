-- V33: HMS-3 — IPD module (wards, rooms, beds, admissions, rounds, discharge)

CREATE SCHEMA IF NOT EXISTS ipd;

-- =============================================================================
-- ipd.wards
-- =============================================================================

CREATE TABLE ipd.wards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
    department_id   UUID REFERENCES hospital.departments (id),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    ward_type       VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_ward_type CHECK (
        ward_type IN ('GENERAL', 'PRIVATE', 'SEMI_PRIVATE', 'PEDIATRIC', 'MATERNITY', 'OTHER')
    )
);

CREATE UNIQUE INDEX uq_ipd_wards_branch_code
    ON ipd.wards (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_ipd_wards_hospital ON ipd.wards (hospital_id, branch_id, active)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ipd.rooms
-- =============================================================================

CREATE TABLE ipd.rooms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    ward_id         UUID NOT NULL REFERENCES ipd.wards (id),
    name            VARCHAR(50) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_ipd_rooms_ward_code
    ON ipd.rooms (ward_id, code)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ipd.beds
-- =============================================================================

CREATE TABLE ipd.beds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    room_id         UUID NOT NULL REFERENCES ipd.rooms (id),
    bed_number      VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_bed_status CHECK (
        status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED')
    )
);

CREATE UNIQUE INDEX uq_ipd_beds_room_number
    ON ipd.beds (room_id, bed_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_ipd_beds_status ON ipd.beds (room_id, status)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ipd.admissions
-- =============================================================================

CREATE TABLE ipd.admissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID NOT NULL REFERENCES hospital.branches (id),
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    primary_doctor_id   UUID REFERENCES doctor.doctor_profiles (id),
    admission_number    VARCHAR(50) NOT NULL,
    admission_reason    TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'ADMITTED',
    admitted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharged_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_admission_status CHECK (
        status IN ('ADMITTED', 'DISCHARGED', 'TRANSFERRED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_ipd_admissions_encounter
    ON ipd.admissions (encounter_id)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_ipd_admissions_number
    ON ipd.admissions (hospital_id, admission_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_ipd_admissions_hospital_status
    ON ipd.admissions (hospital_id, branch_id, status, admitted_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ipd.bed_assignments
-- =============================================================================

CREATE TABLE ipd.bed_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    bed_id          UUID NOT NULL REFERENCES ipd.beds (id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at     TIMESTAMPTZ,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_ipd_bed_assignments_active_bed
    ON ipd.bed_assignments (bed_id)
    WHERE deleted_at IS NULL AND active = TRUE;

CREATE INDEX idx_ipd_bed_assignments_admission
    ON ipd.bed_assignments (admission_id, assigned_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ipd.rounds
-- =============================================================================

CREATE TABLE ipd.rounds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    round_type      VARCHAR(20) NOT NULL DEFAULT 'DOCTOR',
    notes           TEXT NOT NULL,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_round_type CHECK (round_type IN ('DOCTOR', 'NURSING'))
);

CREATE INDEX idx_ipd_rounds_admission ON ipd.rounds (admission_id, recorded_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ipd.discharge_summaries
-- =============================================================================

CREATE TABLE ipd.discharge_summaries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    admission_id        UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    summary_text        TEXT NOT NULL,
    follow_up_plan      TEXT,
    discharged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_ipd_discharge_admission
    ON ipd.discharge_summaries (admission_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RBAC permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('ipd:ward', 'read', 'ipd:ward:read', 'View IPD wards and rooms'),
    ('ipd:ward', 'write', 'ipd:ward:write', 'Manage IPD wards and rooms'),
    ('ipd:bed', 'read', 'ipd:bed:read', 'View IPD beds'),
    ('ipd:bed', 'write', 'ipd:bed:write', 'Manage IPD beds'),
    ('ipd:admission', 'read', 'ipd:admission:read', 'View IPD admissions'),
    ('ipd:admission', 'write', 'ipd:admission:write', 'Admit and manage inpatients'),
    ('ipd:round', 'read', 'ipd:round:read', 'View IPD rounds'),
    ('ipd:round', 'write', 'ipd:round:write', 'Record IPD rounds'),
    ('ipd:discharge', 'write', 'ipd:discharge:write', 'Discharge inpatients')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code LIKE 'ipd:%'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN (
      'ipd:ward:read', 'ipd:bed:read',
      'ipd:admission:read', 'ipd:admission:write',
      'ipd:round:read', 'ipd:round:write',
      'ipd:discharge:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code LIKE 'ipd:%'
ON CONFLICT DO NOTHING;
