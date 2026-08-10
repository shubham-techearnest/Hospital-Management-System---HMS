-- V26: Subscription plan catalog (database-driven, not hard-coded in application code)

CREATE TABLE shared.subscription_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    code            VARCHAR(50) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency        CHAR(3) NOT NULL DEFAULT 'INR',
    billing_cycle   VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    trial_days      INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_subscription_plans_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    CONSTRAINT chk_subscription_plans_billing_cycle
        CHECK (billing_cycle IN ('MONTHLY', 'QUARTERLY', 'YEARLY', 'NONE'))
);

CREATE UNIQUE INDEX uq_subscription_plans_tenant_code
    ON shared.subscription_plans (tenant_id, code)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_subscription_plans_status
    ON shared.subscription_plans (tenant_id, status)
    WHERE deleted_at IS NULL;

CREATE TABLE shared.subscription_plan_limits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    plan_id         UUID NOT NULL REFERENCES shared.subscription_plans (id),
    limit_key       VARCHAR(100) NOT NULL,
    limit_value     BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_subscription_plan_limits_value
        CHECK (limit_value >= 0)
);

CREATE UNIQUE INDEX uq_subscription_plan_limits_plan_key
    ON shared.subscription_plan_limits (plan_id, limit_key)
    WHERE deleted_at IS NULL;

CREATE TABLE shared.subscription_plan_features (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    plan_id         UUID NOT NULL REFERENCES shared.subscription_plans (id),
    feature_key     VARCHAR(100) NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_subscription_plan_features_plan_key
    ON shared.subscription_plan_features (plan_id, feature_key)
    WHERE deleted_at IS NULL;
