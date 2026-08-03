-- V16: Complete Health360 hospital profile, Siddharth Deshmukh doctor profile,
-- and booking schedules/slots for all verified doctors at Health360.

-- =============================================================================
-- Health360 Hospital — full profile
-- =============================================================================

UPDATE hospital.hospitals
SET
    name = 'Health360 Hospital',
    description = 'Health360 Hospital is a multi-specialty private hospital offering outpatient consultations, emergency care, ICU, and diagnostic services in Mumbai.',
    established_year = 2010,
    total_bed_count = 150,
    accreditation = 'NABH',
    emergency_available_24x7 = TRUE,
    emergency_phone = '108',
    ambulance_available = TRUE,
    icu_available = TRUE,
    icu_bed_count = 24,
    icu_type = 'GENERAL',
    average_rating = 4.70,
    review_count = 86,
    updated_at = NOW(),
    updated_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '00000000-0000-0000-0000-000000000030';

UPDATE hospital.branches
SET
    name = 'Main Campus',
    address_line1 = '100 Health360 Hospital Road',
    address_line2 = 'Andheri East',
    city = 'Mumbai',
    state = 'Maharashtra',
    pincode = '400069',
    phone = '9876500001',
    email = 'contact@health360.test',
    is_primary = TRUE,
    updated_at = NOW(),
    updated_by = '00000000-0000-0000-0000-000000000020'
WHERE id = '00000000-0000-0000-0000-000000000031';

INSERT INTO hospital.branch_working_hours (branch_id, day_of_week, open_time, close_time, is_closed)
VALUES
    ('00000000-0000-0000-0000-000000000031', 'MONDAY', '08:00', '20:00', FALSE),
    ('00000000-0000-0000-0000-000000000031', 'TUESDAY', '08:00', '20:00', FALSE),
    ('00000000-0000-0000-0000-000000000031', 'WEDNESDAY', '08:00', '20:00', FALSE),
    ('00000000-0000-0000-0000-000000000031', 'THURSDAY', '08:00', '20:00', FALSE),
    ('00000000-0000-0000-0000-000000000031', 'FRIDAY', '08:00', '20:00', FALSE),
    ('00000000-0000-0000-0000-000000000031', 'SATURDAY', '09:00', '17:00', FALSE),
    ('00000000-0000-0000-0000-000000000031', 'SUNDAY', '09:00', '13:00', FALSE)
ON CONFLICT (branch_id, day_of_week) DO UPDATE
SET open_time = EXCLUDED.open_time,
    close_time = EXCLUDED.close_time,
    is_closed = EXCLUDED.is_closed;

INSERT INTO hospital.departments (
    id, tenant_id, hospital_id, name, description, floor, is_active,
    created_by, updated_by
)
VALUES
    (
        '00000000-0000-0000-0000-000000000100',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000030',
        'General Medicine',
        'Primary care, preventive health, and chronic disease management.',
        '2',
        TRUE,
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000020'
    ),
    (
        '00000000-0000-0000-0000-000000000101',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000030',
        'Cardiology',
        'Heart disease diagnosis, ECG, and hypertension management.',
        '3',
        TRUE,
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000020'
    ),
    (
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000030',
        'Pediatrics',
        'Child wellness, vaccinations, and adolescent care.',
        '4',
        TRUE,
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000020'
    ),
    (
        '00000000-0000-0000-0000-000000000103',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000030',
        'Orthopedics',
        'Bone, joint, and sports injury consultations.',
        '5',
        TRUE,
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000020'
    ),
    (
        '00000000-0000-0000-0000-000000000104',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000030',
        'Emergency',
        '24x7 emergency and trauma care.',
        'G',
        TRUE,
        '00000000-0000-0000-0000-000000000020',
        '00000000-0000-0000-0000-000000000020'
    )
ON CONFLICT DO NOTHING;

UPDATE hospital.departments
SET head_doctor_id = '00000000-0000-0000-0000-000000000060'
WHERE id = '00000000-0000-0000-0000-000000000100';

UPDATE hospital.departments
SET head_doctor_id = '00000000-0000-0000-0000-000000000061'
WHERE id = '00000000-0000-0000-0000-000000000101';

UPDATE hospital.departments
SET head_doctor_id = '00000000-0000-0000-0000-000000000062'
WHERE id = '00000000-0000-0000-0000-000000000102';

-- =============================================================================
-- Siddharth Deshmukh — seed account (fresh dev) + complete any registered match
-- Password: SecureP@ss1!
-- =============================================================================

INSERT INTO iam.users (
    id, tenant_id, email, password_hash,
    first_name, last_name, phone,
    status, email_verified, email_verified_at
)
VALUES (
    '00000000-0000-0000-0000-000000000053',
    '00000000-0000-0000-0000-000000000001',
    'siddharth.deshmukh@health360.test',
    '$2a$12$t2j3c6vGKiRZuY4vub7GkeqXN4DrT11TjNB6McxulQoKiKkMEK7Wi',
    'Siddharth',
    'Deshmukh',
    '9876500104',
    'ACTIVE',
    TRUE,
    NOW()
)
ON CONFLICT DO NOTHING;

INSERT INTO iam.user_roles (id, tenant_id, user_id, role_id)
VALUES (
    '00000000-0000-0000-0000-000000000053',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000053',
    '00000000-0000-0000-0000-000000000011'
)
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
VALUES (
    '00000000-0000-0000-0000-000000000063',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000053',
    'DEV-MH-004',
    'Maharashtra Medical Council',
    2016,
    'MALE',
    'Internal medicine specialist with expertise in diabetes, hypertension, and lifestyle medicine.',
    9,
    (SELECT id FROM shared.specializations WHERE code = 'GENERAL_PHYSICIAN' LIMIT 1),
    'VERIFIED',
    NOW(),
    '00000000-0000-0000-0000-000000000021',
    4.75,
    18,
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000021'
)
ON CONFLICT DO NOTHING;

-- Complete any registered Siddharth Deshmukh profile (skip verification)
UPDATE doctor.doctor_profiles dp
SET
    medical_registration_number = CASE
        WHEN NULLIF(dp.medical_registration_number, '') IS NOT NULL THEN dp.medical_registration_number
        WHEN dp.id = '00000000-0000-0000-0000-000000000063' THEN 'DEV-MH-004'
        ELSE 'DEV-MH-S' || upper(substring(replace(dp.id::text, '-', '') from 29 for 4))
    END,
    registration_council = COALESCE(dp.registration_council, 'Maharashtra Medical Council'),
    registration_year = COALESCE(dp.registration_year, 2016),
    gender = COALESCE(dp.gender, 'MALE'),
    biography = COALESCE(
        NULLIF(dp.biography, ''),
        'Internal medicine specialist with expertise in diabetes, hypertension, and lifestyle medicine.'
    ),
    total_years_experience = COALESCE(dp.total_years_experience, 9),
    primary_specialization_id = COALESCE(
        dp.primary_specialization_id,
        (SELECT id FROM shared.specializations WHERE code = 'GENERAL_PHYSICIAN' LIMIT 1)
    ),
    verification_status = 'VERIFIED',
    verification_rejection_reason = NULL,
    verified_at = COALESCE(dp.verified_at, NOW()),
    verified_by = COALESCE(dp.verified_by, '00000000-0000-0000-0000-000000000021'),
    average_rating = COALESCE(dp.average_rating, 4.75),
    review_count = GREATEST(dp.review_count, 18),
    updated_at = NOW(),
    updated_by = '00000000-0000-0000-0000-000000000021'
FROM iam.users u
WHERE dp.user_id = u.id
  AND dp.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND (
      u.id = '00000000-0000-0000-0000-000000000053'
      OR lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  );

-- Ensure Siddharth has a profile row if registered without one
INSERT INTO doctor.doctor_profiles (
    tenant_id, user_id,
    medical_registration_number, registration_council, registration_year,
    gender, biography, total_years_experience,
    primary_specialization_id,
    verification_status, verified_at, verified_by,
    average_rating, review_count,
    created_by, updated_by
)
SELECT
    u.tenant_id,
    u.id,
    CASE
        WHEN u.id = '00000000-0000-0000-0000-000000000053' THEN 'DEV-MH-004'
        ELSE 'DEV-MH-S' || upper(substring(replace(u.id::text, '-', '') from 29 for 4))
    END,
    'Maharashtra Medical Council',
    2016,
    'MALE',
    'Internal medicine specialist with expertise in diabetes, hypertension, and lifestyle medicine.',
    9,
    (SELECT id FROM shared.specializations WHERE code = 'GENERAL_PHYSICIAN' LIMIT 1),
    'VERIFIED',
    NOW(),
    '00000000-0000-0000-0000-000000000021',
    4.75,
    18,
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000021'
FROM iam.users u
WHERE u.deleted_at IS NULL
  AND (
      u.id = '00000000-0000-0000-0000-000000000053'
      OR lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  )
  AND NOT EXISTS (
      SELECT 1
      FROM doctor.doctor_profiles dp
      WHERE dp.user_id = u.id
        AND dp.deleted_at IS NULL
  );

-- Qualifications & experience for Siddharth (seed profile + any matched profile)
INSERT INTO doctor.qualifications (
    id, tenant_id, doctor_id, degree, institution, year_of_completion, country,
    created_by, updated_by
)
SELECT
    gen_random_uuid(),
    dp.tenant_id,
    dp.id,
    q.degree,
    q.institution,
    q.year_of_completion,
    'IN',
    dp.user_id,
    dp.user_id
FROM doctor.doctor_profiles dp
INNER JOIN iam.users u ON u.id = dp.user_id
CROSS JOIN (
    VALUES
        ('MBBS', 'Grant Medical College, Mumbai', 2012),
        ('MD (Internal Medicine)', 'Seth GS Medical College, Mumbai', 2016)
) AS q(degree, institution, year_of_completion)
WHERE dp.deleted_at IS NULL
  AND (
      dp.id = '00000000-0000-0000-0000-000000000063'
      OR lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  )
  AND NOT EXISTS (
      SELECT 1
      FROM doctor.qualifications existing
      WHERE existing.doctor_id = dp.id
        AND existing.degree = q.degree
        AND existing.deleted_at IS NULL
  );

INSERT INTO doctor.experience_entries (
    id, tenant_id, doctor_id, institution, position, start_year, end_year,
    created_by, updated_by
)
SELECT
    gen_random_uuid(),
    dp.tenant_id,
    dp.id,
    e.institution,
    e.position,
    e.start_year,
    e.end_year,
    dp.user_id,
    dp.user_id
FROM doctor.doctor_profiles dp
INNER JOIN iam.users u ON u.id = dp.user_id
CROSS JOIN (
    VALUES
        ('Health360 Hospital', 'Consultant Physician', 2018, NULL),
        ('City Care Clinic', 'Resident Medical Officer', 2016, 2018)
) AS e(institution, position, start_year, end_year)
WHERE dp.deleted_at IS NULL
  AND (
      dp.id = '00000000-0000-0000-0000-000000000063'
      OR lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  )
  AND NOT EXISTS (
      SELECT 1
      FROM doctor.experience_entries existing
      WHERE existing.doctor_id = dp.id
        AND existing.institution = e.institution
        AND existing.deleted_at IS NULL
  );

INSERT INTO doctor.doctor_languages (doctor_id, language_code)
SELECT dp.id, lang.code
FROM doctor.doctor_profiles dp
INNER JOIN iam.users u ON u.id = dp.user_id
CROSS JOIN (VALUES ('en'), ('hi'), ('mr')) AS lang(code)
WHERE dp.deleted_at IS NULL
  AND (
      dp.id = '00000000-0000-0000-0000-000000000063'
      OR lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  )
ON CONFLICT DO NOTHING;

INSERT INTO doctor.consultation_defaults (
    id, tenant_id, doctor_id, consultation_type, fee_amount, currency, duration_minutes,
    created_by, updated_by
)
SELECT
    '00000000-0000-0000-0000-000000000083',
    dp.tenant_id,
    dp.id,
    'IN_PERSON',
    650.00,
    'INR',
    15,
    dp.user_id,
    dp.user_id
FROM doctor.doctor_profiles dp
INNER JOIN iam.users u ON u.id = dp.user_id
WHERE dp.deleted_at IS NULL
  AND (
      dp.id = '00000000-0000-0000-0000-000000000063'
      OR lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  )
ON CONFLICT DO NOTHING;

-- Active hospital association for Siddharth
INSERT INTO doctor.hospital_associations (
    id, tenant_id, doctor_id, hospital_id, branch_id, department_id, status,
    created_by, updated_by
)
SELECT
    '00000000-0000-0000-0000-000000000073',
    dp.tenant_id,
    dp.id,
    '00000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000100',
    'ACTIVE',
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000020'
FROM doctor.doctor_profiles dp
INNER JOIN iam.users u ON u.id = dp.user_id
WHERE dp.deleted_at IS NULL
  AND (
      dp.id = '00000000-0000-0000-0000-000000000063'
      OR lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  )
ON CONFLICT DO NOTHING;

UPDATE doctor.hospital_associations ha
SET status = 'ACTIVE',
    department_id = COALESCE(ha.department_id, '00000000-0000-0000-0000-000000000100'),
    branch_id = COALESCE(ha.branch_id, '00000000-0000-0000-0000-000000000031'),
    updated_at = NOW(),
    updated_by = '00000000-0000-0000-0000-000000000020'
FROM doctor.doctor_profiles dp
INNER JOIN iam.users u ON u.id = dp.user_id
WHERE ha.doctor_id = dp.id
  AND ha.hospital_id = '00000000-0000-0000-0000-000000000030'
  AND ha.deleted_at IS NULL
  AND (
      dp.id = '00000000-0000-0000-0000-000000000063'
      OR lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  );

-- Approve any pending Siddharth association at Health360
UPDATE doctor.hospital_associations ha
SET status = 'ACTIVE',
    updated_at = NOW(),
    updated_by = '00000000-0000-0000-0000-000000000020'
FROM doctor.doctor_profiles dp
INNER JOIN iam.users u ON u.id = dp.user_id
WHERE ha.doctor_id = dp.id
  AND ha.status = 'PENDING'
  AND ha.deleted_at IS NULL
  AND (
      lower(u.email) LIKE '%siddharth%deshmukh%'
      OR (lower(u.first_name) LIKE '%siddhar%' AND lower(u.last_name) LIKE '%deshmukh%')
  );

-- =============================================================================
-- Booking schedules + available slots for all verified doctors at Health360
-- =============================================================================

DO $$
DECLARE
    rec RECORD;
    block_rec RECORD;
    sched_id UUID;
    cur_slot_date DATE;
    slot_start TIME;
    slot_end TIME;
    block_end TIME;
    slot_duration INTEGER := 15;
    slot_buffer INTEGER := 5;
    horizon INTEGER := 30;
    dow TEXT;
BEGIN
    FOR rec IN
        SELECT
            dp.id AS doctor_id,
            dp.tenant_id,
            dp.user_id,
            ha.hospital_id,
            ha.branch_id
        FROM doctor.doctor_profiles dp
        INNER JOIN doctor.hospital_associations ha
            ON ha.doctor_id = dp.id
            AND ha.status = 'ACTIVE'
            AND ha.deleted_at IS NULL
        WHERE dp.verification_status = 'VERIFIED'
          AND dp.deleted_at IS NULL
          AND ha.hospital_id = '00000000-0000-0000-0000-000000000030'
          AND ha.branch_id = '00000000-0000-0000-0000-000000000031'
    LOOP
        SELECT id INTO sched_id
        FROM scheduling.doctor_schedules
        WHERE doctor_id = rec.doctor_id
          AND hospital_id = rec.hospital_id
          AND branch_id = rec.branch_id
          AND deleted_at IS NULL
          AND is_active = TRUE
        LIMIT 1;

        IF sched_id IS NULL THEN
            sched_id := gen_random_uuid();
            INSERT INTO scheduling.doctor_schedules (
                id, tenant_id, doctor_id, hospital_id, branch_id,
                slot_duration_minutes, buffer_minutes, horizon_days, is_active,
                created_by, updated_by
            ) VALUES (
                sched_id, rec.tenant_id, rec.doctor_id, rec.hospital_id, rec.branch_id,
                slot_duration, slot_buffer, horizon, TRUE,
                rec.user_id, rec.user_id
            );
        END IF;

        FOR dow IN SELECT unnest(ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'])
        LOOP
            IF NOT EXISTS (
                SELECT 1
                FROM scheduling.schedule_blocks sb
                WHERE sb.schedule_id = sched_id
                  AND sb.day_of_week = dow
                  AND sb.start_time = TIME '09:00'
                  AND sb.deleted_at IS NULL
            ) THEN
                INSERT INTO scheduling.schedule_blocks (
                    id, tenant_id, schedule_id, day_of_week, start_time, end_time,
                    consultation_type, is_active, created_by, updated_by
                ) VALUES (
                    gen_random_uuid(), rec.tenant_id, sched_id, dow,
                    TIME '09:00', TIME '12:00', 'IN_PERSON', TRUE,
                    rec.user_id, rec.user_id
                );
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM scheduling.schedule_blocks sb
                WHERE sb.schedule_id = sched_id
                  AND sb.day_of_week = dow
                  AND sb.start_time = TIME '14:00'
                  AND sb.deleted_at IS NULL
            ) THEN
                INSERT INTO scheduling.schedule_blocks (
                    id, tenant_id, schedule_id, day_of_week, start_time, end_time,
                    consultation_type, is_active, created_by, updated_by
                ) VALUES (
                    gen_random_uuid(), rec.tenant_id, sched_id, dow,
                    TIME '14:00', TIME '17:00', 'IN_PERSON', TRUE,
                    rec.user_id, rec.user_id
                );
            END IF;
        END LOOP;

        FOR block_rec IN
            SELECT sb.id AS block_id, sb.day_of_week, sb.start_time, sb.end_time
            FROM scheduling.schedule_blocks sb
            WHERE sb.schedule_id = sched_id
              AND sb.is_active = TRUE
              AND sb.deleted_at IS NULL
        LOOP
            FOR cur_slot_date IN
                SELECT generate_series(CURRENT_DATE, CURRENT_DATE + horizon, INTERVAL '1 day')::DATE
            LOOP
                dow := upper(trim(to_char(cur_slot_date, 'Day')));
                IF dow = 'SUNDAY' OR dow != block_rec.day_of_week THEN
                    CONTINUE;
                END IF;

                slot_start := block_rec.start_time;
                block_end := block_rec.end_time;

                WHILE slot_start + (slot_duration || ' minutes')::INTERVAL <= block_end LOOP
                    slot_end := slot_start + (slot_duration || ' minutes')::INTERVAL;

                    INSERT INTO scheduling.time_slots (
                        tenant_id, schedule_id, doctor_id, hospital_id, branch_id,
                        slot_date, start_time, end_time, consultation_type, status,
                        created_by, updated_by
                    )
                    SELECT
                        rec.tenant_id, sched_id, rec.doctor_id, rec.hospital_id, rec.branch_id,
                        cur_slot_date, slot_start, slot_end, 'IN_PERSON', 'AVAILABLE',
                        rec.user_id, rec.user_id
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM scheduling.time_slots ts
                        WHERE ts.doctor_id = rec.doctor_id
                          AND ts.hospital_id = rec.hospital_id
                          AND ts.branch_id = rec.branch_id
                          AND ts.slot_date = cur_slot_date
                          AND ts.start_time = slot_start
                          AND ts.consultation_type = 'IN_PERSON'
                          AND ts.deleted_at IS NULL
                    );

                    slot_start := slot_end + (slot_buffer || ' minutes')::INTERVAL;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
