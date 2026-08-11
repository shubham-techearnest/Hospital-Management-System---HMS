# DOC-53: Phase 1.5 — Functional Requirements

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-53 |
| **Version** | 1.0 |
| **Status** | Approved |
| **References** | [DOC-52](./52-PHASE-1.5-BUSINESS-REQUIREMENTS.md), [DOC-57](../architecture/57-PHASE-1.5-REST-API-DESIGN.md) |

---

## FR-1 Registration & IAM

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1.1 | `POST /auth/register` accepts `role: PATIENT` only | Done |
| FR-1.2 | Legacy `DOCTOR` / `INDIVIDUAL_PRACTICE` roles rejected (400) | Done |
| FR-1.3 | Invited users created with `PENDING_VERIFICATION`; email verification required | Done |

## FR-2 Platform admin — hospitals

| ID | Requirement | Status |
|----|-------------|--------|
| FR-2.1 | List hospitals (paginated, filter by name/status) | Done |
| FR-2.2 | Get hospital detail with admin info and subscription summary | Done |
| FR-2.3 | Create hospital + hospital admin user + initial subscription | Done |
| FR-2.4 | Update hospital status (ACTIVE / INACTIVE / SUSPENDED) | Done |
| FR-2.5 | Invite doctor to hospital | Done |

## FR-3 Platform admin — plans

| ID | Requirement | Status |
|----|-------------|--------|
| FR-3.1 | List all subscription plans with limits and features | Done |
| FR-3.2 | Get plan by ID | Done |
| FR-3.3 | Update plan name, description, price, status | Done |
| FR-3.4 | Create new plan via API | Not started |
| FR-3.5 | Edit plan limits/features via API | Not started |

## FR-4 Platform admin — subscriptions

| ID | Requirement | Status |
|----|-------------|--------|
| FR-4.1 | View hospital subscription summary (plan + usage + features) | Done |
| FR-4.2 | Change hospital plan (records history) | Done |
| FR-4.3 | View subscription history (append-only) | Done |
| FR-4.4 | Suspend / reactivate subscription lifecycle | Not started |
| FR-4.5 | Trial period automation | Not started |

## FR-5 Hospital admin portal

| ID | Requirement | Status |
|----|-------------|--------|
| FR-5.1 | View own subscription (`GET /hospitals/me/subscription`) | Done |
| FR-5.2 | Update hospital profile (not create) | Done |
| FR-5.3 | View doctor roster (read-only for adds) | Done |
| FR-5.4 | Remove doctor association | Done |
| FR-5.5 | Self-create hospital profile | Blocked (403) |
| FR-5.6 | Invite/associate doctors | Blocked (403) |

## FR-6 Limit & feature services

| ID | Requirement | Status |
|----|-------------|--------|
| FR-6.1 | `PlanLimitService.assertCanAddDoctor()` on doctor invite | Done |
| FR-6.2 | Usage metrics in subscription summary (doctors, branches, departments) | Done |
| FR-6.3 | `FeatureAccessService.hasFeature()` available | Done (service only) |
| FR-6.4 | Enforce limits on branch/department/appointment create | Not started |
| FR-6.5 | Enforce feature flags on gated endpoints | Not started |

## FR-7 Web UI

| ID | Requirement | Status |
|----|-------------|--------|
| FR-7.1 | Admin: Hospitals list + create dialog | Done |
| FR-7.2 | Admin: Hospital detail (plan change, invite, history) | Done |
| FR-7.3 | Admin: Plans list + edit dialog | Done |
| FR-7.4 | Hospital: Subscription page with usage bars | Done |
| FR-7.5 | Hospital: Roster read-only with admin-contact message | Done |
| FR-7.6 | Register page: patient only | Done |
| FR-7.7 | Limit-reached UX (409 messages) | Partial |

## FR-8 Mobile

| ID | Requirement | Status |
|----|-------------|--------|
| FR-8.1 | Register screen: patient only | Done |
| FR-8.2 | Hospital subscription view | Not started |
| FR-8.3 | Platform admin screens | Not started |

## FR-9 Audit

| ID | Requirement | Status |
|----|-------------|--------|
| FR-9.1 | Write audit on hospital create, plan change, doctor invite | Done |
| FR-9.2 | Read audit log API for platform admin | Not started |
