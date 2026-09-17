# Dependency Matrix

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-DEP-MAT-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## Clinical chain

```text
Patient → Appointment/OPD → Encounter → Orders
  → Lab / Radiology / Pharmacy / OT
  → Results / Dispense
  → Billing / Charges
  → Follow-up / Tasks
```

## IPD / ED chain

```text
ED Visit → Disposition → ADT/IPD Admission → Bed
  → Nursing / Orders → Discharge → Facility tasks → Bed available
```

## Supply chain

```text
Procurement PR → Approval → PO → GRN → Inventory stock
Asset procure/register → Maintenance → Facility WO (related ops)
```

## Platform dependencies

| Depends on | Module |
|------------|--------|
| IAM + Tenant | Everything |
| Hospital/Branch | All hospital ops |
| Subscription features | Gated modules |
| EventPublisher | Automation consumers |
| Encounter | Clinical orders & many charges |

## External

Razorpay · MSG91 (optional) · Expo Push · PostgreSQL · Redis (optional)
