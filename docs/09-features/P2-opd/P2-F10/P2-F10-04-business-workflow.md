# P2-F10-04 — Real OPD scenarios and status map

## Canonical visit (booked)

```
Patient books slot          → Appointment PENDING/CONFIRMED   (no token yet)
Desk Arrive                 → Appointment ARRIVED
                            → Encounter WAITING
                            → Queue WAITING + token
Desk Call (optional)        → Queue CALLED
Doctor Start  OR desk Start → Encounter IN_PROGRESS
                            → Queue IN_SERVICE
Doctor: vitals, FINAL note, ICD, SIGNED e-Rx, optional labs
Doctor Complete OR desk Complete
                            → Encounter COMPLETED
                            → Queue COMPLETED
                            → Appointment COMPLETED
Desk checkout               → Invoice (blocked until FINAL consult + SIGNED Rx)
Patient                    → `/patient/opd` then prescriptions / payments
```

## Walk-in (no prior booking)

Same as above from “Desk Arrive”, except appointment may be absent. If reception booked a same-day slot first, treat as booked.

## Status map (what each panel should show)

| Stage | Appointment | Encounter | Queue (token) |
|-------|-------------|-----------|----------------|
| Booked, not at hospital | PENDING / CONFIRMED | — | — |
| At desk / waiting room | ARRIVED | WAITING | WAITING |
| Name called | ARRIVED | WAITING | CALLED |
| In cabin | ARRIVED | IN_PROGRESS | IN_SERVICE |
| Consult done | COMPLETED | COMPLETED | COMPLETED |
| Visit cancelled | CANCELLED | CANCELLED | CANCELLED |

Doctor UI is encounter-first; hospital/reception UI is queue-first. After P2-F10 they stay aligned when either side moves the visit.

## Sync rules (implementation)

- Desk queue **start/complete** already updates the encounter (existing).
- Doctor **start/complete** now updates the linked queue (and appointment on complete).
- If the queue is already at the target status, sync is a no-op (avoids loops).
- Terminal queue states (COMPLETED / CANCELLED / NO_SHOW) are not overwritten by a later encounter change except matching COMPLETED/CANCELLED.

## UI entry points

| Actor | Route |
|-------|--------|
| Patient book | `/patient/book` → `/patient/book/:doctorId` |
| Patient live token | `/patient/opd` |
| Patient appointments | `/patient/appointments` |
| Reception floor | `/reception/dashboard` |
| Hospital floor | `/hospital/opd` |
| Doctor floor | `/doctor/opd` → `/doctor/encounters/:id` |
| Checkout | `/reception/checkout/:encounterId` or `/hospital/billing/checkout/:encounterId` |
