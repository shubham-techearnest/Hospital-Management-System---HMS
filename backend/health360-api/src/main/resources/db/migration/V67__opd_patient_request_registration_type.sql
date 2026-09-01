-- Allow PATIENT_REQUEST registration type for patient self-service OPD requests

ALTER TABLE opd.queue_entries DROP CONSTRAINT IF EXISTS chk_opd_queue_registration_type;

ALTER TABLE opd.queue_entries ADD CONSTRAINT chk_opd_queue_registration_type CHECK (
    registration_type IN ('APPOINTMENT', 'WALK_IN', 'PATIENT_REQUEST')
);
