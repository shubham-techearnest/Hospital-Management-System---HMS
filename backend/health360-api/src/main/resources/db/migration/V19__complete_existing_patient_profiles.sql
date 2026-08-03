-- V19: Backfill all existing patient profiles with complete demo data for dev/testing.

UPDATE patient.patient_profiles
SET
    consent_accepted = TRUE,
    consent_accepted_at = COALESCE(consent_accepted_at, NOW()),
    date_of_birth = COALESCE(date_of_birth, DATE '1992-06-15'),
    gender = COALESCE(NULLIF(TRIM(gender), ''), 'MALE'),
    blood_group = COALESCE(blood_group, 'B+'),
    marital_status = COALESCE(marital_status, 'SINGLE'),
    nationality = COALESCE(nationality, 'IN'),
    primary_phone = COALESCE(NULLIF(TRIM(primary_phone), ''), '9876543210'),
    secondary_phone = COALESCE(secondary_phone, '9876543211'),
    permanent_address_line1 = COALESCE(permanent_address_line1, '12 Health Street'),
    permanent_address_line2 = COALESCE(permanent_address_line2, 'Andheri East'),
    permanent_city = COALESCE(permanent_city, 'Mumbai'),
    permanent_state = COALESCE(permanent_state, 'Maharashtra'),
    permanent_pincode = COALESCE(permanent_pincode, '400069'),
    permanent_country = COALESCE(permanent_country, 'IN'),
    current_address_line1 = COALESCE(current_address_line1, permanent_address_line1, '12 Health Street'),
    current_address_line2 = COALESCE(current_address_line2, permanent_address_line2, 'Andheri East'),
    current_city = COALESCE(current_city, permanent_city, 'Mumbai'),
    current_state = COALESCE(current_state, permanent_state, 'Maharashtra'),
    current_pincode = COALESCE(current_pincode, permanent_pincode, '400069'),
    current_country = COALESCE(current_country, permanent_country, 'IN'),
    height_cm = COALESCE(height_cm, 170.0),
    weight_kg = COALESCE(weight_kg, 72.0),
    waist_cm = COALESCE(waist_cm, 82.0),
    hip_cm = COALESCE(hip_cm, 98.0),
    neck_cm = COALESCE(neck_cm, 38.0),
    body_fat_percent = COALESCE(body_fat_percent, 22.5),
    measured_at = COALESCE(measured_at, NOW()),
    smoking_status = COALESCE(smoking_status, 'NEVER'),
    smoking_frequency = COALESCE(smoking_frequency, 'NONE'),
    alcohol_consumption = COALESCE(alcohol_consumption, 'OCCASIONAL'),
    exercise_frequency = COALESCE(exercise_frequency, 'WEEKLY'),
    exercise_type = COALESCE(exercise_type, 'Walking, Yoga'),
    exercise_duration_minutes = COALESCE(exercise_duration_minutes, 45),
    occupation_type = COALESCE(occupation_type, 'OFFICE'),
    average_sleep_hours = COALESCE(average_sleep_hours, 7.0),
    dietary_preference = COALESCE(dietary_preference, 'VEGETARIAN'),
    stress_level = COALESCE(stress_level, 2),
    target_weight_kg = COALESCE(target_weight_kg, 70.0),
    daily_steps_goal = COALESCE(daily_steps_goal, 8000),
    sleep_hours_goal = COALESCE(sleep_hours_goal, 8.0),
    water_intake_ml_goal = COALESCE(water_intake_ml_goal, 2500),
    weekly_exercise_minutes_goal = COALESCE(weekly_exercise_minutes_goal, 150),
    completion_score = 100,
    updated_at = NOW()
WHERE deleted_at IS NULL;

INSERT INTO patient.allergies (tenant_id, patient_id, name, severity, reaction, diagnosed_date)
SELECT pp.tenant_id, pp.id, 'Penicillin', 'MODERATE', 'Skin rash and itching', DATE '2018-03-10'
FROM patient.patient_profiles pp
WHERE pp.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM patient.allergies a
      WHERE a.patient_id = pp.id AND a.deleted_at IS NULL
  );

INSERT INTO patient.medications (
    tenant_id, patient_id, name, dosage, frequency, route, start_date, prescribing_doctor
)
SELECT pp.tenant_id, pp.id, 'Metformin', '500 mg', 'Twice daily', 'Oral', DATE '2023-01-15', 'Dr. Sharma'
FROM patient.patient_profiles pp
WHERE pp.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM patient.medications m
      WHERE m.patient_id = pp.id AND m.deleted_at IS NULL
  );

INSERT INTO patient.chronic_conditions (
    tenant_id, patient_id, condition_name, diagnosed_date, status, notes
)
SELECT pp.tenant_id, pp.id, 'Type 2 Diabetes', DATE '2022-11-20', 'MANAGED', 'Controlled with diet and medication.'
FROM patient.patient_profiles pp
WHERE pp.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM patient.chronic_conditions c
      WHERE c.patient_id = pp.id AND c.deleted_at IS NULL
  );

INSERT INTO patient.emergency_contacts (
    tenant_id, patient_id, name, relationship, phone, email, is_primary
)
SELECT pp.tenant_id, pp.id, 'Priya Deshmukh', 'SPOUSE', '9876501234', 'priya.contact@example.com', TRUE
FROM patient.patient_profiles pp
WHERE pp.deleted_at IS NULL
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
WHERE pp.deleted_at IS NULL
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
WHERE pp.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM patient.physical_measurement_history h
      WHERE h.patient_id = pp.id
  );
