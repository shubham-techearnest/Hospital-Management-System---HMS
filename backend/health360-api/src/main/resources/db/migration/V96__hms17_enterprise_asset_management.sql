-- V96: HMS-17 Enterprise Asset Management (extend v1)

-- =============================================================================
-- Extend asset.assets
-- =============================================================================

ALTER TABLE asset.assets
    ADD COLUMN IF NOT EXISTS purchase_cost NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS amc_expiry DATE,
    ADD COLUMN IF NOT EXISTS criticality VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    ADD COLUMN IF NOT EXISTS qr_payload VARCHAR(120),
    ADD COLUMN IF NOT EXISTS next_pm_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS next_calibration_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS commissioned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS parent_asset_id UUID;

ALTER TABLE asset.assets DROP CONSTRAINT IF EXISTS chk_asset_status;
ALTER TABLE asset.assets ADD CONSTRAINT chk_asset_status CHECK (
    status IN (
        'AVAILABLE', 'IN_USE', 'MAINTENANCE', 'UNDER_REPAIR',
        'RETIRED', 'DISPOSED'
    )
);

ALTER TABLE asset.assets DROP CONSTRAINT IF EXISTS chk_asset_criticality;
ALTER TABLE asset.assets ADD CONSTRAINT chk_asset_criticality CHECK (
    criticality IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_qr_payload
    ON asset.assets (hospital_id, qr_payload)
    WHERE deleted_at IS NULL AND qr_payload IS NOT NULL;

-- Backfill QR payloads for existing assets
UPDATE asset.assets
SET qr_payload = 'AST:' || id::text
WHERE qr_payload IS NULL
  AND deleted_at IS NULL;

-- =============================================================================
-- Status history
-- =============================================================================

CREATE TABLE IF NOT EXISTS asset.status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    asset_id        UUID NOT NULL REFERENCES asset.assets (id),
    from_status     VARCHAR(20),
    to_status       VARCHAR(20) NOT NULL,
    reason          TEXT,
    changed_by      UUID,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_asset_status_history_asset
    ON asset.status_history (asset_id, changed_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- Maintenance schedules (PM / calibration cadence)
-- =============================================================================

CREATE TABLE IF NOT EXISTS asset.maintenance_schedules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    asset_id            UUID NOT NULL REFERENCES asset.assets (id),
    schedule_type       VARCHAR(30) NOT NULL,
    cadence             VARCHAR(30) NOT NULL,
    interval_days       INTEGER,
    next_due_at         TIMESTAMPTZ NOT NULL,
    last_generated_at   TIMESTAMPTZ,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_asset_schedule_type CHECK (
        schedule_type IN ('PREVENTIVE', 'CALIBRATION', 'INSPECTION')
    ),
    CONSTRAINT chk_asset_schedule_cadence CHECK (
        cadence IN ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'CUSTOM_DAYS')
    )
);

CREATE INDEX IF NOT EXISTS idx_asset_schedules_due
    ON asset.maintenance_schedules (hospital_id, next_due_at)
    WHERE deleted_at IS NULL AND active = TRUE;

-- =============================================================================
-- Maintenance tickets (work orders)
-- =============================================================================

CREATE TABLE IF NOT EXISTS asset.maintenance_tickets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    asset_id            UUID NOT NULL REFERENCES asset.assets (id),
    schedule_id         UUID REFERENCES asset.maintenance_schedules (id),
    ticket_number       VARCHAR(40) NOT NULL,
    ticket_type         VARCHAR(30) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    priority            VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    reported_by         UUID,
    assigned_role       VARCHAR(50),
    opened_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    completed_by        UUID,
    resolution_notes    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_asset_ticket_type CHECK (
        ticket_type IN ('BREAKDOWN', 'PREVENTIVE', 'CALIBRATION', 'CORRECTIVE', 'INSPECTION')
    ),
    CONSTRAINT chk_asset_ticket_status CHECK (
        status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_ticket_number
    ON asset.maintenance_tickets (hospital_id, ticket_number)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_asset_tickets_asset_status
    ON asset.maintenance_tickets (asset_id, status, opened_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_asset_tickets_hospital_status
    ON asset.maintenance_tickets (hospital_id, branch_id, status, opened_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RBAC
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('asset', 'dispose', 'asset:dispose', 'Retire or dispose hospital assets'),
    ('asset:ticket', 'write', 'asset:ticket:write', 'Create and complete asset maintenance tickets')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'ASSET_MANAGER', 'PLATFORM_ADMIN')
  AND p.code IN ('asset:dispose', 'asset:ticket:write')
ON CONFLICT DO NOTHING;
