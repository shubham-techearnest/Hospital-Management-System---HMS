-- V99: HMS-20 Blood Bank

CREATE SCHEMA IF NOT EXISTS blood;

CREATE TABLE blood.units (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    unit_number         VARCHAR(40) NOT NULL,
    product_type        VARCHAR(40) NOT NULL DEFAULT 'PRBC',
    blood_group         VARCHAR(10) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    collected_at        TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    donor_ref           VARCHAR(80),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_blood_unit_product CHECK (
        product_type IN ('PRBC', 'FFP', 'PLATELETS', 'CRYO', 'WHOLE_BLOOD')
    ),
    CONSTRAINT chk_blood_unit_group CHECK (
        blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    ),
    CONSTRAINT chk_blood_unit_status CHECK (
        status IN ('AVAILABLE', 'RESERVED', 'ISSUED', 'TRANSFUSED', 'EXPIRED', 'DISCARDED', 'RETURNED')
    )
);

CREATE UNIQUE INDEX uq_blood_unit_number
    ON blood.units (hospital_id, unit_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_blood_units_available
    ON blood.units (hospital_id, branch_id, product_type, blood_group, status)
    WHERE deleted_at IS NULL;

CREATE TABLE blood.requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    request_number      VARCHAR(40) NOT NULL,
    patient_id          UUID NOT NULL,
    encounter_id        UUID,
    admission_id        UUID,
    ipd_blood_request_id UUID,
    product_type        VARCHAR(40) NOT NULL DEFAULT 'PRBC',
    blood_group         VARCHAR(10) NOT NULL,
    units_requested     INT NOT NULL DEFAULT 1,
    urgency             VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    status              VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    indication          TEXT,
    notes               TEXT,
    decision_notes      TEXT,
    unit_id             UUID REFERENCES blood.units (id),
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at          TIMESTAMPTZ,
    decided_by          UUID,
    issued_at           TIMESTAMPTZ,
    issued_by           UUID,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_blood_req_product CHECK (
        product_type IN ('PRBC', 'FFP', 'PLATELETS', 'CRYO', 'WHOLE_BLOOD')
    ),
    CONSTRAINT chk_blood_req_group CHECK (
        blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    ),
    CONSTRAINT chk_blood_req_urgency CHECK (
        urgency IN ('ROUTINE', 'URGENT', 'STAT')
    ),
    CONSTRAINT chk_blood_req_status CHECK (
        status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'ISSUED', 'COMPLETED', 'CANCELLED', 'RETURNED')
    ),
    CONSTRAINT chk_blood_req_units CHECK (units_requested >= 1 AND units_requested <= 20)
);

CREATE UNIQUE INDEX uq_blood_request_number
    ON blood.requests (hospital_id, request_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_blood_requests_status
    ON blood.requests (hospital_id, branch_id, status, requested_at DESC)
    WHERE deleted_at IS NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('blood', 'read', 'blood:read', 'View blood bank units and transfusion requests'),
    ('blood', 'write', 'blood:write', 'Receive units and create transfusion requests'),
    ('blood', 'issue', 'blood:issue', 'Approve, issue, return, or complete blood requests')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN ('blood:read', 'blood:write', 'blood:issue')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('NURSE', 'DOCTOR')
  AND p.code IN ('blood:read', 'blood:write')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_BLOOD_BANK', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_BLOOD_BANK'
        AND f.deleted_at IS NULL
  );
