# Health360 Phase 1.5 — Hospital SaaS & Subscription Architecture

Phase 1.5 introduces **hospital-centric subscription management** on top of the existing Phase 1 hospital domain.

## Core business rule

**Health360 is hospital-centric.** Every doctor belongs to a hospital/clinic. Subscriptions belong to hospitals, not doctors. A solo doctor is modeled as a **CLINIC hospital** with exactly one doctor on the **Free (Solo)** hospital plan (`MAX_DOCTORS = 1`). There is no separate "Free Doctor" subscription.

## Architectural decisions (confirmed)

### Individual practice

- Treat individual practice as a hospital/clinic with exactly one doctor.
- On `INDIVIDUAL_PRACTICE` registration: auto-create clinic, associate doctor, grant `HOSPITAL_ADMIN`, assign Free/Solo hospital plan.

### Subscription history

- `hospital.hospital_subscriptions` — current subscription only.
- `hospital.hospital_subscription_history` — append-only audit (initial, renewal, upgrade, downgrade, cancellation, expiration, plan changes). Historical rows are never deleted.

### Staff

- No staff limits or placeholder staff features until the staff module exists.
- Plan limit keys are extensible (`MAX_STAFF` can be added later without redesign).

### Doctor registration

| Flow | Allowed? |
|------|----------|
| Patient self-registration | Yes |
| Individual practice (`INDIVIDUAL_PRACTICE`) | Yes — creates clinic + doctor + Free plan + HOSPITAL_ADMIN |
| Doctor self-registration (`DOCTOR`) | **No** — invitation only (platform admin or hospital admin) |
| Hospital admin / platform admin invite | Planned (Sprint E) |

## Database (Flyway V26–V28)

| Table | Purpose |
|-------|---------|
| `shared.subscription_plans` | Plan catalog (price, billing cycle, status) |
| `shared.subscription_plan_limits` | Configurable limits (`MAX_DOCTORS`, etc.) |
| `shared.subscription_plan_features` | Feature flags per plan |
| `hospital.hospital_subscriptions` | Current subscription per hospital |
| `hospital.hospital_subscription_history` | Append-only audit of plan changes |

Staff limits (`MAX_STAFF`) are intentionally omitted until the staff module exists.

## API (implemented)

### Hospital admin
- `GET /api/v1/hospitals/me/subscription` — plan, usage, features
- `POST /api/v1/hospitals/me/doctors/invite` — invite doctor to own hospital

### Platform admin
- `GET /api/v1/admin/hospitals` — paginated hospital list
- `GET /api/v1/admin/hospitals/{id}` — hospital detail
- `PATCH /api/v1/admin/hospitals/{id}/status` — activate/suspend hospital
- `POST /api/v1/admin/hospitals/{id}/doctors/invite` — invite doctor to hospital
- `GET /api/v1/admin/hospitals/{id}/subscription` — subscription summary
- `PUT /api/v1/admin/hospitals/{id}/subscription/plan` — change plan
- `GET /api/v1/admin/hospitals/{id}/subscription/history` — append-only history
- `GET /api/v1/admin/plans` — plan catalog
- `PATCH /api/v1/admin/plans/{id}` — update plan metadata/status

## Enforcement

- `PlanLimitService.assertCanAddDoctor()` — used when associating/approving doctors
- Returns `DOCTOR_LIMIT_REACHED` (409) with user-friendly message

## Next sprints

Audit log read API, broader limit enforcement (branches/departments), feature gating on endpoints, mobile admin/subscription UI.
