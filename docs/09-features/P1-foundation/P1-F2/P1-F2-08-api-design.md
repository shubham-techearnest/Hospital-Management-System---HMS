# P1-F2-08 — API Design

| Feature | P1-F2 |
| Status | IMPLEMENTED |
| Base path | `/api/v1/clinical/encounters/{encounterId}/vitals` |

---

## POST `/`

**Permission:** `clinical:vitals:write`

**Request:**

```json
{
  "systolicBp": 120,
  "diastolicBp": 80,
  "heartRate": 72,
  "temperature": 36.8,
  "respiratoryRate": 16,
  "spo2": 98,
  "bloodGlucose": null,
  "glucoseReadingType": null,
  "notes": "Pre-consult",
  "recordedAt": "2026-08-21T10:30:00Z"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "vitalSignId": "uuid",
    "encounterId": "uuid",
    "systolicBp": 120,
    "diastolicBp": 80,
    "heartRate": 72,
    "temperature": 36.8,
    "respiratoryRate": 16,
    "spo2": 98,
    "bloodGlucose": null,
    "glucoseReadingType": null,
    "notes": "Pre-consult",
    "recordedAt": "2026-08-21T10:30:00Z",
    "bpClassification": "NORMAL",
    "bpInterpretation": "..."
  }
}
```

**Errors:** 400 validation; 403; 404 encounter

---

## GET `/`

**Permission:** `clinical:vitals:read`

**Response 200:** `{ "success": true, "data": [ /* newest first */ ] }`

---

## Backward compatibility

No changes to `/api/v1/patients/me/profile/vitals*`.
