-- V25: Align dev seed profile values with API/UI enums; fix time slot soft-delete uniqueness

ALTER TABLE patient.patient_profiles
    ALTER COLUMN blood_group TYPE VARCHAR(20);

UPDATE patient.patient_profiles
SET blood_group = CASE blood_group
    WHEN 'A+' THEN 'A_POSITIVE'
    WHEN 'A-' THEN 'A_NEGATIVE'
    WHEN 'B+' THEN 'B_POSITIVE'
    WHEN 'B-' THEN 'B_NEGATIVE'
    WHEN 'AB+' THEN 'AB_POSITIVE'
    WHEN 'AB-' THEN 'AB_NEGATIVE'
    WHEN 'O+' THEN 'O_POSITIVE'
    WHEN 'O-' THEN 'O_NEGATIVE'
    ELSE blood_group
END
WHERE blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

UPDATE patient.patient_profiles
SET smoking_frequency = 'NEVER'
WHERE smoking_frequency = 'NONE';

UPDATE patient.patient_profiles
SET alcohol_consumption = 'OCCASIONAL'
WHERE alcohol_consumption = 'OCCASIONALLY';

UPDATE patient.patient_profiles
SET occupation_type = 'SEDENTARY'
WHERE occupation_type = 'OFFICE';

ALTER TABLE scheduling.time_slots DROP CONSTRAINT IF EXISTS uq_time_slot;

CREATE UNIQUE INDEX IF NOT EXISTS uq_time_slot_active
    ON scheduling.time_slots (doctor_id, hospital_id, branch_id, slot_date, start_time, consultation_type)
    WHERE deleted_at IS NULL;
