-- V2: Role-permission mappings for RBAC bootstrap
INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code IN ('health:read', 'user:read', 'user:write', 'patient:profile:read', 'patient:profile:write');

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN ('health:read', 'user:read', 'user:write', 'doctor:profile:read', 'doctor:profile:write');

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code IN ('health:read', 'user:read', 'user:write');

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code IN (
    'health:read', 'user:read', 'user:write',
    'patient:profile:read', 'patient:profile:write',
    'doctor:profile:read', 'doctor:profile:write',
    'admin:users:read', 'admin:users:write'
  );
