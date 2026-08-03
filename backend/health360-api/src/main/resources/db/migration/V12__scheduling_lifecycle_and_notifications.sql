-- V12: Scheduling lifecycle permissions + appointment reminder tracking [S9]

CREATE TABLE scheduling.appointment_reminders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    appointment_id  UUID NOT NULL REFERENCES scheduling.appointments (id),
    reminder_type   VARCHAR(10) NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reminder_type CHECK (reminder_type IN ('24H', '1H')),
    CONSTRAINT uq_appointment_reminder UNIQUE (appointment_id, reminder_type)
);

CREATE INDEX idx_appointment_reminders_appointment ON scheduling.appointment_reminders (appointment_id);

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('appointment', 'cancel', 'appointment:cancel', 'Cancel own appointments'),
    ('appointment', 'reschedule', 'appointment:reschedule', 'Reschedule own appointments'),
    ('appointment', 'manage', 'appointment:manage', 'Manage appointment status as doctor')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code IN ('appointment:cancel', 'appointment:reschedule')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN ('appointment:cancel', 'appointment:manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code IN ('appointment:cancel', 'appointment:reschedule', 'appointment:manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;
