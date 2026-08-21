# P2-F1-01 — Business Requirement

| Feature | P2-F1 |
| Status | APPROVED |

When a booked patient arrives at reception, staff must record arrival so the hospital sees one consistent state across **appointment**, **encounter**, and **queue**.

**Actors:** Receptionist, Hospital Admin  
**Trigger:** Patient presents for a scheduled appointment  
**Postcondition:** Appointment = ARRIVED; OPD encounter WAITING; queue token WAITING  

**Priority:** P0 | **Release:** R2
