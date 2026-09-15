# Health360 Test Session Report — 2026-09-15

| Field | Value |
|-------|-------|
| Session | QA-API-SMOKE-001 |
| Executor | Agent Test Lead |
| API | `http://localhost:8080` (started for this session) |
| Frontend | **Down** — UI stories not executed |
| DB | Local PostgreSQL 16 (`health360_db`) |
| Password used (seed) | `SecureP@ss1!` |

## What was executed

1. Started backend with `SPRING_PROFILES_ACTIVE=local`.  
2. Ran API smoke script → [API_SMOKE_RAW.json](./API_SMOKE_RAW.json).  
3. Follow-up probes: HA nursing round, billing+branchId, hospital appointments path.  
4. Attempted Maven ITs → all **skipped** (Docker client invalid for Testcontainers) → [LAST_IT_RUN.log](./LAST_IT_RUN.log).

## Story status (honest)

| Story | UI execution | API / evidence | Overall |
|-------|--------------|----------------|---------|
| S0 Hospital setup | BLOCKED (no FE) | Platform list hospitals PASS; seed hospital used | **PARTIAL** |
| S1 Rahul OPD | BLOCKED | OPD queue list PASS only | **BLOCKED** |
| S2 Priya Lab/Pharm/Bill | BLOCKED | Lab/Pharm list PASS; billing list PASS | **BLOCKED** |
| S3 Amit IPD + attending | BLOCKED UI | Admit/attending/filter/reassign/discharge **PASS**; doctor round **FAIL** | **PARTIAL** |
| S4 RBAC | PARTIAL API | Wrong pw, doctor admin deny, doctor reassign deny **PASS** | **PARTIAL** |

## Attending doctor feature — verdict

| Check | Result |
|-------|--------|
| Admit without `primaryDoctorId` → 400 | PASS |
| Admit with attending → 201 + `primaryDoctorName` | PASS |
| Filter admissions by attending | PASS |
| Admin PATCH reassign | PASS |
| Doctor cannot PATCH reassign | PASS |
| Attending doctor can POST DOCTOR round | **FAIL** (403) BUG-001 |

## Next actions for human tester

1. Fix BUG-001, restart API.  
2. `npm run dev` frontend.  
3. Execute [HEALTH360_STORY_BASED_MANUAL_TEST_SCRIPT.md](./HEALTH360_STORY_BASED_MANUAL_TEST_SCRIPT.md) S0→S4 and fill Actual/Result cells.  
4. Update this report after UI pass.
