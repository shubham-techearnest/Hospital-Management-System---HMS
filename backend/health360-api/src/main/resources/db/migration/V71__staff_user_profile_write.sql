-- V71: Allow hospital staff roles to update their own account profile (name/phone/timezone/locale).
INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN (
    'RECEPTIONIST',
    'NURSE',
    'ICU_NURSE',
    'LAB_TECHNICIAN',
    'RADIOLOGY_TECHNICIAN',
    'OT_COORDINATOR',
    'PHARMACIST'
  )
  AND p.code IN ('user:read', 'user:write')
ON CONFLICT DO NOTHING;
