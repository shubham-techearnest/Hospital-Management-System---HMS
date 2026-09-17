# 12 — Technical Debt

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-TECH-001 |
| **Status** | DRAFT |
| **Last Updated** | 2026-09-17 |
| **Rule** | Keep TECH items separate from user-value stories unless fixing requires a paired story |

---

## Technical backlog

| ID | Type | Title | Severity | Priority | Points | Related | Evidence | Proposed Sprint | Notes |
|----|------|-------|----------|----------|--------|---------|----------|-----------------|-------|
| TECH-NTF-001 | TECH | SMS defaults to log stub | Medium | P2 | 5 | Notifications | `DefaultSmsNotificationGateway` | Sprint 03 | Choose real provider or document stub as accepted for non-prod |
| TECH-API-001 | TECH | Normalize FE API path construction (`baseURL` + path) | High | P1 | 5 | BUG-API-001 | `commandCenterApi.ts`, inventory/facility/asset/tasks APIs | Sprint 01 | Same root cause family as BUG-API-001 |
| TECH-BIL-001 | TECH | Charge POST mode ↔ invoice line creation policy | High | P1 | 8 | BUG-BIL-001 | `ChargePostingService`, ChargeController attach | Sprint 02 | Product decision + implementation |
| TECH-TEST-001 | TECH | Expand golden-path ITs for OPD/IPD/Billing/Auth | Medium | P2 | 8 | WF packs | Backend test suite (~59 files Phase A) | Hardening | Confidence MEDIUM on coverage depth |
| TECH-SSOT-001 | TECH | Keep SSOT migration tip aligned with Flyway tip | Low | P3 | 2 | Docs | SSOT vs V104 | Anytime | Documentation debt |
| TECH-MOB-001 | TECH | Decide mobile HMS ops parity scope | Medium | P2 | 5 | EPIC-MOB-001 | Mobile thinner than web | Module Completion | Spike before large mobile stories |

---

## Security-adjacent (tracked also in bug/sec backlog)

| ID | Title | Priority | Points | Notes |
|----|-------|----------|--------|-------|
| SEC-PAY-001 | Razorpay sandbox blank webhook secret | P2 | 5 | Must not ship misconfigured to prod |
| BUG-AUTH-001 / BUG-AUTH-002 | RoleRoute gaps | P1/P2 | 3+3 | Authz FE debt |

---

## Guidance

- Do not inflate baseline stories with points for debt already shipped.
- Pair TECH items with DoD: FE+BE+Flyway (if schema)+`@PreAuthorize`+tests when behavior changes.
