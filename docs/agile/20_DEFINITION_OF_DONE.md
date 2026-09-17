# 20 — Definition of Done (DoD)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-DOD-001 |
| **Status** | ACTIVE DRAFT |
| **Last Updated** | 2026-09-17 |
| **Adapted to** | Health360 modular monolith: React web + Spring Boot API + Flyway + method security + tests |

A backlog item is **Done** only when applicable criteria below are met. Documentation-only baseline stories use the Documentation subsection.

---

## Implementation Done (feature / bug / tech change)

| # | Criterion |
|---|-----------|
| 1 | Behavior matches agreed AC (CURRENT after change). |
| 2 | **Frontend** integrated where user-facing (pages/API client/state/error handling). |
| 3 | **Backend** controller → service → persistence path complete for the change. |
| 4 | **Flyway** migration added/updated when schema changes; tip remains forward-only. |
| 5 | **Authorization** verified: `@PreAuthorize` / permissions / hospital scope correct; RoleRoute updated if portal access changes. |
| 6 | Validation and error responses handled (no silent failures on critical paths). |
| 7 | **Tests**: unit and/or integration tests updated/added for the change; suite green for affected modules. |
| 8 | No known critical regression on linked WF packs (Auth/OPD/IPD/Billing as applicable). |
| 9 | Security implications reviewed (secrets, webhooks, RBAC edges). |
| 10 | Agile docs updated: story status, backlog row, traceability, gap/bug closure notes. |
| 11 | Code reviewed / merged per team process. |
| 12 | Product Owner acceptance recorded for user-facing items. |

---

## Platform-specific notes

| Area | Expectation |
|------|-------------|
| API | Prefer existing `/api/v1` conventions; FE clients must not double-prefix `baseURL`. |
| Multi-tenant | Hospital-scoped operations respect tenant/hospital scope services. |
| Payments | Non-sandbox must not accept blank webhook secrets (SEC-PAY-001). |
| Notifications | Stub gateways acceptable only if env-bound and documented. |
| Mobile | If story claims mobile, Expo screen + API path verified; else mark web-only. |

---

## Documentation / baseline story Done

| # | Criterion |
|---|-----------|
| 1 | Story ID stable; links Theme → Epic → FG → Feature. |
| 2 | AC reflect **current** behavior (not aspirational). |
| 3 | Evidence cited (FE/BE/DB/tests as available). |
| 4 | Status matches overlay / Phase C (IMPLEMENTED vs PARTIAL). |
| 5 | No fabricated sprint history; labeled Baseline when pre-Agile. |

---

## Explicitly not Done

- UI mock without API.
- API without persistence or authz.
- Table without workflow.
- “Works on my machine” without test or AC verification.
- Marking UNKNOWN as IMPLEMENTED without Phase C-style trace.
