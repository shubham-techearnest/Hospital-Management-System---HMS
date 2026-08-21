# P1-F2-07 — Database Design (V43)

| Feature | P1-F2 |
| Migration | **V43__clinical_vital_signs.sql** |
| Status | IMPLEMENTED |

---

## New `clinical.vital_signs`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID NOT NULL | FK shared.tenants |
| encounter_id | UUID NOT NULL | FK clinical.encounters |
| systolic_bp | INT | 40–300 |
| diastolic_bp | INT | 20–200 |
| heart_rate | INT | 20–300 |
| temperature | DECIMAL(4,1) | °C |
| respiratory_rate | INT | |
| spo2 | INT | 50–100 |
| blood_glucose | DECIMAL(5,1) | |
| glucose_reading_type | VARCHAR(20) | optional |
| notes | VARCHAR(500) | optional staff note |
| recorded_at | TIMESTAMPTZ NOT NULL | clinical time |
| created_at / updated_at | TIMESTAMPTZ | |
| created_by / updated_by | UUID | |
| deleted_at | TIMESTAMPTZ | soft delete reserved |
| version | BIGINT | optimistic lock |

Indexes:
- `(encounter_id, recorded_at DESC)` where deleted_at IS NULL
- `(tenant_id, recorded_at DESC)` where deleted_at IS NULL

---

## RBAC seed (same migration)

Permissions:
- `clinical:vitals:read`
- `clinical:vitals:write`

Grants:
- RECEPTIONIST: read
- NURSE, ICU_NURSE, DOCTOR, HOSPITAL_ADMIN, PLATFORM_ADMIN: read + write

---

## Rollback

Forward-fix only in production. Dev may drop table if empty.
