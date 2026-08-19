# HMS Roadmap — Phases HMS-0 through HMS-11

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-ROADMAP-001 |
| **Last Updated** | 2026-08-19 |
| **Status** | Living document |

---

## Overview

Health360 HMS expands the platform from consumer health + hospital subscription into full clinical operations. Work is delivered in twelve phases (HMS-0 … HMS-11), each with a Flyway migration boundary, backend module, RBAC slice, and portal UI where applicable.

---

## Phase summary

| Phase | Name | Focus | Migration | Status |
|-------|------|-------|-----------|--------|
| HMS-0 | Launch gate | Appointment list pagination fix | — | ✅ Done |
| HMS-1 | Clinical encounter foundation | Encounters, diagnoses, notes, orders, patient/doctor UIs | V30, V32 | ✅ Done |
| HMS-2 | OPD module | Desks, queue, walk-in/check-in, hospital OPD UI | V31 | ✅ Done |
| HMS-3 | IPD module | Admissions, wards, beds, nursing notes | V33 | ✅ Done |
| HMS-4 | ICU module | Critical care flows, monitoring hooks | V34 | ✅ Done |
| HMS-5 | Laboratory | Lab order fulfillment, results | V35 | ✅ Done |
| HMS-6 | Radiology | Imaging orders, reports | V36 | ✅ Done |
| HMS-7 | Operation theatre | Surgical scheduling, OT notes | V37 | ✅ Done |
| HMS-8 | Clinical pharmacy | Dispensing, MAR | V38 | ✅ Done |
| HMS-9 | Staff + RBAC | Receptionist, nurse, lab tech roles | V39 | ✅ Done |
| HMS-10 | Role dashboards | Aggregated KPIs per persona | — | ✅ Done |
| HMS-11 | Performance + security | Indexes, RBAC regression, golden-path tests | V40 | ✅ Done |

---

## HMS-1 completion criteria (2026-08-18)

- **Backend:** Convenience APIs (`/encounters/me`, `/doctor/me`, `/hospital/{id}`, check-in/start/complete)
- **Encounter numbers:** V32 sequence table with pessimistic locking (`OPD-{year}-{seq}`, `ENC-{year}-{seq}`)
- **OPD queue:** Paginated `GET /opd/queue` (Spring `Page`)
- **Web:** Patient `/patient/encounters`, Doctor `/doctor/opd` + `/doctor/encounters/:id`
- **Mobile:** Patient visits stack, Doctor OPD queue + encounter detail
- **Docs:** Stage 2 pack (this roadmap, OPD flow, domain model, API map)

---

## Dependencies between phases

```mermaid
flowchart LR
  HMS0[HMS-0 Appointments] --> HMS1[HMS-1 Encounters]
  HMS1 --> HMS2[HMS-2 OPD]
  HMS1 --> HMS3[HMS-3 IPD]
  HMS2 --> HMS5[HMS-5 Lab]
  HMS1 --> HMS5
  HMS1 --> HMS8[HMS-8 Pharmacy]
  HMS9[HMS-9 Staff RBAC] --> HMS2
  HMS9 --> HMS3
  HMS10[HMS-10 Dashboards] --> HMS2
  HMS10 --> HMS3
  HMS11[HMS-11 Hardening] --> HMS10
```

---

## Post-HMS — Phase 2 (in progress)

HMS phases HMS-0 … HMS-11 are **complete**. Next work follows [POST-HMS-PHASE-2-BRIDGE.md](../post-hms/POST-HMS-PHASE-2-BRIDGE.md):

| Sprint | Focus | Status |
|--------|-------|--------|
| P2-B1 | Billing schema + encounter invoices + manual payment | ✅ Backend (V41) |
| P2-B2 | Razorpay integration | ⏳ Planned |
| P2-Rx1 | E-prescription | ⏳ Planned |

---

## References

- **[README.md](./README.md)** — documentation index (start here)
- **[HMS-SPRINT-PLAN.md](./HMS-SPRINT-PLAN.md)** — detailed per-sprint plan + flows
- **[HMS-MASTER-FLOW.md](./HMS-MASTER-FLOW.md)** — generalized encounter-centric patterns
- [HMS-SPRINT-STATUS.md](./HMS-SPRINT-STATUS.md)
- [HMS-OPD-FLOW.md](./HMS-OPD-FLOW.md)
- [HMS-IPD-FLOW.md](./HMS-IPD-FLOW.md)
- [HMS-DOMAIN-MODEL.md](./HMS-DOMAIN-MODEL.md)
- [HMS-API-MAP.md](./HMS-API-MAP.md)
- [HEALTH360-HMS-ARCHITECTURE.md](./HEALTH360-HMS-ARCHITECTURE.md)
