-- V104: Public hospital/doctor onboarding requests (platform-admin provisioning only)

CREATE TABLE iam.onboarding_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    request_type        VARCHAR(30) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    organization_name   VARCHAR(255),
    contact_name        VARCHAR(200) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(20) NOT NULL,
    city                VARCHAR(120),
    specialty           VARCHAR(120),
    message             VARCHAR(2000),
    admin_notes         VARCHAR(2000),
    reviewed_by         UUID,
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_onboarding_request_type CHECK (
        request_type IN ('HOSPITAL', 'DOCTOR')
    ),
    CONSTRAINT chk_onboarding_request_status CHECK (
        status IN ('PENDING', 'CONTACTED', 'APPROVED', 'REJECTED')
    )
);

CREATE INDEX idx_onboarding_requests_status_created
    ON iam.onboarding_requests (tenant_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_onboarding_requests_email
    ON iam.onboarding_requests (tenant_id, lower(email))
    WHERE deleted_at IS NULL;
