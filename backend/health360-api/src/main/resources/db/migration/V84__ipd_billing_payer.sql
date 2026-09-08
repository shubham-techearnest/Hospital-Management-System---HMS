-- V84: Phase I6 — IPD charge events, invoice kinds, payer/auth, financial clearance

-- Invoice kind (STANDARD for OPD; DEPOSIT/INTERIM/FINAL for IPD)
ALTER TABLE billing.invoices
    ADD COLUMN IF NOT EXISTS invoice_kind VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN IF NOT EXISTS admission_id UUID;

ALTER TABLE billing.invoices
    DROP CONSTRAINT IF EXISTS chk_invoice_kind;
ALTER TABLE billing.invoices
    ADD CONSTRAINT chk_invoice_kind CHECK (
        invoice_kind IN ('STANDARD', 'DEPOSIT', 'INTERIM', 'FINAL')
    );

CREATE INDEX IF NOT EXISTS idx_invoices_admission
    ON billing.invoices (admission_id)
    WHERE deleted_at IS NULL AND admission_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_encounter_final
    ON billing.invoices (tenant_id, encounter_id)
    WHERE deleted_at IS NULL
      AND status <> 'CANCELLED'
      AND invoice_kind IN ('STANDARD', 'FINAL');

-- Extend line source types for IPD charges
ALTER TABLE billing.invoice_line_items
    DROP CONSTRAINT IF EXISTS chk_invoice_line_source_type;
ALTER TABLE billing.invoice_line_items
    ADD CONSTRAINT chk_invoice_line_source_type CHECK (
        source_type IN (
            'ENCOUNTER', 'LAB_ORDER', 'MEDICATION_ORDER', 'MANUAL',
            'IPD_CHARGE', 'BED_DAY', 'NURSING', 'PROCEDURE', 'DEPOSIT'
        )
    );

-- Charge events (accrue → post to invoice lines)
CREATE TABLE ipd.charge_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    charge_type     VARCHAR(30) NOT NULL,
    description     VARCHAR(500) NOT NULL,
    quantity        NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price      NUMERIC(12, 2) NOT NULL,
    amount          NUMERIC(12, 2) NOT NULL,
    service_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    invoice_id      UUID REFERENCES billing.invoices (id),
    invoice_line_id UUID REFERENCES billing.invoice_line_items (id),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_charge_type CHECK (
        charge_type IN ('BED_DAY', 'NURSING', 'PROCEDURE', 'MANUAL', 'OTHER')
    ),
    CONSTRAINT chk_ipd_charge_status CHECK (
        status IN ('PENDING', 'POSTED', 'VOID')
    )
);

CREATE INDEX idx_ipd_charge_events_admission
    ON ipd.charge_events (admission_id, service_date DESC)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_ipd_charge_bed_day
    ON ipd.charge_events (admission_id, charge_type, service_date)
    WHERE deleted_at IS NULL
      AND status <> 'VOID'
      AND charge_type = 'BED_DAY';

-- Generic payer assignment on admission (no hard-coded insurer)
CREATE TABLE ipd.admission_payers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    payer_mode      VARCHAR(30) NOT NULL DEFAULT 'SELF_PAY',
    payer_name      VARCHAR(200),
    policy_number   VARCHAR(100),
    member_id       VARCHAR(100),
    claim_mode      VARCHAR(30),
    primary_payer   BOOLEAN NOT NULL DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_payer_mode CHECK (
        payer_mode IN ('SELF_PAY', 'INSURANCE', 'TPA', 'CORPORATE', 'GOVERNMENT')
    ),
    CONSTRAINT chk_ipd_claim_mode CHECK (
        claim_mode IS NULL OR claim_mode IN ('CASHLESS', 'REIMBURSEMENT', 'CO_PAY', 'PACKAGE')
    )
);

CREATE INDEX idx_ipd_admission_payers_admission
    ON ipd.admission_payers (admission_id)
    WHERE deleted_at IS NULL;

-- Pre-auth / enhancement / final auth lifecycle
CREATE TABLE ipd.payer_authorizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    payer_id        UUID REFERENCES ipd.admission_payers (id),
    auth_type       VARCHAR(30) NOT NULL DEFAULT 'PRE_AUTH',
    status          VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    auth_number     VARCHAR(100),
    approved_amount NUMERIC(12, 2),
    notes           TEXT,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_auth_type CHECK (
        auth_type IN ('ELIGIBILITY', 'PRE_AUTH', 'ENHANCEMENT', 'FINAL_AUTH')
    ),
    CONSTRAINT chk_ipd_auth_status CHECK (
        status IN ('REQUESTED', 'APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED')
    )
);

CREATE INDEX idx_ipd_payer_auth_admission
    ON ipd.payer_authorizations (admission_id, requested_at DESC)
    WHERE deleted_at IS NULL;

-- Slim financial clearance (full multi-dept checklist remains I7)
CREATE TABLE ipd.financial_clearances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    cleared_at      TIMESTAMPTZ,
    cleared_by      UUID,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_ipd_financial_clearance_admission UNIQUE (admission_id),
    CONSTRAINT chk_ipd_financial_clearance_status CHECK (
        status IN ('PENDING', 'CLEARED', 'BLOCKED')
    )
);
