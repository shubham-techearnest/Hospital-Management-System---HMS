# P1-F2-02 — User Stories

| Feature | P1-F2 |
| Status | APPROVED |

---

## US-CLIN-001 — Record encounter vitals

**As a** Nurse (or Doctor), **I want** to record vitals on an open encounter, **so that** the visit has clinical baseline measurements.

**Acceptance criteria:**
- Given `clinical:vitals:write` and access to the encounter
- When I submit at least one vital value with `recordedAt`
- Then a new `clinical.vital_signs` row is created and audited with `encounterId`

**Points:** 5

---

## US-CLIN-002 — View encounter vitals history

**As a** Doctor (or Nurse/Receptionist with read), **I want** to see vitals recorded for an encounter, **so that** I can review trends during the visit.

**Acceptance criteria:**
- Given `clinical:vitals:read`
- When I GET encounter vitals
- Then rows return newest-first with BP classification when BP present

**Points:** 3

---

## US-CLIN-003 — Keep wellness vitals separate

**As a** Product Owner, **I want** patient app vitals unchanged, **so that** consumer tracking is not mixed with clinical documentation.

**Acceptance criteria:**
- `/patients/me/profile/vitals*` continues to use `patient.vital_sign_records` only
- Clinical APIs never write to that table

**Points:** 2
