# Health360 HMS — NEXT ACTION

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-NEXT-001 |
| **Status** | **ACTIVE** |
| **Last Updated** | 2026-08-31 |

---

## CURRENT STATUS

**ECO-P3–P4 RELEASED · ECO-P0–P2, P5–P6 AUTOMATED QA PASSED · ECO-P7 PARTNER E2E MANUAL**

**OPD walk-in flow optimized:** staff scope API, reception auto-location, checkout gate aligned, golden-path integration test.

---

## IMMEDIATE NEXT ACTION

1. **Restart API** (Flyway V63 applied; circular dependency fixed)
2. **Manual UI golden path:** Reception walk-in → doctor finish consult → reception checkout → invoice
3. **ECO-P7 manual:** Partner lab book (PathCare) + pharmacy send (MedPlus) from patient app
4. Optional: Partner staff worklists (F7.4 deferred)

See [ECO-QA-SIGNOFF.md](../09-features/ECO-QA-SIGNOFF.md) for automated test matrix.

---

## Recent

| Item | Status | Date |
|------|--------|------|
| OPD walk-in golden path test + flow UX | DONE | 2026-08-31 |
| Staff `/me/scope` + reception auto hospital | DONE | 2026-08-31 |
| V63 staff backfill + reception clinical access | DONE | 2026-08-28 |
| ECO-P7 Partner lab/pharmacy orgs (ADR-016) | IN QA (automated passed) | 2026-08-27 |
| ECO-P6 Timeline & document center | PASSED (automated) | 2026-08-31 |
| ECO-P5 Check-in & notifications | PASSED (automated) | 2026-08-31 |
