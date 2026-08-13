# Health360 — Complete Project Status Audit

| Attribute | Value |
|-----------|-------|
| **Document ID** | HEALTH360-STATUS-001 |
| **Audit Date** | 2026-08-12 |
| **Audit Type** | Read-only repository inspection |
| **Auditor** | Engineering (automated codebase audit) |
| **Purpose** | Establish true project position before Phase 1.5 clinical/HMS expansion |

> **Important:** This audit verifies implementation against the repository and documentation. Where docs conflict, conflicts are reported explicitly. Status labels use: **COMPLETED**, **PARTIALLY COMPLETED**, **IN PROGRESS**, **NOT STARTED**, **BLOCKED**, **UNKNOWN**.

---

## 1. Executive Summary

Health360 is a **multi-platform healthcare SaaS** (Spring Boot API, React web, Expo mobile, PostgreSQL/Flyway) developed in **Phase 1 → Phase 1.5 → Phase 2 (planned)**.

**The team is NOT at Sprint 7.** That assumption is incorrect. Feature development has progressed well beyond Sprint 7 on all platforms:

| Platform | Approximate position (code evidence) | Status |
|----------|--------------------------------------|--------|
| **Backend** | Phase 1 S0–S15 + Phase 1.5 S0–S10 | **COMPLETED** (feature code); production launch gates **NOT STARTED** |
| **Web** | Phase 1 S0–S15 + Phase 1.5 admin/hospital UI | **PARTIALLY COMPLETED** (P1 placeholders; M6 launch pending) |
| **Mobile** | Phase 1 S1–S11+ catch-up + partial S12–S14 + P1.5 subscription only | **PARTIALLY COMPLETED** (behind web/backend; no mobile admin hospital/plan UI) |

**Phase 1.5** (hospital-centric subscriptions, admin provisioning, plan limits) is **code-complete** per DOC-62 and verified in source, but **manual staging QA and production deploy** remain open.

**Phase 2** (e-prescription, pharmacy, lab orders, payments, telemedicine) is **documented only** — **not started** in code.

**Critical blockers for production:** Render JDBC URL format (fix added but deploy-dependent), Flyway V24 checksum drift on some dev DBs, stale project memory docs, M6 launch checklist incomplete, Redis configured but excluded in local/production profiles.

---

## 2. Repository Structure

```
TechEarnestRepo/
├── backend/
│   └── health360-api/          # Spring Boot 3.3.5 modular monolith (Java 21)
├── frontend/
│   └── health360-web/          # React 19 + Vite 6 + MUI 6
├── mobile/
│   └── health360-mobile/       # Expo SDK 52 + React Native 0.76.9
├── docker/
│   ├── docker-compose.yml      # postgres, redis, api, web, nginx
│   └── nginx/
├── docs/
│   ├── 00-PROJECT-MEMORY.md
│   ├── README.md
│   ├── HEALTH360-COMPLETE-PROJECT-STATUS.md   # this document
│   ├── phase-1/                # DOC-01–16, mobile guides
│   ├── phase-1.5/              # DOC-51–63
│   └── phase-2/                # DOC-21–36 (draft)
└── .github/
    └── workflows/              # ci-backend, ci-frontend, ci-mobile
```

**Not present in repo:** `scripts/` root folder, Terraform/IaC, Render config file, E2E test suite, dedicated `testing/` folder outside backend unit tests.

---

## 3. Backend Structure

### 3.1 Stack

| Item | Value |
|------|-------|
| Spring Boot | 3.3.5 |
| Java | 21 |
| Build | Maven |
| ORM | JPA/Hibernate (validate mode) |
| Migrations | Flyway (29 migrations, V1–V29) |
| Security | JWT RS256, RBAC `@PreAuthorize` |
| API docs | springdoc-openapi 2.6.0 |
| Tests | 12 test classes (4 full integration w/ Testcontainers, 7 unit, 1 WebMvc slice) |

### 3.2 Domain Map (verified packages)

```
com.health360
├── config          # Security, JWT, CORS, OpenAPI, DATABASE_URL post-processor
├── iam             # Auth, users, roles, registration, RBAC
├── patient         # Profile, vitals, documents, family, lab values, summary
├── doctor          # Profile, verification, hospital associations, invite
├── hospital        # Profile, branches, departments, facilities, gallery, admin CRUD
├── scheduling      # Templates, slots, appointments, lifecycle
├── analytics       # Formula engine, health dashboard, PDF reports
├── search          # Doctor/hospital/unified search
├── location        # Geography / location APIs
├── review          # Doctor/hospital reviews + admin moderation
├── subscription    # Plans, hospital subscriptions, limits, feature gating
└── shared          # Audit logs, health endpoint, filters, cross-cutting
```

### 3.3 Controllers (25 total)

| Domain | Controllers |
|--------|-------------|
| IAM | AuthController, UserController, AdminUserController, RbacProbeController |
| Patient | PatientProfileController, PatientSummaryController |
| Doctor | DoctorProfileController, DoctorHospitalAssociationController, AdminDoctorVerificationController, PublicDoctorProfileController |
| Hospital | HospitalController, AdminHospitalController, HospitalGalleryController, PublicHospitalProfileController |
| Scheduling | SchedulingController |
| Analytics | AnalyticsController |
| Search | SearchController, DoctorSearchController |
| Location | LocationController |
| Review | ReviewController, AdminReviewController |
| Subscription | AdminSubscriptionPlanController, AdminHospitalSubscriptionController |
| Shared | HealthController, AdminAuditLogController |

### 3.4 Application Profiles

| Profile | File | Purpose |
|---------|------|---------|
| default/local | application.yml + application-local.yml | Local dev |
| dev | application-dev.yml | IDE alias |
| production | application-production.yml | Render/production |
| test | application-test.yml | Testcontainers tests |

---

## 4. Web Frontend Structure

### 4.1 Stack

| Item | Value |
|------|-------|
| React | 19 |
| Vite | 6 |
| TypeScript | 5.7 |
| UI | MUI 6 |
| Routing | react-router-dom 7 |
| Server state | TanStack Query 5 |
| Client state | Redux Toolkit (auth only) |
| Forms | react-hook-form + zod |

### 4.2 Feature Modules (15)

`admin`, `analytics`, `auth`, `doctor`, `hospital`, `lab`, `location`, `patient`, `pharmacy`, `public`, `review`, `scheduling`, `search`, `settings`, `subscription`

**53 page components** under `src/features/**/pages/`.

### 4.3 Route Map (major)

| Area | Routes |
|------|--------|
| Public | `/`, `/login`, `/register`, `/verify-email`, `/doctors/:id`, `/hospitals/:id` |
| Patient | `/patient/dashboard`, `/patient/profile`, `/patient/vitals`, `/patient/health-score`, `/patient/search`, `/patient/book`, `/patient/appointments`, `/patient/reports`, `/patient/lab-values`, `/patient/timeline`, `/patient/prescriptions`, `/patient/payments`, … |
| Doctor | `/doctor/dashboard`, `/doctor/profile`, `/doctor/verification`, `/doctor/hospitals`, `/doctor/schedule`, `/doctor/appointments` |
| Hospital | `/hospital/dashboard`, `/hospital/profile`, `/hospital/branches`, `/hospital/departments`, `/hospital/doctors`, `/hospital/subscription`, `/hospital/facilities`, `/hospital/gallery` |
| Admin | `/admin/dashboard`, `/admin/verifications`, `/admin/users`, `/admin/hospitals`, `/admin/hospitals/:id`, `/admin/plans`, `/admin/audit-logs`, `/admin/reviews` |
| Lab / Pharmacy | `/lab/dashboard`, `/pharmacy/dashboard` (placeholders) |
| Settings | `/settings/account`, `/settings/notifications` |

Auth: JWT in Redux + localStorage; `ProtectedRoute`, `RoleRoute`, `GuestOnlyRoute`; auto token refresh via axios interceptor.

---

## 5. Mobile Application Structure

### 5.1 Stack

| Item | Value |
|------|-------|
| Expo SDK | 52 |
| React Native | 0.76.9 |
| Navigation | React Navigation 7 (stack + tabs) |
| Server state | TanStack Query 5 |
| Auth | AuthContext + secure storage pattern |

### 5.2 Navigation (15 navigator files)

Role-based: Patient tabs, Doctor tabs, Hospital tabs, Admin stack/tabs, Auth stack, Settings stack.

### 5.3 Screens (47 feature screens)

| Module | Screens | API integrated |
|--------|---------|----------------|
| Auth | Welcome, Login, Register, VerifyEmail, Unauthorized | ✅ |
| Patient | 18 screens (home, vitals, profile, search, book, appointments, lab values, documents, timeline, …) | ✅ |
| Doctor | 8 screens | ✅ |
| Hospital | 11 screens incl. HospitalSubscriptionScreen | ✅ |
| Analytics | HealthAnalytics, MetricDetail | ✅ |
| Admin | Home, Users, Verification queue/review, Review moderation | ✅ (no hospitals/plans) |
| Settings | Account, Notifications | ✅ |
| Review | — | ⚠️ API file only |
| Guest | — | ❌ empty placeholder dir |

**Mobile gaps vs web:** No admin hospital create, plan management, or audit log screens. No lab/pharmacy operational screens (matches Phase 2 scope).

---

## 6. Database Structure

### 6.1 Flyway Summary

| Metric | Value |
|--------|-------|
| Current version | **V29** |
| Total migrations | **29** |
| Schemas | `shared`, `iam`, `patient`, `doctor`, `hospital`, `scheduling`, `analytics`, `review` (+ subscription tables in `shared`/`hospital`) |

### 6.2 Migration Timeline (by sprint markers in filenames)

| Version | Sprint marker | Domain |
|---------|---------------|--------|
| V1–V2 | S0–S2 | Shared, IAM, RBAC, audit_logs |
| V3–V5 | S3–S4 | Patient schema, vitals |
| V6–V7 | S5–S6 | Doctor schema, verification |
| V8–V9 | S7 | Hospital schema, dev admin seeds |
| V11–V12 | S8–S9 | Scheduling, appointment lifecycle |
| V13–V16 | S7/S5 polish | Search indexes, dev seeds, profile backfill |
| V17–V18 | S10–S11 | Analytics schema |
| V19–V20 | S11–S12 | Patient completion, search/location |
| V21–V23 | S13–S15 | Public profiles, reviews, admin, polish |
| V24–V25 | Dev/polish | Dev patient seed, enum fixes |
| V26–V29 | **Phase 1.5** | Subscription plans, hospital subscriptions, seeds, currency fix |

### 6.3 Database Domain Map

```
shared
├── tenants, audit_logs, specializations
├── subscription_plans, subscription_plan_limits, subscription_plan_features

iam
├── users, roles, permissions, role_permissions, user_roles
├── email_verification_tokens, refresh_tokens, notification_preferences

patient
├── patient_profiles, allergies, medications, chronic_conditions
├── emergency_contacts, vital_sign_records, physical_measurement_history
├── family_members, health_documents, lab_values, health_timeline_entries

doctor
├── doctor_profiles, qualifications, experience, awards, languages
├── hospital_associations, verification_documents, consultation_defaults

hospital
├── hospitals, branches, departments, facilities, gallery_images
├── branch_working_hours, hospital_subscriptions, hospital_subscription_history

scheduling
├── schedule_templates, time_slots, appointments, appointment_history

analytics
├── calculated_metrics, metric_history, formula_definitions

review
├── doctor_reviews, hospital_reviews
```

### 6.4 Phase Reuse Notes

| Area | Phase 1 | Phase 1.5 added | Reusable for HMS/clinical ops |
|------|---------|-----------------|-------------------------------|
| Hospital core | ✅ V8 | status column, subscriptions V27 | ✅ branches, departments, doctors |
| Doctor associations | ✅ | invite service | ✅ |
| Scheduling | ✅ V11–V12 | appointment limits | ✅ OPD foundation |
| Subscriptions | — | ✅ V26–V29 | ✅ plan limits |
| Clinical (OPD/IPD/ICU/Lab/OT/Pharmacy) | ❌ out of scope | ❌ | ❌ not built |

---

## 7. Documentation Inventory

| Location | Contents | Status |
|----------|----------|--------|
| `docs/00-PROJECT-MEMORY.md` | ADRs, terminology, module list | **Stale** (2026-07-30; says P1.5 in progress) |
| `docs/phase-1/` | DOC-01–16 requirements + architecture + DOC-15 roadmap | Approved |
| `docs/phase-1/mobile/` | Mobile strategy, API guide, sprint status | **Partially stale** (2026-07-31) |
| `docs/phase-1.5/` | DOC-51–63 full Phase 1.5 pack | Active; DOC-62 most current |
| `docs/phase-2/` | DOC-21–36 draft Phase 2 | Draft only |
| `docs/README.md` | Index | Active |

### Documentation Conflicts

| Topic | Conflict |
|-------|----------|
| Phase 1.5 completion | DOC-62 (2026-08-11): all S0–S10 done. DOC-61 §3 still shows S6–S9 pending. phase-1.5/README quick-status stale. |
| Current phase | PROJECT-MEMORY: "P1.5 in progress". DOC-62: P1.5 complete. |
| Mobile sprint | MOBILE_SPRINT_STATUS: S12+ in progress. Codebase has search, public profiles, admin screens implemented. |
| Backend migration count | PROJECT-MEMORY §7.1: "V1–V12". Actual: **V29**. |

**Authoritative for Phase 1.5 sprint status:** `docs/phase-1.5/delivery/62-PHASE-1.5-SPRINT-STATUS.md`

---

## 8. Original Roadmap Summary

### Phase 1 (DOC-15)

| Item | Value |
|------|-------|
| Planned sprints | **15** (S0–S15) |
| Duration | ~30 weeks |
| Milestones | M0–M6 |
| Sprint model | Four-deliverable (Backend + Web + Mobile + Docs) from 2026-07-30 |

### Phase 1.5 (DOC-61)

| Item | Value |
|------|-------|
| Planned sprints | **11** (P1.5-S0 – P1.5-S10) |
| Focus | Hospital-centric SaaS, subscriptions, admin provisioning, plan limits |
| Hospital Management | **Yes — core of Phase 1.5** (not a later add-on) |

### Phase 2 (DOC-34 — Draft)

| Item | Value |
|------|-------|
| Planned sprints | **12** (P2-S0 – P2-S12) |
| Sub-phases | 2A Commerce, 2B Remote care, 2C Enterprise, 2D Launch |
| Major modules | E-prescription, pharmacy, laboratory, payments, telemedicine, clinical notes, insurance/FHIR |

---

## 9. Phase 1 Sprint Matrix

| Phase | Sprint | Planned Objective | Backend | Web | Mobile | Database | Tests | Actual Status | Evidence |
|-------|--------|-------------------|---------|-----|--------|----------|-------|---------------|----------|
| P1 | S0 | Kickoff, scaffold, CI | ✅ | ✅ | ✅ shell | V1 | CI workflows | **COMPLETED** | V1 schema, docker-compose, 3 CI workflows |
| P1 | S1 | Auth foundation | ✅ | ✅ | ✅ | V1 IAM | AuthIntegrationTest | **COMPLETED** | AuthController, login/register/verify |
| P1 | S2 | RBAC + settings | ✅ | ✅ | ✅ | V2 permissions | — | **COMPLETED** | RoleRoute, settings pages, V2 |
| P1 | S3 | Patient profile + consent | ✅ | ✅ | ✅ | V3 | unit tests | **COMPLETED** | PatientProfileController, ConsentPage |
| P1 | S4 | Vitals + completion | ✅ | ✅ | ✅ | V5 | unit tests | **COMPLETED** | VitalsPage, vital_sign_records |
| P1 | S5 | Doctor profile | ✅ | ✅ | ✅ | V6 | — | **COMPLETED** | DoctorProfileController, 5-section UI |
| P1 | S6 | Doctor verification | ✅ | ✅ | ✅ | V7 | — | **COMPLETED** | AdminDoctorVerificationController |
| P1 | S7 | Hospital + associations | ✅ | ✅ | ✅ | V8–V9 | — | **COMPLETED** | HospitalController, associations |
| P1 | S8 | Scheduling core | ✅ | ✅ | ✅ | V11 | BookingConcurrencyIT | **COMPLETED** | SchedulingController, book flow |
| P1 | S9 | Appointment lifecycle | ✅ | ✅ | ✅ | V12 | — | **COMPLETED** | cancel/reschedule APIs + UI |
| P1 | S10 | Formula engine | ✅ | — | — | V17 | FormulaEngineTest | **COMPLETED** | Analytics module; mobile N/A per roadmap |
| P1 | S11 | Health dashboard | ✅ | ✅ | ✅ | V18–V19 | unit tests | **COMPLETED** | HealthScorePage, PatientHomeScreen |
| P1 | S12 | Search + location | ✅ | ✅ | ✅ | V20 | — | **PARTIALLY COMPLETED** | APIs + web/mobile search; geo/maps optional polish open |
| P1 | S13 | Public profiles + maps | ✅ | ✅ | ✅ | V21 | — | **PARTIALLY COMPLETED** | Public profile pages; live maps key optional |
| P1 | S14 | P1 features + admin + reviews | ✅ | ✅ | ✅ partial admin | V22 | — | **PARTIALLY COMPLETED** | Lab values, timeline, reviews; mobile admin missing hospitals |
| P1 | S15 | Polish + **M6 production launch** | ✅ V23 | ✅ | ⚠️ | V23–V25 | limited IT | **PARTIALLY COMPLETED** | Code polish done; **M6 launch gates NOT met** |

---

## 10. Phase 1 — Current Status

| Metric | Value |
|--------|-------|
| Total planned sprints | 15 |
| Feature-complete sprints (code) | ~13–14 |
| Partially complete | S12, S13, S14, S15 |
| M6 production launch | **NOT STARTED** |
| Overall feature completion | **~90%** (code) |
| Overall Phase 1 sign-off | **~75%** (including launch gates) |

### Remaining Phase 1 Work

| Sprint/Area | Objective | Complexity | Notes |
|-------------|-----------|------------|-------|
| **M6 Launch gate** | Production AWS, load test, pen test, UAT | HIGH | DOC-15 §10; not evidenced in repo |
| S12–S14 mobile parity | Admin hospital mgmt on mobile | MEDIUM | Web has it; mobile does not |
| S15 E2E automation | Detox/Maestro | MEDIUM | Documented as pending |
| Push notifications | Mobile | MEDIUM | Not implemented |
| Google Maps live integration | Search/geo | LOW | Optional polish |

---

## 11. Phase 1.5 Sprint Matrix

| Phase | Sprint | Planned Objective | Backend | Web | Mobile | Database | Tests | Actual Status | Evidence |
|-------|--------|-------------------|---------|-----|--------|----------|-------|---------------|----------|
| P1.5 | S0 | Schema foundation | ✅ | — | — | V26 | — | **COMPLETED** | subscription_plans schema |
| P1.5 | S1 | Patient-only registration | ✅ | ✅ | ✅ | — | AuthIT | **COMPLETED** | RegistrationService blocks doctor/hospital signup |
| P1.5 | S2 | Subscription read API | ✅ | ✅ | ✅ | V27 | — | **COMPLETED** | GET /hospitals/me/subscription |
| P1.5 | S3 | Platform admin APIs | ✅ | ✅ | — | V28 | AdminHospitalSubIT | **COMPLETED** | AdminHospitalController, plans |
| P1.5 | S4 | Doctor invite admin-only | ✅ | ✅ | — | — | AdminHospitalSubIT | **COMPLETED** | DoctorInviteService |
| P1.5 | S5 | Web admin + hospital UI | ✅ | ✅ | — | — | — | **COMPLETED** | /admin/hospitals, /hospital/subscription |
| P1.5 | S6 | Limit enforcement | ✅ | ✅ | — | — | PlanLimitServiceTest | **COMPLETED** | branch/dept/appt/doctor limits |
| P1.5 | S7 | Feature gating | ✅ | — | — | V28 features | — | **COMPLETED** | FeatureAccessService, telemedicine gate |
| P1.5 | S8 | Mobile subscription | — | — | ✅ | — | — | **COMPLETED** | HospitalSubscriptionScreen |
| P1.5 | S9 | Audit + lifecycle | ✅ | ✅ | — | — | — | **COMPLETED** | AdminAuditLogController, suspended login |
| P1.5 | S10 | Hardening + launch gate | ✅ | — | — | V29 | AdminHospitalSubIT | **PARTIALLY COMPLETED** | Integration tests added; **manual QA pending** |

---

## 12. Phase 1.5 — Current Status

| Metric | Value |
|--------|-------|
| Planned sprints | 11 |
| Code-complete sprints | 11 |
| Manual staging QA (DOC-63) | **NOT STARTED** / pending |
| Production deploy validation | **BLOCKED** (Render JDBC issue observed) |

**Hospital Management in Phase 1.5:** Yes — hospital admin provisioning, subscription plans, limits, doctor invite policy, hospital profile/branches/departments were **already Phase 1.5 scope** (DOC-51). Not the same as OPD/IPD/ICU clinical operations (future).

### Reusable for next HMS requirements

- Hospital, branch, department, facility, gallery entities + APIs
- Doctor hospital associations + admin invite
- Subscription plans, limits, feature flags, history
- Admin hospital CRUD + plan change (web)
- Audit logging
- Appointment scheduling (OPD foundation only)

---

## 13. Phase 2 Sprint Matrix (DOCUMENTED PLAN ONLY)

| Phase | Sprint | Objective | Started in code? |
|-------|--------|-----------|------------------|
| P2 | S0 | Kickoff + carryover | ❌ NO |
| P2 | S1–S2 | E-prescription | ❌ NO (web placeholder only) |
| P2 | S3–S5 | Pharmacy + lab | ❌ NO (placeholder dashboards) |
| P2 | S6 | Payments | ❌ NO |
| P2 | S7 | Payment UX + mobile | ❌ NO |
| P2 | S8–S9 | Telemedicine + clinical notes | ❌ NO (feature flag prep only in P1.5) |
| P2 | S10–S11 | Insurance + FHIR + AI | ❌ NO |
| P2 | S12 | Hardening + launch | ❌ NO |

**Phase 2 started:** **NO**

---

## 14. Features Implemented Outside Roadmap

| Feature | Where Found | Documented Phase/Sprint | Actual Location | Status |
|---------|-------------|-------------------------|-----------------|--------|
| DatabaseEnvironmentPostProcessor (Render URL) | backend config | Not in roadmap | Recent deploy fix | ✅ |
| Patient prescriptions placeholder page | web `/patient/prescriptions` | Phase 2 | S14 UI shell | Placeholder |
| Lab/Pharmacy role dashboards | web `/lab`, `/pharmacy` | Phase 2 | Routes exist | Placeholder |
| V24 dev patient seed (Shubham) | V24 migration | Not in sprint table | Dev-only | ✅ |
| Review module full stack | V21–V22, review package | S13–S14 | Backend + web | ✅ |
| Admin audit log UI | web `/admin/audit-logs` | P1.5-S9 | Implemented | ✅ |

---

## 15. Planned But Missing Features

| Planned Feature | Phase | Sprint | Backend | Web | Mobile | DB | Missing Work |
|-----------------|-------|--------|---------|-----|--------|-----|--------------|
| M6 production launch | P1 | S15 | partial | partial | partial | ✅ | AWS prod, load/pen test, UAT |
| E-prescription | P2 | S1–S2 | ❌ | placeholder | ❌ | ❌ | Full module |
| Pharmacy operations | P2 | S3–S4 | ❌ | placeholder | ❌ | ❌ | Full module |
| Laboratory operations | P2 | S5 | ❌ | placeholder | ❌ | ❌ | Full module |
| Payment gateway | P2 | S6–S7 | ❌ | placeholder | ❌ | ❌ | Full module |
| Telemedicine video | P2 | S8 | flag only | ❌ | ❌ | ❌ | SDK + rooms |
| Mobile admin hospitals/plans | P1.5 | S5 | ✅ API | ✅ | ❌ | ✅ | Mobile UI |
| Redis session/cache active | P1 | S0+ | configured | — | — | — | Excluded in local/prod profiles |
| OPD/IPD/ICU/OT clinical ops | New reqs | — | ❌ | ❌ | ❌ | ❌ | Not in any phase doc yet |

---

## 16. Partially Implemented Features

| Feature | Backend | Web | Mobile | DB | Problem | Required Completion |
|---------|---------|-----|--------|-----|---------|---------------------|
| Admin hospital management | ✅ | ✅ | ❌ | ✅ | No mobile admin hospital/plan screens | Mobile UI or defer |
| Phase 1.5 launch gate | ✅ | ✅ | partial | ✅ | Manual QA + Render deploy | Staging QA, fix deploy |
| Search/geo discovery | ✅ | ✅ | ✅ | ✅ | Maps API key optional | Config + polish |
| Patient payments | ❌ | placeholder | ❌ | ❌ | Phase 2 scope | Phase 2 |
| Patient prescriptions | ❌ | placeholder | ❌ | ❌ | Phase 2 scope | Phase 2 |
| Lab technician portal | roles only | placeholder | ❌ | ❌ | Phase 2 | Phase 2 |
| Integration test coverage | partial | — | — | ✅ | Docker required; 11 tests skipped without Docker | CI Docker + expand tests |
| PROJECT-MEMORY accuracy | — | — | — | — | Stale vs codebase | Doc refresh |

---

## 17. Technical Debt

| Priority | Item | Location |
|----------|------|----------|
| **CRITICAL** | Render deploy failure (`postgresql://` JDBC URL) | Production; fix in DatabaseEnvironmentPostProcessor — deploy pending |
| **CRITICAL** | M6 production launch not executed | Phase 1 sign-off blocked |
| **HIGH** | Flyway V24 checksum mismatch on some dev DBs | Local dev; run `mvn flyway:repair` |
| **HIGH** | Stale documentation (PROJECT-MEMORY, DOC-61, mobile status) | docs/ |
| **HIGH** | Plan change 500 on stale API process (unique index) | Fixed in code (`saveAndFlush`); requires API restart |
| **MEDIUM** | Redis dependency declared but autoconfig excluded | application-local/production |
| **MEDIUM** | Integration tests require Docker; skipped in CI? | ci-backend runs `mvn verify` — may skip Testcontainers tests |
| **MEDIUM** | No E2E test suite (Detox/Maestro/Cypress) | Documented gap |
| **MEDIUM** | Dev seed migrations in production path (V9, V14, V24) | Flyway runs on all envs |
| **LOW** | Web lab/pharmacy placeholder routes | Intentional Phase 2 teasers |
| **LOW** | 0 TODO/FIXME in backend source | Good hygiene |

---

## 18. Known Issues (documented + observed)

| Issue | Source | Severity |
|-------|--------|----------|
| Appointment/hospital 500 on stale API | Conversation + unique index | HIGH (ops) |
| Render JDBC URL on deploy | Deploy logs 2026-08-11 | CRITICAL |
| Flyway V24 checksum mismatch | Shubham local startup | HIGH (dev) |
| JWT permissions after V28 | DOC-62 | MEDIUM — re-login required |
| Admin 401 after API restart | Stale JWT | MEDIUM |
| Docker not running skips integration tests | Test run logs | MEDIUM |
| Manual QA TC-01–TC-06 not run | DOC-62 launch gate | HIGH (pre-prod) |
| PostgreSQL 17 vs Flyway tested on 16 | Shubham env warning | LOW |

---

## 19. Architecture Dependency Map

```
Authentication (JWT + RBAC)
    ↓
Users / Roles / Permissions
    ↓
├── Patient Profile → Vitals → Analytics (Formula Engine)
├── Doctor Profile → Verification → Hospital Associations
├── Hospital Profile → Branches → Departments → Facilities → Gallery
    ↓
Subscription Plans → Hospital Subscription → Limits / Feature Flags
    ↓
Scheduling (Templates → Slots → Appointments → Lifecycle)
    ↓
Search / Location / Public Profiles / Reviews
    ↓
[NOT BUILT] Clinical Ops (OPD/IPD/ICU/Lab/OT/Pharmacy workflows)
    ↓
[NOT BUILT] Billing / Payments (Phase 2)
    ↓
[NOT BUILT] Reporting / EMR (Phase 2+)
```

---

## 20. Backend / Web / Mobile Synchronization

| Capability | Backend | Web | Mobile |
|------------|---------|-----|--------|
| Auth | ✅ | ✅ | ✅ |
| Patient profile/vitals | ✅ | ✅ | ✅ |
| Doctor profile/verification | ✅ | ✅ | ✅ |
| Hospital admin portal | ✅ | ✅ | ✅ |
| Scheduling/booking | ✅ | ✅ | ✅ |
| Analytics/dashboard | ✅ | ✅ | ✅ |
| Search/public profiles | ✅ | ✅ | ✅ |
| Reviews | ✅ | ✅ | ⚠️ partial |
| Admin verification/users | ✅ | ✅ | ✅ |
| Admin hospitals/plans/audit | ✅ | ✅ | ❌ |
| Hospital subscription view | ✅ | ✅ | ✅ |
| Prescriptions/payments | ❌ | placeholder | ❌ |
| Lab/pharmacy ops | ❌ | placeholder | ❌ |

**Sync verdict:** Backend ≈ Web > Mobile. Mobile is **~2–4 sprints behind** on admin/subscription management UI (except hospital subscription read).

---

## 21. Current True Project Position — Q&A

| # | Question | Answer |
|---|----------|--------|
| Q1 | Highest fully completed sprint? | **Phase 1.5 P1.5-S9** code-complete; **P1.5-S10** code done, QA pending. Phase 1 feature sprints through **S11** fully complete; S12–S15 partial. |
| Q2 | Sprint in progress? | **M6 production launch** (Phase 1) + **P1.5 manual QA / production deploy** |
| Q3 | Are we at Sprint 7? | **NO.** Past S7 on all platforms. |
| Q4 | Phase 1 sprints completed? | **~13/15** feature-complete in code; **0/1** M6 launch gate complete |
| Q5 | Phase 1 sprints remain? | **S15 launch gate**, mobile parity gaps, optional polish |
| Q6 | Phase 1.5 sprints planned? | **11** |
| Q7 | Phase 1.5 sprints completed? | **11/11** code; staging QA open |
| Q8 | Phase 1.5 sprints remain? | **Manual QA + production validation** (not new feature sprints) |
| Q9 | Phase 2 sprints planned? | **12** (draft DOC-34) |
| Q10 | Phase 2 started? | **NO** |
| Q11 | Reusable for Hospital Management? | Hospital CRUD, branches, depts, doctors, subscriptions, limits, scheduling, audit, admin APIs |
| Q12 | Completely missing? | OPD/IPD/ICU/Lab/OT/Pharmacy clinical workflows, EMR, billing/payments, e-Rx, staff module |
| Q13 | Should NOT rebuild? | IAM, patient/doctor profiles, scheduling core, hospital schema, subscription module, analytics engine |
| Q14 | Architecture changes needed first? | Clinical ops domain model; encounter/visit model; bed/ward; order management; extend RBAC; production infra hardening |

---

## 22. Platform Sprint Positions (Independent)

| Platform | Sprint position | Status |
|----------|-----------------|--------|
| **Backend** | Phase 1 **S15** + Phase 1.5 **S10** | Feature code complete; prod deploy blocked |
| **Web** | Phase 1 **S14–S15** + Phase 1.5 **S5–S10** | Strong; placeholders for Phase 2 |
| **Mobile** | Phase 1 **~S11–S13** + Phase 1.5 **S8 only** | Behind web; core flows work |

**Overall project position:** Between **Phase 1.5 code completion** and **Phase 1 M6 / P1.5 production launch**. Not ready for new OPD/IPD/ICU/Lab/OT/Pharmacy clinical module implementation until launch gates and domain architecture for clinical ops are defined.

---

## 23. Recommended Next Step

1. **Refresh stale docs** — `00-PROJECT-MEMORY.md`, DOC-61, phase-1.5 README, MOBILE_SPRINT_STATUS to match DOC-62 and V29.
2. **Unblock production** — Deploy DATABASE_URL fix; set Render env (`SPRING_PROFILES_ACTIVE=production`, JWT keys); run DOC-63 manual QA.
3. **Dev environment hygiene** — `mvn flyway:repair` for V24 checksum; restart API after migrations.
4. **Define clinical/HMS phase charter** — OPD/IPD/ICU/Lab/OT/Pharmacy are **not** in Phase 1, 1.5, or approved Phase 2 docs; require new phase scoping before implementation.
5. **Do NOT start OPD/IPD/ICU/Lab/OT/Pharmacy build** until (a) production launch gate passed or explicitly waived, and (b) clinical domain architecture document exists.

---

## 24. CI/CD Status

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci-backend.yml` | push/PR to main/develop | `mvn verify` in backend |
| `ci-frontend.yml` | push/PR | frontend build/lint |
| `ci-mobile.yml` | push/PR | mobile build/lint |

**Note:** Backend integration tests use `@EnabledIf(DockerAvailable)` — may pass with skipped tests if Docker unavailable on CI runner.

---

## 25. Testing Summary

| Type | Count | Notes |
|------|-------|-------|
| Backend unit | 7 classes | Formula engine, plan limits, profile calculators |
| Backend integration | 4 classes | Auth, booking concurrency, admin hospital subscription |
| Backend WebMvc slice | 1 | HealthController |
| Frontend tests | Not found | No Jest/Vitest suite detected |
| Mobile tests | Not found | No Detox/Maestro |
| E2E | Not found | — |

---

*End of audit. No source code was modified during this inspection.*
