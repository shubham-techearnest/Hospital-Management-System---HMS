# DOC-23: Health360 AI — Phase 2 Functional Requirements Specification (FRS)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-23 |
| **Title** | Phase 2 Functional Requirements Specification |
| **Version** | 1.0 |
| **Status** | **Draft — Pending Approval** |
| **Date** | 2026-08-03 |
| **Author** | Technical Lead |
| **References** | [DOC-22](./22-PHASE-2-BUSINESS-REQUIREMENTS.md), [DOC-03](../../phase-1/requirements/03-FUNCTIONAL-REQUIREMENTS-SPECIFICATION.md) |
| **Next Document** | [DOC-24](./24-PHASE-2-NON-FUNCTIONAL-REQUIREMENTS.md) |

---

## 1. Scope

Functional requirements for Phase 2 modules M08–M15. Format: **FR2-XXX** with priority P0/P1/P2.

---

## 2. Use Cases (New)

| ID | Use Case | Actors |
|----|----------|--------|
| UC2-001 | Issue E-Prescription | Doctor, Patient |
| UC2-002 | Fulfill Pharmacy Order | Patient, Pharmacist |
| UC2-003 | Order & Receive Lab Results | Doctor, Patient, Lab |
| UC2-004 | Pay for Care Services | Patient |
| UC2-005 | Conduct Teleconsultation | Doctor, Patient |
| UC2-006 | Manage Insurance Policy | Patient |
| UC2-007 | Record Clinical Visit Summary | Doctor |
| UC2-008 | Ask AI Care Assistant (non-clinical) | Patient |

---

## 3. E-Prescription Module (FR2-RX)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-RX-001 | System shall allow doctor to create prescription with ≥1 line item (drug, dose, frequency, duration) | P0 |
| FR2-RX-002 | System shall validate doctor is verified and appointment status = COMPLETED | P0 |
| FR2-RX-003 | System shall generate prescription PDF with QR verification code | P0 |
| FR2-RX-004 | Patient shall list prescriptions with status: active, dispensed, expired | P0 |
| FR2-RX-005 | System shall support prescription amendment (new version; prior version archived) | P1 |
| FR2-RX-006 | System shall send notification when prescription ready | P0 |

---

## 4. Pharmacy Module (FR2-PHR)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-PHR-001 | Pharmacist shall CRUD pharmacy profile (license, address, hours) | P0 |
| FR2-PHR-002 | Pharmacist shall manage medicine catalog (name, generic, strength, price, in_stock) | P0 |
| FR2-PHR-003 | Patient shall create order from prescription line items (partial fill allowed) | P0 |
| FR2-PHR-004 | Order lifecycle: PENDING_PAYMENT → PAID → PREPARING → READY → DELIVERED / CANCELLED | P0 |
| FR2-PHR-005 | Admin shall approve pharmacy registration | P0 |
| FR2-PHR-006 | Patient shall track order with ETA (manual entry Phase 2) | P1 |

---

## 5. Laboratory Module (FR2-LAB)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-LAB-001 | Lab admin shall CRUD lab profile and test catalog | P0 |
| FR2-LAB-002 | Doctor shall create lab order linked to appointment with selected tests | P0 |
| FR2-LAB-003 | Patient shall schedule sample collection slot | P0 |
| FR2-LAB-004 | Lab shall upload result PDF and optional structured values (LOINC code field) | P0 |
| FR2-LAB-005 | Results shall sync to patient lab values + timeline on release | P0 |
| FR2-LAB-006 | System shall notify patient when results available | P0 |

---

## 6. Billing & Payments Module (FR2-PAY)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-PAY-001 | System shall integrate payment gateway (Razorpay primary; Stripe optional) | P0 |
| FR2-PAY-002 | Patient shall pay for appointment, pharmacy order, lab order | P0 |
| FR2-PAY-003 | System shall create invoice with line items, tax, platform fee | P0 |
| FR2-PAY-004 | Webhook shall confirm payment and idempotently update order status | P0 |
| FR2-PAY-005 | Support partial refund and full refund with audit reason | P0 |
| FR2-PAY-006 | Patient shall view payment history and download receipt | P0 |
| FR2-PAY-007 | Admin shall export daily settlement report | P1 |

---

## 7. Telemedicine Module (FR2-TEL)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-TEL-001 | Scheduling shall support appointment type TELE with duration slot | P0 |
| FR2-TEL-002 | System shall create video room via provider SDK when session opens | P0 |
| FR2-TEL-003 | Patient and doctor shall join only within appointment window ±15 min | P0 |
| FR2-TEL-004 | Telehealth consent capture before first video join | P0 |
| FR2-TEL-005 | Session metadata logged (participants, start, end); no recording default | P0 |
| FR2-TEL-006 | Waiting room with doctor admit (optional P1) | P1 |

---

## 8. Insurance Module (FR2-INS) — P1

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-INS-001 | Patient CRUD insurance policies | P1 |
| FR2-INS-002 | Attach policy to appointment; store pre-auth reference | P1 |
| FR2-INS-003 | Claim status field: not_submitted, submitted, approved, rejected | P1 |

---

## 9. Clinical EMR Lite (FR2-EMR) — P1

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-EMR-001 | Doctor add visit note (chief complaint, assessment, plan) post-visit | P1 |
| FR2-EMR-002 | Support ICD-10 code picker (search API or cached subset) | P1 |
| FR2-EMR-003 | Patient sees patient-friendly summary (not full clinical jargon toggle) | P1 |

---

## 10. AI Care Assistant (FR2-AI) — P2

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-AI-001 | Patient chat for platform FAQ, appointment prep, document upload help | P2 |
| FR2-AI-002 | Hard block: no diagnosis, no prescription suggestions, no emergency triage | P0 (guardrail) |
| FR2-AI-003 | All prompts/responses logged; rate limited | P2 |

---

## 11. Phase 1.5 Functional Additions (may ship in Phase 2 sprint 0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2-IAM-001 | MFA via TOTP or SMS OTP | P1 |
| FR2-IAM-002 | Password reset email flow | P1 |
| FR2-IAM-003 | Multi-tenant row-level isolation enforcement | P1 |
| FR2-NTF-003 | Mobile push notifications (FCM) | P1 |

---

## 12. API & Screen References

- APIs: [DOC-27](../architecture/27-PHASE-2-REST-API-DESIGN.md)
- Screens: [DOC-29](../architecture/29-PHASE-2-UI-UX-SCREENS.md)
- Database: [DOC-26](../architecture/26-PHASE-2-DATABASE-DESIGN.md)

---

*End of DOC-23 — Phase 2 FRS v1.0*
