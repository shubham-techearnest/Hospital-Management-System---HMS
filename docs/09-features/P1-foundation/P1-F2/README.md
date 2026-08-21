# P1-F2 — Encounter-Scoped Clinical Vitals

| Feature ID | P1-F2 |
| Epic | EPIC-05 Clinical Documentation |
| Sprint | 2 |
| Release | R1 |
| **Approval Status** | **APPROVED — IN DEVELOPMENT** |
| Approved | 2026-08-21 |

---

## Implementation summary

| Layer | Status |
|-------|--------|
| V43 migration | `clinical.vital_signs` + RBAC |
| Backend APIs | `POST/GET /api/v1/clinical/encounters/{id}/vitals` |
| Web | Doctor encounter vitals panel; nursing encounter vitals entry |
| Integration test | `ClinicalVitalsIntegrationTest` |
| Mobile | Deferred (Sprint 2 scope) |

---

## Approved decisions

| Decision | Resolution |
|----------|------------|
| ADR-004 | Separate `clinical.vital_signs` (do not overload `patient.vital_sign_records`) |
| Field set | BP, HR, temp, RR, SpO2, blood glucose (same clinical set as consumer vitals) |
| Append-only | New row per recording; no in-place edit in MVP |
| Access | `clinical:vitals:read` / `clinical:vitals:write` (Nurse + Doctor write; Receptionist read) |

---

## Package index

| Doc | Title | Status |
|-----|-------|--------|
| [P1-F2-01](./P1-F2-01-business-requirement.md) | Business Requirement | APPROVED |
| [P1-F2-02](./P1-F2-02-user-stories.md) | User Stories | APPROVED |
| [P1-F2-03](./P1-F2-03-functional-requirements.md) | Functional Requirements | APPROVED |
| [P1-F2-04](./P1-F2-04-business-workflow.md) | Business Workflow | APPROVED |
| [P1-F2-05](./P1-F2-05-ux-requirements.md) | UX Requirements | APPROVED |
| [P1-F2-06](./P1-F2-06-architecture-design.md) | Architecture Design | APPROVED |
| [P1-F2-07](./P1-F2-07-database-design.md) | Database Design (V43) | IMPLEMENTED |
| [P1-F2-08](./P1-F2-08-api-design.md) | API Design | IMPLEMENTED |
| [P1-F2-09](./P1-F2-09-security-rbac.md) | Security / RBAC | IMPLEMENTED |
| [P1-F2-10](./P1-F2-10-audit-compliance.md) | Audit & Compliance | IMPLEMENTED |
| [P1-F2-11](./P1-F2-11-testing-strategy.md) | Testing Strategy | IMPLEMENTED |
| [P1-F2-12](./P1-F2-12-migration-plan.md) | Migration Plan | IMPLEMENTED |
| [P1-F2-13](./P1-F2-13-release-plan.md) | Release Plan | IN QA |
| [P1-F2-14](./P1-F2-14-uat-plan.md) | UAT Plan | Pending UAT |
