# ECO-P5 — Check-in & notifications

| Feature ID | ECO-P5 |
| Status | **IN QA** |
| Updated | 2026-08-27 |

## Delivered

| ID | Work | Result |
|----|------|--------|
| ECO-F5.1 | Patient self check-in | `POST /scheduling/appointments/{id}/self-check-in` + appointment detail **Check in now** (V59 `opd:checkin:own`) |
| ECO-F5.2 | SMS/WhatsApp gateway | Deferred (in-app + email paths remain) |
| ECO-F5.3 | Queue approaching polish | `OPD_APPROACHING` enum reserved; token **called** already notifies via `OPD_CALLED` |
| ECO-F5.4 | Follow-up / ready notifies | `FOLLOW_UP_REMINDER` scheduler (V60); lab/pharmacy ready types already fire |

## Self check-in rules

- Permission: `opd:checkin:own` (PATIENT)
- Ownership: appointment patient must match logged-in profile
- Same calendar day (UTC) as `scheduledAt`
- Eligible statuses: `PENDING`, `CONFIRMED`, `POSTPONED`, `ARRIVED` (idempotent)
- Outcome identical to desk arrive: appointment `ARRIVED` + encounter `WAITING` + queue token

## APIs

- `POST /api/v1/scheduling/appointments/{appointmentId}/self-check-in`
- Existing: `GET /api/v1/opd/me/today` for live token status after check-in

## QA

| Check | Evidence |
|-------|----------|
| Self check-in happy path | `OpdRegistrationSelfCheckInTest.selfCheckInArrivesAndCreatesEncounterQueue` |
| Other-day reject | `selfCheckInRejectsOtherDay` |
| Ownership reject | `selfCheckInRejectsOtherPatient` |

**Defer:** QR deep-link packaging; real SMS gateway; approaching-position algorithm.

**Next:** Manual E2E self check-in → OPD today token; then ECO-P6 timeline when ready.
