-- V24: Dev seed — Shubham Kadam patient account + complete demo profile
-- Email: shubham@gmail.com
-- Password: Kadam@123  (BCrypt strength 12 — local dev only)
-- Also backfills any manually registered account matching this email or name.

-- Fixed IDs for deterministic local dev references
-- User:           00000000-0000-0000-0000-000000000054
-- Patient profile: 00000000-0000-0000-0000-000000000070

INSERT INTO iam.users (
    id, tenant_id, email, password_hash,
    first_name, last_name, phone,
    status, email_verified, email_verified_at
)
SELECT
    '00000000-0000-0000-0000-000000000054',
    '00000000-0000-0000-0000-000000000001',
    'shubham@gmail.com',
    '$2a$12$Ge4HLupGeYM0LMxjJsR7Rerh1fbbGvUF38cVkoY3IH4phGu20HgIm',
    'Shubham',
    'Kadam',
    '9876543210',
    'ACTIVE',
    TRUE,
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM iam.users u
    WHERE u.tenant_id = '00000000-0000-0000-0000-000000000001'
      AND lower(u.email) = 'shubham@gmail.com'
      AND u.deleted_at IS NULL
);

INSERT INTO iam.user_roles (id, tenant_id, user_id, role_id)
SELECT
    '00000000-0000-0000-0000-000000000054',
    '00000000-0000-0000-0000-000000000001',
    u.id,
    '00000000-0000-0000-0000-000000000010'
FROM iam.users u
WHERE u.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND lower(u.email) = 'shubham@gmail.com'
  AND u.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM iam.user_roles ur
      WHERE ur.user_id = u.id
        AND ur.role_id = '00000000-0000-0000-0000-000000000010'
  );

UPDATE iam.users
SET
    status = 'ACTIVE',
    email_verified = TRUE,
    email_verified_at = COALESCE(email_verified_at, NOW()),
    first_name = COALESCE(NULLIF(TRIM(first_name), ''), 'Shubham'),
    last_name = COALESCE(NULLIF(TRIM(last_name), ''), 'Kadam'),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND (
      lower(email) = 'shubham@gmail.com'
      OR (lower(first_name) LIKE '%shubham%' AND lower(last_name) LIKE '%kadam%')
  );

INSERT INTO patient.patient_profiles (
    id, tenant_id, user_id,
    consent_accepted, consent_accepted_at,
    created_by, updated_by
)
SELECT
    '00000000-0000-0000-0000-000000000070',
    '00000000-0000-0000-0000-000000000001',
    u.id,
    TRUE,
    NOW(),
    u.id,
    u.id
FROM iam.users u
WHERE u.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND lower(u.email) = 'shubham@gmail.com'
  AND u.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM patient.patient_profiles pp
      WHERE pp.user_id = u.id AND pp.deleted_at IS NULL
  );

UPDATE patient.patient_profiles pp
SET
    consent_accepted = TRUE,
    consent_accepted_at = COALESCE(pp.consent_accepted_at, NOW()),
    date_of_birth = COALESCE(pp.date_of_birth, DATE '1992-06-15'),
    gender = COALESCE(NULLIF(TRIM(pp.gender), ''), 'MALE'),
    blood_group = COALESCE(pp.blood_group, 'B_POSITIVE'),
    marital_status = COALESCE(pp.marital_status, 'SINGLE'),
    nationality = COALESCE(pp.nationality, 'IN'),
    primary_phone = COALESCE(NULLIF(TRIM(pp.primary_phone), ''), '9876543210'),
    secondary_phone = COALESCE(pp.secondary_phone, '9876543211'),
    permanent_address_line1 = COALESCE(pp.permanent_address_line1, '12 Health Street'),
    permanent_address_line2 = COALESCE(pp.permanent_address_line2, 'Andheri East'),
    permanent_city = COALESCE(pp.permanent_city, 'Mumbai'),
    permanent_state = COALESCE(pp.permanent_state, 'Maharashtra'),
    permanent_pincode = COALESCE(pp.permanent_pincode, '400069'),
    permanent_country = COALESCE(pp.permanent_country, 'IN'),
    current_address_line1 = COALESCE(pp.current_address_line1, pp.permanent_address_line1, '12 Health Street'),
    current_address_line2 = COALESCE(pp.current_address_line2, pp.permanent_address_line2, 'Andheri East'),
    current_city = COALESCE(pp.current_city, pp.permanent_city, 'Mumbai'),
    current_state = COALESCE(pp.current_state, pp.permanent_state, 'Maharashtra'),
    current_pincode = COALESCE(pp.current_pincode, pp.permanent_pincode, '400069'),
    current_country = COALESCE(pp.current_country, pp.permanent_country, 'IN'),
    height_cm = COALESCE(pp.height_cm, 170.0),
    weight_kg = COALESCE(pp.weight_kg, 72.0),
    waist_cm = COALESCE(pp.waist_cm, 82.0),
    hip_cm = COALESCE(pp.hip_cm, 98.0),
    neck_cm = COALESCE(pp.neck_cm, 38.0),
    body_fat_percent = COALESCE(pp.body_fat_percent, 22.5),
    measured_at = COALESCE(pp.measured_at, NOW()),
    smoking_status = COALESCE(pp.smoking_status, 'NEVER'),
    smoking_frequency = COALESCE(pp.smoking_frequency, 'NEVER'),
    alcohol_consumption = COALESCE(pp.alcohol_consumption, 'OCCASIONAL'),
    exercise_frequency = COALESCE(pp.exercise_frequency, 'WEEKLY'),
    exercise_type = COALESCE(pp.exercise_type, 'Walking, Yoga'),
    exercise_duration_minutes = COALESCE(pp.exercise_duration_minutes, 45),
    occupation_type = COALESCE(pp.occupation_type, 'SEDENTARY'),
    average_sleep_hours = COALESCE(pp.average_sleep_hours, 7.0),
    dietary_preference = COALESCE(pp.dietary_preference, 'VEGETARIAN'),
    stress_level = COALESCE(pp.stress_level, 2),
    target_weight_kg = COALESCE(pp.target_weight_kg, 70.0),
    daily_steps_goal = COALESCE(pp.daily_steps_goal, 8000),
    sleep_hours_goal = COALESCE(pp.sleep_hours_goal, 8.0),
    water_intake_ml_goal = COALESCE(pp.water_intake_ml_goal, 2500),
    weekly_exercise_minutes_goal = COALESCE(pp.weekly_exercise_minutes_goal, 150),
    completion_score = 100,
    updated_at = NOW()
FROM iam.users u
WHERE pp.user_id = u.id
  AND pp.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND (
      lower(u.email) = 'shubham@gmail.com'
      OR (lower(u.first_name) LIKE '%shubham%' AND lower(u.last_name) LIKE '%kadam%')
  );

INSERT INTO patient.allergies (tenant_id, patient_id, name, severity, reaction, diagnosed_date)
SELECT pp.tenant_id, pp.id, 'Penicillin', 'MODERATE', 'Skin rash and itching', DATE '2018-03-10'
FROM patient.patient_profiles pp
JOIN iam.users u ON u.id = pp.user_id
WHERE pp.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND (
      lower(u.email) = 'shubham@gmail.com'
      OR (lower(u.first_name) LIKE '%shubham%' AND lower(u.last_name) LIKE '%kadam%')
  )
  AND NOT EXISTS (
      SELECT 1 FROM patient.allergies a
      WHERE a.patient_id = pp.id AND a.deleted_at IS NULL
  );

INSERT INTO patient.medications (
    tenant_id, patient_id, name, dosage, frequency, route, start_date, prescribing_doctor
)
SELECT pp.tenant_id, pp.id, 'Metformin', '500 mg', 'Twice daily', 'Oral', DATE '2023-01-15', 'Dr. Sharma'
FROM patient.patient_profiles pp
JOIN iam.users u ON u.id = pp.user_id
WHERE pp.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND (
      lower(u.email) = 'shubham@gmail.com'
      OR (lower(u.first_name) LIKE '%shubham%' AND lower(u.last_name) LIKE '%kadam%')
  )
  AND NOT EXISTS (
      SELECT 1 FROM patient.medications m
      WHERE m.patient_id = pp.id AND m.deleted_at IS NULL
  );

INSERT INTO patient.chronic_conditions (
    tenant_id, patient_id, condition_name, diagnosed_date, status, notes
)
SELECT pp.tenant_id, pp.id, 'Type 2 Diabetes', DATE '2022-11-20', 'MANAGED', 'Controlled with diet and medication.'
FROM patient.patient_profiles pp
JOIN iam.users u ON u.id = pp.user_id
WHERE pp.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND (
      lower(u.email) = 'shubham@gmail.com'
      OR (lower(u.first_name) LIKE '%shubham%' AND lower(u.last_name) LIKE '%kadam%')
  )
  AND NOT EXISTS (
      SELECT 1 FROM patient.chronic_conditions c
      WHERE c.patient_id = pp.id AND c.deleted_at IS NULL
  );

INSERT INTO patient.emergency_contacts (
    tenant_id, patient_id, name, relationship, phone, email, is_primary
)
SELECT pp.tenant_id, pp.id, 'Priya Kadam', 'SPOUSE', '9876501234', 'priya.contact@example.com', TRUE
FROM patient.patient_profiles pp
JOIN iam.users u ON u.id = pp.user_id
WHERE pp.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND (
      lower(u.email) = 'shubham@gmail.com'
      OR (lower(u.first_name) LIKE '%shubham%' AND lower(u.last_name) LIKE '%kadam%')
  )
  AND NOT EXISTS (
      SELECT 1 FROM patient.emergency_contacts ec
      WHERE ec.patient_id = pp.id AND ec.deleted_at IS NULL
  );

INSERT INTO patient.vital_sign_records (
    tenant_id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature,
    respiratory_rate, spo2, blood_glucose, glucose_reading_type, recorded_at, created_by
)
SELECT
    pp.tenant_id,
    pp.id,
    118,
    76,
    72,
    36.6,
    16,
    98,
    105.0,
    'FASTING',
    NOW() - INTERVAL '2 days',
    pp.user_id
FROM patient.patient_profiles pp
JOIN iam.users u ON u.id = pp.user_id
WHERE pp.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND (
      lower(u.email) = 'shubham@gmail.com'
      OR (lower(u.first_name) LIKE '%shubham%' AND lower(u.last_name) LIKE '%kadam%')
  )
  AND NOT EXISTS (
      SELECT 1 FROM patient.vital_sign_records v
      WHERE v.patient_id = pp.id
  );

INSERT INTO patient.physical_measurement_history (
    tenant_id, patient_id, height_cm, weight_kg, waist_cm, hip_cm, neck_cm,
    body_fat_percent, measured_at, created_by
)
SELECT
    pp.tenant_id,
    pp.id,
    pp.height_cm,
    pp.weight_kg,
    pp.waist_cm,
    pp.hip_cm,
    pp.neck_cm,
    pp.body_fat_percent,
    COALESCE(pp.measured_at, NOW()),
    pp.user_id
FROM patient.patient_profiles pp
JOIN iam.users u ON u.id = pp.user_id
WHERE pp.deleted_at IS NULL
  AND u.deleted_at IS NULL
  AND (
      lower(u.email) = 'shubham@gmail.com'
      OR (lower(u.first_name) LIKE '%shubham%' AND lower(u.last_name) LIKE '%kadam%')
  )
  AND NOT EXISTS (
      SELECT 1 FROM patient.physical_measurement_history h
      WHERE h.patient_id = pp.id
  );
