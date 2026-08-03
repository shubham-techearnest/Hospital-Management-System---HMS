-- V15: Backfill DRAFT doctor profiles for registered doctors missing a profile row

INSERT INTO doctor.doctor_profiles (
    tenant_id, user_id, title, verification_status, created_by, updated_by
)
SELECT
    u.tenant_id,
    u.id,
    'DR',
    'DRAFT',
    u.id,
    u.id
FROM iam.users u
INNER JOIN iam.user_roles ur ON ur.user_id = u.id
INNER JOIN iam.roles r ON r.id = ur.role_id AND r.name = 'DOCTOR'
WHERE u.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM doctor.doctor_profiles dp
      WHERE dp.user_id = u.id
        AND dp.deleted_at IS NULL
  );
