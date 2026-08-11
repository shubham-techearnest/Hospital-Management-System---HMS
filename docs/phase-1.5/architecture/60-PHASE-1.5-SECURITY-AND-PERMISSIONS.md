# DOC-60: Phase 1.5 — Security & Permissions

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-60 |
| **Version** | 1.0 |
| **Status** | Approved |
| **References** | [DOC-12](../phase-1/architecture/12-SECURITY-ARCHITECTURE.md) |

---

## 1. Authorization model

Phase 1.5 extends Phase 1 RBAC with new permissions seeded in V28. Authorization uses `@PreAuthorize("hasAuthority('...')")` on controller methods.

JWT must include updated permissions — **users must re-login** after V28 migration.

---

## 2. New permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| `admin:hospitals:read` | List/view hospitals | PLATFORM_ADMIN |
| `admin:hospitals:write` | Create hospital, status, invite doctor | PLATFORM_ADMIN |
| `admin:plans:read` | View plan catalog | PLATFORM_ADMIN |
| `admin:plans:write` | Update plan metadata | PLATFORM_ADMIN |
| `admin:subscriptions:read` | View hospital subscriptions/history | PLATFORM_ADMIN |
| `admin:subscriptions:write` | Change hospital plan | PLATFORM_ADMIN |
| `hospital:subscription:read` | View own subscription | HOSPITAL_ADMIN |
| `audit:view` | Read audit logs | PLATFORM_ADMIN (API pending) |

---

## 3. Access matrix

| Action | PLATFORM_ADMIN | HOSPITAL_ADMIN | DOCTOR | PATIENT |
|--------|----------------|----------------|--------|---------|
| Register (patient) | — | — | — | Yes |
| Create hospital | Yes | No | No | No |
| Invite doctor | Yes | No | No | No |
| View all hospitals | Yes | No | No | No |
| Change any plan | Yes | No | No | No |
| View own subscription | Yes (any) | Yes | No | No |
| Update own hospital profile | Yes | Yes | No | No |
| View own doctor roster | Yes | Yes | No | No |

---

## 4. Invite security

| Control | Implementation |
|---------|----------------|
| Temporary password | SecureRandom 12-char if not provided |
| Password policy | Validated if admin supplies password |
| Email verification | Required before ACTIVE login |
| Tenant isolation | All queries scoped by `tenant_id` |
| Audit trail | DOCTOR_INVITED, HOSPITAL_CREATED_BY_ADMIN |

---

## 5. Data isolation

- Hospital admin APIs resolve hospital via `admin_user_id` — cannot access other hospitals.
- Platform admin APIs filter by `tenant_id` from JWT.
- Subscription queries always include `tenant_id`.

---

## 6. Future security work

| Item | Sprint |
|------|--------|
| Block login for SUSPENDED hospitals | P1.5-S9 |
| Feature-level authorization on analytics APIs | P1.5-S7 |
| Audit log read with pagination + filters | P1.5-S9 |
| Rate limit on invite endpoints | P1.5-S10 |
