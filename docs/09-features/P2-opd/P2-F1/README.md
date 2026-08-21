# P2-F1 — Appointment Arrival + Status Alignment

| Feature ID | P2-F1 |
| Epic | EPIC-03 Appointment & Scheduling |
| Sprint | 3 |
| Release | R2 |
| **Approval Status** | **APPROVED — IN QA** |
| Approved | 2026-08-21 |

---

## Business problem

Reception can check in an appointment via OPD (`POST /opd/registrations/check-in`), which creates an encounter and queue token, but **appointment status never changes**. This causes status drift: appointment stays `PENDING`/`CONFIRMED` while the patient is already in the OPD queue.

## Goal

Single arrival action that atomically:

1. Sets appointment → **ARRIVED**
2. Creates OPD **encounter** (WAITING)
3. Creates **queue entry** (WAITING + token)

## Scope

- Flyway **V45** — add `ARRIVED` to appointment status check; RBAC `appointment:arrive`
- Additive API: `POST /api/v1/scheduling/appointments/{id}/arrive`
- Align existing `POST /opd/registrations/check-in` to also set `ARRIVED` (backward compatible)
- Reception web uses arrive (or enhanced check-in)

## Out of scope

- Queue skip/recall (P2-F2)
- Structured consultation (P2-F3)
- Mobile reception

## Package index

| Doc | Title |
|-----|-------|
| [P2-F1-01](./P2-F1-01-business-requirement.md) | Business Requirement |
| [P2-F1-02](./P2-F1-02-user-stories.md) | User Stories |
| [P2-F1-03](./P2-F1-03-functional-requirements.md) | Functional Requirements |
| [P2-F1-04](./P2-F1-04-business-workflow.md) | Business Workflow |
| [P2-F1-05](./P2-F1-05-ux-requirements.md) | UX Requirements |
| [P2-F1-06](./P2-F1-06-architecture-design.md) | Architecture Design |
| [P2-F1-07](./P2-F1-07-database-design.md) | Database Design (V45) |
| [P2-F1-08](./P2-F1-08-api-design.md) | API Design |
| [P2-F1-09](./P2-F1-09-security-rbac.md) | Security / RBAC |
| [P2-F1-10](./P2-F1-10-audit-compliance.md) | Audit & Compliance |
| [P2-F1-11](./P2-F1-11-testing-strategy.md) | Testing Strategy |
| [P2-F1-12](./P2-F1-12-migration-plan.md) | Migration Plan |
| [P2-F1-13](./P2-F1-13-release-plan.md) | Release Plan |
| [P2-F1-14](./P2-F1-14-uat-plan.md) | UAT Plan |

## Architecture rules preserved

- Encounter remains PatientVisit hub
- Additive API evolution
- Existing check-in consumers continue to work
