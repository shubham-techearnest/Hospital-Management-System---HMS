-- V65: Backfill patient profiles for self-registered PATIENT users missing a profile row

INSERT INTO patient.patient_profiles (
    id, tenant_id, user_id,
    legal_first_name, legal_last_name, primary_phone,
    registration_source, consent_accepted, consent_accepted_at,
    created_at, updated_at, version
)
SELECT
    gen_random_uuid(),
    u.tenant_id,
    u.id,
    trim(u.first_name),
    trim(u.last_name),
    CASE
        WHEN regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g') ~ '.{10}$'
            THEN '+91' || right(regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g'), 10)
        ELSE NULL
    END,
    'APP',
    TRUE,
    NOW(),
    NOW(),
    NOW(),
    0
FROM iam.users u
JOIN iam.user_roles ur ON ur.user_id = u.id
JOIN iam.roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
WHERE u.deleted_at IS NULL
  AND r.name = 'PATIENT'
  AND NOT EXISTS (
      SELECT 1 FROM patient.patient_profiles p
      WHERE p.user_id = u.id
        AND p.tenant_id = u.tenant_id
        AND p.deleted_at IS NULL
  );
