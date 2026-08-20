# P1-F1-06 — Architecture Design

| Feature | P1-F1 |
| Status | DRAFT |

---

## Module placement

New services in `com.health360.patient` (extend existing module):

| Component | Responsibility |
|-----------|----------------|
| `HospitalPatientRegistryService` | Register, search, duplicate resolution |
| `UhidGenerationService` | Sequence allocation under transaction |
| `DuplicateDetectionService` | Candidate scoring |
| `HospitalPatientRegistryController` | `/api/v1/hospital/patients/*` |

---

## Integration points

| Service | Use |
|---------|-----|
| `HospitalScopeService` | Resolve hospitalId/branchId from principal |
| `StaffRepository` | Staff assignment validation |
| `PatientProfileRepository` | CRUD extend |
| Audit service | Registration events |
| IAM user service | Create stub user (DEC-004 option A) |

---

## UHID generation strategy

1. Begin transaction
2. `SELECT ... FOR UPDATE` on `patient.uhid_sequences` for (tenant_id, year)
3. Increment last_value
4. Format: `{PREFIX}-{YEAR}-{SEQ:8}` e.g. `H360-2026-00000042`
5. Insert profile with uhid
6. Commit

**Uniqueness:** DB unique index on `(tenant_id, uhid)` WHERE deleted_at IS NULL

---

## Concurrency

- Sequence row lock prevents duplicate UHID
- Registration idempotency: optional client `Idempotency-Key` header (recommended)

---

## Backward compatibility

- Existing patient self-service APIs unchanged
- Existing profiles without UHID: backfill job optional (separate story) or assign on first hospital registration

---

## Diagram

```text
Reception Web → HospitalPatientRegistryController
                      → HospitalScopeService
                      → DuplicateDetectionService
                      → UhidGenerationService
                      → PatientProfileRepository
                      → Audit
                      → (IAM stub user)
```
