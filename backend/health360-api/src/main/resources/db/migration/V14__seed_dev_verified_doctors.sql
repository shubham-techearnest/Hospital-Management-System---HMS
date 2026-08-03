-- V14: Dev-only verified doctors for local doctor search & booking [S8/S12]
-- Password for all accounts: SecureP@ss1!  (BCrypt strength 12)

-- Doctor users:  050, 051, 052
-- Doctor profiles: 060, 061, 062
-- Hospital associations: 070, 071, 072

INSERT INTO iam.users (
    id, tenant_id, email, password_hash,
    first_name, last_name, phone,
    status, email_verified, email_verified_at
)
VALUES
    (
        '00000000-0000-0000-0000-000000000050',
        '00000000-0000-0000-0000-000000000001',
        'parmeshwar.doctor@health360.test',
        '$2a$12$t2j3c6vGKiRZuY4vub7GkeqXN4DrT11TjNB6McxulQoKiKkMEK7Wi',
        'Parmeshwar',
        'Suryawansh',
        '9876500101',
        'ACTIVE',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000051',
        '00000000-0000-0000-0000-000000000001',
        'ananya.sharma@health360.test',
        '$2a$12$t2j3c6vGKiRZuY4vub7GkeqXN4DrT11TjNB6McxulQoKiKkMEK7Wi',
        'Ananya',
        'Sharma',
        '9876500102',
        'ACTIVE',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000052',
        '00000000-0000-0000-0000-000000000001',
        'raj.patel@health360.test',
        '$2a$12$t2j3c6vGKiRZuY4vub7GkeqXN4DrT11TjNB6McxulQoKiKkMEK7Wi',
        'Raj',
        'Patel',
        '9876500103',
        'ACTIVE',
        TRUE,
        NOW()
    )
ON CONFLICT DO NOTHING;

INSERT INTO iam.user_roles (id, tenant_id, user_id, role_id)
VALUES
    ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000011'),
    ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000011'),
    ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000011')
ON CONFLICT DO NOTHING;

INSERT INTO doctor.doctor_profiles (
    id, tenant_id, user_id,
    medical_registration_number, registration_council, registration_year,
    gender, biography, total_years_experience,
    primary_specialization_id,
    verification_status, verified_at, verified_by,
    average_rating, review_count,
    created_by, updated_by
)
VALUES
    (
        '00000000-0000-0000-0000-000000000060',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000050',
        'DEV-MH-001',
        'Maharashtra Medical Council',
        2015,
        'MALE',
        'General physician with focus on preventive care and chronic disease management.',
        10,
        (SELECT id FROM shared.specializations WHERE code = 'GENERAL_PHYSICIAN' LIMIT 1),
        'VERIFIED',
        NOW(),
        '00000000-0000-0000-0000-000000000021',
        4.60,
        12,
        '00000000-0000-0000-0000-000000000021',
        '00000000-0000-0000-0000-000000000021'
    ),
    (
        '00000000-0000-0000-0000-000000000061',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000051',
        'DEV-MH-002',
        'Maharashtra Medical Council',
        2012,
        'FEMALE',
        'Cardiologist specializing in hypertension and heart failure management.',
        14,
        (SELECT id FROM shared.specializations WHERE code = 'CARDIOLOGIST' LIMIT 1),
        'VERIFIED',
        NOW(),
        '00000000-0000-0000-0000-000000000021',
        4.80,
        28,
        '00000000-0000-0000-0000-000000000021',
        '00000000-0000-0000-0000-000000000021'
    ),
    (
        '00000000-0000-0000-0000-000000000062',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000052',
        'DEV-MH-003',
        'Maharashtra Medical Council',
        2018,
        'MALE',
        'Pediatrician providing child wellness visits and vaccination guidance.',
        8,
        (SELECT id FROM shared.specializations WHERE code = 'PEDIATRICIAN' LIMIT 1),
        'VERIFIED',
        NOW(),
        '00000000-0000-0000-0000-000000000021',
        4.50,
        9,
        '00000000-0000-0000-0000-000000000021',
        '00000000-0000-0000-0000-000000000021'
    )
ON CONFLICT DO NOTHING;

INSERT INTO doctor.hospital_associations (
    id, tenant_id, doctor_id, hospital_id, branch_id, status,
    created_by, updated_by
)
VALUES
    (
        '00000000-0000-0000-0000-000000000070',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000060',
        '00000000-0000-0000-0000-000000000030',
        '00000000-0000-0000-0000-000000000031',
        'ACTIVE',
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000020'
    ),
    (
        '00000000-0000-0000-0000-000000000071',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000061',
        '00000000-0000-0000-0000-000000000030',
        '00000000-0000-0000-0000-000000000031',
        'ACTIVE',
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000020'
    ),
    (
        '00000000-0000-0000-0000-000000000072',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000062',
        '00000000-0000-0000-0000-000000000030',
        '00000000-0000-0000-0000-000000000031',
        'ACTIVE',
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000020'
    )
ON CONFLICT DO NOTHING;

INSERT INTO doctor.doctor_languages (doctor_id, language_code)
VALUES
    ('00000000-0000-0000-0000-000000000060', 'en'),
    ('00000000-0000-0000-0000-000000000060', 'hi'),
    ('00000000-0000-0000-0000-000000000060', 'mr'),
    ('00000000-0000-0000-0000-000000000061', 'en'),
    ('00000000-0000-0000-0000-000000000061', 'hi'),
    ('00000000-0000-0000-0000-000000000062', 'en'),
    ('00000000-0000-0000-0000-000000000062', 'gu')
ON CONFLICT DO NOTHING;

INSERT INTO doctor.consultation_defaults (
    id, tenant_id, doctor_id, consultation_type, fee_amount, currency, duration_minutes,
    created_by, updated_by
)
VALUES
    ('00000000-0000-0000-0000-000000000080', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000060', 'IN_PERSON', 500.00, 'INR', 15, '00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000050'),
    ('00000000-0000-0000-0000-000000000081', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000061', 'IN_PERSON', 800.00, 'INR', 20, '00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000051'),
    ('00000000-0000-0000-0000-000000000082', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000062', 'IN_PERSON', 600.00, 'INR', 15, '00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000052')
ON CONFLICT DO NOTHING;

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
    '00000000-0000-0000-0000-000000000050',
    '00000000-0000-0000-0000-000000000051',
    '00000000-0000-0000-0000-000000000052'
)
ON CONFLICT DO NOTHING;
