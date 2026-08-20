# Project Governance — Health360 HMS Program

| Document ID | GOV-PROJ-001 |
| Status | DRAFT |

---

## Operating modes

| Mode | Description |
|------|-------------|
| A — Discovery | Read repo; no code changes |
| B — Documentation | Create/update docs |
| C — Review | Gaps, risks, decisions |
| D — Approval | Wait for explicit approval |
| E — Implementation | Approved scope only |
| F — QA | Test against acceptance criteria |
| G — UAT | Pilot validation |
| H — Release | Deploy with checklist |
| I — Closure | Update traceability, release notes |

**Current mode:** C — Review (documentation package complete, awaiting approval)

---

## Roles

| Role | Responsibility |
|------|----------------|
| Product Owner | Scope, priorities, UAT sign-off |
| Architect | Architecture, ADRs, DB/API approval |
| Technical Lead | Implementation quality, API compatibility |
| Scrum Master | Sprint plan, ceremonies |
| QA Lead | Test strategy, release gate |
| Documentation Lead | Traceability, doc closure |
| Security | RBAC, audit, compliance |

---

## Change control

No major feature: idea → code. See [change-control.md](./change-control.md).

---

## Approvals

Feature lifecycle: DRAFT → INTERNAL REVIEW → ARCHITECT REVIEW → SENIOR REVIEW → **APPROVED** → IMPLEMENTATION → QA → UAT → RELEASED → CLOSED

See [approval-workflow.md](./approval-workflow.md).
