-- Phase G: password reset (G10), OPD approaching (G3), pharmacy inventory (G6), ops trends (G9)

-- G10: password reset tokens
CREATE TABLE IF NOT EXISTS iam.password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES iam.users (id),
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_password_reset_token_hash
    ON iam.password_reset_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_password_reset_user
    ON iam.password_reset_tokens (user_id, created_at DESC);

-- G3: once-per-token approaching notification
ALTER TABLE opd.queue_entries
    ADD COLUMN IF NOT EXISTS approaching_notified_at TIMESTAMPTZ;

-- G6: pharmacy inventory
CREATE TABLE IF NOT EXISTS pharmacy.medicine_batches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL,
    branch_id       UUID NOT NULL,
    medicine_id     UUID NOT NULL REFERENCES pharmacy.medicines (id),
    batch_number    VARCHAR(60) NOT NULL,
    expiry_date     DATE,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    unit_cost       NUMERIC(12, 2),
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_medicine_batch_qty CHECK (quantity_on_hand >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_medicine_batch_number
    ON pharmacy.medicine_batches (medicine_id, batch_number)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_medicine_batches_medicine
    ON pharmacy.medicine_batches (medicine_id, expiry_date)
    WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS pharmacy.stock_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL,
    branch_id       UUID NOT NULL,
    medicine_id     UUID NOT NULL REFERENCES pharmacy.medicines (id),
    batch_id        UUID REFERENCES pharmacy.medicine_batches (id),
    txn_type        VARCHAR(20) NOT NULL,
    quantity        INTEGER NOT NULL,
    reference_type  VARCHAR(50),
    reference_id    UUID,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    CONSTRAINT chk_stock_txn_type CHECK (txn_type IN ('RECEIVE', 'DISPENSE', 'ADJUST', 'RETURN')),
    CONSTRAINT chk_stock_txn_qty CHECK (quantity <> 0)
);

CREATE INDEX IF NOT EXISTS idx_stock_txns_medicine
    ON pharmacy.stock_transactions (medicine_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_txns_ref
    ON pharmacy.stock_transactions (reference_type, reference_id)
    WHERE reference_id IS NOT NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('pharmacy:stock', 'read', 'pharmacy:stock:read', 'View pharmacy stock levels'),
    ('pharmacy:stock', 'write', 'pharmacy:stock:write', 'Receive / adjust pharmacy stock')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PHARMACIST')
  AND p.code IN ('pharmacy:stock:read', 'pharmacy:stock:write')
ON CONFLICT DO NOTHING;

-- G9: daily ops snapshots for hospital trend charts
CREATE TABLE IF NOT EXISTS analytics.ops_daily_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id         UUID NOT NULL,
    snapshot_date       DATE NOT NULL,
    opd_waiting         INTEGER NOT NULL DEFAULT 0,
    opd_completed       INTEGER NOT NULL DEFAULT 0,
    opd_called          INTEGER NOT NULL DEFAULT 0,
    pending_lab_orders  INTEGER NOT NULL DEFAULT 0,
    pending_rad_orders  INTEGER NOT NULL DEFAULT 0,
    pending_pharmacy    INTEGER NOT NULL DEFAULT 0,
    ipd_occupied_beds   INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ops_daily_snapshot UNIQUE (tenant_id, hospital_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_ops_daily_hospital_date
    ON analytics.ops_daily_snapshots (hospital_id, snapshot_date DESC);
