# Health360 HMS — NEXT ACTION

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-NEXT-001 |
| **Status** | **ACTIVE** |
| **Last Updated** | 2026-08-20 |

---

## CURRENT STATUS

**DOCUMENTATION / PLANNING**

- System audit: **COMPLETE**
- Product Development Master Plan: **DRAFT**
- P1-F1 documentation package: **DRAFT (14/14 docs complete)**
- Implementation (P1-F1 code): **NOT STARTED** (blocked until approval)

---

## IMMEDIATE NEXT ACTION — Human / Senior Review

Review and approve the following **in order**:

| # | Item | Document | Approval required from |
|---|------|----------|------------------------|
| 1 | Product scope & out-of-scope | [01-product/product-scope.md](./01-product/product-scope.md) | Product Owner |
| 2 | Product vision & personas | [01-product/product-vision.md](./01-product/product-vision.md) | Product Owner |
| 3 | Target architecture & ADRs | [04-architecture/target-architecture.md](./04-architecture/target-architecture.md) | Technical Lead / Architect |
| 4 | Domain model (encounter hub) | [03-domain/domain-model.md](./03-domain/domain-model.md) | Architect |
| 5 | Phase & release roadmap | [01-product/product-roadmap.md](./01-product/product-roadmap.md) | Product Owner + Architect |
| 6 | Sprint plan (Sprint 0–23) | [13-project-management/sprint-plan.md](./13-project-management/sprint-plan.md) | Scrum Master + Tech Lead |
| 7 | **Pending decisions** (UHID scope, duplicate rules) | [13-project-management/decisions-pending-approval.md](./13-project-management/decisions-pending-approval.md) | Product Owner + Architect |
| 8 | P1-F1 full documentation package | [09-features/P1-foundation/P1-F1/](./09-features/P1-foundation/P1-F1/) | All reviewers |
| 9 | RBAC baseline for P1-F1 | [11-security/rbac-matrix.md](./11-security/rbac-matrix.md) | Security / Architect |
| 10 | Database migration strategy V42+ | [05-database/migration-master-plan.md](./05-database/migration-master-plan.md) | DBA / Architect |

### Approval statement (when ready)

> **"APPROVE ROADMAP AND P1-F1"**

Only after this explicit approval may implementation begin.

---

## AFTER APPROVAL — First implementation

**Feature:** P1-F1 — UHID/MRN + Hospital Patient Registration + Duplicate Detection

**Pre-implementation checklist:**

- [ ] P1-F1 status = APPROVED in [feature board](./13-project-management/feature-status-board.md)
- [ ] DEC-001 (UHID scope) resolved
- [ ] DEC-002 (duplicate threshold) resolved
- [ ] Sprint 1 kicked off

**Implementation order:**

1. Flyway **V42** (per approved DB design)
2. Backend services + APIs
3. RBAC permissions seed
4. Web reception screens
5. Integration tests
6. Documentation closure + traceability update

**Mobile:** Deferred (Sprint 1 scope = web reception only)

---

## Operating mode

| Mode | Current | Next |
|------|---------|------|
| A — Discovery | ✅ Complete | — |
| B — Documentation | ✅ In progress → **awaiting review** | Revise from feedback |
| C — Review | ⏳ **NOW** | Senior stakeholders |
| D — Approval | Blocked | After review |
| E — Implementation | Blocked | After P1-F1 approval |
| F — QA | Blocked | — |
| G — UAT | Blocked | — |
| H — Release | Blocked | — |
| I — Closure | Blocked | — |

---

## Contact / ownership (fill on approval)

| Role | Name | Sign-off |
|------|------|----------|
| Product Owner | _________________ | ________ |
| Technical Lead | _________________ | ________ |
| Architect | _________________ | ________ |
| QA Lead | _________________ | ________ |
| Security | _________________ | ________ |
