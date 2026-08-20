# ADR-005: Prescription Separated from Pharmacy Fulfillment

| Status | PROPOSED |

## Decision
Clinical prescriptions belong to encounter (`clinical.prescriptions`). Pharmacy module consumes Rx for dispensing, inventory, batch tracking.

## Rejected
Single combined prescription-dispense table.
