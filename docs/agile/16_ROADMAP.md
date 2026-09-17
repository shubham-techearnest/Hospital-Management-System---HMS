# 16 — Roadmap

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-RM-001 |
| **Status** | DRAFT — Phase I |
| **Last Updated** | 2026-09-17 |
| **Dates** | **NONE** — capacity/velocity UNKNOWN |

---

## Phase sequence

```text
Baseline / Pre-Agile Existing Implementation
        ↓
Stabilization
        ↓
Core Workflow Completion
        ↓
Module Completion
        ↓
Integration (cross-module)
        ↓
Hardening
        ↓
Release Readiness
        ↓
Future Expansion
```

---

## Phase definitions

### 1. Baseline / Pre-Agile Existing Implementation
**Intent:** Document and freeze what Phase C already verified as IMPLEMENTED/PARTIAL.  
**Includes:** Auth, OPD/IPD core, lab happy path, billing checkout/Razorpay, MAR, staff invite, onboarding queue (partial), etc.  
**Exit:** Baseline stories cataloged; no fake sprint history.

### 2. Stabilization
**Intent:** Close trust and FE integration defects that block honest ops verification.  
**Focus:** BUG-AUTH-001/002, BUG-API-001 / TECH-API-001, RoleRoute hardening.  
**Exit:** Patient portal role-gated; FE API paths consistent; RoleRoute null-safe.

### 3. Core Workflow Completion
**Intent:** Finish incomplete money and onboarding continuations on critical journeys.  
**Focus:** BUG-BIL-001 / charge attach + POST invoice policy; GAP-ONB-001 provisioning; SEC-PAY-001 hygiene.  
**Exit:** OPD→checkout→invoice/charge path coherent; APPROVED onboarding can provision per policy.

### 4. Module Completion
**Intent:** Verify and close UNKNOWN features module-by-module (ED, pharmacy depth, rad/OT, insurance, inventory, ICU depth, mobile scope).  
**Exit:** Overlay expanded; UNKNOWN count materially reduced with evidence.

### 5. Integration
**Intent:** Cross-module journeys and automation/My Work/command center reliability.  
**Exit:** WF packs green for Auth/OPD/IPD/Lab/Billing/Onboarding; CC usable.

### 6. Hardening
**Intent:** Notifications providers, test golden paths, performance/security review, stub removal.  
**Focus:** TECH-NTF-001, TECH-TEST-001, payment webhook production rules.

### 7. Release Readiness
**Intent:** UAT golden paths, release checklist, env secrets, rollback, docs freeze.  
**Exit:** Named production-candidate release approved (calendar TBD).

### 8. Future Expansion
**Intent:** Vision-only modules — ambulance, homecare, physiotherapy, AI CDS — **PLANNED** only.  
**Exit:** Explicit go/no-go per item; not mixed into MVP claims.

---

## Mapping to releases

See [17_RELEASE_PLAN.md](./17_RELEASE_PLAN.md). Sprint proposals: [18_SPRINT_PLAN.md](./18_SPRINT_PLAN.md).
