-- V49: P2-F5 — Grant RECEPTIONIST billing permissions for OPD checkout

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'RECEPTIONIST'
  AND p.code IN (
      'billing:invoice:read',
      'billing:invoice:write',
      'billing:payment:read',
      'billing:payment:write'
  )
ON CONFLICT DO NOTHING;
