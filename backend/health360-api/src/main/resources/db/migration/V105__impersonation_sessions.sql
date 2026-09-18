-- Impersonation sessions (DEV/UAT only; enforced in application code) + audit attribution

CREATE TABLE IF NOT EXISTS iam.impersonation_sessions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    actor_user_id           UUID NOT NULL REFERENCES iam.users (id),
    subject_user_id         UUID NOT NULL REFERENCES iam.users (id),
    reason                  VARCHAR(500),
    environment_label       VARCHAR(32) NOT NULL,
    status                  VARCHAR(32) NOT NULL,
    started_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at              TIMESTAMPTZ NOT NULL,
    ended_at                TIMESTAMPTZ,
    end_reason              VARCHAR(64),
    actor_access_jti        VARCHAR(64),
    subject_access_jti      VARCHAR(64),
    ip_address              VARCHAR(45),
    user_agent              VARCHAR(500),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_actor_active
    ON iam.impersonation_sessions (actor_user_id, status)
    WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_subject
    ON iam.impersonation_sessions (subject_user_id);

ALTER TABLE iam.refresh_tokens
    ADD COLUMN IF NOT EXISTS impersonation_session_id UUID;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_imp_session
    ON iam.refresh_tokens (impersonation_session_id)
    WHERE impersonation_session_id IS NOT NULL;

ALTER TABLE shared.audit_logs
    ADD COLUMN IF NOT EXISTS actor_user_id UUID;

ALTER TABLE shared.audit_logs
    ADD COLUMN IF NOT EXISTS impersonation_session_id UUID;

INSERT INTO iam.permissions (id, resource, action, code, description)
VALUES (
    '00000000-0000-0000-0000-000000000540',
    'admin',
    'users:impersonate',
    'admin:users:impersonate',
    'Impersonate another user for DEV/UAT testing (never production)'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code = 'admin:users:impersonate'
ON CONFLICT DO NOTHING;
