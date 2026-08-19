-- V37: HMS-7 — Operation Theatre module (theatres, schedules, procedures, team, notes)

CREATE SCHEMA IF NOT EXISTS ot;

-- =============================================================================
-- ot.operation_theatres
-- =============================================================================

CREATE TABLE ot.operation_theatres (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ot_theatre_status CHECK (
        status IN ('AVAILABLE', 'SCHEDULED', 'IN_USE', 'CLEANING', 'MAINTENANCE')
    )
);

CREATE UNIQUE INDEX uq_ot_theatres_branch_code
    ON ot.operation_theatres (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ot.ot_schedules
-- =============================================================================

CREATE TABLE ot.ot_schedules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    theatre_id          UUID NOT NULL REFERENCES ot.operation_theatres (id),
    scheduled_start     TIMESTAMPTZ NOT NULL,
    scheduled_end       TIMESTAMPTZ NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ot_schedule_status CHECK (
        status IN ('SCHEDULED', 'IN_USE', 'COMPLETED', 'CANCELLED')
    ),
    CONSTRAINT chk_ot_schedule_times CHECK (scheduled_end > scheduled_start)
);

CREATE INDEX idx_ot_schedules_theatre_time
    ON ot.ot_schedules (theatre_id, scheduled_start, scheduled_end)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ot.ot_procedures
-- =============================================================================

CREATE TABLE ot.ot_procedures (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    clinical_order_item_id  UUID NOT NULL REFERENCES clinical.order_items (id),
    clinical_order_id       UUID NOT NULL REFERENCES clinical.orders (id),
    encounter_id            UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id              UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id               UUID NOT NULL REFERENCES hospital.branches (id),
    theatre_id              UUID REFERENCES ot.operation_theatres (id),
    schedule_id             UUID REFERENCES ot.ot_schedules (id),
    procedure_name          VARCHAR(300) NOT NULL,
    status                  VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    received_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at              TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ot_procedure_status CHECK (
        status IN ('RECEIVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_ot_procedures_clinical_item
    ON ot.ot_procedures (clinical_order_item_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_ot_procedures_hospital_status
    ON ot.ot_procedures (hospital_id, branch_id, status, received_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ot.ot_team_members
-- =============================================================================

CREATE TABLE ot.ot_team_members (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    procedure_id        UUID NOT NULL REFERENCES ot.ot_procedures (id),
    member_role         VARCHAR(30) NOT NULL,
    user_id             UUID NOT NULL REFERENCES iam.users (id),
    member_name         VARCHAR(200),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ot_team_role CHECK (
        member_role IN ('SURGEON', 'ASSISTANT', 'ANAESTHETIST', 'SCRUB_NURSE', 'CIRCULATING_NURSE')
    )
);

CREATE INDEX idx_ot_team_procedure
    ON ot.ot_team_members (procedure_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- ot.ot_notes
-- =============================================================================

CREATE TABLE ot.ot_notes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    procedure_id        UUID NOT NULL REFERENCES ot.ot_procedures (id),
    note_type           VARCHAR(20) NOT NULL,
    content             TEXT NOT NULL,
    recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ot_note_type CHECK (
        note_type IN ('PRE_OP', 'INTRA_OP', 'POST_OP')
    )
);

CREATE INDEX idx_ot_notes_procedure
    ON ot.ot_notes (procedure_id, recorded_at ASC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RBAC: OT_COORDINATOR role + permissions
-- =============================================================================

INSERT INTO iam.roles (id, tenant_id, name, description)
VALUES
    ('00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'OT_COORDINATOR', 'Operation theatre coordinator')
ON CONFLICT DO NOTHING;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('ot:theatre', 'read', 'ot:theatre:read', 'View operation theatres'),
    ('ot:theatre', 'write', 'ot:theatre:write', 'Manage operation theatres'),
    ('ot:schedule', 'read', 'ot:schedule:read', 'View OT schedules'),
    ('ot:schedule', 'write', 'ot:schedule:write', 'Manage OT schedules'),
    ('ot:procedure', 'read', 'ot:procedure:read', 'View OT procedures'),
    ('ot:procedure', 'write', 'ot:procedure:write', 'Manage OT procedures')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code LIKE 'ot:%'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'OT_COORDINATOR'
  AND p.code IN (
      'ot:theatre:read',
      'ot:schedule:read', 'ot:schedule:write',
      'ot:procedure:read', 'ot:procedure:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN ('ot:procedure:read')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code LIKE 'ot:%'
ON CONFLICT DO NOTHING;
