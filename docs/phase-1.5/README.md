# Phase 1.5 — Hospital SaaS & Subscription Architecture

**Status:** In progress (Sprints P1.5-S0 through P1.5-S5 largely complete)  
**Goal:** Hospital-centric subscription management, platform-admin provisioning, plan limits, and admin portals — without blocking Phase 1 launch.

Phase 1.5 sits **between Phase 1 (Foundation)** and **Phase 2 (Commerce & Care Delivery)**. It enables Health360 to operate as a **multi-hospital SaaS platform** where subscriptions belong to hospitals, not individual doctors.

---

## Core business rule

**Health360 is hospital-centric.** Every doctor belongs to a hospital/clinic. Subscriptions belong to hospitals. Solo practitioners are modeled as a **CLINIC hospital** with one doctor on a hospital plan (e.g. Free/Solo, `MAX_DOCTORS = 1`).

**Provisioning is admin-only:** platform administrators create hospitals and invite doctors. Public signup is **patients only**.

---

## Document index

### Requirements (what to build)

| ID | Document |
|----|----------|
| DOC-51 | [Vision & Scope Charter](./requirements/51-PHASE-1.5-VISION-AND-SCOPE-CHARTER.md) |
| DOC-52 | [Business Requirements](./requirements/52-PHASE-1.5-BUSINESS-REQUIREMENTS.md) |
| DOC-53 | [Functional Requirements](./requirements/53-PHASE-1.5-FUNCTIONAL-REQUIREMENTS.md) |
| DOC-54 | [User Stories & Acceptance Criteria](./requirements/54-PHASE-1.5-USER-STORIES.md) |

### Architecture (how to build)

| ID | Document |
|----|----------|
| DOC-55 | [Domain & Subscription Architecture](./architecture/55-PHASE-1.5-DOMAIN-AND-SUBSCRIPTION-ARCHITECTURE.md) |
| DOC-56 | [Database Design](./architecture/56-PHASE-1.5-DATABASE-DESIGN.md) |
| DOC-57 | [REST API Design](./architecture/57-PHASE-1.5-REST-API-DESIGN.md) |
| DOC-58 | [Business Rules & Validation](./architecture/58-PHASE-1.5-BUSINESS-RULES.md) |
| DOC-59 | [UI/UX Screen Specification](./architecture/59-PHASE-1.5-UI-UX-SCREENS.md) |
| DOC-60 | [Security & Permissions](./architecture/60-PHASE-1.5-SECURITY-AND-PERMISSIONS.md) |

### Delivery (when & in what order)

| ID | Document |
|----|----------|
| DOC-61 | [**Development Roadmap & Implementation Plan**](./delivery/61-PHASE-1.5-DEVELOPMENT-ROADMAP.md) |
| DOC-62 | [Sprint Status (living)](./delivery/62-PHASE-1.5-SPRINT-STATUS.md) |

### Quality

| ID | Document |
|----|----------|
| DOC-63 | [Test Plan](./testing/63-PHASE-1.5-TEST-PLAN.md) |

---

## Implementation code paths

| Layer | Path |
|-------|------|
| Backend subscription module | `backend/health360-api/src/main/java/com/health360/subscription/` |
| Hospital admin APIs | `backend/health360-api/.../hospital/` |
| Doctor invite | `backend/health360-api/.../doctor/application/service/DoctorInviteService.java` |
| Flyway migrations | `backend/health360-api/src/main/resources/db/migration/V26–V28__*.sql` |
| Web admin UI | `frontend/health360-web/src/features/admin/` |
| Web hospital subscription | `frontend/health360-web/src/features/hospital/`, `features/subscription/` |
| Mobile (patient registration only) | `mobile/health360-mobile/src/features/auth/` |

---

## Quick status (2026-08-10)

| Area | Status |
|------|--------|
| DB schema + plan seed (V26–V28) | Done |
| Subscription domain services | Done |
| Platform admin hospital/plan/subscription APIs | Done |
| Doctor invite (platform admin) | Done |
| Patient-only public registration | Done |
| Web admin hospitals/plans UI | Done |
| Web hospital subscription page | Done |
| Doctor limit enforcement | Done (invite path) |
| Branch/dept/appointment limits | Not started |
| Feature gating on API endpoints | Not started |
| Mobile admin/subscription UI | Not started |
| Audit log read API | Not started |

See [DOC-62 Sprint Status](./delivery/62-PHASE-1.5-SPRINT-STATUS.md) for detail.

---

## Related documents

- [Phase 1 README](../phase-1/README.md) — Foundation modules this phase extends
- [Phase 2 README](../phase-2/README.md) — Commerce/telemedicine (depends on subscription features)
- [Project Memory](../00-PROJECT-MEMORY.md) — Cross-phase decisions
