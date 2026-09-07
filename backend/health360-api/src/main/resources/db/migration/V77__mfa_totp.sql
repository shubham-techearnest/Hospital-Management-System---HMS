-- G10: TOTP MFA columns + backup codes
ALTER TABLE iam.users
    ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(64),
    ADD COLUMN IF NOT EXISTS mfa_pending_secret VARCHAR(64),
    ADD COLUMN IF NOT EXISTS mfa_enabled_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS iam.mfa_backup_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES shared.tenants (id),
    user_id     UUID NOT NULL REFERENCES iam.users (id),
    code_hash   VARCHAR(100) NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  UUID,
    updated_by  UUID,
    deleted_at  TIMESTAMPTZ,
    version     BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user
    ON iam.mfa_backup_codes (user_id)
    WHERE deleted_at IS NULL AND used_at IS NULL;
