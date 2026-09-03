-- V69: Allow reviews against completed encounters (walk-in / OPD request) as well as appointments.

ALTER TABLE doctor.doctor_reviews
    ALTER COLUMN appointment_id DROP NOT NULL;

ALTER TABLE doctor.doctor_reviews
    ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES clinical.encounters (id);

ALTER TABLE doctor.doctor_reviews
    DROP CONSTRAINT IF EXISTS uq_doctor_review_appointment;

CREATE UNIQUE INDEX IF NOT EXISTS uq_doctor_review_appointment
    ON doctor.doctor_reviews (appointment_id)
    WHERE appointment_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_doctor_review_encounter
    ON doctor.doctor_reviews (encounter_id)
    WHERE encounter_id IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE doctor.doctor_reviews
    DROP CONSTRAINT IF EXISTS chk_doctor_review_visit;
ALTER TABLE doctor.doctor_reviews
    ADD CONSTRAINT chk_doctor_review_visit
        CHECK (appointment_id IS NOT NULL OR encounter_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_doctor_reviews_encounter
    ON doctor.doctor_reviews (encounter_id)
    WHERE encounter_id IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE hospital.hospital_reviews
    ALTER COLUMN appointment_id DROP NOT NULL;

ALTER TABLE hospital.hospital_reviews
    ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES clinical.encounters (id);

ALTER TABLE hospital.hospital_reviews
    DROP CONSTRAINT IF EXISTS uq_hospital_review_appointment;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hospital_review_appointment
    ON hospital.hospital_reviews (appointment_id)
    WHERE appointment_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_hospital_review_encounter
    ON hospital.hospital_reviews (encounter_id)
    WHERE encounter_id IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE hospital.hospital_reviews
    DROP CONSTRAINT IF EXISTS chk_hospital_review_visit;
ALTER TABLE hospital.hospital_reviews
    ADD CONSTRAINT chk_hospital_review_visit
        CHECK (appointment_id IS NOT NULL OR encounter_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_hospital_reviews_encounter
    ON hospital.hospital_reviews (encounter_id)
    WHERE encounter_id IS NOT NULL AND deleted_at IS NULL;

-- Backfill encounter_id when an appointment-linked encounter exists.
UPDATE doctor.doctor_reviews r
SET encounter_id = e.id
FROM clinical.encounters e
WHERE r.appointment_id IS NOT NULL
  AND r.encounter_id IS NULL
  AND e.appointment_id = r.appointment_id
  AND e.deleted_at IS NULL
  AND e.tenant_id = r.tenant_id;

UPDATE hospital.hospital_reviews r
SET encounter_id = e.id
FROM clinical.encounters e
WHERE r.appointment_id IS NOT NULL
  AND r.encounter_id IS NULL
  AND e.appointment_id = r.appointment_id
  AND e.deleted_at IS NULL
  AND e.tenant_id = r.tenant_id;
