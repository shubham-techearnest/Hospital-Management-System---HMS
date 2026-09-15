# Health360 Pre-Testing / Session Smoke Test Report

| Document | HEALTH360-SMOKE-002 |
| Date | 2026-09-15 |
| Type | Live API smoke (local) |
| Companion | [TEST_SESSION_2026-09-15.md](./TEST_SESSION_2026-09-15.md) |

## Checklist

| # | Capability | Live smoke | Notes |
|---|------------|------------|-------|
| 1 | Authenticate administrator | **PASS** | platform + hospital admin |
| 2 | Create/list hospital | **PASS** | list (create not re-run) |
| 3 | Configure hospital | BLOCKED | UI |
| 4 | Create staff | BLOCKED | UI |
| 5 | Create doctor | N/A | Seeded doctors used |
| 6 | Doctor schedule | BLOCKED | UI |
| 7 | Register patient | BLOCKED | UI |
| 8 | UHID | BLOCKED | UI |
| 9 | Search patient | PARTIAL | Probe 400 on naive `q=` |
| 10 | Appointment | **PASS** | Correct hospital appointments path |
| 11 | OPD visit | BLOCKED | UI |
| 12 | Queue | **PASS** | List |
| 13 | Doctor consultation | BLOCKED | UI |
| 14 | Prescription | BLOCKED | UI |
| 15 | Lab order | PARTIAL | List only |
| 16 | Lab result | BLOCKED | |
| 17 | Pharmacy Rx | PARTIAL | List only |
| 18 | Dispense | BLOCKED | |
| 19 | Billing | **PASS** | List with branchId |
| 20 | IPD admission | **PASS** | With attending |
| 21 | Assign bed | **PASS** | |
| 22 | Nursing/clinical IPD | **PASS** | HA nursing round |
| 23 | Doctor IPD round | **FAIL** | BUG-001 |
| 24 | Discharge | **PASS** | |
| 25 | Release bed | **PASS** | via discharge |
| 26 | Patient history portal | BLOCKED | UI |

## Result

| Gate | Result |
|------|--------|
| API smoke (core IPD attending) | **PASS with 1 HIGH defect** |
| Full UI smoke | **NOT RUN** |
| Approve full manual E2E complete? | **NO** — continue after BUG-001 + FE stories |
