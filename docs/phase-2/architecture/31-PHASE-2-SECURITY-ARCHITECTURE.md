# DOC-31: Health360 AI — Phase 2 Security Architecture (Delta)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-31 |
| **Title** | Phase 2 Security Architecture (Delta) |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-12](../../phase-1/architecture/12-SECURITY-ARCHITECTURE.md) |

---

## 1. PCI Scope Reduction

- Card entry only on gateway hosted page / SDK (Razorpay Checkout)
- Backend stores: `gateway_customer_id`, `payment_intent_id`, amount, status only
- PCI SAQ A or A-EP target; no cardholder data environment in app servers

---

## 2. Clinical Data Controls

| Data class | Controls |
|------------|----------|
| Prescription | RBAC: doctor write, patient read, pharmacist read for fulfillment |
| Lab results | Release gate; encryption at rest |
| Visit notes | Doctor write; patient sees summary tier |
| Video metadata | No recording default; if enabled, encrypted S3 + explicit consent |

---

## 3. Webhook Security

- HMAC signature validation per provider
- IP allowlist optional
- Idempotent processing table with 90-day retention

---

## 4. AI Assistant Guardrails (P2)

- No PHI sent to LLM without anonymization layer (P2)
- System prompt blocks diagnosis/prescription advice
- Rate limit 20 messages/hour/patient

---

## 5. MFA (Phase 1.5 / 2 Sprint 0)

- TOTP via authenticator app for doctors and admins
- Optional for patients

---

*End of DOC-31 — Phase 2 Security Delta v1.0*
