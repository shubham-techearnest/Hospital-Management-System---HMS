-- V7: Doctor verification documents, languages, admin permissions [S6]

ALTER TABLE doctor.doctor_profiles
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- =============================================================================
-- doctor.doctor_languages
-- =============================================================================

CREATE TABLE doctor.doctor_languages (
    doctor_id       UUID NOT NULL REFERENCES doctor.doctor_profiles (id) ON DELETE CASCADE,
    language_code   CHAR(2) NOT NULL,
    PRIMARY KEY (doctor_id, language_code)
);

CREATE INDEX idx_doctor_languages_doctor ON doctor.doctor_languages (doctor_id);

-- =============================================================================
-- doctor.verification_documents
-- =============================================================================

CREATE TABLE doctor.verification_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    doctor_id       UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    document_type   VARCHAR(50) NOT NULL,
    storage_key     VARCHAR(500) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_verification_documents_type
        CHECK (document_type IN ('REGISTRATION_CERT', 'IDENTITY_PROOF'))
);

CREATE INDEX idx_verification_documents_doctor
    ON doctor.verification_documents (doctor_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- Admin doctor verification permission
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES ('admin:doctor', 'verify', 'admin:doctor:verify', 'Review and approve doctor verifications')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code = 'admin:doctor:verify'
ON CONFLICT (role_id, permission_id) DO NOTHING;
