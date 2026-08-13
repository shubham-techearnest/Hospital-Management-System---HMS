# HMS Phase — Sprint Status (Living Document)

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-SPRINT-001 |
| **Last Updated** | 2026-08-12 |
| **Maintained By** | Engineering |

---

## Overall progress

| Metric | Value |
|--------|-------|
| Phases complete | 1 / 12 (HMS-0 through HMS-11) |
| Current phase | **HMS-1** (next — pending start) |
| Architecture doc | [HEALTH360-HMS-ARCHITECTURE.md](./HEALTH360-HMS-ARCHITECTURE.md) |

---

## Sprint status

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| HMS-0 | Launch gate — appointment fix | ✅ Done | 2026-08-12 |
| HMS-1 | Clinical encounter foundation | ⏳ Not started | — |
| HMS-2 | OPD module | ⏳ Not started | — |
| HMS-3 | IPD module | ⏳ Not started | — |
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

*Update this document at the end of each HMS phase.*
