# P2-F1-08 — API Design

## POST `/api/v1/scheduling/appointments/{appointmentId}/arrive`

**Permission:** `appointment:arrive` (or `opd:registration:write` for continuity)

**Body (optional):**
```json
{ "deskId": "uuid", "priority": 0 }
```

**Response 201:** same shape as OPD registration + `appointmentStatus: "ARRIVED"`

## Existing (preserved, enhanced)

`POST /api/v1/opd/registrations/check-in` — also sets ARRIVED.
