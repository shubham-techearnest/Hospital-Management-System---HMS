-- V45: P2-F1 — Appointment ARRIVED status + arrive permission

ALTER TABLE scheduling.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE scheduling.appointments ADD CONSTRAINT appointments_status_check
    CHECK (status IN (
        'PENDING',
        'CONFIRMED',
        'ARRIVED',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
        'RESCHEDULED',
        'POSTPONED'
    ));

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('scheduling:appointment', 'arrive', 'scheduling:appointment:arrive',
     'Mark appointment arrived and sync OPD encounter/queue')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('RECEPTIONIST', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'DOCTOR')
  AND p.code = 'scheduling:appointment:arrive'
ON CONFLICT DO NOTHING;
