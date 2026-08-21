# P2-F4 — E-prescription

| Feature ID | P2-F4 |
| Epic | EPIC-06 E-prescription |
| Sprint | 6 |
| Release | R2 |
| **Approval Status** | **APPROVED — IN DEVELOPMENT** (proceed) |
| Approved | 2026-08-21 |

## Goal

Doctors issue encounter-linked e-prescriptions (`clinical.prescriptions` + items) with **DRAFT → SIGNED** lifecycle. Pharmacy fulfillment remains separate (ADR-005).

## Scope

- Flyway **V48** — prescriptions schema + RBAC
- Create / update draft / sign APIs
- Doctor encounter E-prescription panel
- Patient list of signed prescriptions
- Integration test

## Out of scope

- PDF/QR generation
- Pharmacy dispense from Rx (bridge later)
- Full drug-interaction engine (DEC-007 stub only)
- Marketplace pharmacy

## Package

See `P2-F4-01-through-14.md`.
