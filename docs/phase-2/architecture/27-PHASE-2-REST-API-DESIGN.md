# DOC-27: Health360 AI — Phase 2 REST API Design Specification

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-27 |
| **Title** | Phase 2 REST API Design Specification |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-07](../../phase-1/architecture/07-REST-API-DESIGN-SPECIFICATION.md), [DOC-23](../requirements/23-PHASE-2-FUNCTIONAL-REQUIREMENTS.md) |

---

## 1. API Conventions

Same as Phase 1: `/api/v1`, JWT auth, problem+json errors, OpenAPI 3.

---

## 2. Prescription APIs

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/prescriptions` | DOCTOR | Create prescription for appointment |
| GET | `/prescriptions/me` | PATIENT | List own prescriptions |
| GET | `/prescriptions/{id}` | PATIENT, DOCTOR | Detail + PDF URL |
| POST | `/prescriptions/{id}/amend` | DOCTOR | New version |
| GET | `/prescriptions/verify/{code}` | Public | QR verification (limited fields) |

---

## 3. Pharmacy APIs

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET/PUT | `/pharmacies/me/profile` | PHARMACIST | Pharmacy profile |
| GET/POST | `/pharmacies/me/catalog` | PHARMACIST | Medicine catalog |
| POST | `/pharmacy-orders` | PATIENT | Create order from Rx |
| GET | `/pharmacy-orders/me` | PATIENT | Order history |
| PATCH | `/pharmacy-orders/{id}/status` | PHARMACIST | Update fulfillment |

---

## 4. Laboratory APIs

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET/PUT | `/labs/me/profile` | LAB_TECHNICIAN | Lab profile |
| GET/POST | `/labs/me/tests` | LAB_TECHNICIAN | Test catalog |
| POST | `/lab-orders` | DOCTOR | Create order |
| GET | `/lab-orders/me` | PATIENT | Patient orders |
| POST | `/lab-orders/{id}/results` | LAB_TECHNICIAN | Upload results |
| POST | `/lab-orders/{id}/release` | LAB_TECHNICIAN | Release to patient |

---

## 5. Billing & Payment APIs

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/payments/intent` | PATIENT | Create payment intent |
| POST | `/payments/webhook` | System | Gateway webhook (HMAC) |
| GET | `/payments/me` | PATIENT | Payment history |
| POST | `/payments/{id}/refund` | ADMIN | Refund |
| GET | `/invoices/{id}` | PATIENT | Invoice PDF |

---

## 6. Telemedicine APIs

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/telemedicine/consent` | PATIENT | Accept telehealth terms |
| POST | `/telemedicine/sessions/{appointmentId}/join` | PATIENT, DOCTOR | Get room token |
| POST | `/telemedicine/sessions/{appointmentId}/end` | DOCTOR | End session |

---

## 7. Clinical & Insurance APIs (P1)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/clinical/visit-notes` | DOCTOR | Create visit summary |
| GET | `/clinical/visit-notes/me` | PATIENT | Patient view |
| CRUD | `/insurance/policies/me` | PATIENT | Insurance policies |

---

## 8. Estimated Endpoint Count

| Module | Endpoints |
|--------|-----------|
| Prescription | 8 |
| Pharmacy | 14 |
| Laboratory | 14 |
| Billing | 12 |
| Telemedicine | 6 |
| Insurance + Clinical | 10 |
| **Phase 2 total** | **~64** |
| **Platform total** | **~181** (with Phase 1) |

---

*End of DOC-27 — Phase 2 REST API Design v1.0*
