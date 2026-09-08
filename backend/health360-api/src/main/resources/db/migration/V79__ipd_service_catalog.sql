-- V79: Phase I0 — IPD plan features + hospital IPD service catalog + settings permissions

-- -----------------------------------------------------------------------------
-- Subscription plan features: FEATURE_IPD / FEATURE_ICU (enabled on all active plans)
-- -----------------------------------------------------------------------------

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, v.feature_key, TRUE
FROM shared.subscription_plans p
CROSS JOIN (VALUES ('FEATURE_IPD'), ('FEATURE_ICU')) AS v(feature_key)
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = v.feature_key
        AND f.deleted_at IS NULL
  );

-- -----------------------------------------------------------------------------
-- Hospital IPD service settings (per-hospital catalog)
-- -----------------------------------------------------------------------------

CREATE TABLE hospital.ipd_service_settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    preset_code         VARCHAR(40),
    country_code        VARCHAR(2) NOT NULL DEFAULT 'IN',
    enabled_services    JSONB NOT NULL DEFAULT '{}'::jsonb,
    country_config      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_service_country CHECK (country_code ~ '^[A-Z]{2}$')
);

CREATE UNIQUE INDEX uq_hospital_ipd_service_settings_hospital
    ON hospital.ipd_service_settings (hospital_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_hospital_ipd_service_settings_tenant
    ON hospital.ipd_service_settings (tenant_id)
    WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- RBAC: IPD settings
-- -----------------------------------------------------------------------------

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('ipd:settings', 'read', 'ipd:settings:read', 'View hospital IPD service catalog'),
    ('ipd:settings', 'write', 'ipd:settings:write', 'Configure hospital IPD service catalog'),
    ('ipd:admin', 'write', 'ipd:admin', 'IPD module administration')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND r.deleted_at IS NULL
  AND p.code IN ('ipd:settings:read', 'ipd:settings:write', 'ipd:admin')
ON CONFLICT DO NOTHING;
