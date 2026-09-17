-- V97: HMS-18 Facility ops (housekeeping, laundry, dietary, transport)

CREATE SCHEMA IF NOT EXISTS facility;

CREATE TABLE facility.work_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    work_number         VARCHAR(40) NOT NULL,
    work_type           VARCHAR(30) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    priority            VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    location_label      VARCHAR(200),
    bed_id              UUID,
    patient_id          UUID,
    encounter_id        UUID,
    admission_id        UUID,
    requested_for_at    TIMESTAMPTZ,
    opened_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    completed_by        UUID,
    resolution_notes    TEXT,
    source_event_type   VARCHAR(80),
    source_event_id     UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_facility_work_type CHECK (
        work_type IN ('HOUSEKEEPING', 'LAUNDRY', 'DIETARY', 'TRANSPORT')
    ),
    CONSTRAINT chk_facility_work_status CHECK (
        status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    ),
    CONSTRAINT chk_facility_work_priority CHECK (
        priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')
    )
);

CREATE UNIQUE INDEX uq_facility_work_number
    ON facility.work_orders (hospital_id, work_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_facility_work_hospital_status
    ON facility.work_orders (hospital_id, branch_id, status, opened_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_facility_work_type_status
    ON facility.work_orders (hospital_id, work_type, status)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_facility_work_bed
    ON facility.work_orders (bed_id)
    WHERE deleted_at IS NULL AND bed_id IS NOT NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('facility', 'read', 'facility:read', 'View facility work orders'),
    ('facility', 'write', 'facility:write', 'Create facility work orders'),
    ('facility', 'complete', 'facility:complete', 'Start and complete facility work orders')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'NURSE', 'RECEPTIONIST')
  AND p.code IN ('facility:read', 'facility:write', 'facility:complete')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_FACILITY_OPS', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_FACILITY_OPS'
        AND f.deleted_at IS NULL
  );
