-- V72: Allow NURSE to read wards/beds for the IPD ward board.
INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('NURSE', 'ICU_NURSE')
  AND p.code IN ('ipd:ward:read', 'ipd:bed:read')
ON CONFLICT DO NOTHING;
