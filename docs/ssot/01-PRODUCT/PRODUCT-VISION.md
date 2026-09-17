# Product Vision & Scope

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-PROD-001 |
| **Title** | Product Vision & Scope |
| **Version** | 1.1 |
| **Status** | CURRENT — PARTIALLY VERIFIED |
| **Last Updated** | 2026-09-17 |
| **Evidence Basis** | CODE-VERIFIED for CURRENT; DOCUMENT-VERIFIED / PROPOSED for FUTURE |

---

## What is Health360?

Health360 is a **multi-tenant digital healthcare platform** and **hospital operating system**: consumer health journeys plus hospital clinical and operational workflows on one identity and tenancy model.

**CURRENT MVP (CODE-VERIFIED):** SaaS hospital OS with patient/doctor portals, clinical HMS (OPD→Pharmacy), billing/payments, and HMS V2 ops (automation, ED/ADT, charges, supply chain, assets, insurance, blood, staff ops, command center, predictive heuristics) on **API + Web**. **Mobile** covers consumer and light staff shells, not full hospital ops.

---

## Mission (CURRENT framing)

Enable hospitals and patients to run care journeys with less duplicate entry, role-relevant UI, event-driven coordination, and shared engines for tasks, approvals, and charges.

---

## Target users / personas (CURRENT)

| Persona | Primary client | Evidence |
|---------|----------------|----------|
| Patient | Web + Mobile | portals exist |
| Doctor | Web + Mobile | portals exist |
| Hospital admin | Web (Mobile subset) | portals exist |
| Reception | Web + Mobile | portals exist |
| Nurse / ICU nurse | Web (Mobile worklist thin) | portals exist |
| Lab / Radiology / OT / Pharmacy staff | Web (Mobile worklist thin) | portals exist |
| Asset manager | Web | portal exists |
| Platform admin | Web + Mobile subset | portals exist |

---

## Business model (CURRENT)

Hospital-centric **subscriptions** with **plan feature flags** (`PlanFeatureKeys`). Solo practitioners modeled as clinic/hospital tenants (DOCUMENT-VERIFIED Phase-1.5 intent; CODE-VERIFIED subscription tables).

---

## Scope layers

### CURRENT (implemented)

Identity/RBAC/MFA foundation · Hospital org · Scheduling · OPD/IPD/ICU/Lab/Rad/OT/Pharmacy · Billing/Razorpay · Documents/letterhead · Assets/EAM · Automation/My Work · ED/ADT · Charge engine (DRY_RUN default) · Inventory/Procurement · Facility · Insurance · Blood · Staff ops · Command center · Predictive heuristics · Web 12 portals · Mobile partial

### NEXT (near-term backlog — not committed until approved)

Release hygiene · CI branch alignment · Charge POST cutover decision · Notification templates · Mobile My Work · ECO SMS/QR self check-in

### FUTURE / PROPOSED (vision only)

Ambulance · Home nursing/healthcare · Physiotherapy product · Full telemedicine product · Chronic care programs · Provider marketplace scale · LIMS/RIS/PACS depth · AI clinical decision support · FHIR/ABDM claims · Object storage (S3) · Formal compliance certifications

---

## Multi-tenancy & hospital model (CURRENT)

- `tenant_id` on auditable entities  
- Hospitals and branches  
- Feature gating per hospital subscription  
- Hospital/branch scope on operational APIs  

See [architecture/SYSTEM-ARCHITECTURE.md](../architecture/SYSTEM-ARCHITECTURE.md) and [api/AUTHENTICATION.md](../api/AUTHENTICATION.md).
