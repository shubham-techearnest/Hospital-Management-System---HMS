# P2-F1-06 — Architecture Design

## Decision

Enhance `OpdRegistrationService.checkInAppointment` to set appointment `ARRIVED` after successful encounter+queue creation.

Add `AppointmentArrivalService` + `POST /scheduling/appointments/{id}/arrive` that delegates to the same OPD registration path (single source of truth).

## State alignment (as-built names)

```text
Appointment: PENDING | CONFIRMED | POSTPONED → ARRIVED
Encounter:   REGISTERED → WAITING (existing)
Queue:       WAITING (existing)
```

Note: Docs previously used BOOKED for appointments; implementation uses PENDING/CONFIRMED (slot is BOOKED).
