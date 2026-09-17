-- V98: HMS-19 Insurance / TPA

CREATE SCHEMA IF NOT EXISTS insurance;

CREATE TABLE insurance.payers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    code                VARCHAR(40) NOT NULL,
    name                VARCHAR(200) NOT NULL,
    payer_type          VARCHAR(30) NOT NULL DEFAULT 'TPA',
    contact_phone       VARCHAR(30),
    contact_email       VARCHAR(120),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_insurance_payer_type CHECK (
        payer_type IN ('INSURER', 'TPA', 'CORPORATE', 'GOVERNMENT')
    )
);

CREATE UNIQUE INDEX uq_insurance_payer_code
    ON insurance.payers (hospital_id, code)
    WHERE deleted_at IS NULL;

CREATE TABLE insurance.policies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    patient_id          UUID NOT NULL,
    payer_id            UUID NOT NULL REFERENCES insurance.payers (id),
    policy_number       VARCHAR(80) NOT NULL,
    member_id           VARCHAR(80),
    holder_name         VARCHAR(200),
    claim_mode          VARCHAR(30) NOT NULL DEFAULT 'CASHLESS',
    status              VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    valid_from          DATE,
    valid_to            DATE,
    coverage_limit      NUMERIC(14, 2),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_insurance_policy_claim_mode CHECK (
        claim_mode IN ('CASHLESS', 'REIMBURSEMENT', 'CO_PAY', 'PACKAGE')
    ),
    CONSTRAINT chk_insurance_policy_status CHECK (
        status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')
    )
);

CREATE INDEX idx_insurance_policies_patient
    ON insurance.policies (hospital_id, patient_id)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_insurance_policy_number
    ON insurance.policies (hospital_id, payer_id, policy_number)
    WHERE deleted_at IS NULL;

CREATE TABLE insurance.pre_authorizations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    policy_id           UUID NOT NULL REFERENCES insurance.policies (id),
    patient_id          UUID NOT NULL,
    encounter_id        UUID,
    admission_id        UUID,
    auth_number         VARCHAR(40) NOT NULL,
    auth_type           VARCHAR(30) NOT NULL DEFAULT 'PRE_AUTH',
    status              VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    requested_amount    NUMERIC(14, 2),
    approved_amount     NUMERIC(14, 2),
    notes               TEXT,
    decision_notes      TEXT,
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at          TIMESTAMPTZ,
    decided_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_insurance_auth_type CHECK (
        auth_type IN ('PRE_AUTH', 'ENHANCEMENT', 'FINAL')
    ),
    CONSTRAINT chk_insurance_auth_status CHECK (
        status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_insurance_auth_number
    ON insurance.pre_authorizations (hospital_id, auth_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_insurance_auth_status
    ON insurance.pre_authorizations (hospital_id, status, requested_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE insurance.claims (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    policy_id           UUID NOT NULL REFERENCES insurance.policies (id),
    pre_authorization_id UUID REFERENCES insurance.pre_authorizations (id),
    patient_id          UUID NOT NULL,
    encounter_id        UUID,
    admission_id        UUID,
    invoice_id          UUID,
    claim_number        VARCHAR(40) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    claimed_amount      NUMERIC(14, 2) NOT NULL DEFAULT 0,
    approved_amount     NUMERIC(14, 2),
    settled_amount      NUMERIC(14, 2),
    notes               TEXT,
    submitted_at        TIMESTAMPTZ,
    decided_at          TIMESTAMPTZ,
    settled_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_insurance_claim_status CHECK (
        status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SETTLED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_insurance_claim_number
    ON insurance.claims (hospital_id, claim_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_insurance_claims_status
    ON insurance.claims (hospital_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('insurance', 'read', 'insurance:read', 'View insurance payers, policies, auth, claims'),
    ('insurance', 'write', 'insurance:write', 'Create and update insurance records'),
    ('insurance', 'approve', 'insurance:approve', 'Approve or reject pre-auth and claims')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'RECEPTIONIST')
  AND p.code IN ('insurance:read', 'insurance:write', 'insurance:approve')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('NURSE')
  AND p.code IN ('insurance:read')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_INSURANCE', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_INSURANCE'
        AND f.deleted_at IS NULL
  );
