-- V30: HMS-1 — Clinical encounter foundation schema

CREATE SCHEMA IF NOT EXISTS clinical;

-- =============================================================================
-- clinical.encounters
-- =============================================================================

CREATE TABLE clinical.encounters (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_number    VARCHAR(50) NOT NULL,
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID NOT NULL REFERENCES hospital.branches (id),
    department_id       UUID REFERENCES hospital.departments (id),
    primary_doctor_id   UUID REFERENCES doctor.doctor_profiles (id),
    appointment_id      UUID REFERENCES scheduling.appointments (id),
    encounter_type      VARCHAR(30) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    visit_reason        TEXT,
    started_at          TIMESTAMPTZ,
    ended_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_encounters_type CHECK (
        encounter_type IN ('OPD', 'IPD', 'ICU', 'EMERGENCY', 'FOLLOW_UP', 'PROCEDURE', 'DIAGNOSTIC', 'POST_OPERATIVE')
    ),
    CONSTRAINT chk_encounters_status CHECK (
        status IN ('REGISTERED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_encounters_hospital_number
    ON clinical.encounters (hospital_id, encounter_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_encounters_patient ON clinical.encounters (patient_id, created_at DESC);
CREATE INDEX idx_encounters_hospital ON clinical.encounters (hospital_id, status, created_at DESC);
CREATE INDEX idx_encounters_doctor ON clinical.encounters (primary_doctor_id, status, created_at DESC);
CREATE INDEX idx_encounters_appointment ON clinical.encounters (appointment_id)
    WHERE appointment_id IS NOT NULL AND deleted_at IS NULL;

-- =============================================================================
-- clinical.diagnoses
-- =============================================================================

CREATE TABLE clinical.diagnoses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    diagnosis_code      VARCHAR(50),
    diagnosis_text      VARCHAR(500) NOT NULL,
    diagnosis_type      VARCHAR(20) NOT NULL DEFAULT 'PRIMARY',
    notes               TEXT,
    recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_diagnoses_type CHECK (diagnosis_type IN ('PRIMARY', 'SECONDARY', 'DIFFERENTIAL'))
);

CREATE INDEX idx_diagnoses_encounter ON clinical.diagnoses (encounter_id, recorded_at DESC);

-- =============================================================================
-- clinical.notes
-- =============================================================================

CREATE TABLE clinical.notes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    note_type           VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    content             TEXT NOT NULL,
    recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_notes_type CHECK (
        note_type IN ('GENERAL', 'CONSULTATION', 'PROGRESS', 'NURSING', 'DISCHARGE')
    )
);

CREATE INDEX idx_notes_encounter ON clinical.notes (encounter_id, recorded_at DESC);

-- =============================================================================
-- clinical.orders + order_items
-- =============================================================================

CREATE TABLE clinical.orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    order_number        VARCHAR(50) NOT NULL,
    order_type          VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ORDERED',
    instructions        TEXT,
    ordered_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_orders_type CHECK (
        order_type IN ('LAB', 'IMAGING', 'MEDICATION', 'PROCEDURE', 'OTHER')
    ),
    CONSTRAINT chk_orders_status CHECK (
        status IN ('DRAFT', 'ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_orders_encounter_number
    ON clinical.orders (encounter_id, order_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_orders_encounter ON clinical.orders (encounter_id, ordered_at DESC);

CREATE TABLE clinical.order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    order_id            UUID NOT NULL REFERENCES clinical.orders (id),
    item_code           VARCHAR(100),
    item_name           VARCHAR(300) NOT NULL,
    item_reference_id   UUID,
    quantity            INTEGER NOT NULL DEFAULT 1,
    instructions        TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'ORDERED',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_order_items_status CHECK (
        status IN ('DRAFT', 'ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    )
);

CREATE INDEX idx_order_items_order ON clinical.order_items (order_id);

-- =============================================================================
-- clinical.followups
-- =============================================================================

CREATE TABLE clinical.followups (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    doctor_id           UUID REFERENCES doctor.doctor_profiles (id),
    department_id       UUID REFERENCES hospital.departments (id),
    appointment_id      UUID REFERENCES scheduling.appointments (id),
    follow_up_date      DATE NOT NULL,
    reason              TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_followups_status CHECK (
        status IN ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED')
    )
);

CREATE INDEX idx_followups_encounter ON clinical.followups (encounter_id);
CREATE INDEX idx_followups_patient_date ON clinical.followups (patient_id, follow_up_date);

-- =============================================================================
-- clinical.reminders
-- =============================================================================

CREATE TABLE clinical.reminders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    subject_user_id     UUID NOT NULL REFERENCES iam.users (id),
    reminder_type       VARCHAR(30) NOT NULL,
    related_entity_type VARCHAR(50) NOT NULL,
    related_entity_id   UUID NOT NULL,
    title               VARCHAR(200) NOT NULL,
    message             TEXT,
    scheduled_at        TIMESTAMPTZ NOT NULL,
    channel             VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    sent_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_reminders_type CHECK (
        reminder_type IN (
            'APPOINTMENT', 'FOLLOW_UP', 'MEDICATION', 'LAB', 'IMAGING', 'ROUND', 'PROCEDURE'
        )
    ),
    CONSTRAINT chk_reminders_channel CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS')),
    CONSTRAINT chk_reminders_status CHECK (status IN ('PENDING', 'SENT', 'CANCELLED'))
);

CREATE INDEX idx_reminders_subject_scheduled
    ON clinical.reminders (subject_user_id, scheduled_at)
    WHERE deleted_at IS NULL AND status = 'PENDING';

-- =============================================================================
-- RBAC permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('clinical:encounter', 'read', 'clinical:encounter:read', 'View clinical encounters'),
    ('clinical:encounter', 'write', 'clinical:encounter:write', 'Create and update clinical encounters'),
    ('clinical:order', 'read', 'clinical:order:read', 'View clinical orders'),
    ('clinical:order', 'write', 'clinical:order:write', 'Create and update clinical orders')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN (
      'clinical:encounter:read', 'clinical:encounter:write',
      'clinical:order:read', 'clinical:order:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code IN (
      'clinical:encounter:read', 'clinical:encounter:write',
      'clinical:order:read', 'clinical:order:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code IN (
      'clinical:encounter:read', 'clinical:encounter:write',
      'clinical:order:read', 'clinical:order:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code = 'clinical:encounter:read'
ON CONFLICT DO NOTHING;
