# API Catalog — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-API-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Base** | `/api/v1` |
| **Evidence** | CODE-VERIFIED controllers |

## Standards (CURRENT)

- JSON REST
- Envelope `ApiResponse` pattern (success/data/error)
- Correlation ID filter
- Auth: Bearer JWT unless public allowlisted
- OpenAPI/Swagger enabled in security allowlist paths

Full OpenAPI export file not checked into SSOT in this pass — runtime swagger is source for detail. Generating a frozen `OPENAPI.yaml` is a follow-up task (TECHNICAL-DEBT).

## Controller map (58)

| API area | Base path(s) | Module |
|----------|--------------|--------|
| Health | `/api/v1/health` | shared |
| Auth / users / RBAC probe | `/api/v1/auth`, `/users`, `/rbac` | iam |
| Admin users/hospitals/plans/audit/reviews/doctors/partners | `/api/v1/admin/*` | iam/hospital/subscription/review/doctor/org |
| Hospitals / staff / catalogs | `/api/v1/hospitals`, `/hospital/staff`, `/hospital/catalogs` | hospital |
| Doctors / associations / public | `/api/v1/doctors` | doctor |
| Patients / registry / summary | `/api/v1/patients`, `/hospital/patients` | patient |
| Scheduling | `/api/v1/scheduling` | scheduling |
| Search / location | `/api/v1/search`, `/location` | search/location |
| Analytics | `/api/v1/analytics` | analytics |
| Clinical | `/api/v1/clinical` | clinical |
| OPD | `/api/v1/opd` | opd |
| IPD / patient IPD / IPD services | `/api/v1/ipd`, `/patients`, `/hospitals/me/ipd-services` | ipd |
| ICU | `/api/v1/icu` | icu |
| Lab / Radiology / OT / Pharmacy | `/api/v1/lab|radiology|ot|pharmacy` | respective |
| Billing / charges / online pay | `/api/v1/billing`, `/billing/charges` | billing |
| Documents | `/api/v1` (document controller) | documents |
| Assets | `/api/v1/assets` | asset |
| Approvals / tasks | `/api/v1/approvals`, `/tasks` | automation/tasks |
| Emergency / ADT | `/api/v1/emergency`, `/adt` | emergency/adt |
| Inventory / procurement / facility | `/api/v1/inventory|procurement|facility` | respective |
| Insurance / blood / staff-ops | `/api/v1/insurance|blood|staff-ops` | respective |
| Command center / predictive | `/api/v1/command-center`, `/predictive` | commandcenter/predictive |
| Partners | `/api/v1/partners` | org |
| Dashboards | method-level `/api/v1/{role}/dashboard…` | dashboard |
| Reviews | `/api/v1/reviews` | review |

## AuthN/Z detail

See [AUTHENTICATION.md](./AUTHENTICATION.md).
