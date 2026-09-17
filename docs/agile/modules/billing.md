# Billing — Revenue Cycle

## Module Summary

Encounter checkout payments, hospital invoices, Razorpay online intents, charge engine (DRY_RUN/POST), charge exceptions, and charge→invoice linkage. Theme **THM-004**. Phase C: payments/invoices **IMPLEMENTED**; charge attach/POST **PARTIAL**.

## Current Implementation Status

| Feature | Overlay |
|---------|---------|
| FEAT-BIL-INV-001 | IMPLEMENTED |
| FEAT-BIL-PAY-001 | IMPLEMENTED |
| FEAT-BIL-PAY-002 | IMPLEMENTED |
| FEAT-BIL-XCP-001 | IMPLEMENTED |
| FEAT-BIL-CHG-001 | PARTIALLY_IMPLEMENTED |
| FEAT-BIL-CHG-002 | PARTIALLY_IMPLEMENTED |
| FEAT-INS-TPA-001 | UNKNOWN |

**Verified subset completeness:** treat Partial as incomplete → Implemented 4 / (4+2) = **~67%** of verified billing features.

## Actors

- RECEPTIONIST, PATIENT, HOSPITAL_ADMIN / billing staff

## Epic(s)

- EPIC-BIL-001, EPIC-BIL-002, EPIC-INS-001 (insurance UNKNOWN)

## Feature Groups

- FG-BIL-INV, FG-BIL-PAY, FG-BIL-CHG, FG-BIL-XCP, FG-INS-TPA

## Features

See catalog + overlay.

## Implemented Features

- Invoice list/detail
- Checkout payments
- Razorpay intents (sandbox caveats)
- Charge exceptions UI/API

## Partially Implemented Features

- Charge capture engine POST semantics
- Charge → invoice source linkage (BE attach exists; FE unwired)

## Planned Features

- US-BIL-CHG-003 wire attach + POST invoice lines
- SEC-PAY-001 webhook secret hardening
- Insurance/TPA after verification

## User Stories

### US-BIL-PAY-001 / US-BIL-PAY-002 / US-BIL-INV-001

| Field | Value |
|-------|-------|
| Status | IMPLEMENTED |
| Points | — Baseline |
| Evidence | Phase C #8; V41/V73 |

### US-BIL-CHG-001 / US-BIL-CHG-002

| Field | Value |
|-------|-------|
| Status | PARTIAL |
| Evidence | Phase C #12; BUG-BIL-001 |

### US-BIL-CHG-003

| Field | Value |
|-------|-------|
| Actor | HOSPITAL_ADMIN |
| Story | As billing ops, I want FE attach and POST invoice lines, so that charges become invoices continuously. |
| Status | PLANNED |
| Priority | P1 |
| Points | 8 |
| Dependencies | BUG-BIL-001 |

## Bugs

- BUG-BIL-001 Charge attach / POST invoice lines

## Technical Debt

- TECH-BIL-001 POST policy
- SEC-PAY-001 sandbox webhook secret

## Gaps

- GAP-BIL-001, GAP-PAY-001

## Recommended Next Work

Sprint 02: BUG-BIL-001 + SEC-PAY-001. Workflow: [WF-BIL-001](../evidence/E2E_WORKFLOW_CATALOG.md).
