-- V95: HMS-16 Procurement (PR / PO / GRN)

CREATE SCHEMA IF NOT EXISTS procurement;

CREATE TABLE procurement.purchase_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    request_number      VARCHAR(40) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    title               VARCHAR(200) NOT NULL,
    notes               TEXT,
    total_amount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    requested_by        UUID NOT NULL,
    submitted_at        TIMESTAMPTZ,
    decided_at          TIMESTAMPTZ,
    decided_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_pr_status CHECK (
        status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'ORDERED')
    )
);

CREATE UNIQUE INDEX uq_pr_number
    ON procurement.purchase_requests (hospital_id, request_number)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_pr_hospital_status
    ON procurement.purchase_requests (hospital_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE procurement.purchase_request_lines (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    purchase_request_id UUID NOT NULL REFERENCES procurement.purchase_requests (id),
    inventory_item_id   UUID,
    item_code           VARCHAR(40) NOT NULL,
    item_name           VARCHAR(200) NOT NULL,
    quantity            INTEGER NOT NULL,
    unit_of_measure     VARCHAR(20) NOT NULL DEFAULT 'EACH',
    unit_price          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    line_total          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_pr_line_qty CHECK (quantity > 0)
);

CREATE INDEX idx_pr_lines_request
    ON procurement.purchase_request_lines (purchase_request_id)
    WHERE deleted_at IS NULL;

CREATE TABLE procurement.purchase_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    purchase_request_id UUID NOT NULL REFERENCES procurement.purchase_requests (id),
    order_number        VARCHAR(40) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
    vendor_name         VARCHAR(200),
    notes               TEXT,
    total_amount        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    issued_by           UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_po_status CHECK (
        status IN ('ISSUED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_po_number
    ON procurement.purchase_orders (hospital_id, order_number)
    WHERE deleted_at IS NULL;

CREATE TABLE procurement.purchase_order_lines (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    purchase_order_id   UUID NOT NULL REFERENCES procurement.purchase_orders (id),
    inventory_item_id   UUID,
    item_code           VARCHAR(40) NOT NULL,
    item_name           VARCHAR(200) NOT NULL,
    quantity_ordered    INTEGER NOT NULL,
    quantity_received   INTEGER NOT NULL DEFAULT 0,
    unit_price          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    line_total          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_po_line_qty CHECK (quantity_ordered > 0)
);

CREATE INDEX idx_po_lines_order
    ON procurement.purchase_order_lines (purchase_order_id)
    WHERE deleted_at IS NULL;

CREATE TABLE procurement.goods_receipts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    purchase_order_id   UUID NOT NULL REFERENCES procurement.purchase_orders (id),
    grn_number          VARCHAR(40) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'POSTED',
    location_id         UUID NOT NULL,
    notes               TEXT,
    received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_grn_status CHECK (status IN ('POSTED', 'CANCELLED'))
);

CREATE UNIQUE INDEX uq_grn_number
    ON procurement.goods_receipts (hospital_id, grn_number)
    WHERE deleted_at IS NULL;

CREATE TABLE procurement.goods_receipt_lines (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    goods_receipt_id        UUID NOT NULL REFERENCES procurement.goods_receipts (id),
    purchase_order_line_id  UUID NOT NULL REFERENCES procurement.purchase_order_lines (id),
    inventory_item_id       UUID,
    quantity_received       INTEGER NOT NULL,
    lot_number              VARCHAR(60) NOT NULL DEFAULT '',
    expiry_date             DATE,
    unit_cost               NUMERIC(12, 2),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_grn_line_qty CHECK (quantity_received > 0)
);

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('procurement', 'read', 'procurement:read', 'View purchase requests and orders'),
    ('procurement', 'write', 'procurement:write', 'Create and submit purchase requests'),
    ('procurement', 'approve', 'procurement:approve', 'Approve or reject purchase requests'),
    ('procurement', 'receive', 'procurement:receive', 'Post goods receipts')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN ('procurement:read', 'procurement:write', 'procurement:approve', 'procurement:receive')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('RECEPTIONIST', 'NURSE')
  AND p.code IN ('procurement:read', 'procurement:write')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_PROCUREMENT', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_PROCUREMENT'
        AND f.deleted_at IS NULL
  );
