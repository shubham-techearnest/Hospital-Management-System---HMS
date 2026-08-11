# DOC-62: Phase 1.5 — Sprint Status (Living Document)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-62 |
| **Last Updated** | 2026-08-11 |
| **Maintained By** | Engineering |

> Update this document at the end of each Phase 1.5 sprint.

---

## Overall progress

| Metric | Value |
|--------|-------|
| Sprints complete | 11 / 11 (S0–S10) |
| User story points done | 63 / 63 (100%) |
| Current milestone | **P1.5-M5** — launch gate |
| Next sprint | — (Phase 1.5 complete) |

---

## Sprint status

| Sprint | Name | Status | Completed |
|--------|------|--------|-----------|
| P1.5-S0 | Schema & domain foundation | ✅ Done | 2026-08 |
| P1.5-S1 | Registration policy (patient-only) | ✅ Done | 2026-08-10 |
| P1.5-S2 | Hospital subscription read API | ✅ Done | 2026-08 |
| P1.5-S3 | Platform admin APIs | ✅ Done | 2026-08 |
| P1.5-S4 | Doctor invite & admin-only add | ✅ Done | 2026-08 |
| P1.5-S5 | Web admin & hospital UI | ✅ Done | 2026-08-10 |
| P1.5-S6 | Expanded limit enforcement | ✅ Done | 2026-08-10 |
| P1.5-S7 | Feature gating | ✅ Done | 2026-08-10 |
| P1.5-S8 | Mobile parity | ✅ Done | 2026-08-10 |
| P1.5-S9 | Audit & lifecycle polish | ✅ Done | 2026-08-10 |
| P1.5-S10 | Hardening & launch gate | ✅ Done | 2026-08-11 |

---

## Backend implementation checklist

| Component | Path / migration | Status |
|-----------|------------------|--------|
| V26 plan schema | `V26__create_subscription_plan_schema.sql` | ✅ |
| V27 subscription schema | `V27__create_hospital_subscription_schema.sql` | ✅ |
| V28 seed + permissions | `V28__seed_subscription_plans_and_permissions.sql` | ✅ |
| Subscription module | `com.health360.subscription.*` | ✅ |
| AdminHospitalService | `hospital/application/service/` | ✅ |
| DoctorInviteService | `doctor/application/service/` | ✅ |
| Patient-only RegistrationService | `iam/application/service/` | ✅ |
| Branch/dept/appointment limit enforcement | PlanLimitService + HospitalService + AppointmentService | ✅ |
| Telemedicine feature gating | AppointmentService (TELECONSULTATION) | ✅ |
| Plan downgrade guard | AdminHospitalSubscriptionService | ✅ |
| Plan limits admin edit API | PATCH `/admin/plans/{id}/limits` | ✅ |
| Audit read API | GET `/admin/audit-logs` | ✅ |
| Suspended hospital login block | AuthenticationService | ✅ |
| IndividualPracticeProvisioningService removed | — | ✅ |
| Integration tests (admin flows) | `AdminHospitalSubscriptionIntegrationTest` | ✅ |

---

## Frontend implementation checklist

| Screen | Route | Status |
|--------|-------|--------|
| Admin hospitals list + create | `/admin/hospitals` | ✅ |
| Admin hospital detail | `/admin/hospitals/:id` | ✅ |
| Admin plans + limits edit | `/admin/plans` | ✅ |
| Admin audit logs | `/admin/audit-logs` | ✅ |
| Hospital subscription | `/hospital/subscription` | ✅ |
| Branch/dept limit UX (409 messages) | `/hospital/branches`, `/departments` | ✅ |
| Mobile hospital subscription | Manage → Subscription | ✅ |

---

## Policy decisions log

| Date | Decision |
|------|----------|
| 2026-08-07 | Hospital-centric subscriptions; solo = CLINIC + FREE plan |
| 2026-08-07 | Separate subscription history table (append-only) |
| 2026-08-07 | No staff limits until staff module |
| 2026-08-10 | **Admin-only** hospital create and doctor invite; no INDIVIDUAL_PRACTICE public signup |

---

## Blockers / notes

| Item | Notes |
|------|-------|
| Flyway V26–V28 | Restart API to apply if not yet run |
| JWT permissions | Users need re-login after V28 for new admin permissions |
| Docker tests | `AuthIntegrationTest` and `AdminHospitalSubscriptionIntegrationTest` require Docker (Testcontainers) |

---

## Launch gate (P1.5-M5)

| Item | Status |
|------|--------|
| Admin hospital create + invite integration tests | ✅ |
| Plan change + history integration tests | ✅ |
| Downgrade guard integration test | ✅ |
| Doctor limit 409 on FREE plan | ✅ |
| Hospital self-create 403 | ✅ |
| Manual QA on staging (DOC-63 TC-01–TC-06) | ⏳ Run before production deploy |
| Performance: subscription query p95 | ⏳ Optional pre-launch check |
