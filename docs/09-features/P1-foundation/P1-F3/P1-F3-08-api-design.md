# P1-F3-08 — API Design

## GET `/api/v1/clinical/patients/{patientId}/timeline`

**Permission:** `clinical:timeline:read`

**Query:** `page`, `size` (default 0, 20)

**Response 200:**

```json
{
  "success": true,
  "data": {
    "content": [{
      "eventId": "encounterId:ENCOUNTER_REGISTERED",
      "eventType": "ENCOUNTER_REGISTERED",
      "summary": "OPD encounter OPD-2026-0001 registered",
      "occurredAt": "...",
      "encounterId": "uuid",
      "encounterNumber": "OPD-2026-0001",
      "referenceType": "Encounter",
      "referenceId": "uuid",
      "metadata": { "status": "REGISTERED", "encounterType": "OPD" }
    }],
    "totalElements": 12,
    "totalPages": 1,
    "number": 0,
    "size": 20
  }
}
```

## GET `/api/v1/patients/me/clinical-timeline`

**Permission:** `patient:profile:read` (+ consent)

Same payload shape for the authenticated patient.
