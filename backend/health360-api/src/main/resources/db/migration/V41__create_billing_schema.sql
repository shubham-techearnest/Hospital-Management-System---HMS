-- V41: P2-B1 — Hospital billing foundation (invoices, line items, manual payments)

CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE billing.invoice_number_sequences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    sequence_year   INT NOT NULL,
    last_value      BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_number_sequences_hospital_year
        UNIQUE (tenant_id, hospital_id, sequence_year)
);

CREATE TABLE billing.invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    invoice_number  VARCHAR(50) NOT NULL,
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
    status          VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
    currency        VARCHAR(3) NOT NULL DEFAULT 'INR',
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    amount_paid     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at         TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_invoice_status CHECK (
        status IN ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_invoices_number
    ON billing.invoices (tenant_id, invoice_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_encounter
    ON billing.invoices (encounter_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_patient
    ON billing.invoices (tenant_id, patient_id, issued_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_hospital
    ON billing.invoices (tenant_id, hospital_id, branch_id, status, issued_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE billing.invoice_line_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    invoice_id      UUID NOT NULL REFERENCES billing.invoices (id),
    description     VARCHAR(500) NOT NULL,
    quantity        NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price      NUMERIC(12, 2) NOT NULL,
    line_total      NUMERIC(12, 2) NOT NULL,
    source_type     VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    source_id       UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_invoice_line_source_type CHECK (
        source_type IN ('ENCOUNTER', 'LAB_ORDER', 'MEDICATION_ORDER', 'MANUAL')
    )
);

CREATE INDEX idx_invoice_line_items_invoice
    ON billing.invoice_line_items (invoice_id)
    WHERE deleted_at IS NULL;

CREATE TABLE billing.payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    invoice_id          UUID NOT NULL REFERENCES billing.invoices (id),
    amount              NUMERIC(12, 2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    status              VARCHAR(30) NOT NULL DEFAULT 'CAPTURED',
    gateway             VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    gateway_payment_id  VARCHAR(100),
    payment_method      VARCHAR(30) NOT NULL DEFAULT 'CASH',
    paid_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_payment_status CHECK (
        status IN ('PENDING', 'CAPTURED', 'FAILED', 'REFUNDED')
    ),
    CONSTRAINT chk_payment_gateway CHECK (
        gateway IN ('MANUAL', 'RAZORPAY', 'STRIPE')
    ),
    CONSTRAINT chk_payment_method CHECK (
        payment_method IN ('CASH', 'CARD', 'UPI', 'ONLINE', 'OTHER')
    )
);

CREATE INDEX idx_payments_invoice
    ON billing.payments (invoice_id, paid_at DESC)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_payments_gateway_id
    ON billing.payments (gateway, gateway_payment_id)
    WHERE deleted_at IS NULL AND gateway_payment_id IS NOT NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('billing:invoice', 'read', 'billing:invoice:read', 'View invoices'),
    ('billing:invoice', 'write', 'billing:invoice:write', 'Create and manage invoices'),
    ('billing:payment', 'read', 'billing:payment:read', 'View payments'),
    ('billing:payment', 'write', 'billing:payment:write', 'Record payments')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code LIKE 'billing:%'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code IN ('billing:invoice:read', 'billing:payment:read')
ON CONFLICT DO NOTHING;
