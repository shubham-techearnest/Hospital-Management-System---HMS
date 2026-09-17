# Migrations — Flyway Timeline

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-MIG-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Path** | `backend/health360-api/src/main/resources/db/migration/` |
| **Count** | 103 files (V1–V103) |

## Policy (DOCUMENT-VERIFIED)

- Never edit applied migrations
- Additive only in production practice
- Next free version after tip: **V104**

## Eras

| Range | Era |
|-------|-----|
| V1–V29 | Foundation IAM/patient/doctor/hospital/scheduling/analytics/search/subscription |
| V30–V40 | Clinical HMS foundation + indexes |
| V41–V89 | Billing, UHID, OPD realism, Rx, partners, Razorpay, IPD enterprise, assets, letterhead |
| V90–V103 | HMS V2 automation → predictive → hardening |

## Tip

**V103__hms24_production_hardening.sql** — overdue task index, charge encounter index, `RX_DISPENSE` seed.

Full one-line list maintained in discovery notes; filenames are authoritative.
