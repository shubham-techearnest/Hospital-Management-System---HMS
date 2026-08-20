# P1-F1-11 — Testing Strategy

| Feature | P1-F1 |
| Status | DRAFT |

---

## Test classes (planned)

| Test | Type | Scenarios |
|------|------|-----------|
| `UhidGenerationServiceTest` | Unit | Format, increment, year rollover |
| `DuplicateDetectionServiceTest` | Unit | Mobile exact, name+DOB fuzzy, no match |
| `HospitalPatientRegistryIntegrationTest` | Integration | Full register + search + 409 |
| `PatientRegistryRbacIntegrationTest` | Integration | RECEPTIONIST ok, PATIENT 403 |
| `PatientRegistryScopeIntegrationTest` | Integration | Cross-hospital denied |
| `V42MigrationTest` | Migration | Flyway apply, indexes exist |

---

## Mandatory scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Happy register | 201 + UHID |
| 2 | Duplicate mobile | 409 + candidates |
| 3 | Open existing | No new UHID |
| 4 | Continue new with reason | 201 + DUPLICATE_OVERRIDE audit |
| 5 | Concurrent register | Unique UHIDs |
| 6 | Invalid DOB | 422 |
| 7 | Wrong role | 403 |
| 8 | Idempotency key retry | Same response, one UHID |
| 9 | DB failure mid-transaction | Rollback, no orphan sequence gap policy documented |

---

## Web tests

- Search form validation
- Duplicate modal actions
- Receipt render

---

## UAT

See [P1-F1-14-uat-plan.md](./P1-F1-14-uat-plan.md)

---

## CI

Testcontainers PostgreSQL; `@EnabledIf` docker check (existing pattern)
