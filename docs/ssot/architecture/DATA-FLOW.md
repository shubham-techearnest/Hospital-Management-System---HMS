# Data Flow — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-DF-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## Primary clinical money path

```text
Register/Find patient → Appointment/OPD queue → Encounter
  → Orders (Lab/Rad/Rx/OT) → Results / Dispense
  → Invoice / Charge postings → Payment (cash/Razorpay)
  → Follow-up
```

## IPD / ED path

```text
ED arrival → Triage → Disposition
  → ADT/IPD admit → Bed assign → Nursing/orders
  → Transfer/Discharge → Housekeeping tasks (automation)
  → Charges / invoice
```

## Automation path

```text
Domain action → EventPublisher.publish
  → automation.hospital_events (+ outbox)
  → AutomationReactor
      → rules / tasks / approvals
      → ChargePostingService (if FEATURE_CHARGE_ENGINE)
      → other hooks (facility, etc.)
```

## Evidence

CODE-VERIFIED in `EventPublisher`, `AutomationReactor`, IPD/Lab/Pharmacy services, billing controllers.
