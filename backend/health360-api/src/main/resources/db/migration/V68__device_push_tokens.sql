-- Mobile push notification device tokens (Expo Push API)

CREATE TABLE iam.device_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    user_id         UUID NOT NULL,
    expo_push_token VARCHAR(255) NOT NULL,
    platform        VARCHAR(20) NOT NULL,
    device_id       VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at    TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT uq_device_expo_token UNIQUE (expo_push_token)
);

CREATE INDEX idx_device_tokens_user_active
    ON iam.device_tokens (user_id)
    WHERE deleted_at IS NULL;
