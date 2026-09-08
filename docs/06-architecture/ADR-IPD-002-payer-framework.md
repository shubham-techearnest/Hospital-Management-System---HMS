# ADR-IPD-002 — Country-neutral payer framework

| Field | Value |
|-------|--------|
| Status | **Accepted** |
| Date | 2026-09-08 |
| Phase | I6 |

## Context

IPD hospitals need self-pay, insurance, TPA, corporate, and government payers without hard-coding insurer products. India needs cashless / reimbursement / co-pay / package flags; other countries must not be blocked by India-only enums.

## Decision

1. **Payer modes** are generic codes on `ipd.admission_payers.payer_mode`: `SELF_PAY`, `INSURANCE`, `TPA`, `CORPORATE`, `GOVERNMENT`.
2. **Claim modes** (optional) are country-pack driven: `CASHLESS`, `REIMBURSEMENT`, `CO_PAY`, `PACKAGE` for India; stored on the payer row when relevant.
3. **Authorizations** live in `ipd.payer_authorizations` with types `ELIGIBILITY` → `PRE_AUTH` → `ENHANCEMENT` → `FINAL_AUTH` and statuses `REQUESTED` / `APPROVED` / `DENIED` / `EXPIRED` / `CANCELLED`.
4. **Service gate** `IPD_INSURANCE_TPA` hides insurance workflows for self-pay-only hospitals.
5. **Country config** (`hospital.ipd_service_settings.country_config`) holds flags such as `requirePreAuthWhenInsurance` and `requireFinancialClearanceBeforeDischarge` — defaults off so self-pay works without insurance UI.
6. Billing remains encounter-scoped (`billing.invoices`); IPD only orchestrates charges, deposits, interim bills, and clearance.

## Consequences

- Self-pay hospitals never need insurer master data.
- TPA hospitals can require approved pre-auth before financial clearance/discharge when configured.
- Future insurer catalogs can attach to `payer_name` / policy fields without schema renames.
