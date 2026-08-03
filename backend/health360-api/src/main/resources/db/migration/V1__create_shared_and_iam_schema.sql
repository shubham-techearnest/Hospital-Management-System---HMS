-- V001: Shared + IAM schemas [DOC-06 §3–4]
-- Flyway migration for Health360 AI Phase 1 S0 kickoff

CREATE SCHEMA IF NOT EXISTS shared;
CREATE SCHEMA IF NOT EXISTS iam;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SHARED SCHEMA
-- =============================================================================

CREATE TABLE shared.tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    config      JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_tenants_status CHECK (status IN ('ACTIVE', 'SUSPENDED'))
);

CREATE UNIQUE INDEX uq_tenants_slug ON shared.tenants (slug);
CREATE INDEX idx_tenants_status ON shared.tenants (status);

CREATE TABLE shared.audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL REFERENCES shared.tenants (id),
    user_id      UUID,
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(100) NOT NULL,
    entity_id    UUID NOT NULL,
    old_value    JSONB,
    new_value    JSONB,
    ip_address   VARCHAR(45),
    user_agent   VARCHAR(500),
    occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_occurred ON shared.audit_logs (tenant_id, occurred_at DESC);
CREATE INDEX idx_audit_logs_entity ON shared.audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON shared.audit_logs (user_id, occurred_at DESC);
CREATE INDEX idx_audit_logs_action ON shared.audit_logs (action);

CREATE TABLE shared.specializations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code          VARCHAR(50) NOT NULL,
    name          VARCHAR(200) NOT NULL,
    parent_id     UUID REFERENCES shared.specializations (id),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_specializations_code ON shared.specializations (code);
CREATE INDEX idx_specializations_parent ON shared.specializations (parent_id);

CREATE TABLE shared.domain_event_outbox (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID NOT NULL,
    event_type     VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id   UUID NOT NULL,
    payload        JSONB NOT NULL,
    occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at   TIMESTAMPTZ,
    retry_count    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_outbox_unpublished ON shared.domain_event_outbox (published_at)
    WHERE published_at IS NULL;

-- =============================================================================
-- IAM SCHEMA
-- =============================================================================

CREATE TABLE iam.users (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             UUID NOT NULL REFERENCES shared.tenants (id),
    email                 VARCHAR(255) NOT NULL,
    password_hash         VARCHAR(255) NOT NULL,
    first_name            VARCHAR(100) NOT NULL,
    last_name             VARCHAR(100) NOT NULL,
    phone                 VARCHAR(20) NOT NULL,
    avatar_url            VARCHAR(500),
    status                VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    email_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at     TIMESTAMPTZ,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until          TIMESTAMPTZ,
    timezone              VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    locale                VARCHAR(10) NOT NULL DEFAULT 'en-IN',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by            UUID,
    updated_by            UUID,
    deleted_at            TIMESTAMPTZ,
    version               BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_users_status CHECK (
        status IN ('PENDING_VERIFICATION', 'ACTIVE', 'DEACTIVATED', 'LOCKED')
    )
);

CREATE UNIQUE INDEX uq_users_tenant_email ON iam.users (tenant_id, email)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_users_tenant_email ON iam.users (tenant_id, email);
CREATE INDEX idx_users_tenant_status ON iam.users (tenant_id, status);
CREATE INDEX idx_users_phone ON iam.users (phone);

CREATE TABLE iam.roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES shared.tenants (id),
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  UUID,
    updated_by  UUID,
    deleted_at  TIMESTAMPTZ,
    version     BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_roles_tenant_name ON iam.roles (tenant_id, name)
    WHERE deleted_at IS NULL;

CREATE TABLE iam.permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource    VARCHAR(100) NOT NULL,
    action      VARCHAR(50) NOT NULL,
    code        VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_permissions_code ON iam.permissions (code);

CREATE TABLE iam.user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    user_id     UUID NOT NULL REFERENCES iam.users (id),
    role_id     UUID NOT NULL REFERENCES iam.roles (id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES iam.users (id),
    CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON iam.user_roles (user_id);
CREATE INDEX idx_user_roles_role ON iam.user_roles (role_id);

CREATE TABLE iam.role_permissions (
    role_id       UUID NOT NULL REFERENCES iam.roles (id),
    permission_id UUID NOT NULL REFERENCES iam.permissions (id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE iam.refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    user_id     UUID NOT NULL REFERENCES iam.users (id),
    token_hash  VARCHAR(255) NOT NULL,
    device_info VARCHAR(500),
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_refresh_tokens_hash ON iam.refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_user ON iam.refresh_tokens (user_id, revoked);
CREATE INDEX idx_refresh_tokens_expires ON iam.refresh_tokens (expires_at);

CREATE TABLE iam.email_verification_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES iam.users (id),
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_email_verification_token_hash ON iam.email_verification_tokens (token_hash);

CREATE TABLE iam.notification_preferences (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL,
    user_id           UUID NOT NULL REFERENCES iam.users (id),
    notification_type VARCHAR(50) NOT NULL,
    email_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    in_app_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by        UUID,
    updated_by        UUID,
    deleted_at        TIMESTAMPTZ,
    version           BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_notif_pref_user_type ON iam.notification_preferences (user_id, notification_type)
    WHERE deleted_at IS NULL;

CREATE TABLE iam.in_app_notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL,
    user_id           UUID NOT NULL REFERENCES iam.users (id),
    title             VARCHAR(200) NOT NULL,
    message           TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    reference_type    VARCHAR(50),
    reference_id      UUID,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    read_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_in_app_notif_user_unread ON iam.in_app_notifications (user_id, is_read, created_at DESC);

-- =============================================================================
-- SEED: Default tenant, roles, permissions (S0 bootstrap)
-- =============================================================================

INSERT INTO shared.tenants (id, name, slug, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Health360 Default', 'default', 'ACTIVE');

INSERT INTO iam.roles (id, tenant_id, name, description)
VALUES
    ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'PATIENT', 'Patient user'),
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'DOCTOR', 'Doctor user'),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'HOSPITAL_ADMIN', 'Hospital administrator'),
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'PLATFORM_ADMIN', 'Platform administrator');

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('health', 'read', 'health:read', 'Read health endpoints'),
    ('user', 'read', 'user:read', 'Read user profile'),
    ('user', 'write', 'user:write', 'Update user profile'),
    ('patient:profile', 'read', 'patient:profile:read', 'Read patient profile'),
    ('patient:profile', 'write', 'patient:profile:write', 'Write patient profile'),
    ('doctor:profile', 'read', 'doctor:profile:read', 'Read doctor profile'),
    ('doctor:profile', 'write', 'doctor:profile:write', 'Write doctor profile'),
    ('admin:users', 'read', 'admin:users:read', 'Admin user management'),
    ('admin:users', 'write', 'admin:users:write', 'Admin user management write');

INSERT INTO shared.specializations (code, name, display_order)
VALUES
    ('GENERAL_PHYSICIAN', 'General Physician', 1),
    ('CARDIOLOGIST', 'Cardiologist', 2),
    ('DERMATOLOGIST', 'Dermatologist', 3),
    ('PEDIATRICIAN', 'Pediatrician', 4),
    ('ORTHOPEDIC', 'Orthopedic Surgeon', 5);
