-- ECO-P4: hospital-first e-Rx pharmacy share (distinct from MAR medication_orders).

CREATE TABLE pharmacy.pharmacy_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    prescription_id     UUID NOT NULL REFERENCES clinical.prescriptions (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id          UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id           UUID NOT NULL REFERENCES hospital.branches (id),
    request_number      VARCHAR(50) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    requested_by        UUID NOT NULL REFERENCES iam.users (id),
    received_at         TIMESTAMPTZ,
    under_review_at     TIMESTAMPTZ,
    reviewed_by         UUID REFERENCES iam.users (id),
    ready_at            TIMESTAMPTZ,
    dispensed_at        TIMESTAMPTZ,
    dispensed_by        UUID REFERENCES iam.users (id),
    cancelled_at        TIMESTAMPTZ,
    cancel_reason       TEXT,
    pharmacist_notes    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_pharmacy_request_status CHECK (
        status IN (
            'REQUESTED', 'RECEIVED', 'UNDER_REVIEW',
            'PARTIALLY_AVAILABLE', 'AVAILABLE', 'READY',
            'DISPENSED', 'CANCELLED'
        )
    )
);

CREATE UNIQUE INDEX uq_pharmacy_requests_prescription_active
    ON pharmacy.pharmacy_requests (prescription_id)
    WHERE deleted_at IS NULL AND status <> 'CANCELLED';

CREATE UNIQUE INDEX uq_pharmacy_requests_number_tenant
    ON pharmacy.pharmacy_requests (tenant_id, request_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_pharmacy_requests_hospital_status
    ON pharmacy.pharmacy_requests (hospital_id, branch_id, status, requested_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_pharmacy_requests_patient
    ON pharmacy.pharmacy_requests (patient_id, requested_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE pharmacy.pharmacy_request_items (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    pharmacy_request_id     UUID NOT NULL REFERENCES pharmacy.pharmacy_requests (id),
    prescription_item_id    UUID NOT NULL REFERENCES clinical.prescription_items (id),
    medicine_id             UUID REFERENCES pharmacy.medicines (id),
    medicine_name           VARCHAR(300) NOT NULL,
    quantity_requested      INTEGER NOT NULL DEFAULT 1,
    quantity_dispensed      INTEGER NOT NULL DEFAULT 0,
    availability_status     VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_pharmacy_request_item_avail CHECK (
        availability_status IN ('PENDING', 'AVAILABLE', 'PARTIAL', 'UNAVAILABLE', 'DISPENSED')
    )
);

CREATE UNIQUE INDEX uq_pharmacy_request_items_rx_item
    ON pharmacy.pharmacy_request_items (pharmacy_request_id, prescription_item_id)
    WHERE deleted_at IS NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('pharmacy:request', 'read', 'pharmacy:request:read', 'View e-Rx pharmacy requests'),
    ('pharmacy:request', 'write', 'pharmacy:request:write', 'Send e-Rx to hospital pharmacy'),
    ('pharmacy:request', 'fulfill', 'pharmacy:request:fulfill', 'Receive/verify/dispense pharmacy requests')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'PHARMACIST')
  AND p.code IN ('pharmacy:request:read', 'pharmacy:request:fulfill')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code IN ('pharmacy:request:read', 'pharmacy:request:write')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'DOCTOR'
  AND p.code = 'pharmacy:request:read'
ON CONFLICT DO NOTHING;
