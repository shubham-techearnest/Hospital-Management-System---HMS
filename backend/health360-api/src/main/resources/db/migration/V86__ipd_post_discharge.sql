-- V86: Phase I8 — post-discharge follow-up, episode close, readmission link

-- Expand admission status CHECK for I7 terminals + I8 FOLLOW_UP / CLOSED
ALTER TABLE ipd.admissions DROP CONSTRAINT IF EXISTS chk_ipd_admission_status;
ALTER TABLE ipd.admissions
    ADD CONSTRAINT chk_ipd_admission_status CHECK (
        status IN (
            'ADMITTED', 'DISCHARGED', 'TRANSFERRED', 'TRANSFERRED_OUT',
            'LAMA', 'DAMA', 'DECEASED', 'ABSCONDED', 'CANCELLED',
            'FOLLOW_UP', 'CLOSED'
        )
    );

ALTER TABLE ipd.admissions
    ADD COLUMN IF NOT EXISTS follow_up_appointment_id UUID,
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS closed_by UUID,
    ADD COLUMN IF NOT EXISTS readmitted_from_admission_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_ipd_admission_follow_up_appt'
    ) THEN
        ALTER TABLE ipd.admissions
            ADD CONSTRAINT fk_ipd_admission_follow_up_appt
            FOREIGN KEY (follow_up_appointment_id)
            REFERENCES scheduling.appointments (id);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_ipd_admission_readmitted_from'
    ) THEN
        ALTER TABLE ipd.admissions
            ADD CONSTRAINT fk_ipd_admission_readmitted_from
            FOREIGN KEY (readmitted_from_admission_id)
            REFERENCES ipd.admissions (id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ipd_admissions_patient_discharged
    ON ipd.admissions (tenant_id, patient_id, discharged_at DESC)
    WHERE deleted_at IS NULL AND discharged_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ipd_admissions_readmitted_from
    ON ipd.admissions (readmitted_from_admission_id)
    WHERE deleted_at IS NULL AND readmitted_from_admission_id IS NOT NULL;
