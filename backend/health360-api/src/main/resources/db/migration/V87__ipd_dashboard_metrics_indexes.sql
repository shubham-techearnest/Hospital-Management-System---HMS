-- V87: Phase I9 — IPD dashboard / metrics performance indexes

CREATE INDEX IF NOT EXISTS idx_ipd_admissions_branch_discharged
    ON ipd.admissions (tenant_id, hospital_id, branch_id, discharged_at DESC)
    WHERE deleted_at IS NULL AND discharged_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ipd_admissions_status_branch
    ON ipd.admissions (tenant_id, hospital_id, branch_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ipd_beds_cleaning_completed
    ON ipd.beds (tenant_id, cleaned_at DESC)
    WHERE deleted_at IS NULL AND cleaned_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ipd_discharge_orders_hospital_status
    ON ipd.discharge_orders (tenant_id, hospital_id, status)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ipd_payer_auth_decided
    ON ipd.payer_authorizations (tenant_id, hospital_id, decided_at DESC)
    WHERE deleted_at IS NULL AND decided_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ipd_admission_requests_open
    ON ipd.admission_requests (tenant_id, hospital_id, branch_id, status)
    WHERE deleted_at IS NULL;
