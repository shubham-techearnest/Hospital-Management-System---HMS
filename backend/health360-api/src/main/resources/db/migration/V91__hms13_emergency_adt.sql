-- V91: HMS-13 Emergency (ED) foundation + ADT API surface support
-- Beds remain in ipd.*; ADT stays a facade (no new bed tables).

CREATE SCHEMA IF NOT EXISTS emergency;

CREATE TABLE emergency.ed_visits (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID NOT NULL,
    patient_id          UUID NOT NULL,
    encounter_id        UUID,
    visit_number        VARCHAR(40) NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'ARRIVED',
    arrival_mode        VARCHAR(40) NOT NULL DEFAULT 'WALK_IN',
    chief_complaint     TEXT,
    triage_acuity       INTEGER,
    triage_notes        TEXT,
    triaged_at          TIMESTAMPTZ,
    triaged_by          UUID,
    disposition         VARCHAR(40),
    disposition_at      TIMESTAMPTZ,
    disposition_by      UUID,
    disposition_notes   TEXT,
    resulting_admission_id UUID,
    arrived_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ed_visit_status CHECK (
        status IN ('ARRIVED', 'TRIAGED', 'IN_TREATMENT', 'DISPOSITIONED', 'CANCELLED')
    ),
    CONSTRAINT chk_ed_arrival_mode CHECK (
        arrival_mode IN ('WALK_IN', 'AMBULANCE', 'POLICE', 'TRANSFER_IN', 'OTHER')
    ),
    CONSTRAINT chk_ed_triage_acuity CHECK (
        triage_acuity IS NULL OR (triage_acuity BETWEEN 1 AND 5)
    ),
    CONSTRAINT chk_ed_disposition CHECK (
        disposition IS NULL OR disposition IN (
            'DISCHARGE_HOME', 'ADMIT_IPD', 'ADMIT_ICU', 'TRANSFER_OUT',
            'LEFT_WITHOUT_BEING_SEEN', 'REFER', 'DEATH'
        )
    )
);

CREATE UNIQUE INDEX uq_ed_visits_hospital_number
    ON emergency.ed_visits (hospital_id, visit_number)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_ed_visits_active
    ON emergency.ed_visits (hospital_id, branch_id, status, arrived_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_ed_visits_patient
    ON emergency.ed_visits (patient_id, arrived_at DESC)
    WHERE deleted_at IS NULL;

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('emergency', 'read', 'emergency:read', 'View ED board and visits'),
    ('emergency', 'write', 'emergency:write', 'Register ED arrivals and triage'),
    ('emergency', 'disposition', 'emergency:disposition', 'Set ED disposition'),
    ('adt', 'read', 'adt:read', 'View ADT facade operations'),
    ('adt', 'write', 'adt:write', 'Perform ADT admit/transfer/discharge via facade')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'RECEPTIONIST', 'NURSE', 'ICU_NURSE', 'DOCTOR')
  AND p.code IN ('emergency:read', 'emergency:write')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'DOCTOR', 'NURSE', 'ICU_NURSE')
  AND p.code IN ('emergency:disposition')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'RECEPTIONIST', 'NURSE')
  AND p.code IN ('adt:read', 'adt:write')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_EMERGENCY', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_EMERGENCY'
        AND f.deleted_at IS NULL
  );
