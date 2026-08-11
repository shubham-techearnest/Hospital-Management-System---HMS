# DOC-61: Phase 1.5 — Development Roadmap & Implementation Plan

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-61 |
| **Title** | Phase 1.5 Development Roadmap |
| **Version** | 1.0 |
| **Status** | **Active** |
| **Date** | 2026-08-10 |
| **References** | [DOC-51](../requirements/51-PHASE-1.5-VISION-AND-SCOPE-CHARTER.md), [DOC-54](../requirements/54-PHASE-1.5-USER-STORIES.md), [DOC-62](./62-PHASE-1.5-SPRINT-STATUS.md) |

---

## 1. Executive summary

Phase 1.5 delivers **hospital-centric SaaS foundations** in approximately **6–8 two-week sprints** (~12–16 weeks), parallel to Phase 1 launch prep and before Phase 2 commerce modules.

**Milestone targets:**

| Milestone | Target | Outcome |
|-----------|--------|---------|
| **P1.5-M0** | Week 0 | Architecture approved; V26–V28 designed |
| **P1.5-M1** | Week 4 | Subscription schema + domain services live |
| **P1.5-M2** | Week 8 | Platform admin APIs + doctor invite |
| **P1.5-M3** | Week 12 | Web admin + hospital subscription UI |
| **P1.5-M4** | Week 16 | Full limit/feature enforcement + mobile parity |
| **P1.5-M5** | Week 18 | Phase 1.5 complete — launch gate passed |

**Current progress (2026-08-10):** ~M2 complete, M3 largely complete on web.

---

## 2. Principles

| Principle | Application |
|-----------|-------------|
| Hospital-centric | Subscriptions on hospitals; doctors via associations |
| Admin-only provisioning | No public hospital/doctor signup |
| Append-only history | Never delete subscription history |
| Extensible limits | String keys in `subscription_plan_limits` |
| Vertical slices | Each sprint ships backend + web (+ mobile when scheduled) |
| Phase 1 compatible | Extends existing hospital/doctor modules, no breaking changes |

---

## 3. Sprint plan

### P1.5-S0 — Schema & domain foundation ✅
**Goal:** Database and Java domain layer for subscriptions.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| V26 subscription_plans, limits, features | Backend | Done |
| V27 hospital_subscriptions + history + hospital.status | Backend | Done |
| V28 seed plans, permissions, backfill | Backend | Done |
| JPA entities + repositories | Backend | Done |
| `HospitalSubscriptionService` (assign, change, history) | Backend | Done |
| `PlanLimitService`, `FeatureAccessService` | Backend | Done |
| DOC-55, DOC-56 draft | Docs | Done |

---

### P1.5-S1 — Registration policy ✅
**Goal:** Lock registration to patients; remove solo doctor self-signup.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| Remove `INDIVIDUAL_PRACTICE` from `RegistrationRole` | Backend | Done |
| Block hospital self-create (403) | Backend | Done |
| Patient-only web/mobile register UI | Web/Mobile | Done |
| Auth integration tests | Backend | Done |
| Update business rules doc | Docs | Done |

**Note:** Original "individual practice auto-provision" sprint superseded by admin-only policy (2026-08-10).

---

### P1.5-S2 — Hospital subscription read API ✅
**Goal:** Hospital admins see plan and usage.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| `HospitalSubscriptionQueryService` | Backend | Done |
| `GET /hospitals/me/subscription` | Backend | Done |
| Permission `hospital:subscription:read` (V28) | Backend | Done |
| `PlanLimitServiceTest` | Backend | Done |

---

### P1.5-S3 — Platform admin APIs ✅
**Goal:** Admin can manage hospitals, plans, subscriptions.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| `AdminHospitalService` + controller | Backend | Done |
| `AdminSubscriptionPlanService` + controller | Backend | Done |
| `AdminHospitalSubscriptionService` + controller | Backend | Done |
| `POST /admin/hospitals` (create + admin user) | Backend | Done |
| DOC-57 API spec | Docs | Done |

---

### P1.5-S4 — Doctor invite & admin-only doctor add ✅
**Goal:** Platform admin invites doctors with limit enforcement.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| `DoctorInviteService` | Backend | Done |
| `POST /admin/hospitals/{id}/doctors/invite` | Backend | Done |
| Block hospital admin invite/associate (403) | Backend | Done |
| Email: verification + invitation with temp password | Backend | Done |

---

### P1.5-S5 — Web admin & hospital UI ✅ (partial mobile)
**Goal:** Operable UI for admins and hospital admins.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| Admin hospitals list + create dialog | Web | Done |
| Admin hospital detail (plan, invite, history) | Web | Done |
| Admin plans page | Web | Done |
| Hospital subscription page | Web | Done |
| Hospital roster read-only | Web | Done |
| Mobile patient-only register | Mobile | Done |
| Mobile hospital subscription | Mobile | Not started |

---

### P1.5-S6 — Expanded limit enforcement ⏳
**Goal:** Enforce all seeded limits at mutation endpoints.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| `assertCanAddBranch()` on branch create | Backend | Pending |
| `assertCanAddDepartment()` on dept create | Backend | Pending |
| Appointment monthly limit on booking | Backend | Pending |
| Downgrade guard (usage vs new plan) | Backend | Pending |
| Plan limits/features admin edit API | Backend | Pending |
| Limit-reached UX on branch/dept UI | Web | Pending |

**Acceptance:** 409 on each limit violation with actionable message.

---

### P1.5-S7 — Feature gating ⏳
**Goal:** Premium features blocked by plan.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| `@RequiresFeature` or service-level checks | Backend | Pending |
| Gate analytics endpoints (FEATURE_ANALYTICS) | Backend | Pending |
| Gate telemedicine hooks (FEATURE_TELEMEDICINE) | Backend | Pending |
| Upgrade prompt in UI when 403 FEATURE_NOT_AVAILABLE | Web | Pending |

---

### P1.5-S8 — Mobile parity ⏳
**Goal:** Hospital admin can view subscription on mobile.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| Hospital subscription screen | Mobile | Pending |
| API hooks in `hospitalApi` | Mobile | Pending |
| Update MOBILE-STATUS doc | Docs | Pending |

---

### P1.5-S9 — Audit & lifecycle polish ⏳
**Goal:** Operational completeness.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| GET `/admin/audit-logs` (paginated) | Backend | Pending |
| Subscription SUSPENDED / REACTIVATED flows | Backend | Pending |
| Block login for SUSPENDED hospital | Backend | Pending |
| Remove deprecated `IndividualPracticeProvisioningService` | Backend | Pending |
| Admin audit viewer UI | Web | Pending |

---

### P1.5-S10 — Hardening & launch gate ✅
**Goal:** Production-ready Phase 1.5.

| Deliverable | Owner | Status |
|-------------|-------|--------|
| Integration tests: admin hospital create + invite | Backend | ✅ Done |
| Integration tests: plan change + history | Backend | ✅ Done |
| E2E: admin creates hospital → invites doctor → hospital admin views subscription | QA | ⏳ Manual (DOC-63) |
| Performance: subscription query < 100ms p95 | QA | ⏳ Optional pre-launch |
| Security review of invite flow | Security | ⏳ Before production |
| Update DOC-62 sprint status = complete | Docs | ✅ Done |

---

## 4. Workstream allocation

| Sprint | Backend | Web | Mobile | Docs |
|--------|---------|-----|--------|------|
| S0–S4 | 80% | 10% | 5% | 5% |
| S5 | 20% | 70% | 10% | — |
| S6–S7 | 90% | 10% | — | — |
| S8 | 10% | — | 80% | 10% |
| S9–S10 | 60% | 30% | — | 10% |

---

## 5. Dependencies & sequencing

```
S0 (schema) → S2 (read API) → S3 (admin APIs) → S4 (invite)
S1 (registration) — parallel after S0
S3 + S4 → S5 (UI)
S2 → S6 (limits need usage queries)
S6 → S7 (feature gating)
S5 → S8 (mobile subscription)
S3 → S9 (audit)
All → S10 (hardening)
```

**Phase 2 dependency:** Billing module (P2-S6) should consume `HospitalSubscription` and plan catalog from Phase 1.5.

---

## 6. Launch gate checklist (P1.5-M5)

- [x] All P0 user stories in DOC-54 accepted (implemented)
- [x] V26–V29 applied (migrations in repo; restart API to apply locally)
- [x] Platform admin can complete full onboarding flow without manual SQL
- [x] Doctor limit 409 verified on FREE plan (1 doctor max) — `AdminHospitalSubscriptionIntegrationTest`
- [x] Subscription history verified append-only — integration test
- [x] Web UI complete for admin + hospital subscription
- [x] Mobile hospital subscription (minimum)
- [x] No public doctor/hospital registration paths — `AuthIntegrationTest`
- [x] DOC-51–DOC-63 reviewed and current
- [ ] Manual QA on staging (DOC-63 TC-01–TC-06) before production deploy

---

## 7. Risk register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Incomplete limit enforcement | Medium | S6 before marketing tier upgrades |
| Feature flags not wired | Medium | S7 before enabling premium modules |
| JWT permission drift | Low | Document re-login after V28 |
| Dead code (IndividualPracticeProvisioningService) | Low | Remove in S9 |

---

## 8. Definition of done (per sprint)

1. Backend: migrations applied, APIs documented in DOC-57, unit tests for new services
2. Web: pages routed, build passes, error states handled
3. Mobile: equivalent screen when scheduled in sprint
4. Docs: DOC-62 sprint status updated, FR-53 statuses updated

---

## 9. Quick start for developers

```bash
# Apply migrations (restart API)
cd backend/health360-api && mvn spring-boot:run

# Verify compile + unit/integration tests
mvn test -Dtest=PlanLimitServiceTest,AuthIntegrationTest,AdminHospitalSubscriptionIntegrationTest

# Web admin UI
cd frontend/health360-web && npm run dev
# → /admin/hospitals, /admin/plans, /hospital/subscription
```

**Test credentials:** See project README / `00-PROJECT-MEMORY.md`. Platform admin required for hospital create and doctor invite.
