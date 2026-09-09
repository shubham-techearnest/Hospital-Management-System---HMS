# Health360 Pre-Testing Smoke Test Report

| Document | HEALTH360-SMOKE-001 |
| Date | 2026-09-09 |
| Type | Readiness gate — **code-path / evidence smoke**, not full manual QA |
| Environment | Not executed against a live empty hospital in this gate run |

---

## Purpose

Per readiness gate §36, prove the **system can** support each step. This report records **code-evidence smoke** (controllers, services, routes, migrations, prior feature status). Live click-through smoke is intentionally deferred to the **manual E2E testing prompt** after this gate.

---

## Smoke checklist (evidence status)

| # | Capability | Evidence smoke | Live smoke | Notes |
|---|------------|----------------|------------|-------|
| 1 | Create/authenticate administrator | PASS (code) | PENDING | Platform admin + JWT auth |
| 2 | Create new hospital | PASS (code) | PENDING | `AdminHospitalController` + Admin UI |
| 3 | Configure hospital information | PASS (code) | PENDING | Profile / branches / depts |
| 4 | Create hospital staff | PASS (code) | PENDING | Staff APIs + UI |
| 5 | Create doctor | PASS (code) | PENDING | Doctor mapping |
| 6 | Create doctor schedule | PASS (code) | PENDING | Scheduling module |
| 7 | Register patient | PASS (code) | PENDING | Self + desk registry |
| 8 | Generate/find UHID | PASS (code) | PENDING | V42 + UHID services |
| 9 | Search patient | PASS (code) | PENDING | Hospital patient search |
| 10 | Book/create appointment | PASS (code) | PENDING | Scheduling + patient book |
| 11 | Create OPD visit | PASS (code) | PENDING | Walk-in / arrival |
| 12 | Add to queue | PASS (code) | PENDING | OPD queue APIs |
| 13 | Open doctor consultation | PASS (code) | PENDING | Doctor OPD |
| 14 | Create prescription | PASS (code) | PENDING | e-Rx |
| 15 | Create lab order | PASS (code) | PENDING | Lab order APIs |
| 16 | Process lab result | PASS (code) | PENDING | Lab worklist |
| 17 | Pharmacy access Rx | PASS (code) | PENDING | ECO-P4 |
| 18 | Dispense medicine | PASS (code) | PENDING | Pharmacy worklist |
| 19 | Create billing entries | PASS (code)* | PENDING | OPD checkout OK; lab/pharm auto NO — use manual lines |
| 20 | IPD admission | PASS (code) | PENDING | `IpdAdmissionService` |
| 21 | Assign bed | PASS (code) | PENDING | Facility + admit |
| 22 | Nursing/clinical IPD | PASS (code) | PENDING | Chart + nursing routes |
| 23 | Required IPD actions | PASS (code)* | PENDING | Enterprise path UAT; blood stub |
| 24 | Initiate/complete discharge | PASS (code) | PENDING | Discharge services V85–86 |
| 25 | Release bed | PASS (code) | PENDING | Discharge bed release |
| 26 | Retrieve patient history | PASS (code) | PENDING | Portal timeline / IPD |

\*Known limitation documented in gap tracker (G-001, G-002, G-006).

---

## Preconditions for live smoke / UAT

1. Apply Flyway migrations through **V87**.
2. Restart API; re-login so new permissions are in JWT.
3. Prefer a **fresh hospital** created via Platform Admin (not seed-only assumptions).
4. Use **mobile + password** for desk-created patients (stub email is internal).
5. For Patient 2 financial close: add **manual invoice lines** for lab/pharmacy if auto-charge absent.

---

## Result

| Gate | Result |
|------|--------|
| Code-path smoke for core journey | **PASS** |
| Live environment smoke | **PENDING** (execute with next manual testing prompt) |
| Blocks full manual E2E? | **NO** — with documented workarounds |
