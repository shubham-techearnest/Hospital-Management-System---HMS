# Phase G — Advanced / integrations

| Attribute | Value |
|-----------|-------|
| **Document ID** | PM-PHASE-G-001 |
| **Started** | 2026-09-07 |
| **Status** | **COMPLETE** (code) — 2026-09-07 |
| **Parent** | [MODULE-DEVELOPMENT-PLAN.md](../13-project-management/MODULE-DEVELOPMENT-PLAN.md) |

## Delivered

| ID | Deliverable |
|----|-------------|
| G1 | SMS gateway: log stub + **MSG91 HTTP** (`DefaultSmsNotificationGateway`) when `SMS_PROVIDER=msg91` + `SMS_AUTH_KEY` |
| G2 | Appointment check-in QR + `health360://appointments/{id}/check-in` deep link |
| G3 | `OPD_APPROACHING` when WAITING position ≤ 3 (once per token) |
| G6 | Pharmacy batches + FEFO dispense + catalog Receive stock UI |
| G7 | OT implants + anesthesia chart (upsert + vitals/events) |
| G8 | Partner admin CRUD + memberships |
| G9 | Hospital dashboard `opsTrend7d` |
| G10 | Forgot / reset password + TOTP MFA |

Migrations: **V74**–**V78**

## Deferred (external dependency)

| ID | Item | Reason |
|----|------|--------|
| G4 | PACS / DICOM | Hospital PACS contract |
| G5 | LIS | External LIS contract |
| G11 | TV / display board | Delivered in Phase H (H1) — `/reception/display` |

## Ops notes

- SMS default: `SMS_PROVIDER=log` (API logs). Live: `SMS_PROVIDER=msg91`, `SMS_AUTH_KEY`, prefer `SMS_TEMPLATE_ID` for DLT Flow API.
- QA: `mannual/QA-TEST-CREDENTIALS-AND-FUNCTIONALITY.txt` + `mannual/MANUAL-TEST-PLAN-PHASE-A-TO-G.md`
- Phase H: [PHASE-H-NOTES.md](./PHASE-H-NOTES.md)
