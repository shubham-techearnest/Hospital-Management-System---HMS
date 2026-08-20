# P1-F1-07 — Database Design (V42)

| Feature | P1-F1 |
| Migration | **V42__patient_registry_uhid.sql** (NOT APPLIED) |
| Status | DRAFT |

---

## Alter `patient.patient_profiles`

```sql
-- Conceptual — implement only after approval
ALTER TABLE patient.patient_profiles
  ADD COLUMN uhid VARCHAR(20),
  ADD COLUMN legal_first_name VARCHAR(100),
  ADD COLUMN legal_last_name VARCHAR(100),
  ADD COLUMN registration_source VARCHAR(30) NOT NULL DEFAULT 'APP';

CREATE UNIQUE INDEX uq_patient_profiles_tenant_uhid
  ON patient.patient_profiles (tenant_id, uhid)
  WHERE deleted_at IS NULL AND uhid IS NOT NULL;

CREATE INDEX idx_patient_profiles_primary_phone
  ON patient.patient_profiles (tenant_id, primary_phone)
  WHERE deleted_at IS NULL;
```

---

## New `patient.uhid_sequences`

| Column | Type |
|--------|------|
| tenant_id | UUID PK part |
| sequence_year | INT PK part |
| last_value | BIGINT NOT NULL |
| updated_at | TIMESTAMPTZ |

---

## New `patient.hospital_registrations`

| Column | Type |
|--------|------|
| id | UUID PK |
| patient_id | FK patient_profiles |
| tenant_id | UUID |
| hospital_id | FK |
| branch_id | FK nullable |
| registered_at | TIMESTAMPTZ |
| registered_by | UUID (staff user) |
| registration_number | VARCHAR optional |
| UNIQUE (patient_id, hospital_id, branch_id) where active |

---

## RBAC seed (same migration)

Insert permissions:
- `patient:registry:read`
- `patient:registry:write`
- `patient:registry:duplicate_override` (HOSPITAL_ADMIN)

Assign to RECEPTIONIST and HOSPITAL_ADMIN.

---

## DEC-004 impact

If **Option A** (stub user): no nullable user_id; create iam.users in same transaction.

If **Option B**: migration adds nullable user_id with CHECK constraint on registration_source.

---

## Rollback

Down migration drops new tables/columns only if no production data — prefer forward-fix in prod.

---

## Backfill

Optional script: assign UHID to existing profiles with NULL uhid using same sequence service (batch job, not in V42 if risky).
