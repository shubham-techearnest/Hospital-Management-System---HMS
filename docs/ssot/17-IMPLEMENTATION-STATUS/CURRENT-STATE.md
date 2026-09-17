# CURRENT STATE — Where is Health360 today?

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-CUR-001 |
| **Version** | 1.0 |
| **Status** | CURRENT — CODE VERIFIED |
| **Last Updated** | 2026-09-17 |
| **Evidence** | CODE-VERIFIED + DATABASE-VERIFIED + GIT-VERIFIED |

---

## Executive answer

Health360 is a **working multi-tenant hospital operating system MVP** with:

- Strong **Phase-1 identity / hospital / doctor / patient / scheduling / analytics** baseline
- Strong **clinical HMS** on **web + API** through HMS-0…11 and **V2 epics HMS-12…24** (automation, ED/ADT, charges, inventory, procurement, EAM, facility, insurance, blood, staff ops, command center, predictive, hardening)
- **Mobile** covering consumer + doctor + reception + thin staff worklists — **not** full hospital ops parity
- Documentation historically fragmented; this SSOT pack is the reconciliation

**Product version (artifact):** `0.1.0-SNAPSHOT` (backend) / `0.1.0` (web & mobile).  
**Database migration tip:** Flyway **V103**.  
**Git:** branch `master`; working tree dirty with extensive uncommitted HMS V2 work as of audit date (GIT-VERIFIED).

---

## What has actually been built (CURRENT)

### Platform / IAM / tenancy
- Register / login / refresh / logout / email verify / password reset
- JWT RS256 with roles + permissions; account lockout; token blacklist (Redis optional / memory)
- MFA TOTP (migration V77) — depth of UX coverage: PARTIAL (UNKNOWN full E2E)
- Multi-tenant `tenant_id` on auditable entities; hospital/branch scoping services
- Platform admin: users, doctor verification, hospitals, plans, audit logs, reviews
- Hospital subscriptions + plan feature flags (`PlanFeatureKeys`)

### Patient / doctor / hospital discovery
- Patient profile sections, vitals, lab values, analytics/health scores
- Doctor profiles, verification, hospital associations, schedules
- Hospital profile, branches, departments, emergency info, facilities, gallery
- Public doctor/hospital profiles + reviews
- Search / geo / location services

### Clinical foundation (HMS-0…11 class)
- Encounters hub; OPD queue/desk/walk-in/UHID registry
- IPD wards/beds/admissions/transfers/discharge (+ enterprise IPD slices V79–V87)
- ICU stays; Lab / Radiology / OT / Pharmacy clinical orders & worklists
- Staff records + expanded RBAC
- Billing invoices / payments; Razorpay intents
- Clinical documents / letterhead; assets v1
- Role dashboards; performance indexes (V40); golden-path / RBAC ITs

### HMS V2 (HMS-12…24) — CODE-VERIFIED packages + migrations V90–V103
- Automation: hospital events, outbox, tasks/My Work, approvals, rules reactor
- Emergency + ADT facade
- Charge engine (catalog, postings, exceptions, attach; RX_DISPENSE on dispense)
- Inventory, procurement, EAM maintenance, facility work orders
- Insurance/TPA, blood bank, staff ops (roster/leave)
- Command center snapshot; predictive heuristic insights
- V2 hardening indexes + exception queue UI

### Clients
- **Web:** 12 role portals with deep hospital ops screens
- **Mobile:** patient/doctor/reception/hospital-admin/admin + staff worklist shells

---

## What is partially built

| Area | Status | Evidence |
|------|--------|----------|
| Charge engine POST mode | Default DRY_RUN | `health360.charge.mode` |
| Notification templates | Escalation job only; inline strings | HMS-12.5 / HMS-24 docs |
| Rules engine | In-code rules, not configurable UI | AutomationRulesEvaluator |
| Mobile clinical departments | Worklist APIs/screens thin | Mobile navigation |
| Email delivery | Log stub | `LocalEmailNotificationService` |
| SMS | Provider optional; often log | `DefaultSmsNotificationGateway` |
| Redis in prod | Autoconfig excluded in production profile | `application-production.yml` |
| Feature flags for unfinished modules | Flags exist; UI hide completeness UNKNOWN | PlanFeatureKeys |
| Encounter Workspace UX merge | Spec target; multiple encounter pages remain | UX simplification spec |
| CI branch alignment | Workflows `main`/`develop` vs `master` | `.github/workflows` |
| Documentation approval gates | Resolved by docs reset; former `NEXT-ACTION.md` deleted | DOCUMENTATION-AUDIT |

---

## What appears missing / not started (vs long-term vision)

Marked **PROPOSED / NOT_STARTED** unless code found:

Ambulance fleet ops · Home nursing / home healthcare · Physiotherapy module · Full telemedicine product (`FEATURE_TELEMEDICINE` flag exists; product depth UNKNOWN/PARTIAL) · Provider marketplace beyond partner orgs MVP · AI clinical decision support · Full WHO ICD import · Configurable workflow designer UI · Mobile full HMS ops · S3 object storage · In-repo k8s/terraform

---

## What is broken / risky (known)

| Item | Notes | Evidence |
|------|-------|----------|
| Doc vs reality drift | Highest process risk | DOCUMENTATION-AUDIT |
| Uncommitted large HMS V2 surface | Release/traceability risk | `git status` dirty |
| RoleRoute null-user edge | Children may render if user null | Web `RoleRoute` |
| Charge failures swallowed in reactor | Logged; may hide billing gaps | AutomationReactor notes |
| Keep-alive depends on external Render URL | Ops coupling | `keep-alive.yml` |

---

## Testing status

| Layer | Status |
|-------|--------|
| Backend unit + IT | PRESENT (~59 classes); Docker-gated ITs |
| Web Playwright e2e | Workflow `e2e-opd.yml` + scripts |
| Mobile automated E2E | UNKNOWN / not evidenced as first-class |
| Manual QA docs | Deleted in docs reset 2026-09-17; recreate under `docs/ssot/testing/` if needed |
| Security assessment / ASVS | **Not claimed** — no formal compliance evidence |

---

## Database work remaining

- Notification template schema (deferred)
- Optional charge mode production policy decision
- Continuous index review as query patterns evolve
- No destructive down-migrations policy (DOCUMENT-VERIFIED in V2 roadmap)

---

## Frontend / backend / mobile remaining (near-term)

See [PRODUCT-ROADMAP.md](../PRODUCT-ROADMAP.md) and [GAP-ANALYSIS.md](../GAP-ANALYSIS.md).

Near-term themes (APPROVED direction from HMS V2 closeout + open backlogs):

1. Production hardening / release hygiene (commit, CI branch, staging)
2. OPD/ecosystem polish (SMS, self check-in) — ECO backlog
3. Mobile parity for My Work / critical nurse flows (PROPOSED priority)
4. Configurable automation rules & notification templates
5. Charge engine POST cutover + finance UX

---

## Architectural problems (CURRENT)

1. **Modular monolith growth** — many packages; shared event reactor is central chokepoint (acceptable MVP; needs boundaries).
2. **Dual documentation eras** — Phase packs vs HMS V2 vs ecosystem vs SSOT.
3. **Client asymmetry** — web-first HMS; mobile lag creates support burden.
4. **Integration stubs** — email/SMS/log paths can be mistaken for production readiness.
