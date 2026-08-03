-- V9: Dev-only seed users for local testing [S7]
-- Password for both accounts: SecureP@ss1!  (BCrypt strength 12)
-- Do not use these credentials outside local development.

-- Fixed IDs for deterministic local dev references
-- Tenant:     00000000-0000-0000-0000-000000000001
-- Hosp admin: 00000000-0000-0000-0000-000000000020
-- Plat admin: 00000000-0000-0000-0000-000000000021
-- Hospital:   00000000-0000-0000-0000-000000000030
-- Branch:     00000000-0000-0000-0000-000000000031

INSERT INTO iam.users (
    id, tenant_id, email, password_hash,
    first_name, last_name, phone,
    status, email_verified, email_verified_at
)
VALUES
    (
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000001',
        'hospital.admin@health360.test',
        '$2a$12$t2j3c6vGKiRZuY4vub7GkeqXN4DrT11TjNB6McxulQoKiKkMEK7Wi',
        'Hospital',
        'Admin',
        '9876500001',
        'ACTIVE',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000021',
        '00000000-0000-0000-0000-000000000001',
        'platform.admin@health360.test',
        '$2a$12$t2j3c6vGKiRZuY4vub7GkeqXN4DrT11TjNB6McxulQoKiKkMEK7Wi',
        'Platform',
        'Admin',
        '9876500002',
        'ACTIVE',
        TRUE,
        NOW()
    );

INSERT INTO iam.user_roles (id, tenant_id, user_id, role_id)
VALUES
    (
        '00000000-0000-0000-0000-000000000040',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000012'
    ),
    (
        '00000000-0000-0000-0000-000000000041',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000021',
        '00000000-0000-0000-0000-000000000013'
    );

INSERT INTO iam.notification_preferences (
    tenant_id, user_id, notification_type,
    email_enabled, sms_enabled, in_app_enabled
)
SELECT
    u.tenant_id,
    u.id,
    t.notification_type,
    TRUE,
    t.notification_type IN (
        'APPOINTMENT_CONFIRMATION',
        'APPOINTMENT_REMINDER_24H',
        'APPOINTMENT_REMINDER_1H',
        'APPOINTMENT_CANCELLATION'
    ),
    TRUE
FROM iam.users u
CROSS JOIN (
    VALUES
        ('APPOINTMENT_CONFIRMATION'),
        ('APPOINTMENT_REMINDER_24H'),
        ('APPOINTMENT_REMINDER_1H'),
        ('APPOINTMENT_CANCELLATION'),
        ('VERIFICATION_STATUS'),
        ('REVIEW_PROMPT')
) AS t(notification_type)
WHERE u.id IN (
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000021'
);

INSERT INTO hospital.hospitals (
    id, tenant_id, admin_user_id,
    name, registration_number, hospital_type,
    established_year, total_bed_count, accreditation,
    description, emergency_available_24x7,
    created_by, updated_by
)
VALUES (
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000020',
    'Health360 Dev Hospital',
    'DEV-HOSP-001',
    'PRIVATE',
    2010,
    120,
    'NABH',
    'Seeded dev hospital for local S7 testing.',
    TRUE,
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000020'
);

INSERT INTO hospital.branches (
    id, tenant_id, hospital_id,
    name, address_line1, city, state, pincode, country,
    latitude, longitude, phone, email, is_primary,
    created_by, updated_by
)
VALUES (
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000030',
    'Main Campus',
    '100 Dev Hospital Road',
    'Mumbai',
    'Maharashtra',
    '400001',
    'IN',
    19.0760900,
    72.8774260,
    '9876500001',
    'hospital.admin@health360.test',
    TRUE,
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000020'
);
