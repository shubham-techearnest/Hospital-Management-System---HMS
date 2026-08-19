# HMS API Map — Clinical & OPD

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-API-001 |
| **Last Updated** | 2026-08-19 |
| **Base URL** | `/api/v1` |

All responses use the standard envelope: `{ "success": true, "data": … }`. Paginated endpoints return Spring `Page` inside `data`.

---

## Clinical — Encounters

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/clinical/encounters` | `clinical:encounter:write` | Create encounter |
| GET | `/clinical/encounters/me` | `clinical:encounter:read` | Patient's own encounters (paginated) |
| GET | `/clinical/encounters/doctor/me` | `clinical:encounter:read` | Doctor's encounters; `todayOnly`, `status` filters |
| GET | `/clinical/encounters/hospital/{hospitalId}` | `clinical:encounter:read` | Hospital-scoped list (admin) |
| GET | `/clinical/encounters` | `clinical:encounter:read` | Filter by `patientId`, `hospitalId`, `doctorId` |
| GET | `/clinical/encounters/{id}` | `clinical:encounter:read` | Encounter detail |
| POST | `/clinical/encounters/{id}/check-in` | `clinical:encounter:write` | → WAITING |
| POST | `/clinical/encounters/{id}/start` | `clinical:encounter:write` | → IN_PROGRESS |
| POST | `/clinical/encounters/{id}/complete` | `clinical:encounter:write` | → COMPLETED |
| PATCH | `/clinical/encounters/{id}/status` | `clinical:encounter:write` | Generic status transition |

### Encounter child resources

| Method | Path | Description |
|--------|------|-------------|
| POST/GET | `/clinical/encounters/{id}/diagnoses` | Add / list diagnoses |
| POST/GET | `/clinical/encounters/{id}/notes` | Add / list clinical notes |
| POST/GET | `/clinical/encounters/{id}/orders` | Create / list orders |
| GET | `/clinical/encounters/{id}/orders/{orderId}` | Order detail |

---

## OPD

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/opd/desks` | `opd:desk:read` / `write` | List / create desks |
| GET | `/opd/queue` | `opd:queue:read` | **Paginated** queue; params: `hospitalId`, `branchId`, `queueDate`, `status`, `deskId`, `page`, `size` |
| POST | `/opd/registrations/walk-in` | `opd:registration:write` | Walk-in → encounter + queue |
| POST | `/opd/registrations/check-in` | `opd:registration:write` | Appointment check-in |
| POST | `/opd/queue/{id}/call` | `opd:queue:write` | Call patient |
| POST | `/opd/queue/{id}/start` | `opd:queue:write` | Start service |
| POST | `/opd/queue/{id}/complete` | `opd:queue:write` | Complete queue entry |
| POST | `/opd/queue/{id}/cancel` | `opd:queue:write` | Cancel queue entry |

---

## IPD

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST/GET | `/ipd/wards` | `ipd:ward:write` / `read` | Ward master |
| POST/GET | `/ipd/rooms` | `ipd:ward:write` / `read` | Rooms in ward (`wardId`) |
| POST/GET | `/ipd/beds` | `ipd:bed:write` / `read` | Beds; filter by `status` |
| POST/GET | `/ipd/admissions` | `ipd:admission:write` / `read` | Admit / list (paginated) |
| GET | `/ipd/admissions/{id}` | `ipd:admission:read` | Admission detail |
| POST/GET | `/ipd/admissions/{id}/rounds` | `ipd:round:write` / `read` | Doctor/nursing rounds |
| POST | `/ipd/admissions/{id}/discharge` | `ipd:discharge:write` | Discharge + release bed |

---

## ICU

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST/GET | `/icu/units` | `icu:unit:write` / `read` | ICU unit master |
| POST/GET | `/icu/beds` | `icu:unit:write` / `read` | Beds; filter by `status` |
| POST/GET | `/icu/stays` | `icu:stay:write` / `read` | Admit / list (paginated) |
| GET | `/icu/stays/{id}` | `icu:stay:read` | Stay detail |
| POST | `/icu/stays/{id}/discharge` | `icu:stay:write` | Discharge + release bed |
| POST/GET | `/icu/stays/{id}/monitoring-records` | `icu:monitoring:write` / `read` | Append-only monitoring |
| POST/GET | `/icu/equipment` | `icu:equipment:write` / `read` | Equipment registry |
| POST | `/icu/equipment/{id}/assign` | `icu:equipment:write` | Assign to stay |
| POST | `/icu/equipment-assignments/{id}/release` | `icu:equipment:write` | Release equipment |
| GET | `/icu/stays/{id}/equipment-assignments` | `icu:equipment:read` | Assignments for stay |

---

## Laboratory

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST/GET | `/lab/laboratories` | `lab:catalog:write` / `read` | Lab location master |
| POST/GET | `/lab/tests` | `lab:catalog:write` / `read` | Test catalog (`laboratoryId` or `hospitalId`+`branchId`) |
| POST/GET | `/lab/tests/{id}/parameters` | `lab:catalog:write` / `read` | Result parameters |
| GET | `/lab/worklist/pending` | `lab:order:read` | Unreceived clinical LAB order items |
| POST/GET | `/lab/orders` | `lab:order:write` / `read` | Receive / list lab orders (paginated) |
| GET | `/lab/orders/{id}` | `lab:order:read` | Lab order detail |
| POST | `/lab/orders/{id}/collect-sample` | `lab:order:write` | Sample collection |
| POST | `/lab/orders/{id}/results` | `lab:result:write` | Enter draft results |
| POST | `/lab/orders/{id}/verify` | `lab:result:verify` | Verify all results |
| POST | `/lab/orders/{id}/release` | `lab:report:release` | Release report to encounter |
| GET | `/lab/encounters/{id}/reports` | `lab:order:read` or `clinical:encounter:read` | Released lab reports |

---

## Radiology

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST/GET | `/radiology/modalities` | `radiology:modality:write` / `read` | Imaging modality catalog |
| GET | `/radiology/worklist/pending` | `radiology:order:read` | Unreceived clinical IMAGING order items |
| POST/GET | `/radiology/orders` | `radiology:order:write` / `read` | Receive / list imaging orders (paginated) |
| GET | `/radiology/orders/{id}` | `radiology:order:read` | Imaging order detail |
| POST | `/radiology/orders/{id}/schedule` | `radiology:order:write` | Schedule study |
| POST | `/radiology/orders/{id}/perform` | `radiology:order:write` | Mark study performed |
| POST | `/radiology/orders/{id}/report` | `radiology:report:write` | Enter draft report |
| POST | `/radiology/orders/{id}/verify` | `radiology:report:verify` | Verify report |
| POST | `/radiology/orders/{id}/release` | `radiology:report:release` | Release report to encounter |
| GET | `/radiology/encounters/{id}/reports` | `radiology:order:read` or `clinical:encounter:read` | Released imaging reports |

---

## Operation Theatre

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST/GET | `/ot/theatres` | `ot:theatre:write` / `read` | Operation theatre catalog |
| GET | `/ot/worklist/pending` | `ot:procedure:read` | Unreceived clinical PROCEDURE order items |
| POST/GET | `/ot/procedures` | `ot:procedure:write` / `read` | Receive / list procedures (paginated) |
| GET | `/ot/procedures/{id}` | `ot:procedure:read` | Procedure detail |
| POST | `/ot/procedures/{id}/schedule` | `ot:schedule:write` | Schedule in theatre (409 on conflict) |
| POST | `/ot/procedures/{id}/team` | `ot:procedure:write` | Add team member |
| POST | `/ot/procedures/{id}/notes` | `ot:procedure:write` | Add pre/intra/post-op note |
| POST | `/ot/procedures/{id}/start` | `ot:procedure:write` | Start procedure |
| POST | `/ot/procedures/{id}/complete` | `ot:procedure:write` | Complete procedure |
| GET | `/ot/encounters/{id}/procedures` | `ot:procedure:read` or `clinical:encounter:read` | Completed procedures |

---

## Clinical Pharmacy

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST/GET | `/pharmacy/medicines` | `pharmacy:medicine:write` / `read` | Medicine catalog |
| GET | `/pharmacy/worklist/pending` | `pharmacy:medication:read` | Unreceived clinical MEDICATION orders |
| POST/GET | `/pharmacy/orders` | `pharmacy:medication:write` / `read` | Receive / list medication orders (paginated) |
| GET | `/pharmacy/orders/{id}` | `pharmacy:medication:read` | Medication order detail |
| POST | `/pharmacy/orders/{id}/verify` | `pharmacy:medication:write` | Verify prescription |
| POST | `/pharmacy/order-items/{id}/plan` | `pharmacy:medication:write` | Plan dispense |
| POST | `/pharmacy/order-items/{id}/administer` | `pharmacy:medication:administer` | Record MAR dose |
| POST | `/pharmacy/order-items/{id}/complete` | `pharmacy:medication:write` | Complete medication line |
| GET | `/pharmacy/encounters/{id}/administrations` | `pharmacy:medication:read` or `clinical:encounter:read` | MAR history |

---

## Pagination shape

```json
{
  "success": true,
  "data": {
    "content": [ … ],
    "totalElements": 42,
    "totalPages": 3,
    "size": 20,
    "number": 0
  }
}
```

Query params: `page` (0-based), `size` (default 20 for clinical, 50 for OPD queue).

---

## Staff (HMS-9)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/hospital/staff/invite` | `staff:invite` | Invite staff member (user + IAM role + staff record) |
| GET | `/hospital/staff` | `staff:read` | List staff; param `hospitalId` |
| POST | `/hospital/staff/{staffId}/deactivate` | `staff:write` | Deactivate staff employment |

---

## Dashboards (HMS-10)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/hospital/dashboard` | `hospital:profile:read` | Hospital operational snapshot |
| GET | `/opd/dashboard` | `opd:queue:read` | OPD queue KPIs for today |
| GET | `/ipd/dashboard` | `ipd:admission:read` | IPD admissions + beds |
| GET | `/icu/dashboard` | `icu:stay:read` | ICU stays + beds |
| GET | `/lab/dashboard` | `lab:order:read` | Lab worklist + status counts |
| GET | `/radiology/dashboard` | `radiology:order:read` | Imaging worklist + status counts |
| GET | `/pharmacy/dashboard` | `pharmacy:medication:read` | Medication orders + status counts |
| GET | `/ot/dashboard` | `ot:procedure:read` | OT procedures + status counts |
| GET | `/doctor/dashboard` | `clinical:encounter:read` | Doctor clinical workload |
| GET | `/patient/dashboard/clinical` | `clinical:encounter:read` | Patient encounter summary |

Optional params: `hospitalId`, `branchId` on hospital-scoped dashboards.

---

## Web / mobile client modules

| Client | API module | Hooks |
|--------|------------|-------|
| Web | `features/clinical/api/clinicalApi.ts` | `useClinicalQueries.ts` |
| Web | `features/opd/api/opdApi.ts` | `useOpdQueries.ts` |
| Web | `features/ipd/api/ipdApi.ts` | `useIpdQueries.ts` |
| Web | `features/icu/api/icuApi.ts` | `useIcuQueries.ts` |
| Web | `features/lab/api/labApi.ts` | `useLabQueries.ts` |
| Web | `features/radiology/api/radiologyApi.ts` | `useRadiologyQueries.ts` |
| Web | `features/ot/api/otApi.ts` | `useOtQueries.ts` |
| Web | `features/pharmacy/api/pharmacyApi.ts` | `usePharmacyQueries.ts` |
| Web | `features/hospital/api/staffApi.ts` | `useStaffQueries.ts` |
| Web | `features/dashboard/api/dashboardApi.ts` | `useDashboardQueries.ts` |
| Mobile | `features/clinical/api/clinicalApi.ts` | `useClinicalQueries.ts` |

---

## Migrations referenced

| Version | Content |
|---------|---------|
| V30 | `clinical` schema |
| V31 | `opd` schema |
| V32 | `clinical.encounter_number_sequences` |
| V33 | `ipd` schema (wards, rooms, beds, admissions, rounds, discharge) |
| V34 | `icu` schema (units, beds, stays, equipment, monitoring) |
| V35 | `laboratory` schema (catalog, orders, samples, results, reports) |
| V36 | `radiology` schema (modalities, orders, studies, reports) |
| V37 | `ot` schema (theatres, schedules, procedures, team, notes) |
| V38 | `pharmacy` schema (medicines, orders, items, administrations) |
| V39 | `hospital.staff`, `staff_role_assignments`, RECEPTIONIST/NURSE/ICU_NURSE roles |
| V40 | HMS-11 performance indexes (pg_trgm + composites) |
| V41 | `billing` schema (invoices, line items, payments) — P2-B1 |

---

## Billing (P2-B1 — post-HMS)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/billing/invoices` | `billing:invoice:write` | Create invoice from encounter + line items |
| GET | `/billing/invoices` | `billing:invoice:read` | Hospital-scoped list; params: `hospitalId`, `branchId` |
| GET | `/billing/invoices/me` | `billing:invoice:read` | Patient own invoices |
| GET | `/billing/invoices/{id}` | `billing:invoice:read` | Invoice detail + lines |
| POST | `/billing/invoices/{id}/payments` | `billing:payment:write` | Record manual payment (cash/UPI/card) |

Flow doc: [../post-hms/P2-B1-BILLING-FLOW.md](../post-hms/P2-B1-BILLING-FLOW.md)

---

## Related docs

- [HMS-OPD-FLOW.md](./HMS-OPD-FLOW.md) — sequence diagrams and status tables
- [HMS-DOMAIN-MODEL.md](./HMS-DOMAIN-MODEL.md) — entity relationships
