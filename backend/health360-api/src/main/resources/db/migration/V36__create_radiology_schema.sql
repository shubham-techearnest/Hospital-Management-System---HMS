-- V36: HMS-6 — Radiology / imaging module (catalog, orders, studies, reports)

CREATE SCHEMA IF NOT EXISTS radiology;

-- =============================================================================
-- radiology.imaging_modalities
-- =============================================================================

CREATE TABLE radiology.imaging_modalities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
    code            VARCHAR(30) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    modality_type   VARCHAR(20) NOT NULL DEFAULT 'X_RAY',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_imaging_modality_type CHECK (
        modality_type IN ('X_RAY', 'USG', 'CT', 'MRI', 'EEG', 'OTHER')
    )
);

CREATE UNIQUE INDEX uq_imaging_modalities_branch_code
    ON radiology.imaging_modalities (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- radiology.imaging_orders
-- =============================================================================

CREATE TABLE radiology.imaging_orders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    clinical_order_item_id  UUID NOT NULL REFERENCES clinical.order_items (id),
    clinical_order_id       UUID NOT NULL REFERENCES clinical.orders (id),
    encounter_id            UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id              UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id               UUID NOT NULL REFERENCES hospital.branches (id),
    modality_id             UUID NOT NULL REFERENCES radiology.imaging_modalities (id),
    status                  VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    received_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_imaging_order_status CHECK (
        status IN ('RECEIVED', 'SCHEDULED', 'PERFORMED', 'REPORT_DRAFT', 'VERIFIED', 'RELEASED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_imaging_orders_clinical_item
    ON radiology.imaging_orders (clinical_order_item_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_imaging_orders_hospital_status
    ON radiology.imaging_orders (hospital_id, branch_id, status, received_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- radiology.imaging_studies
-- =============================================================================

CREATE TABLE radiology.imaging_studies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    imaging_order_id    UUID NOT NULL REFERENCES radiology.imaging_orders (id),
    scheduled_at        TIMESTAMPTZ,
    performed_at        TIMESTAMPTZ,
    performed_by        UUID,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_imaging_studies_order
    ON radiology.imaging_studies (imaging_order_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- radiology.imaging_reports
-- =============================================================================

CREATE TABLE radiology.imaging_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    imaging_order_id    UUID NOT NULL REFERENCES radiology.imaging_orders (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    findings_text       TEXT,
    impression_text     TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    verified_at         TIMESTAMPTZ,
    verified_by         UUID,
    released_at         TIMESTAMPTZ,
    released_by         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_imaging_report_status CHECK (status IN ('DRAFT', 'VERIFIED'))
);

CREATE UNIQUE INDEX uq_imaging_reports_order
    ON radiology.imaging_reports (imaging_order_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_imaging_reports_encounter
    ON radiology.imaging_reports (encounter_id, released_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RBAC: RADIOLOGY_TECHNICIAN role + permissions
-- =============================================================================

INSERT INTO iam.roles (id, tenant_id, name, description)
VALUES
    ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'RADIOLOGY_TECHNICIAN', 'Radiology / imaging technician')
ON CONFLICT DO NOTHING;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('radiology:modality', 'read', 'radiology:modality:read', 'View imaging modality catalog'),
    ('radiology:modality', 'write', 'radiology:modality:write', 'Manage imaging modality catalog'),
    ('radiology:order', 'read', 'radiology:order:read', 'View imaging orders and worklist'),
    ('radiology:order', 'write', 'radiology:order:write', 'Process imaging orders'),
    ('radiology:report', 'write', 'radiology:report:write', 'Enter imaging reports'),
    ('radiology:report', 'verify', 'radiology:report:verify', 'Verify imaging reports'),
    ('radiology:report', 'release', 'radiology:report:release', 'Release imaging reports to patient record')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code LIKE 'radiology:%'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'RADIOLOGY_TECHNICIAN'
  AND p.code IN (
      'radiology:modality:read',
      'radiology:order:read', 'radiology:order:write',
      'radiology:report:write', 'radiology:report:verify',
      'radiology:report:release'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN ('radiology:modality:read', 'radiology:order:read')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code LIKE 'radiology:%'
ON CONFLICT DO NOTHING;
