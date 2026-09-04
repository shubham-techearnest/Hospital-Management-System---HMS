# P2-B2 — Razorpay Online Payments (Phase F)

| Attribute | Value |
|-----------|-------|
| **Document ID** | P2-B2-FLOW-001 |
| **Last Updated** | 2026-09-04 |
| **Sprint** | Phase F / P2-B2 |

---

## Goal

Let patients pay encounter invoices online and let hospitals renew SaaS subscriptions via Razorpay (sandbox by default).

---

## Config

Root `.env` / `.env.example` (leave blank until you have keys):

```bash
RAZORPAY_MODE=sandbox
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

```yaml
health360.payments.razorpay:
  mode: sandbox | live
  key-id: ${RAZORPAY_KEY_ID}
  key-secret: ${RAZORPAY_KEY_SECRET}
  webhook-secret: ${RAZORPAY_WEBHOOK_SECRET}
```

- **Sandbox + blank keys:** backend creates `order_sandbox_*` orders; frontend confirms via `/confirm-sandbox`.
- **Sandbox/live + keys:** real Razorpay Orders API + Checkout.js; capture via webhook.

Webhook URL: `POST /api/v1/billing/payments/webhook` (HMAC `X-Razorpay-Signature`).

### Desk payment methods

Reception / hospital invoice collection supports: **Cash**, **Online**, **UPI**, **Card**, **Other**.  
Patient portal **Pay** uses gateway **Online** (Razorpay / sandbox).

---

## Patient invoice pay

1. `POST /api/v1/billing/invoices/{id}/payment-intents`
2. Checkout.js (or sandbox confirm)
3. Webhook `payment.captured` → payment `CAPTURED`, invoice `PAID` / `PARTIALLY_PAID`

## Hospital SaaS renew

1. `POST /api/v1/billing/saas/payment-intents` (hospital admin)
2. Or `POST /api/v1/admin/hospitals/{id}/subscription/payment-intents`
3. On capture → `billing.saas_invoices` paid + subscription `endDate` extended + history `RENEWAL`

---

## Schema

Migration **V73**: `gateway_order_id` / `idempotency_key` on `billing.payments`; `billing.saas_invoices`.
