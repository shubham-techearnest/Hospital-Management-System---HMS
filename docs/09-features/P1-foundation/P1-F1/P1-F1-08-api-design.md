# P1-F1-08 — API Design

| Feature | P1-F1 |
| Status | DRAFT |
| Base path | `/api/v1/hospital/patients` |

---

## GET `/search`

**Permission:** `patient:registry:read`

**Query params:**

| Param | Required | Notes |
|-------|----------|-------|
| uhid | one of | Exact |
| mobile | one of | Normalized |
| firstName, lastName, dateOfBirth | group | Fuzzy name |
| page, size | no | Default 0, 20 |

**Response 200:**

```json
{
  "data": {
    "content": [{
      "patientId": "uuid",
      "uhid": "H360-2026-00000042",
      "legalName": "Rajesh Kumar",
      "primaryPhone": "+919876543210",
      "dateOfBirth": "1985-03-15",
      "registeredHospitals": ["uuid"]
    }],
    "totalElements": 1
  }
}
```

**Errors:** 403 forbidden scope; 422 invalid query combination

**Audit:** PATIENT_SEARCH access log

---

## POST `/register`

**Permission:** `patient:registry:write`

**Request:**

```json
{
  "legalFirstName": "Rajesh",
  "legalLastName": "Kumar",
  "dateOfBirth": "1985-03-15",
  "gender": "MALE",
  "primaryPhone": "+919876543210",
  "permanentAddressLine1": "...",
  "permanentCity": "Pune",
  "permanentState": "MH",
  "permanentPincode": "411001",
  "duplicateResolution": null
}
```

**Response 201:**

```json
{
  "data": {
    "patientId": "uuid",
    "uhid": "H360-2026-00000042",
    "hospitalRegistrationId": "uuid",
    "receiptUrl": "/api/v1/hospital/patients/{id}/registration-receipt"
  }
}
```

**Response 409 DUPLICATE_CANDIDATES:**

```json
{
  "errorCode": "DUPLICATE_CANDIDATES",
  "candidates": [{ "patientId": "...", "matchScore": 1.0, "matchReason": "MOBILE_EXACT" }]
}
```

---

## POST `/register/resolve-duplicate`

**Permission:** `patient:registry:write` (+ override permission if policy requires)

**Request:** `{ "action": "CONTINUE_NEW", "reason": "Verified different person", "ignoredCandidateIds": ["..."] }`

---

## GET `/{patientId}`

Profile summary for reception.

---

## GET `/{patientId}/registration-receipt`

HTML or JSON receipt payload for print template.

---

## Validation

- Mobile E.164 or national format normalized server-side
- DOB not in future; age 0–120
- Names trimmed, min length 2

---

## Idempotency

Optional header `Idempotency-Key` stores registration result 24h to prevent double UHID on retry.

---

## Backward compatibility

No changes to existing `/api/v1/patient/profile/*` self-service routes.
