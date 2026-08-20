# Web Portal & Route Plan

| Document ID | WEB-PLAN-001 |
| Status | DRAFT |

Stack: React 19, Vite, MUI 6, Redux, React Query.

---

## Portals

| Portal | Base route | Primary roles |
|--------|------------|---------------|
| Reception | `/reception` | RECEPTIONIST |
| Doctor | `/doctor` | DOCTOR |
| Nurse | `/nurse` | NURSE |
| Pharmacy | `/pharmacy` | PHARMACIST |
| Laboratory | `/lab` | LAB_TECHNICIAN |
| Radiology | `/radiology` | RADIOLOGY_TECHNICIAN |
| Billing | `/billing` | BILLING_EXECUTIVE, RECEPTIONIST |
| Ward | `/ward` | WARD_MANAGER, NURSE |
| IPD Admin | `/ipd` | HOSPITAL_ADMIN |
| ICU | `/icu` | ICU_NURSE, DOCTOR |
| OT | `/ot` | OT_COORDINATOR |
| Hospital Admin | `/admin/hospital` | HOSPITAL_ADMIN |
| Platform Admin | `/admin/platform` | PLATFORM_ADMIN |
| Patient | `/patient` | PATIENT |

---

## P1-F1 routes (Sprint 1)

| Route | Screen | APIs |
|-------|--------|------|
| `/reception/patients/search` | Patient search | GET search |
| `/reception/patients/new` | Registration form | POST register |
| `/reception/patients/:id` | Patient summary | GET profile |
| `/reception/patients/:id/receipt` | Registration receipt | GET receipt |

**UX:** No manual hospital UUID — scope from logged-in staff.

**States:** loading, empty search, duplicate dialog, validation errors, success receipt.

---

## P2-F5 — Billing (Sprint 7)

| Route | Screen |
|-------|--------|
| `/billing/invoices` | Invoice list |
| `/billing/invoices/:id` | Invoice detail + payment record |
| `/reception/checkout/:encounterId` | OPD checkout |

Wire to existing `/api/v1/billing/*` (V41 backend).

---

## Component strategy

- Shared: DataGrid, form controls, permission wrapper (`RequirePermission`)
- Feature folders mirror backend domains
- React Query for server state; Redux for auth/session

See phase-1 UI docs for legacy patterns; new work follows MUI 6 conventions.
