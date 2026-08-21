# P2-F3 — Structured Consultation

| Feature ID | P2-F3 |
| Epic | EPIC-05 Clinical EMR |
| Sprint | 5 |
| Release | R2 |
| **Approval Status** | **APPROVED — IN DEVELOPMENT** (proceed) |
| Approved | 2026-08-21 |

## Goal

Doctors capture OPD consultation as structured sections (CC, HPI, Examination, Assessment, Plan) on the encounter note, with **DRAFT → FINAL** lifecycle (ADR-009 prepare).

## Scope

- Flyway **V47** — structured columns + `status` on `clinical.notes`
- Extend note create/update/finalize APIs
- Doctor encounter UI: Structured Consultation panel
- Integration test

## Out of scope

- Full version chain / amendments (later ADR-009)
- E-prescription (P2-F4)
- Mobile

## Package

See P2-F3-01 … P2-F3-14 in this folder.
