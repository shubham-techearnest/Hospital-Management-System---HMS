# Health360 — Module Development Plan (Tracked)

| Attribute | Value |
|-----------|-------|
| **Document ID** | PM-MODULE-PLAN-001 |
| **Status** | ACTIVE — Phase A–H code complete; **Phase I (Complete IPD)** PLANNED; G4/G5 deferred |
| **Created** | 2026-09-03 |
| **Last Updated** | 2026-09-08 |
| **Owner** | Engineering |
| **Related** | [feature-status-board.md](./feature-status-board.md), [PHASE-A-OPS-CHECKLIST.md](./PHASE-A-OPS-CHECKLIST.md), [PHASE-G-NOTES.md](./PHASE-G-NOTES.md), [PHASE-H-NOTES.md](./PHASE-H-NOTES.md), [PHASE-I-IPD-ENTERPRISE-PLAN.md](./PHASE-I-IPD-ENTERPRISE-PLAN.md), [HMS-ROADMAP.md](../hms/HMS-ROADMAP.md), [HOSPITAL-OPD-REALISM-BACKLOG.md](../hms/HOSPITAL-OPD-REALISM-BACKLOG.md) |

---

## How to use this document

1. Execute phases **A → G** in order (do not skip A before D).
2. Check boxes as work completes (`[ ]` → `[x]`).
3. Update **Phase status** and **Last Updated** when a phase finishes.
4. Keep [feature-status-board.md](./feature-status-board.md) in sync for feature-level QA/RELEASED.

**Checkbox legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` deferred / cancelled

---

## 1. Current baseline (as of 2026-09-03)

| Layer | Completeness | Notes |
|-------|--------------|-------|
| Backend | ~90% | 23 packages; HMS-0…11 RELEASED; nursing package missing |
| Web | ~75–95% by role | All 11 roles have portals; depth uneven |
| Mobile | ~65–80% | Patient/doctor strong; admin ~55%; reception desk flows code-ready; staff roles unsupported |
| OPD | IN QA | Golden path needs production verification |
| Push notifications | Implemented | Needs EAS project ID + production verify |
| Keep-alive (Render) | Implemented | Needs deploy + `API_HEALTH_URL` variable |

### Cross-platform matrix

| Module | Backend | Web | Mobile | Next focus |
|--------|---------|-----|--------|------------|
| Platform Admin | 95% | 95% | 95% | Phase C complete (code) |
| Hospital | 95% | 90% | 80% | Phase C (admin polish) |
| Patient Registry | 95% | 90% | 80% staff | Stable |
| OPD | 95% | 85% | 80% | Phase A prod QA |
| Patient Portal | 95% | 90% | 85% | Encounter reviews wired |
| Doctor | 95% | 90% | 70% | Phase E |
| Reception | 95% | 95% | 80% | Stable |
| Clinical | 90% | 90% | 40% | Phase E |
| Billing | 80% | 75% | 55% desk checkout | Phase D / F |
| Scheduling | 90% | 50% | 40% | Phase A decision |
| Lab | 90% | 85% | 60% staff worklist | Phase F optional |
| Radiology | 90% | 85% | 55% staff worklist | Phase F optional |
| Pharmacy | 90% | 85% | 60% staff worklist | Phase F optional |
| OT | 85% | 85% | 50% staff worklist | Phase F optional |
| Nursing | 80% | 80% | 50% ward list | Phase F optional |
| IPD | 90% | 85% | 0% | Phase E |
| ICU | 90% | 80% | 0% | Phase E (mobile optional) |
| Subscription | 80% | 80% | 20% | Phase C / F |
| Analytics | 70% patient | 70% | 60% | Phase G |

---

## 2. Architecture principle

```mermaid
flowchart TB
  subgraph platform [Platform Layer]
    ADMIN[Platform Admin]
    SUB[Subscription & Plans]
    IAM[IAM / Auth / Notifications]
  end

  subgraph hospital_ops [Hospital Operations]
    HOSP[Hospital Admin]
    STAFF[Staff & Scope]
    REG[Patient Registry UHID]
    OPD[OPD Queue]
  end

  subgraph clinical [Clinical Spine]
    ENC[Encounters]
    CLIN[Consult / e-Rx / Orders]
  end

  subgraph fulfillment [Fulfillment]
    LAB[Lab]
    RAD[Radiology]
    PHARM[Pharmacy / MAR]
    OT[Operation Theatre]
  end

  subgraph inpatient [Inpatient]
    IPD[IPD]
    ICU[ICU]
    NURSE[Nursing]
  end

  subgraph patient_portal [Patient Portal]
    PAT[Patient Journey]
    BILL[Billing View]
  end

  ADMIN --> HOSP
  SUB --> HOSP
  IAM --> PAT
  HOSP --> STAFF --> OPD
  REG --> OPD --> ENC --> CLIN
  CLIN --> LAB & RAD & PHARM & OT
  ENC --> IPD & ICU
  IPD --> NURSE
  ENC --> BILL
  PAT --> OPD & ENC & BILL
```

**Rule:** One **Encounter** per visit (OPD / IPD / ICU). Modules attach to encounter + UHID.

**Critical path to IPD:** OPD stable → registry on mobile → admin can onboard hospitals → IPD admit UX → nursing → discharge billing.

---

## 3. Phase overview

| Phase | Name | Duration | Status | Goal |
|-------|------|----------|--------|------|
| **A** | Stabilize & Release OPD | 2–3 weeks | **COMPLETE** | Production QA signed off |
| **B** | Patient + Hospital polish | 2 weeks | **COMPLETE** (code) | Reviews + feature flags; QA on live API |
| **C** | Platform Admin completion | 1–2 weeks | **COMPLETE** (code) | Mobile admin parity for hospitals/plans/audit |
| **D** | IPD depth | 3–4 weeks | **COMPLETE** | D1–D6 done |
| **E** | Staff portals depth | 3–4 weeks | **COMPLETE** | E1–E6 done (web + mobile light) |
| **F** | Payments & SaaS | Phase 2 | **COMPLETE** (code) | Razorpay sandbox + patient/SaaS pay (keys optional) |
| **G** | Advanced / integrations | Ongoing | **COMPLETE** (code) | G1 stub+MSG91 HTTP; G2–G3; G6–G10; G4/G5 deferred |
| **H** | Experience polish / parity | Ongoing | **COMPLETE** (code) | Display board; mobile password reset; docs sync |
| **I** | Complete IPD enterprise | 16–22 w | **CODE COMPLETE** | I0–I9 core done — [plan](./PHASE-I-IPD-ENTERPRISE-PLAN.md) |

---

## 4. Phase A — Stabilize & Release OPD

| Attribute | Value |
|-----------|-------|
| **Status** | **COMPLETE** |
| **Target** | Weeks 1–3 |
| **Exit criteria** | OPD golden path passes on deployed env; push delivers CALLED; no orphaned OPD UI |
| **Ops checklist** | [PHASE-A-OPS-CHECKLIST.md](./PHASE-A-OPS-CHECKLIST.md) — production QA signed off 2026-09-07 |

### Tasks

| ID | Task | Modules | Effort | Done |
|----|------|---------|--------|------|
| A1 | EAS push production setup + golden path QA on Render | IAM, OPD, Patient | 3d | [x] production QA signed off |
| A2 | Self check-in: fix web routing OR deprecate; add mobile self check-in if kept | Scheduling, OPD | 3d | [x] deprecated patient UI; desk Arrive wired |
| A3 | Mobile reception: queue **complete** action | OPD, Reception | 1d | [x] |
| A4 | Wire clinical catalogs route **or** remove; clean orphan slot-booking / arrival panels | OPD, Scheduling, Hospital | 3d | [x] catalogs + Arrive wired; slot panel deferred |
| A5 | CI: keep `OpdWalkInGoldenPathIntegrationTest`; add 1 Playwright OPD script | OPD | 3d | [x] Playwright OPD smoke + GH workflow |
| A6 | Deploy keep-alive workflow + set `API_HEALTH_URL` + absolute `VITE_API_BASE_URL` | Ops | 1d | [x] production ops signed off |

### OPD golden path (must pass)

```
Patient requests OPD (or reception walk-in)
  → Queue token WAITING
  → Reception calls patient (CALLED) → patient notified (push)
  → Doctor starts consult (IN_SERVICE)
  → Doctor completes + e-Rx signed
  → Reception checkout → invoice → payment recorded
  → Patient sees COMPLETED + Paid on /patient/opd
```

- [x] Golden path verified on local (Playwright patient request → My OPD; backend IT exists)
- [x] Golden path verified on production (Render)

### Decision (A2 / A4)

| Option | Decision | Owner | Date |
|--------|----------|-------|------|
| Primary booking model | **OPD request + walk-in + desk arrive** (canonical) | Engineering | 2026-09-03 |
| Self check-in | **Deprecated patient UI** for now (routes stay → `/patient/opd`); API kept; desk Arrive tab wired | Engineering | 2026-09-03 |
| Slot booking panel | **Deferred** — not routed; comment on component | Engineering | 2026-09-03 |
| Clinical catalogs | **Wired** at `/hospital/catalogs` + hospital nav | Engineering | 2026-09-03 |

---

## 5. Phase B — Patient + Hospital polish

| Attribute | Value |
|-----------|-------|
| **Status** | **COMPLETE** (code) |
| **Target** | Weeks 4–5 |
| **Exit criteria** | Reception can run desk on mobile (search + walk-in + checkout); catalogs wired; patient journey timeline + document center on mobile; encounter reviews; subscription feature gates |

### Tasks

| ID | Task | Modules | Effort | Done |
|----|------|---------|--------|------|
| B1 | Mobile hospital admin: staff invite / list / deactivate | Hospital | 3d | [x] |
| B2 | Wire `/hospital/catalogs` + nav item | Hospital, Clinical | 1d | [x] done in A4 |
| B3 | Mobile hospital dashboard → `/api/v1/hospital/dashboard` | Hospital, Dashboard | 2d | [x] |
| B4 | Mobile reception: patient search + register (UHID) | Registry, Reception | 4d | [x] |
| B5 | Mobile reception: walk-in + checkout / payment record | OPD, Billing, Reception | 4d | [x] |
| B6 | Mobile: journey timeline API + document center parity | Patient | 3d | [x] already on patient Home stack |
| B7 | Encounter-based reviews (not only appointmentId) | Review, Clinical | 2d | [x] |
| B8 | Enforce subscription feature flags in backend services | Subscription | 2d | [x] |

---

## 6. Phase C — Platform Admin completion

| Attribute | Value |
|-----------|-------|
| **Status** | **COMPLETE** (code) |
| **Target** | Weeks 6–7 |
| **Exit criteria** | Platform admin can onboard hospital, assign plan, approve doctor, moderate reviews, and audit — from web **and** mobile |

### Admin function checklist

| # | Function | Backend | Web | Mobile | Sprint | Done |
|---|----------|---------|-----|--------|--------|------|
| A1 | Platform dashboard KPIs | ✅ | ✅ | ✅ | C1 | [x] |
| A2 | User directory + status | ✅ | ✅ | ✅ role/status filters | C2 | [x] |
| A3 | Hospital list + create | ✅ | ✅ | ✅ | C3 | [x] |
| A4 | Hospital detail + status | ✅ | ✅ | ✅ | C3 | [x] |
| A5 | Hospital doctor invite | ✅ | ✅ | ✅ | C4 | [x] |
| A6 | Hospital subscription assign | ✅ | ✅ | ✅ | C4 | [x] |
| A7 | Plans list / edit limits | ✅ | ✅ | ✅ | C5 | [x] |
| A8 | Doctor verification queue | ✅ | ✅ | ✅ | — | [x] |
| A9 | Verification review + docs | ✅ | ✅ | ✅ | — | [x] |
| A10 | Review moderation | ✅ | ✅ | ✅ | — | [x] |
| A11 | Audit log search | ✅ | ✅ | ✅ | C6 | [x] |
| A12 | Account settings | ✅ | ✅ | ✅ | — | [x] |

### Tasks

| ID | Task | Modules | Effort | Done |
|----|------|---------|--------|------|
| C1 | Backend `GET /api/v1/admin/dashboard` + wire web + enrich mobile home | Admin | 2d | [x] |
| C2 | Mobile admin user filters (role / status) | Admin | 1d | [x] |
| C3 | Mobile: AdminHospitalsList + AdminHospitalDetail | Admin | 4d | [x] |
| C4 | Mobile: hospital subscription + doctor invite | Admin, Subscription | 3d | [x] |
| C5 | Mobile: AdminPlansScreen (read + edit limits) | Admin, Subscription | 2d | [x] |
| C6 | Mobile: AdminAuditLogsScreen (paginated) | Admin | 2d | [x] |

---

## 7. Phase D — IPD depth

| Attribute | Value |
|-----------|-------|
| **Status** | **COMPLETE** |
| **Target** | Weeks 8–11 |
| **Depends on** | Phase A + B exit criteria |
| **Exit criteria** | Admit by UHID search → bed assigned → doctor rounds → discharge → invoice → bed free |

### Tasks

| ID | Task | Modules | Effort | Done |
|----|------|---------|--------|------|
| D1 | IPD admit: patient search by UHID/name; discharge UX polish | IPD, Registry | 4d | [x] |
| D2 | Nursing: ward board, vitals rounds, assessments (backend + web) | Nursing, IPD | 2w | [x] |
| D3 | Discharge billing workflow | Billing, IPD | 1w | [x] |
| D4 | Doctor IPD rounds UI (web) | IPD, Doctor, Clinical | 1w | [x] |
| D5 | ICU polish (web / optional mobile nurse) | ICU | 1w | [x] |
| D6 | Bed transfer | IPD | 3d | [x] |

### IPD DoD checklist

- [x] Admit via patient search (not raw UUID)
- [x] Ward / room / bed setup usable
- [x] Doctor can record rounds
- [x] Discharge releases bed
- [x] Discharge creates / links invoice
- [x] Nursing can chart vitals on IPD encounter
- [x] ICU stay board + monitoring with valid record types
- [x] IPD bed transfer (release old / assign new)

---

## 8. Phase E — Staff portals depth

| Attribute | Value |
|-----------|-------|
| **Status** | **COMPLETE** |
| **Target** | Weeks 12–15 |
| **Exit criteria** | Each staff role has a usable worklist (web depth; mobile selective) |

### Tasks

| ID | Task | Modules | Effort | Done |
|----|------|---------|--------|------|
| E1 | Lab tech: enhanced worklist (order detail routes) | Lab | 1w | [x] |
| E2 | Radiology tech portal depth | Radiology | 1w | [x] |
| E3 | Pharmacy + MAR nursing (mobile optional) | Pharmacy, Nursing | 1w | [x] |
| E4 | OT coordinator portal depth | OT | 1w | [x] |
| E5 | Doctor mobile: light structured consult + e-Rx | Clinical, Doctor | 2w | [x] |
| E6 | Enable remaining staff roles on mobile (or keep Unauthorized) | Mobile nav | 1w | [x] |

---

## 9. Phase F — Payments & SaaS (Phase 2)

| Attribute | Value |
|-----------|-------|
| **Status** | **COMPLETE** (code; Razorpay keys optional / blank = sandbox) |
| **Depends on** | Phase A–B stable |
| **Flow doc** | [P2-B2-RAZORPAY-PAYMENTS.md](../post-hms/P2-B2-RAZORPAY-PAYMENTS.md) |

| ID | Task | Modules | Done |
|----|------|---------|------|
| F1 | Razorpay sandbox integration | Billing | [x] |
| F2 | Patient online pay + webhook | Billing, Patient | [x] |
| F3 | Subscription SaaS billing for hospitals | Subscription, Admin | [x] |

**Ops note:** Fill `RAZORPAY_*` in `.env` when keys are available; sandbox works with blank values.

---

## 10. Phase G — Advanced / deferred

| Attribute | Value |
|-----------|-------|
| **Status** | **COMPLETE** (code) |
| **Started** | 2026-09-07 |
| **Code complete** | 2026-09-07 |

| ID | Item | Notes | Done |
|----|------|-------|------|
| G1 | SMS / WhatsApp gateway | Log stub + MSG91 HTTP when keys set | [x] |
| G2 | QR deep-link self check-in packaging | Web QR + mobile deep-link path | [x] |
| G3 | OPD_APPROACHING queue-position alerts | Position ≤ 3, once | [x] |
| G4 | PACS / DICOM | Needs hospital PACS contract | [-] deferred |
| G5 | LIS integration | Needs external LIS | [-] deferred |
| G6 | Pharmacy inventory / stock | Batches + ledger + dispense + catalog receive UI | [x] |
| G7 | Anesthesia / implant tracking | Implants + anesthesia chart MVP | [x] |
| G8 | Partner admin portal | Org / location / hospital-link / membership CRUD | [x] |
| G9 | Hospital / platform ops analytics | 7-day trend on hospital dashboard | [x] |
| G10 | MFA / password reset | Forgot + reset + TOTP MFA | [x] |
| G11 | TV / display board | Delivered as Phase H **H1** (`/reception/display`) | [x] |

---

## 10b. Phase H — Experience polish / parity

| Attribute | Value |
|-----------|-------|
| **Status** | **COMPLETE** (code) |
| **Started** | 2026-09-07 |
| **Notes** | [PHASE-H-NOTES.md](./PHASE-H-NOTES.md) |

| ID | Task | Modules | Done |
|----|------|---------|------|
| H1 | OPD waiting-room display board | OPD, Reception web | [x] |
| H2 | Plan + feature board sync | Docs | [x] |
| H3 | Mobile forgot / reset password | IAM, Mobile | [x] |

---

## 10c. Phase I — Complete IPD enterprise workflow

| Attribute | Value |
|-----------|-------|
| **Status** | **PLANNED** |
| **Started** | — |
| **Master plan** | [PHASE-I-IPD-ENTERPRISE-PLAN.md](./PHASE-I-IPD-ENTERPRISE-PLAN.md) |
| **Baseline** | HMS-3 + Phase D MVP (direct admit → rounds → discharge) |
| **Key product rule** | Hospitals select IPD **services** (maternity, ICU, insurance, OT, …); core stays country-neutral |

| Wave | Focus | Done |
|------|-------|------|
| I0 | FEATURE_IPD + hospital service catalog + presets | [x] code 2026-09-08 |
| I1 | Admission request / OPD→IPD / types & sources | [x] code 2026-09-08 |
| I2 | Enterprise beds (reserve, cleaning, rules, map) | [x] core 2026-09-08 (rules deferred) |
| I3 | Unified IPD chart + assessments + consults + handover | [x] core 2026-09-08 |
| I4 | Med recon + orders/MAR/lab/rad integration | [x] core 2026-09-08 |
| I5 | ICU escalate / OT / isolation / procedures | [x] core 2026-09-08 |
| I6 | Charges, deposit, interim bill, payer/TPA, clearance | [x] core 2026-09-08 |
| I7 | Discharge planning, summary, LAMA/death, turnaround | [x] core 2026-09-08 |
| I8 | Follow-up, readmission, episode close | [x] |
| I9 | Dashboards, mobile nursing, E2E tests, docs | [x] |

**Exit criteria:** Configurable multi-hospital-type IPD; OPD→IPD E2E; no duplicate Patient/UHID/billing/lab/pharmacy; regression OPD green.

---

## 11. Module DoD templates (release checklist)

Use before marking a module **RELEASED** on the feature board.

### Shared checklist

- [ ] Backend APIs in OpenAPI / documented
- [ ] RBAC tested for role
- [ ] Web golden path manual QA passed
- [ ] Mobile core flows (if applicable) passed
- [ ] Integration test in CI (where applicable)
- [ ] No orphaned / unrouted UI for this module
- [ ] Production deploy verified
- [ ] QA credentials doc updated (`mannual/QA-TEST-CREDENTIALS-AND-FUNCTIONALITY.txt`)

### OPD DoD

- [ ] Request / walk-in / arrive → queue token
- [ ] WAITING → CALLED → IN_SERVICE → COMPLETED (+ skip/recall)
- [ ] Doctor consult syncs queue + encounter
- [ ] Checkout gate (final consult + signed e-Rx)
- [ ] Patient `/opd/me/today` shows token, position, billing
- [ ] Push or reliable fallback on CALLED

### Patient DoD

- [ ] UHID + self-register + portal invite
- [ ] Consent gate
- [ ] Discover → request OPD → live status
- [ ] Post-visit package (Dx, Rx, labs, wellness)
- [ ] Lab book + pharmacy send
- [ ] Invoice visibility
- [ ] Journey timeline + document center (web + mobile)

### Hospital DoD

- [ ] Profile / branches / departments / facilities
- [ ] Staff invite + branch scope
- [ ] Doctor roster
- [ ] Patient registry (search/register)
- [ ] OPD desk + walk-in + queue
- [ ] Billing checkout
- [ ] Clinical catalogs reachable
- [ ] Operational dashboard

### Admin DoD

- [ ] Dashboard KPIs (API-backed)
- [ ] Users + hospitals + plans
- [ ] Doctor verification
- [ ] Review moderation
- [ ] Audit logs
- [ ] Mobile parity for A3–A11 (or explicit web-only waiver)

### IPD DoD

- [ ] Admit by UHID search
- [ ] Bed assignment / release
- [ ] Doctor rounds
- [ ] Discharge + billing
- [ ] Nursing vitals on IPD encounter

---

## 12. Immediate next 2 weeks (execution kickoff)

### Week 1 (current)

| Day | Focus | IDs | Status |
|-----|-------|-----|--------|
| Done | Code: catalogs, Arrive tab, mobile complete, Playwright | A2–A5 | Done |
| Next | Deploy keep-alive + EAS + production golden path | A1, A6 | You |

### Week 2

| Day | Focus | IDs | Status |
|-----|-------|-----|--------|
| Done | Mobile staff + ops dashboard + reception search/walk-in/checkout | B1–B6 | Code ready |
| Done | Encounter reviews + subscription feature gates | B7, B8 | Code ready |
| Done | Admin dashboard API + mobile user role/status filters | C1, C2 | Code ready |
| Done | Mobile hospitals list/detail + create + status | C3 | Code ready |
| Done | Mobile hospital subscription + doctor invite | C4 | Code ready |
| Done | Mobile plans editor + audit logs | C5, C6 | Code ready |
| Done | IPD admit patient search + discharge polish | D1 | Code ready |
| Next | Nursing ward board / IPD vitals | D2 | — |

**After production A1/A6:** mark Phase A exit criteria when golden path passes on Render. Phase B is code-complete; QA on a live API before Phase D (IPD).

---

## 13. Already built (do not rebuild)

Deepen or wire — do not recreate:

- [x] HMS backend HMS-0…11 (OPD, IPD, ICU, Lab, Rad, Pharmacy, OT)
- [x] Web role portals for all 11 staff roles
- [x] Patient ECO-P3 / ECO-P4 (lab + pharmacy journeys)
- [x] Platform admin web (hospitals, plans, audit, verification)
- [x] Encounter-centric clinical spine
- [x] UHID + patient registry (web reception)
- [x] Mobile push token registration + Expo push service (V68)
- [x] Mobile reception OPD queue (call / start / skip / recall / assign)
- [x] Backend keep-alive + frontend / GitHub wake pings

---

## 14. Change log

| Date | Change |
|------|--------|
| 2026-09-03 | Initial tracked plan created from module audit (OPD / Patient / Hospital / Admin + full HMS map) |
| 2026-09-03 | Phase A started: A2/A3/A4 implemented; A1/A6 ops checklist added |
| 2026-09-03 | A5 done: Playwright OPD smoke (2/2 local pass) + `.github/workflows/e2e-opd.yml` |
| 2026-09-04 | Phase F started: F1–F3 Razorpay sandbox, patient pay + webhook, SaaS renew (V73) |
| 2026-09-07 | Phase A production QA signed off COMPLETE; Phase F COMPLETE (code); Phase G started (G2/G3/G6/G9/G10) |
| 2026-09-07 | Phase G: G7 implant tracking + G8 partner admin CRUD (V76); V75 SaaS sequence version fix |
| 2026-09-07 | Phase G: G10 TOTP MFA (V77) + G8 partner memberships |
| 2026-09-07 | Phase G: G7 anesthesia chart (V78), G1 SMS stub, G6 stock receive UI |
| 2026-09-07 | Phase G COMPLETE (code): MSG91 HTTP SMS; QA credentials refreshed; G4/G5 deferred |

---

*End of PM-MODULE-PLAN-001*
