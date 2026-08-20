# Product Vision — Health360 HMS

| Document ID | PROD-VISION-001 |
| Status | DRAFT |
| Last Updated | 2026-08-20 |

---

## What we are building

**Health360 HMS** is a production-grade **hospital operating platform** that unifies:

- **Outpatient (OPD)** — registration through billing and follow-up
- **Inpatient (IPD)** — admission through discharge with bed, nursing, and clinical care
- **Diagnostics & pharmacy** — orders, fulfillment, inventory, safety
- **Financial** — billing, payments, insurance (phased)

on a **single longitudinal patient record** and an **encounter-centric clinical hub**.

---

## Why

Hospitals need one system where:

- Reception identifies patients **once** (UHID) and never creates silent duplicates
- OPD flow is **fast, traceable, and billable**
- IPD bed and clinical care is **safe, auditable, and concurrent-correct**
- Doctors, nurses, and departments share the **same patient truth**
- Management sees **operational and financial** visibility

Health360 already has a strong **modular monolith** and **encounter hub** (audit confirmed). This program **extends** it to full hospital-grade OPD/IPD requirements — without rewrite.

---

## Core domain principle

```text
Patient (one record)
 ├── OPD episodes     → clinical.encounters + opd.queue_entries
 └── IPD episodes     → clinical.encounters + ipd.admissions
```

**PatientVisit = `clinical.encounters`** — preserved, not duplicated.

---

## OPD vision (target)

```text
Search/Register (UHID)
 → Appointment or Walk-in
 → Arrival
 → Queue & Token
 → Vitals (encounter-scoped)
 → Consultation (structured EMR)
 → Diagnosis
 → Prescription (e-Rx + safety)
 → Lab / Radiology
 → Results
 → Pharmacy
 → Billing & Payment
 → Follow-up / Referral
 → Closure
```

---

## IPD vision (target)

```text
Admission request (from OPD/consultation)
 → Approval
 → Deposit / verification
 → Bed allocation (concurrency-safe)
 → Nursing assessment & vitals
 → Doctor rounds & orders
 → Diagnostics & MAR
 → Interim billing
 → Discharge planning
 → Multi-dept clearance
 → Discharge summary
 → Bed release
```

---

## Emergency vision (target)

```text
Emergency/temporary registration
 → Emergency encounter
 → Stabilization & treatment
 → Identity merge / UHID assignment
 → Convert to OPD or IPD
```

---

## Who uses it

See [personas.md](./personas.md).

---

## Success measures (program level)

| Measure | Target |
|---------|--------|
| Duplicate patient rate at registration | Near zero with explicit override audit |
| OPD end-to-end (register → paid invoice) | Single system, no manual DB steps |
| IPD bed double-allocation | Zero (DB + transaction enforced) |
| Clinical note tampering after sign | Prevented by versioning/immutability (Phase 2+) |
| RBAC violations in pen test | Zero critical on patient/clinical/financial APIs |

---

## What we are NOT doing (see scope doc)

- Rewriting to microservices
- Migrating web to Next.js or mobile to Flutter
- Replacing `clinical.encounters` with a new visit table

See [product-scope.md](./product-scope.md).
