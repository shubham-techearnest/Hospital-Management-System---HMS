# P1-F1-10 — Audit & Compliance

| Feature | P1-F1 |
| Status | DRAFT |

---

## Events

| Event | When | Payload |
|-------|------|---------|
| PATIENT_SEARCH | Successful search | query type (not full PHI in log), result count, actor, hospital |
| REGISTRATION_CREATED | New profile | patient_id, uhid, hospital_id, branch_id |
| UHID_ASSIGNED | UHID allocated | patient_id, uhid, sequence_year, value |
| DUPLICATE_CANDIDATES_SHOWN | 409 returned | candidate ids, scores, input hash |
| DUPLICATE_OVERRIDE | Continue new | reason, actor, candidate ids |
| HOSPITAL_REGISTRATION_LINKED | Existing patient registered at new hospital | registration_id |

---

## Fields (all events)

who (user_id), when (timestamp), where (hospital/branch), correlation_id, ip (if available)

---

## Compliance notes

- Duplicate override reason mandatory (min 10 chars)
- Retention: 7 years (configurable)
- Right to access: patient can request registration history (future patient portal)

---

## Immutability

UHID never changed after assignment; profile merge is future feature with separate audit chain.
