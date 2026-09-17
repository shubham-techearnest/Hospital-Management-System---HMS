# 07 — Feature Catalog (Phase D Draft)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-FEAT-001 |
| **Status** | DRAFT — Phase D + Phase C overlay |
| **Last Updated** | 2026-09-17 |
| **Scope** | Capability-level features only (~100); not screen-level backlog |
| **Parents** | [04_THEMES.md](./04_THEMES.md) · [05_EPICS.md](./05_EPICS.md) · [06_FEATURE_GROUPS.md](./06_FEATURE_GROUPS.md) |
| **Status overlay** | [evidence/FEATURE_STATUS_OVERLAY.md](./evidence/FEATURE_STATUS_OVERLAY.md) **wins** over inline UNKNOWN for listed IDs |

**Status rule:** Inline table defaults remain `UNKNOWN` until individually updated. **Authoritative verified statuses** for Phase C–checked features live in the overlay (do not invent upgrades).

---

## Feature group → candidate features

### FG-IAM-AUTH — Authentication & MFA

| ID | Short name | Status |
|----|------------|--------|
| FEAT-IAM-AUTH-001 | JWT login & refresh | UNKNOWN |
| FEAT-IAM-AUTH-002 | Password reset & email verification | UNKNOWN |
| FEAT-IAM-AUTH-003 | MFA TOTP challenge | UNKNOWN |

### FG-IAM-ACCT — Account lifecycle

| ID | Short name | Status |
|----|------------|--------|
| FEAT-IAM-ACCT-001 | Patient self-registration | UNKNOWN |
| FEAT-IAM-ACCT-002 | Account settings & notifications prefs | UNKNOWN |
| FEAT-IAM-ACCT-003 | Patient portal invite completion | UNKNOWN |

### FG-IAM-RBAC — Roles & permissions

| ID | Short name | Status |
|----|------------|--------|
| FEAT-IAM-RBAC-001 | Twelve-role RBAC model | UNKNOWN |
| FEAT-IAM-RBAC-002 | Permission-seeded method security | UNKNOWN |
| FEAT-IAM-RBAC-003 | Post-login role portal routing | UNKNOWN |

### FG-IAM-SCOPE — Hospital / tenant scope

| ID | Short name | Status |
|----|------------|--------|
| FEAT-IAM-SCOPE-001 | Hospital-scoped staff authorization | UNKNOWN |

### FG-PLT-TEN — Multi-tenant foundation

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PLT-TEN-001 | Multi-tenant hospital isolation | UNKNOWN |

### FG-PLT-AUDIT — Platform audit & health

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PLT-AUDIT-001 | Admin audit log browse | UNKNOWN |
| FEAT-PLT-AUDIT-002 | Platform health endpoint | UNKNOWN |

---

### FG-PUB-LAND — Public marketing & profiles

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PUB-LAND-001 | Consumer & hospital landing pages | UNKNOWN |
| FEAT-PUB-LAND-002 | Public doctor & hospital profiles | UNKNOWN |

### FG-PUB-ONB — Access & demo onboarding

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PUB-ONB-001 | Doctor access request | UNKNOWN |
| FEAT-PUB-ONB-002 | Hospital demo / onboarding request | UNKNOWN |

### FG-PAT-PROF — Patient profile & consent

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PAT-PROF-001 | Patient profile hub | UNKNOWN |
| FEAT-PAT-PROF-002 | Consent gate | UNKNOWN |

### FG-PAT-HLTH — Vitals & health insights

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PAT-HLTH-001 | Vitals capture & history | UNKNOWN |
| FEAT-PAT-HLTH-002 | Health score, timeline & lab values | UNKNOWN |

### FG-PAT-CARE — Patient care self-service

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PAT-CARE-001 | OPD request & status | UNKNOWN |
| FEAT-PAT-CARE-002 | Encounter list & detail | UNKNOWN |
| FEAT-PAT-CARE-003 | Prescriptions & health documents | UNKNOWN |
| FEAT-PAT-CARE-004 | Patient IPD stay view | UNKNOWN |
| FEAT-PAT-CARE-005 | Patient payments view | UNKNOWN |

### FG-SEA-DOC — Doctor search

| ID | Short name | Status |
|----|------------|--------|
| FEAT-SEA-DOC-001 | Doctor search & booking profile | UNKNOWN |

### FG-SEA-HOS — Hospital search

| ID | Short name | Status |
|----|------------|--------|
| FEAT-SEA-HOS-001 | Hospital & unified search | UNKNOWN |

### FG-SEA-LOC — Location services

| ID | Short name | Status |
|----|------------|--------|
| FEAT-SEA-LOC-001 | Location-assisted discovery | UNKNOWN |

### FG-SCH-SLOT — Doctor schedule slots

| ID | Short name | Status |
|----|------------|--------|
| FEAT-SCH-SLOT-001 | Doctor schedule management | UNKNOWN |

### FG-SCH-APPT — Appointment lifecycle

| ID | Short name | Status |
|----|------------|--------|
| FEAT-SCH-APPT-001 | Appointment lifecycle & reminders | UNKNOWN |

### FG-DOC-PROF — Doctor profile & verification

| ID | Short name | Status |
|----|------------|--------|
| FEAT-DOC-PROF-001 | Doctor profile management | UNKNOWN |
| FEAT-DOC-PROF-002 | Doctor verification submission | UNKNOWN |
| FEAT-DOC-PROF-003 | Doctor–hospital associations | UNKNOWN |

### FG-DOC-WORK — Doctor clinical work surfaces

| ID | Short name | Status |
|----|------------|--------|
| FEAT-DOC-WORK-001 | Doctor OPD workbench | UNKNOWN |
| FEAT-DOC-WORK-002 | Doctor IPD admissions | UNKNOWN |
| FEAT-DOC-WORK-003 | Doctor My Work queue | UNKNOWN |

---

### FG-HOS-ORG — Hospital org structure

| ID | Short name | Status |
|----|------------|--------|
| FEAT-HOS-ORG-001 | Hospital profile | UNKNOWN |
| FEAT-HOS-ORG-002 | Branches & departments | UNKNOWN |
| FEAT-HOS-ORG-003 | Facilities & gallery | UNKNOWN |

### FG-HOS-STAFF — Hospital staff management

| ID | Short name | Status |
|----|------------|--------|
| FEAT-HOS-STAFF-001 | Staff invite & role assignment | UNKNOWN |
| FEAT-HOS-STAFF-002 | Doctor roster | UNKNOWN |

### FG-HOS-CAT — Clinical catalogs

| ID | Short name | Status |
|----|------------|--------|
| FEAT-HOS-CAT-001 | Clinical / diagnosis / IPD service catalogs | UNKNOWN |

### FG-RCV-REG — Patient registry (UHID)

| ID | Short name | Status |
|----|------------|--------|
| FEAT-RCV-REG-001 | Hospital patient search & register | UNKNOWN |
| FEAT-RCV-REG-002 | UHID patient detail & receipt | UNKNOWN |

### FG-RCV-DESK — Reception OPD desk

| ID | Short name | Status |
|----|------------|--------|
| FEAT-RCV-DESK-001 | Reception desk & display board | UNKNOWN |
| FEAT-RCV-DESK-002 | Reception checkout handoff | UNKNOWN |

### FG-OPD-REQ — OPD care requests

| ID | Short name | Status |
|----|------------|--------|
| FEAT-OPD-REQ-001 | Patient OPD request intake | UNKNOWN |

### FG-OPD-QUE — OPD queue operations

| ID | Short name | Status |
|----|------------|--------|
| FEAT-OPD-QUE-001 | Queue ops & patient self check-in | UNKNOWN |

### FG-OPD-ENC — OPD encounters

| ID | Short name | Status |
|----|------------|--------|
| FEAT-OPD-ENC-001 | OPD encounter create & lifecycle | UNKNOWN |
| FEAT-OPD-ENC-002 | Hospital OPD operations board | UNKNOWN |

### FG-CLN-NOTE — Encounter documentation

| ID | Short name | Status |
|----|------------|--------|
| FEAT-CLN-NOTE-001 | Structured notes, wellness plans & reviews | UNKNOWN |
| FEAT-CLN-NOTE-002 | Clinical vital signs in encounter | UNKNOWN |

### FG-CLN-ORD — Clinical orders

| ID | Short name | Status |
|----|------------|--------|
| FEAT-CLN-ORD-001 | Lab / imaging / medication order placement | UNKNOWN |

### FG-CLN-RX — Prescriptions

| ID | Short name | Status |
|----|------------|--------|
| FEAT-CLN-RX-001 | Clinical prescriptions | UNKNOWN |

### FG-IPD-ADM — IPD admission requests

| ID | Short name | Status |
|----|------------|--------|
| FEAT-IPD-ADM-001 | IPD admission request & role views | UNKNOWN |

### FG-IPD-BED — Bed & ward management

| ID | Short name | Status |
|----|------------|--------|
| FEAT-IPD-BED-001 | Enterprise bed & ward board | UNKNOWN |

### FG-IPD-CARE — IPD meds & diagnostics

| ID | Short name | Status |
|----|------------|--------|
| FEAT-IPD-CARE-001 | IPD meds, diagnostics, isolation & payer | UNKNOWN |

### FG-IPD-DC — Discharge & post-discharge

| ID | Short name | Status |
|----|------------|--------|
| FEAT-IPD-DC-001 | Enterprise discharge | UNKNOWN |
| FEAT-IPD-DC-002 | Post-discharge follow-up | UNKNOWN |

### FG-ICU-STAY — ICU stay management

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ICU-STAY-001 | ICU stay board (hospital) | UNKNOWN |

### FG-ICU-NUR — ICU nurse portal

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ICU-NUR-001 | ICU nurse stay monitoring | UNKNOWN |

### FG-NUR-WRD — Ward nursing board

| ID | Short name | Status |
|----|------------|--------|
| FEAT-NUR-WRD-001 | Ward board & admission nursing view | UNKNOWN |
| FEAT-NUR-WRD-002 | Nursing My Work | UNKNOWN |

### FG-NUR-MAR — Medication administration

| ID | Short name | Status |
|----|------------|--------|
| FEAT-NUR-MAR-001 | MAR worklist & administration | UNKNOWN |

### FG-ED-BRD — Emergency department board

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ED-BRD-001 | ED / emergency board | UNKNOWN |

### FG-ED-ADT — ADT movements

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ED-ADT-001 | ADT admit / transfer / discharge events | UNKNOWN |

### FG-LAB-CAT — Lab catalog

| ID | Short name | Status |
|----|------------|--------|
| FEAT-LAB-CAT-001 | Lab test catalog | UNKNOWN |

### FG-LAB-WRK — Lab worklist & orders

| ID | Short name | Status |
|----|------------|--------|
| FEAT-LAB-WRK-001 | Lab worklist & order detail | UNKNOWN |
| FEAT-LAB-WRK-002 | Sample / specimen handling | UNKNOWN |

### FG-RAD-CAT — Radiology catalog

| ID | Short name | Status |
|----|------------|--------|
| FEAT-RAD-CAT-001 | Imaging catalog | UNKNOWN |

### FG-RAD-WRK — Imaging worklist & orders

| ID | Short name | Status |
|----|------------|--------|
| FEAT-RAD-WRK-001 | Radiology worklist & order detail | UNKNOWN |

### FG-OT-CAT — OT catalog

| ID | Short name | Status |
|----|------------|--------|
| FEAT-OT-CAT-001 | OT procedure catalog | UNKNOWN |

### FG-OT-PROC — OT procedures & charts

| ID | Short name | Status |
|----|------------|--------|
| FEAT-OT-PROC-001 | OT procedures, implants & anesthesia | UNKNOWN |

### FG-PHA-CAT — Pharmacy catalog

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PHA-CAT-001 | Pharmacy medication catalog | UNKNOWN |

### FG-PHA-WRK — Pharmacy dispense worklist

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PHA-WRK-001 | Medication order worklist & detail | UNKNOWN |

### FG-PHA-REQ — Pharmacy requests

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PHA-REQ-001 | Pharmacy requests queue | UNKNOWN |

---

### FG-BIL-INV — Invoices

| ID | Short name | Status |
|----|------------|--------|
| FEAT-BIL-INV-001 | Hospital invoice list & detail | UNKNOWN |

### FG-BIL-PAY — Payments

| ID | Short name | Status |
|----|------------|--------|
| FEAT-BIL-PAY-001 | Encounter checkout payments | UNKNOWN |
| FEAT-BIL-PAY-002 | Razorpay online payment intents | UNKNOWN |

### FG-BIL-CHG — Charge engine

| ID | Short name | Status |
|----|------------|--------|
| FEAT-BIL-CHG-001 | Charge capture engine | UNKNOWN |
| FEAT-BIL-CHG-002 | Charge → invoice source linkage | UNKNOWN |

### FG-BIL-XCP — Charge exceptions

| ID | Short name | Status |
|----|------------|--------|
| FEAT-BIL-XCP-001 | Charge exception handling | UNKNOWN |

### FG-INS-TPA — Insurance / TPA

| ID | Short name | Status |
|----|------------|--------|
| FEAT-INS-TPA-001 | Insurance / TPA case ops | UNKNOWN |

---

### FG-INV-STK — Consumable stock

| ID | Short name | Status |
|----|------------|--------|
| FEAT-INV-STK-001 | Consumable inventory management | UNKNOWN |

### FG-PRC-PO — Procurement cycle

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PRC-PO-001 | PR / PO / GRN procurement | UNKNOWN |

### FG-AST-REG — Asset register

| ID | Short name | Status |
|----|------------|--------|
| FEAT-AST-REG-001 | Enterprise asset register | UNKNOWN |

### FG-AST-PRT — Asset manager portal

| ID | Short name | Status |
|----|------------|--------|
| FEAT-AST-PRT-001 | Asset manager portal | UNKNOWN |

### FG-FAC-WO — Facility work orders

| ID | Short name | Status |
|----|------------|--------|
| FEAT-FAC-WO-001 | Facility work-order ops | UNKNOWN |

### FG-BLD-BNK — Blood bank ops

| ID | Short name | Status |
|----|------------|--------|
| FEAT-BLD-BNK-001 | Blood bank inventory & requests | UNKNOWN |

---

### FG-STO-ROST — Staff roster & leave

| ID | Short name | Status |
|----|------------|--------|
| FEAT-STO-ROST-001 | Staff roster & leave ops | UNKNOWN |

### FG-AUT-EVT — Automation events

| ID | Short name | Status |
|----|------------|--------|
| FEAT-AUT-EVT-001 | Domain event → automation triggers | UNKNOWN |

### FG-AUT-TASK — Task / My Work queues

| ID | Short name | Status |
|----|------------|--------|
| FEAT-AUT-TASK-001 | Cross-role My Work / task queues | UNKNOWN |

### FG-AUT-APPR — Approvals

| ID | Short name | Status |
|----|------------|--------|
| FEAT-AUT-APPR-001 | Approval workflow actions | UNKNOWN |

### FG-CC-OPS — Command center ops

| ID | Short name | Status |
|----|------------|--------|
| FEAT-CC-OPS-001 | Hospital command center | UNKNOWN |

### FG-PRED-INS — Predictive insights

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PRED-INS-001 | Heuristic predictive ops insights | UNKNOWN |

---

### FG-ADM-USR — Admin user management

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ADM-USR-001 | Platform user administration | UNKNOWN |

### FG-ADM-HOS — Admin hospital management

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ADM-HOS-001 | Platform hospital administration | UNKNOWN |
| FEAT-ADM-HOS-002 | Onboarding request queue | UNKNOWN |

### FG-ADM-VFY — Doctor verification queue

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ADM-VFY-001 | Doctor verification review | UNKNOWN |

### FG-ADM-REV — Review moderation

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ADM-REV-001 | Encounter / provider review moderation | UNKNOWN |

### FG-SUB-PLAN — Subscription plans

| ID | Short name | Status |
|----|------------|--------|
| FEAT-SUB-PLAN-001 | Plan catalog administration | UNKNOWN |
| FEAT-SUB-PLAN-002 | Hospital subscription management | UNKNOWN |

### FG-SUB-ENT — Feature entitlements

| ID | Short name | Status |
|----|------------|--------|
| FEAT-SUB-ENT-001 | Subscription feature enforcement | UNKNOWN |

### FG-ORG-PTR — Partner organizations

| ID | Short name | Status |
|----|------------|--------|
| FEAT-ORG-PTR-001 | Partner organization registry | UNKNOWN |

---

### FG-MOB-CON — Consumer mobile

| ID | Short name | Status |
|----|------------|--------|
| FEAT-MOB-CON-001 | Patient mobile auth & core flows | UNKNOWN |
| FEAT-MOB-CON-002 | Device push tokens | UNKNOWN |

### FG-MOB-STF — Staff mobile shells

| ID | Short name | Status |
|----|------------|--------|
| FEAT-MOB-STF-001 | Staff mobile shell access | UNKNOWN |

### FG-PLT-DSH — Role dashboards

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PLT-DSH-001 | Multi-role operational dashboards | UNKNOWN |

### FG-PLT-ANL — Analytics & metrics

| ID | Short name | Status |
|----|------------|--------|
| FEAT-PLT-ANL-001 | Analytics / metrics surfaces | UNKNOWN |

### FG-CLN-DOC — Clinical document print

| ID | Short name | Status |
|----|------------|--------|
| FEAT-CLN-DOC-001 | Clinical document print center | UNKNOWN |
| FEAT-CLN-DOC-002 | Hospital letterhead | UNKNOWN |

---

## Counts

| Level | Count |
|-------|------:|
| Themes | 8 |
| Epics | 38 |
| Feature groups | 76 |
| Features | **112** |

All features: **Status = UNKNOWN** (Phase D draft).

---

## Evidence anchors (not status claims)

| Area | Code evidence |
|------|---------------|
| Roles (12) | `AppRole` / Flyway IAM seeds |
| Portals | `router.tsx` RoleRoute mounts |
| Packages | `com.health360.*` modular monolith |
| Schema | Flyway `V1`–`V104` (tip: onboarding requests) |
