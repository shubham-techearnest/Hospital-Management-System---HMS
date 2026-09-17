-- V92: HMS-14 Revenue / Charge Engine (catalog + event posting + exception queue)
-- Existing billing.invoices / line_items stay; charges are staged before invoice attach.

CREATE TABLE billing.service_catalog_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    code                VARCHAR(60) NOT NULL,
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    category            VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
    trigger_event_type  VARCHAR(80),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_service_catalog_tenant_code
    ON billing.service_catalog_items (tenant_id, code)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_service_catalog_trigger
    ON billing.service_catalog_items (tenant_id, trigger_event_type)
    WHERE deleted_at IS NULL AND active = TRUE;

CREATE TABLE billing.price_list_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    catalog_item_id     UUID NOT NULL REFERENCES billing.service_catalog_items (id),
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    unit_price          NUMERIC(12, 2) NOT NULL,
    effective_from      DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to        DATE,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_price_list_lookup
    ON billing.price_list_items (hospital_id, catalog_item_id, effective_from DESC)
    WHERE deleted_at IS NULL AND active = TRUE;

CREATE TABLE billing.charge_postings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID,
    patient_id          UUID,
    encounter_id        UUID,
    catalog_item_id     UUID REFERENCES billing.service_catalog_items (id),
    catalog_code        VARCHAR(60) NOT NULL,
    description         VARCHAR(500) NOT NULL,
    quantity            NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    line_total          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    status              VARCHAR(30) NOT NULL DEFAULT 'DRY_RUN',
    source_event_id     UUID,
    source_event_type   VARCHAR(80) NOT NULL,
    source_entity_type  VARCHAR(80),
    source_entity_id    UUID,
    invoice_id          UUID,
    invoice_line_id     UUID,
    mode                VARCHAR(20) NOT NULL DEFAULT 'DRY_RUN',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_charge_posting_status CHECK (
        status IN ('DRY_RUN', 'POSTED', 'ATTACHED', 'SKIPPED', 'CANCELLED')
    ),
    CONSTRAINT chk_charge_posting_mode CHECK (mode IN ('DRY_RUN', 'POST'))
);

CREATE UNIQUE INDEX uq_charge_posting_event_code
    ON billing.charge_postings (source_event_id, catalog_code)
    WHERE deleted_at IS NULL AND source_event_id IS NOT NULL;
CREATE INDEX idx_charge_postings_hospital
    ON billing.charge_postings (hospital_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE billing.charge_exceptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID,
    patient_id          UUID,
    encounter_id        UUID,
    source_event_id     UUID,
    source_event_type   VARCHAR(80) NOT NULL,
    reason_code         VARCHAR(60) NOT NULL,
    message             VARCHAR(1000) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    resolved_at         TIMESTAMPTZ,
    resolved_by         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_charge_exception_status CHECK (
        status IN ('OPEN', 'RESOLVED', 'IGNORED')
    )
);

CREATE INDEX idx_charge_exceptions_open
    ON billing.charge_exceptions (hospital_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

-- Seed platform catalog templates (per tenant with active plans / any tenant row via distinct tenants from hospitals)
INSERT INTO billing.service_catalog_items (tenant_id, code, name, category, trigger_event_type, active)
SELECT DISTINCT h.tenant_id, v.code, v.name, v.category, v.trigger_event_type, TRUE
FROM hospital.hospitals h
CROSS JOIN (VALUES
    ('ADM_FEE', 'IPD admission fee', 'IPD', 'PATIENT_ADMITTED'),
    ('LAB_RELEASE', 'Lab result release fee', 'LAB', 'LAB_RESULT_RELEASED')
) AS v(code, name, category, trigger_event_type)
WHERE h.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM billing.service_catalog_items c
      WHERE c.tenant_id = h.tenant_id AND c.code = v.code AND c.deleted_at IS NULL
  );

-- Default prices for seeded hospitals (INR)
INSERT INTO billing.price_list_items (tenant_id, hospital_id, catalog_item_id, currency, unit_price, active)
SELECT c.tenant_id, h.id, c.id, 'INR',
       CASE c.code WHEN 'ADM_FEE' THEN 500.00 WHEN 'LAB_RELEASE' THEN 200.00 ELSE 0 END,
       TRUE
FROM hospital.hospitals h
JOIN billing.service_catalog_items c ON c.tenant_id = h.tenant_id AND c.deleted_at IS NULL
WHERE h.deleted_at IS NULL
  AND c.code IN ('ADM_FEE', 'LAB_RELEASE')
  AND NOT EXISTS (
      SELECT 1 FROM billing.price_list_items p
      WHERE p.hospital_id = h.id AND p.catalog_item_id = c.id AND p.deleted_at IS NULL
  );

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('billing', 'charge:read', 'billing:charge:read', 'View charge postings and catalog'),
    ('billing', 'charge:write', 'billing:charge:write', 'Manage charge catalog / prices'),
    ('billing', 'charge:exceptions', 'billing:charge:exceptions', 'View and resolve charge exceptions')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN ('billing:charge:read', 'billing:charge:write', 'billing:charge:exceptions')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('RECEPTIONIST')
  AND p.code IN ('billing:charge:read', 'billing:charge:exceptions')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_CHARGE_ENGINE', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_CHARGE_ENGINE'
        AND f.deleted_at IS NULL
  );
