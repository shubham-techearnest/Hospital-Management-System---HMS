-- Phase F: Razorpay payment intents (patient invoices) + SaaS subscription invoices

ALTER TABLE billing.payments
    ADD COLUMN IF NOT EXISTS gateway_order_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100);

ALTER TABLE billing.payments
    ALTER COLUMN paid_at DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_gateway_order_id
    ON billing.payments (gateway, gateway_order_id)
    WHERE deleted_at IS NULL AND gateway_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_idempotency_key
    ON billing.payments (tenant_id, idempotency_key)
    WHERE deleted_at IS NULL AND idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS billing.saas_invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id         UUID NOT NULL,
    plan_id             UUID NOT NULL,
    subscription_id     UUID,
    invoice_number      VARCHAR(40) NOT NULL,
    amount              NUMERIC(12, 2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    status              VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
    billing_period_start DATE NOT NULL,
    billing_period_end   DATE NOT NULL,
    gateway             VARCHAR(30) NOT NULL DEFAULT 'RAZORPAY',
    gateway_order_id    VARCHAR(100),
    gateway_payment_id  VARCHAR(100),
    payment_status      VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    paid_at             TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_saas_invoice_status CHECK (
        status IN ('ISSUED', 'PAID', 'CANCELLED')
    ),
    CONSTRAINT chk_saas_payment_status CHECK (
        payment_status IN ('PENDING', 'CAPTURED', 'FAILED', 'REFUNDED')
    ),
    CONSTRAINT chk_saas_gateway CHECK (
        gateway IN ('MANUAL', 'RAZORPAY', 'STRIPE')
    ),
    CONSTRAINT uq_saas_invoice_number UNIQUE (tenant_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_saas_invoices_hospital
    ON billing.saas_invoices (hospital_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_saas_invoices_gateway_order
    ON billing.saas_invoices (gateway, gateway_order_id)
    WHERE deleted_at IS NULL AND gateway_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_saas_invoices_gateway_payment
    ON billing.saas_invoices (gateway, gateway_payment_id)
    WHERE deleted_at IS NULL AND gateway_payment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS billing.saas_invoice_number_sequences (
    hospital_id     UUID NOT NULL,
    year            INT NOT NULL,
    last_value      BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (hospital_id, year)
);
