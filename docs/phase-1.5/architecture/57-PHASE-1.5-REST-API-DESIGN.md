# DOC-57: Phase 1.5 — REST API Design

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-57 |
| **Version** | 1.0 |
| **Status** | Approved |
| **Base path** | `/api/v1` |

---

## 1. Public / auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Patient registration only (`role: PATIENT`) |

**Errors:** `DOCTOR_REGISTRATION_DISABLED` (403) for non-patient roles.

---

## 2. Hospital admin (`HOSPITAL_ADMIN`)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/hospitals/me/subscription` | `hospital:subscription:read` | Plan, usage, features |
| GET | `/hospitals/me/profile` | `hospital:profile:read` | Hospital profile |
| POST | `/hospitals/me/profile` | `hospital:profile:write` | **403** — admin-only create |
| PUT | `/hospitals/me/profile` | `hospital:profile:write` | Update profile |
| GET | `/hospitals/me/doctors` | `hospital:doctors:read` | Roster |
| POST | `/hospitals/me/doctors` | `hospital:doctors:write` | **403** — admin-only |
| POST | `/hospitals/me/doctors/invite` | `hospital:doctors:write` | **403** — admin-only |
| POST | `/hospitals/me/doctors/{id}/approve` | `hospital:doctors:write` | **403** — admin-only |
| DELETE | `/hospitals/me/doctors/{id}` | `hospital:doctors:write` | Remove association |

Existing branch/department/facility endpoints unchanged from Phase 1.

---

## 3. Platform admin — hospitals

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | `/admin/hospitals` | `admin:hospitals:write` | Create hospital + admin user |
| GET | `/admin/hospitals` | `admin:hospitals:read` | Paginated list |
| GET | `/admin/hospitals/{id}` | `admin:hospitals:read` | Detail |
| PATCH | `/admin/hospitals/{id}/status` | `admin:hospitals:write` | Status change |
| POST | `/admin/hospitals/{id}/doctors/invite` | `admin:hospitals:write` | Invite doctor |

### POST `/admin/hospitals` body

```json
{
  "name": "City Care Clinic",
  "registrationNumber": "MH-CLINIC-001",
  "hospitalType": "CLINIC",
  "establishedYear": 2020,
  "totalBedCount": 10,
  "accreditation": "NONE",
  "description": "Optional",
  "adminEmail": "admin@citycare.test",
  "adminFirstName": "Priya",
  "adminLastName": "Patel",
  "adminPhone": "9876543210",
  "adminPassword": "Optional-SecureP@ss1",
  "planCode": "FREE"
}
```

---

## 4. Platform admin — subscriptions

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/admin/hospitals/{id}/subscription` | `admin:subscriptions:read` | Summary |
| PUT | `/admin/hospitals/{id}/subscription/plan` | `admin:subscriptions:write` | Change plan |
| GET | `/admin/hospitals/{id}/subscription/history` | `admin:subscriptions:read` | History list |

### PUT plan body

```json
{
  "planCode": "STARTER",
  "notes": "Upgraded after sales call"
}
```

---

## 5. Platform admin — plans

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/admin/plans` | `admin:plans:read` | Catalog |
| GET | `/admin/plans/{id}` | `admin:plans:read` | Detail |
| PATCH | `/admin/plans/{id}` | `admin:plans:write` | Update metadata |

---

## 6. Response DTOs

### `HospitalSubscriptionResponse`

```json
{
  "status": "ACTIVE",
  "startDate": "2026-08-01",
  "endDate": null,
  "autoRenew": true,
  "plan": {
    "id": "...",
    "code": "FREE",
    "name": "Free (Solo)",
    "price": 0,
    "currency": "INR",
    "billingCycle": "NONE"
  },
  "usage": {
    "doctors": { "used": 1, "limit": 1, "remaining": 0 },
    "departments": { "used": 0, "limit": 1, "remaining": 1 }
  },
  "features": {
    "FEATURE_ANALYTICS": false,
    "FEATURE_TELEMEDICINE": false
  }
}
```

---

## 7. Error codes (Phase 1.5)

| Code | HTTP | When |
|------|------|------|
| `DOCTOR_LIMIT_REACHED` | 409 | Doctor invite over MAX_DOCTORS |
| `DOCTOR_PROVISIONING_ADMIN_ONLY` | 403 | Hospital admin tries to add doctor |
| `HOSPITAL_SELF_REGISTRATION_DISABLED` | 403 | Self-create hospital profile |
| `DOCTOR_REGISTRATION_DISABLED` | 403 | Non-patient registration |
| `PLAN_NOT_FOUND` | 404 | Invalid plan code/id |
| `PLAN_INACTIVE` | 400 | Plan not ACTIVE |
| `SUBSCRIPTION_NOT_FOUND` | 404 | No active subscription |
| `FEATURE_NOT_AVAILABLE` | 403 | Feature gating (future) |

---

## 8. Not yet implemented

| Method | Path | Planned sprint |
|--------|------|----------------|
| GET | `/admin/audit-logs` | P1.5-S9 |
| POST | `/admin/plans` | P1.5-S6 |
| PATCH | `/admin/plans/{id}/limits` | P1.5-S6 |
