# 14 — Dependencies

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-DEP-001 |
| **Status** | DRAFT — Phase H |
| **Last Updated** | 2026-09-17 |

---

## 1. Story dependency matrix (key items)

| Item | Depends on | Blocks / enables | Notes |
|------|------------|------------------|-------|
| US-IAM-AUTH-001 | — | Most portals | Baseline login |
| US-IAM-AUTH-002 | US-IAM-AUTH-001 | Hardened login | MFA |
| US-IAM-ACCT-001 | — | US-PAT-CARE-001 | Patient account |
| US-IAM-RBAC-002 | US-IAM-AUTH-001 | Portal UX | PARTIAL |
| US-AUTH-FIX-001 | BUG-AUTH-001 | Closes GAP-AUTH-001 | Sprint 01 |
| US-AUTH-FIX-002 | BUG-AUTH-002 | Closes GAP-AUTH-002 | Sprint 01 |
| US-PAT-CARE-001 | US-IAM-ACCT-001 | US-OPD-REQ-001 | Patient OPD |
| US-OPD-REQ-001 | US-PAT-CARE-001 | US-RCV-DESK-001, US-DOC-WORK-001 | Queue intake |
| US-RCV-REG-001 | — | US-RCV-DESK-001 | Registry |
| US-RCV-DESK-001 | US-RCV-REG-001 | US-DOC-WORK-001 | Desk |
| US-DOC-WORK-001 | US-OPD-REQ-001 / desk | Clinical stories, checkout | Encounter |
| US-CLN-NOTE-001/002, US-CLN-RX-001 | US-DOC-WORK-001 | Checkout readiness | Clinical |
| US-CLN-ORD-001 | US-DOC-WORK-001 | US-LAB-WRK-001 | Orders |
| US-LAB-WRK-001 | US-CLN-ORD-001 | Diagnostics complete | Lab |
| US-RCV-DESK-002 | US-DOC-WORK-001 | US-BIL-PAY-001 | Checkout handoff |
| US-BIL-PAY-001 | US-RCV-DESK-002 | US-BIL-PAY-002 | Payments |
| US-BIL-PAY-002 | US-BIL-PAY-001 | Online settle | Razorpay; SEC-PAY-001 |
| US-BIL-CHG-002 | US-BIL-CHG-001 | US-BIL-CHG-003 | PARTIAL |
| US-BIL-CHG-003 | BUG-BIL-001, US-BIL-CHG-001/002 | Invoice continuity | Sprint 02 |
| US-DOC-WORK-002 | — | US-IPD-ADM-001 | IPD recommend |
| US-IPD-ADM-001 | US-DOC-WORK-002 | US-NUR-MAR-001 | Admit/bed |
| US-NUR-MAR-001 | US-IPD-ADM-001 (+ READY meds) | Inpatient med safety | MAR |
| US-PUB-ONB-001/002 | — | US-ADM-HOS-002 | Public funnel |
| US-ADM-HOS-002 | US-PUB-ONB-* | US-ONB-PROV-001 | PARTIAL |
| US-ONB-PROV-001 | GAP-ONB-001, US-ADM-HOS-002 | Faster tenant bootstrap | Sprint 03 |
| US-DOC-PROF-002 | — | US-ADM-VFY-001 | Verification |
| US-CC-OPS-001 | BUG-API-001 fix for FE reliability | Ops visibility | PARTIAL |
| BUG-API-001 | — | US-CC-OPS-001 + ops FE modules | Sprint 01 |

---

## 2. Workflow dependency chains

### WF-AUTH-001
`Register (optional)` → `Login` → `MFA?` → `Role redirect` → *(gap: patient RoleRoute)*

### WF-OPD-001
`Patient/Registry` → `OPD request / walk-in` → `Doctor encounter` → `Notes/Vitals/Rx/Orders` → `Checkout` → `Payment`

### WF-IPD-001
`Doctor recommend` → `Hospital admit + bed` → `Care/orders` → `MAR (READY)` → *(discharge UNKNOWN depth this pass)*

### WF-BIL-001
`Encounter/checkout` → `Invoice/payment` → `Razorpay?`  
**Parallel incomplete:** `Charge engine` → *(attach/POST invoice gap)*

### WF-LAB-001
`Clinical order` → `Lab worklist` → `Fulfillment`

### WF-ONB-001
`Public request` → `Admin queue` → `APPROVED` → *(provision gap)*

---

## 3. Cross-cutting constraints

| Constraint | Effect |
|------------|--------|
| JWT + RBAC | All hospital ops stories require working auth |
| Hospital staff invite | Enables receptionist/nurse actors for OPD/IPD/MAR |
| Charge mode product decision | Required before declaring FEAT-BIL-CHG-* IMPLEMENTED |
| FE API baseURL convention | Blocks honest verification of several V2 ops UIs |
| Capacity UNKNOWN | Sprint sequencing is priority-ordered, not calendar-committed |
