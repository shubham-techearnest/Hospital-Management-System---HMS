-- V17: Analytics schema [DOC-06 §9] — S10 Formula Engine

CREATE SCHEMA IF NOT EXISTS analytics;

-- =============================================================================
-- analytics.health_metrics_snapshots (immutable)
-- =============================================================================

CREATE TABLE analytics.health_metrics_snapshots (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                       UUID NOT NULL,
    patient_id                      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    calculated_at                   TIMESTAMPTZ NOT NULL,
    profile_completion_at_calc      INTEGER NOT NULL,
    wellness_score                  INTEGER,
    wellness_label                  VARCHAR(20),
    health_risk_score               INTEGER,
    health_risk_label               VARCHAR(20),
    wellness_factors                JSONB,
    risk_factors                    JSONB,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_snapshot_completion CHECK (profile_completion_at_calc BETWEEN 0 AND 100),
    CONSTRAINT chk_snapshot_wellness CHECK (wellness_score IS NULL OR wellness_score BETWEEN 0 AND 100),
    CONSTRAINT chk_snapshot_risk CHECK (health_risk_score IS NULL OR health_risk_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_metrics_snapshot_patient
    ON analytics.health_metrics_snapshots (patient_id, calculated_at DESC);

CREATE INDEX idx_metrics_snapshot_latest
    ON analytics.health_metrics_snapshots (patient_id, calculated_at DESC);

-- =============================================================================
-- analytics.calculated_metrics (immutable child)
-- =============================================================================

CREATE TABLE analytics.calculated_metrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id     UUID NOT NULL REFERENCES analytics.health_metrics_snapshots (id) ON DELETE CASCADE,
    metric_type     VARCHAR(50) NOT NULL,
    value           DECIMAL(12, 4),
    unit            VARCHAR(30),
    classification  VARCHAR(20) NOT NULL,
    interpretation  TEXT,
    missing_fields  JSONB,
    display_value   VARCHAR(100)
);

CREATE INDEX idx_calc_metrics_snapshot ON analytics.calculated_metrics (snapshot_id);
CREATE INDEX idx_calc_metrics_type ON analytics.calculated_metrics (snapshot_id, metric_type);

-- =============================================================================
-- IAM permissions for analytics
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('dashboard', 'view', 'dashboard:view', 'View health dashboard'),
    ('analytics', 'read', 'analytics:read', 'Read health analytics metrics')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code IN ('dashboard:view', 'analytics:read')
ON CONFLICT DO NOTHING;
