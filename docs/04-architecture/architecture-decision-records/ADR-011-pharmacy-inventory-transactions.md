# ADR-011: Pharmacy Inventory Transaction Model

| Status | PROPOSED |

## Decision
Ledger-style `pharmacy.stock_transactions` with batch reference; no negative stock; dispense = outbound transaction linked to Rx/invoice.

## Migration
V46+ (Sprint 9–10).
