# HMS API Map — Clinical & OPD

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-API-001 |
| **Last Updated** | 2026-08-18 |
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

## Web / mobile client modules

| Client | API module | Hooks |
|--------|------------|-------|
| Web | `features/clinical/api/clinicalApi.ts` | `useClinicalQueries.ts` |
| Web | `features/opd/api/opdApi.ts` | `useOpdQueries.ts` |
| Mobile | `features/clinical/api/clinicalApi.ts` | `useClinicalQueries.ts` |

---

## Migrations referenced

| Version | Content |
|---------|---------|
| V30 | `clinical` schema |
| V31 | `opd` schema |
| V32 | `clinical.encounter_number_sequences` |
| V33 | `ipd` schema (wards, rooms, beds, admissions, rounds, discharge) |

---

## Related docs

- [HMS-OPD-FLOW.md](./HMS-OPD-FLOW.md) — sequence diagrams and status tables
- [HMS-DOMAIN-MODEL.md](./HMS-DOMAIN-MODEL.md) — entity relationships
