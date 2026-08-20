# Real-Life Workflow Catalogue

| Document ID | PROD-FLOW-CAT-001 |
| Status | DRAFT |

Maps to FLOW-001 … FLOW-041. Status reflects **target** vs **as-built**.

| Flow ID | Name | As-built status | Target phase |
|---------|------|-----------------|--------------|
| FLOW-001 | Patient Registration | PARTIAL | P1-F1 |
| FLOW-002 | Duplicate Patient Detection | MISSING | P1-F1 |
| FLOW-003 | Emergency Registration | MISSING | P1-F4 (TBD) |
| FLOW-004 | Appointment Booking | IMPLEMENTED | — |
| FLOW-005 | Appointment Arrival | PARTIAL | P2-F1 |
| FLOW-006 | OPD Walk-in | IMPLEMENTED | — |
| FLOW-007 | OPD Queue | PARTIAL | P2-F2 |
| FLOW-008 | Vitals (encounter) | MISSING | P1-F2 |
| FLOW-009 | Doctor Consultation | PARTIAL | P2-F3 |
| FLOW-010 | Diagnosis | IMPLEMENTED | extend |
| FLOW-011 | E-Prescription | MISSING | P2-F4 |
| FLOW-012 | Prescription Safety | MISSING | P2-F4 |
| FLOW-013 | Laboratory | PARTIAL | P3 |
| FLOW-014 | Radiology | PARTIAL | P3 |
| FLOW-015 | Pharmacy Dispensing | PARTIAL | P3 |
| FLOW-016 | OPD Billing | PARTIAL | P2-F5 |
| FLOW-017 | OPD Follow-up | PARTIAL | P2 |
| FLOW-018 | Referral | MISSING | P2 |
| FLOW-019 | IPD Admission Request | MISSING | P4-F1 |
| FLOW-020 | IPD Approval | MISSING | P4-F1 |
| FLOW-021 | Deposit | MISSING | P4-F2 |
| FLOW-022 | Bed Allocation | PARTIAL | P4-F3 |
| FLOW-023 | Bed Transfer | MISSING | P4-F4 |
| FLOW-024 | Nursing Assessment | PARTIAL | P4-F5 |
| FLOW-025 | Doctor Rounds | PARTIAL | P4-F6 |
| FLOW-026 | Medication Administration | PARTIAL | P4 |
| FLOW-027 | IPD Diagnostics | IMPLEMENTED | reuse |
| FLOW-028 | IPD Pharmacy | PARTIAL | P3/P4 |
| FLOW-029 | Interim Billing | MISSING | P4-F7 |
| FLOW-030 | Discharge Clearance | MISSING | P4-F8 |
| FLOW-031 | Discharge Summary | PARTIAL | P4-F8 |
| FLOW-032 | LAMA | MISSING | P5 |
| FLOW-033 | DAMA | MISSING | P5 |
| FLOW-034 | Death Case | MISSING | P5 |
| FLOW-035 | MLC | MISSING | P5 |
| FLOW-036 | Insurance/TPA | MISSING | P5 |
| FLOW-037 | Refund | MISSING | P5 |
| FLOW-038 | Payment Gateway | MISSING | P5 |
| FLOW-039 | Reports | PARTIAL | P5 |
| FLOW-040 | Notifications | PARTIAL | P5 |
| FLOW-041 | Audit | PARTIAL | all phases |

---

## FLOW-001 — Patient Registration (detailed scenario)

**Actors:** Receptionist, Patient

1. Receptionist: *"Have you visited before?"*
2. **YES** → Search UHID / mobile / name + DOB ([P1-F1](../09-features/P1-foundation/P1-F1/P1-F1-04-business-workflow.md))
3. Match found → open patient; verify identity
4. Possible duplicate on new register → system shows candidates; receptionist chooses **Open Existing** or **Continue New** (audited)
5. **NO** → Registration form → system assigns **UHID** → print receipt
6. Proceed to appointment or walk-in → creates **encounter** → queue token

**Failure:** No match but patient insists existing → supervisor override (future).

**Audit:** REGISTRATION_CREATED, UHID_ASSIGNED, DUPLICATE_OVERRIDE (if any).

See P1-F1 workflow doc for full specification.
