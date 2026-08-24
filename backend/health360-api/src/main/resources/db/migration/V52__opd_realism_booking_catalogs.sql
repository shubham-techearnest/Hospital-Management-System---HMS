-- V52: OPD realism — staff booking/close RBAC, patient OPD status, hospital clinical catalogs

-- Permissions
INSERT INTO iam.permissions (id, resource, action, code, description)
VALUES
    ('00000000-0000-0000-0000-000000000520', 'appointment', 'book:staff', 'appointment:book:staff', 'Book appointments for patients at hospital desk'),
    ('00000000-0000-0000-0000-000000000521', 'appointment', 'close:hospital', 'appointment:close:hospital', 'Complete or mark no-show appointments for hospital'),
    ('00000000-0000-0000-0000-000000000522', 'appointment', 'view:hospital', 'appointment:view:hospital', 'List hospital appointments for desk'),
    ('00000000-0000-0000-0000-000000000523', 'hospital', 'catalog:read', 'hospital:catalog:read', 'Read hospital clinical catalogs'),
    ('00000000-0000-0000-0000-000000000524', 'hospital', 'catalog:write', 'hospital:catalog:write', 'Manage hospital clinical catalogs'),
    ('00000000-0000-0000-0000-000000000525', 'opd', 'status:own', 'opd:status:own', 'Patient view own live OPD status')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('RECEPTIONIST', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN (
      'appointment:book:staff',
      'appointment:close:hospital',
      'appointment:view:hospital',
      'hospital:catalog:read',
      'hospital:catalog:write'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('DOCTOR', 'NURSE', 'RECEPTIONIST', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code = 'hospital:catalog:read'
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('PATIENT', 'PLATFORM_ADMIN')
  AND p.code = 'opd:status:own'
ON CONFLICT DO NOTHING;

-- Hospital clinical catalogs (symptoms + dosage templates; meds/labs reuse existing modules)
CREATE TABLE IF NOT EXISTS hospital.symptom_catalog (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals(id),
    branch_id       UUID REFERENCES hospital.branches(id),
    code            VARCHAR(50),
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(100),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_symptom_catalog_hospital_code
    ON hospital.symptom_catalog (hospital_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'), lower(code))
    WHERE deleted_at IS NULL AND code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_symptom_catalog_hospital
    ON hospital.symptom_catalog (hospital_id, active)
    WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS hospital.dosage_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals(id),
    branch_id       UUID REFERENCES hospital.branches(id),
    label           VARCHAR(120) NOT NULL,
    dose_text       VARCHAR(120),
    route           VARCHAR(40),
    frequency       VARCHAR(120),
    duration_days   INT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dosage_templates_hospital
    ON hospital.dosage_templates (hospital_id, active)
    WHERE deleted_at IS NULL;

-- Seed common catalog for Health360 hospital (dev)
INSERT INTO hospital.symptom_catalog (id, tenant_id, hospital_id, code, name, category, created_by, updated_by)
VALUES
    ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'FEVER', 'Fever', 'General', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'COUGH', 'Cough', 'Respiratory', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'HEADACHE', 'Headache', 'Neurology', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'ABD_PAIN', 'Abdominal pain', 'GI', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000705', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'CHEST_PAIN', 'Chest pain', 'Cardiac', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000706', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'SOB', 'Shortness of breath', 'Respiratory', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000707', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'NAUSEA', 'Nausea / vomiting', 'GI', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000708', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'BACK_PAIN', 'Back pain', 'Musculoskeletal', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010')
ON CONFLICT DO NOTHING;

INSERT INTO hospital.dosage_templates (id, tenant_id, hospital_id, label, dose_text, route, frequency, duration_days, created_by, updated_by)
VALUES
    ('00000000-0000-0000-0000-000000000721', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', '1-0-1 x 5 days', '1 tablet', 'ORAL', 'Twice daily after food', 5, '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000722', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', '1-0-0 x 7 days', '1 tablet', 'ORAL', 'Once daily morning', 7, '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000723', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'SOS pain', '1 tablet', 'ORAL', 'As needed for pain', NULL, '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010'),
    ('00000000-0000-0000-0000-000000000724', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'Syrup TDS x 5d', '5 ml', 'ORAL', 'Three times daily', 5, '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010')
ON CONFLICT DO NOTHING;
