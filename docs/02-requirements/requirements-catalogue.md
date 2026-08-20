# Requirements Catalogue (Master)

| Document ID | REQ-CAT-001 |
| Status | DRAFT |

Prefix convention: `{DOMAIN}-REQ-{nnn}`

---

## Patient (PAT)

| ID | Title | Priority | Phase | Status |
|----|-------|----------|-------|--------|
| PAT-REQ-001 | System shall assign unique UHID per patient per approved scope | P0 | 1 | DRAFT |
| PAT-REQ-002 | Reception shall search patient by UHID, mobile, name, DOB | P0 | 1 | DRAFT |
| PAT-REQ-003 | System shall detect possible duplicates before new registration | P0 | 1 | DRAFT |
| PAT-REQ-004 | Reception shall resolve duplicate (open existing / continue new) with audit | P0 | 1 | DRAFT |
| PAT-REQ-005 | System shall print/display registration receipt with UHID | P1 | 1 | DRAFT |
| PAT-REQ-006 | Emergency/temporary registration without full demographics | P1 | 1 | DEFERRED |

---

## OPD (OPD)

| ID | Title | Priority | Phase | Status |
|----|-------|----------|-------|--------|
| OPD-REQ-001 | Appointment shall support ARRIVED status aligned to encounter/queue | P0 | 2 | DRAFT |
| OPD-REQ-002 | Queue shall support skip and recall with audit | P1 | 2 | DRAFT |
| OPD-REQ-003 | Encounter-scoped vitals capture at OPD | P0 | 1 | DRAFT |
| OPD-REQ-004 | Structured consultation sections (CC, HPI, exam, plan) | P0 | 2 | DRAFT |
| OPD-REQ-005 | OPD billing UI connected to invoice API | P0 | 2 | DRAFT |

---

## IPD (IPD)

| ID | Title | Priority | Phase | Status |
|----|-------|----------|-------|--------|
| IPD-REQ-001 | Admission request from clinical encounter | P0 | 4 | DRAFT |
| IPD-REQ-002 | Admission approval workflow | P0 | 4 | DRAFT |
| IPD-REQ-003 | BedMovement record on every transfer | P0 | 4 | DRAFT |
| IPD-REQ-004 | Concurrency-safe bed allocation | P0 | 4 | DRAFT |
| IPD-REQ-005 | Discharge multi-dept clearance | P0 | 4 | DRAFT |

---

## Prescription (RX)

| ID | Title | Priority | Phase | Status |
|----|-------|----------|-------|--------|
| RX-REQ-001 | E-prescription linked to encounter | P0 | 2 | DRAFT |
| RX-REQ-002 | Prescription sign/immutability | P0 | 2 | DRAFT |
| RX-REQ-003 | Allergy/duplicate/interaction warnings (configurable severity) | P0 | 2 | DRAFT |

---

## Pharmacy (PHARM)

| ID | Title | Priority | Phase | Status |
|----|-------|----------|-------|--------|
| PHARM-REQ-001 | Medicine batch with expiry | P0 | 3 | DRAFT |
| PHARM-REQ-002 | Stock transaction (no negative stock) | P0 | 3 | DRAFT |
| PHARM-REQ-003 | Partial dispensing | P1 | 3 | DRAFT |

---

## Billing (BILL)

| ID | Title | Priority | Phase | Status |
|----|-------|----------|-------|--------|
| BILL-REQ-001 | Invoice from encounter with line items | P0 | 2 | PARTIAL (backend) |
| BILL-REQ-002 | Payment gateway integration | P0 | 5 | DRAFT |
| BILL-REQ-003 | Refund with audit | P0 | 5 | DRAFT |

*Full requirement templates (preconditions, flows, acceptance) live in feature packages (e.g. P1-F1-03).*

See [traceability-matrix.md](./traceability-matrix.md).
