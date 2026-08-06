# DOC-26: Health360 AI — Phase 2 Database Design Specification

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-26 |
| **Title** | Phase 2 Database Design Specification |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-06](../../phase-1/architecture/06-DATABASE-DESIGN-SPECIFICATION.md), [DOC-25](./25-PHASE-2-DOMAIN-MODEL.md) |

---

## 1. Overview

Phase 2 adds PostgreSQL schemas via Flyway **V24+**. All tables include `tenant_id`, audit columns, and soft delete per Phase 1 conventions.

---

## 2. New Schemas

| Schema | Purpose |
|--------|---------|
| `prescription` | E-prescriptions and line items |
| `pharmacy` | Pharmacies, catalog, orders |
| `laboratory` | Labs, tests, orders, results |
| `billing` | Invoices, payments, refunds |
| `telemedicine` | Sessions, consents |
| `insurance` | Policies, claim references |
| `clinical` | Visit notes, diagnosis codes |

---

## 3. Core Tables (Summary)

### 3.1 prescription.prescriptions

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| tenant_id | UUID FK | |
| appointment_id | UUID FK scheduling.appointments | |
| doctor_id | UUID | |
| patient_id | UUID | |
| status | VARCHAR(32) | |
| version | INT | Amendment tracking |
| pdf_storage_key | VARCHAR | S3 key |
| issued_at | TIMESTAMPTZ | |

### 3.2 pharmacy.pharmacy_orders

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| prescription_id | UUID FK | nullable for OTC future |
| pharmacy_id | UUID FK | |
| patient_id | UUID | |
| status | VARCHAR(32) | lifecycle |
| total_amount | DECIMAL(12,2) | |
| payment_id | UUID FK billing.payments | |

### 3.3 laboratory.lab_orders / lab_results

Standard order + result tables with `released_at` gate for patient visibility.

### 3.4 billing.payments

| Column | Type | Notes |
|--------|------|-------|
| gateway | VARCHAR | RAZORPAY, STRIPE |
| gateway_payment_id | VARCHAR UNIQUE | Idempotency |
| amount | DECIMAL | |
| status | VARCHAR | PENDING, CAPTURED, FAILED, REFUNDED |
| entity_type | VARCHAR | APPOINTMENT, PHARMACY_ORDER, LAB_ORDER |
| entity_id | UUID | |

---

## 4. Migration Plan

| Version | Sprint | Content |
|---------|--------|---------|
| V24 | P2-S1 | prescription schema |
| V25 | P2-S2 | pharmacy schema |
| V26 | P2-S3 | laboratory schema |
| V27 | P2-S4 | billing schema |
| V28 | P2-S5 | telemedicine + clinical lite |
| V29 | P2-S6 | insurance schema |

**Estimated new tables:** ~35 (Phase 2 total platform ~87)

---

## 5. Indexing Strategy

- `payments(gateway_payment_id)` UNIQUE
- `prescriptions(appointment_id)` — one active Rx per visit policy (configurable)
- `pharmacy_orders(patient_id, status, created_at DESC)`
- `lab_results(patient_id, released_at DESC)`

---

*End of DOC-26 — Phase 2 Database Design v1.0*
