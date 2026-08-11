# DOC-51: Phase 1.5 — Vision & Scope Charter

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-51 |
| **Title** | Phase 1.5 Vision & Scope Charter |
| **Version** | 1.0 |
| **Status** | Approved |
| **Date** | 2026-08-10 |
| **References** | [DOC-01](../phase-1/requirements/01-PROJECT-VISION-AND-SCOPE-CHARTER.md), [DOC-61](../delivery/61-PHASE-1.5-DEVELOPMENT-ROADMAP.md) |

---

## 1. Purpose

Phase 1.5 transforms Health360 from a **single-tenant healthcare platform** into a **hospital-centric SaaS foundation** where:

- Hospitals (including single-doctor clinics) are first-class tenants of the commercial model.
- Subscription plans, limits, and features attach to **hospitals**, not doctors.
- Platform administrators control onboarding of hospitals and doctors.
- Hospital administrators manage day-to-day operations within plan limits.

This phase **does not** include payment collection, invoicing, or staff management — those are deferred to Phase 2 or later modules.

---

## 2. Vision statement

> Every healthcare provider on Health360 — from a solo clinic to a multi-branch hospital — operates under a hospital account with a transparent subscription plan, enforced limits, and a complete audit trail of plan changes.

---

## 3. Goals

| # | Goal |
|---|------|
| G1 | Model all doctors as members of a hospital/clinic (hospital-centric data model) |
| G2 | Provide subscription plan catalog with configurable limits and feature flags |
| G3 | Assign and track current subscription per hospital; preserve full history |
| G4 | Enforce plan limits (starting with doctor count) at provisioning time |
| G5 | Enable platform admin to create hospitals, assign plans, and invite doctors |
| G6 | Provide hospital admins read access to subscription usage and roster (post-provisioning) |
| G7 | Restrict public registration to **patients only** |

---

## 4. Non-goals (explicitly out of scope)

| Item | Rationale |
|------|-----------|
| Payment gateway / billing automation | Phase 2 commerce |
| Staff entity and `MAX_STAFF` limits | Staff module not built |
| Self-service hospital signup | Admin-only provisioning policy |
| Self-service doctor signup | Admin invite only |
| Individual Practice public registration | Removed — admin creates CLINIC hospitals |
| Hospital admin inviting doctors | Platform admin only (current policy) |
| Multi-tenant billing isolation | Single tenant in Phase 1.5 MVP |
| Subscription renewal/cancellation automation | Manual admin plan change only |

---

## 5. Stakeholders

| Role | Interest |
|------|----------|
| Platform Admin | Hospital onboarding, plan management, doctor invites, subscription overrides |
| Hospital Admin | View subscription usage, manage profile/branches/departments after provisioning |
| Doctor | Invited by platform admin; completes profile after first login |
| Patient | Unaffected except registration remains patient-only |
| Engineering | Extensible limit/feature keys without schema redesign |

---

## 6. Architectural decisions (locked)

| Decision | Choice |
|----------|--------|
| Subscription owner | Hospital |
| Solo doctor representation | CLINIC hospital with `MAX_DOCTORS = 1` |
| Current vs history | `hospital_subscriptions` (current) + `hospital_subscription_history` (append-only) |
| Doctor–hospital link | `doctor.hospital_associations` (existing M:N) |
| Staff limits | Deferred; schema supports adding `MAX_STAFF` later |
| Public registration | `PATIENT` only |
| Hospital creation | Platform admin API only |
| Doctor creation | Platform admin invite API only |

---

## 7. Success criteria

Phase 1.5 is **complete** when:

1. Platform admin can create a hospital with admin user, plan, and subscription history row.
2. Platform admin can invite doctors up to plan limit; 409 when limit reached.
3. Hospital admin can view subscription usage and roster (read-only for doctor adds).
4. Plan catalog is visible and editable (metadata) by platform admin.
5. All subscription changes append to history; no history rows deleted.
6. Web UI covers admin hospitals, plans, hospital detail, hospital subscription.
7. Document pack DOC-51–DOC-63 approved and sprint status current.

---

## 8. Dependencies

| Dependency | Status |
|------------|--------|
| Phase 1 hospital module (V8) | Complete |
| Phase 1 IAM / RBAC | Complete |
| Phase 1 doctor profiles & associations | Complete |
| Flyway migration pipeline | Complete |

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Limit enforcement gaps on non-doctor resources | Sprint P1.5-S6 expands enforcement |
| Feature flags not wired to APIs | Sprint P1.5-S7 adds gating |
| JWT permissions stale after V28 seed | Re-login required after migration |
| Legacy `IndividualPracticeProvisioningService` unused | Deprecate/remove in hardening sprint |
