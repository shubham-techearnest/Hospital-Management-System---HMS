# ECO-P2 — Clinical completeness (summary + wellness + follow-up)

| Feature ID | ECO-P2 |
| Status | **IN QA** |
| Updated | 2026-08-25 |

## Delivered

| ID | Work | Result |
|----|------|--------|
| ECO-F2.1 | Doctor pre-consult patient summary | Encounter-scoped summary (walk-ins); ARRIVED/POSTPONED + longer OPD-day window |
| ECO-F2.2 | Wellness plan on encounter | `clinical.encounter_wellness_plans` (V56) + GET/PUT API + doctor panel |
| ECO-F2.3 | Patient “Today’s consultation” | Visit package: Dx, Rx, plan, wellness, follow-up, orders/results |
| ECO-F2.4 | Structured follow-up | `clinical.followups` wired from wellness date (PENDING/CANCELLED); reminders stay ECO-P5 |

## APIs

- `GET /api/v1/patients/{patientId}/summary?appointmentId=` **or** `?encounterId=`
- `GET /api/v1/clinical/encounters/{id}/wellness-plan`
- `PUT /api/v1/clinical/encounters/{id}/wellness-plan`

## Exit

After consult, doctor can save diet/rest/exercise/lifestyle + follow-up date; patient sees the full digital visit package. Reminder notifications remain ECO-P5.

**Next:** ECO-P3 (hospital-first lab journey) when ready.
