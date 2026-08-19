-- V35: HMS-5 — Laboratory module (catalog, fulfillment, results, reports)

CREATE SCHEMA IF NOT EXISTS laboratory;

-- =============================================================================
-- laboratory.laboratories
-- =============================================================================

CREATE TABLE laboratory.laboratories (
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

CREATE UNIQUE INDEX uq_lab_laboratories_branch_code
    ON laboratory.laboratories (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- laboratory.lab_tests
-- =============================================================================

CREATE TABLE laboratory.lab_tests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    laboratory_id   UUID NOT NULL REFERENCES laboratory.laboratories (id),
    code            VARCHAR(30) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    specimen_type   VARCHAR(30) NOT NULL DEFAULT 'BLOOD',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_lab_specimen_type CHECK (
        specimen_type IN ('BLOOD', 'URINE', 'STOOL', 'SWAB', 'OTHER')
    )
);

CREATE UNIQUE INDEX uq_lab_tests_laboratory_code
    ON laboratory.lab_tests (laboratory_id, code)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- laboratory.lab_test_parameters
-- =============================================================================

CREATE TABLE laboratory.lab_test_parameters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    lab_test_id     UUID NOT NULL REFERENCES laboratory.lab_tests (id),
    code            VARCHAR(30) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    unit            VARCHAR(30),
    reference_range VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_lab_parameters_test_code
    ON laboratory.lab_test_parameters (lab_test_id, code)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- laboratory.lab_orders
-- =============================================================================

CREATE TABLE laboratory.lab_orders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    clinical_order_item_id  UUID NOT NULL REFERENCES clinical.order_items (id),
    clinical_order_id       UUID NOT NULL REFERENCES clinical.orders (id),
    encounter_id            UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id              UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id               UUID NOT NULL REFERENCES hospital.branches (id),
    lab_test_id             UUID NOT NULL REFERENCES laboratory.lab_tests (id),
    status                  VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    received_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_lab_order_status CHECK (
        status IN ('RECEIVED', 'SAMPLE_COLLECTED', 'RESULTS_DRAFT', 'VERIFIED', 'RELEASED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_lab_orders_clinical_item
    ON laboratory.lab_orders (clinical_order_item_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_lab_orders_hospital_status
    ON laboratory.lab_orders (hospital_id, branch_id, status, received_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- laboratory.lab_samples
-- =============================================================================

CREATE TABLE laboratory.lab_samples (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    lab_order_id    UUID NOT NULL REFERENCES laboratory.lab_orders (id),
    specimen_id     VARCHAR(50),
    collected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    collected_by    UUID,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_lab_samples_order
    ON laboratory.lab_samples (lab_order_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- laboratory.lab_results
-- =============================================================================

CREATE TABLE laboratory.lab_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    lab_order_id    UUID NOT NULL REFERENCES laboratory.lab_orders (id),
    parameter_id    UUID NOT NULL REFERENCES laboratory.lab_test_parameters (id),
    value_text      VARCHAR(200) NOT NULL,
    value_numeric   NUMERIC(12, 4),
    unit            VARCHAR(30),
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by     UUID,
    verified_at     TIMESTAMPTZ,
    verified_by     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_lab_result_status CHECK (status IN ('DRAFT', 'VERIFIED'))
);

CREATE UNIQUE INDEX uq_lab_results_order_parameter
    ON laboratory.lab_results (lab_order_id, parameter_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- laboratory.lab_reports
-- =============================================================================

CREATE TABLE laboratory.lab_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    lab_order_id    UUID NOT NULL REFERENCES laboratory.lab_orders (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    summary_text    TEXT,
    released_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_by     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_lab_reports_order
    ON laboratory.lab_reports (lab_order_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_lab_reports_encounter
    ON laboratory.lab_reports (encounter_id, released_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RBAC permissions
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('lab:catalog', 'read', 'lab:catalog:read', 'View lab catalog'),
    ('lab:catalog', 'write', 'lab:catalog:write', 'Manage lab catalog'),
    ('lab:order', 'read', 'lab:order:read', 'View lab orders and worklist'),
    ('lab:order', 'write', 'lab:order:write', 'Process lab orders'),
    ('lab:result', 'write', 'lab:result:write', 'Enter lab results'),
    ('lab:result', 'verify', 'lab:result:verify', 'Verify lab results'),
    ('lab:report', 'release', 'lab:report:release', 'Release lab reports to patient record')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code LIKE 'lab:%'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'LAB_TECHNICIAN'
  AND p.code IN (
      'lab:catalog:read',
      'lab:order:read', 'lab:order:write',
      'lab:result:write', 'lab:result:verify',
      'lab:report:release'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN ('lab:catalog:read', 'lab:order:read')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code LIKE 'lab:%'
ON CONFLICT DO NOTHING;
