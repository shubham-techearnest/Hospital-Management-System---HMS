-- V88: Hospital Asset Management v1 (registry, maintenance, RBAC, plan feature)

CREATE SCHEMA IF NOT EXISTS asset;

-- =============================================================================
-- asset.categories (tenant-scoped catalog; seeded system codes)
-- =============================================================================

CREATE TABLE asset.categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    code            VARCHAR(40) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_asset_categories_tenant_code
    ON asset.categories (tenant_id, code)
    WHERE deleted_at IS NULL;

INSERT INTO asset.categories (tenant_id, code, name, description)
SELECT t.id, v.code, v.name, v.description
FROM shared.tenants t
CROSS JOIN (VALUES
    ('MEDICAL_EQUIPMENT', 'Medical equipment', 'Clinical devices and monitors'),
    ('OT_EQUIPMENT', 'OT equipment', 'Operation theatre equipment'),
    ('FURNITURE', 'Furniture', 'Bedside and office furniture (non-IPD beds)'),
    ('IT_DEVICE', 'IT device', 'Computers, printers, network gear'),
    ('FACILITY', 'Facility', 'Facility and plant assets'),
    ('OTHER', 'Other', 'Uncategorized assets')
) AS v(code, name, description)
WHERE NOT EXISTS (
      SELECT 1 FROM asset.categories c
      WHERE c.tenant_id = t.id AND c.code = v.code AND c.deleted_at IS NULL
  );

-- =============================================================================
-- asset.assets
-- =============================================================================

CREATE TABLE asset.assets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID NOT NULL REFERENCES hospital.branches (id),
    category_id         UUID NOT NULL REFERENCES asset.categories (id),
    department_id       UUID REFERENCES hospital.departments (id),
    name                VARCHAR(150) NOT NULL,
    asset_tag           VARCHAR(40) NOT NULL,
    serial_number       VARCHAR(80),
    manufacturer        VARCHAR(100),
    model               VARCHAR(100),
    purchase_date       DATE,
    warranty_expiry     DATE,
    location_label      VARCHAR(200),
    status              VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_asset_status CHECK (
        status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'DISPOSED')
    )
);

CREATE UNIQUE INDEX uq_asset_tag_branch
    ON asset.assets (hospital_id, branch_id, asset_tag)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_asset_hospital_status
    ON asset.assets (hospital_id, branch_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_asset_category
    ON asset.assets (category_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_asset_search
    ON asset.assets (hospital_id, branch_id, lower(name), lower(asset_tag))
    WHERE deleted_at IS NULL;

-- =============================================================================
-- asset.maintenance_logs
-- =============================================================================

CREATE TABLE asset.maintenance_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    asset_id            UUID NOT NULL REFERENCES asset.assets (id),
    maintenance_type    VARCHAR(30) NOT NULL,
    performed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    performed_by        UUID,
    notes               TEXT,
    next_due_at         TIMESTAMPTZ,
    cost_amount         NUMERIC(12, 2),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_asset_maintenance_type CHECK (
        maintenance_type IN ('PREVENTIVE', 'CORRECTIVE', 'CALIBRATION', 'INSPECTION')
    )
);

CREATE INDEX idx_asset_maintenance_asset
    ON asset.maintenance_logs (asset_id, performed_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- Role: ASSET_MANAGER
-- =============================================================================

INSERT INTO iam.roles (id, tenant_id, name, description)
VALUES (
    '00000000-0000-0000-0000-00000000001B',
    '00000000-0000-0000-0000-000000000001',
    'ASSET_MANAGER',
    'Hospital biomedical / fixed-asset manager'
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Permissions + role grants
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('asset', 'read', 'asset:read', 'View hospital assets'),
    ('asset', 'write', 'asset:write', 'Create and update hospital assets'),
    ('asset:maintenance', 'write', 'asset:maintenance:write', 'Record asset maintenance')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'ASSET_MANAGER', 'PLATFORM_ADMIN')
  AND p.code IN ('asset:read', 'asset:write', 'asset:maintenance:write')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Subscription plan feature
-- =============================================================================

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_ASSET_MANAGEMENT', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_ASSET_MANAGEMENT'
        AND f.deleted_at IS NULL
  );
