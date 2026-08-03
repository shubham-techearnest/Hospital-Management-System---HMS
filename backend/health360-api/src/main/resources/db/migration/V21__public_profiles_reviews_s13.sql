-- V21: Public profiles + reviews read model [S13]

-- =============================================================================
-- doctor.doctor_reviews
-- =============================================================================

CREATE TABLE doctor.doctor_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    doctor_id       UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    appointment_id  UUID NOT NULL REFERENCES scheduling.appointments (id),
    rating          INTEGER NOT NULL,
    comment         TEXT,
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
    moderated_by    UUID REFERENCES iam.users (id),
    moderated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_doctor_review_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT uq_doctor_review_appointment UNIQUE (appointment_id)
);

CREATE INDEX idx_doctor_reviews_doctor_created
    ON doctor.doctor_reviews (doctor_id, created_at DESC)
    WHERE deleted_at IS NULL AND is_visible = TRUE;

-- =============================================================================
-- hospital.hospital_reviews
-- =============================================================================

CREATE TABLE hospital.hospital_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    appointment_id  UUID NOT NULL REFERENCES scheduling.appointments (id),
    rating          INTEGER NOT NULL,
    comment         TEXT,
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
    moderated_by    UUID REFERENCES iam.users (id),
    moderated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_hospital_review_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT uq_hospital_review_appointment UNIQUE (appointment_id)
);

CREATE INDEX idx_hospital_reviews_hospital_created
    ON hospital.hospital_reviews (hospital_id, created_at DESC)
    WHERE deleted_at IS NULL AND is_visible = TRUE;

-- =============================================================================
-- Dev seed: completed appointments + sample reviews for verified doctors
-- =============================================================================

INSERT INTO scheduling.time_slots (
    id, tenant_id, schedule_id, doctor_id, hospital_id, branch_id,
    slot_date, start_time, end_time, consultation_type, status
)
SELECT
    slot_id,
    '00000000-0000-0000-0000-000000000001',
    ds.id,
    ds.doctor_id,
    ds.hospital_id,
    ds.branch_id,
    (CURRENT_DATE - INTERVAL '14 days')::DATE,
    '10:00'::TIME,
    '10:15'::TIME,
    'IN_PERSON',
    'BOOKED'
FROM (VALUES
    ('00000000-0000-0000-0000-000000000090'::UUID, '00000000-0000-0000-0000-000000000060'::UUID),
    ('00000000-0000-0000-0000-000000000091'::UUID, '00000000-0000-0000-0000-000000000061'::UUID),
    ('00000000-0000-0000-0000-000000000092'::UUID, '00000000-0000-0000-0000-000000000062'::UUID)
) AS seed(slot_id, doctor_profile_id)
JOIN scheduling.doctor_schedules ds
  ON ds.doctor_id = seed.doctor_profile_id
 AND ds.deleted_at IS NULL
 AND ds.is_active = TRUE
LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO scheduling.appointments (
    id, tenant_id, patient_id, doctor_id, hospital_id, branch_id, slot_id,
    consultation_type, consultation_fee, currency, status, reason_for_visit,
    scheduled_at, completed_at, created_by, updated_by
)
SELECT
    appt.id,
    '00000000-0000-0000-0000-000000000001',
    (SELECT pp.id FROM patient.patient_profiles pp WHERE pp.deleted_at IS NULL ORDER BY pp.created_at LIMIT 1),
    ts.doctor_id,
    ts.hospital_id,
    ts.branch_id,
    ts.id,
    ts.consultation_type,
    500.00,
    'INR',
    'COMPLETED',
    'Routine follow-up',
    (CURRENT_DATE - INTERVAL '14 days')::TIMESTAMPTZ + TIME '10:00',
    (CURRENT_DATE - INTERVAL '14 days')::TIMESTAMPTZ + TIME '10:30',
    ts.doctor_id,
    ts.doctor_id
FROM (VALUES
    ('00000000-0000-0000-0000-0000000000A0'::UUID, '00000000-0000-0000-0000-000000000090'::UUID),
    ('00000000-0000-0000-0000-0000000000A1'::UUID, '00000000-0000-0000-0000-000000000091'::UUID),
    ('00000000-0000-0000-0000-0000000000A2'::UUID, '00000000-0000-0000-0000-000000000092'::UUID)
) AS appt(id, slot_id)
JOIN scheduling.time_slots ts ON ts.id = appt.slot_id
WHERE EXISTS (SELECT 1 FROM patient.patient_profiles pp WHERE pp.deleted_at IS NULL)
ON CONFLICT DO NOTHING;

UPDATE scheduling.time_slots ts
SET appointment_id = appt.id,
    status = 'BOOKED',
    updated_at = NOW()
FROM scheduling.appointments appt
WHERE appt.slot_id = ts.id
  AND ts.id IN (
      '00000000-0000-0000-0000-000000000090',
      '00000000-0000-0000-0000-000000000091',
      '00000000-0000-0000-0000-000000000092'
  );

INSERT INTO doctor.doctor_reviews (
    id, tenant_id, doctor_id, patient_id, appointment_id, rating, comment, created_by, updated_by
)
SELECT
    rev.id,
    '00000000-0000-0000-0000-000000000001',
    a.doctor_id,
    a.patient_id,
    a.id,
    rev.rating,
    rev.comment,
    a.patient_id,
    a.patient_id
FROM (VALUES
    ('00000000-0000-0000-0000-0000000000B0'::UUID, '00000000-0000-0000-0000-0000000000A0'::UUID, 5, 'Excellent consultation, very thorough and patient.'),
    ('00000000-0000-0000-0000-0000000000B1'::UUID, '00000000-0000-0000-0000-0000000000A1'::UUID, 5, 'Clear explanation of treatment options. Highly recommended.'),
    ('00000000-0000-0000-0000-0000000000B2'::UUID, '00000000-0000-0000-0000-0000000000A2'::UUID, 4, 'Professional and knowledgeable. Wait time was reasonable.')
) AS rev(id, appointment_id, rating, comment)
JOIN scheduling.appointments a ON a.id = rev.appointment_id
ON CONFLICT DO NOTHING;

INSERT INTO hospital.hospital_reviews (
    id, tenant_id, hospital_id, patient_id, appointment_id, rating, comment, created_by, updated_by
)
SELECT
    rev.id,
    '00000000-0000-0000-0000-000000000001',
    a.hospital_id,
    a.patient_id,
    a.id,
    rev.rating,
    rev.comment,
    a.patient_id,
    a.patient_id
FROM (VALUES
    ('00000000-0000-0000-0000-0000000000C0'::UUID, '00000000-0000-0000-0000-0000000000A0'::UUID, 5, 'Clean facility with helpful staff.'),
    ('00000000-0000-0000-0000-0000000000C1'::UUID, '00000000-0000-0000-0000-0000000000A1'::UUID, 4, 'Well organized departments and good emergency response.')
) AS rev(id, appointment_id, rating, comment)
JOIN scheduling.appointments a ON a.id = rev.appointment_id
ON CONFLICT DO NOTHING;
