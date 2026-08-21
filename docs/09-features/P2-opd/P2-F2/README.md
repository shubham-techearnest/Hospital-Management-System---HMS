# P2-F2 — Queue Skip / Recall

| Feature ID | P2-F2 |
| Epic | EPIC-04 OPD |
| Sprint | 4 |
| Release | R2 |
| **Approval Status** | **APPROVED — IMPLEMENTED (IN QA)** |
| Approved | 2026-08-21 |

---

## Business problem

When a patient is called but does not respond (or reception must defer them), staff need to **skip** the token without cancelling the visit, then **recall** them later. Today the queue only supports call → start → complete / cancel — no skip/recall.

## Goal

- **Skip:** WAITING or CALLED → SKIPPED (audit + optional reason)
- **Recall:** SKIPPED → CALLED (re-announce; bump priority)

## Scope

- Flyway **V46** — `SKIPPED` status; `skipped_at`, `skip_reason`, `recalled_at`
- `POST /opd/queue/{id}/skip` and `/recall`
- Reception + Hospital OPD UI actions
- Integration test

## Out of scope

- Display board / TV integration
- Auto-skip timeout jobs
- Mobile

## Package

| Doc | File |
|-----|------|
| BR | [P2-F2-01](./P2-F2-01-business-requirement.md) |
| Stories | [P2-F2-02](./P2-F2-02-user-stories.md) |
| FR | [P2-F2-03](./P2-F2-03-functional-requirements.md) |
| Workflow | [P2-F2-04](./P2-F2-04-business-workflow.md) |
| UX | [P2-F2-05](./P2-F2-05-ux-requirements.md) |
| Architecture | [P2-F2-06](./P2-F2-06-architecture-design.md) |
| DB | [P2-F2-07](./P2-F2-07-database-design.md) |
| API | [P2-F2-08](./P2-F2-08-api-design.md) |
| RBAC | [P2-F2-09](./P2-F2-09-security-rbac.md) |
| Audit | [P2-F2-10](./P2-F2-10-audit-compliance.md) |
| Testing | [P2-F2-11](./P2-F2-11-testing-strategy.md) |
| Migration | [P2-F2-12](./P2-F2-12-migration-plan.md) |
| Release | [P2-F2-13](./P2-F2-13-release-plan.md) |
| UAT | [P2-F2-14](./P2-F2-14-uat-plan.md) |
