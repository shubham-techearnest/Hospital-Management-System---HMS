# Phase G — Advanced / integrations (in progress)

| Attribute | Value |
|-----------|-------|
| **Document ID** | PM-PHASE-G-001 |
| **Started** | 2026-09-07 |
| **Parent** | [MODULE-DEVELOPMENT-PLAN.md](../13-project-management/MODULE-DEVELOPMENT-PLAN.md) |

## Done in this wave

| ID | Deliverable |
|----|-------------|
| G2 | Appointment check-in QR + `health360://appointments/{id}/check-in` deep link |
| G3 | `OPD_APPROACHING` when WAITING position ≤ 3 (once per token) |
| G6 | `pharmacy.medicine_batches` + `stock_transactions`; receive stock API; FEFO decrement on dispense |
| G7 | OT implant tracking (`ot.ot_implants`); add on procedure detail; included in procedure response |
| G8 | Partner admin CRUD (`/api/v1/admin/partners`); Admin UI `/admin/partners` |
| G9 | Hospital dashboard `opsTrend7d` (7-day OPD wait/completed) |
| G10 | Forgot / reset password (`/auth/forgot-password`, `/auth/reset-password`) |

Migrations: **V74** foundation · **V75** SaaS invoice sequence `version` · **V76** OT implants

## Still open

- G1 SMS/WhatsApp (vendor)
- G4 PACS / G5 LIS (hospital contracts)
- G7 anesthesia chart (implants done)
- G8 partner memberships polish (org/location/links done)
- G10 MFA (TOTP) after password reset
