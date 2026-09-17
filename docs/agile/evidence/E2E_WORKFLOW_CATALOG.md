# Evidence — E2E Workflow Catalog

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-EVID-E2E-001 |
| **Last Updated** | 2026-09-17 |
| **Basis** | Phase C spot-check verification |
| **Related** | [PHASE_C_VERIFICATION.md](./PHASE_C_VERIFICATION.md) · [09_ACCEPTANCE_CRITERIA.md](../09_ACCEPTANCE_CRITERIA.md) |

---

## WF-AUTH-001 — Register / Login / Portal landing

| Field | Value |
|-------|-------|
| **Actors** | Public, PATIENT, any role |
| **Starting condition** | API + web available; user may be unregistered |
| **End condition** | Authenticated session in role portal (with known patient RoleRoute gap) |
| **Status** | IMPLEMENTED with PARTIAL portal gating |
| **Stories** | US-IAM-ACCT-001, US-IAM-AUTH-001/002, US-IAM-RBAC-002 |
| **Gaps** | BUG-AUTH-001, BUG-AUTH-002 |

| Step | Actor | Action | Status |
|------|-------|--------|--------|
| 1 | Public | Patient self-register (+ UHID) | IMPLEMENTED |
| 2 | User | Login → JWT | IMPLEMENTED |
| 3 | User | MFA TOTP if enabled | IMPLEMENTED |
| 4 | System | Role redirect | IMPLEMENTED |
| 5 | System | RoleRoute enforcement | PARTIAL (patient missing; null-user edge) |

---

## WF-OPD-001 — OPD request → encounter → checkout

| Field | Value |
|-------|-------|
| **Actors** | PATIENT, RECEPTIONIST, DOCTOR |
| **Starting condition** | Patient account and/or hospital registry; doctor available |
| **End condition** | Encounter documented; checkout/payment handoff available |
| **Status** | IMPLEMENTED (happy path) |
| **Stories** | US-PAT-CARE-001, US-OPD-REQ-001, US-RCV-REG-001, US-RCV-DESK-001/002, US-DOC-WORK-001, US-CLN-* |

| Step | Actor | Action | Status |
|------|-------|--------|--------|
| 1 | PATIENT | Request OPD | IMPLEMENTED |
| 2 | RECEPTIONIST | Search/register + desk / walk-in | IMPLEMENTED |
| 3 | DOCTOR | Encounter notes/vitals/Rx/orders | IMPLEMENTED |
| 4 | System | Checkout checklist gate | IMPLEMENTED |
| 5 | RECEPTIONIST | Checkout handoff | IMPLEMENTED |

**Gaps:** Broader queue self check-in / ECO features remain UNKNOWN this pass.

---

## WF-IPD-001 — Recommend → admit → bed → MAR

| Field | Value |
|-------|-------|
| **Actors** | DOCTOR, HOSPITAL_ADMIN, NURSE |
| **Starting condition** | Doctor can recommend; wards/beds configured |
| **End condition** | Patient admitted with bed; READY meds administrable on MAR |
| **Status** | IMPLEMENTED (admit+bed+MAR); discharge depth UNKNOWN |
| **Stories** | US-DOC-WORK-002, US-IPD-ADM-001, US-NUR-MAR-001 |

| Step | Actor | Action | Status |
|------|-------|--------|--------|
| 1 | DOCTOR | Recommend IPD | IMPLEMENTED |
| 2 | HOSPITAL_ADMIN | Admit + assign bed | IMPLEMENTED |
| 3 | Clinical/Pharmacy path | Med reaches READY | IMPLEMENTED (precondition) |
| 4 | NURSE | Administer via MAR | IMPLEMENTED |
| 5 | Ops | Enterprise discharge / post-discharge | UNKNOWN (not Phase C verified) |

**Gaps:** FEAT-IPD-DC-* still UNKNOWN.

---

## WF-BIL-001 — Checkout / payment / charges

| Field | Value |
|-------|-------|
| **Actors** | RECEPTIONIST, PATIENT, HOSPITAL_ADMIN |
| **Starting condition** | Encounter ready for commercial close |
| **End condition** | Payment recorded and/or online intent completed; charge→invoice continuous *(desired)* |
| **Status** | PARTIAL (checkout/Razorpay IMPLEMENTED; charge attach/POST PARTIAL) |
| **Stories** | US-RCV-DESK-002, US-BIL-INV-001, US-BIL-PAY-001/002, US-BIL-CHG-001/002, US-BIL-XCP-001 |

| Step | Actor | Action | Status |
|------|-------|--------|--------|
| 1 | RECEPTIONIST | Checkout | IMPLEMENTED |
| 2 | Staff/Patient | Record payment / Razorpay | IMPLEMENTED |
| 3 | Billing | Invoice view | IMPLEMENTED |
| 4 | Billing | Charge engine DRY_RUN/POST | PARTIAL |
| 5 | Billing | Attach charges → invoice lines | PARTIAL / BUG-BIL-001 |
| 6 | Billing | Exceptions UI | IMPLEMENTED |

**Gaps:** BUG-BIL-001, SEC-PAY-001.

---

## WF-LAB-001 — Clinical order → lab fulfill

| Field | Value |
|-------|-------|
| **Actors** | DOCTOR, LAB staff |
| **Starting condition** | Active encounter |
| **End condition** | Lab order progressed on worklist |
| **Status** | IMPLEMENTED (happy path) |
| **Stories** | US-CLN-ORD-001, US-LAB-WRK-001 |

| Step | Actor | Action | Status |
|------|-------|--------|--------|
| 1 | DOCTOR | Place lab order | IMPLEMENTED |
| 2 | LAB | Worklist + detail | IMPLEMENTED |
| 3 | LAB | Fulfillment progress | IMPLEMENTED |
| 4 | Ops | Sample handling depth / auto invoice lines | UNKNOWN / related billing gaps |

---

## WF-ONB-001 — Public onboarding → admin queue

| Field | Value |
|-------|-------|
| **Actors** | Public visitor, PLATFORM_ADMIN |
| **Starting condition** | Public forms available |
| **End condition** | Request reviewed; provisioned tenant/user *(desired)* |
| **Status** | PARTIAL |
| **Stories** | US-PUB-ONB-001/002, US-ADM-HOS-002, US-ONB-PROV-001 |

| Step | Actor | Action | Status |
|------|-------|--------|--------|
| 1 | Public | Submit doctor/hospital request | IMPLEMENTED |
| 2 | PLATFORM_ADMIN | Queue review / status | IMPLEMENTED |
| 3 | System | Auto-provision on APPROVED | GAP-ONB-001 NOT DONE |
| 4 | DOCTOR | Verification submit → admin review | IMPLEMENTED (adjacent) |

---

## Confidence

| Workflow | Confidence |
|----------|------------|
| WF-AUTH-001 | HIGH |
| WF-OPD-001 | HIGH |
| WF-IPD-001 | HIGH (through MAR); LOW for discharge |
| WF-BIL-001 | HIGH for payment; HIGH for charge gap |
| WF-LAB-001 | HIGH |
| WF-ONB-001 | HIGH |
