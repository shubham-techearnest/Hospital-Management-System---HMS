# HMS Phase — Sprint Status (Living Document)



| Attribute | Value |

|-----------|-------|

| **Document ID** | HMS-SPRINT-001 |

| **Last Updated** | 2026-08-19 |

| **Maintained By** | Engineering |



---



## Overall progress



| Metric | Value |

|--------|-------|

| Phases complete | **12 / 12** (HMS-0 through HMS-11 done) |

| Current phase | **Complete** — HMS phase closed |

| Architecture doc | [HEALTH360-HMS-ARCHITECTURE.md](./HEALTH360-HMS-ARCHITECTURE.md) |
| **Sprint plan (detailed)** | [HMS-SPRINT-PLAN.md](./HMS-SPRINT-PLAN.md) |
| **Doc index** | [README.md](./README.md) |



---



## Sprint status



| Phase | Name | Status | Completed |

|-------|------|--------|-----------|

| HMS-0 | Launch gate — appointment fix | ✅ Done | 2026-08-12 |

| HMS-1 | Clinical encounter foundation | ✅ Done (UI + V32) | 2026-08-18 |

| HMS-2 | OPD module | ✅ Done | 2026-08-17 |

| HMS-3 | IPD module | ✅ Done | 2026-08-18 |

| HMS-4 | ICU module | ✅ Done | 2026-08-18 |

| HMS-5 | Laboratory | ✅ Done | 2026-08-19 |

| HMS-6 | Radiology | ✅ Done | 2026-08-19 |

| HMS-7 | Operation theatre | ✅ Done | 2026-08-19 |

| HMS-8 | Clinical pharmacy foundation | ✅ Done | 2026-08-19 |

| HMS-9 | Staff + RBAC expansion | ✅ Done | 2026-08-19 |

| HMS-10 | Role dashboards | ✅ Done | 2026-08-19 |

| HMS-11 | Performance + security + regression | ✅ Done | 2026-08-19 |



---



## HMS-0 deliverables



| Item | Status |

|------|--------|

| `GET /scheduling/appointments/me` returns paginated 200 with empty `content` when no appointments | ✅ |

| No-profile patients receive 200 empty page (not 404/500) | ✅ |

| Null-safe appointment date filtering/sorting | ✅ |

| `AppointmentListIntegrationTest` (upcoming/past/cancelled, no profile, invalid filter) | ✅ |

| Web/mobile `listMyAppointments` reads paged `content` | ✅ |

| Removed login-time appointment prefetch (web) | ✅ |



---



## HMS-0 API change



**Before:** `GET /api/v1/scheduling/appointments/me?filter=upcoming` → `List<AppointmentSummaryResponse>`



**After:** Same path with optional `page` (default 0) and `size` (default 20) → Spring `Page`:



```json

{

  "success": true,

  "data": {

    "content": [],

    "totalElements": 0,

    "totalPages": 0,

    "size": 20,

    "number": 0

  }

}

```



Web/mobile clients extract `data.content` for backward-compatible array usage in UI hooks.



---



## HMS-1 deliverables



| Item | Status |

|------|--------|

| Flyway V30 — `clinical` schema (encounters, diagnoses, notes, orders, order_items, followups, reminders) | ✅ |

| RBAC — `clinical:encounter:*`, `clinical:order:*` permissions seeded | ✅ |

| Backend module — `com.health360.clinical.*` | ✅ |

| Encounter create/read/list + status transitions | ✅ |

| Diagnoses and clinical notes on encounter | ✅ |

| Generic clinical orders + order items | ✅ |

| Flyway V32 — encounter number sequences | ✅ |

| Convenience APIs — `/me`, `/doctor/me`, check-in/start/complete | ✅ |

| Web patient/doctor encounter UIs + mobile screens | ✅ |

| Stage 2 documentation pack | ✅ |

| `EncounterStatusTest` + `ClinicalEncounterIntegrationTest` | ✅ |



### HMS-1 API endpoints



```

POST   /api/v1/clinical/encounters

GET    /api/v1/clinical/encounters?patientId=&hospitalId=&doctorId=

GET    /api/v1/clinical/encounters/{id}

PATCH  /api/v1/clinical/encounters/{id}/status

POST   /api/v1/clinical/encounters/{id}/diagnoses

GET    /api/v1/clinical/encounters/{id}/diagnoses

POST   /api/v1/clinical/encounters/{id}/notes

GET    /api/v1/clinical/encounters/{id}/notes

POST   /api/v1/clinical/encounters/{id}/orders

GET    /api/v1/clinical/encounters/{id}/orders

GET    /api/v1/clinical/encounters/{id}/orders/{orderId}

```



---



## HMS-2 deliverables



| Item | Status |

|------|--------|

| Flyway V31 — `opd` schema (`desks`, `queue_entries`) | ✅ |

| RBAC — `opd:desk:*`, `opd:queue:*`, `opd:registration:write` | ✅ |

| Backend module — `com.health360.opd.*` | ✅ |

| Walk-in registration → encounter + queue token | ✅ |

| Appointment check-in → encounter + queue token | ✅ |

| Queue lifecycle — call, start, complete, cancel | ✅ |

| Encounter status sync (WAITING → IN_PROGRESS → COMPLETED) | ✅ |

| Hospital portal OPD page (`/hospital/opd`) with paginated queue | ✅ |

| `QueueEntryStatusTest` + `OpdIntegrationTest` | ✅ |



### HMS-2 API endpoints



```

POST   /api/v1/opd/desks

GET    /api/v1/opd/desks?hospitalId=&branchId=

POST   /api/v1/opd/registrations/walk-in

POST   /api/v1/opd/registrations/check-in

GET    /api/v1/opd/queue?hospitalId=&branchId=&queueDate=&status=&deskId=

POST   /api/v1/opd/queue/{queueEntryId}/call

POST   /api/v1/opd/queue/{queueEntryId}/start

POST   /api/v1/opd/queue/{queueEntryId}/complete

POST   /api/v1/opd/queue/{queueEntryId}/cancel

```



### HMS-2 deploy note



Users must **re-login** after V31 so JWT includes new OPD permissions (`opd:desk:*`, `opd:queue:*`, `opd:registration:write`).



---



## HMS-3 deliverables



| Item | Status |

|------|--------|

| Flyway V33 — `ipd` schema (wards, rooms, beds, admissions, bed_assignments, rounds, discharge_summaries) | ✅ |

| RBAC — `ipd:ward:*`, `ipd:bed:*`, `ipd:admission:*`, `ipd:round:*`, `ipd:discharge:write` | ✅ |

| Backend module — `com.health360.ipd.*` | ✅ |

| Admit patient → IPD encounter + bed assignment | ✅ |

| Nursing/doctor rounds + discharge with summary | ✅ |

| Hospital portal IPD page (`/hospital/ipd`) | ✅ |

| `IpdIntegrationTest` | ✅ |



### HMS-3 API endpoints



```

POST/GET  /api/v1/ipd/wards

POST/GET  /api/v1/ipd/rooms?wardId=

POST/GET  /api/v1/ipd/beds?hospitalId=&branchId=&status=

POST/GET  /api/v1/ipd/admissions (paginated)

GET       /api/v1/ipd/admissions/{id}

POST      /api/v1/ipd/admissions/{id}/rounds

GET       /api/v1/ipd/admissions/{id}/rounds

POST      /api/v1/ipd/admissions/{id}/discharge

```



### HMS-3 deploy note



Re-login after V33 so JWT includes `ipd:*` permissions.



---



## HMS-4 deliverables



| Item | Status |

|------|--------|

| Flyway V34 — `icu` schema (units, beds, stays, bed_assignments, equipment, equipment_assignments, monitoring_records) | ✅ |

| RBAC — `icu:unit:*`, `icu:stay:*`, `icu:equipment:*`, `icu:monitoring:*` | ✅ |

| Backend module — `com.health360.icu.*` | ✅ |

| Admit to ICU → ICU encounter + bed assignment | ✅ |

| Monitoring records (append-only) + equipment assign/release | ✅ |

| Hospital portal ICU page (`/hospital/icu`) | ✅ |

| `IcuIntegrationTest` | ✅ |



### HMS-4 API endpoints



```

POST/GET  /api/v1/icu/units

POST/GET  /api/v1/icu/beds?hospitalId=&branchId=&status=

POST/GET  /api/v1/icu/stays (paginated)

GET       /api/v1/icu/stays/{id}

POST      /api/v1/icu/stays/{id}/discharge

POST/GET  /api/v1/icu/stays/{id}/monitoring-records

POST/GET  /api/v1/icu/equipment

POST      /api/v1/icu/equipment/{id}/assign

POST      /api/v1/icu/equipment-assignments/{id}/release

GET       /api/v1/icu/stays/{id}/equipment-assignments

```



### HMS-4 deploy note



Re-login after V34 so JWT includes `icu:*` permissions. Encounter numbers use **`ICU-{year}-{seq}`** prefix.



---



## HMS-5 deliverables



| Item | Status |

|------|--------|

| Flyway V35 — `laboratory` schema (catalog, orders, samples, results, reports) | ✅ |

| RBAC — `lab:catalog:*`, `lab:order:*`, `lab:result:*`, `lab:report:release` | ✅ |

| Backend module — `com.health360.laboratory.*` | ✅ |

| Fulfillment flow — receive → sample → results → verify → release | ✅ |

| Lab portal dashboard (`/lab/dashboard`) | ✅ |

| Doctor/patient encounter lab results | ✅ |

| `LabIntegrationTest` | ✅ |



### HMS-5 API endpoints



```

POST/GET  /api/v1/lab/laboratories

POST/GET  /api/v1/lab/tests

POST/GET  /api/v1/lab/tests/{id}/parameters

GET       /api/v1/lab/worklist/pending

POST/GET  /api/v1/lab/orders

GET       /api/v1/lab/orders/{id}

POST      /api/v1/lab/orders/{id}/collect-sample

POST      /api/v1/lab/orders/{id}/results

POST      /api/v1/lab/orders/{id}/verify

POST      /api/v1/lab/orders/{id}/release

GET       /api/v1/lab/encounters/{id}/reports

```



### HMS-5 deploy note



Re-login after V35 so JWT includes `lab:*` permissions. Doctor LAB orders must reference `lab_tests.id` via `itemReferenceId`.



---



## HMS-6 deliverables



| Item | Status |

|------|--------|

| Flyway V36 — `radiology` schema (modalities, orders, studies, reports) | ✅ |

| RBAC — `radiology:modality:*`, `radiology:order:*`, `radiology:report:*` + `RADIOLOGY_TECHNICIAN` role | ✅ |

| Backend module — `com.health360.radiology.*` | ✅ |

| Fulfillment flow — receive → schedule → perform → report → verify → release | ✅ |

| Radiology portal (`/radiology/dashboard`) + hospital route (`/hospital/radiology`) | ✅ |

| Doctor/patient encounter imaging results | ✅ |

| `RadiologyIntegrationTest` | ✅ |



### HMS-6 API endpoints



```

POST/GET  /api/v1/radiology/modalities

GET       /api/v1/radiology/worklist/pending

POST/GET  /api/v1/radiology/orders

GET       /api/v1/radiology/orders/{id}

POST      /api/v1/radiology/orders/{id}/schedule

POST      /api/v1/radiology/orders/{id}/perform

POST      /api/v1/radiology/orders/{id}/report

POST      /api/v1/radiology/orders/{id}/verify

POST      /api/v1/radiology/orders/{id}/release

GET       /api/v1/radiology/encounters/{id}/reports

```



### HMS-6 deploy note



Re-login after V36 so JWT includes `radiology:*` permissions. Doctor IMAGING orders must reference `imaging_modalities.id` via `itemReferenceId`.



---

## HMS-7 deliverables



| Item | Status |

|------|--------|

| Flyway V37 — `ot` schema (theatres, schedules, procedures, team, notes) | ✅ |

| RBAC — `ot:theatre:*`, `ot:schedule:*`, `ot:procedure:*` + `OT_COORDINATOR` role | ✅ |

| Backend module — `com.health360.ot.*` | ✅ |

| Fulfillment flow — receive → schedule → team → pre-op → start → intra-op → complete | ✅ |

| OT conflict detection on theatre schedule overlap (409) | ✅ |

| OT portal (`/ot/dashboard`) + hospital route (`/hospital/ot`) | ✅ |

| Doctor PROCEDURE orders + patient/doctor encounter completed procedures | ✅ |

| `OtIntegrationTest` | ✅ |



### HMS-7 API endpoints



```

POST/GET  /api/v1/ot/theatres

GET       /api/v1/ot/worklist/pending

POST/GET  /api/v1/ot/procedures

GET       /api/v1/ot/procedures/{id}

POST      /api/v1/ot/procedures/{id}/schedule

POST      /api/v1/ot/procedures/{id}/team

POST      /api/v1/ot/procedures/{id}/notes

POST      /api/v1/ot/procedures/{id}/start

POST      /api/v1/ot/procedures/{id}/complete

GET       /api/v1/ot/encounters/{id}/procedures

```



### HMS-7 deploy note



Re-login after V37 so JWT includes `ot:*` permissions. Doctor PROCEDURE orders use free-text `itemName` (no catalog required).



---

## HMS-8 deliverables



| Item | Status |

|------|--------|

| Flyway V38 — `pharmacy` schema (medicines, orders, items, administrations) | ✅ |

| RBAC — `pharmacy:medicine:*`, `pharmacy:medication:*`, `pharmacy:medication:administer` for `PHARMACIST` | ✅ |

| Backend module — `com.health360.pharmacy.*` | ✅ |

| Fulfillment flow — receive → verify → plan → administer (MAR) → complete | ✅ |

| Pharmacy portal (`/pharmacy/dashboard`) + hospital route (`/hospital/pharmacy`) | ✅ |

| Doctor MEDICATION orders + encounter MAR on doctor/patient views | ✅ |

| `PharmacyIntegrationTest` | ✅ |



### HMS-8 API endpoints



```

POST/GET  /api/v1/pharmacy/medicines

GET       /api/v1/pharmacy/worklist/pending

POST/GET  /api/v1/pharmacy/orders

GET       /api/v1/pharmacy/orders/{id}

POST      /api/v1/pharmacy/orders/{id}/verify

POST      /api/v1/pharmacy/order-items/{id}/plan

POST      /api/v1/pharmacy/order-items/{id}/administer

POST      /api/v1/pharmacy/order-items/{id}/complete

GET       /api/v1/pharmacy/encounters/{id}/administrations

```



### HMS-8 deploy note



Re-login after V38 so JWT includes `pharmacy:*` permissions. Doctor MEDICATION orders should reference `medicines.id` via `itemReferenceId`. No commerce/billing in this sprint.



---

## HMS-9 deliverables

| Item | Status |
|------|--------|
| Flyway V39 — `hospital.staff`, `staff_role_assignments`, IAM roles | ✅ |
| RBAC — `staff:*` for admin; RECEPTIONIST/NURSE/ICU_NURSE permissions | ✅ |
| `HospitalScopeService` + module access service integration | ✅ |
| Backend — `StaffService`, `StaffController` | ✅ |
| Hospital staff UI (`/hospital/staff`) | ✅ |
| Reception / nursing / ICU nurse portals | ✅ |
| `StaffIntegrationTest` — receptionist scoped OPD access | ✅ |

### HMS-9 API endpoints

```
POST  /api/v1/hospital/staff/invite
GET   /api/v1/hospital/staff?hospitalId=
POST  /api/v1/hospital/staff/{staffId}/deactivate
```

### HMS-9 deploy note

Restart backend after V39. Re-login as hospital admin (for `staff:*`) and as invited staff (for role permissions). Receptionist can run OPD at assigned hospital only — not full admin routes.

---

## HMS-10 deliverables

| Item | Status |
|------|--------|
| Backend module — `com.health360.dashboard.*` | ✅ |
| Aggregated dashboard APIs (hospital, OPD, IPD, ICU, lab, rad, pharm, OT, doctor, patient) | ✅ |
| `DashboardScopeService` — auto-resolve hospital/branch for admin + staff | ✅ |
| Frontend — `dashboardApi.ts`, `useDashboardQueries`, `DashboardStatsGrid` | ✅ |
| Portal pages wired to single-call dashboard stats | ✅ |
| `DashboardIntegrationTest` | ✅ |

### HMS-10 API endpoints

```
GET /api/v1/hospital/dashboard
GET /api/v1/opd/dashboard
GET /api/v1/ipd/dashboard
GET /api/v1/icu/dashboard
GET /api/v1/lab/dashboard
GET /api/v1/radiology/dashboard
GET /api/v1/pharmacy/dashboard
GET /api/v1/ot/dashboard
GET /api/v1/doctor/dashboard
GET /api/v1/patient/dashboard/clinical
```

Flow doc: [HMS-DASHBOARD-FLOW.md](./HMS-DASHBOARD-FLOW.md)

---

## HMS-11 deliverables

| Item | Status |
|------|--------|
| Flyway V40 — `pg_trgm` + GIN name/city indexes + module composite indexes | ✅ |
| `HmsRbacRegressionIntegrationTest` — role allow/deny matrix | ✅ |
| `HmsGoldenPathIntegrationTest` — appointments, encounters, empty lists | ✅ |
| Security audit — deny-by-default `@PreAuthorize`, tenant + hospital scope | ✅ |
| Backend compile + test-compile verified | ✅ |

### HMS-11 indexes (V40)

- User/hospital/branch fuzzy search (trigram GIN)
- Encounter list composites (patient, doctor, hospital/branch)
- Lab, radiology, pharmacy, OT order worklist composites
- IPD admissions, ICU stays, OPD queue, staff directory composites

Flow doc: [HMS-HARDENING-FLOW.md](./HMS-HARDENING-FLOW.md)

---

*Update this document at the end of each HMS phase.*

