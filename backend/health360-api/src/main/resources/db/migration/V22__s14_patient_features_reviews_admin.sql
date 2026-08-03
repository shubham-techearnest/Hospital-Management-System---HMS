-- V22: S14 — patient P1 features, review submit/moderation permissions

-- =============================================================================
-- patient.family_members
-- =============================================================================

CREATE TABLE patient.family_members (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    patient_id              UUID NOT NULL REFERENCES patient.patient_profiles (id),
    name                    VARCHAR(200) NOT NULL,
    relationship            VARCHAR(50) NOT NULL,
    date_of_birth           DATE,
    gender                  VARCHAR(30),
    hereditary_conditions   JSONB,
    is_alive                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_family_members_patient ON patient.family_members (patient_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- patient.lab_value_records (append-only)
-- =============================================================================

CREATE TABLE patient.lab_value_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hba1c               DECIMAL(4, 1),
    total_cholesterol   DECIMAL(5, 1),
    hdl                 DECIMAL(5, 1),
    ldl                 DECIMAL(5, 1),
    triglycerides       DECIMAL(5, 1),
    hemoglobin          DECIMAL(4, 1),
    vitamin_d           DECIMAL(5, 1),
    tsh                 DECIMAL(5, 2),
    creatinine          DECIMAL(4, 2),
    recorded_at         TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID NOT NULL
);

CREATE INDEX idx_lab_values_patient_recorded ON patient.lab_value_records (patient_id, recorded_at DESC);

-- =============================================================================
-- patient.health_documents
-- =============================================================================

CREATE TABLE patient.health_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    file_name           VARCHAR(255) NOT NULL,
    s3_key              VARCHAR(500) NOT NULL,
    file_size_bytes     BIGINT NOT NULL,
    mime_type           VARCHAR(100) NOT NULL,
    category            VARCHAR(30) NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_health_docs_category
        CHECK (category IN ('LAB_REPORT', 'PRESCRIPTION', 'SCAN', 'OTHER'))
);

CREATE INDEX idx_health_docs_patient ON patient.health_documents (patient_id, uploaded_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- patient.health_timeline_events
-- =============================================================================

CREATE TABLE patient.health_timeline_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    event_type      VARCHAR(50) NOT NULL,
    summary         VARCHAR(500) NOT NULL,
    metadata        JSONB,
    reference_type  VARCHAR(50),
    reference_id    UUID,
    occurred_at     TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_patient_occurred ON patient.health_timeline_events (patient_id, occurred_at DESC);

-- =============================================================================
-- S14 permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('review', 'create', 'review:create', 'Submit appointment reviews'),
    ('admin:review', 'moderate', 'admin:review:moderate', 'Moderate patient reviews')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code = 'review:create'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code = 'admin:review:moderate'
ON CONFLICT (role_id, permission_id) DO NOTHING;
