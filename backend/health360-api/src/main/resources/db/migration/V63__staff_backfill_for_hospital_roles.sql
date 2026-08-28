-- V63: Backfill hospital.staff for IAM staff roles missing staff records (OPD desk / checkout access)

-- Reception works hospital-wide at a branch campus; avoid branch-scoped lockouts on checkout.
UPDATE hospital.staff s
SET branch_id = NULL,
    updated_at = NOW()
FROM hospital.staff_role_assignments sra
WHERE sra.staff_id = s.id
  AND sra.role_name = 'RECEPTIONIST'
  AND s.deleted_at IS NULL
  AND s.employment_status = 'ACTIVE';

-- Single-hospital tenants: create ACTIVE staff rows for users with hospital staff IAM roles.
INSERT INTO hospital.staff (
    id, tenant_id, user_id, hospital_id, branch_id,
    employment_status, hired_at, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    u.tenant_id,
    u.id,
    h.id,
    NULL,
    'ACTIVE',
    NOW(),
    NOW(),
    NOW()
FROM iam.users u
JOIN iam.user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
JOIN iam.roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
JOIN hospital.hospitals h ON h.tenant_id = u.tenant_id AND h.deleted_at IS NULL
WHERE u.deleted_at IS NULL
  AND r.name IN (
      'RECEPTIONIST', 'NURSE', 'ICU_NURSE', 'LAB_TECHNICIAN',
      'RADIOLOGY_TECHNICIAN', 'PHARMACIST', 'OT_COORDINATOR'
  )
  AND (
      SELECT COUNT(*) FROM hospital.hospitals hx
      WHERE hx.tenant_id = u.tenant_id AND hx.deleted_at IS NULL
  ) = 1
  AND NOT EXISTS (
      SELECT 1 FROM hospital.staff s
      WHERE s.user_id = u.id
        AND s.hospital_id = h.id
        AND s.deleted_at IS NULL
        AND s.employment_status = 'ACTIVE'
  );

-- Ensure staff_role_assignments exist for backfilled rows.
INSERT INTO hospital.staff_role_assignments (
    id, tenant_id, staff_id, role_name, assigned_at, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    s.tenant_id,
    s.id,
    r.name,
    NOW(),
    NOW(),
    NOW()
FROM hospital.staff s
JOIN iam.users u ON u.id = s.user_id AND u.deleted_at IS NULL
JOIN iam.user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
JOIN iam.roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
WHERE s.deleted_at IS NULL
  AND s.employment_status = 'ACTIVE'
  AND r.name IN (
      'RECEPTIONIST', 'NURSE', 'ICU_NURSE', 'LAB_TECHNICIAN',
      'RADIOLOGY_TECHNICIAN', 'PHARMACIST', 'OT_COORDINATOR'
  )
  AND NOT EXISTS (
      SELECT 1 FROM hospital.staff_role_assignments sra
      WHERE sra.staff_id = s.id AND sra.role_name = r.name
  );
