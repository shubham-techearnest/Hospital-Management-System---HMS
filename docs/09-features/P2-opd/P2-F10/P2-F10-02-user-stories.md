# P2-F10-02 — User stories (connected OPD)

## US-OPD-110 — Patient books OPD from their portal

**As a** patient with an ACTIVE portal login,  
**I want to** search a doctor and book an OPD slot myself,  
**so that** I do not have to phone reception for a routine visit.

**Acceptance criteria:**

- Given I am logged in as PATIENT
- When I open Find a doctor (`/patient/book`) and confirm a slot
- Then an appointment is created (`PENDING` or `CONFIRMED` per hospital rules)
- And I can see it under Appointments
- And I do **not** yet have a token (token is issued only after desk arrive / walk-in)

**Points:** 5

---

## US-OPD-111 — Reception (or hospital desk) puts the patient on today’s floor

**As a** receptionist,  
**I want to** either check in a booked appointment or register a walk-in,  
**so that** the patient gets a token and enters the live queue.

**Acceptance criteria:**

- Booked path: Arrive / check-in → appointment **ARRIVED**, encounter **WAITING**, queue **WAITING** + token
- Walk-in path: find-or-register → encounter **WAITING**, queue **WAITING** + token (no appointment, or a same-day slot if desk booked one)
- I can Call (queue **CALLED**) and Skip/Recall
- I assign the consulting doctor if not already set — otherwise the doctor cannot see the visit on Today’s OPD

**Points:** 8

---

## US-OPD-112 — Doctor starts consult; desk and patient see it immediately

**As a** doctor,  
**I want** Start consultation to mean the patient is in my cabin,  
**so that** reception and hospital OPD stop showing them as still waiting.

**Acceptance criteria:**

- Given queue is WAITING or CALLED and encounter is WAITING
- When I POST `/clinical/encounters/{id}/start`
- Then encounter becomes **IN_PROGRESS**
- And the linked queue becomes **IN_SERVICE** (even if desk never pressed Start)
- And hospital `/hospital/opd` and reception dashboard show **IN_SERVICE** on the next poll (and after refetch)
- And the patient `/patient/opd` token shows consultation in progress

**Points:** 8

---

## US-OPD-113 — Doctor completes consult; checkout can proceed

**As a** doctor,  
**I want** Complete encounter to close the floor visit,  
**so that** reception knows the patient is ready for billing (after consult + e-Rx).

**Acceptance criteria:**

- When I complete the encounter
- Then encounter **COMPLETED**, queue **COMPLETED**, linked appointment **COMPLETED** if still open
- Reception/hospital Complete is optional (desk can still close if the doctor forgot)
- Checkout remains blocked until FINAL consultation note and SIGNED e-prescription (existing gate)

**Points:** 5

---

## US-OPD-114 — Hospital admin tracks the same queue as reception

**As a** hospital administrator,  
**I want** `/hospital/opd` to show the same token status as reception,  
**so that** I can staff the floor without a second source of truth.

**Acceptance criteria:**

- Same `GET /opd/queue` payload as reception
- Queue chip and consult (encounter) chip both visible
- Doctor-driven start/complete updates that payload

**Points:** 3

---

## US-OPD-115 — Role work is assigned, status is shared

**As** any OPD actor,  
**I want** to know what I am supposed to do next,  
**so that** we do not double-work or stall the patient.

| Role | Owns | Watches |
|------|------|---------|
| Patient | Book slot, arrive at desk, follow token, pay after invoice | Appointment until arrive; then token + encounter |
| Reception | Find/register, book for walk-ins, arrive, call/skip, checkout/bill | Queue + encounter + appointment |
| Doctor | Start/complete consult, vitals, note, ICD, e-Rx, labs | Encounter (+ token) |
| Hospital admin | Desks, staffing, same queue as reception, override Complete if needed | Queue + encounter |

**Points:** 3
