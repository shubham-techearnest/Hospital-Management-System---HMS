# System Architecture — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-ARCH-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Scope** | CURRENT STATE only (not target) |
| **Evidence** | CODE-VERIFIED |

---

## Style

**Modular monolith** Spring Boot API + separate React web SPA + Expo mobile app + PostgreSQL.

```text
[Web SPA] ──HTTPS/JSON──▶ [health360-api]
[Mobile]  ──HTTPS/JSON──▶ [health360-api]
                              │
                              ├─ PostgreSQL (schemas per domain)
                              ├─ Redis (optional; often disabled)
                              ├─ Local file storage
                              ├─ Razorpay
                              ├─ MSG91 SMS (optional)
                              └─ Expo Push
```

---

## Backend shape (CURRENT)

- Package-by-domain under `com.health360.*`
- Typical flow: `Controller → Application Service → JPA Repository → Entity`
- Cross-cutting: `shared` (errors, audit, base entity), `config` (security, JWT)
- Automation spine: `EventPublisher` → `HospitalEvent` + outbox → `AutomationReactor` → tasks / charges / facility hooks
- Feature gating: `FeatureAccessService` + `PlanFeatureKeys`
- Hospital scoping: `HospitalScopeService` / module access services

This is **not** strict hexagonal everywhere; do not pretend ports/adapters are universal.

---

## Security (CURRENT summary)

- Stateless JWT (RS256); permissions as authorities
- Method security `@PreAuthorize`
- Public allowlist for health, auth, public profiles, payment webhook
- Soft-delete via `deleted_at` + `@SQLRestriction`
- Details: [SECURITY-ARCHITECTURE.md](./SECURITY-ARCHITECTURE.md), [../api/AUTHENTICATION.md](../api/AUTHENTICATION.md)

---

## Multi-tenancy (CURRENT)

- `tenant_id` on auditable rows
- JWT carries `tenantId`
- Hospital/branch IDs on operational entities
- Subscriptions attach features per hospital plan

---

## What this doc is not

Target redesign, microservices split, and long-term Health OS vision live in [TARGET-ARCHITECTURE.md](./TARGET-ARCHITECTURE.md).
