# P2-F1-09 — Security / RBAC

| Permission | RECEPTIONIST | HOSPITAL_ADMIN |
|------------|:------------:|:--------------:|
| `appointment:arrive` | ✓ | ✓ |
| `opd:registration:write` | ✓ (existing) | ✓ |

Hospital/branch scope via `HospitalScopeService` / OPD access.
