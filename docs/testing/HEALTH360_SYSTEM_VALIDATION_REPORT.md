# Health360 System Validation Report

| Document | H360-SYS-VAL-REPORT-001 |
| Date | 2026-09-15 |
| Tester role | Senior QA / Test Lead (agent-executed) |
| Environment | Local API `http://localhost:8080` · Postgres 16 running · **Frontend NOT running** · Docker Testcontainers **unavailable** |
| Method | Live **API smoke** against seeded DB + inventory cross-check. Full UI Stories S0–S4 **not click-executed** (no FE). |
| Raw evidence | [API_SMOKE_RAW.json](./API_SMOKE_RAW.json) · [LAST_IT_RUN.log](./LAST_IT_RUN.log) |

---

## Executive Summary

Backend local API was started and exercised for auth, RBAC probes, platform hospital list, IPD ward/bed/admit/**attending**, filter, reassign, discharge, lab/pharmacy list, OPD queue, billing (corrected path), appointments (corrected path).

**Overall stability (API-proven core): ~85%**  
**UI / full patient-journey UAT: NOT EXECUTED (BLOCKED — frontend down)**  
**Recommendation: READY FOR UI UAT** on core API paths (BUG-001 / BUG-002 closed); **do not claim full manual E2E PASS** until Stories S0–S4 are run on UI.

### Headline results

| Area | Result |
|------|--------|
| Auth login (PA/HA/Doctor) + wrong password | **PASS** |
| Doctor denied platform admin hospitals | **PASS** (403) |
| IPD admit **requires** attending | **PASS** (400 without) |
| IPD admit with attending + name resolve | **PASS** (201) |
| IPD list filter by `primaryDoctorId` | **PASS** |
| Reassign attending (admin) | **PASS** |
| Doctor denied reassign attending | **PASS** (403) |
| IPD discharge | **PASS** |
| Doctor write IPD round (`ipd:round:write` + hospital association scope) | **PASS** (201) — BUG-001 **VERIFIED** |
| Hospital admin write nursing round | **PASS** (201) |
| Missing param / wrong method client errors | **PASS** (400 / 405) — BUG-002 **VERIFIED** |
| Lab / Pharmacy list | **PASS** |
| OPD queue list | **PASS** |
| Billing invoices (with `branchId`) | **PASS** |
| Appointments hospital list (correct path) | **PASS** |
| Maven IT suite (Testcontainers) | **SKIPPED** (Docker env invalid) |
| UI Stories S0–S4 | **BLOCKED** |

---

## Modules Tested

| Module | How tested | Status |
|--------|------------|--------|
| Platform / Auth | API login | Fully working (API) |
| Admin hospitals | List | Working |
| RBAC basics | Deny probes | Working |
| IPD facilities | Create ward/room/bed | Working |
| IPD attending | Admit/filter/reassign | Working |
| IPD rounds | HA nursing + Doctor DOCTOR round | Working (API re-verified) |
| IPD discharge | API | Working |
| OPD queue | List | Working (API probe) |
| Lab / Pharmacy | List | Working (API probe) |
| Billing | List with branchId | Working |
| Scheduling | Hospital appointments list | Working (correct path) |
| Patient portal UI | — | Not tested |
| Full OPD clinical UI | — | Not tested |
| Full Lab→Rx→Pharmacy→Bill UI | — | Not tested |

---

## Modules Fully / Partially / Broken / Not Implemented

| Classification | Modules |
|----------------|---------|
| Fully working (API smoke) | Auth, IPD admit+attending+reassign+**doctor rounds**+discharge, bed create, OPD queue list, lab/pharm list, client error mapping |
| Partially working | Patient search probe returned 400 on naive query |
| Broken | None open from this session (BUG-001 / BUG-002 **VERIFIED**) |
| Not implemented / deferred | Multi-doctor care team; lab/pharm auto-bill; UI not run |
| Not tested | Full UI journeys J1–J3, notifications channels, audit UI, concurrency |

---

## Critical Bugs

See [BUG_TRACKER.md](./BUG_TRACKER.md).

| ID | Sev | Title | Status |
|----|-----|-------|--------|
| BUG-001 | HIGH | Doctor 403 on IPD rounds (hospital scope denied DOCTOR) | **VERIFIED** |
| BUG-002 | MEDIUM | Missing param / wrong method returned 500 | **VERIFIED** |

---

## Security / RBAC / Data

| Check | Result |
|-------|--------|
| Wrong password → 401 | PASS |
| Doctor → `/admin/hospitals` → 403 | PASS |
| Hospital admin → `/admin/hospitals` → 403 | PASS (platform-only) |
| Doctor → reassign attending → 403 | PASS |
| Cross-patient IDOR / Hospital B | **NOT RUN** (no FE / limited time) |
| Tenant isolation deep dive | **NOT RUN** |

---

## Integration Issues

| Integration | Evidence |
|-------------|----------|
| Admit → primaryDoctorId + primaryDoctorName | PASS |
| primaryDoctorId list filter | PASS |
| Reassign updates attending | PASS |
| Doctor rounds on attending / associated doctor | **PASS** (201) |
| Lab/Pharmacy → Billing auto | Known gap G-001/G-002 — not retested |

---

## Regression Status

Automated IT: **11 skipped** (no Docker).  
API smoke: attending + doctor rounds + exception mapping **PASS** after fix retest (2026-09-15 afternoon).

---

## Technical Debt Identified

1. ~~Doctor IPD rounds 403~~ — fixed via `HospitalScopeService` ACTIVE association check.  
2. ~~500 on missing param / wrong method~~ — fixed in `GlobalExceptionHandler`.  
3. Patient search API needs documented query params (naive `q=` → 400).  
4. UI UAT still required for readiness gate “manual E2E”.

---

## Recommended Fixes Before Further Development

1. ~~BUG-001 / BUG-002~~ — done.  
2. Start frontend and execute Stories S0–S4 UI scripts.  
3. Re-run Docker-based IT when Docker Desktop engine is healthy.

## Deferred

Care-team multi-doctor; auto lab/pharm billing; native mobile nursing.

---

## Scores (this session)

| Metric | % | Basis |
|--------|--:|-------|
| OPD Readiness | 55 | Queue API OK; full walk-in UI/journey not run |
| IPD Readiness | **90** | Attending + doctor rounds API proven |
| Hospital Admin | 80 | Login, IPD ops, lists |
| Patient Portal | 20 | Not tested |
| Pharmacy | 50 | List only |
| Lab | 50 | List only |
| Security | 65 | Basic auth/RBAC probes only |
| Overall Stability (API) | **85** | |
| Overall Production Readiness | **60** | UI UAT still pending |

---

## Final recommendation

**READY FOR UI UAT**

- BUG-001 and BUG-002 are **VERIFIED** on local API.  
- **Not** ready to close full hospital simulation UAT until UI Stories S0–S4 are executed on a running frontend.
