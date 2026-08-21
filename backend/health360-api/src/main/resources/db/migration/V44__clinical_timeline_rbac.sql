-- V44: P1-F3 — Clinical timeline read permission

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('clinical:timeline', 'read', 'clinical:timeline:read', 'View patient clinical timeline (encounters and clinical documentation)')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('RECEPTIONIST', 'NURSE', 'ICU_NURSE', 'DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code = 'clinical:timeline:read'
ON CONFLICT DO NOTHING;
