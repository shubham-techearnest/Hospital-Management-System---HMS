# P1-F3 — Patient Clinical Timeline API

| Feature ID | P1-F3 |
| Epic | EPIC-05 Clinical Documentation |
| Sprint | 2 |
| Release | R1 |
| **Approval Status** | **APPROVED — IN DEVELOPMENT** |
| Approved | 2026-08-21 |

---

## Implementation summary

| Layer | Status |
|-------|--------|
| Migration | V44 — `clinical:timeline:read` RBAC |
| Staff API | `GET /api/v1/clinical/patients/{patientId}/timeline` |
| Patient API | `GET /api/v1/patients/me/clinical-timeline` |
| Aggregate | Live projection from encounters, clinical vitals, diagnoses, notes, orders |
| Web | Reception patient detail + doctor encounter (patient clinical timeline) |
| Integration test | `ClinicalTimelineIntegrationTest` |

---

## Approved decisions

| Decision | Resolution |
|----------|------------|
| Scope | Clinical visit events only (not consumer wellness timeline) |
| Source | Live aggregate from clinical tables (covers historical data; no backfill job) |
| Staff vs patient | Staff use clinical permission; patient sees own clinical timeline separately from `/profile/timeline` |
| FR-PAT-015 | Doctors do **not** receive consumer wellness events via this API |

---

## Package index

| Doc | Title | Status |
|-----|-------|--------|
| [P1-F3-01](./P1-F3-01-business-requirement.md) | Business Requirement | APPROVED |
| [P1-F3-02](./P1-F3-02-user-stories.md) | User Stories | APPROVED |
| [P1-F3-03](./P1-F3-03-functional-requirements.md) | Functional Requirements | APPROVED |
| [P1-F3-04](./P1-F3-04-business-workflow.md) | Business Workflow | APPROVED |
| [P1-F3-05](./P1-F3-05-ux-requirements.md) | UX Requirements | APPROVED |
| [P1-F3-06](./P1-F3-06-architecture-design.md) | Architecture Design | APPROVED |
| [P1-F3-07](./P1-F3-07-database-design.md) | Database Design (V44 RBAC) | IMPLEMENTED |
| [P1-F3-08](./P1-F3-08-api-design.md) | API Design | IMPLEMENTED |
| [P1-F3-09](./P1-F3-09-security-rbac.md) | Security / RBAC | IMPLEMENTED |
| [P1-F3-10](./P1-F3-10-audit-compliance.md) | Audit & Compliance | IMPLEMENTED |
| [P1-F3-11](./P1-F3-11-testing-strategy.md) | Testing Strategy | IMPLEMENTED |
| [P1-F3-12](./P1-F3-12-migration-plan.md) | Migration Plan | IMPLEMENTED |
| [P1-F3-13](./P1-F3-13-release-plan.md) | Release Plan | IN QA |
| [P1-F3-14](./P1-F3-14-uat-plan.md) | UAT Plan | Pending UAT |
