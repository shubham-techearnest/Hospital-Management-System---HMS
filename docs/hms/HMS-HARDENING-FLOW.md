# HMS Performance & Security Hardening Flow

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-HARDENING-FLOW-001 |
| **Last Updated** | 2026-08-19 |
| **Sprint** | HMS-11 |

---

## Goal

Close the HMS phase with **search performance indexes**, **RBAC regression coverage**, and **golden-path integration tests** so clinical list APIs stay stable under load and role boundaries hold in CI.

---

## Database — V40 performance indexes

Migration: `V40__hms_performance_indexes.sql`

| Area | Index type | Purpose |
|------|------------|---------|
| `iam.users` | GIN trigram on full name | Fuzzy staff/patient name search |
| `hospital.hospitals` | GIN trigram on name | Hospital discovery |
| `hospital.branches` | GIN trigram on city | Branch/city search |
| `clinical.encounters` | Composite (tenant + patient/doctor/hospital) | Patient/doctor encounter lists |
| Module orders (lab, rad, pharm, OT) | Composite (tenant + hospital + branch + status) | Worklist pagination |
| IPD/ICU | Composite admission/stay indexes | Ward dashboards |
| OPD queue | Composite (tenant + hospital + branch + date) | Daily queue screens |
| Staff | Composite (tenant + hospital + status) | Staff directory |

Requires PostgreSQL `pg_trgm` extension (created idempotently in V40).

**Deploy note:** Restart the backend after Flyway applies V40 so connection pools pick up the new indexes.

---

## Security posture (audit summary)

| Control | Implementation |
|---------|----------------|
| Deny by default | All HMS controllers use `@PreAuthorize("hasAuthority('…')")` |
| Tenant isolation | Services resolve `tenantId` from JWT; queries scoped by tenant |
| Hospital scope | `HospitalScopeService` limits staff/reception/nurse to assigned hospital/branch |
| Patient data | Patients reach only `/encounters/me` and own clinical dashboard |
| Platform admin | `/admin/users` requires `admin:users:read` — hospital admins denied |
| Unauthenticated | Protected routes return **401** (not 500) |

Optional future work (not in V40): `vital_sign_records.encounter_id` (V42) for encounter-linked vitals.

---

## Integration test suite

| Test class | Coverage |
|------------|----------|
| `HmsRbacRegressionIntegrationTest` | Hospital admin, doctor, patient, platform admin, 401 matrix |
| `HmsGoldenPathIntegrationTest` | Appointment filters (no 500), encounter create/list, empty module lists |
| Existing module tests | OPD, IPD, ICU, lab, rad, pharmacy, OT, staff, dashboard |

Tests use Testcontainers PostgreSQL and skip when Docker is unavailable (`@EnabledIf`).

### RBAC matrix (high level)

| Role | Allowed (sample) | Denied (sample) |
|------|------------------|-----------------|
| `HOSPITAL_ADMIN` | `/hospital/dashboard`, `/hospital/staff`, module dashboards | `/admin/users` |
| `DOCTOR` | `/doctor/dashboard`, `/clinical/encounters/doctor/me` | `/hospital/staff` |
| `PATIENT` | `/clinical/encounters/me`, `/patient/dashboard/clinical` | `/hospital/dashboard`, `/hospitals/me/profile` |
| Platform admin | `/admin/users` | — |
| Unauthenticated | — | All protected HMS routes → 401 |

### Golden paths

1. **Appointments** — `GET /scheduling/appointments/me?filter={upcoming|past|cancelled}` always returns 200 with paged `content`.
2. **Encounters** — Doctor creates OPD encounter; patient lists encounters and reads detail by id.
3. **Empty lists** — Future-dated OPD queue and lab orders return 200 paged empty arrays (not 500).

---

## Running tests locally

```powershell
cd backend/health360-api
# Docker Desktop must be running
mvn test -Dtest=HmsRbacRegressionIntegrationTest,HmsGoldenPathIntegrationTest
```

---

## Acceptance criteria

- [x] V40 Flyway migration — trigram + composite indexes
- [x] Appointment + encounter golden paths covered in integration tests
- [x] Empty list endpoints return 200 paged results
- [x] RBAC regression matrix per primary role
- [x] Backend compiles (`mvn compile test-compile`)

---

## Module location

- Migration: `backend/health360-api/src/main/resources/db/migration/V40__hms_performance_indexes.sql`
- Tests: `backend/health360-api/src/test/java/com/health360/hms/`
