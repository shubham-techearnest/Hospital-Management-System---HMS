# RBAC Matrix (Master)

| Document ID | SEC-RBAC-001 |
| Status | DRAFT |

Format: `resource:action`

---

## P1-F1 permissions (new)

| Permission | RECEPTIONIST | HOSPITAL_ADMIN | DOCTOR | PATIENT |
|------------|:------------:|:--------------:|:------:|:-------:|
| `patient:registry:read` | ✓ | ✓ | — | — |
| `patient:registry:write` | ✓ | ✓ | — | — |
| `patient:registry:duplicate_override` | — | ✓ | — | — |

---

## Core clinical (as-built + target)

| Permission | RECEPTIONIST | DOCTOR | NURSE | HOSPITAL_ADMIN |
|------------|:------------:|:------:|:-----:|:--------------:|
| `clinical:encounter:read` | ✓ | ✓ | ✓ | ✓ |
| `clinical:encounter:write` | — | ✓ | — | ✓ |
| `clinical:vitals:read` | ✓ | ✓ | ✓ | ✓ |
| `clinical:vitals:write` | — | ✓ | ✓ | ✓ |
| `opd:queue:read` | ✓ | ✓ | ✓ | ✓ |
| `opd:queue:manage` | ✓ | — | — | ✓ |
| `opd:registration:write` | ✓ | — | — | ✓ |
| `billing:invoice:read` | ✓ | ✓ | — | ✓ |
| `billing:invoice:write` | ✓ | — | — | ✓ |
| `billing:payment:record` | ✓ | — | — | ✓ |

---

## Enforcement

- Spring `@PreAuthorize("hasAuthority('...')")`
- `HospitalScopeService` for staff hospital scope
- `EncounterAccessService` for encounter-level access

Frontend: hide/disable only; **403 from API is authoritative**.

Full matrix expansion per sprint in feature security docs.
