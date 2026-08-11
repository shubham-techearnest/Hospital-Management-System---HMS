# DOC-55: Phase 1.5 — Domain & Subscription Architecture

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-55 |
| **Version** | 1.0 |
| **Status** | Approved |

---

## 1. Bounded context

Phase 1.5 adds **`com.health360.subscription`** as a new bounded context within the modular monolith, integrated with existing **hospital**, **doctor**, and **iam** contexts.

```
┌─────────────────────────────────────────────────────────────┐
│                     Platform Admin                          │
└────────────┬───────────────────────────────┬────────────────┘
             │ create hospital / invite doctor │ manage plans
             ▼                               ▼
┌────────────────────┐              ┌─────────────────────┐
│  hospital context  │◄────────────►│ subscription context │
│  - HospitalEntity  │  plan limits │ - SubscriptionPlan   │
│  - associations    │  features    │ - HospitalSubscription│
└─────────┬──────────┘              │ - History (audit)    │
          │                         └─────────────────────┘
          ▼
┌────────────────────┐
│  doctor context    │
│  - DoctorProfile   │
│  - Association     │
└────────────────────┘
```

---

## 2. Core aggregates

### SubscriptionPlan (catalog)
- Identity: `code` (FREE, STARTER, …)
- Children: limits (`subscription_plan_limits`), features (`subscription_plan_features`)
- Mutable metadata: name, description, price, status

### HospitalSubscription (current state)
- One active/trial row per hospital (unique partial index)
- Points to plan; stores price snapshot, dates, status

### HospitalSubscriptionHistory (audit)
- Append-only events: INITIAL, RENEWAL, UPGRADE, DOWNGRADE, CANCELLATION, EXPIRATION, PLAN_CHANGE, SUSPENSION, REACTIVATION
- Never deleted

### Hospital (extended)
- Added `status`: ACTIVE | INACTIVE | SUSPENDED
- Links to admin user via `admin_user_id`

---

## 3. Key services

| Service | Responsibility |
|---------|----------------|
| `HospitalSubscriptionService` | Assign initial plan, change plan, record history |
| `HospitalSubscriptionQueryService` | Build subscription summary DTO with usage |
| `PlanLimitService` | Check/assert limits (doctors implemented) |
| `FeatureAccessService` | Resolve feature map; `hasFeature()` |
| `AdminHospitalService` | Platform admin hospital CRUD + create with admin user |
| `AdminSubscriptionPlanService` | Plan catalog read/update |
| `AdminHospitalSubscriptionService` | Admin subscription ops + history query |
| `DoctorInviteService` | Create invited doctor user + association |

---

## 4. Provisioning flows

### Hospital create (platform admin)

```
Admin → POST /admin/hospitals
  → Create User (PENDING_VERIFICATION)
  → Assign HOSPITAL_ADMIN role
  → HospitalService.createProfileInternal()
  → HospitalSubscriptionService.assignInitialPlan()
  → Email verification + invitation
```

### Doctor invite (platform admin)

```
Admin → POST /admin/hospitals/{id}/doctors/invite
  → PlanLimitService.assertCanAddDoctor()
  → Create User + DOCTOR role
  → DoctorProfileProvisioningService (DRAFT)
  → HospitalAssociation (ACTIVE)
  → Emails
```

### Patient register (public)

```
User → POST /auth/register (PATIENT)
  → Assign PATIENT role only
  → Email verification
```

---

## 5. Solo clinic model

A solo doctor is **not** a special subscription product. Platform admin creates:

- `hospital_type = CLINIC`
- Plan = FREE (or other tier)
- One doctor via invite
- `MAX_DOCTORS = 1` enforced on second invite

---

## 6. Extensibility

| Future addition | Extension point |
|-----------------|-----------------|
| Staff limits | Add `MAX_STAFF` to `subscription_plan_limits`; enforce in staff module |
| Billing | Link `HospitalSubscription` to payment provider in Phase 2 |
| Trial | Use `SubscriptionStatus.TRIAL` + `trial_days` on plan |
| Feature gating | Inject `FeatureAccessService` in controllers/services |

---

## 7. Package layout

```
com.health360.subscription/
├── domain/           # Enums, limit/feature keys
├── application/
│   ├── dto/
│   └── service/
├── infrastructure/
│   └── persistence/
└── presentation/
    ├── controller/
    └── dto/
```
