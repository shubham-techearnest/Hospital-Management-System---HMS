# Real-Life Hospital Scenarios

| Document ID | PROD-SCEN-001 |
| Status | DRAFT |

Detailed step-by-step scenarios for each flow are in [workflows-catalogue.md](./workflows-catalogue.md).

---

## Scenario A — First-time OPD patient (target state)

1. Patient arrives at reception without prior record.
2. Receptionist registers demographics → system assigns **UHID** → prints receipt.
3. Walk-in or appointment linked → **encounter** created.
4. **Queue token** issued.
5. Nurse records **encounter vitals**.
6. Doctor **consultation** → diagnosis → **e-prescription**.
7. Lab/radiology orders if needed.
8. Pharmacy dispense (Phase 3).
9. **Billing** → payment → follow-up appointment.

**Features:** P1-F1, P1-F2, P2-F1…F5, P3

---

## Scenario B — Returning patient

1. Receptionist searches **UHID** or mobile.
2. System finds patient; identity verified.
3. Appointment arrival or walk-in → encounter → queue → continues as Scenario A from step 4.

**Features:** P1-F1, P2-F1

---

## Scenario C — Possible duplicate at registration

1. Receptionist registers new patient.
2. Mobile matches existing record → **duplicate candidates** shown.
3. Receptionist opens existing patient (typical) OR admin overrides with reason (rare).

**Features:** P1-F1

---

## Scenario D — IPD admission to discharge

1. Doctor requests admission from OPD encounter.
2. Ward manager **approves**; **deposit** collected.
3. **Bed allocated**; nursing assessment; doctor **rounds**.
4. Diagnostics/pharmacy during stay; **interim billing**.
5. **Discharge clearance** (pharmacy, lab, billing).
6. **Discharge summary**; final bill; payment.

**Features:** P4-F1…F8, P5

---

## Scenario E — Emergency (deferred)

Temporary registration → emergency encounter → stabilize → merge identity → convert to OPD/IPD.

**Status:** DEC-006; feature P1-F4 TBD.

See [decisions-pending-approval.md](../13-project-management/decisions-pending-approval.md).
