# ADR-IPD-003 — IPD operational metrics & role dashboards

| Field | Value |
|-------|--------|
| Status | Accepted |
| Date | 2026-09-08 |
| Phase | I9 |

## Context

Phase I needs role-aware IPD visibility (admin / doctor / nurse) without a separate BI stack. Occupancy, ALOS, bed turnaround, discharge delay, and auth delay must be computable from existing IPD tables.

## Decision

1. **Single API:** Extend `GET /api/v1/ipd/dashboard` (`IpdDashboardResponse`) with bed mix, occupancy %, open requests, active discharge orders, and 30-day averages (LOS, turnaround, discharge delay, auth delay) plus discharge/readmit counts.
2. **Computation:** Aggregate in `DashboardService` over a fixed 30-day window using existing entities (admissions, beds cleaning timestamps, discharge orders, payer authorizations). No separate warehouse.
3. **UI:** Shared `IpdOpsMetricsPanel` on hospital dashboard, hospital IPD, doctor IPD, and nursing dashboard — reuse `DashboardStatsGrid` only.
4. **Mobile nursing:** `IPD_MOBILE_NURSING` gates messaging / compact vs full metrics; charting remains the responsive web ward + MAR + admission chart (no parallel native charting module in I9).
5. **Performance:** Flyway `V87` indexes for discharged-at, bed cleaning, discharge orders, payer decided-at, open requests.

## Consequences

- Metrics are approximate operational KPIs, not billed/regulatory reports.
- Empty windows return `null` averages (UI shows —).
- Full OPD→IPD E2E automation and formal security audit remain follow-ups documented in PHASE-I notes.
