-- V23: S15 — polish features (facilities, gallery, awards, memberships, patient summary permission)

-- =============================================================================
-- doctor.awards
-- =============================================================================

CREATE TABLE doctor.awards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    doctor_id       UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    title           VARCHAR(200) NOT NULL,
    organization    VARCHAR(200),
    award_year      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_doctor_awards_doctor ON doctor.awards (doctor_id) WHERE deleted_at IS NULL;

-- =============================================================================
-- doctor.memberships
-- =============================================================================

CREATE TABLE doctor.memberships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    doctor_id       UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    organization    VARCHAR(200) NOT NULL,
    membership_id   VARCHAR(100),
    member_since    INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_doctor_memberships_doctor ON doctor.memberships (doctor_id) WHERE deleted_at IS NULL;

-- =============================================================================
-- hospital.facilities
-- =============================================================================

CREATE TABLE hospital.facilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID REFERENCES hospital.branches (id),
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(30) NOT NULL,
    description     TEXT,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_facility_category
        CHECK (category IN ('DIAGNOSTIC', 'SURGICAL', 'EMERGENCY', 'ICU', 'PHARMACY', 'PARKING', 'OTHER'))
);

CREATE INDEX idx_hospital_facilities_hospital ON hospital.facilities (hospital_id) WHERE deleted_at IS NULL;

-- =============================================================================
-- hospital.gallery_images
-- =============================================================================

CREATE TABLE hospital.gallery_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    s3_key          VARCHAR(500) NOT NULL,
    caption         VARCHAR(300),
    display_order   INTEGER NOT NULL DEFAULT 0,
    file_size_bytes BIGINT NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_hospital_gallery_hospital ON hospital.gallery_images (hospital_id, display_order)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- S15 permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('patient', 'summary:read', 'patient:summary:read', 'Read limited patient summary during appointment window')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code = 'patient:summary:read'
ON CONFLICT (role_id, permission_id) DO NOTHING;
