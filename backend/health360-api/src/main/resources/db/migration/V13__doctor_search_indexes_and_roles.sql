-- V13: Doctor search indexes + additional roles [stabilization]

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verified_specialization
    ON doctor.doctor_profiles (tenant_id, verification_status, primary_specialization_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_gender_experience
    ON doctor.doctor_profiles (tenant_id, gender, total_years_experience)
    WHERE deleted_at IS NULL AND verification_status = 'VERIFIED';

CREATE INDEX IF NOT EXISTS idx_users_name_search
    ON iam.users (tenant_id, lower(first_name), lower(last_name))
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_branches_city
    ON hospital.branches (lower(city))
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hospitals_name_search
    ON hospital.hospitals (tenant_id, lower(name))
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_time_slots_available_today
    ON scheduling.time_slots (doctor_id, slot_date, status)
    WHERE deleted_at IS NULL AND status = 'AVAILABLE';

INSERT INTO iam.roles (id, tenant_id, name, description)
VALUES
    ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'LAB_TECHNICIAN', 'Laboratory technician'),
    ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'PHARMACIST', 'Pharmacy staff')
ON CONFLICT DO NOTHING;
