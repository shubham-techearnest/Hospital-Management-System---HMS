# Personas — Health360 HMS

| Document ID | PROD-PERSONA-001 |
| Status | DRAFT |

---

## RECEPTIONIST

| Attribute | Detail |
|-----------|--------|
| Responsibilities | Patient search/register, appointment check-in, walk-in, token issuance |
| Goals | Fast queue, zero wrong patient, no duplicates |
| Permissions | `patient:registry:*`, `opd:queue:read`, `scheduling:*` (scoped) |
| Daily workflow | Search UHID → register if new → check-in/walk-in → print token/receipt |
| Screens | Reception dashboard, patient search, registration, queue (web) |
| Failure scenarios | Duplicate found; patient refuses mobile; network down → offline policy TBD |

---

## DOCTOR

| Attribute | Detail |
|-----------|--------|
| Responsibilities | Consultation, diagnosis, orders, prescription, IPD rounds |
| Permissions | `clinical:*`, `prescription:*`, read results |
| Screens | Doctor portal, encounter detail, IPD rounds (web + mobile phased) |

---

## NURSE

| Attribute | Detail |
|-----------|--------|
| Responsibilities | Vitals, nursing notes, MAR, assessments |
| Permissions | `clinical:vital:*`, `nursing:*`, `pharmacy:mar:*` |
| Screens | Nursing dashboard, MAR (web); mobile MAR vitals (Sprint 15+) |

---

## PHARMACIST

| Attribute | Detail |
|-----------|--------|
| Responsibilities | Verify Rx, dispense, stock |
| Permissions | `pharmacy:*` |

---

## LAB / RADIOLOGY TECHNICIAN

| Attribute | Detail |
|-----------|--------|
| Responsibilities | Sample collection, processing, results, release |
| Permissions | `lab:*`, `radiology:*` |

---

## BILLING EXECUTIVE

| Attribute | Detail |
|-----------|--------|
| Responsibilities | Invoices, payments, refunds, receipts |
| Permissions | `billing:*` — **no clinical write** |

---

## TPA / INSURANCE USER (Phase 5)

Pre-auth, claim status — `insurance:*`

---

## WARD MANAGER

Bed occupancy, transfers approval — `ipd:bed:*`, `ipd:admission:approve`

---

## HOSPITAL ADMIN

Staff, masters, subscription — existing portal

---

## PLATFORM ADMIN

Cross-hospital IAM — existing

---

## PATIENT

Appointments, results, bills — patient portal / mobile

---

Each persona maps to [RBAC matrix](../11-security/rbac-matrix.md).
