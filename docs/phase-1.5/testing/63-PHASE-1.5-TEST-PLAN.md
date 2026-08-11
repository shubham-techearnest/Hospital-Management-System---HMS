# DOC-63: Phase 1.5 — Test Plan

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-63 |
| **Version** | 1.0 |
| **Status** | Active |

---

## 1. Test scope

| In scope | Out of scope |
|----------|--------------|
| Subscription assign/change/history | Payment gateway |
| Plan limit enforcement (doctors) | Staff limits |
| Admin hospital create + invite | Phase 2 billing webhooks |
| Patient-only registration | Load testing at scale |
| Admin + hospital web UI smoke | Mobile admin UI |

---

## 2. Unit tests

| Test class | Covers | Status |
|------------|--------|--------|
| `PlanLimitServiceTest` | FREE plan allows 1 doctor, blocks 2nd | ✅ |
| `HospitalSubscriptionServiceTest` | Assign, change, history | ✅ Covered by integration test |
| `DoctorInviteServiceTest` | User + association creation | ✅ Covered by integration test |

---

## 3. Integration tests

| Test | Scenario | Status |
|------|----------|--------|
| `AuthIntegrationTest.doctorSelfRegistrationIsDisabled` | Legacy DOCTOR role → 400 | ✅ |
| `AuthIntegrationTest.individualPracticeRegistrationIsDisabled` | INDIVIDUAL_PRACTICE → 400 | ✅ |
| `AuthIntegrationTest.registerVerifyLoginRefreshLogoutFlow` | Patient register flow | ✅ |
| Admin create hospital | POST /admin/hospitals → 201 | ✅ `AdminHospitalSubscriptionIntegrationTest` |
| Admin invite doctor | Invite + association ACTIVE | ✅ |
| Doctor limit 409 | Second invite on FREE plan | ✅ |
| Hospital self-create 403 | POST /hospitals/me/profile | ✅ |
| Hospital admin invite 403 | POST /hospitals/me/doctors/invite | ✅ |
| Plan change history | PUT plan → history row | ✅ |
| Downgrade blocked | Usage exceeds FREE limits | ✅ |

---

## 4. Manual test scenarios

### TC-01 Platform admin creates hospital
1. Login as platform admin
2. Admin → Hospitals → Create hospital
3. Fill hospital + admin user fields, plan FREE
4. **Expected:** 201, hospital in list, invitation email sent (or logged in dev)

### TC-02 Platform admin invites doctor
1. Open hospital detail
2. Invite doctor with new email
3. **Expected:** Doctor in roster, emails sent
4. Invite second doctor on FREE plan
5. **Expected:** 409 DOCTOR_LIMIT_REACHED

### TC-03 Hospital admin views subscription
1. Login as hospital admin (provisioned hospital)
2. Navigate to Subscription
3. **Expected:** Plan name, doctor usage 1/1 (if one doctor), features listed

### TC-04 Hospital admin cannot add doctors
1. Login as hospital admin
2. Doctor roster shows info message, no invite button
3. **Expected:** API POST invite returns 403 if called directly

### TC-05 Patient registration only
1. Open /register — no doctor/practice option
2. Register as patient
3. **Expected:** 201, verification email

### TC-06 Plan change
1. Platform admin changes hospital from FREE → STARTER
2. **Expected:** Subscription updated, history shows PLAN_CHANGE/UPGRADE

---

## 5. Regression

| Area | Verify |
|------|--------|
| Phase 1 hospital CRUD | Branches, departments still work for provisioned hospital |
| Phase 1 doctor profile | Invited doctor can login and complete DRAFT profile |
| Phase 1 patient flows | Unaffected |
| Phase 1 scheduling | Booking still works for associated doctors |

---

## 6. Environment

| Env | DB migrations | Notes |
|-----|---------------|-------|
| Local | V26–V28 via Flyway on startup | PostgreSQL 16 |
| CI | Testcontainers PostgreSQL 16 | Docker required for integration tests |
| Staging | Manual verify after deploy | Re-login for new permissions |

---

## 7. Exit criteria (Phase 1.5 test sign-off)

- [ ] All unit tests in subscription package green
- [ ] Admin hospital + invite integration tests green
- [ ] Manual TC-01 through TC-06 passed on staging
- [ ] No P0/P1 bugs open for subscription/provisioning flows
