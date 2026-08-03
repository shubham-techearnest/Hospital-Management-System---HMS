-- V3: Patient schema [DOC-06 §5] — S3 Patient Profile Core

CREATE SCHEMA IF NOT EXISTS patient;

-- =============================================================================
-- patient.patient_profiles (aggregate root)
-- =============================================================================

CREATE TABLE patient.patient_profiles (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                       UUID NOT NULL REFERENCES shared.tenants (id),
    user_id                         UUID NOT NULL REFERENCES iam.users (id),
    consent_accepted                BOOLEAN NOT NULL DEFAULT FALSE,
    consent_accepted_at             TIMESTAMPTZ,
    completion_score                INTEGER NOT NULL DEFAULT 0,
    date_of_birth                   DATE,
    gender                          VARCHAR(30),
    blood_group                     VARCHAR(5),
    marital_status                  VARCHAR(20),
    nationality                     CHAR(2) DEFAULT 'IN',
    profile_photo_url               VARCHAR(500),
    primary_phone                   VARCHAR(20),
    secondary_phone                 VARCHAR(20),
    permanent_address_line1         VARCHAR(200),
    permanent_address_line2         VARCHAR(200),
    permanent_city                  VARCHAR(100),
    permanent_state                 VARCHAR(100),
    permanent_pincode               VARCHAR(10),
    permanent_country               CHAR(2) DEFAULT 'IN',
    current_address_line1           VARCHAR(200),
    current_address_line2           VARCHAR(200),
    current_city                    VARCHAR(100),
    current_state                   VARCHAR(100),
    current_pincode                 VARCHAR(10),
    current_country                 CHAR(2),
    height_cm                       DECIMAL(5, 1),
    weight_kg                       DECIMAL(5, 1),
    waist_cm                        DECIMAL(5, 1),
    hip_cm                          DECIMAL(5, 1),
    neck_cm                         DECIMAL(5, 1),
    body_fat_percent                DECIMAL(4, 1),
    measured_at                     TIMESTAMPTZ,
    smoking_status                  VARCHAR(20),
    smoking_frequency               VARCHAR(20),
    alcohol_consumption             VARCHAR(20),
    exercise_frequency              VARCHAR(20),
    exercise_type                   VARCHAR(100),
    exercise_duration_minutes       INTEGER,
    occupation_type                 VARCHAR(20),
    average_sleep_hours             DECIMAL(3, 1),
    dietary_preference              VARCHAR(20),
    stress_level                    INTEGER,
    target_weight_kg                DECIMAL(5, 1),
    daily_steps_goal                INTEGER,
    sleep_hours_goal                DECIMAL(3, 1),
    water_intake_ml_goal            INTEGER,
    weekly_exercise_minutes_goal    INTEGER,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                      UUID,
    updated_by                      UUID,
    deleted_at                      TIMESTAMPTZ,
    version                         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_patient_profiles_completion CHECK (completion_score BETWEEN 0 AND 100),
    CONSTRAINT chk_patient_profiles_height CHECK (height_cm IS NULL OR (height_cm >= 30 AND height_cm <= 300)),
    CONSTRAINT chk_patient_profiles_weight CHECK (weight_kg IS NULL OR (weight_kg >= 1 AND weight_kg <= 500)),
    CONSTRAINT chk_patient_profiles_stress CHECK (stress_level IS NULL OR (stress_level BETWEEN 1 AND 5))
);

CREATE UNIQUE INDEX uq_patient_profiles_tenant_user
    ON patient.patient_profiles (tenant_id, user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_patient_profiles_user ON patient.patient_profiles (user_id);
CREATE INDEX idx_patient_profiles_tenant_completion ON patient.patient_profiles (tenant_id, completion_score);

-- =============================================================================
-- Child entities (soft-deletable)
-- =============================================================================

CREATE TABLE patient.allergies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    name            VARCHAR(200) NOT NULL,
    severity        VARCHAR(20) NOT NULL,
    reaction        VARCHAR(500),
    diagnosed_date  DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_allergies_patient ON patient.allergies (patient_id);

CREATE TABLE patient.medications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    name                VARCHAR(200) NOT NULL,
    dosage              VARCHAR(100),
    frequency           VARCHAR(100),
    route               VARCHAR(50),
    start_date          DATE,
    end_date            DATE,
    prescribing_doctor  VARCHAR(200),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_medications_patient ON patient.medications (patient_id);

CREATE TABLE patient.surgeries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    procedure_name  VARCHAR(200) NOT NULL,
    surgery_date    DATE,
    hospital_name   VARCHAR(200),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_surgeries_patient ON patient.surgeries (patient_id);

CREATE TABLE patient.chronic_conditions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    condition_name  VARCHAR(200) NOT NULL,
    diagnosed_date  DATE,
    status          VARCHAR(20) NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_chronic_conditions_patient ON patient.chronic_conditions (patient_id);

CREATE TABLE patient.emergency_contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    name            VARCHAR(200) NOT NULL,
    relationship    VARCHAR(50) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_emergency_contacts_patient ON patient.emergency_contacts (patient_id);

-- =============================================================================
-- Append-only measurement history
-- =============================================================================

CREATE TABLE patient.physical_measurement_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    height_cm           DECIMAL(5, 1),
    weight_kg           DECIMAL(5, 1),
    waist_cm            DECIMAL(5, 1),
    hip_cm              DECIMAL(5, 1),
    neck_cm             DECIMAL(5, 1),
    body_fat_percent    DECIMAL(4, 1),
    measured_at         TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID
);

CREATE INDEX idx_physical_measurement_history_patient
    ON patient.physical_measurement_history (patient_id, measured_at DESC);
