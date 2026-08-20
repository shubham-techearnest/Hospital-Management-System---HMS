# Testing Strategy — Health360 HMS Program

| Document ID | TEST-STRAT-001 |
| Status | DRAFT |

---

## Test pyramid

```text
        / E2E \           few — critical paths
       / Integr \        many — API + DB + RBAC
      /   Unit    \      most — services, validators
```

---

## Backend

| Type | Tool | Scope |
|------|------|-------|
| Unit | JUnit 5, Mockito | Services, mappers, duplicate scorer |
| Integration | Testcontainers PostgreSQL | Migrations, repositories, controllers |
| RBAC | `@WithMockUser` / JWT test utils | 403 for wrong role |
| Migration | Flyway apply on clean DB | V42+ forward |
| Concurrency | Multi-thread tests | UHID sequence, bed allocation |

---

## Web

| Type | Tool | When |
|------|------|------|
| Component | Vitest + RTL | Forms, duplicate dialog |
| Integration | MSW + React Query | Reception flows |

---

## Mobile

| Type | Tool | When |
|------|------|------|
| Component | Jest | Sprint 13+ |
| E2E | Detox (optional) | Pre-release |

---

## Per-feature mandatory scenarios

1. Happy path
2. Validation failure
3. Authorization failure
4. Duplicate request / idempotency
5. Concurrency (where applicable)
6. Rollback / transaction failure
7. Empty state
8. Hospital scope violation

---

## UAT

See [14-release/uat-plan.md](../14-release/uat-plan.md). Evidence stored per sprint.

---

## CI gate

- `mvn test` pass
- No critical Sonar issues (when configured)
- Migration applies on fresh DB

P1-F1 detail: [P1-F1-11-testing-strategy.md](../09-features/P1-foundation/P1-F1/P1-F1-11-testing-strategy.md)
