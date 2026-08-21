# P2-F5 — OPD Billing UI

| Feature ID | P2-F5 |
| Epic | EPIC-10 Billing |
| Sprint | 7 |
| Release | R2 |
| **Approval Status** | **APPROVED — IN DEVELOPMENT** (proceed) |
| Approved | 2026-08-21 |

## Goal

Reception and hospital staff create encounter invoices and record manual payments using existing V41 billing APIs.

## Scope

- **V49** — grant RECEPTIONIST billing RBAC
- `GET /billing/encounters/{encounterId}/invoice` — lookup active invoice for checkout
- Web: reception checkout, hospital invoice list/detail, patient invoice list
- Integration coverage for receptionist payment path

## Out of scope

- Payment gateways (Razorpay/Stripe)
- Refunds, PDF, tax engine, insurance
- Auto line items from lab/Rx

## Package

See `P2-F5-01-through-14.md`.
