-- V100: HMS-21 Staff operations (roster / attendance / leave)

CREATE SCHEMA IF NOT EXISTS staffops;

CREATE TABLE staffops.shifts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    code                VARCHAR(40) NOT NULL,
    name                VARCHAR(120) NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_staffops_shift_code
    ON staffops.shifts (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

CREATE TABLE staffops.roster_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    staff_id            UUID NOT NULL,
    shift_id            UUID NOT NULL REFERENCES staffops.shifts (id),
    duty_date           DATE NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_staffops_roster_status CHECK (
        status IN ('PLANNED', 'CONFIRMED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_staffops_roster_slot
    ON staffops.roster_entries (hospital_id, staff_id, duty_date, shift_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_staffops_roster_date
    ON staffops.roster_entries (hospital_id, branch_id, duty_date)
    WHERE deleted_at IS NULL;

CREATE TABLE staffops.attendance (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    staff_id            UUID NOT NULL,
    roster_entry_id     UUID REFERENCES staffops.roster_entries (id),
    duty_date           DATE NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    clock_in            TIMESTAMPTZ,
    clock_out           TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_staffops_attendance_status CHECK (
        status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY')
    )
);

CREATE UNIQUE INDEX uq_staffops_attendance_day
    ON staffops.attendance (hospital_id, staff_id, duty_date)
    WHERE deleted_at IS NULL;

CREATE TABLE staffops.leave_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    staff_id            UUID NOT NULL,
    leave_type          VARCHAR(30) NOT NULL DEFAULT 'CASUAL',
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    reason              TEXT,
    decision_notes      TEXT,
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at          TIMESTAMPTZ,
    decided_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_staffops_leave_type CHECK (
        leave_type IN ('CASUAL', 'SICK', 'EARNED', 'UNPAID', 'OTHER')
    ),
    CONSTRAINT chk_staffops_leave_status CHECK (
        status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED')
    ),
    CONSTRAINT chk_staffops_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_staffops_leave_status
    ON staffops.leave_requests (hospital_id, branch_id, status, requested_at DESC)
    WHERE deleted_at IS NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('staffops', 'read', 'staffops:read', 'View staff shifts, roster, attendance, leave'),
    ('staffops', 'write', 'staffops:write', 'Manage shifts, roster, attendance, and leave requests'),
    ('staffops', 'approve', 'staffops:approve', 'Approve or reject leave requests')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN ('staffops:read', 'staffops:write', 'staffops:approve')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('NURSE', 'RECEPTIONIST', 'DOCTOR')
  AND p.code IN ('staffops:read', 'staffops:write')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_STAFF_OPS', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_STAFF_OPS'
        AND f.deleted_at IS NULL
  );
