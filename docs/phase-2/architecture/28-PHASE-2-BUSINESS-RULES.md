# DOC-28: Health360 AI — Phase 2 Business Rules & Validation Catalog

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-28 |
| **Title** | Phase 2 Business Rules & Validation Catalog |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-09](../../phase-1/architecture/09-BUSINESS-RULES-AND-VALIDATION-CATALOG.md) |

---

## 1. Prescription Rules (BR2-RX)

| ID | Rule | Enforcement |
|----|------|-------------|
| BR2-RX-001 | Doctor must be VERIFIED to issue prescription | Application service |
| BR2-RX-002 | Appointment must be COMPLETED and within 72h for Rx creation | Application service |
| BR2-RX-003 | Minimum 1 line item; max 20 lines per prescription | Validation |
| BR2-RX-004 | Dosage must include numeric amount + unit | Validation |
| BR2-RX-005 | Schedule H drugs require pharmacy manual confirm flag | Catalog flag |

---

## 2. Pharmacy Rules (BR2-PHR)

| ID | Rule |
|----|------|
| BR2-PHR-001 | Order cannot dispatch until payment CAPTURED (default) |
| BR2-PHR-002 | Partial fill updates prescription line dispensed qty |
| BR2-PHR-003 | Cancel only before status PREPARING |

---

## 3. Laboratory Rules (BR2-LAB)

| ID | Rule |
|----|------|
| BR2-LAB-001 | Results hidden until `released_at` set |
| BR2-LAB-002 | Structured result values validated against numeric ranges |
| BR2-LAB-003 | Doctor-ordered tests require appointment link |

---

## 4. Payment Rules (BR2-PAY)

| ID | Rule |
|----|------|
| BR2-PAY-001 | Idempotency-Key required on payment intent |
| BR2-PAY-002 | Refund ≤ original captured amount |
| BR2-PAY-003 | Webhook processed only once per gateway event ID |
| BR2-PAY-004 | Invoice generated only after CAPTURED |

---

## 5. Telemedicine Rules (BR2-TEL)

| ID | Rule |
|----|------|
| BR2-TEL-001 | Join window: scheduled_at ± 15 minutes |
| BR2-TEL-002 | Consent version must match current policy |
| BR2-TEL-003 | Minor patients require guardian consent (P1) |

---

*End of DOC-28 — Phase 2 Business Rules v1.0*
