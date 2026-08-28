-- ECO-P7 / ADR-016: independent Laboratory & Pharmacy partner organizations.

CREATE SCHEMA IF NOT EXISTS org;

CREATE TABLE org.partner_organizations (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL REFERENCES shared.tenants (id),
    org_type             VARCHAR(20) NOT NULL,
    name                 VARCHAR(200) NOT NULL,
    registration_number  VARCHAR(100),
    status               VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by           UUID,
    updated_by           UUID,
    deleted_at           TIMESTAMPTZ,
    version              BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_partner_org_type CHECK (org_type IN ('LABORATORY', 'PHARMACY')),
    CONSTRAINT chk_partner_org_status CHECK (status IN ('ACTIVE', 'SUSPENDED'))
);

CREATE INDEX idx_partner_orgs_tenant_type
    ON org.partner_organizations (tenant_id, org_type)
    WHERE deleted_at IS NULL;

CREATE TABLE org.partner_org_locations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    partner_org_id  UUID NOT NULL REFERENCES org.partner_organizations (id),
    name            VARCHAR(200) NOT NULL,
    address_line1   VARCHAR(255) NOT NULL,
    address_line2   VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    pincode         VARCHAR(20) NOT NULL,
    country         VARCHAR(100) NOT NULL DEFAULT 'India',
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    phone           VARCHAR(30),
    email           VARCHAR(255),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_partner_locations_org
    ON org.partner_org_locations (partner_org_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_partner_locations_geo
    ON org.partner_org_locations (latitude, longitude)
    WHERE deleted_at IS NULL;

CREATE TABLE org.partner_org_memberships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    partner_org_id      UUID NOT NULL REFERENCES org.partner_organizations (id),
    location_id         UUID REFERENCES org.partner_org_locations (id),
    user_id             UUID NOT NULL REFERENCES iam.users (id),
    job_title           VARCHAR(100),
    employment_status   VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    hired_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_partner_membership_status
        CHECK (employment_status IN ('ACTIVE', 'INACTIVE', 'TERMINATED'))
);

CREATE UNIQUE INDEX uq_partner_membership_user_org
    ON org.partner_org_memberships (partner_org_id, user_id)
    WHERE deleted_at IS NULL;

CREATE TABLE org.hospital_partner_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    partner_org_id  UUID NOT NULL REFERENCES org.partner_organizations (id),
    link_type       VARCHAR(30) NOT NULL DEFAULT 'IN_NETWORK',
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_hospital_partner_link_type
        CHECK (link_type IN ('IN_NETWORK', 'PREFERRED')),
    CONSTRAINT chk_hospital_partner_link_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE UNIQUE INDEX uq_hospital_partner_link
    ON org.hospital_partner_links (hospital_id, partner_org_id)
    WHERE deleted_at IS NULL;

ALTER TABLE laboratory.lab_orders
    ADD COLUMN IF NOT EXISTS fulfill_partner_org_id UUID REFERENCES org.partner_organizations (id),
    ADD COLUMN IF NOT EXISTS fulfill_location_id UUID REFERENCES org.partner_org_locations (id);

ALTER TABLE pharmacy.pharmacy_requests
    ADD COLUMN IF NOT EXISTS fulfill_partner_org_id UUID REFERENCES org.partner_organizations (id),
    ADD COLUMN IF NOT EXISTS fulfill_location_id UUID REFERENCES org.partner_org_locations (id);

CREATE INDEX IF NOT EXISTS idx_lab_orders_fulfill_partner
    ON laboratory.lab_orders (fulfill_partner_org_id)
    WHERE deleted_at IS NULL AND fulfill_partner_org_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pharmacy_requests_fulfill_partner
    ON pharmacy.pharmacy_requests (fulfill_partner_org_id)
    WHERE deleted_at IS NULL AND fulfill_partner_org_id IS NOT NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('partner:org', 'read', 'partner:org:read', 'View partner laboratory/pharmacy organizations'),
    ('partner:org', 'write', 'partner:org:write', 'Manage partner organizations and memberships'),
    ('partner:nearby', 'read', 'partner:nearby:read', 'Discover nearby partner labs/pharmacies')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('PLATFORM_ADMIN', 'HOSPITAL_ADMIN')
  AND p.code IN ('partner:org:read', 'partner:org:write', 'partner:nearby:read')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code = 'partner:nearby:read'
ON CONFLICT DO NOTHING;

-- Seed demo partner orgs for default tenant (idempotent by registration_number).
INSERT INTO org.partner_organizations (id, tenant_id, org_type, name, registration_number, status)
SELECT
    '00000000-0000-0000-0000-000000000410',
    '00000000-0000-0000-0000-000000000001',
    'LABORATORY',
    'PathCare Diagnostics (Partner)',
    'LAB-DEMO-001',
    'ACTIVE'
WHERE EXISTS (SELECT 1 FROM shared.tenants WHERE id = '00000000-0000-0000-0000-000000000001')
  AND NOT EXISTS (
      SELECT 1 FROM org.partner_organizations
      WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
        AND registration_number = 'LAB-DEMO-001'
        AND deleted_at IS NULL
  );

INSERT INTO org.partner_organizations (id, tenant_id, org_type, name, registration_number, status)
SELECT
    '00000000-0000-0000-0000-000000000411',
    '00000000-0000-0000-0000-000000000001',
    'PHARMACY',
    'MedPlus Retail Pharmacy (Partner)',
    'PHARM-DEMO-001',
    'ACTIVE'
WHERE EXISTS (SELECT 1 FROM shared.tenants WHERE id = '00000000-0000-0000-0000-000000000001')
  AND NOT EXISTS (
      SELECT 1 FROM org.partner_organizations
      WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
        AND registration_number = 'PHARM-DEMO-001'
        AND deleted_at IS NULL
  );

INSERT INTO org.partner_org_locations (
    id, tenant_id, partner_org_id, name, address_line1, city, state, pincode, country,
    latitude, longitude, phone, is_primary
)
SELECT
    '00000000-0000-0000-0000-000000000412',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000410',
    'PathCare Undri',
    'Near VTP Trade Park',
    'Pune',
    'Maharashtra',
    '411060',
    'India',
    18.4562,
    73.9095,
    '+91-20-67087147',
    TRUE
WHERE EXISTS (
    SELECT 1 FROM org.partner_organizations
    WHERE id = '00000000-0000-0000-0000-000000000410' AND deleted_at IS NULL
)
  AND NOT EXISTS (
      SELECT 1 FROM org.partner_org_locations
      WHERE id = '00000000-0000-0000-0000-000000000412'
  );

INSERT INTO org.partner_org_locations (
    id, tenant_id, partner_org_id, name, address_line1, city, state, pincode, country,
    latitude, longitude, phone, is_primary
)
SELECT
    '00000000-0000-0000-0000-000000000413',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000411',
    'MedPlus Undri',
    'Shop 12, Undri Road',
    'Pune',
    'Maharashtra',
    '411060',
    'India',
    18.4570,
    73.9088,
    '+91-20-67087147',
    TRUE
WHERE EXISTS (
    SELECT 1 FROM org.partner_organizations
    WHERE id = '00000000-0000-0000-0000-000000000411' AND deleted_at IS NULL
)
  AND NOT EXISTS (
      SELECT 1 FROM org.partner_org_locations
      WHERE id = '00000000-0000-0000-0000-000000000413'
  );

INSERT INTO org.hospital_partner_links (tenant_id, hospital_id, partner_org_id, link_type, status)
SELECT
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000030',
    o.id,
    'IN_NETWORK',
    'ACTIVE'
FROM org.partner_organizations o
WHERE o.id IN (
    '00000000-0000-0000-0000-000000000410',
    '00000000-0000-0000-0000-000000000411'
)
  AND EXISTS (
      SELECT 1 FROM hospital.hospitals
      WHERE id = '00000000-0000-0000-0000-000000000030' AND deleted_at IS NULL
  )
  AND NOT EXISTS (
      SELECT 1 FROM org.hospital_partner_links l
      WHERE l.hospital_id = '00000000-0000-0000-0000-000000000030'
        AND l.partner_org_id = o.id
        AND l.deleted_at IS NULL
  );
