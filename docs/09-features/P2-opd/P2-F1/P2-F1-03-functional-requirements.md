# P2-F1-03 — Functional Requirements

| ID | Title | Priority |
|----|-------|----------|
| OPD-REQ-001 | System shall support appointment status ARRIVED | P0 |
| OPD-REQ-002 | Arrive shall create encounter + queue in one transaction | P0 |
| OPD-REQ-003 | Eligible statuses: PENDING, CONFIRMED, POSTPONED | P0 |
| OPD-REQ-004 | Duplicate arrive (existing encounter) returns 409 | P0 |
| OPD-REQ-005 | Existing check-in API shall also set ARRIVED | P0 |
| OPD-REQ-006 | Additive POST /scheduling/appointments/{id}/arrive | P0 |

**NFR:** Transactional; hospital-scoped; audited.
