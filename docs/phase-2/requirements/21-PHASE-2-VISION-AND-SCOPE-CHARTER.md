# DOC-21: Health360 AI — Phase 2 Vision & Scope Charter

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-21 |
| **Title** | Phase 2 Vision & Scope Charter |
| **Version** | 1.0 |
| **Status** | **Draft — Pending Approval** |
| **Date** | 2026-08-03 |
| **Author** | Chief Software Architect / Technical Lead |
| **References** | [DOC-00](../../00-PROJECT-MEMORY.md), [DOC-01](../phase-1/requirements/01-PROJECT-VISION-AND-SCOPE-CHARTER.md) |
| **Next Document** | [DOC-22](./22-PHASE-2-BUSINESS-REQUIREMENTS.md) |

---

## 1. Executive Summary

Phase 1 delivers the **healthcare foundation platform** — identity, profiles, scheduling, analytics, and discovery. Phase 2 extends Health360 AI into a **closed-loop care and commerce ecosystem**: clinical outputs (prescriptions, lab orders), fulfillment (pharmacy, diagnostics), remote care (telemedicine), and monetization (billing, payments, insurance hooks).

Phase 2 builds **on top of** the Phase 1 modular monolith. No Phase 1 module is replaced; new bounded contexts are added with explicit integration contracts to Scheduling, Patient, Doctor, and Hospital domains.

**Prerequisite:** Phase 1 production launch (M6) **or** a controlled beta with signed launch waiver — see [DOC-36](../delivery/36-LAUNCH-DECISION-FRAMEWORK.md).

---

## 2. Vision (Phase 2)

> **From booking healthcare to completing the care journey — prescriptions, diagnostics, pharmacy, payments, and virtual visits — on one trusted platform.**

### 2.1 Mission

- **Patients** receive end-to-end care: consult → prescription → pharmacy/lab → payment → follow-up (including video).
- **Doctors** prescribe digitally, order labs, conduct tele-consults, and view structured clinical summaries.
- **Hospitals & pharmacies & labs** operate as fulfillment partners with inventory, orders, and billing integration.
- **Platform** enables regulated transactions, audit trails, and revenue models deferred from Phase 1.

---

## 3. Strategic Objectives (Phase 2)

| ID | Objective | KPI (Phase 2 Launch) |
|----|-----------|----------------------|
| SO2-001 | **Digital prescribing** | ≥90% of completed appointments can generate e-prescription where clinically allowed |
| SO2-002 | **Fulfillment connectivity** | Pharmacy + lab order placement with status tracking |
| SO2-003 | **Monetization readiness** | Payment gateway live; consultation + order payments reconciled |
| SO2-004 | **Telemedicine** | Video consult for TELE appointment type with consent + session audit |
| SO2-005 | **Clinical interoperability** | HL7 FHIR R4 export for patient summary (read); lab results import (P1) |
| SO2-006 | **Compliance depth** | PCI-DSS scope for payments; telehealth consent; prescription retention policy |
| SO2-007 | **Operational scale** | Multi-tenant isolation enforced; optional CDN/WAF (Phase 1.5 items absorbed) |

---

## 4. Phase 2 Module Map

Phase 2 adds **eight new domain modules** (plus Phase 1.5 hardening):

| # | Module | Priority | Description |
|---|--------|----------|-------------|
| M08 | **E-Prescription** | P0 | Doctor-authored prescriptions linked to appointments; patient view; pharmacy routing |
| M09 | **Pharmacy** | P0 | Pharmacy profiles, catalog, order fulfillment, inventory basics |
| M10 | **Laboratory / Diagnostics** | P0 | Lab profiles, test catalog, orders, result upload/notification |
| M11 | **Billing & Payments** | P0 | Invoices, Razorpay/Stripe integration, refunds, receipts |
| M12 | **Telemedicine** | P1 | Video rooms (WebRTC / third-party SDK), session lifecycle, recording policy |
| M13 | **Insurance & Claims** | P1 | Policy storage, pre-auth hooks, claim status (integration-ready) |
| M14 | **Clinical EMR (Lite)** | P1 | Visit notes, diagnosis codes (ICD-10), structured clinical timeline |
| M15 | **AI Care Assistant** | P2 | LLM-powered patient FAQ, appointment prep — **not** clinical diagnosis |

**Phase 1.5 items** (may ship before or during Phase 2): MFA/2FA, multi-tenant enforcement, CloudFront CDN, AWS WAF, password reset, push notifications.

**Explicitly deferred to Phase 3+:** Blood bank, full ERP/inventory, HR/payroll, CMS, IoT/wearable sync at scale, full HIPAA certification audit.

---

## 5. Scope Boundaries

### 5.1 In Scope

| Capability | Included |
|------------|----------|
| E-prescription create/view/dispense workflow | ✅ |
| Pharmacy registration, catalog, order management | ✅ |
| Lab registration, test orders, result delivery to patient | ✅ |
| Payment for appointments, prescriptions, lab orders | ✅ |
| Invoicing and payment history | ✅ |
| Telemedicine (video) for scheduled TELE appointments | ✅ |
| Insurance policy capture + claim reference IDs | ✅ (P1) |
| Doctor clinical notes (visit summary) post-appointment | ✅ (P1) |
| FHIR Patient/Observation export (read) | ✅ (P1) |
| AI assistant (non-clinical, guardrailed) | ✅ (P2) |

### 5.2 Out of Scope (Phase 2)

| Capability | Rationale |
|------------|-----------|
| Full hospital ERP / inventory | Phase 3 enterprise module |
| Blood bank management | Regulatory complexity; separate charter |
| Autonomous AI diagnosis | Regulatory; formula engine + disclaimers only |
| International payment methods beyond initial gateway | Market expansion Phase 3 |
| Offline-first mobile for clinical data | Phase 3 enhancement |
| Native EMR replacement for hospitals | Lite visit notes only |

---

## 6. Dependencies on Phase 1

| Phase 1 Module | Phase 2 Dependency |
|----------------|-------------------|
| IAM | New roles: PHARMACIST (active), LAB_TECHNICIAN (active), BILLING_ADMIN |
| Patient | Prescription/lab result visibility; payment methods |
| Doctor | Prescribing authority; telemedicine eligibility |
| Hospital | Lab/pharmacy branch associations |
| Scheduling | TELE appointment type; payment-before-confirm option |
| Analytics | Medication adherence metrics (P1); lab trend overlays |

---

## 7. Success Criteria (Phase 2 Launch)

| Category | Criteria |
|----------|----------|
| **Functional** | End-to-end: book → consult (in-person or tele) → prescribe → pay → pharmacy/lab order → status tracked |
| **Financial** | Payment success rate ≥99%; reconciliation report for finance |
| **Security** | PCI scope documented; no card data stored; pen test includes payment + tele flows |
| **Regulatory** | E-prescription disclaimer; telehealth consent; audit trail for all clinical writes |
| **Performance** | Video session setup < 30s p95; payment API p95 < 500ms |

---

## 8. Timeline Estimate

| Sub-phase | Duration | Outcome |
|-----------|----------|---------|
| **Phase 2A** | ~12 weeks | E-Rx + Pharmacy + Lab + Payments |
| **Phase 2B** | ~8 weeks | Telemedicine + clinical notes |
| **Phase 2C** | ~8 weeks | Insurance + FHIR + AI assistant (P2) |
| **Total** | ~28 weeks (~14 sprints) | Phase 2 production launch |

See [DOC-34](../delivery/34-PHASE-2-DEVELOPMENT-ROADMAP.md) for sprint breakdown.

---

## 9. Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R2-001 | Payment/regulatory compliance delay | Engage compliance early; tokenized payments only |
| R2-002 | E-prescription legal variance by state | Configurable jurisdiction rules; legal review |
| R2-003 | Telemedicine SDK cost/vendors | Abstract provider; evaluate Daily.co / Twilio / Agora |
| R2-004 | Scope explosion (full EMR) | Strict "EMR Lite" boundary in DOC-23 |
| R2-005 | Phase 1 launch delay blocks Phase 2 | Parallel Phase 1.5; Phase 2 design while Phase 1 closes |

---

## 10. Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Product Owner | _________________ | _________________ | ________ | Pending |
| Technical Lead | _________________ | _________________ | ________ | Pending |

---

*End of DOC-21 — Phase 2 Vision & Scope Charter v1.0*
