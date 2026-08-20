# P1-F1-04 — Business Workflow

| Feature | P1-F1 |
| Flow ID | FLOW-001, FLOW-002 |
| Status | DRAFT |

---

## FLOW-001 — Patient Registration

```text
START
  → Receptionist login (staff scope auto)
  → "Visited before?"
       YES → [Search workflow]
       NO  → [Registration workflow]
  → [Registration workflow]
       → Fill form (name, DOB, gender, mobile, address...)
       → Submit
       → Duplicate check
            MATCH → Show candidates
                 → Open Existing → END (patient selected)
                 → Continue New (reason) → Admin override if needed
            NO MATCH → Create profile + UHID + hospital_registration
       → Show receipt
  → Optional: create appointment / walk-in encounter (P2 — out of P1-F1 scope)
END
```

---

## FLOW-002 — Duplicate Detection

**Inputs:** mobile, legal name, DOB

**Scoring (draft — pending DEC-002):**
- Mobile exact match → score 1.0 → **BLOCK**
- Name fuzzy + DOB exact → score ≥ 0.85 → **BLOCK**
- Name fuzzy only → score ≥ 0.92 → **WARN** (optional)

**Output:** List `{ patientId, uhid, name, mobile, dob, matchScore, matchReason }`

---

## Failure cases

| Case | Behavior |
|------|----------|
| Network error | Retry; no partial UHID consumed (transaction rollback) |
| Sequence exhaustion | Alert ops; fail registration with 503 |
| Unauthorized role | 403 |
| Cross-hospital access attempt | 403 |

---

## Emergency

Emergency registration (FLOW-003) **out of scope** — refer DEC-006.

---

## Audit events

REGISTRATION_CREATED, UHID_ASSIGNED, DUPLICATE_CANDIDATES_SHOWN, DUPLICATE_OVERRIDE, PATIENT_SEARCH (access log)
