-- V27: Hospital subscriptions (current) + append-only history

ALTER TABLE hospital.hospitals
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE hospital.hospitals
    ADD CONSTRAINT chk_hospitals_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

CREATE INDEX IF NOT EXISTS idx_hospitals_status
    ON hospital.hospitals (tenant_id, status)
    WHERE deleted_at IS NULL;

CREATE TABLE hospital.hospital_subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    plan_id                 UUID NOT NULL REFERENCES shared.subscription_plans (id),
    status                  VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    start_date              DATE NOT NULL,
    end_date                DATE,
    auto_renew              BOOLEAN NOT NULL DEFAULT true,
    price_at_subscription   DECIMAL(12, 2),
    currency                CHAR(3) NOT NULL DEFAULT 'INR',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_hospital_subscriptions_status
        CHECK (status IN ('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'SUSPENDED'))
);

CREATE UNIQUE INDEX uq_hospital_subscriptions_active
    ON hospital.hospital_subscriptions (hospital_id)
    WHERE status IN ('ACTIVE', 'TRIAL');

CREATE INDEX idx_hospital_subscriptions_plan
    ON hospital.hospital_subscriptions (plan_id, status);

CREATE INDEX idx_hospital_subscriptions_tenant
    ON hospital.hospital_subscriptions (tenant_id, status);

CREATE TABLE hospital.hospital_subscription_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    subscription_id     UUID REFERENCES hospital.hospital_subscriptions (id),
    plan_id             UUID NOT NULL REFERENCES shared.subscription_plans (id),
    previous_plan_id    UUID REFERENCES shared.subscription_plans (id),
    event_type          VARCHAR(50) NOT NULL,
    status              VARCHAR(30) NOT NULL,
    effective_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    CONSTRAINT chk_hospital_subscription_history_event
        CHECK (event_type IN (
            'INITIAL', 'RENEWAL', 'UPGRADE', 'DOWNGRADE',
            'CANCELLATION', 'EXPIRATION', 'PLAN_CHANGE', 'SUSPENSION', 'REACTIVATION'
        ))
);

CREATE INDEX idx_hospital_subscription_history_hospital
    ON hospital.hospital_subscription_history (hospital_id, effective_at DESC);

CREATE INDEX idx_hospital_subscription_history_subscription
    ON hospital.hospital_subscription_history (subscription_id);
