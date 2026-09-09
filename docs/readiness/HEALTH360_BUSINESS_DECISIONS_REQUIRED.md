# Health360 Business Decisions Required

| Document | HEALTH360-BIZ-001 |
| Date | 2026-09-09 |

These decisions are **not** silently invented by engineering. They do **not** block starting manual E2E testing with current behavior, but they affect how gaps G-001/G-002 and UHID semantics should be completed later.

---

## BD-001 — UHID scope

| Field | Content |
|-------|---------|
| Question | Is UHID global (tenant-wide) or hospital-specific? |
| Current implementation | Tenant-global UHID via `PatientUhidAssignmentService` / DEC-001 (V42) |
| Options | (A) Keep tenant-global one UHID per person (B) Hospital-local MRN + global UHID (C) Hospital-only UHID |
| Recommended | (A) or (B) with hospital MRN alias if multi-hospital identity needed |
| Impact | Search, duplicates, portal display, desk registration |
| Affected modules | Patient registry, OPD, IPD, portal |

---

## BD-002 — Lab/Pharmacy charge timing

| Field | Content |
|-------|---------|
| Question | When should lab/pharmacy charges hit the invoice? |
| Current implementation | Manual invoice creation; enums `LAB_ORDER` / `MEDICATION_ORDER` exist but unused by services |
| Options | (A) On order placement (B) On sample collect / dispense (C) On result verification / full dispense (D) Manual only |
| Recommended | Lab: (B) or (C); Pharmacy: (B) on dispense with partial-line support |
| Impact | Gaps G-001, G-002; Patient 2 financial completeness |
| Affected modules | Lab, Pharmacy, Billing, OPD checkout, IPD charges |

---

## BD-003 — Partial pharmacy dispensing

| Field | Content |
|-------|---------|
| Question | Can pharmacists partially dispense and bill remaining later? |
| Current implementation | Dispense flow exists; billing not auto-linked — behavior needs product lock |
| Options | (A) Full dispense only (B) Partial with open Rx status (C) Partial + proportional charge |
| Recommended | (B) + charge on dispensed qty (align with BD-002) |
| Impact | Pharmacy UX, inventory, billing |
| Affected modules | Pharmacy, Billing, Prescription status |

---

## BD-004 — Multi-hospital doctors

| Field | Content |
|-------|---------|
| Question | May one doctor practice at multiple hospitals with separate schedules/fees? |
| Current implementation | Doctor–hospital mapping exists; assume multi-map supported in data model |
| Options | (A) Single hospital only (B) Multi-hospital with per-hospital schedule/fee |
| Recommended | (B) if already modeled |
| Impact | Scheduling, appointments, RBAC scope |
| Affected modules | Doctor, Scheduling, Appointments |

---

## BD-005 — Bed reservation expiry

| Field | Content |
|-------|---------|
| Question | Do reserved beds expire automatically? |
| Current implementation | Reserve/cleaning statuses in I2; expiry policy unclear |
| Options | (A) No auto-expiry (B) Timed expiry + notify (C) Manual release only |
| Recommended | (B) for realism; (C) acceptable for UAT |
| Impact | Bed board contention |
| Affected modules | IPD facility, admission desk |

---

## BD-006 — Who may edit clinical data

| Field | Content |
|-------|---------|
| Question | Can nurses amend doctor notes / diagnoses; can reception edit clinical fields? |
| Current implementation | Role-separated chart surfaces; exact field-level matrix needs confirmation in UAT |
| Options | Document per-field matrix by role |
| Recommended | Doctors own diagnosis/orders; nurses own vitals/MAR/nursing notes; reception non-clinical |
| Impact | Security UAT, malpractice risk |
| Affected modules | OPD, IPD chart, RBAC |
