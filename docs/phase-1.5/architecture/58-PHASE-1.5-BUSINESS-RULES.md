# DOC-58: Phase 1.5 — Business Rules & Validation

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-58 |
| **Version** | 1.0 |
| **Status** | Approved |

---

## BR-SUB: Subscription rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-SUB-01 | A hospital may have at most one ACTIVE or TRIAL subscription | DB unique partial index + service check |
| BR-SUB-02 | Plan change closes current subscription (CANCELLED) before opening new | `HospitalSubscriptionService.changePlan()` |
| BR-SUB-03 | History event written for every assign/change | `recordHistory()` |
| BR-SUB-04 | History rows are immutable | No update/delete repository methods |
| BR-SUB-05 | Inactive plans cannot be assigned | `requirePlanByCode()` throws PLAN_INACTIVE |

## BR-LIM: Limit rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-LIM-01 | Doctor count = distinct ACTIVE associations for hospital | `PlanLimitService.countActiveDoctors()` |
| BR-LIM-02 | Invite blocked when `used >= MAX_DOCTORS` | `assertCanAddDoctor()` on invite |
| BR-LIM-03 | Missing limit key = unlimited for that dimension | Returns `Long.MAX_VALUE` |
| BR-LIM-04 | Branch/dept limits — **planned** P1.5-S6 | Not enforced yet |

## BR-PROV: Provisioning rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-PROV-01 | Public registration role = PATIENT only | `RegistrationService` |
| BR-PROV-02 | Hospital create = platform admin API only | `createProfile()` throws 403 |
| BR-PROV-03 | Doctor add = platform admin invite only | Hospital endpoints throw 403 |
| BR-PROV-04 | Invited doctor association status = ACTIVE immediately | `DoctorInviteService` |
| BR-PROV-05 | Invited doctor profile starts DRAFT | `DoctorProfileProvisioningService` |
| BR-PROV-06 | Hospital admin user gets HOSPITAL_ADMIN role on create | `AdminHospitalService` |
| BR-PROV-07 | Duplicate email rejected on invite/create | DUPLICATE_EMAIL 409 |

## BR-PLAN: Plan catalog rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-PLAN-01 | Plan codes unique per tenant | DB + repository |
| BR-PLAN-02 | FREE plan is default when planCode omitted on hospital create | `DEFAULT_FREE_PLAN_CODE` |
| BR-PLAN-03 | Solo clinic uses hospital plan FREE, not doctor plan | No doctor subscription entity exists |

## BR-HOSP: Hospital status

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-HOSP-01 | Valid statuses: ACTIVE, INACTIVE, SUSPENDED | Validation on PATCH |
| BR-HOSP-02 | Suspended hospital login block | **Not implemented** |

## Validation — CreateAdminHospitalRequest

| Field | Validation |
|-------|------------|
| name | Required, max 300 |
| registrationNumber | Required, unique per tenant |
| hospitalType | GOVERNMENT, PRIVATE, TRUST, CLINIC |
| adminEmail | Valid email, unique |
| adminPhone | Indian/international phone pattern |
| adminPassword | Optional; if set, password policy |

## Validation — InviteDoctorRequest

| Field | Validation |
|-------|------------|
| email | Required, unique |
| firstName, lastName | Required, name pattern |
| phone | Phone pattern |
| password | Optional; generated if omitted |
| branchId, departmentId | Must belong to hospital if provided |
