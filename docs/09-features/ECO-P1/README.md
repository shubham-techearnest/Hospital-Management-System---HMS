# ECO-P1 — Patient & desk operations polish

| Feature ID | ECO-P1 |
| Status | **IN QA** |
| Updated | 2026-08-25 |

## Delivered

| ID | Work | Result |
|----|------|--------|
| ECO-F1.1 | UHID on patient portal | Profile API `uhid`; dashboard subtitle + profile chip |
| ECO-F1.2 | Doctor–hospital schedule clarity | Booking locations return `doctorName`, `specialization`, `opdHours`; book UI shows “Dr at Hospital · branch · OPD hours” |
| ECO-F1.3 | Reception search + no duplicates | Appointment ID tab + desk-lookup API + Arrive; stronger empty-state / register duplicate copy |
| ECO-F1.4 | Hospital discovery filters | Ambulance + min rating filters on `/patient/hospitals` |

## APIs

- `GET /api/v1/scheduling/doctors/{id}/locations` — enriched response
- `GET /api/v1/scheduling/appointments/{id}/desk-lookup` — reception/hospital arrive-capable lookup

## Exit

Patient can discover → book with clear location/hours → desk can find by UHID/mobile/name/appointment ID without creating duplicates.

**Next:** ECO-P2 (patient summary + wellness plan) when ready.
