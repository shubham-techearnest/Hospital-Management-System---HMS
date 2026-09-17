# Feature Inventory (Evidence-Based)

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-FEAT-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Created** | 2026-09-16 |

Status values: `NOT_STARTED` · `PLANNED` · `PARTIALLY_IMPLEMENTED` · `IMPLEMENTED` · `COMPLETED` · `DEPRECATED` · `UNKNOWN`

Legend for columns: Web / API / DB / Mobile / Tests / Docs.

---

## Core platform

| ID | Feature | Web | API | DB | Mobile | Tests | Docs | Current | Evidence |
|----|---------|-----|-----|----|--------|-------|------|---------|----------|
| F-IAM-001 | Auth JWT + refresh | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | AuthController, mobile Auth |
| F-IAM-002 | RBAC permissions | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | IMPLEMENTED | V2 seeds, @PreAuthorize |
| F-IAM-003 | MFA TOTP | UNKNOWN | PARTIAL | IMPLEMENTED | UNKNOWN | UNKNOWN | PARTIAL | PARTIALLY_IMPLEMENTED | V77 |
| F-TEN-001 | Multi-tenant + hospital scope | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | IMPLEMENTED | BaseAuditableEntity |
| F-SUB-001 | Subscription plans/features | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | IMPLEMENTED | V26–V28, V70 |
| F-ADM-001 | Platform admin portals | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | IMPLEMENTED | Admin* controllers |

## Patient / doctor / hospital

| ID | Feature | Web | API | DB | Mobile | Tests | Docs | Current | Evidence |
|----|---------|-----|-----|----|--------|-------|------|---------|----------|
| F-PAT-001 | Patient profile & consent | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | patient package |
| F-PAT-002 | Vitals / analytics | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | analytics |
| F-DOC-001 | Doctor profile & verification | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | doctor package |
| F-HOS-001 | Hospital org profile/branches | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | IMPLEMENTED | hospital package |
| F-SCH-001 | Appointments / scheduling | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | IMPLEMENTED | scheduling |
| F-SEA-001 | Search / public profiles | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | IMPLEMENTED | search, public |

## Clinical HMS

| ID | Feature | Web | API | DB | Mobile | Tests | Docs | Current | Evidence |
|----|---------|-----|-----|----|--------|-------|------|---------|----------|
| F-OPD-001 | OPD queue & desk | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | IMPLEMENTED | opd V31+ |
| F-ENC-001 | Clinical encounters | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | IMPLEMENTED | clinical V30 |
| F-IPD-001 | IPD admit/transfer/discharge | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | PARTIAL | IMPLEMENTED | IMPLEMENTED | ipd |
| F-ICU-001 | ICU stays | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | IMPLEMENTED | icu |
| F-LAB-001 | Laboratory | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | IMPLEMENTED | laboratory |
| F-RAD-001 | Radiology | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | IMPLEMENTED | radiology |
| F-OT-001 | Operation theatre | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | IMPLEMENTED | ot |
| F-PHA-001 | Pharmacy clinical + dispense | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | IMPLEMENTED | IMPLEMENTED | pharmacy |
| F-NUR-001 | Nursing / MAR portals | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | UNKNOWN | PARTIAL | PARTIALLY_IMPLEMENTED | nursing FE |
| F-ED-001 | Emergency + ADT | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V91 |
| F-DOCX-001 | Clinical documents/letterhead | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | PARTIAL | IMPLEMENTED | documents V89 |

## Revenue / supply / assets / ops

| ID | Feature | Web | API | DB | Mobile | Tests | Docs | Current | Evidence |
|----|---------|-----|-----|----|--------|-------|------|---------|----------|
| F-BIL-001 | Invoices & payments | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | PARTIAL | PARTIAL | IMPLEMENTED | billing V41 |
| F-BIL-002 | Razorpay online pay | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | PARTIAL | UNKNOWN | PARTIAL | IMPLEMENTED | V73 |
| F-CHG-001 | Charge engine | PARTIAL | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | PARTIALLY_IMPLEMENTED | V92–V93, V103; DRY_RUN |
| F-INV-001 | Consumable inventory | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V94 |
| F-PRC-001 | Procurement PR/PO/GRN | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V95 |
| F-AST-001 | Asset / EAM | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | PARTIAL | IMPLEMENTED | IMPLEMENTED | V88, V96 |
| F-FAC-001 | Facility work orders | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V97 |
| F-INS-001 | Insurance / TPA | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V98 |
| F-BLD-001 | Blood bank | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V99 |
| F-STO-001 | Staff ops roster/leave | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V100 |

## Automation / intelligence

| ID | Feature | Web | API | DB | Mobile | Tests | Docs | Current | Evidence |
|----|---------|-----|-----|----|--------|-------|------|---------|----------|
| F-AUT-001 | Events → tasks / My Work | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | PARTIAL | IMPLEMENTED | IMPLEMENTED | V90 |
| F-AUT-002 | Approvals | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | PARTIAL | IMPLEMENTED | ApprovalController |
| F-CC-001 | Command Center | IMPLEMENTED | IMPLEMENTED | PARTIAL | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V101 |
| F-PRED-001 | Predictive insights (heuristic) | IMPLEMENTED | IMPLEMENTED | IMPLEMENTED | NOT_STARTED | UNKNOWN | IMPLEMENTED | IMPLEMENTED | V102 |
| F-AI-001 | AI clinical assistance | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | PLANNED | NOT_STARTED | Vision only |

## Long-term vision (not implemented)

| ID | Feature | Current | Evidence |
|----|---------|---------|----------|
| F-AMB-001 | Ambulance operations | NOT_STARTED | No package |
| F-HOME-001 | Home nursing / homecare | NOT_STARTED | No package |
| F-PHY-001 | Physiotherapy module | NOT_STARTED | No package |
| F-TEL-001 | Full telemedicine product | UNKNOWN/PARTIAL | Flag only |
| F-MKT-001 | Provider marketplace | PARTIAL | `org` partners MVP only |
| F-WELL-001 | Diet/exercise programs | PARTIAL | Encounter wellness plans V56; not full product |

---

## Totals (approximate, CODE-WEIGHTED)

Do **not** treat as financial KPIs. Rough module counts above:

- Clearly **IMPLEMENTED** (API+DB+web major path): majority of HMS clinical + V2 ops modules
- **PARTIAL**: charge POST mode, notifications, mobile depth, nursing depth, telemedicine
- **NOT_STARTED**: ambulance, homecare, physiotherapy product, AI CDS

Exact % complete: **UNKNOWN** (no reliable denominator without approved scope freeze).
