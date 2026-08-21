# P2-F1-02 — User Stories

## US-OPD-001 — Mark appointment arrived

**As a** Receptionist,  
**I want to** mark an appointment as arrived in one action,  
**so that** the patient enters today's OPD queue and appointment status matches reality.

**Acceptance criteria:**
- Given appointment status is PENDING, CONFIRMED, or POSTPONED
- When I call Arrive (or Check-in)
- Then appointment status becomes ARRIVED
- And an OPD encounter is created in WAITING
- And a queue entry is created with a token
- And a second arrive fails with conflict

**Points:** 8 | **Sprint:** 3
