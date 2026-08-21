# P1-F2-09 — Security / RBAC

| Feature | P1-F2 |
| Status | IMPLEMENTED |

---

## Permissions

| Permission | RECEPTIONIST | DOCTOR | NURSE | ICU_NURSE | HOSPITAL_ADMIN |
|------------|:------------:|:------:|:-----:|:---------:|:--------------:|
| `clinical:vitals:read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `clinical:vitals:write` | — | ✓ | ✓ | ✓ | ✓ |

Enforcement: `@PreAuthorize` + `EncounterAccessService.assertCanReadVitals` / `assertCanWriteVitals`.

Hospital admin: hospital ownership scope check (same as encounter write).
