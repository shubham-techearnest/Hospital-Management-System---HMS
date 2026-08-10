-- V28: Seed subscription plans, permissions, backfill hospital subscriptions

-- Fixed plan IDs for deterministic references
-- FREE (Solo): 00000000-0000-0000-0000-000000000080

INSERT INTO shared.subscription_plans (
    id, tenant_id, code, name, description, price, currency, billing_cycle, status
)
VALUES
    (
        '00000000-0000-0000-0000-000000000080',
        '00000000-0000-0000-0000-000000000001',
        'FREE',
        'Free (Solo)',
        'Single-doctor clinic / individual practice. No charge.',
        0, 'INR', 'NONE', 'ACTIVE'
    ),
    (
        '00000000-0000-0000-0000-000000000081',
        '00000000-0000-0000-0000-000000000001',
        'STARTER',
        'Starter',
        'Small clinics with a growing doctor team.',
        999, 'INR', 'MONTHLY', 'ACTIVE'
    ),
    (
        '00000000-0000-0000-0000-000000000082',
        '00000000-0000-0000-0000-000000000001',
        'PROFESSIONAL',
        'Professional',
        'Multi-department hospitals with analytics.',
        4999, 'INR', 'MONTHLY', 'ACTIVE'
    ),
    (
        '00000000-0000-0000-0000-000000000083',
        '00000000-0000-0000-0000-000000000001',
        'ENTERPRISE',
        'Enterprise',
        'Large hospital groups with advanced features.',
        0, 'INR', 'MONTHLY', 'ACTIVE'
    )
ON CONFLICT DO NOTHING;

-- Plan limits (MAX_STAFF omitted until staff module exists)
INSERT INTO shared.subscription_plan_limits (tenant_id, plan_id, limit_key, limit_value)
SELECT '00000000-0000-0000-0000-000000000001', p.id, l.limit_key, l.limit_value
FROM shared.subscription_plans p
JOIN (
    VALUES
        ('FREE', 'MAX_DOCTORS', 1),
        ('FREE', 'MAX_PATIENTS', 100),
        ('FREE', 'MAX_DEPARTMENTS', 1),
        ('FREE', 'MAX_BRANCHES', 1),
        ('FREE', 'MAX_APPOINTMENTS_PER_MONTH', 200),
        ('STARTER', 'MAX_DOCTORS', 5),
        ('STARTER', 'MAX_PATIENTS', 500),
        ('STARTER', 'MAX_DEPARTMENTS', 5),
        ('STARTER', 'MAX_BRANCHES', 2),
        ('STARTER', 'MAX_APPOINTMENTS_PER_MONTH', 1000),
        ('PROFESSIONAL', 'MAX_DOCTORS', 25),
        ('PROFESSIONAL', 'MAX_PATIENTS', 5000),
        ('PROFESSIONAL', 'MAX_DEPARTMENTS', 20),
        ('PROFESSIONAL', 'MAX_BRANCHES', 10),
        ('PROFESSIONAL', 'MAX_APPOINTMENTS_PER_MONTH', 10000),
        ('ENTERPRISE', 'MAX_DOCTORS', 999),
        ('ENTERPRISE', 'MAX_PATIENTS', 99999),
        ('ENTERPRISE', 'MAX_DEPARTMENTS', 99),
        ('ENTERPRISE', 'MAX_BRANCHES', 50),
        ('ENTERPRISE', 'MAX_APPOINTMENTS_PER_MONTH', 999999)
) AS l(plan_code, limit_key, limit_value) ON p.code = l.plan_code
WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND p.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Plan features
INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT '00000000-0000-0000-0000-000000000001', p.id, f.feature_key, f.enabled
FROM shared.subscription_plans p
JOIN (
    VALUES
        ('FREE', 'FEATURE_DOCTOR_MANAGEMENT', true),
        ('FREE', 'FEATURE_PATIENT_MANAGEMENT', true),
        ('FREE', 'FEATURE_APPOINTMENT_MANAGEMENT', true),
        ('FREE', 'FEATURE_ANALYTICS', false),
        ('FREE', 'FEATURE_TELEMEDICINE', false),
        ('FREE', 'FEATURE_BILLING', false),
        ('FREE', 'FEATURE_API_ACCESS', false),
        ('STARTER', 'FEATURE_DOCTOR_MANAGEMENT', true),
        ('STARTER', 'FEATURE_PATIENT_MANAGEMENT', true),
        ('STARTER', 'FEATURE_APPOINTMENT_MANAGEMENT', true),
        ('STARTER', 'FEATURE_ANALYTICS', false),
        ('STARTER', 'FEATURE_TELEMEDICINE', false),
        ('STARTER', 'FEATURE_BILLING', false),
        ('STARTER', 'FEATURE_API_ACCESS', false),
        ('PROFESSIONAL', 'FEATURE_DOCTOR_MANAGEMENT', true),
        ('PROFESSIONAL', 'FEATURE_PATIENT_MANAGEMENT', true),
        ('PROFESSIONAL', 'FEATURE_APPOINTMENT_MANAGEMENT', true),
        ('PROFESSIONAL', 'FEATURE_ANALYTICS', true),
        ('PROFESSIONAL', 'FEATURE_TELEMEDICINE', true),
        ('PROFESSIONAL', 'FEATURE_BILLING', false),
        ('PROFESSIONAL', 'FEATURE_API_ACCESS', false),
        ('ENTERPRISE', 'FEATURE_DOCTOR_MANAGEMENT', true),
        ('ENTERPRISE', 'FEATURE_PATIENT_MANAGEMENT', true),
        ('ENTERPRISE', 'FEATURE_APPOINTMENT_MANAGEMENT', true),
        ('ENTERPRISE', 'FEATURE_ANALYTICS', true),
        ('ENTERPRISE', 'FEATURE_TELEMEDICINE', true),
        ('ENTERPRISE', 'FEATURE_BILLING', true),
        ('ENTERPRISE', 'FEATURE_API_ACCESS', true)
) AS f(plan_code, feature_key, enabled) ON p.code = f.plan_code
WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND p.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Permissions
INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('admin:hospitals', 'read', 'admin:hospitals:read', 'Platform admin: list/view hospitals'),
    ('admin:hospitals', 'write', 'admin:hospitals:write', 'Platform admin: manage hospitals'),
    ('admin:plans', 'read', 'admin:plans:read', 'Platform admin: view subscription plans'),
    ('admin:plans', 'write', 'admin:plans:write', 'Platform admin: manage subscription plans'),
    ('admin:subscriptions', 'read', 'admin:subscriptions:read', 'Platform admin: view hospital subscriptions'),
    ('admin:subscriptions', 'write', 'admin:subscriptions:write', 'Platform admin: manage hospital subscriptions'),
    ('hospital:subscription', 'read', 'hospital:subscription:read', 'Hospital admin: view own subscription and usage'),
    ('audit', 'view', 'audit:view', 'Platform admin: view audit logs')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PLATFORM_ADMIN'
  AND p.code IN (
    'admin:hospitals:read', 'admin:hospitals:write',
    'admin:plans:read', 'admin:plans:write',
    'admin:subscriptions:read', 'admin:subscriptions:write',
    'audit:view'
  )
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'HOSPITAL_ADMIN'
  AND p.code = 'hospital:subscription:read'
ON CONFLICT DO NOTHING;

-- Backfill: assign FREE plan to every existing hospital without an active subscription
INSERT INTO hospital.hospital_subscriptions (
    tenant_id, hospital_id, plan_id, status, start_date, auto_renew,
    price_at_subscription, currency, created_by, updated_by
)
SELECT
    h.tenant_id,
    h.id,
    '00000000-0000-0000-0000-000000000080',
    'ACTIVE',
    CURRENT_DATE,
    true,
    0,
    'INR',
    h.admin_user_id,
    h.admin_user_id
FROM hospital.hospitals h
WHERE h.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM hospital.hospital_subscriptions hs
      WHERE hs.hospital_id = h.id
        AND hs.status IN ('ACTIVE', 'TRIAL')
  );

INSERT INTO hospital.hospital_subscription_history (
    tenant_id, hospital_id, subscription_id, plan_id, event_type, status, effective_at, notes, created_by
)
SELECT
    hs.tenant_id,
    hs.hospital_id,
    hs.id,
    hs.plan_id,
    'INITIAL',
    hs.status,
    hs.created_at,
    'Backfill: existing hospital assigned Free (Solo) plan',
    hs.created_by
FROM hospital.hospital_subscriptions hs
WHERE NOT EXISTS (
    SELECT 1 FROM hospital.hospital_subscription_history hsh
    WHERE hsh.subscription_id = hs.id AND hsh.event_type = 'INITIAL'
);
