# Sprint Plan — Health360 HMS Program

| Document ID | PM-SPRINT-001 |
| Status | DRAFT |

---

## Sprint 0 — Documentation & governance

**Goal:** Approved master plan; P1-F1 docs complete; ADRs drafted.

| Workstream | Deliverables |
|------------|--------------|
| Product | Vision, scope, personas, workflows catalogue |
| Architecture | Target architecture, ADR-001…014 |
| Requirements | Epic/feature list, PAT requirements baseline |
| PM | Sprint plan, risk register, feature board, executive dashboard |
| Implementation | **None** (no V42 code) |

**DoD:** Senior review complete; NEXT-ACTION approvals listed.

---

## Sprint 1 — P1-F1 Patient Registry

**Feature:** P1-F1 — UHID + registration + duplicate detection

| Stream | Tasks |
|--------|-------|
| DB | V42 migration (after approval) |
| Backend | PatientRegistryService, search, register, duplicate engine |
| Security | `patient:registry:read\|write` permissions |
| Web | Reception patient search + register + duplicate dialog |
| QA | Integration tests, RBAC negatives |
| Docs | P1-F1 closure, API map update |

**Mobile:** Deferred

**Demo:** Reception registers patient with UHID; duplicate blocked; receipt shown.

---

## Sprint 2 — P1-F2/P1-F3 Vitals + Timeline

Encounter-scoped `clinical.vital_signs` (V43); patient clinical timeline read API.

---

## Sprint 3 — P2-F1 Appointment Arrival

POST `/appointments/{id}/arrive`; sync encounter + queue; status alignment ADR.

---

## Sprint 4 — P2-F2 Queue Skip/Recall

---

## Sprint 5 — P2-F3 Structured Consultation

---

## Sprint 6 — P2-F4 E-Prescription

V44+ prescription schema; sign workflow.

---

## Sprint 7 — P2-F5 OPD Billing UI

Wire billingApi; reception/cashier screens.

---

## Sprint 4 — P2-F2 Queue Skip/Recall

Skip/recall APIs; queue state machine; audit events; reception UI controls.

---

## Sprint 5 — P2-F3 Structured Consultation

Consultation sections on encounter; note draft; prepare immutability for sign (ADR-009).

---

## Sprint 6 — P2-F4 E-Prescription

V44 prescription schema; sign workflow; safety warnings (configurable).

---

## Sprint 7 — P2-F5 OPD Billing UI

Wire `billingApi`; invoice list/detail; reception checkout; use V41 backend.

---

## Sprint 8 — P3 Lab/Radiology Hardening

Barcode, critical alerts, billing gates (DEC-008).

---

## Sprint 9 — P3 Pharmacy Inventory

Batches, stock transactions (ADR-011).

---

## Sprint 10 — P3 Pharmacy Dispensing

Partial dispense, substitution rules.

---

## Sprint 11 — P4-F1 IPD Admission Request/Approval

Admission workflow from encounter; deposit placeholder.

---

## Sprint 12 — P4-F4 Bed Movement & Transfers

`ipd.bed_movements`; transfer UI; concurrency locks.

---

## Sprint 13 — P4-F5 Nursing Workflows

Nursing assessment; encounter vitals integration on ward.

---

## Sprint 14 — P4-F6 Doctor IPD Rounds

Web + mobile rounds; round notes on encounter.

---

## Sprint 15 — P4 MAR Mobile

Medication administration mobile flows.

---

## Sprint 16 — P4-F8 Discharge Clearance + IPD Billing

Multi-dept clearance; interim/final billing.

---

## Sprint 17 — P5 Payments

Gateway adapter (DEC-010); idempotent payment record.

---

## Sprint 18 — P5 Insurance/TPA

Claims, pre-auth (ADR-013).

---

## Sprint 19 — P5 Reports

Operational, clinical, financial dashboards.

---

## Sprint 20 — P5 Notifications

Template expansion per notification matrix.

---

## Sprint 21 — P6 Security/Compliance Hardening

Pen test fixes; audit completeness.

---

## Sprint 22 — P6 Performance + Reliability

Load test; index tuning; observability.

---

## Sprint 23 — P6 Enterprise UAT Readiness

Full regression; production readiness review; R6 release.

*Adjust after dependency review at each phase gate.*

---

## Sprint ceremony artifacts

Each sprint produces: goal, committed stories, demo script, retro notes, updated feature board.
