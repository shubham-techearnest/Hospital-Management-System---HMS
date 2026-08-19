-- V38: HMS-8 — Clinical pharmacy (medicines catalog, medication orders, MAR)

CREATE SCHEMA IF NOT EXISTS pharmacy;

-- =============================================================================
-- pharmacy.medicines
-- =============================================================================

CREATE TABLE pharmacy.medicines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
    code            VARCHAR(30) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    form            VARCHAR(30) NOT NULL DEFAULT 'TABLET',
    strength        VARCHAR(50),
    default_route   VARCHAR(30) NOT NULL DEFAULT 'ORAL',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_pharmacy_medicine_form CHECK (
        form IN ('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS', 'INHALER', 'OTHER')
    ),
    CONSTRAINT chk_pharmacy_medicine_route CHECK (
        default_route IN ('ORAL', 'IV', 'IM', 'SC', 'TOPICAL', 'INHALATION', 'OTHER')
    )
);

CREATE UNIQUE INDEX uq_pharmacy_medicines_branch_code
    ON pharmacy.medicines (hospital_id, branch_id, code)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- pharmacy.medication_orders
-- =============================================================================

CREATE TABLE pharmacy.medication_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    clinical_order_id   UUID NOT NULL REFERENCES clinical.orders (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID NOT NULL REFERENCES hospital.branches (id),
    status              VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at         TIMESTAMPTZ,
    verified_by           UUID,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_medication_order_status CHECK (
        status IN ('RECEIVED', 'VERIFIED', 'ACTIVE', 'COMPLETED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_medication_orders_clinical_order
    ON pharmacy.medication_orders (clinical_order_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_medication_orders_hospital_status
    ON pharmacy.medication_orders (hospital_id, branch_id, status, received_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- pharmacy.medication_order_items
-- =============================================================================

CREATE TABLE pharmacy.medication_order_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    medication_order_id     UUID NOT NULL REFERENCES pharmacy.medication_orders (id),
    clinical_order_item_id  UUID NOT NULL REFERENCES clinical.order_items (id),
    medicine_id             UUID REFERENCES pharmacy.medicines (id),
    medicine_name           VARCHAR(300) NOT NULL,
    status                  VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    dose_text               VARCHAR(100),
    route                   VARCHAR(30),
    frequency               VARCHAR(100),
    duration_days           INTEGER,
    instructions            TEXT,
    planned_at              TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_medication_item_status CHECK (
        status IN ('RECEIVED', 'VERIFIED', 'READY', 'COMPLETED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX uq_medication_items_clinical_item
    ON pharmacy.medication_order_items (clinical_order_item_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_medication_items_order
    ON pharmacy.medication_order_items (medication_order_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- pharmacy.medication_administrations (MAR)
-- =============================================================================

CREATE TABLE pharmacy.medication_administrations (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL REFERENCES shared.tenants (id),
    medication_order_item_id    UUID NOT NULL REFERENCES pharmacy.medication_order_items (id),
    medication_order_id         UUID NOT NULL REFERENCES pharmacy.medication_orders (id),
    encounter_id                UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id                  UUID NOT NULL REFERENCES patient.patient_profiles (id),
    dose_given                  VARCHAR(100) NOT NULL,
    route                       VARCHAR(30),
    administered_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    administered_by             UUID NOT NULL REFERENCES iam.users (id),
    notes                       TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                  UUID,
    updated_by                  UUID,
    deleted_at                  TIMESTAMPTZ,
    version                     BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_medication_admin_encounter
    ON pharmacy.medication_administrations (encounter_id, administered_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_medication_admin_item
    ON pharmacy.medication_administrations (medication_order_item_id, administered_at DESC)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- RBAC: pharmacy permissions for PHARMACIST role
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('pharmacy:medicine', 'read', 'pharmacy:medicine:read', 'View medicine catalog'),
    ('pharmacy:medicine', 'write', 'pharmacy:medicine:write', 'Manage medicine catalog'),
    ('pharmacy:medication', 'read', 'pharmacy:medication:read', 'View medication orders'),
    ('pharmacy:medication', 'write', 'pharmacy:medication:write', 'Manage medication orders'),
    ('pharmacy:medication', 'administer', 'pharmacy:medication:administer', 'Record medication administration (MAR)')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code LIKE 'pharmacy:%'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PHARMACIST'
  AND p.code IN (
      'pharmacy:medicine:read', 'pharmacy:medicine:write',
      'pharmacy:medication:read', 'pharmacy:medication:write',
      'pharmacy:medication:administer'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code IN ('pharmacy:medicine:read', 'pharmacy:medication:read')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code LIKE 'pharmacy:%'
ON CONFLICT DO NOTHING;
