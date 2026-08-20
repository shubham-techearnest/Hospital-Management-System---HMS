# Health360 AI — Project Memory (Living Document)

> **Status:** Active  
> **Last Updated:** 2026-08-20  
> **Maintained By:** Technical Lead / Chief Architect  
> **Purpose:** Single source of truth for assumptions, decisions, terminology, and cross-document references.

---

## 1. Document Registry


| ID     | Document                                    | Status               | Version | Depends On     |
| ------ | ------------------------------------------- | -------------------- | ------- | -------------- |
| DOC-00 | Project Memory                              | Active               | 1.0     | —              |
| DOC-01 | Project Vision & Phase 1 Scope Charter      | **Approved**         | 1.0     | DOC-00         |
| DOC-02 | Business Requirements Document (BRD)        | **Approved**         | 1.0     | DOC-01         |
| DOC-03 | Functional Requirements Specification (FRS) | **Approved**         | 1.0     | DOC-02         |
| DOC-04 | Non-Functional Requirements (NFR)           | **Approved**         | 1.0     | DOC-02, DOC-03 |
| DOC-05 | Domain Model & Bounded Contexts             | **Approved**         | 1.0     | DOC-03, DOC-04 |
| DOC-06 | Database Design Specification               | **Approved**         | 1.0     | DOC-05         |
| DOC-07 | REST API Design Specification               | **Approved**         | 1.0     | DOC-05, DOC-06 |
| DOC-08 | Health Formula Engine Specification         | **Approved**         | 1.0     | DOC-03, DOC-06, DOC-07 |
| DOC-09 | Business Rules & Validation Catalog         | **Approved**         | 1.0     | DOC-03, DOC-08         |
| DOC-10 | UI/UX Screen Specification                  | **Approved**         | 1.0     | DOC-03, DOC-07, DOC-09 |
| DOC-11 | System Architecture Document                | **Approved**         | 1.0     | DOC-05, DOC-04, DOC-10   |
| DOC-12 | Security Architecture                       | **Approved**         | 1.0     | DOC-11, DOC-04           |
| DOC-13 | DevOps & Deployment Architecture            | **Approved**         | 1.0     | DOC-11, DOC-12, DOC-04   |
| DOC-14 | User Stories & Acceptance Criteria          | **Approved**         | 1.0     | DOC-03, DOC-10         |
| DOC-15 | Development Roadmap                         | **Approved**         | 1.1     | DOC-01, DOC-14, DOC-11 |
| DOC-16 | Architecture Diagrams Pack                  | **Approved**         | 1.0     | DOC-11, DOC-05, DOC-06   |
| MOBILE-STRAT-001 | Mobile Development Strategy           | **Active**           | 1.0     | DOC-15, DOC-10, DOC-11   |
| MOBILE-API-001   | Mobile API Integration Guide          | **Active**           | 1.0     | DOC-07, backend codebase |
| MOBILE-STATUS-001 | Mobile Sprint Status                 | **Active**           | 1.0     | MOBILE-STRAT-001         |

### Phase 1.5 documents (Active — 2026-08-10)

| ID     | Document                                    | Status               | Path |
| ------ | ------------------------------------------- | -------------------- | ---- |
| DOC-51 | Phase 1.5 Vision & Scope Charter            | Approved             | `phase-1.5/requirements/51-*` |
| DOC-52 | Phase 1.5 Business Requirements             | Approved             | `phase-1.5/requirements/52-*` |
| DOC-53 | Phase 1.5 Functional Requirements           | Approved             | `phase-1.5/requirements/53-*` |
| DOC-54 | Phase 1.5 User Stories                      | Approved             | `phase-1.5/requirements/54-*` |
| DOC-55 | Phase 1.5 Domain & Subscription Architecture | Approved             | `phase-1.5/architecture/55-*` |
| DOC-56 | Phase 1.5 Database Design                   | Approved             | `phase-1.5/architecture/56-*` |
| DOC-57 | Phase 1.5 REST API Design                   | Approved             | `phase-1.5/architecture/57-*` |
| DOC-58 | Phase 1.5 Business Rules                    | Approved             | `phase-1.5/architecture/58-*` |
| DOC-59 | Phase 1.5 UI/UX Screens                     | Approved             | `phase-1.5/architecture/59-*` |
| DOC-60 | Phase 1.5 Security & Permissions            | Approved             | `phase-1.5/architecture/60-*` |
| DOC-61 | Phase 1.5 Development Roadmap               | **Active**           | `phase-1.5/delivery/61-*` |
| DOC-62 | Phase 1.5 Sprint Status                     | **Active (living)**  | `phase-1.5/delivery/62-*` |
| DOC-63 | Phase 1.5 Test Plan                         | Active               | `phase-1.5/testing/63-*` |

### Phase 2 documents (Draft — 2026-08-03)

| ID     | Document                                    | Status               | Path |
| ------ | ------------------------------------------- | -------------------- | ---- |
| DOC-21 | Phase 2 Vision & Scope Charter              | Draft                | `phase-2/requirements/21-*` |
| DOC-22 | Phase 2 Business Requirements (BRD)         | Draft                | `phase-2/requirements/22-*` |
| DOC-23 | Phase 2 Functional Requirements (FRS)       | Draft                | `phase-2/requirements/23-*` |
| DOC-24 | Phase 2 Non-Functional Requirements           | Draft                | `phase-2/requirements/24-*` |
| DOC-25 | Phase 2 Domain Model                        | Draft                | `phase-2/architecture/25-*` |
| DOC-26 | Phase 2 Database Design                     | Draft                | `phase-2/architecture/26-*` |
| DOC-27 | Phase 2 REST API Design                     | Draft                | `phase-2/architecture/27-*` |
| DOC-28 | Phase 2 Business Rules                      | Draft                | `phase-2/architecture/28-*` |
| DOC-29 | Phase 2 UI/UX Screens                       | Draft                | `phase-2/architecture/29-*` |
| DOC-30 | Phase 2 System Architecture (Delta)         | Draft                | `phase-2/architecture/30-*` |
| DOC-31 | Phase 2 Security Architecture (Delta)       | Draft                | `phase-2/architecture/31-*` |
| DOC-32 | Phase 2 DevOps (Delta)                      | Draft                | `phase-2/architecture/32-*` |
| DOC-33 | Phase 2 User Stories                        | Draft                | `phase-2/requirements/33-*` |
| DOC-34 | Phase 2 Development Roadmap                 | Draft                | `phase-2/delivery/34-*` |
| DOC-35 | Phase 2 Architecture Diagrams               | Draft                | `phase-2/architecture/35-*` |
| DOC-36 | Launch Decision Framework (Phase 1 vs 2)    | Draft                | `phase-2/delivery/36-*` |


---



## 2. Project Identity


| Attribute              | Value                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| **Project Name**       | Health360 AI                                                      |
| **Tagline**            | Enterprise Digital Healthcare Ecosystem                           |
| **Current Phase**      | Phase 1 — Foundation + **Phase 1.5** (Hospital SaaS) in progress |
| **Architecture Style** | Modular Monolith (Microservice-Ready)                             |
| **Deployment Model**   | Multi-Tenant Ready (Single-Tenant deployment in Phase 1 MVP path) |
| **Primary Markets**    | India (initial), globally extensible                              |


---



## 3. Canonical Terminology


| Term                 | Definition                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tenant**           | An organization (hospital group, clinic network) operating on the platform. Phase 1 prepares schema; full tenant isolation enforced in Phase 1.5+. |
| **Patient**          | End user seeking healthcare services; owns a comprehensive health profile.                                                                         |
| **Doctor**           | Licensed healthcare provider with verified professional profile.                                                                                   |
| **Hospital**         | Healthcare facility with branches, departments, and associated doctors.                                                                            |
| **Appointment**      | Scheduled consultation linking Patient, Doctor, Hospital, and Time Slot.                                                                           |
| **Health Profile**   | Structured collection of patient data used for analytics and formula calculations.                                                                 |
| **Formula Engine**   | Deterministic calculation service for health metrics (BMI, BMR, risk scores, etc.).                                                                |
| **Modular Monolith** | Single deployable unit with domain-bounded modules separated by package boundaries and interfaces.                                                 |


---



## 4. Recorded Assumptions


| ID      | Assumption                                                                                    | Impact                     | Validated |
| ------- | --------------------------------------------------------------------------------------------- | -------------------------- | --------- |
| ASM-001 | Phase 1 targets web (React) + mobile (React Native) with shared API contracts                 | Drives API-first design    | Pending   |
| ASM-002 | Google Maps Platform used for geo-search, distance, travel time                               | Location domain dependency | Pending   |
| ASM-003 | Medical registration numbers follow country-specific formats; India NMC/MCI format as default | Doctor verification rules  | Pending   |
| ASM-004 | All datetime stored in UTC; displayed in user/timezone preference                             | Scheduling consistency     | Pending   |
| ASM-005 | Soft delete used for all user-facing entities; hard delete only for compliance purge          | Data retention             | Pending   |
| ASM-006 | Phase 1 does NOT process payments, prescriptions, lab orders, or insurance claims             | Scope boundary             | Confirmed |
| ASM-007 | Email + SMS notification channels in Phase 1; push notifications via mobile                   | Notification architecture  | Pending   |
| ASM-008 | English UI in Phase 1; i18n architecture prepared for Hindi and regional languages            | Frontend architecture      | Pending   |
| ASM-009 | HIPAA-aligned practices adopted; full HIPAA certification is post-Phase 1                     | Security baseline          | Pending   |
| ASM-010 | Tenant ID present on all domain tables from day one                                           | Multi-tenant readiness     | Confirmed |


---



## 5. Architecture Decision Records (ADR)


| ID      | Decision                                                               | Rationale                                                                                        | Status   |
| ------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| ADR-001 | Modular Monolith over Microservices for Phase 1                        | Faster delivery, lower ops complexity; modules designed for future extraction                    | Approved |
| ADR-002 | PostgreSQL as primary datastore                                        | ACID, JSON support, geo extensions (PostGIS future), enterprise maturity                         | Approved |
| ADR-003 | Redis for session/cache/rate-limiting                                  | Performance, refresh token blacklist support                                                     | Approved |
| ADR-004 | JWT Access Token + Refresh Token rotation                              | Stateless API scaling with secure session revocation                                             | Approved |
| ADR-005 | RBAC with fine-grained permissions                                     | Enterprise healthcare requires role separation (Patient, Doctor, Hospital Admin, Platform Admin) | Approved |
| ADR-006 | DDD with Clean Architecture per module                                 | Independent modules, testability, future microservice extraction                                 | Approved |
| ADR-007 | MapStruct for DTO mapping                                              | Compile-time safety, performance                                                                 | Approved |
| ADR-008 | Zod (frontend) + Jakarta Validation (backend)                          | Dual validation layer; API contract integrity                                                    | Approved |
| ADR-009 | TanStack Query for server state; Redux Toolkit for client/global state | Separation of server vs UI state                                                                 | Approved |
| ADR-010 | Audit logging on all mutating operations                               | Healthcare compliance and traceability                                                           | Approved |
| ADR-011 | Terraform for Infrastructure as Code                                     | Resolves OQ-NFR-003; multi-service composition, mature AWS provider                              | Approved |
| ADR-012 | AWS ECS Fargate for production compute                                   | Serverless containers; no EC2 patching; aligns with NFR-OPS-001 ECS-ready                        | Approved |
| ADR-013 | Parallel mobile development from S7 onward                                 | Mobile ships every sprint alongside backend/web; catch-up S1–S7 incrementally; same REST APIs     | Approved |


---



## 6. Explicitly Out of Scope (Future Phases)

The following modules are **NOT** part of Phase 1. They are recorded here to prevent scope creep:

- Pharmacy Management
- Laboratory / Diagnostics
- Blood Bank
- Insurance & Claims
- Billing & Invoicing
- Payment Gateway
- AI Assistant / Clinical Decision Support (beyond formula engine)
- Telemedicine (Video Consultation)
- Inventory & ERP
- CMS / Content Management
- HR & Payroll
- E-Prescription
- EMR/EHR Full Clinical Documentation
- IoT Device Integration
- Wearable Sync

---



## 7. Phase 1 Domain Modules (In Scope)

1. Identity & Access Management (IAM)
2. Patient Domain
3. Doctor Domain
4. Hospital Domain
5. Scheduling Domain
6. Location Domain
7. Health Analytics Domain

---

## 7.1 Implementation Status (Updated 2026-07-30)

### Development Policy

**Four-deliverable sprints** (effective 2026-07-30): every sprint produces Backend + Web + Mobile + Documentation. See [DOC-15 §2.1](phase-1/delivery/15-DEVELOPMENT-ROADMAP.md) and [MOBILE-STRAT-001](phase-1/mobile/MOBILE_DEVELOPMENT_STRATEGY.md).

| Workstream | Through Sprint | Notes |
|------------|----------------|-------|
| Backend | S9 (target) | Migrations V1–V12; scheduling lifecycle + notifications |
| Web | S9 (target) | Through S9 appointment lifecycle (patient + doctor portals) |
| Mobile | **S9** | Appointment history complete; caught up through S9 |
| Docs | MOBILE-STRAT-001 | API guide + sprint status tracker published |

| Component | Path | Status |
|-----------|------|--------|
| Backend API | `backend/health360-api/` | Spring Boot 3, Flyway V1–V12 |
| Web app | `frontend/health360-web/` | React 19 + Vite + MUI |
| Mobile app | `mobile/health360-mobile/` | Expo SDK 52; through S9 appointment lifecycle |
| Docker Compose | `docker/` | postgres, redis, api, web, nginx |
| CI pipelines | `.github/workflows/` | ci-backend, ci-frontend, ci-mobile |

**Next (all workstreams):** S15 polish + production launch checklist (M6).

### M5–M6 Status (Updated 2026-08-03)

| Milestone | Target | Status | Notes |
|-----------|--------|--------|-------|
| **M5** Analytics & Search | Week 24 | **~85%** | Formula engine, dashboard, search APIs (V20–V21); web largely complete; mobile search partial |
| **M6** Production Launch | Week 30 | **Not started** | Load test, pen test, prod AWS, UAT gates in [DOC-15 §10](../phase-1/delivery/15-DEVELOPMENT-ROADMAP.md) |

**Completed since last update:** S12–S14 backend migrations (V20–V22); web public landing, care discovery, role dashboards, patient P1 screens (labs, documents, timeline, reviews); mobile auth UX, responsive layouts, hero polish.

**Remaining before Phase 1 sign-off:**

1. **Mobile parity** — S12–S15 screens (unified search, geo, public profiles, admin/reviews on mobile where applicable)
2. **Production hardening** — staging/prod AWS, load & security testing, monitoring runbooks
3. **Optional polish** — Google Maps API key for live maps; push notifications; E2E automation
4. **Explicitly out of scope** — Prescriptions & payments routes remain placeholders (Phase 2 per DOC-00 §6)

**Documentation:** Reorganized under `docs/phase-1/` and `docs/phase-2/` — see [docs/README.md](README.md).

### S10 Formula Engine + S11 Health Dashboard — Complete (2026-08-01)

**Backend:** V17 migration (`analytics.health_metrics_snapshots`, `calculated_metrics`); `FormulaEngineService` with all 20 formulas (FML-001–020); `HealthDashboardService` + `/api/v1/analytics/patients/me/*`; auto-recalc on profile/vitals update; `FormulaEngineTest` with DOC-08 vectors.

**Web:** Health dashboard with wellness/risk score gauges, key metric cards (`DashboardPage`); full analytics view (`HealthScorePage`).

**Mobile:** Wellness/risk scores + top metrics on `PatientHomeScreen`; `analyticsApi` hooks.

**User stories:** US-ANL-001–006 (dashboard, formula engine, classification, wellness/risk scores, auto-recalc).

### S9 Scheduling Lifecycle + Notifications — Complete (2026-07-31)

**Backend:** V12 migration (lifecycle permissions, reminder tracking); cancel/reschedule/status APIs; in-app + email notifications; `@Scheduled` T-24h/T-1h reminders.

**Web:** Patient appointments list/detail (`/patient/appointments`); doctor appointments + mark completed/no-show (`/doctor/appointments`).

**Mobile:** Patient appointments list + detail with cancel/reschedule.

**User stories:** US-SCH-005–008, US-NTF-001–002.

### S8 Scheduling Core — Complete (2026-08-01)

**Backend:** V11 migration (`scheduling.doctor_schedules`, `schedule_blocks`, `time_slots`, `appointments`); slot generation (30-day horizon); doctor schedule CRUD; availability API; booking with pessimistic lock (`FOR UPDATE`); V16 seeds schedules/slots for verified doctors.

**Web:** Doctor weekly schedule (`/doctor/schedule`); 5-step booking wizard (`/patient/book/:doctorId`) — hospital → date → time → confirm → success; doctor search entry (`/patient/book`).

**Mobile:** Doctor Schedule tab; **Find Doctor** tab with search + **Book Appointment** flow; dedicated **Appointments** tab.

**Tests:** `BookingConcurrencyIntegrationTest` (Testcontainers, parallel threads, R-007).

**User stories:** US-SCH-001–004 (templates, slot generation, availability, booking).

### S7 Hospital Setup — Complete (2026-07-30)

**Backend:** V8 migration (hospitals, branches, departments, doctor hospital associations), hospital admin APIs, doctor association APIs.

**Web:** Hospital portal (`/hospital/*`) — profile, branches, departments, emergency/ICU, doctor roster; doctor hospital associations (`/doctor/hospitals`).

**Mobile:** ✅ Hospital admin portal (profile, branches, manage stack) + doctor hospital associations tab — S7 catch-up complete (2026-07-31).

### S6 Doctor Verification — Complete (2026-07-30)

**Backend:** V7 migration (languages, verification documents), document upload, submit verification, admin approve/reject APIs.

**Web:** Doctor verification page (SCR-DOC-005), admin verification queue + review (SCR-ADM-003/004).

**Mobile:** ✅ Verification upload, submit, status tab — S6 catch-up complete (2026-07-31).

### S5 Mobile Doctor Profile — Complete (2026-07-30)

**Mobile:** Doctor profile accordion (5 sections), doctor API + React Query hooks, verification status chip.

### S4 Mobile Vitals + Dashboard — Complete (2026-07-30)

**Mobile:** Health dashboard, vitals recording, latest vitals cards, compact completion widget, VitalsScreen.

### S3 Mobile Patient Profile — Complete (2026-07-30)

**Mobile:** Consent gate, profile hub with 6 accordion sections, patient API + React Query hooks.

### S2 Mobile Settings + RBAC — Complete (2026-07-30)

**Mobile:** Account settings, change password, notification preferences; patient/doctor bottom-tab shell with RoleGuard.

### S1 Mobile Auth — Complete (2026-07-30)

**Mobile:** Expo init, auth stack, secure token storage, Axios refresh interceptor, role-based home placeholders.

### S5 Doctor Profile — Complete (2026-07-30)

| Story | Status |
|-------|--------|
| US-DOC-001 through US-DOC-005, US-DOC-008 | Complete |

**Backend:** V6 doctor schema, `DoctorProfileService`, `/doctors/me/profile/*` APIs.

**Frontend:** Doctor portal at `/doctor/profile` (accordion layout).

**Mobile:** ✅ Doctor profile accordion (5 sections) — S5 catch-up complete.

### S4 Vitals + Profile Completion — Complete (2026-07-30)

| Story | Status |
|-------|--------|
| US-PAT-009 Record Vital Signs | Complete |
| US-PAT-014 Profile Completion Score | Complete |

**Backend:** V5 vital_sign_records migration, VitalSignService, BpClassificationService, vitals API endpoints, VITALS section in completion calculator.

**Frontend:** Patient portal layout (sidebar + responsive), dashboard, vitals cards, health score widget, Framer Motion animations, lazy routes, React Query hooks.

### S3 Patient Profile Core — Complete (2026-07-30)

| Story | Status |
|-------|--------|
| US-PAT-001 Create Patient Profile (consent) | Complete |
| US-PAT-002 Update Basic Information | Complete |
| US-PAT-003 Update Contact Information | Complete |
| US-PAT-004 Update Physical Measurements | Complete |
| US-PAT-005 Manage Medical Information | Complete |
| US-PAT-006 Update Lifestyle Profile | Complete |
| US-PAT-007 Manage Emergency Contacts | Complete |

**Backend:** V3 patient schema migration, entities/repos, `PatientProfileService`, `PatientProfileController`, `ProfileCompletionCalculator` (+ unit tests).

**Frontend:** `/patient/consent`, `/patient/profile` hub + section pages, navbar Health Profile link.

| Story | Status |
|-------|--------|
| US-IAM-001 Register | Implemented |
| US-IAM-002 Verify Email | Implemented |
| US-IAM-003 Login | Implemented |
| US-IAM-004 Refresh Token | Implemented |
| US-IAM-005 Logout | Implemented |
| US-IAM-010 Audit Log | Implemented |

### S2 RBAC + Account Management — Complete (2026-07-30)

| Story | Status |
|-------|--------|
| US-IAM-007 RBAC enforcement | Complete |
| US-IAM-006 Change Password | Complete |
| US-IAM-008 Account Profile Settings | Complete |
| US-IAM-009 Notification Preferences | Complete |

**Stabilization fixes:** Persisted JWT keys, 401 for invalid tokens, refresh-token interceptor, auth-aware navbar, AccountSettings UI fix.

### S1 Auth Foundation (2026-07-29)

---



## 8. Stakeholder Roles (Phase 1 Personas)


| Persona                     | Description                                                          | Primary Goals                                                                             |
| --------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Patient**                 | Individual managing personal health profile and booking appointments | Complete profile, find doctors/hospitals, book/manage appointments, view health dashboard |
| **Doctor**                  | Healthcare provider managing professional profile and schedule       | Maintain profile, set availability, manage appointments, view patient summary (limited)   |
| **Hospital Admin**          | Facility administrator                                               | Manage hospital profile, departments, doctor associations, operating hours                |
| **Platform Admin**          | Health360 operations team                                            | User management, doctor verification, audit review, system configuration                  |
| **Guest / Unauthenticated** | Prospective user                                                     | Search doctors/hospitals, view public profiles                                            |


---



## 9. Cross-Document Reference Convention

All documents use this reference format:

- `[DOC-XX]` — Reference to another document
- `[ASM-XXX]` — Reference to an assumption
- `[ADR-XXX]` — Reference to an architecture decision
- `[BR-XXX]` — Business rule (defined in DOC-09)
- `[FR-XXX]` — Functional requirement (defined in DOC-03)

---



## 10. Change Log


| Date       | Document | Change                              | Author         |
| ---------- | -------- | ----------------------------------- | -------------- |
| 2026-07-27 | DOC-00   | Initial creation                    | Technical Lead |
| 2026-07-27 | DOC-01   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-27 | DOC-01   | Approved by stakeholder             | Product Owner  |
| 2026-07-27 | DOC-02   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-27 | DOC-02   | Approved by stakeholder             | Product Owner  |
| 2026-07-27 | DOC-03   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-28 | DOC-03   | Approved by stakeholder             | Product Owner  |
| 2026-07-28 | DOC-04   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-28 | DOC-04   | Approved by stakeholder             | Product Owner  |
| 2026-07-28 | DOC-05   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-28 | DOC-05   | Approved by stakeholder             | Product Owner  |
| 2026-07-28 | DOC-06   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-06   | Approved by stakeholder             | Product Owner  |
| 2026-07-29 | DOC-07   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-07   | Approved by stakeholder             | Product Owner  |
| 2026-07-29 | DOC-08   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-08   | Approved by stakeholder             | Product Owner  |
| 2026-07-29 | DOC-09   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-09   | Approved by stakeholder             | Product Owner  |
| 2026-07-29 | DOC-10   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-10   | Approved by stakeholder             | Product Owner  |
| 2026-07-29 | DOC-11   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-11   | Approved by stakeholder             | Product Owner  |
| 2026-07-29 | DOC-12   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-12   | Approved by stakeholder (proceed)   | Product Owner  |
| 2026-07-29 | DOC-13   | Initial creation — Pending Approval | DevOps Lead    |
| 2026-07-29 | DOC-13   | Approved by stakeholder             | Product Owner  |
| 2026-07-29 | DOC-14   | Initial creation — Pending Approval | Product Owner  |
| 2026-07-29 | DOC-14   | Approved by stakeholder (proceed)   | Product Owner  |
| 2026-07-29 | DOC-15   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-15   | Approved by stakeholder (proceed)   | Product Owner  |
| 2026-07-29 | DOC-16   | Initial creation — Pending Approval | Technical Lead |
| 2026-07-29 | DOC-16   | Approved by stakeholder             | Product Owner  |
| 2026-07-29 | ALL      | Phase 1 documentation program complete (DOC-00–DOC-16) | Product Owner |
| 2026-07-30 | MOBILE   | S1 mobile auth catch-up complete (Expo + auth screens) | Technical Lead |
| 2026-07-30 | DOC-15   | v1.1 — four-deliverable sprint policy; parallel mobile catch-up | Technical Lead |
| 2026-07-30 | MOBILE   | MOBILE-STRAT-001, MOBILE-STATUS-001, ADR-013 published | Technical Lead |
| 2026-07-29 | IMPL     | S0 kickoff — monorepo scaffold created | Technical Lead |
| 2026-08-20 | HMS-PDMP | Health360 HMS Product Development Master Plan created (30 deliverables) | Program Team |
| 2026-08-20 | P1-F1    | P1-F1 documentation package (14 docs) — DRAFT | Program Team |
| 2026-08-20 | HMS      | HMS-0…11 as-built marked RELEASED; governed program for OPD/IPD gaps | Program Team |


---

## 11. HMS Program (2026-08-20)

| Item | Value |
|------|-------|
| Master plan | [HMS-PRODUCT-MASTER-PLAN.md](./HMS-PRODUCT-MASTER-PLAN.md) |
| Mode | **DOCUMENTATION / PLANNING — awaiting approval** |
| As-built HMS | HMS-0…11 **RELEASED** ([hms/HMS-SPRINT-STATUS.md](./hms/HMS-SPRINT-STATUS.md)) |
| Latest Flyway | V41 billing schema |
| Next migration | V42 (P1-F1 — **not approved**) |
| First feature | P1-F1 UHID + hospital registration + duplicate detection |
| Architecture hub | `clinical.encounters` = PatientVisit (ADR-002) |
| Blocking decisions | DEC-001 UHID scope, DEC-002 duplicate threshold, DEC-004 walk-in user |
| Approval phrase | `"APPROVE ROADMAP AND P1-F1"` |

### Critical rules (non-negotiable)

1. No duplicate Patient entity — extend `patient.patient_profiles`
2. No parallel PatientVisit table
3. Flyway V42+ only; never edit V1–V41
4. Additive APIs; preserve React+Vite and Expo RN stacks
5. No feature code without APPROVED documentation package

See [NEXT-ACTION.md](./NEXT-ACTION.md).

