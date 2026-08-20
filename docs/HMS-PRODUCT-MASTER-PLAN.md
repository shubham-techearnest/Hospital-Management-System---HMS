# Health360 HMS — Product Development Master Plan

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-PDMP-001 |
| **Version** | 1.0 |
| **Status** | **DRAFT — Documentation package complete; pending senior approval** |
| **Last Updated** | 2026-08-20 |
| **Mode** | DOCUMENTATION / PLANNING (no implementation) |

---

## Purpose

Convert the completed system audit into a **governed product-development lifecycle**:

```text
AUDIT → PRODUCT VISION → REQUIREMENTS → FLOWS → ARCHITECTURE → DESIGN →
SPRINT PLAN → APPROVAL → IMPLEMENTATION → QA → UAT → RELEASE → CLOSURE
```

**No major feature moves from idea → code without approval.**

---

## Start here

| Audience | Document |
|----------|----------|
| **Senior management** | [Executive Report](./13-project-management/executive-dashboard.md) |
| **Next human action** | [NEXT-ACTION.md](./NEXT-ACTION.md) |
| **Product / BA** | [Product Vision](./01-product/product-vision.md) · [Roadmap](./01-product/product-roadmap.md) |
| **Architects** | [Target Architecture](./04-architecture/target-architecture.md) · [ADRs](./04-architecture/architecture-decision-records/README.md) |
| **Delivery** | [Sprint Plan](./13-project-management/sprint-plan.md) · [Feature Board](./13-project-management/feature-status-board.md) |
| **First feature (pending approval)** | [P1-F1 Package](./09-features/P1-foundation/P1-F1/README.md) |
| **Legacy HMS delivery (as-built)** | [hms/README.md](./hms/README.md) |

---

## Documentation map (new structure)

```text
docs/
├── HMS-PRODUCT-MASTER-PLAN.md     ← you are here
├── NEXT-ACTION.md
├── 00-governance/
├── 01-product/
├── 02-requirements/
├── 03-domain/
├── 04-architecture/
├── 05-database/
├── 06-api/
├── 07-web/
├── 08-mobile/
├── 09-features/
├── 10-testing/
├── 11-security/
├── 12-reports/                    (placeholder — Phase 5+)
├── 13-project-management/
├── 14-release/
├── hms/                           (as-built HMS-0…11 — preserved)
├── post-hms/                      (bridge notes — preserved)
└── phase-1|1.5|2/                 (historical — preserved)
```

---

## 30 deliverables index

| # | Deliverable | Location | Status |
|---|-------------|----------|--------|
| 1 | Executive Product Roadmap | [01-product/product-roadmap.md](./01-product/product-roadmap.md) | DRAFT |
| 2 | Complete Phase Roadmap | [01-product/product-roadmap.md](./01-product/product-roadmap.md) § Phases | DRAFT |
| 3 | Complete Epic List | [02-requirements/epics.md](./02-requirements/epics.md) | DRAFT |
| 4 | Complete Feature List | [13-project-management/feature-list.md](./13-project-management/feature-list.md) · [feature-status-board.md](./13-project-management/feature-status-board.md) | DRAFT |
| 5 | Complete Sprint Plan | [13-project-management/sprint-plan.md](./13-project-management/sprint-plan.md) | DRAFT |
| 6 | Master Requirement Catalogue | [02-requirements/requirements-catalogue.md](./02-requirements/requirements-catalogue.md) | DRAFT |
| 7 | Master User Story Catalogue | [02-requirements/user-stories-catalogue.md](./02-requirements/user-stories-catalogue.md) | DRAFT |
| 8 | Master Use Case Catalogue | [02-requirements/use-cases-catalogue.md](./02-requirements/use-cases-catalogue.md) | DRAFT |
| 9 | Master Real-Life Workflow Catalogue | [01-product/workflows-catalogue.md](./01-product/workflows-catalogue.md) | DRAFT |
| 10 | Master Database Change Plan | [05-database/migration-master-plan.md](./05-database/migration-master-plan.md) | DRAFT |
| 11 | Master API Change Plan | [06-api/api-change-master-plan.md](./06-api/api-change-master-plan.md) | DRAFT |
| 12 | Master Web Screen Plan | [07-web/portal-and-route-plan.md](./07-web/portal-and-route-plan.md) | DRAFT |
| 13 | Master Mobile Screen Plan | [08-mobile/mobile-screen-plan.md](./08-mobile/mobile-screen-plan.md) | DRAFT |
| 14 | Master RBAC Matrix | [11-security/rbac-matrix.md](./11-security/rbac-matrix.md) | DRAFT |
| 15 | Master Audit Matrix | [11-security/audit-matrix.md](./11-security/audit-matrix.md) | DRAFT |
| 16 | Master Notification Matrix | [11-security/notification-matrix.md](./11-security/notification-matrix.md) | DRAFT |
| 17 | Master Testing Strategy | [10-testing/testing-strategy.md](./10-testing/testing-strategy.md) | DRAFT |
| 18 | Master UAT Strategy | [14-release/uat-plan.md](./14-release/uat-plan.md) | DRAFT |
| 19 | Master Traceability Matrix | [02-requirements/traceability-matrix.md](./02-requirements/traceability-matrix.md) | DRAFT |
| 20 | Master Risk Register | [13-project-management/risk-register.md](./13-project-management/risk-register.md) | DRAFT |
| 21 | Architecture Decision Register | [04-architecture/architecture-decision-records/](./04-architecture/architecture-decision-records/) | DRAFT |
| 22 | Documentation Approval Workflow | [00-governance/approval-workflow.md](./00-governance/approval-workflow.md) | DRAFT |
| 23 | Definition of Ready | [00-governance/definition-of-ready.md](./00-governance/definition-of-ready.md) | DRAFT |
| 24 | Definition of Done | [00-governance/definition-of-done.md](./00-governance/definition-of-done.md) | DRAFT |
| 25 | Release Roadmap | [14-release/release-roadmap.md](./14-release/release-roadmap.md) | DRAFT |
| 26 | Senior Management Executive Report | [13-project-management/executive-dashboard.md](./13-project-management/executive-dashboard.md) | DRAFT |
| 27 | P1-F1 Complete Documentation Package | [09-features/P1-foundation/P1-F1/](./09-features/P1-foundation/P1-F1/) | DRAFT |
| 28 | Decisions Requiring Senior Approval | [13-project-management/decisions-pending-approval.md](./13-project-management/decisions-pending-approval.md) | DRAFT |
| 29 | Items Explicitly Out of Scope | [01-product/product-scope.md](./01-product/product-scope.md) § Out of Scope | DRAFT |
| 30 | NEXT ACTION | [NEXT-ACTION.md](./NEXT-ACTION.md) | ACTIVE |

---

## Critical architecture rules (non-negotiable)

1. **No duplicate Patient entity** — extend `patient.patient_profiles`
2. **`clinical.encounters` = PatientVisit hub** — no parallel PatientVisit table
3. **Prescription ≠ pharmacy fulfillment** — separate modules linked by encounter
4. **Clinical vitals ≠ consumer vitals** — new `clinical.vital_signs` for encounter scope
5. **Flyway V42+ only** — never edit V1–V41 applied migrations
6. **Additive APIs** — preserve web/mobile consumers
7. **Backend RBAC mandatory** — frontend guards are UX only

---

## Current project status

| Dimension | Status |
|-----------|--------|
| As-built HMS (HMS-0…11) | **RELEASED** (see [hms/HMS-SPRINT-STATUS.md](./hms/HMS-SPRINT-STATUS.md)) |
| OPD/IPD target requirements | **PLANNED** (this master plan) |
| Implementation mode | **DOCUMENTATION — awaiting approval** |
| First implementation candidate | **P1-F1** (NOT approved for code) |

---

## Approval gate

**Do not implement P1-F1 until:**

- [ ] Product scope approved
- [ ] Roadmap & sprint plan approved
- [ ] ADRs approved
- [ ] P1-F1 documentation package status = **APPROVED**
- [ ] Pending decisions (UHID scope, duplicate threshold) resolved

See [NEXT-ACTION.md](./NEXT-ACTION.md).
