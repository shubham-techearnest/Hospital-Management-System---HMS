# 02 — Repository Audit (Phase A Discovery)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-AUDIT-001 |
| **Phase** | A — Repository Discovery |
| **Status** | COMPLETE for Phase A scope |
| **Audit date** | 2026-09-17 |
| **Branch** | `master` (CODE-VERIFIED) |
| **Method** | Manifest + source scan + controller/migration enumeration + router extraction |

---

## A.1 Repository structure

**Confidence: HIGH**

| Path | Purpose |
|------|---------|
| `backend/health360-api/` | Modular monolith REST API |
| `frontend/health360-web/` | Primary web SPA (role portals) |
| `mobile/health360-mobile/` | Expo consumer + staff shells |
| `docker/` | Compose (Postgres 16, Redis 7, NGINX) |
| `docs/ssot/` | Product/architecture documentation (intent + prior audits) |
| `docs/agile/` | This Agile reconstruction tree |
| `scripts/` | Local helper scripts |
| `.github/` | CI workflows |
| `mannual/` | Manual materials (non-code) |

**Not present on disk (despite older SSOT inventory claims):** `Figma/`, `Figma1/`.

---

## A.2 Technology stack

### Backend — `backend/health360-api/pom.xml`

**Confidence: HIGH**

| Layer | Choice |
|-------|--------|
| Language | Java **21** |
| Framework | Spring Boot **3.3.5** |
| Persistence | Spring Data JPA, `ddl-auto: validate` |
| Migrations | Flyway (**104** scripts, tip **V104**) |
| Database | PostgreSQL |
| Cache / token blacklist | Redis (with in-memory fallback) |
| Security | Spring Security + JWT (jjwt **0.12.6**, RSA) |
| API docs | springdoc-openapi **2.6.0** |
| Mapping | MapStruct **1.6.2** |
| PDF | OpenPDF |
| Tests | spring-boot-starter-test, Testcontainers PostgreSQL |

### Web — `frontend/health360-web/package.json`

**Confidence: HIGH**

| Layer | Choice |
|-------|--------|
| UI | React **19**, MUI **6**, Emotion |
| Build | Vite **6**, TypeScript **5.7** |
| Router | react-router-dom **7** |
| Client state | Redux Toolkit (auth only) |
| Server state | TanStack React Query **5** |
| HTTP | axios (not RTK Query) |
| Forms | react-hook-form + zod |
| E2E | Playwright |

### Mobile — `mobile/health360-mobile/package.json`

**Confidence: HIGH**

| Layer | Choice |
|-------|--------|
| Runtime | Expo **~52**, RN **0.76.9**, React **18.3** |
| Nav | React Navigation **7** |
| Data | TanStack Query + axios |
| Depth | Substantial (~75 screens) — **not a stub** |

---

## A.3 Applications & entry points

| App | Entry | Confidence |
|-----|-------|------------|
| API | `com.health360.Health360Application` | HIGH |
| Web | `frontend/health360-web/src/main.tsx` → `AppProviders` → `AppRouter` | HIGH |
| Web router (sole) | `frontend/health360-web/src/app/router.tsx` | HIGH |
| Mobile | Expo app entry under `mobile/health360-mobile/` | HIGH |

---

## A.4 Backend package map

**Confidence: HIGH**

Root: `com.health360`

Domain packages observed (non-exhaustive of every class):  
`adt`, `analytics`, `asset`, `automation`, `billing`, `blood`, `clinical`, `commandcenter`, `config`, `dashboard`, `doctor`, `documents`, `emergency`, `facility`, `hospital`, `iam`, `icu`, `insurance`, `inventory`, `ipd`, `laboratory`, `location`, `opd`, `org`, `ot`, `patient`, `pharmacy`, `predictive`, `procurement`, `radiology`, `review`, `scheduling`, `search`, `shared`, `staffops`, `subscription`, `tasks`, `workflow`.

Typical layering per package: `application` / `domain` / `infrastructure` / `presentation`.

Architecture style: **modular monolith** (stated in `pom.xml`).

---

## A.5 API surface (controllers)

**Confidence: HIGH**

| Metric | Count |
|--------|------:|
| `@RestController` classes | **60** |
| Plain `@Controller` | **0** |

### Base path inventory (class-level)

| Area | Example base paths |
|------|-------------------|
| Platform | `/api/v1/health`, `/api/v1/auth`, `/api/v1/users`, `/api/v1/rbac` |
| Admin | `/api/v1/admin/users`, `/admin/doctors`, `/admin/hospitals`, `/admin/plans`, `/admin/partners`, `/admin/reviews`, `/admin/audit-logs`, `/admin/onboarding-requests` |
| Patient | `/api/v1/patients`, `/api/v1/hospital/patients` |
| Doctor | `/api/v1/doctors`, `/api/v1/doctors/me/hospital-associations` |
| Hospital / staff | `/api/v1/hospitals`, `/api/v1/hospital/staff`, `/api/v1/hospital/catalogs` |
| Discovery | `/api/v1/search`, `/api/v1/location`, `/api/v1/scheduling` |
| Clinical ops | `/api/v1/clinical`, `/opd`, `/ipd`, `/icu`, `/lab`, `/radiology`, `/ot`, `/pharmacy` |
| Revenue / ops | `/api/v1/billing`, `/billing/charges`, `/assets`, `/inventory`, `/procurement`, `/facility`, `/insurance`, `/blood` |
| ED / ADT | `/api/v1/emergency`, `/api/v1/adt` |
| Automation | `/api/v1/tasks`, `/api/v1/approvals`, `/api/v1/command-center`, `/api/v1/predictive`, `/api/v1/staff-ops` |
| Dashboards | Method-level under `DashboardController` (admin/hospital/opd/ipd/icu/lab/radiology/pharmacy/ot/doctor/patient) |
| Public | `/api/v1/public/onboarding-requests`, public doctor/hospital profile endpoints |

---

## A.6 Database / Flyway

**Confidence: HIGH**

| Metric | Value |
|--------|-------|
| Migration files | **104** (`V1` … `V104`) |
| Tip | `V104__onboarding_requests.sql` |
| ORM mode | validate against Flyway schema |

**Schemas created (CODE-VERIFIED sample):**  
`shared`, `iam`, `patient`, `doctor`, `hospital`, `scheduling`, `analytics`, `location`, `subscription`, `clinical`, `opd`, `ipd`, `icu`, `laboratory`, `radiology`, `ot`, `pharmacy`, `billing`, `org`, `asset`, `automation`, `tasks`, `workflow`, `emergency`, `inventory`, `procurement`, `facility`, `insurance`, `blood`, `staffops`.

**JPA entities:** ~**181–183** `*Entity.java` files.

**SSOT drift:** `docs/ssot` still cites tip **V103** in places — treat as DOCUMENT lag vs CODE tip **V104**.

---

## A.7 Authentication & authorization

**Confidence: HIGH**

| Concern | Finding | Evidence |
|---------|---------|----------|
| AuthN | JWT Bearer, RSA-signed; refresh; optional MFA verify path | `SecurityConfig`, `JwtTokenService`, `V77__mfa_totp.sql` |
| Session | Stateless | `SecurityConfig` |
| Public paths | Auth register/login/refresh/verify/forgot/reset, MFA verify, public profiles/reviews, onboarding-requests, Razorpay webhook, health/swagger | `SecurityConfig` |
| AuthZ | Permission codes in JWT + `@PreAuthorize("hasAuthority('…')")` | Controllers, `UserPrincipal` |
| Roles | **12** DB-seeded IAM roles (no full Java Role enum) | Flyway V1/V13/V36/V37/V39/V88 |
| Registration | Public self-register limited to **PATIENT** | `RegistrationRole`, web `RegisterPage` |
| Staff invite | Hospital staff inviteable roles set in `StaffService` | Backend |

---

## A.8 Roles discovered (CODE-VERIFIED)

| Role | Seed migration |
|------|----------------|
| `PATIENT` | V1 |
| `DOCTOR` | V1 |
| `HOSPITAL_ADMIN` | V1 |
| `PLATFORM_ADMIN` | V1 |
| `LAB_TECHNICIAN` | V13 |
| `PHARMACIST` | V13 |
| `RADIOLOGY_TECHNICIAN` | V36 |
| `OT_COORDINATOR` | V37 |
| `RECEPTIONIST` | V39 |
| `NURSE` | V39 |
| `ICU_NURSE` | V39 |
| `ASSET_MANAGER` | V88 |

Web `AppRole` in `frontend/health360-web/src/shared/auth/roleNavigation.ts` matches these **12**.

**Non-IAM enum (OT team only):** `SURGEON`, `ASSISTANT`, `ANAESTHETIST`, `SCRUB_NURSE`, `CIRCULATING_NURSE` — not portal login roles.

---

## A.9 Web frontend discovery

**Confidence: HIGH**

| Metric | Count / note |
|--------|--------------|
| Feature folders | **39** under `src/features/` |
| `*Page*.tsx` files | **~124** |
| Unique path strings in router | **~119** (includes nested/relative) |
| Role portals | **12** (Patient, Doctor, Hospital Admin, Platform Admin, Lab, Radiology, OT, Pharmacy, Assets, Reception, Nursing, ICU Nurse) |
| Guards | `GuestOnlyRoute`, `ProtectedRoute`, `RoleRoute` |
| Patient portal guard gap | `/patient/*` is **Protected only** — **not** `RoleRoute role="PATIENT"` |
| RoleRoute edge | If `user` null but token present, role check skipped (code-literal) |

Full route tables: [evidence/WEB_ROUTE_INVENTORY.md](./evidence/WEB_ROUTE_INVENTORY.md).

---

## A.10 Mobile discovery (brief)

**Confidence: HIGH (existence/depth); MEDIUM (parity vs web)**

- ~75 screens, multiple role navigators.
- Consumer + clinical shells present.
- Many hospital-ops areas thinner / absent vs web (aligns with SSOT FEATURE-INVENTORY mobile column — to be re-verified in Phase C).

---

## A.11 Integrations

**Confidence: HIGH (code present); MEDIUM (ops maturity)**

| Integration | Status signal |
|-------------|---------------|
| Razorpay | Client + webhook + V73 |
| MSG91 SMS | Gateway with log stub fallback |
| Expo push | Service + NoOp alternative |
| Redis | JWT blacklist |
| Stripe | Enum only — **no client implementation found** |
| Email | Log/stub patterns claimed in SSOT — re-verify Phase C |
| Object storage (S3) | Not found as implemented product path |

---

## A.12 Background jobs

**Confidence: HIGH**

| Scheduler | Interval |
|-----------|----------|
| `AppointmentReminderScheduler` | 60s |
| `FollowUpReminderScheduler` | 300s |
| `TaskEscalationScheduler` | 300s |
| `PredictiveInsightScheduler` | 900s |

---

## A.13 Tests

**Confidence: HIGH (counts)**

| Metric | Approx. |
|--------|--------:|
| Backend test Java files | **59** |
| With `@SpringBootTest` | **~27** |
| Web Playwright | Present as dependency |
| Coverage completeness | **UNKNOWN** (no reliable denominator) |

---

## A.14 Git chronology (implementation era — not sprints)

**Confidence: MEDIUM** (message-based; no formal sprint artifacts in git)

Recent `master` themes (newest first):

1. Landing / login-register UX densification  
2. Documentation sweep (`docs/ssot`)  
3. Asset management  
4. OPD/IPD testing docs  
5. IPD phases / OPD completion claims  
6. Phase G/H  
7. Billing UI + OPD  
8. HMS initial setup / ward-bed admit  
9. Early deployment readiness commits  

**Rule:** Do **not** invent historical Sprint 1…N from these commits. Label as **Baseline / Pre-Agile Implementation Era**.

---

## A.15 DOCUMENT vs CODE deltas (important)

| Claim source | Claim | Code finding |
|--------------|-------|--------------|
| SSOT CURRENT-STATE / inventory | Flyway tip V103 | Tip **V104** onboarding_requests |
| SSOT REPOSITORY-INVENTORY | ~58 controllers | **60** RestControllers |
| SSOT FEATURE-INVENTORY | Many modules IMPLEMENTED | **Unverified for Agile** until Phase C E2E; treat as **hypothesis**, not Agile status |
| SSOT inventory | Figma folders | **Absent** on disk |

---

## A.16 Provisional module map (for Phase B/D)

Derived from **packages + portals + migrations** (not final Themes):

| Candidate module | Web portal / feature | API package(s) | DB signal |
|------------------|----------------------|----------------|-----------|
| Identity & Access | auth, settings | iam | V1–V2, V77, V104 |
| Public / Marketing | public | public onboarding, public profiles | V104, V21 |
| Patient Experience | patient | patient, analytics | V3+, V17 |
| Doctor Practice | doctor | doctor | V6+ |
| Hospital Org | hospital | hospital, staff | V8, V39 |
| Platform Admin | admin | admin* | V9+ |
| Discovery & Scheduling | search, scheduling | search, scheduling, location | V11–V20 |
| OPD | opd, reception | opd | V31+ |
| Clinical Encounter | clinical, documents | clinical, documents | V30, V47–V48 |
| IPD | ipd, nursing | ipd | V33, V80–V87 |
| ICU | icu, icu-nurse | icu | V34 |
| Lab / Rad / OT / Pharmacy | lab, radiology, ot, pharmacy | matching | V35–V38 |
| Billing & Charges | billing | billing | V41, V73, V92–V93 |
| ED / ADT | emergency (hospital) | emergency, adt | V91 |
| Supply & Assets | inventory, procurement, asset | matching | V88, V94–V96 |
| Facility / Insurance / Blood / Staff Ops | hospital pages | matching | V97–V100 |
| Automation / Command / Predictive | tasks, commandcenter, predictive | matching | V90, V101–V102 |
| Subscriptions / Partners | subscription, org, admin plans | subscription, org | V26–V28, V62 |
| Mobile parity | mobile app | same API | — |

---

## A.17 Phase A exit criteria

| Criterion | Met? |
|-----------|------|
| Stack known from manifests | Yes |
| Apps identified | Yes |
| Roles from DB/code | Yes |
| Controllers counted | Yes |
| Migrations tip known | Yes |
| Web router inventoried | Yes (see evidence doc) |
| Stories written | **No — correctly deferred** |
| Feature statuses frozen | **No — Phase C required** |

---

## A.18 Next phase

**PHASE B — Frontend Inventory & Functional Audit**

For every route/page, capture: Module, Role, Purpose, Actions, Forms, Tables, API calls, Permissions, Backend dependency, **provisional** status (`UNKNOWN` until traced).

Output: expand [evidence/WEB_ROUTE_INVENTORY.md](./evidence/WEB_ROUTE_INVENTORY.md) → feed [07_FEATURE_CATALOG.md](./07_FEATURE_CATALOG.md).
