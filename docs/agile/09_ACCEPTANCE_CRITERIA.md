# 09 — Acceptance Criteria Index

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-AC-001 |
| **Status** | DRAFT — Phase E |
| **Last Updated** | 2026-09-17 |
| **Rule** | Story-level AC in [08_USER_STORY_CATALOG.md](./08_USER_STORY_CATALOG.md) is authoritative for CURRENT behavior |

---

## 1. Story AC index

| Story ID | AC IDs | Domain | Notes |
|----------|--------|--------|-------|
| US-IAM-AUTH-001 | AC-01..03 | Auth | Login + JWT + MFA gate |
| US-IAM-AUTH-002 | AC-01..03 | Auth | TOTP enroll/challenge |
| US-IAM-ACCT-001 | AC-01..03 | Auth / Patient | PATIENT-only self-reg + UHID |
| US-IAM-RBAC-001 | AC-01..03 | Auth | 12 roles + @PreAuthorize |
| US-IAM-RBAC-002 | AC-01..04 | Auth | Portal routing; documents gaps |
| US-AUTH-FIX-001 | AC-01..02 | Auth | FUTURE — PATIENT RoleRoute |
| US-AUTH-FIX-002 | AC-01..02 | Auth | FUTURE — null user |
| US-PUB-LAND-001 | AC-01..02 | Public | Landing |
| US-PUB-ONB-001 | AC-01..02 | Onboarding | Doctor request |
| US-PUB-ONB-002 | AC-01..02 | Onboarding | Hospital demo |
| US-ADM-HOS-002 | AC-01..02 | Admin | Queue PARTIAL |
| US-ONB-PROV-001 | AC-01..03 | Admin | FUTURE provision |
| US-ADM-VFY-001 | AC-01..02 | Admin | Doctor verification |
| US-HOS-STAFF-001 | AC-01..02 | Hospital | Staff invite |
| US-DOC-PROF-002 | AC-01 | Doctor | Verification submit |
| US-PAT-CARE-001 | AC-01..02 | OPD | Patient request |
| US-OPD-REQ-001 | AC-01..02 | OPD | Request intake |
| US-RCV-REG-001 | AC-01..02 | Reception | Registry |
| US-RCV-DESK-001 | AC-01..02 | Reception | Desk |
| US-RCV-DESK-002 | AC-01..02 | Billing handoff | Checkout |
| US-DOC-WORK-001 | AC-01..02 | OPD | Encounter workbench |
| US-CLN-NOTE-001 | AC-01 | Clinical | Notes |
| US-CLN-NOTE-002 | AC-01 | Clinical | Vitals |
| US-CLN-RX-001 | AC-01 | Clinical | Rx |
| US-CLN-ORD-001 | AC-01 | Clinical / Lab | Orders |
| US-LAB-WRK-001 | AC-01..02 | Lab | Fulfillment |
| US-DOC-WORK-002 | AC-01 | IPD | Recommend |
| US-IPD-ADM-001 | AC-01..02 | IPD | Admit + bed |
| US-NUR-MAR-001 | AC-01..03 | Nursing | MAR READY gate |
| US-BIL-INV-001 | AC-01 | Billing | Invoices |
| US-BIL-PAY-001 | AC-01 | Billing | Checkout pay |
| US-BIL-PAY-002 | AC-01..02 | Billing | Razorpay |
| US-BIL-CHG-001 | AC-01..03 | Billing | Charge engine PARTIAL |
| US-BIL-CHG-002 | AC-01..02 | Billing | Attach PARTIAL |
| US-BIL-CHG-003 | AC-01..03 | Billing | FUTURE attach/POST |
| US-BIL-XCP-001 | AC-01 | Billing | Exceptions |
| US-CC-OPS-001 | AC-01..02 | Ops | Command center PARTIAL |
| US-PLT-AUDIT-002 | AC-01 | Platform | Health |

---

## 2. Critical workflow AC packs

Cross-story packs for QA golden paths. Detailed step catalogs: [evidence/E2E_WORKFLOW_CATALOG.md](./evidence/E2E_WORKFLOW_CATALOG.md).

### ACP-AUTH-001 — Authentication & portal landing

| # | Given / When / Then |
|---|---------------------|
| 1 | Given valid user, When login, Then JWT session established (US-IAM-AUTH-001). |
| 2 | Given MFA enabled, When TOTP valid, Then portal access granted (US-IAM-AUTH-002). |
| 3 | Given role X, When login completes, Then redirect to role portal (US-IAM-RBAC-002 AC-01). |
| 4 | Given non-patient token, When `/patient/*` opened, Then **current:** may not be RoleRoute-blocked (document as known defect until US-AUTH-FIX-001). |

### ACP-OPD-001 — OPD request → encounter → checkout handoff

| # | Given / When / Then |
|---|---------------------|
| 1 | Given patient account, When OPD requested, Then request on same-day queue (US-PAT-CARE-001 / US-OPD-REQ-001). |
| 2 | Given reception desk, When walk-in/register, Then OPD entry created (US-RCV-REG-001 / US-RCV-DESK-001). |
| 3 | Given doctor encounter, When notes/vitals/Rx/orders saved, Then clinical persistence succeeds (US-DOC-WORK-001 + clinical stories). |
| 4 | Given checkout checklist incomplete, When checkout attempted, Then blocked as implemented. |
| 5 | Given checkout ready, When reception checkout, Then payment path available (US-RCV-DESK-002 / US-BIL-PAY-001). |

### ACP-IPD-001 — Recommend → admit → bed → MAR

| # | Given / When / Then |
|---|---------------------|
| 1 | Given doctor IPD recommend, When submitted, Then admission request linked (US-DOC-WORK-002). |
| 2 | Given hospital admit, When bed assigned, Then stay active (US-IPD-ADM-001). |
| 3 | Given READY med order, When nurse administers, Then MAR recorded (US-NUR-MAR-001). |
| 4 | Given non-READY med, When administer attempted, Then rejected. |

### ACP-BIL-001 — Checkout / Razorpay / charge engine

| # | Given / When / Then |
|---|---------------------|
| 1 | Given invoiceable encounter, When checkout payment, Then payment state updates (US-BIL-PAY-001). |
| 2 | Given online pay, When Razorpay intent created, Then sandbox/online flow works (US-BIL-PAY-002). |
| 3 | Given charge DRY_RUN, When evaluated, Then preview behavior as implemented (US-BIL-CHG-001). |
| 4 | Given charge POST / attach, When using FE, Then **current:** attach unwired; POST ≠ auto invoice lines (BUG-BIL-001). |
| 5 | Given exceptions, When UI opened, Then exceptions visible (US-BIL-XCP-001). |

### ACP-ONB-001 — Public onboarding → admin queue

| # | Given / When / Then |
|---|---------------------|
| 1 | Given public form, When doctor/hospital request submitted, Then queued (US-PUB-ONB-001/002). |
| 2 | Given admin queue, When APPROVED, Then status saved **without** auto-provision (US-ADM-HOS-002 / GAP-ONB-001). |

### ACP-LAB-001 — Clinical order → lab fulfill

| # | Given / When / Then |
|---|---------------------|
| 1 | Given encounter, When lab order placed, Then lab worklist receives order (US-CLN-ORD-001 / US-LAB-WRK-001). |
| 2 | Given lab detail, When fulfillment progresses, Then status updates. |

---

## 3. QA usage notes

- Prefer **CURRENT** AC for regression of baseline stories.
- Mark FUTURE AC clearly when testing planned items (US-*-FIX-*, US-BIL-CHG-003, US-ONB-PROV-001).
- Confidence: Phase C spot-check = **HIGH** for listed workflows; unlisted modules = **UNKNOWN** until traced.
