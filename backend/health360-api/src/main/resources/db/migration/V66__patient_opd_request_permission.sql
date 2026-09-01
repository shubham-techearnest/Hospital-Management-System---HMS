-- Patient self-service OPD request (join queue without appointment/token flow)

INSERT INTO iam.permissions (id, resource, action, code, description)
VALUES
    ('00000000-0000-0000-0000-000000000526', 'opd', 'request:own', 'opd:request:own', 'Patient submit OPD visit request for today')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('PATIENT', 'PLATFORM_ADMIN')
  AND p.code = 'opd:request:own'
ON CONFLICT DO NOTHING;
