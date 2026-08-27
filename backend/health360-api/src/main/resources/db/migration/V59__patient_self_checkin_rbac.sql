-- ECO-P5: patient self check-in (same ARRIVED + queue outcome as desk arrive).

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('opd', 'checkin:own', 'opd:checkin:own', 'Patient self check-in for own appointment')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code = 'opd:checkin:own'
ON CONFLICT DO NOTHING;
