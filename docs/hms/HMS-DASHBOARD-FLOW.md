# HMS Role Dashboards Flow — Aggregated KPI APIs

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-DASHBOARD-FLOW-001 |
| **Last Updated** | 2026-08-19 |
| **Sprint** | HMS-10 |

---

## Goal

Each persona loads operational KPIs in **one API call** — no N+1 list fetches for summary counts.

---

## Scope resolution

`DashboardScopeService` resolves `hospitalId` + `branchId`:

| Caller | Default scope |
|--------|----------------|
| `HOSPITAL_ADMIN` | Own hospital + primary branch |
| Staff-scoped roles | Active `hospital.staff` assignment (+ optional query override) |
| Query params | `?hospitalId=&branchId=` override when permitted |

Access validated via `HospitalScopeService`.

---

## Dashboard APIs

| Method | Path | Auth | Returns |
|--------|------|------|---------|
| GET | `/hospital/dashboard` | `hospital:profile:read` | Hospital-wide + module pending counts |
| GET | `/opd/dashboard` | `opd:queue:read` | Today's queue breakdown |
| GET | `/ipd/dashboard` | `ipd:admission:read` | Admissions + bed occupancy |
| GET | `/icu/dashboard` | `icu:stay:read` | Active stays + bed occupancy |
| GET | `/lab/dashboard` | `lab:order:read` | Pending worklist + status counts |
| GET | `/radiology/dashboard` | `radiology:order:read` | Pending worklist + status counts |
| GET | `/pharmacy/dashboard` | `pharmacy:medication:read` | Pending Rx + status counts |
| GET | `/ot/dashboard` | `ot:procedure:read` | Pending procedures + status counts |
| GET | `/doctor/dashboard` | `clinical:encounter:read` | Encounter workload + recent list |
| GET | `/patient/dashboard/clinical` | `clinical:encounter:read` | Encounter summary + recent list |

Optional query params on hospital-scoped dashboards: `hospitalId`, `branchId`.

---

## Frontend integration

| Portal | Page | Hook |
|--------|------|------|
| Hospital admin | `/hospital/dashboard` | `useHospitalDashboard()` |
| Reception | `/reception/dashboard` | `useOpdDashboard({ hospitalId, branchId })` |
| Lab / Rad / Pharm / OT | Module dashboards | `useLabDashboardStats()` etc. |
| Doctor | `/doctor/dashboard` | `useDoctorDashboardStats()` |

Shared UI: `DashboardStatsGrid` + existing `StatCard`.

---

## Acceptance criteria

- [x] Each dashboard loads in single API call
- [x] Counts derived from aggregate repository queries (not entity loops)
- [x] Staff portals auto-resolve scope when assignment exists

---

## Module location

Backend: `com.health360.dashboard.*`  
Frontend: `features/dashboard/api/dashboardApi.ts`, `useDashboardQueries.ts`
