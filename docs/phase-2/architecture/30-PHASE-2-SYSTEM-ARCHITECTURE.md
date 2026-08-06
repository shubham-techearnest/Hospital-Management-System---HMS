# DOC-30: Health360 AI — Phase 2 System Architecture (Delta)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-30 |
| **Title** | Phase 2 System Architecture Document (Delta) |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-11](../../phase-1/architecture/11-SYSTEM-ARCHITECTURE-DOCUMENT.md) |

---

## 1. Architecture Stance

Phase 2 **extends the modular monolith** — no microservice split required for launch. New Java packages:

```
com.health360.prescription
com.health360.pharmacy
com.health360.laboratory
com.health360.billing
com.health360.telemedicine
com.health360.insurance
com.health360.clinical
```

Extract to services later if traffic/compliance demands (e.g. billing PCI boundary).

---

## 2. External Integrations (New)

| Integration | Purpose | Provider candidates |
|-------------|---------|---------------------|
| Payment gateway | Consult + order payments | Razorpay (India), Stripe |
| Video SDK | Telemedicine | Daily.co, Twilio Video, Agora |
| SMS (existing) | OTP, order updates | AWS SNS / MSG91 |
| FHIR server (optional) | Interop export | HAPI FHIR internal |
| LLM API (P2) | AI assistant | Azure OpenAI / AWS Bedrock |

---

## 3. Event Flow — Paid Pharmacy Order

```
Patient selects items → POST /payments/intent → Gateway checkout
  → Webhook CAPTURED → Update pharmacy_order PAID
  → Notify pharmacy → Pharmacist PREPARING → DELIVERED
  → Update prescription dispensed qty → Timeline event
```

---

## 4. Caching & Queues

| Component | Use |
|-----------|-----|
| Redis | Payment idempotency keys, video room session cache |
| SQS (optional) | Async webhook processing, notification fan-out |
| S3 | Prescription PDF, lab result PDF, invoice PDF |

---

## 5. ADR Candidates (Phase 2)

| ID | Decision | Status |
|----|----------|--------|
| ADR2-001 | Razorpay as primary payment gateway | Proposed |
| ADR2-002 | Daily.co for WebRTC telemedicine | Proposed |
| ADR2-003 | Saga pattern for payment + order confirmation | Proposed |
| ADR2-004 | Keep billing in monolith with PCI network segmentation | Proposed |

---

*End of DOC-30 — Phase 2 System Architecture Delta v1.0*
