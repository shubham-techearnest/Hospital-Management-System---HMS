# Product Scope — Health360 HMS Program

| Document ID | PROD-SCOPE-001 |
| Status | DRAFT |

---

## In scope (this program)

| Area | Description |
|------|-------------|
| Patient registry | UHID/MRN, hospital registration, duplicate detection, search |
| OPD completion | Arrival lifecycle, queue skip/recall, encounter vitals, consultation, e-Rx, billing UI |
| Diagnostics hardening | Lab/radiology barcode, alerts, billing gates |
| Pharmacy | Inventory, batches, dispensing rules, returns |
| IPD completion | Admission workflow, bed movement, nursing, rounds, MAR mobile, discharge clearance |
| Billing & payments | Packages, discounts, Razorpay, receipts, refunds (phased) |
| Insurance/TPA | Policies, pre-auth, claims (Phase 5+) |
| Mobile HMS | Nurse, reception, doctor IPD (phased) |
| Governance | Docs, traceability, UAT, release process |

---

## Explicitly out of scope (unless later CR)

| Item | Reason |
|------|--------|
| Rewrite to microservices | ADR-001 modular monolith |
| Web migration to Next.js | Preserve React+Vite |
| Mobile migration to Flutter | Preserve Expo RN |
| Parallel `PatientVisit` table | ADR-002 encounter hub |
| Full LIS/RIS/PACS replacement | Integrate via orders/reports; not PACS archive |
| Blood bank, CSSD, diet, ambulance modules | Phase 6+ readiness only |
| AI diagnosis / CDSS beyond rule-based Rx warnings | Future |
| Multi-country regulatory certification pack | Separate compliance program |
| Replacing Phase 1 consumer health app scope | Extend, not remove |

---

## Preserved as-built (do not rebuild)

- HMS-0…11 modules (clinical, OPD, IPD, ICU, lab, rad, pharmacy, OT, staff, dashboards)
- IAM JWT + RBAC framework
- Flyway V1–V41 schema
- Web 11-role portals (extend)
- Mobile patient/doctor/hospital admin baseline

---

## Assumptions (pending confirmation)

- Single tenant MVP with `tenant_id` column preserved for future multi-tenant
- One hospital group per deployment initially; branch-scoped operations
- INR currency for billing Phase 1; Razorpay India primary gateway
- English UI first; i18n later
