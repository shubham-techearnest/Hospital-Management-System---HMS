-- V64: Reception can view lab/imaging orders on OPD checkout checklist

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'RECEPTIONIST'
  AND p.code = 'clinical:order:read'
ON CONFLICT DO NOTHING;
