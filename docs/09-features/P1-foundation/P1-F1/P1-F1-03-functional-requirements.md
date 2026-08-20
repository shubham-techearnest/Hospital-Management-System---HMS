# P1-F1-03 — Functional Requirements

| Feature | P1-F1 |
| Status | DRAFT |

---

## PAT-REQ-001 — UHID assignment

| Field | Detail |
|-------|--------|
| Description | System assigns unique UHID on successful hospital registration |
| Business reason | Permanent hospital identity |
| Actor | System |
| Preconditions | Registration approved; DEC-001 resolved |
| Trigger | Successful POST register |
| Postconditions | `uhid` persisted; unique per tenant |
| Data | `patient_profiles.uhid`, `uhid_sequences` |
| API | POST register response includes uhid |
| Priority | P0 |

**Acceptance:** Two concurrent registrations get distinct UHIDs; retry safe.

---

## PAT-REQ-002 — Universal search

| Field | Detail |
|-------|--------|
| Actor | Receptionist |
| Trigger | GET search with query params |
| Main flow | Validate scope → query indexes → paginate |
| Alt | No results → empty list |
| Exception | Invalid params → 422 |
| API | GET `/hospital/patients/search` |
| Security | `patient:registry:read` + hospital scope |

---

## PAT-REQ-003 — Duplicate detection

| Field | Detail |
|-------|--------|
| Trigger | POST register |
| Main flow | Score candidates → if block threshold met → 409 |
| Alt | User POST resolve-duplicate with reason → create with audit |
| Exception | Override without permission → 403 |
| Audit | DUPLICATE_CANDIDATES, DUPLICATE_OVERRIDE |

---

## PAT-REQ-004 — Hospital registration record

Link patient to hospital/branch in `patient.hospital_registrations` with `registered_by`, timestamp.

---

## PAT-REQ-005 — Registration receipt

Return structured receipt: hospital name, UHID, patient name, date, registration id. PDF optional phase 1 (HTML print sufficient).

---

## Non-functional

| ID | Requirement |
|----|-------------|
| NFR-P1-F1-01 | Search p95 < 2s for 100k profiles/tenant |
| NFR-P1-F1-02 | Registration transactional (all-or-nothing) |
| NFR-P1-F1-03 | PHI access logged |
