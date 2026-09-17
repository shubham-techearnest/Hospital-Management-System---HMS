# Modules & Clinical/Ops Workflows

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-MOD-001 |
| **Version** | 1.1 |
| **Status** | CURRENT — CODE VERIFIED |
| **Last Updated** | 2026-09-17 |
| **Evidence Basis** | CODE-VERIFIED packages + Flyway; former HMS module-flow docs reconciled then deleted |

---

## Encounter-centric clinical pattern (CURRENT)

Every clinical event attaches to **`clinical.encounters`** for one patient. Department modules extend the encounter; they do not duplicate patients.

```text
Patient → Appointment/OPD → Encounter
  → Orders (Lab / Rad / Rx / OT)
  → Results / Dispense
  → Invoice / Charge postings → Payment
  → Follow-up / Tasks
```

## Automation pattern (CURRENT MVP)

```text
Domain action → EventPublisher → hospital_events (+ outbox)
  → AutomationReactor → Rules / Tasks / Approvals / ChargePosting / hooks
```

Configurable workflow designer UI and notification **templates**: **NOT IMPLEMENTED** (inline strings + in-code rules).

## Platform reusable model (TARGET framing)

```text
Event → Rule → Action → Task → State / Notification / Billing / Inventory / Asset / Audit
```

Rule configurability and template notifications: **PROPOSED / PARTIAL**.

---

## Module catalog (CURRENT)

| Module | API base | DB schema(s) | Web | Mobile | Notes |
|--------|----------|--------------|-----|--------|-------|
| IAM / Users | `/api/v1/auth`, `/users` | `iam` | Yes | Yes | JWT RBAC |
| Hospital / Staff | `/hospitals`, `/hospital/staff` | `hospital` | Yes | Partial | |
| Doctor | `/doctors` | `doctor` | Yes | Yes | |
| Patient / UHID registry | `/patients`, `/hospital/patients` | `patient`, `hospital` | Yes | Yes | |
| Scheduling | `/scheduling` | `scheduling` | Yes | Partial | |
| Clinical encounters | `/clinical` | `clinical` | Yes | Partial | Hub |
| OPD | `/opd` | `opd` | Yes | Partial | Queue/desk |
| IPD / ADT | `/ipd`, `/adt` | `ipd` | Yes | No | Beds in `ipd` |
| ICU | `/icu` | `icu` | Yes | Thin | |
| Emergency | `/emergency` | `emergency` | Yes | No | |
| Lab | `/lab` | `laboratory` | Yes | Thin | |
| Radiology | `/radiology` | `radiology` | Yes | Thin | |
| OT | `/ot` | `ot` | Yes | Thin | |
| Pharmacy | `/pharmacy` | `pharmacy` | Yes | Thin | Dispense → `MEDICATION_DISPENSED` |
| Billing / Charges | `/billing`, `/billing/charges` | `billing` | Yes | Partial | DRY_RUN charges default |
| Documents | `/api/v1` docs | `clinical` / letterhead | Yes | No | |
| Assets / EAM | `/assets` | `asset` | Yes | No | |
| Automation / Approvals / Tasks | `/approvals`, `/tasks` | `automation`, `tasks`, `workflow` | Yes | No | |
| Inventory | `/inventory` | `inventory` | Yes | No | |
| Procurement | `/procurement` | `procurement` | Yes | No | |
| Facility | `/facility` | `facility` | Yes | No | |
| Insurance | `/insurance` | `insurance` | Yes | No | |
| Blood | `/blood` | `blood` | Yes | No | |
| Staff ops | `/staff-ops` | `staffops` | Yes | No | |
| Command center | `/command-center` | flag V101 | Yes | No | |
| Predictive | `/predictive` | `automation` insights | Yes | No | Heuristics |
| Analytics / Search | `/analytics`, `/search` | `analytics`, `location` | Yes | Partial | |
| Subscriptions | `/admin/plans`, hospital sub | `shared` | Yes | Partial | |
| Partners | `/partners` | `org` | Admin | Thin | Marketplace MVP only |

---

## Key workflows (CURRENT)

### OPD
Find/register patient (UHID) → queue → call/start → encounter notes/Dx/Rx/labs → checkout gate → invoice/payment.

### IPD
Admit (+ optional request) → bed assign (`BED_ASSIGNED`) → care/orders → transfer/discharge → events → housekeeping tasks → bed available.

### ED → ADT
Arrival → triage → disposition → admit via ADT facade over IPD/ICU beds (no separate bed tables) — **ADR locked 2026-09-15**.

### Ancillary
Order from encounter → department worklist → fulfill/release → optional charge posting on events (admit, lab release, medication dispensed).

### Supply
PR → approval → PO → GRN → inventory stock; assets register → PM/breakdown tickets.

### Ops intel
Command Center snapshot counts; predictive refresh (bed/ED/SLA/stock/leave heuristics); CRITICAL → My Work task type.

---

## Delivery eras (historical labels)

| Era | Label | Status |
|-----|-------|--------|
| Foundation | Phase-1 / Phase-1.5 | Done (MVP) |
| Clinical HMS | HMS-0…11 | Done |
| Billing/assets bridge | Post-HMS | Done |
| Hospital OS V2 | HMS-12…24 | Done (V103 tip) |

Detailed per-slice tables lived in deleted HMS roadmap docs; status is reflected in [FEATURE-INVENTORY.md](./FEATURE-INVENTORY.md) and [SPRINT-CATALOG.md](./SPRINT-CATALOG.md).
