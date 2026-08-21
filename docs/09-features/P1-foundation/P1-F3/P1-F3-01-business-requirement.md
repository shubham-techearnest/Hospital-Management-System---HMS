# P1-F3-01 — Business Requirement

| Feature | P1-F3 |
| Status | APPROVED |

## Business problem

Staff need a **chronological clinical timeline** for a patient (visits, vitals, diagnoses, notes, orders). The existing patient wellness timeline (`/patients/me/profile/timeline`) must stay separate so doctors do not receive full consumer health history (FR-PAT-015).

## Goal

Expose a read API that projects clinical activity for a patient for care coordination in R1.

## Scope

- Live aggregate clinical timeline API (staff + patient self)
- RBAC `clinical:timeline:read`
- Reception + doctor web surfaces
- Flyway V44 (permissions only)

## Out of scope

- Editing timeline events
- Merging consumer wellness events into staff view
- Mobile
- Full EMR lite (Phase 2 M14)
