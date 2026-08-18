-- V31: HMS-2 — OPD module (desks, queue, registration)

CREATE SCHEMA IF NOT EXISTS opd;

-- =============================================================================
-- opd.desks
-- =============================================================================

CREATE TABLE opd.desks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
    department_id   UUID REFERENCES hospital.departments (id),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_opd_desks_branch_code
    ON opd.desks (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_opd_desks_hospital ON opd.desks (hospital_id, branch_id, active)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- opd.queue_entries
-- =============================================================================

CREATE TABLE opd.queue_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID NOT NULL REFERENCES hospital.branches (id),
    desk_id             UUID REFERENCES opd.desks (id),
    appointment_id      UUID REFERENCES scheduling.appointments (id),
    registration_type   VARCHAR(20) NOT NULL,
    token_number        INTEGER NOT NULL,
    token_display       VARCHAR(20) NOT NULL,
    queue_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    priority            INTEGER NOT NULL DEFAULT 0,
    checked_in_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    called_at           TIMESTAMPTZ,
    service_started_at  TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_opd_queue_registration_type CHECK (
        registration_type IN ('APPOINTMENT', 'WALK_IN')
    ),
    CONSTRAINT chk_opd_queue_status CHECK (
        status IN ('WAITING', 'CALLED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
    )
);

CREATE UNIQUE INDEX uq_opd_queue_encounter
    ON opd.queue_entries (encounter_id)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_opd_queue_daily_token
    ON opd.queue_entries (hospital_id, branch_id, queue_date, token_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_opd_queue_hospital_date
    ON opd.queue_entries (hospital_id, branch_id, queue_date, status, priority DESC, token_number ASC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_opd_queue_desk
    ON opd.queue_entries (desk_id, status)
    WHERE deleted_at IS NULL AND desk_id IS NOT NULL;

-- =============================================================================
-- RBAC permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('opd:desk', 'read', 'opd:desk:read', 'View OPD desks'),
    ('opd:desk', 'write', 'opd:desk:write', 'Manage OPD desks'),
    ('opd:queue', 'read', 'opd:queue:read', 'View OPD queue'),
    ('opd:queue', 'write', 'opd:queue:write', 'Manage OPD queue (call, start, complete)'),
    ('opd:registration', 'write', 'opd:registration:write', 'OPD check-in and walk-in registration')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN (
      'opd:desk:read', 'opd:desk:write',
      'opd:queue:read', 'opd:queue:write',
      'opd:registration:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code IN (
      'opd:desk:read', 'opd:desk:write',
      'opd:queue:read', 'opd:queue:write',
      'opd:registration:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code IN (
      'opd:desk:read', 'opd:desk:write',
      'opd:queue:read', 'opd:queue:write',
      'opd:registration:write'
  )
ON CONFLICT DO NOTHING;
