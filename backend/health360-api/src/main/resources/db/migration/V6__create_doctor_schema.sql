-- V6: Doctor schema [DOC-06 §6] — S5 Doctor Profile

CREATE SCHEMA IF NOT EXISTS doctor;

-- =============================================================================
-- doctor.doctor_profiles (aggregate root)
-- =============================================================================

CREATE TABLE doctor.doctor_profiles (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                       UUID NOT NULL REFERENCES shared.tenants (id),
    user_id                         UUID NOT NULL REFERENCES iam.users (id),
    title                           VARCHAR(10) NOT NULL DEFAULT 'DR',
    medical_registration_number     VARCHAR(100),
    registration_council            VARCHAR(200),
    registration_year               INTEGER,
    registration_expiry             DATE,
    gender                          VARCHAR(30),
    biography                       TEXT,
    profile_photo_url               VARCHAR(500),
    total_years_experience          INTEGER,
    primary_specialization_id       UUID REFERENCES shared.specializations (id),
    verification_status             VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    verification_rejection_reason   TEXT,
    verified_at                     TIMESTAMPTZ,
    verified_by                     UUID REFERENCES iam.users (id),
    average_rating                  DECIMAL(3, 2),
    review_count                    INTEGER NOT NULL DEFAULT 0,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                      UUID,
    updated_by                      UUID,
    deleted_at                      TIMESTAMPTZ,
    version                         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_doctor_profiles_verification_status
        CHECK (verification_status IN ('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
    CONSTRAINT chk_doctor_profiles_rating
        CHECK (average_rating IS NULL OR (average_rating >= 1.00 AND average_rating <= 5.00))
);

CREATE UNIQUE INDEX uq_doctors_tenant_user
    ON doctor.doctor_profiles (tenant_id, user_id)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_doctors_tenant_registration
    ON doctor.doctor_profiles (tenant_id, medical_registration_number)
    WHERE deleted_at IS NULL AND medical_registration_number IS NOT NULL;

CREATE INDEX idx_doctors_verification_status
    ON doctor.doctor_profiles (tenant_id, verification_status);

CREATE INDEX idx_doctors_specialization
    ON doctor.doctor_profiles (primary_specialization_id);

-- =============================================================================
-- Child entities
-- =============================================================================

CREATE TABLE doctor.qualifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    doctor_id           UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    degree              VARCHAR(200) NOT NULL,
    institution         VARCHAR(200) NOT NULL,
    year_of_completion  INTEGER NOT NULL,
    country             CHAR(2) NOT NULL DEFAULT 'IN',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_qualifications_doctor ON doctor.qualifications (doctor_id);

CREATE TABLE doctor.experience_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    doctor_id       UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    institution     VARCHAR(200) NOT NULL,
    position        VARCHAR(200) NOT NULL,
    start_year      INTEGER NOT NULL,
    end_year        INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_experience_doctor ON doctor.experience_entries (doctor_id);

CREATE TABLE doctor.doctor_sub_specializations (
    doctor_id           UUID NOT NULL REFERENCES doctor.doctor_profiles (id) ON DELETE CASCADE,
    specialization_id   UUID NOT NULL REFERENCES shared.specializations (id),
    PRIMARY KEY (doctor_id, specialization_id)
);

-- Profile-level consultation defaults (per-hospital configs added in S7)
CREATE TABLE doctor.consultation_defaults (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    doctor_id           UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    consultation_type   VARCHAR(20) NOT NULL,
    fee_amount          DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency            CHAR(3) NOT NULL DEFAULT 'INR',
    duration_minutes    INTEGER NOT NULL DEFAULT 15,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_consultation_defaults_fee CHECK (fee_amount >= 0),
    CONSTRAINT chk_consultation_defaults_type
        CHECK (consultation_type IN ('IN_PERSON', 'FOLLOW_UP'))
);

CREATE UNIQUE INDEX uq_consultation_defaults_doctor_type
    ON doctor.consultation_defaults (doctor_id, consultation_type)
    WHERE deleted_at IS NULL;
