# Master Requirements — Canonical Baseline

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-REQ-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Rule** | Sole requirements baseline going forward |

This catalog **normalizes** requirements evidenced by implemented modules + approved HMS V2 decisions. It is not a dump of every historical DOC-03/FR line.

Priority: `P0` must-have current product · `P1` near-term · `P2` later · `P3` vision.

Status: aligns with FEATURE-INVENTORY.

---

## REQ-IAM — Identity & access

### REQ-IAM-001 Secure authentication
- **Title:** User authentication  
- **Description:** Users authenticate with email/password; receive JWT access + refresh.  
- **Actor:** All users  
- **Trigger:** Login  
- **Functional:** Issue RS256 JWT; lockout on repeated failures; logout blacklists jti.  
- **Acceptance:** Valid credentials → tokens; invalid → error; logout invalidates access.  
- **Priority:** P0 · **Status:** IMPLEMENTED · **Source:** CODE + Phase-1 IAM

### REQ-IAM-002 RBAC
- **Description:** Permissions gate APIs and UI routes by role.  
- **Priority:** P0 · **Status:** IMPLEMENTED · **Source:** V2 RBAC + controllers

### REQ-TEN-001 Multi-tenant hospital SaaS
- **Description:** Data scoped by tenant; hospitals subscribe to plans with feature flags.  
- **Priority:** P0 · **Status:** IMPLEMENTED · **Source:** Phase-1.5 + FeatureAccessService

---

## REQ-CLIN — Clinical operations

### REQ-OPD-001 OPD queue operations
- Desk registration/walk-in, queue call/start/skip/recall, doctor consult linkage.  
- **Priority:** P0 · **Status:** IMPLEMENTED · **Source:** HMS OPD + P2 features

### REQ-IPD-001 Inpatient lifecycle
- Admit, bed assign, transfer, discharge with events/tasks.  
- **Priority:** P0 · **Status:** IMPLEMENTED · **Source:** IPD + HMS-12/13

### REQ-ED-001 Emergency + ADT
- ED arrival/triage/disposition; ADT facade over IPD/ICU beds.  
- **Priority:** P0 · **Status:** IMPLEMENTED · **Source:** HMS-13 / V91

### REQ-DX-001 Ancillary orders
- Lab, radiology, OT, pharmacy order fulfillment.  
- **Priority:** P0 · **Status:** IMPLEMENTED · **Source:** HMS-5…8

---

## REQ-REV — Revenue

### REQ-BIL-001 Invoicing & payments
- Create invoices, record payments, optional Razorpay.  
- **Priority:** P0 · **Status:** IMPLEMENTED

### REQ-CHG-001 Event charge engine
- Catalog-triggered charge postings; exceptions; attach to invoice.  
- **Priority:** P1 · **Status:** PARTIALLY_IMPLEMENTED (DRY_RUN default) · **Source:** HMS-14/24

---

## REQ-OPS — Hospital operations

### REQ-AUT-001 Automation platform
- Domain events create tasks/approvals; escalation job.  
- **Priority:** P0 · **Status:** IMPLEMENTED (templates deferred)

### REQ-INV-001 Inventory & procurement
- Stock + PR/PO/GRN.  
- **Priority:** P1 · **Status:** IMPLEMENTED · **Source:** HMS-15/16

### REQ-AST-001 Asset / facility
- Asset registry/maintenance; facility work orders.  
- **Priority:** P1 · **Status:** IMPLEMENTED · **Source:** HMS-17/18

### REQ-EXT-001 Insurance & blood & staff ops
- Pre-auth/claims; blood bank; roster/leave.  
- **Priority:** P1 · **Status:** IMPLEMENTED · **Source:** HMS-19…21

### REQ-CC-001 Command center & predictive
- Ops snapshot + heuristic insights.  
- **Priority:** P1 · **Status:** IMPLEMENTED · **Source:** HMS-22/23

---

## REQ-CLI — Clients

### REQ-WEB-001 Role portals
- Web portals for all operational roles.  
- **Priority:** P0 · **Status:** IMPLEMENTED

### REQ-MOB-001 Mobile access
- Mobile for patient/doctor/reception core journeys; hospital ops optional.  
- **Priority:** P1 · **Status:** PARTIALLY_IMPLEMENTED

---

## REQ-VIS — Vision (not committed)

Ambulance, homecare, physiotherapy product, AI CDS, full marketplace — **P3 / PLANNED** unless separately approved. See PRODUCT-ROADMAP FUTURE.

---

## Completeness note

Historical FR inventories in Phase-1 DOC-03 remain HISTORICAL evidence. New work must add REQ-* here first.
