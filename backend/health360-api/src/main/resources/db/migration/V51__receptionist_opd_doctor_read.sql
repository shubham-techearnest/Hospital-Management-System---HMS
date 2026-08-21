-- V51: Reception can list hospital doctors for OPD walk-in assignment

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'RECEPTIONIST'
  AND p.code IN ('hospital:doctors:read', 'opd:desk:read')
ON CONFLICT DO NOTHING;
