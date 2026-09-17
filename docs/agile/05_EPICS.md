# 05 — Epics (Phase D Draft)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-EPIC-001 |
| **Status** | DRAFT — Phase D |
| **Last Updated** | 2026-09-17 |
| **Parent** | [04_THEMES.md](./04_THEMES.md) |

Feature group IDs are stable; feature lists live in [07_FEATURE_CATALOG.md](./07_FEATURE_CATALOG.md).

---

## Epics detail

### EPIC-IAM-001 — Authentication & Session Security

| Field | Value |
|-------|-------|
| **Theme** | THM-001 |
| **Goal** | Sign-in, registration, verification, MFA, password reset, and session lifecycle for all actors. |
| **Feature groups** | FG-IAM-AUTH · FG-IAM-ACCT |

### EPIC-IAM-002 — RBAC & Role Portal Access

| Field | Value |
|-------|-------|
| **Theme** | THM-001 |
| **Goal** | Assign the 12 IAM roles, enforce permissions, and route users into the correct portal. |
| **Feature groups** | FG-IAM-RBAC · FG-IAM-SCOPE |

### EPIC-PLT-001 — Multi-tenant Platform Foundation

| Field | Value |
|-------|-------|
| **Theme** | THM-001 |
| **Goal** | Shared tenant model, hospital scoping, and platform health/audit primitives. |
| **Feature groups** | FG-PLT-TEN · FG-PLT-AUDIT |

---

### EPIC-PUB-001 — Public Discovery & Onboarding Funnel

| Field | Value |
|-------|-------|
| **Theme** | THM-002 |
| **Goal** | Marketing surfaces, public doctor/hospital profiles, and access/demo onboarding requests. |
| **Feature groups** | FG-PUB-LAND · FG-PUB-ONB |

### EPIC-PAT-001 — Patient Account & Personal Health Record

| Field | Value |
|-------|-------|
| **Theme** | THM-002 |
| **Goal** | Patient profile, consent, vitals/health views, encounters/records, and self-service care status. |
| **Feature groups** | FG-PAT-PROF · FG-PAT-HLTH · FG-PAT-CARE |

### EPIC-SEA-001 — Search & Location Discovery

| Field | Value |
|-------|-------|
| **Theme** | THM-002 |
| **Goal** | Unified doctor/hospital search and location-assisted discovery. |
| **Feature groups** | FG-SEA-DOC · FG-SEA-HOS · FG-SEA-LOC |

### EPIC-SCH-001 — Scheduling & Availability

| Field | Value |
|-------|-------|
| **Theme** | THM-002 |
| **Goal** | Doctor schedules, slots, appointment lifecycle signals used by OPD booking paths. |
| **Feature groups** | FG-SCH-SLOT · FG-SCH-APPT |

### EPIC-DOC-001 — Doctor Practice Presence

| Field | Value |
|-------|-------|
| **Theme** | THM-002 |
| **Goal** | Doctor profile, verification, hospital associations, and doctor ambulatory/IPD work surfaces. |
| **Feature groups** | FG-DOC-PROF · FG-DOC-WORK |

---

### EPIC-HOS-001 — Hospital Organization & Staffing

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | Hospital profile, branches, departments, facilities/gallery, doctor roster, and staff invites. |
| **Feature groups** | FG-HOS-ORG · FG-HOS-STAFF · FG-HOS-CAT |

### EPIC-RCV-001 — Front Desk & Patient Registry

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | Receptionist registry (UHID), OPD desk/display, and checkout handoff. |
| **Feature groups** | FG-RCV-REG · FG-RCV-DESK |

### EPIC-OPD-001 — OPD Encounter Lifecycle

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | OPD requests, queue, check-in, encounter creation, and status across patient/doctor/hospital. |
| **Feature groups** | FG-OPD-REQ · FG-OPD-QUE · FG-OPD-ENC |

### EPIC-CLN-001 — Clinical Documentation & Orders

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | Encounter notes, vitals, prescriptions, wellness plans, and clinical order placement into ancillaries. |
| **Feature groups** | FG-CLN-NOTE · FG-CLN-ORD · FG-CLN-RX |

### EPIC-IPD-001 — Inpatient Admission Lifecycle

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | Admission requests, beds, meds/diagnostics, payer context, discharge, and post-discharge. |
| **Feature groups** | FG-IPD-ADM · FG-IPD-BED · FG-IPD-CARE · FG-IPD-DC |

### EPIC-ICU-001 — ICU Stay Management

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | ICU stays, isolation links to IPD/OT, and ICU nurse monitoring portal. |
| **Feature groups** | FG-ICU-STAY · FG-ICU-NUR |

### EPIC-NUR-001 — Ward Nursing & MAR

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | Ward board, admission nursing view, medication administration record, and nurse My Work. |
| **Feature groups** | FG-NUR-WRD · FG-NUR-MAR |

### EPIC-ED-001 — Emergency & ADT

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | ED board and ADT movements connecting emergency to inpatient flow. |
| **Feature groups** | FG-ED-BRD · FG-ED-ADT |

### EPIC-LAB-001 — Laboratory Operations

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | Lab catalog, worklist, sample/order lifecycle for lab technicians and hospital oversight. |
| **Feature groups** | FG-LAB-CAT · FG-LAB-WRK |

### EPIC-RAD-001 — Radiology Operations

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | Imaging catalog, worklist, and order detail for radiology technicians. |
| **Feature groups** | FG-RAD-CAT · FG-RAD-WRK |

### EPIC-OT-001 — Operation Theatre Coordination

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | OT catalog, procedures, implants, and anesthesia charting. |
| **Feature groups** | FG-OT-CAT · FG-OT-PROC |

### EPIC-PHA-001 — Pharmacy Operations

| Field | Value |
|-------|-------|
| **Theme** | THM-003 |
| **Goal** | Pharmacy catalog, medication orders, dispense worklist, and pharmacy requests. |
| **Feature groups** | FG-PHA-CAT · FG-PHA-WRK · FG-PHA-REQ |

---

### EPIC-BIL-001 — Invoices & Payments

| Field | Value |
|-------|-------|
| **Theme** | THM-004 |
| **Goal** | Encounter/admission invoicing, reception checkout, patient payments, and online payment intents. |
| **Feature groups** | FG-BIL-INV · FG-BIL-PAY |

### EPIC-BIL-002 — Charge Engine

| Field | Value |
|-------|-------|
| **Theme** | THM-004 |
| **Goal** | Automated/manual charge capture with invoice source linkage and exception handling. |
| **Feature groups** | FG-BIL-CHG · FG-BIL-XCP |

### EPIC-INS-001 — Insurance & TPA

| Field | Value |
|-------|-------|
| **Theme** | THM-004 |
| **Goal** | Insurance/TPA case handling tied to hospital revenue workflows. |
| **Feature groups** | FG-INS-TPA |

---

### EPIC-INV-001 — Consumable Inventory

| Field | Value |
|-------|-------|
| **Theme** | THM-005 |
| **Goal** | Stock items, movements, and hospital inventory visibility. |
| **Feature groups** | FG-INV-STK |

### EPIC-PRC-001 — Procurement

| Field | Value |
|-------|-------|
| **Theme** | THM-005 |
| **Goal** | PR/PO/GRN-style procurement flow for hospital supply. |
| **Feature groups** | FG-PRC-PO |

### EPIC-AST-001 — Enterprise Asset Management

| Field | Value |
|-------|-------|
| **Theme** | THM-005 |
| **Goal** | Clinical/non-clinical asset register and asset-manager portal. |
| **Feature groups** | FG-AST-REG · FG-AST-PRT |

### EPIC-FAC-001 — Facility Operations

| Field | Value |
|-------|-------|
| **Theme** | THM-005 |
| **Goal** | Facility work orders / ops board for hospital plant & infrastructure. |
| **Feature groups** | FG-FAC-WO |

### EPIC-BLD-001 — Blood Bank

| Field | Value |
|-------|-------|
| **Theme** | THM-005 |
| **Goal** | Blood bank inventory and request/issue workflows. |
| **Feature groups** | FG-BLD-BNK |

---

### EPIC-STO-001 — Staff Operations

| Field | Value |
|-------|-------|
| **Theme** | THM-006 |
| **Goal** | Roster/leave and staff operational coordination for hospitals. |
| **Feature groups** | FG-STO-ROST |

### EPIC-AUT-001 — Automation, Tasks & Approvals

| Field | Value |
|-------|-------|
| **Theme** | THM-006 |
| **Goal** | Event → task generation, My Work queues, and approval workflows. |
| **Feature groups** | FG-AUT-EVT · FG-AUT-TASK · FG-AUT-APPR |

### EPIC-CC-001 — Command Center

| Field | Value |
|-------|-------|
| **Theme** | THM-006 |
| **Goal** | Cross-module operational command center for hospital leadership. |
| **Feature groups** | FG-CC-OPS |

### EPIC-PRED-001 — Predictive Operations

| Field | Value |
|-------|-------|
| **Theme** | THM-006 |
| **Goal** | Heuristic predictive ops insights for capacity/ops signals. |
| **Feature groups** | FG-PRED-INS |

---

### EPIC-ADM-001 — Platform Administration

| Field | Value |
|-------|-------|
| **Theme** | THM-007 |
| **Goal** | Platform admin console for users, hospitals, doctor verification, reviews, onboarding queue. |
| **Feature groups** | FG-ADM-USR · FG-ADM-HOS · FG-ADM-VFY · FG-ADM-REV |

### EPIC-SUB-001 — Subscription & Feature Entitlements

| Field | Value |
|-------|-------|
| **Theme** | THM-007 |
| **Goal** | Plans, hospital subscriptions, SaaS invoicing, and feature enforcement. |
| **Feature groups** | FG-SUB-PLAN · FG-SUB-ENT |

### EPIC-ORG-001 — Partner Organizations

| Field | Value |
|-------|-------|
| **Theme** | THM-007 |
| **Goal** | Partner organization registry and admin partner management. |
| **Feature groups** | FG-ORG-PTR |

---

### EPIC-MOB-001 — Mobile Experience

| Field | Value |
|-------|-------|
| **Theme** | THM-008 |
| **Goal** | Expo mobile consumer/staff shells with auth and push token support. |
| **Feature groups** | FG-MOB-CON · FG-MOB-STF |

### EPIC-PLT-002 — Dashboards & Analytics

| Field | Value |
|-------|-------|
| **Theme** | THM-008 |
| **Goal** | Role dashboards and analytics/metrics surfaces across portals. |
| **Feature groups** | FG-PLT-DSH · FG-PLT-ANL |

### EPIC-CLN-002 — Clinical Documents & Letterhead

| Field | Value |
|-------|-------|
| **Theme** | THM-008 |
| **Goal** | Printable clinical documents, categories, and hospital letterhead. |
| **Feature groups** | FG-CLN-DOC |

---

## Epic index by theme

| Theme | Epics |
|-------|-------|
| THM-001 | EPIC-IAM-001, EPIC-IAM-002, EPIC-PLT-001 |
| THM-002 | EPIC-PUB-001, EPIC-PAT-001, EPIC-SEA-001, EPIC-SCH-001, EPIC-DOC-001 |
| THM-003 | EPIC-HOS-001, EPIC-RCV-001, EPIC-OPD-001, EPIC-CLN-001, EPIC-IPD-001, EPIC-ICU-001, EPIC-NUR-001, EPIC-ED-001, EPIC-LAB-001, EPIC-RAD-001, EPIC-OT-001, EPIC-PHA-001 |
| THM-004 | EPIC-BIL-001, EPIC-BIL-002, EPIC-INS-001 |
| THM-005 | EPIC-INV-001, EPIC-PRC-001, EPIC-AST-001, EPIC-FAC-001, EPIC-BLD-001 |
| THM-006 | EPIC-STO-001, EPIC-AUT-001, EPIC-CC-001, EPIC-PRED-001 |
| THM-007 | EPIC-ADM-001, EPIC-SUB-001, EPIC-ORG-001 |
| THM-008 | EPIC-MOB-001, EPIC-PLT-002, EPIC-CLN-002 |
