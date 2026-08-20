# P1-F1-09 — Security / RBAC

| Feature | P1-F1 |
| Status | DRAFT |

---

## Permissions (V42 seed)

| Permission | Description |
|------------|-------------|
| `patient:registry:read` | Search and view patient for registration |
| `patient:registry:write` | Register new patient, link to hospital |
| `patient:registry:duplicate_override` | Continue new despite strong duplicate (HOSPITAL_ADMIN) |

---

## Role mapping

| Role | read | write | override |
|------|:----:|:-----:|:--------:|
| RECEPTIONIST | ✓ | ✓ | — |
| HOSPITAL_ADMIN | ✓ | ✓ | ✓ |
| DOCTOR | — | — | — |
| PATIENT | — | — | — |

---

## Scope enforcement

1. Resolve `hospitalId`, `branchId` from `StaffEntity` via `HospitalScopeService`
2. Search results filtered to tenant; hospital_registrations used for display
3. Register always creates/updates link to **staff's hospital**
4. PLATFORM_ADMIN: read-only cross-tenant forbidden unless explicit platform API (out of scope)

---

## PHI protection

- TLS in transit
- JWT required
- Search access audited (who viewed which patient)
- No UHID enumeration — rate limit search API (future WAF rule)

---

## Frontend

`RequirePermission` wrapper on reception routes; 403 → "Contact administrator"
