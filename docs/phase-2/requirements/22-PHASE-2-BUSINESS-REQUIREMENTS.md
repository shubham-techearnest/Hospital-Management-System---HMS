# DOC-22: Health360 AI — Phase 2 Business Requirements Document (BRD)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-22 |
| **Title** | Phase 2 Business Requirements Document |
| **Version** | 1.0 |
| **Status** | **Draft — Pending Approval** |
| **Date** | 2026-08-03 |
| **Author** | Senior Business Analyst / Product Owner |
| **References** | [DOC-21](./21-PHASE-2-VISION-AND-SCOPE-CHARTER.md), [DOC-02](../../phase-1/requirements/02-BUSINESS-REQUIREMENTS-DOCUMENT.md) |
| **Next Document** | [DOC-23](./23-PHASE-2-FUNCTIONAL-REQUIREMENTS.md) |

---

## 1. Executive Summary

Phase 2 transforms Health360 AI from a **discovery and scheduling platform** into a **care delivery and transaction platform**. This BRD defines business requirements (BRQ2-XXX) for e-prescription, pharmacy, laboratory, billing/payments, telemedicine, insurance, and clinical documentation — all extending Phase 1 personas and workflows.

---

## 2. Business Goals

| ID | Goal | Success Metric |
|----|------|----------------|
| BG2-001 | Reduce care fragmentation after appointment | ≥60% of completed visits generate digital artifact (Rx, lab order, or note) |
| BG2-002 | Enable platform revenue | First paid transaction within 30 days of Phase 2 launch |
| BG2-003 | Partner ecosystem | ≥5 pharmacy + ≥3 lab partners onboarded in beta |
| BG2-004 | Telehealth access | TELE appointments ≥15% of total bookings in pilot cities |
| BG2-005 | Trust & compliance | Zero critical findings on payment + clinical audit |

---

## 3. Stakeholder Needs (Phase 2 Additions)

| Persona | New Needs |
|---------|-----------|
| **Patient** | View/download prescriptions; order medicines; book lab tests; pay online; join video consult; see results in timeline |
| **Doctor** | Write e-prescription; order labs; add visit notes; conduct tele-consult; view payment status |
| **Pharmacist** | Receive Rx orders; manage catalog/stock; update fulfillment status |
| **Lab technician** | Receive test orders; upload results; notify patient |
| **Hospital admin** | Configure in-hospital pharmacy/lab; revenue reports |
| **Platform admin** | Payment reconciliation; partner onboarding; clinical audit review |

---

## 4. Business Requirements

### 4.1 E-Prescription (M08)

| ID | Requirement |
|----|-------------|
| BRQ2-001 | Doctor shall create e-prescription only for **COMPLETED** appointments they attended |
| BRQ2-002 | Prescription shall include drug name, dosage, frequency, duration, instructions, and doctor registration number |
| BRQ2-003 | Patient shall view prescription PDF and order history in portal |
| BRQ2-004 | Prescription shall route to selected pharmacy or "any partner pharmacy" |
| BRQ2-005 | System shall maintain immutable prescription audit log (no silent edits; amendments create new version) |

### 4.2 Pharmacy (M09)

| ID | Requirement |
|----|-------------|
| BRQ2-010 | Pharmacy shall register with license verification (admin approval) |
| BRQ2-011 | Pharmacy shall maintain medicine catalog with SKU, MRP, stock indicator |
| BRQ2-012 | Patient shall place pharmacy order from prescription with delivery/pickup option |
| BRQ2-013 | Pharmacy shall update order status: received → preparing → ready → delivered |
| BRQ2-014 | Platform shall support commission or listing fee configuration (BD-002) |

### 4.3 Laboratory (M10)

| ID | Requirement |
|----|-------------|
| BRQ2-020 | Lab shall register with accreditation details (NABL optional field) |
| BRQ2-021 | Doctor shall order tests from catalog linked to appointment |
| BRQ2-022 | Patient shall book sample collection (home or lab visit) |
| BRQ2-023 | Lab shall upload results (PDF + structured values where available) |
| BRQ2-024 | Results shall appear in patient health timeline and lab values section |

### 4.4 Billing & Payments (M11)

| ID | Requirement |
|----|-------------|
| BRQ2-030 | Patient shall pay consultation fee at booking or after visit (configurable) |
| BRQ2-031 | Patient shall pay for pharmacy and lab orders online |
| BRQ2-032 | System shall issue GST-compliant invoice/receipt |
| BRQ2-033 | Platform shall support refunds per cancellation policy [BR-SCH-* extended] |
| BRQ2-034 | Finance admin shall export reconciliation report (orders, fees, refunds) |
| BRQ2-035 | **No raw card data stored** — tokenized gateway only [ASM2-001] |

### 4.5 Telemedicine (M12)

| ID | Requirement |
|----|-------------|
| BRQ2-040 | Patient shall join video session from appointment detail (TELE type only) |
| BRQ2-041 | Both parties shall accept telehealth consent before first video session |
| BRQ2-042 | Session shall log start/end times; optional recording **off by default** |
| BRQ2-043 | Doctor shall mark tele-visit complete same as in-person |

### 4.6 Insurance (M13) — P1

| ID | Requirement |
|----|-------------|
| BRQ2-050 | Patient shall store insurance policy (provider, policy number, validity) |
| BRQ2-051 | System shall capture pre-authorization reference for eligible appointments |
| BRQ2-052 | Claim status field for manual/partner integration (no full claims engine in Phase 2) |

### 4.7 Clinical EMR Lite (M14) — P1

| ID | Requirement |
|----|-------------|
| BRQ2-060 | Doctor shall add visit summary and ICD-10 diagnosis codes post-appointment |
| BRQ2-061 | Clinical notes visible to patient (summary level) and treating doctor |
| BRQ2-062 | Notes shall feed health timeline and analytics (non-diagnostic) |

---

## 5. Business Rules (Summary)

| ID | Rule |
|----|------|
| BR2-001 | Prescription requires verified doctor + completed appointment |
| BR2-002 | Controlled substances (Schedule H/X) — flag for manual pharmacy verification; auto-block optional per jurisdiction |
| BR2-003 | Payment must succeed before pharmacy dispatch (configurable prepay) |
| BR2-004 | Lab results visible to patient only after lab marks "released" |
| BRQ2-005 | Telemedicine not available across state lines where prohibited (geo rule config) |
| BR2-006 | Refund window: consultation 24h before; pharmacy before "preparing" status |

Full catalog: [DOC-28](../architecture/28-PHASE-2-BUSINESS-RULES.md).

---

## 6. Monetization (Phase 2 Activation)

| Model | Phase 2 Status |
|-------|------------------|
| Consultation booking fee / commission | **Activate** |
| Pharmacy order commission | **Activate** |
| Lab order commission | **Activate** |
| Doctor premium listing | Optional P1 |
| Hospital enterprise SaaS | Optional P1 |
| Patient premium (AI assistant) | P2 |

**Business Decision BD-002:** Primary revenue = **transaction commission** on consultations, pharmacy, and lab orders.

---

## 7. Compliance Baseline

| Regulation / Standard | Phase 2 Application |
|-----------------------|---------------------|
| IT Act 2000 / DPDP Act (India) | Consent for clinical + payment data |
| PCI-DSS SAQ A-EP or equivalent | Payment integration |
| MCI/NMC telemedicine guidelines | Telehealth consent + record keeping |
| E-prescription state rules | Configurable; legal review per launch region |
| FHIR R4 | Export/read interoperability (P1) |

---

## 8. Traceability

| BRQ2-XXX | Phase 2 Module | User Stories |
|----------|----------------|--------------|
| BRQ2-001–005 | E-Prescription | US2-RX-001–008 |
| BRQ2-010–014 | Pharmacy | US2-PHR-001–010 |
| BRQ2-020–024 | Laboratory | US2-LAB-001–010 |
| BRQ2-030–035 | Billing | US2-PAY-001–012 |
| BRQ2-040–043 | Telemedicine | US2-TEL-001–008 |

See [DOC-33](./33-PHASE-2-USER-STORIES.md).

---

## 9. Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Product Owner | _________________ | _________________ | ________ | Pending |

---

*End of DOC-22 — Phase 2 BRD v1.0*
