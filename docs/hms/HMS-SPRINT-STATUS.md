# HMS Phase — Sprint Status (Living Document)



| Attribute | Value |

|-----------|-------|

| **Document ID** | HMS-SPRINT-001 |

| **Last Updated** | 2026-08-18 |

| **Maintained By** | Engineering |



---



## Overall progress



| Metric | Value |

|--------|-------|

| Phases complete | 3 / 12 (HMS-0 through HMS-11) |

| Current phase | **HMS-4** (next — ICU module) |

| Architecture doc | [HEALTH360-HMS-ARCHITECTURE.md](./HEALTH360-HMS-ARCHITECTURE.md) |



---



## Sprint status



| Phase | Name | Status | Completed |

|-------|------|--------|-----------|

| HMS-0 | Launch gate — appointment fix | ✅ Done | 2026-08-12 |

| HMS-1 | Clinical encounter foundation | ✅ Done (UI + V32) | 2026-08-18 |

| HMS-2 | OPD module | ✅ Done | 2026-08-17 |

| HMS-3 | IPD module | ✅ Done | 2026-08-18 |

| HMS-4 | ICU module | ⏳ Not started | — |

| HMS-5 | Laboratory | ⏳ Not started | — |

| HMS-6 | Radiology | ⏳ Not started | — |

| HMS-7 | Operation theatre | ⏳ Not started | — |

| HMS-8 | Clinical pharmacy foundation | ⏳ Not started | — |

| HMS-9 | Staff + RBAC expansion | ⏳ Not started | — |

| HMS-10 | Role dashboards | ⏳ Not started | — |

| HMS-11 | Performance + security + regression | ⏳ Not started | — |



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



*Update this document at the end of each HMS phase.*

