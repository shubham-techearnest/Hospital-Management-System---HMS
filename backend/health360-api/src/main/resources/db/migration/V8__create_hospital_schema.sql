-- V8: Hospital schema + doctor hospital associations [S7]

CREATE SCHEMA IF NOT EXISTS hospital;

-- =============================================================================
-- hospital.hospitals
-- =============================================================================

CREATE TABLE hospital.hospitals (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL REFERENCES shared.tenants (id),
    admin_user_id               UUID NOT NULL REFERENCES iam.users (id),
    name                        VARCHAR(300) NOT NULL,
    registration_number         VARCHAR(100) NOT NULL,
    hospital_type               VARCHAR(20) NOT NULL,
    established_year            INTEGER,
    total_bed_count             INTEGER,
    accreditation               VARCHAR(10),
    description                 TEXT,
    emergency_available_24x7    BOOLEAN NOT NULL DEFAULT false,
    emergency_phone             VARCHAR(20),
    ambulance_available         BOOLEAN NOT NULL DEFAULT false,
    icu_available               BOOLEAN NOT NULL DEFAULT false,
    icu_bed_count               INTEGER,
    icu_type                    VARCHAR(20),
    average_rating              DECIMAL(3, 2),
    review_count                INTEGER NOT NULL DEFAULT 0,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                  UUID,
    updated_by                  UUID,
    deleted_at                  TIMESTAMPTZ,
    version                     BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_hospitals_type
        CHECK (hospital_type IN ('GOVERNMENT', 'PRIVATE', 'TRUST', 'CLINIC')),
    CONSTRAINT chk_hospitals_accreditation
        CHECK (accreditation IS NULL OR accreditation IN ('NABH', 'JCI', 'NONE')),
    CONSTRAINT chk_hospitals_icu_type
        CHECK (icu_type IS NULL OR icu_type IN ('GENERAL', 'CRITICAL_CARE'))
);

CREATE UNIQUE INDEX uq_hospitals_tenant_registration
    ON hospital.hospitals (tenant_id, registration_number)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_hospitals_admin_user
    ON hospital.hospitals (tenant_id, admin_user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_hospitals_tenant_name ON hospital.hospitals (tenant_id, name);

-- =============================================================================
-- hospital.branches
-- =============================================================================

CREATE TABLE hospital.branches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    name            VARCHAR(200) NOT NULL,
    address_line1   VARCHAR(200) NOT NULL,
    address_line2   VARCHAR(200),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    pincode         VARCHAR(10) NOT NULL,
    country         CHAR(2) NOT NULL DEFAULT 'IN',
    latitude        DECIMAL(10, 7) NOT NULL,
    longitude       DECIMAL(10, 7) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    is_primary      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_branches_hospital ON hospital.branches (hospital_id);
CREATE INDEX idx_branches_geo ON hospital.branches (latitude, longitude);
CREATE INDEX idx_branches_city ON hospital.branches (city, state);

-- =============================================================================
-- hospital.branch_working_hours
-- =============================================================================

CREATE TABLE hospital.branch_working_hours (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id   UUID NOT NULL REFERENCES hospital.branches (id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    open_time   TIME NOT NULL,
    close_time  TIME NOT NULL,
    is_closed   BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT uq_branch_hours UNIQUE (branch_id, day_of_week),
    CONSTRAINT chk_branch_hours_day
        CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'))
);

-- =============================================================================
-- hospital.departments
-- =============================================================================

CREATE TABLE hospital.departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    floor           VARCHAR(20),
    head_doctor_id  UUID REFERENCES doctor.doctor_profiles (id),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_departments_hospital_name
    ON hospital.departments (hospital_id, name)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_departments_hospital ON hospital.departments (hospital_id);

-- =============================================================================
-- doctor.hospital_associations
-- =============================================================================

CREATE TABLE doctor.hospital_associations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    doctor_id       UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID REFERENCES hospital.branches (id),
    department_id   UUID REFERENCES hospital.departments (id),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_hospital_assoc_status
        CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE'))
);

CREATE UNIQUE INDEX uq_doctor_hospital_assoc
    ON doctor.hospital_associations (doctor_id, hospital_id, branch_id)
    WHERE deleted_at IS NULL AND status = 'ACTIVE';

CREATE INDEX idx_hosp_assoc_doctor ON doctor.hospital_associations (doctor_id, status);
CREATE INDEX idx_hosp_assoc_hospital ON doctor.hospital_associations (hospital_id, status);

-- =============================================================================
-- Hospital permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('hospital:profile', 'read', 'hospital:profile:read', 'Read hospital profile'),
    ('hospital:profile', 'write', 'hospital:profile:write', 'Write hospital profile'),
    ('hospital:doctors', 'read', 'hospital:doctors:read', 'Read hospital doctor roster'),
    ('hospital:doctors', 'write', 'hospital:doctors:write', 'Manage hospital doctor associations')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code IN (
    'health:read', 'user:read', 'user:write',
    'hospital:profile:read', 'hospital:profile:write',
    'hospital:doctors:read', 'hospital:doctors:write'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;
