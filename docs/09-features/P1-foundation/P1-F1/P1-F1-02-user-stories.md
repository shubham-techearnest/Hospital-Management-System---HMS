# P1-F1-02 — User Stories

| Feature | P1-F1 |
| Status | DRAFT |

---

## US-PAT-001 — Search patient

**As a** Receptionist, **I want** to search by UHID, mobile, or name+DOB, **so that** I find existing patients quickly.

**Acceptance criteria:**
- Given `patient:registry:read` and staff hospital scope
- When I search with UHID → exact match returned
- When I search mobile → normalized E.164 match
- When I search name+DOB → ranked results
- Then results exclude other hospitals' patients (tenant scope)

**Points:** 5 | **Tasks:** BE search API, DB indexes, web search screen

---

## US-PAT-002 — Register new patient

**As a** Receptionist, **I want** to register a new patient and receive UHID, **so that** they can proceed to OPD/IPD.

**Acceptance criteria:**
- Given valid required fields and no blocking duplicate
- When I submit registration
- Then UHID assigned, hospital_registrations row created, receipt available

**Points:** 8

---

## US-PAT-003 — Duplicate detection

**As a** Receptionist, **I want** duplicate warnings, **so that** I do not create a second record for the same person.

**Acceptance criteria:**
- Given mobile exact match OR name+DOB above threshold (DEC-002)
- When I submit new registration
- Then API returns 409 with candidates; no profile created until resolved

**Points:** 8

---

## US-PAT-004 — Open existing from duplicate dialog

**As a** Receptionist, **I want** to open an existing patient from duplicate list, **so that** I continue with correct UHID.

**Acceptance criteria:**
- When I select candidate and confirm
- Then navigate to patient summary; audit DUPLICATE_RESOLVED_OPEN_EXISTING

**Points:** 3

---

## US-PAT-005 — Registration receipt

**As a** Receptionist, **I want** a printable receipt with UHID, **so that** the patient has proof of registration.

**Points:** 3
