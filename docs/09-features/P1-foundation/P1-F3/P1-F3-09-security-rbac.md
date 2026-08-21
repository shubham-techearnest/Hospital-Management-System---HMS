# P1-F3-09 — Security / RBAC

| Permission | RECEPTIONIST | DOCTOR | NURSE | ICU_NURSE | HOSPITAL_ADMIN |
|------------|:------------:|:------:|:-----:|:---------:|:--------------:|
| `clinical:timeline:read` | ✓ | ✓ | ✓ | ✓ | ✓ |

Hospital admin: hospital ownership check not required for patient-level read in MVP (tenant-scoped patient id). Patient self endpoint never accepts another patient's id.
