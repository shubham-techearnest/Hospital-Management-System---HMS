# ECO-P6 — Unified timeline & health dashboard

| Feature ID | ECO-P6 |
| Status | **IN QA** |
| Updated | 2026-08-27 |

## Delivered

| ID | Work | Result |
|----|------|--------|
| ECO-F6.1 | Journey timeline | `GET /patients/me/journey-timeline` — appointment → queue → clinical → Rx → lab → pharmacy; Timeline page **Care journey** |
| ECO-F6.2 | Lab + vitals trends | Dashboard `recentLabTrend` (Hb, HbA1c, LDL) + existing vitals trends |
| ECO-F6.3 | Document center | Categories `INVOICE`/`CERTIFICATE` (V61); `GET /patients/me/document-center` merges uploads + signed Rx + released labs + invoices |

## APIs

- `GET /api/v1/patients/me/journey-timeline`
- `GET /api/v1/patients/me/document-center?category=`
- Existing: `GET /api/v1/analytics/patients/me/dashboard` (+ `recentLabTrend`)

## QA

| Check | Evidence |
|-------|----------|
| Journey booked event | `JourneyTimelineServiceTest.journeyIncludesBookedAppointment` |
| Main compile | `mvn -DskipTests compile` |

**Defer:** PDF download for system-linked docs; QR packaging of journey share.

**Next:** Manual E2E on Timeline + Document center; then ECO-P7 multi-org when ready.
