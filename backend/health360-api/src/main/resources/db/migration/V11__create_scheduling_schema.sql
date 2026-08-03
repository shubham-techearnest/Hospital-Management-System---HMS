-- V11: Scheduling schema [S8]

CREATE SCHEMA IF NOT EXISTS scheduling;

-- =============================================================================
-- scheduling.doctor_schedules
-- =============================================================================

CREATE TABLE scheduling.doctor_schedules (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    doctor_id               UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id               UUID NOT NULL REFERENCES hospital.branches (id),
    slot_duration_minutes   INTEGER NOT NULL DEFAULT 15,
    buffer_minutes          INTEGER NOT NULL DEFAULT 5,
    horizon_days            INTEGER NOT NULL DEFAULT 30,
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_schedule_slot_duration CHECK (slot_duration_minutes > 0),
    CONSTRAINT chk_schedule_buffer CHECK (buffer_minutes >= 0),
    CONSTRAINT chk_schedule_horizon CHECK (horizon_days > 0 AND horizon_days <= 90)
);

CREATE UNIQUE INDEX uq_schedule_doctor_hospital_branch
    ON scheduling.doctor_schedules (doctor_id, hospital_id, branch_id)
    WHERE deleted_at IS NULL AND is_active = true;

CREATE INDEX idx_schedules_doctor ON scheduling.doctor_schedules (doctor_id, is_active);

-- =============================================================================
-- scheduling.schedule_blocks
-- =============================================================================

CREATE TABLE scheduling.schedule_blocks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    schedule_id         UUID NOT NULL REFERENCES scheduling.doctor_schedules (id),
    day_of_week         VARCHAR(10) NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    consultation_type   VARCHAR(20) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_schedule_block_times CHECK (end_time > start_time),
    CONSTRAINT chk_schedule_block_day CHECK (
        day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')
    ),
    CONSTRAINT chk_schedule_block_consultation CHECK (
        consultation_type IN ('IN_PERSON', 'TELECONSULTATION', 'FOLLOW_UP')
    )
);

CREATE INDEX idx_schedule_blocks_schedule ON scheduling.schedule_blocks (schedule_id, day_of_week);

-- =============================================================================
-- scheduling.time_slots
-- =============================================================================

CREATE TABLE scheduling.time_slots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    schedule_id         UUID NOT NULL REFERENCES scheduling.doctor_schedules (id),
    doctor_id           UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID NOT NULL REFERENCES hospital.branches (id),
    slot_date           DATE NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    consultation_type   VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    appointment_id      UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_time_slot_status CHECK (status IN ('AVAILABLE', 'BOOKED', 'BLOCKED')),
    CONSTRAINT chk_time_slot_consultation CHECK (
        consultation_type IN ('IN_PERSON', 'TELECONSULTATION', 'FOLLOW_UP')
    ),
    CONSTRAINT uq_time_slot UNIQUE (doctor_id, hospital_id, branch_id, slot_date, start_time, consultation_type)
);

CREATE INDEX idx_time_slots_doctor_date ON scheduling.time_slots (doctor_id, slot_date, status);
CREATE INDEX idx_time_slots_hospital_date ON scheduling.time_slots (hospital_id, slot_date, status);
CREATE INDEX idx_time_slots_available ON scheduling.time_slots (doctor_id, slot_date)
    WHERE status = 'AVAILABLE';
CREATE INDEX idx_time_slots_appointment ON scheduling.time_slots (appointment_id)
    WHERE appointment_id IS NOT NULL;

-- =============================================================================
-- scheduling.appointments
-- =============================================================================

CREATE TABLE scheduling.appointments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    patient_id              UUID NOT NULL REFERENCES patient.patient_profiles (id),
    doctor_id               UUID NOT NULL REFERENCES doctor.doctor_profiles (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id               UUID NOT NULL REFERENCES hospital.branches (id),
    slot_id                 UUID NOT NULL REFERENCES scheduling.time_slots (id),
    consultation_type       VARCHAR(20) NOT NULL,
    consultation_fee        DECIMAL(10, 2) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'INR',
    status                  VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    reason_for_visit        VARCHAR(500),
    scheduled_at            TIMESTAMPTZ NOT NULL,
    cancelled_at            TIMESTAMPTZ,
    cancellation_reason     TEXT,
    completed_at            TIMESTAMPTZ,
    rescheduled_from_id     UUID REFERENCES scheduling.appointments (id),
    rescheduled_to_id       UUID REFERENCES scheduling.appointments (id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_appointment_status CHECK (
        status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED')
    ),
    CONSTRAINT chk_appointment_consultation CHECK (
        consultation_type IN ('IN_PERSON', 'TELECONSULTATION', 'FOLLOW_UP')
    )
);

ALTER TABLE scheduling.time_slots
    ADD CONSTRAINT fk_time_slots_appointment
        FOREIGN KEY (appointment_id) REFERENCES scheduling.appointments (id);

CREATE INDEX idx_appointments_patient ON scheduling.appointments (patient_id, scheduled_at DESC);
CREATE INDEX idx_appointments_doctor ON scheduling.appointments (doctor_id, scheduled_at DESC);
CREATE INDEX idx_appointments_hospital ON scheduling.appointments (hospital_id, scheduled_at DESC);
CREATE INDEX idx_appointments_status ON scheduling.appointments (tenant_id, status, scheduled_at);
CREATE INDEX idx_appointments_scheduled ON scheduling.appointments (scheduled_at)
    WHERE status = 'CONFIRMED';

-- =============================================================================
-- Scheduling permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('schedule', 'read', 'schedule:read', 'Read doctor schedules'),
    ('schedule', 'write', 'schedule:write', 'Manage doctor schedules'),
    ('appointment', 'book', 'appointment:book', 'Book appointments'),
    ('appointment', 'view:own', 'appointment:view:own', 'View own appointments')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN ('schedule:read', 'schedule:write', 'appointment:view:own')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code IN ('appointment:book', 'appointment:view:own')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code IN ('schedule:read', 'schedule:write', 'appointment:book', 'appointment:view:own')
ON CONFLICT (role_id, permission_id) DO NOTHING;
