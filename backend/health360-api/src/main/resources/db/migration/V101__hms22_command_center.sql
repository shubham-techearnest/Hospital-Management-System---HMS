-- V101: HMS-22 Command Center + My Work UX (feature flag + RBAC)

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('commandcenter', 'read', 'commandcenter:read', 'View hospital command center operational snapshot')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'NURSE', 'RECEPTIONIST', 'DOCTOR')
  AND p.code IN ('commandcenter:read')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_COMMAND_CENTER', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_COMMAND_CENTER'
        AND f.deleted_at IS NULL
  );
