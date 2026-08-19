-- V34: HMS-4 — ICU module (units, beds, stays, equipment, monitoring)

CREATE SCHEMA IF NOT EXISTS icu;

-- =============================================================================
-- icu.icu_units
-- =============================================================================

CREATE TABLE icu.icu_units (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
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

CREATE UNIQUE INDEX uq_icu_units_branch_code
    ON icu.icu_units (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_icu_units_hospital ON icu.icu_units (hospital_id, branch_id, active)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- icu.icu_beds
-- =============================================================================

CREATE TABLE icu.icu_beds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    unit_id         UUID NOT NULL REFERENCES icu.icu_units (id),
    bed_number      VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_icu_bed_status CHECK (
        status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED')
    )
);

CREATE UNIQUE INDEX uq_icu_beds_unit_number
    ON icu.icu_beds (unit_id, bed_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_icu_beds_status ON icu.icu_beds (unit_id, status)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- icu.icu_stays
-- =============================================================================

CREATE TABLE icu.icu_stays (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID NOT NULL REFERENCES hospital.branches (id),
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    primary_doctor_id   UUID REFERENCES doctor.doctor_profiles (id),
    ipd_admission_id    UUID REFERENCES ipd.admissions (id),
    stay_number         VARCHAR(50) NOT NULL,
    admission_reason    TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    admitted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharged_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_icu_stay_status CHECK (
        status IN ('ACTIVE', 'DISCHARGED', 'TRANSFERRED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_icu_stays_encounter
    ON icu.icu_stays (encounter_id)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_icu_stays_number
    ON icu.icu_stays (hospital_id, stay_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_icu_stays_hospital_status
    ON icu.icu_stays (hospital_id, branch_id, status, admitted_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- icu.icu_bed_assignments
-- =============================================================================

CREATE TABLE icu.icu_bed_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    stay_id         UUID NOT NULL REFERENCES icu.icu_stays (id),
    bed_id          UUID NOT NULL REFERENCES icu.icu_beds (id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at     TIMESTAMPTZ,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_icu_bed_assignments_active_bed
    ON icu.icu_bed_assignments (bed_id)
    WHERE deleted_at IS NULL AND active = TRUE;

CREATE INDEX idx_icu_bed_assignments_stay
    ON icu.icu_bed_assignments (stay_id, assigned_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- icu.equipment
-- =============================================================================

CREATE TABLE icu.equipment (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
    unit_id         UUID REFERENCES icu.icu_units (id),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(30) NOT NULL,
    equipment_type  VARCHAR(30) NOT NULL DEFAULT 'OTHER',
    status          VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_icu_equipment_type CHECK (
        equipment_type IN ('VENTILATOR', 'MONITOR', 'INFUSION_PUMP', 'DEFIBRILLATOR', 'OTHER')
    ),
    CONSTRAINT chk_icu_equipment_status CHECK (
        status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED')
    )
);

CREATE UNIQUE INDEX uq_icu_equipment_branch_code
    ON icu.equipment (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_icu_equipment_status
    ON icu.equipment (hospital_id, branch_id, status)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- icu.equipment_assignments
-- =============================================================================

CREATE TABLE icu.equipment_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    equipment_id    UUID NOT NULL REFERENCES icu.equipment (id),
    stay_id         UUID NOT NULL REFERENCES icu.icu_stays (id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at     TIMESTAMPTZ,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_icu_equipment_assignments_active_equipment
    ON icu.equipment_assignments (equipment_id)
    WHERE deleted_at IS NULL AND active = TRUE;

CREATE INDEX idx_icu_equipment_assignments_stay
    ON icu.equipment_assignments (stay_id, assigned_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- icu.monitoring_records (append-only)
-- =============================================================================

CREATE TABLE icu.monitoring_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    stay_id         UUID NOT NULL REFERENCES icu.icu_stays (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    record_type     VARCHAR(30) NOT NULL DEFAULT 'VITALS',
    payload         JSONB NOT NULL DEFAULT '{}',
    notes           TEXT,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_icu_monitoring_type CHECK (
        record_type IN ('VITALS', 'VENTILATOR', 'INFUSION', 'LAB', 'OTHER')
    )
);

CREATE INDEX idx_icu_monitoring_stay
    ON icu.monitoring_records (stay_id, recorded_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RBAC permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('icu:unit', 'read', 'icu:unit:read', 'View ICU units and beds'),
    ('icu:unit', 'write', 'icu:unit:write', 'Manage ICU units and beds'),
    ('icu:stay', 'read', 'icu:stay:read', 'View ICU stays'),
    ('icu:stay', 'write', 'icu:stay:write', 'Admit and manage ICU stays'),
    ('icu:equipment', 'read', 'icu:equipment:read', 'View ICU equipment'),
    ('icu:equipment', 'write', 'icu:equipment:write', 'Manage ICU equipment assignments'),
    ('icu:monitoring', 'read', 'icu:monitoring:read', 'View ICU monitoring records'),
    ('icu:monitoring', 'write', 'icu:monitoring:write', 'Record ICU monitoring data')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code LIKE 'icu:%'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN (
      'icu:unit:read',
      'icu:stay:read', 'icu:stay:write',
      'icu:equipment:read', 'icu:equipment:write',
      'icu:monitoring:read', 'icu:monitoring:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code LIKE 'icu:%'
ON CONFLICT DO NOTHING;
