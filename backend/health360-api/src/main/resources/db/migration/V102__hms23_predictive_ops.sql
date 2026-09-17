-- V102: HMS-23 Advanced / predictive automation

CREATE TABLE IF NOT EXISTS automation.predictive_insights (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    insight_type        VARCHAR(40) NOT NULL,
    severity            VARCHAR(20) NOT NULL DEFAULT 'INFO',
    title               VARCHAR(200) NOT NULL,
    message             TEXT NOT NULL,
    score               INT NOT NULL DEFAULT 0,
    status              VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    payload             JSONB,
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,
    acknowledged_at     TIMESTAMPTZ,
    acknowledged_by     UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_predictive_insight_type CHECK (
        insight_type IN ('BED_PRESSURE', 'ED_PRESSURE', 'TASK_SLA_RISK', 'STOCKOUT_RISK', 'LEAVE_COVERAGE')
    ),
    CONSTRAINT chk_predictive_severity CHECK (
        severity IN ('INFO', 'WARN', 'CRITICAL')
    ),
    CONSTRAINT chk_predictive_status CHECK (
        status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')
    ),
    CONSTRAINT chk_predictive_score CHECK (score >= 0 AND score <= 100)
);

CREATE INDEX idx_predictive_insights_active
    ON automation.predictive_insights (hospital_id, branch_id, status, severity, generated_at DESC)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_predictive_insight_active_type
    ON automation.predictive_insights (hospital_id, branch_id, insight_type)
    WHERE deleted_at IS NULL AND status = 'ACTIVE';

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('predictive', 'read', 'predictive:read', 'View predictive ops insights'),
    ('predictive', 'write', 'predictive:write', 'Refresh or acknowledge predictive insights')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN ('predictive:read', 'predictive:write')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('NURSE', 'RECEPTIONIST', 'DOCTOR')
  AND p.code IN ('predictive:read')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_PREDICTIVE_OPS', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_PREDICTIVE_OPS'
        AND f.deleted_at IS NULL
  );
