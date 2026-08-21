# P2-F5 docs (01–14 summary)

**BR:** OPD checkout after visit — issue invoice + collect cash/UPI/card.

**Stories:** US-BILL-010 create OPD invoice; US-BILL-011 record payment; US-BILL-012 list invoices.

**FR:** OPD-REQ-005 — UI on V41 invoice/payment APIs.

**Workflow:** Complete encounter → Reception checkout → Create invoice lines → Collect payment → PAID.

**Architecture:** Reuse `billing.*` (P2-B1); no parallel billing schema.

**DB V49:** RBAC only for RECEPTIONIST (`billing:invoice:*`, `billing:payment:*`).

**API:** Existing create/list/get/pay + `GET /billing/encounters/{id}/invoice`.

**Web routes:** `/reception/checkout/:encounterId`, `/hospital/billing/invoices`, `/hospital/billing/invoices/:id`.

**Test:** Extend billing IT for encounter lookup + receptionist role if seeded.
