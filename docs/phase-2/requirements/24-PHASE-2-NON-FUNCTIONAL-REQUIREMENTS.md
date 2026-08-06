# DOC-24: Health360 AI — Phase 2 Non-Functional Requirements (NFR)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-24 |
| **Title** | Phase 2 Non-Functional Requirements |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-04](../../phase-1/requirements/04-NON-FUNCTIONAL-REQUIREMENTS.md), [DOC-23](./23-PHASE-2-FUNCTIONAL-REQUIREMENTS.md) |

---

## 1. Overview

Phase 2 inherits all Phase 1 NFRs. This document adds **delta requirements** (NFR2-XXX).

---

## 2. Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR2-PERF-001 | Payment initiation API p95 | < 500ms |
| NFR2-PERF-002 | Prescription PDF generation p95 | < 2s |
| NFR2-PERF-003 | Video room token issuance p95 | < 1s |
| NFR2-PERF-004 | Lab result upload (10MB PDF) | < 10s end-to-end |
| NFR2-PERF-005 | Pharmacy catalog search p95 | < 400ms |

---

## 3. Security & Compliance

| ID | Requirement |
|----|-------------|
| NFR2-SEC-001 | PCI: no PAN/CVV stored; gateway tokens only |
| NFR2-SEC-002 | Prescription data encrypted at rest (same as PHI) |
| NFR2-SEC-003 | Video sessions use SRTP/TLS; provider SOC2 preferred |
| NFR2-SEC-004 | Webhook signatures validated for payment provider |
| NFR2-SEC-005 | Clinical notes access: doctor-of-record + patient summary view |
| NFR2-SEC-006 | AI assistant: prompt injection defenses; no PHI in external logs |

---

## 4. Availability & DR

| ID | Requirement | Target |
|----|-------------|--------|
| NFR2-AVAIL-001 | Payment webhook processing | At-least-once with idempotency |
| NFR2-AVAIL-002 | Video provider fallback message | Graceful degradation if SDK down |
| NFR2-AVAIL-003 | RPO for financial transactions | ≤ 5 min (stricter than Phase 1) |

---

## 5. Operability

| ID | Requirement |
|----|-------------|
| NFR2-OPS-001 | Payment reconciliation dashboard for finance |
| NFR2-OPS-002 | Alert on payment webhook failures > 5 in 15 min |
| NFR2-OPS-003 | Feature flags for Phase 2 modules per tenant |
| NFR2-OPS-004 | CloudFront CDN for static assets (Phase 1.5) |

---

## 6. Usability

| ID | Requirement |
|----|-------------|
| NFR2-USE-001 | Payment flow ≤ 3 taps on mobile |
| NFR2-USE-002 | Prescription readable without login on QR verify page (limited public view) |
| NFR2-USE-003 | Telehealth pre-call device check (camera/mic) |

---

*End of DOC-24 — Phase 2 NFR v1.0*
