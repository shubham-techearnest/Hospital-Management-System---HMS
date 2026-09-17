-- V94: HMS-15 Consumable inventory (separate from pharmacy medicines and capital assets)

CREATE SCHEMA IF NOT EXISTS inventory;

CREATE TABLE inventory.items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    code                VARCHAR(40) NOT NULL,
    name                VARCHAR(200) NOT NULL,
    category            VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
    unit_of_measure     VARCHAR(20) NOT NULL DEFAULT 'EACH',
    reorder_level       INTEGER,
    track_expiry        BOOLEAN NOT NULL DEFAULT FALSE,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_inventory_item_reorder CHECK (
        reorder_level IS NULL OR reorder_level >= 0
    )
);

CREATE UNIQUE INDEX uq_inventory_items_code
    ON inventory.items (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_items_hospital
    ON inventory.items (hospital_id, branch_id, active, name)
    WHERE deleted_at IS NULL;

CREATE TABLE inventory.locations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    code                VARCHAR(40) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    location_type       VARCHAR(30) NOT NULL DEFAULT 'CENTRAL_STORE',
    department_id       UUID,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_inventory_location_type CHECK (
        location_type IN ('CENTRAL_STORE', 'WARD', 'OT', 'LAB', 'ED', 'OTHER')
    )
);

CREATE UNIQUE INDEX uq_inventory_locations_code
    ON inventory.locations (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

CREATE TABLE inventory.stock_balances (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    item_id             UUID NOT NULL REFERENCES inventory.items (id),
    location_id         UUID NOT NULL REFERENCES inventory.locations (id),
    lot_number          VARCHAR(60) NOT NULL DEFAULT '',
    expiry_date         DATE,
    quantity_on_hand    INTEGER NOT NULL DEFAULT 0,
    unit_cost           NUMERIC(12, 2),
    received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_inventory_balance_qty CHECK (quantity_on_hand >= 0)
);

CREATE UNIQUE INDEX uq_inventory_balance_lot
    ON inventory.stock_balances (item_id, location_id, lot_number)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_balances_location
    ON inventory.stock_balances (location_id, item_id)
    WHERE deleted_at IS NULL;

CREATE TABLE inventory.stock_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    item_id             UUID NOT NULL REFERENCES inventory.items (id),
    balance_id          UUID REFERENCES inventory.stock_balances (id),
    location_id         UUID NOT NULL REFERENCES inventory.locations (id),
    txn_type            VARCHAR(20) NOT NULL,
    quantity            INTEGER NOT NULL,
    reference_type      VARCHAR(50),
    reference_id        UUID,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    CONSTRAINT chk_inventory_txn_type CHECK (
        txn_type IN ('RECEIVE', 'ADJUST', 'CONSUME', 'TRANSFER')
    ),
    CONSTRAINT chk_inventory_txn_qty CHECK (quantity <> 0)
);

CREATE INDEX idx_inventory_txn_item
    ON inventory.stock_transactions (item_id, created_at DESC);
CREATE INDEX idx_inventory_txn_location
    ON inventory.stock_transactions (location_id, created_at DESC);

-- Default central store per hospital branch
INSERT INTO inventory.locations (tenant_id, hospital_id, branch_id, code, name, location_type, active)
SELECT h.tenant_id, h.id, b.id, 'CENTRAL', 'Central store', 'CENTRAL_STORE', TRUE
FROM hospital.hospitals h
JOIN hospital.branches b ON b.hospital_id = h.id AND b.deleted_at IS NULL
WHERE h.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM inventory.locations l
      WHERE l.hospital_id = h.id AND l.branch_id = b.id AND l.code = 'CENTRAL' AND l.deleted_at IS NULL
  );

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('inventory', 'read', 'inventory:read', 'View consumable inventory catalog'),
    ('inventory', 'write', 'inventory:write', 'Manage consumable items and locations'),
    ('inventory', 'stock:read', 'inventory:stock:read', 'View stock balances and ledger'),
    ('inventory', 'stock:write', 'inventory:stock:write', 'Receive and adjust consumable stock')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN ('inventory:read', 'inventory:write', 'inventory:stock:read', 'inventory:stock:write')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('NURSE', 'RECEPTIONIST')
  AND p.code IN ('inventory:read', 'inventory:stock:read')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_INVENTORY', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_INVENTORY'
        AND f.deleted_at IS NULL
  );
