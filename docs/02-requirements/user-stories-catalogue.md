# User Stories Catalogue (Master)

| Document ID | REQ-US-001 |
| Status | DRAFT |

---

## Patient Registry (EPIC-02)

### US-PAT-001
**As a** Receptionist,  
**I want to** search for an existing patient using UHID, mobile, or name+DOB,  
**So that** I can avoid creating duplicate records.

**Acceptance criteria:**
- Given I am authenticated as RECEPTIONIST with `patient:registry:read`
- When I search with at least one criterion
- Then I receive a paginated list within 2s (NFR)
- And results are scoped to my hospital/tenant

**Feature:** P1-F1 | **Points:** 5 | **Sprint:** 1

---

### US-PAT-002
**As a** Receptionist,  
**I want to** register a new hospital patient and receive a UHID,  
**So that** the patient has a permanent identifier for all future visits.

**Acceptance criteria:**
- Given no blocking duplicate (or override audited)
- When I submit valid registration
- Then system assigns UHID and returns receipt payload
- And audit log records REGISTRATION_CREATED

**Feature:** P1-F1 | **Points:** 8 | **Sprint:** 1

---

### US-PAT-003
**As a** Receptionist,  
**I want to** see possible duplicate candidates when registering,  
**So that** I can open an existing patient instead of creating a duplicate.

**Acceptance criteria:**
- Given mobile or name+DOB matches existing profile above threshold
- When registration is submitted
- Then system returns DUPLICATE_CANDIDATES without creating profile
- Unless user confirms CONTINUE_NEW with reason (audited)

**Feature:** P1-F1 | **Points:** 8 | **Sprint:** 1

---

## OPD (EPIC-04) — samples; full set in Phase 2 package

### US-OPD-001
**As a** Receptionist,  
**I want to** mark an appointment as ARRIVED and create queue entry,  
**So that** the patient enters today's OPD queue.

**Feature:** P2-F1 | **Sprint:** 3

---

*Stories follow Given/When/Then; each links to FR IDs in traceability matrix.*
