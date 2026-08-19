-- V39: HMS-9 — Hospital staff records, role assignments, expanded RBAC

-- =============================================================================
-- hospital.staff
-- =============================================================================

CREATE TABLE hospital.staff (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    user_id         UUID NOT NULL REFERENCES iam.users (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID REFERENCES hospital.branches (id),
    department_id   UUID REFERENCES hospital.departments (id),
    job_title       VARCHAR(100),
    employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    hired_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_staff_employment_status CHECK (
        employment_status IN ('ACTIVE', 'INACTIVE', 'TERMINATED')
    )
);

CREATE UNIQUE INDEX uq_staff_user_hospital
    ON hospital.staff (user_id, hospital_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_staff_hospital_status
    ON hospital.staff (hospital_id, employment_status)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- hospital.staff_role_assignments
-- =============================================================================

CREATE TABLE hospital.staff_role_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    staff_id        UUID NOT NULL REFERENCES hospital.staff (id),
    role_name       VARCHAR(50) NOT NULL,
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_staff_role_assignment
    ON hospital.staff_role_assignments (staff_id, role_name)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- New IAM roles
-- =============================================================================

INSERT INTO iam.roles (id, tenant_id, name, description)
VALUES
    ('00000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'RECEPTIONIST', 'OPD registration and queue'),
    ('00000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'NURSE', 'Nursing care, vitals, MAR'),
    ('00000000-0000-0000-0000-00000000001A', '00000000-0000-0000-0000-000000000001', 'ICU_NURSE', 'ICU monitoring and care')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Staff management permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('staff', 'read', 'staff:read', 'View hospital staff roster'),
    ('staff', 'write', 'staff:write', 'Manage hospital staff'),
    ('staff', 'invite', 'staff:invite', 'Invite hospital staff members')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code IN ('staff:read', 'staff:write', 'staff:invite')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code IN ('staff:read', 'staff:write', 'staff:invite')
ON CONFLICT DO NOTHING;

-- RECEPTIONIST — OPD operations without full admin rights
INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'RECEPTIONIST'
  AND p.code IN (
      'opd:desk:read',
      'opd:queue:read', 'opd:queue:write',
      'opd:registration:write',
      'clinical:encounter:read'
  )
ON CONFLICT DO NOTHING;

-- NURSE — MAR + clinical read + IPD rounds
INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'NURSE'
  AND p.code IN (
      'clinical:encounter:read',
      'pharmacy:medication:read', 'pharmacy:medication:administer',
      'ipd:admission:read', 'ipd:round:read', 'ipd:round:write',
      'icu:stay:read', 'icu:monitoring:read', 'icu:monitoring:write'
  )
ON CONFLICT DO NOTHING;

-- ICU_NURSE — ICU-focused permissions
INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'ICU_NURSE'
  AND p.code IN (
      'clinical:encounter:read',
      'icu:unit:read',
      'icu:stay:read', 'icu:stay:write',
      'icu:equipment:read', 'icu:equipment:write',
      'icu:monitoring:read', 'icu:monitoring:write',
      'pharmacy:medication:read', 'pharmacy:medication:administer'
  )
ON CONFLICT DO NOTHING;
