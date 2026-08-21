# Health360 HMS — NEXT ACTION

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-NEXT-001 |
| **Status** | **ACTIVE** |
| **Last Updated** | 2026-08-21 |

---

## CURRENT STATUS

**P2-F5 IMPLEMENTATION COMPLETE — IN QA**

- Docs: [09-features/P2-opd/P2-F5/](./09-features/P2-opd/P2-F5/)
- V49: RECEPTIONIST billing RBAC
- API: `GET /billing/encounters/{id}/invoice` (+ existing V41 invoice/payment APIs)
- Web: Reception/Hospital checkout, hospital invoice list/detail, patient invoices

---

## IMMEDIATE NEXT ACTION

1. Run `BillingIntegrationTest` (Docker)
2. UAT: issue invoice + collect payment from OPD queue Checkout
3. Phase 2 OPD (R2) feature set complete for board — plan next epic/release as needed

---

## Recent

| Item | Status | Date |
|------|--------|------|
| P2-F1 Appointment arrival | IN QA | 2026-08-21 |
| P2-F2 Queue skip/recall | IN QA | 2026-08-21 |
| P2-F3 Structured consultation | IN QA | 2026-08-21 |
| P2-F4 E-prescription | IN QA | 2026-08-21 |
| P2-F5 OPD billing UI | IN QA | 2026-08-21 |
