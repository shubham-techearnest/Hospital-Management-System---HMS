-- V40: HMS-11 — Search performance indexes (pg_trgm) + clinical/module composite indexes

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fuzzy name / city search (complements V13 btree indexes)
CREATE INDEX IF NOT EXISTS idx_users_full_name_trgm
    ON iam.users USING gin ((lower(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')))) gin_trgm_ops)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_hospitals_name_trgm
    ON hospital.hospitals USING gin (lower(name) gin_trgm_ops)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_branches_city_trgm
    ON hospital.branches USING gin (lower(city) gin_trgm_ops)
    WHERE deleted_at IS NULL;

-- Clinical list performance (tenant-scoped composites)
CREATE INDEX IF NOT EXISTS idx_encounters_tenant_patient_status
    ON clinical.encounters (tenant_id, patient_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_encounters_tenant_doctor_status
    ON clinical.encounters (tenant_id, primary_doctor_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_encounters_tenant_hospital_branch
    ON clinical.encounters (tenant_id, hospital_id, branch_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Module order/worklist composites
CREATE INDEX IF NOT EXISTS idx_lab_orders_scope_status
    ON laboratory.lab_orders (tenant_id, hospital_id, branch_id, status, received_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_imaging_orders_scope_status
    ON radiology.imaging_orders (tenant_id, hospital_id, branch_id, status, received_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_medication_orders_scope_status
    ON pharmacy.medication_orders (tenant_id, hospital_id, branch_id, status, received_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ot_procedures_scope_status
    ON ot.ot_procedures (tenant_id, hospital_id, branch_id, status, received_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ipd_admissions_scope_status
    ON ipd.admissions (tenant_id, hospital_id, branch_id, status, admitted_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_icu_stays_scope_status
    ON icu.icu_stays (tenant_id, hospital_id, branch_id, status, admitted_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_opd_queue_scope_date_status
    ON opd.queue_entries (tenant_id, hospital_id, branch_id, queue_date, status)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_staff_hospital_active
    ON hospital.staff (tenant_id, hospital_id, employment_status)
    WHERE deleted_at IS NULL;
