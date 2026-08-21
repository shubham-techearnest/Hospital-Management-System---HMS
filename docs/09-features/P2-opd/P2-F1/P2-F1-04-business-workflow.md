# P2-F1-04 — Business Workflow (FLOW-005)

```text
Patient arrives at reception with appointment
  → Receptionist finds appointment
  → Arrive
       → Validate status ∈ {PENDING, CONFIRMED, POSTPONED}
       → Validate no existing encounter for appointment
       → Create OPD encounter → WAITING
       → Create queue entry → WAITING + token
       → Set appointment → ARRIVED
       → Audit APPOINTMENT_ARRIVED
  → Patient waits for vitals / doctor call
```

**Failures:** Wrong hospital scope → 403; wrong status → 400; already arrived → 409.
