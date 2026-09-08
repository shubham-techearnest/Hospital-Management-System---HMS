# Phase I — Complete IPD Enterprise Workflow

| Attribute | Value |
|-----------|-------|
| **Document ID** | PM-PHASE-I-IPD-001 |
| **Status** | **IN PROGRESS** — I0–I7 core complete; I8 next |
| **Created** | 2026-09-08 |
| **Parent** | [MODULE-DEVELOPMENT-PLAN.md](./MODULE-DEVELOPMENT-PLAN.md) |
| **As-built baseline** | [HMS-IPD-FLOW.md](../hms/HMS-IPD-FLOW.md) (HMS-3 + Phase D) |
| **Source prompt** | Master IPD workflow (enterprise / multi-hospital-type / country-configurable) |

---

## 0. Execution rule (non-negotiable)

```
AUDIT → MAP REUSE → DESIGN EXTENSION → IMPLEMENT → TEST → VERIFY OPD/UHID → NEXT PHASE
```

- **Do not** rebuild Patient, UHID, OPD, Auth, Billing, Lab, Pharmacy, Radiology, OT, ICU, Notifications, or Documents.
- IPD is an **Episode of Care orchestration** on top of `clinical.encounters` (`type=IPD`) + existing modules.
- Every hospital **opts into IPD services** it actually runs (nursing home ≠ multi-specialty ≠ maternity).

---

## 1. Audit summary — what already exists (reuse map)

### 1.1 Source of truth (never duplicate)

| Domain | Existing location | IPD must |
|--------|-------------------|----------|
| Patient / UHID | `patient` + registry | Reference `patientId` / UHID only |
| Users / Auth / RBAC | `iam` | Extend permissions; no second auth |
| Hospital / Branch / Dept / Staff | `hospital` | Scope + care team membership |
| Encounter | `clinical.encounters` | Create/link `IPD` encounter |
| Vitals / Notes / Diagnoses / Orders | `clinical` | Chart on IPD encounter |
| OPD | `opd` | Source of admission requests |
| Wards / Rooms / Beds / Admit / Transfer / Discharge | `ipd` (V33) | **Extend**, do not replace |
| ICU | `icu` (V34) | Link via `ipdAdmissionId`; escalate/transfer |
| Pharmacy / eMAR | `pharmacy` | Orders + administer on encounter |
| Lab / Radiology / OT | `laboratory`, `radiology`, `ot` | Orders/procedures on encounter |
| Billing / invoices | `billing` | Charge events → invoice on encounter |
| Notifications / Audit / Documents | existing platform services | Emit / attach; do not fork |
| Subscription features | `FeatureAccessService` + plan keys | Add IPD capability keys |

### 1.2 As-built IPD MVP (Phase D / HMS-3) — already working

| Capability | Status | Notes |
|------------|--------|-------|
| Ward → Room → Bed master | Done | `IpdFacilityService` |
| Direct admit + occupy bed | Done | Creates IPD encounter + assignment |
| Bed assignment history | Partial | Temporal assignments exist; no full transfer audit UX |
| Bed transfer | Done | Keeps ADMITTED; new assignment |
| Doctor / nursing rounds (free text) | Done | `ipd.rounds` |
| Nursing ward board + vitals | Done | Web; assessments are note prefixes |
| eMAR administer | Done | Pharmacy module |
| Discharge + summary text | Done | Thin summary; bed → AVAILABLE immediately |
| Discharge → invoice | Done | Encounter checkout gate needs summary |
| ICU stay (parallel) | Done | Optional `ipdAdmissionId` |
| Dashboards (basic) | Done | `/ipd/dashboard` |
| Mobile nursing | List only | No charting |

### 1.3 Critical gaps vs enterprise IPD (this phase)

| Gap | Impact |
|-----|--------|
| No **hospital IPD service catalog** | All hospitals see same IPD surface |
| No **admission request / approve** from OPD/ER | Direct admit only |
| Thin state machine (`ADMITTED` / `DISCHARGED` / …) | No pre-admit, clearance, LAMA, death |
| Bed statuses missing **CLEANING / RESERVE workflow** | Instant reuse after discharge |
| No structured nursing / doctor admission assessment | Notes only |
| No medication reconciliation | MAR only |
| No discharge checklist / multi-dept clearance | Admin can discharge freely |
| No discharge types (LAMA/DAMA/death/transfer-out) | Unsafe / incomplete |
| No payer / authorization framework | India cashless/TPA blocked |
| No interim charges / deposit | Bill only at end |
| No consult / handover / care-plan entities | Ad-hoc clinical only |
| No unified IPD patient chart UI | Split across hospital/doctor/nursing |
| No FEATURE_IPD / service toggles | Cannot model nursing home vs full hospital |

---

## 2. Product principle — hospital-configurable IPD

Different facilities must enable **only** the services they run.

### 2.1 Capability layers

| Layer | Purpose | Examples |
|-------|---------|----------|
| **A. Platform plan** | SaaS entitlement | `FEATURE_IPD`, `FEATURE_ICU`, `MAX_BEDS` |
| **B. Hospital IPD service catalog** | What this hospital operates | Maternity, Oncology, Day-care, Blood, Insurance desk |
| **C. Branch / ward profile** | Local care levels | Isolation ward, HDU beds, gender policy |
| **D. Country pack** | Legal / payer / docs | India TPA, consent forms, death certificate fields |
| **E. Role permissions** | Who can act | Existing `ipd:*` + new fine-grained perms |

### 2.2 Hospital IPD service catalog (admin selects)

Stored per hospital (and optionally per branch). UI: **Hospital → Settings → Inpatient services**.

| Service key | Label | Depends on | When OFF |
|-------------|-------|------------|----------|
| `IPD_CORE` | Inpatient core (admit/bed/discharge) | Plan `FEATURE_IPD` | Hide all IPD nav |
| `IPD_PRE_ADMISSION` | Admission requests & scheduling | CORE | Direct admit only |
| `IPD_EMERGENCY_ADMIT` | Emergency / direct emergency source | CORE | Hide ER source |
| `IPD_OPD_ADMIT_REQUEST` | OPD → IPD request | CORE + OPD | No OPD recommend admit |
| `IPD_DAY_CARE` | Day-care / observation | CORE | Hide day-care types |
| `IPD_ICU_ESCALATION` | ICU/HDU transfer | CORE + ICU module | No escalate UI |
| `IPD_OT_INTEGRATION` | Planned surgery / OT link | CORE + OT | Manual procedure note only |
| `IPD_MATERNITY` | Maternity pathways | CORE | Hide maternity types/checklists |
| `IPD_PEDIATRIC` | Pediatric pathways | CORE | Hide pediatric types |
| `IPD_ONCOLOGY` | Oncology pathways | CORE | Hide oncology templates |
| `IPD_ISOLATION` | Isolation / infection control | CORE | No isolation bed rules |
| `IPD_BLOOD_BANK` | Transfusion workflow | CORE + blood (future) | Hide blood orders |
| `IPD_PHYSIO` | Physiotherapy orders | CORE | Hide physio order type |
| `IPD_DIET` | Diet orders | CORE | Hide diet |
| `IPD_INSURANCE_TPA` | Payer / pre-auth / cashless | CORE + billing | Self-pay only |
| `IPD_DEPOSIT` | Admission deposit | CORE + billing | Skip deposit |
| `IPD_INTERIM_BILLING` | Daily / interim charges | CORE + billing | Discharge bill only |
| `IPD_LAMA_DAMA` | LAMA/DAMA workflow | CORE | Routine discharge only |
| `IPD_DEATH_WORKFLOW` | Death / mortuary path | CORE | Transfer/discharge only |
| `IPD_READMISSION_TRACKING` | Readmission analytics | CORE | No readmit links |
| `IPD_PATIENT_PORTAL` | Patient IPD status / docs | CORE | Staff-only |
| `IPD_MOBILE_NURSING` | Mobile charting | CORE | Web nursing only |

**Hospital type presets** (one-click apply, still editable):

| Preset | Enables |
|--------|---------|
| Nursing home / step-down | CORE, PRE_ADMISSION, DIET, PHYSIO, PATIENT_PORTAL |
| Single-specialty clinic with beds | CORE, OPD_ADMIT, DAY_CARE, INTERIM_BILLING |
| Multi-specialty hospital | Most clinical + OT + ICU + insurance |
| Maternity hospital | CORE + MATERNITY + OT + BLOOD (+ insurance optional) |
| Tertiary / chain | All services + analytics |

Enforcement: backend rejects APIs for disabled services (`403` / domain error); frontend hides nav and actions.

---

## 3. Target domain model (extend existing)

### 3.1 Keep as-is

`ipd.wards`, `rooms`, `beds`, `admissions`, `bed_assignments`, `rounds`, `discharge_summaries`  
`clinical.encounters` (IPD) · pharmacy MAR · lab/rad/OT · billing invoices · ICU stays

### 3.2 Add (new tables / entities — illustrative)

| Object | Purpose |
|--------|---------|
| `hospital.ipd_service_settings` | Per-hospital service catalog + config JSON |
| `ipd.admission_requests` | Request → review → approve → schedule → admit |
| `ipd.admission_type_catalog` / hospital enabled types | Elective, emergency, maternity, … |
| `ipd.admission_source_catalog` | OPD, ER, referral, transfer-in, … |
| `ipd.care_levels` | Ward / HDU / ICU / isolation |
| `ipd.bed_status` extension | CLEANING, DISCHARGE_PENDING_CLEANING, PREPARATION |
| `ipd.checklists` + `checklist_items` + instances | Admit / discharge / procedure |
| `ipd.assessments` | Nursing + doctor structured assessments |
| `ipd.medication_reconciliations` | Admit + discharge meds |
| `ipd.care_plans` | Goals / interventions |
| `ipd.consult_requests` | Specialist consult lifecycle |
| `ipd.handovers` | Shift handover packs |
| `ipd.discharge_plans` | Expected EDD + readiness |
| `ipd.discharge_clearances` | Clinical / nursing / pharmacy / lab / billing / payer |
| `ipd.consents` | Typed consent records |
| `ipd.clinical_alerts` | Deterioration / critical result ack |
| `payer.authorizations` (or `billing.payer_*`) | Generic eligibility / pre-auth (India first) |
| `ipd.charge_events` | Bed-day, nursing, procedure hooks → billing |
| Country pack tables | Terminology, required docs, legal forms |

**Rule:** Prefer encounter-scoped clinical data in `clinical.*`; IPD tables orchestrate inpatient lifecycle.

### 3.3 Identity numbering

| ID | Source |
|----|--------|
| Patient / UHID | Existing patient module |
| Encounter number | Existing `IPD-{year}-{######}` |
| Admission number | Keep aligned with encounter number **or** add `IPD-ADM-…` if hospitals require separate display — **decision in I1** (default: keep 1:1 with encounter) |

---

## 4. Target state machine (admission)

Controlled transitions only (no generic CRUD status patch).

```
REQUESTED → UNDER_REVIEW → APPROVED → SCHEDULED → ARRIVED → ADMITTED/ACTIVE
                ↓              ↓
            REJECTED      CANCELLED

ACTIVE → DISCHARGE_PLANNED → DISCHARGE_PENDING → CLINICAL_CLEARED → FINANCIAL_CLEARED → DISCHARGED → FOLLOW_UP → CLOSED

Branch terminals (service-gated): LAMA | DAMA | TRANSFERRED_OUT | ABSCONDED | DECEASED | CANCELLED
```

Map to existing enum carefully: migrate `ADMITTED` → treat as `ACTIVE`; keep DB backward compatible.

### Bed statuses (extend)

`AVAILABLE | RESERVED | OCCUPIED | BLOCKED | MAINTENANCE | DISCHARGE_PENDING_CLEANING | CLEANING | ISOLATION | PREPARATION_REQUIRED`

**Rule:** discharge never jumps bed straight to AVAILABLE when turnaround service is ON.

---

## 5. Development phases (implementation order)

Estimate: **~16–22 weeks** calendar for full enterprise scope with 1–2 IPD-focused squads. Ship in **release trains**; each phase is independently demoable.

### I0 — Foundations & configuration (1–2 weeks) — **START HERE**

| ID | Deliverable |
|----|-------------|
| I0.1 | Formal reuse map + ADR: IPD = encounter orchestration | [x] |
| I0.2 | `FEATURE_IPD` / `FEATURE_ICU` plan keys + enforcement | [x] |
| I0.3 | Hospital IPD **service catalog** API + admin UI + presets | [x] |
| I0.4 | Country pack stub (`IN` default) — terminology + required docs flags | [x] |
| I0.5 | Permission matrix expansion (settings read/write/admin); seed Flyway | [x] |
| I0.6 | Update feature-status-board with IPD-E* IDs; sync MODULE plan | [x] |
| I0.7 | Commit/stabilize current Phase G/H before IPD schema churn | [ ] pending user commit |

**Code complete (I0):** 2026-09-08 — migration `V79`, `/hospital/ipd-services`, ADR-IPD-001.

**Exit:** Hospital can enable/disable IPD services; nav exposes catalog UI; plan without IPD blocks module APIs.

---

### I1 — Admission request & lifecycle (2–3 weeks)

| ID | Deliverable |
|----|-------------|
| I1.1 | `admission_requests` + status machine + APIs | [x] |
| I1.2 | Configurable admission **types** & **sources** (catalog; hospital subset later) | [x] |
| I1.3 | OPD doctor: **Recommend admission** → request linked to OPD encounter + UHID | [x] |
| I1.4 | Hospital: review / approve / reject / schedule | [x] |
| I1.5 | Direct / emergency admit (service-gated) still supported | [x] |
| I1.6 | Pre-admission checklist (configurable) | [ ] deferred → I6 |
| I1.7 | Patient / staff notifications via existing gateway | [ ] deferred |
| I1.8 | Integration test: OPD → request → approve → admit | [~] unit status machine; E2E → I9 |

**Code complete (I1 core):** 2026-09-08 — migration `V80`, Requests tab, doctor recommend panel. See [PHASE-I-NOTES.md](./PHASE-I-NOTES.md).

**Exit:** No second patient created; OPD golden path untouched; request→admit works.

---

### I2 — Bed management enterprise (2 weeks)

| ID | Deliverable |
|----|-------------|
| I2.1 | Extended bed statuses + APIs to set cleaning/block/reserve | [x] |
| I2.2 | Reserve on approve/schedule; occupy on physical arrival | [x] reserve-bed API + admit from reserved |
| I2.3 | Allocation rules engine (care level, gender, isolation, specialty, equipment) — config-driven | [ ] deferred |
| I2.4 | Bed map UI (ward visual board) — accessible labels, not color-only | [x] Beds tab ward board |
| I2.5 | Transfer workflow with handover + history (never overwrite silently) | [~] transfer exists; handover notes → I3 |
| I2.6 | Discharge → CLEANING → AVAILABLE turnaround | [x] |
| I2.7 | Optional building/floor fields if missing (extend ward model; no fake hierarchy) | [ ] deferred |

**Code complete (I2 core):** 2026-09-08 — migration `V81`, bed status API, reserve-bed, cleaning turnaround, ward bed board. See [PHASE-I-NOTES.md](./PHASE-I-NOTES.md).

**Exit:** Cannot double-book bed; cleaning delay enforced when service ON.

---

### I3 — Clinical IPD workspace (3 weeks)

| ID | Deliverable |
|----|-------------|
| I3.1 | Unified **Patient IPD Summary** UI (tabs: Overview, Timeline, Clinical, Nursing, Meds, Orders, Lab, Rad, Procedures, Consults, Care plan, Docs, Billing, Discharge) | [x] shared chart |
| I3.2 | Reuse `ClinicalTimelinePanel`, vitals, structured consult, orders, e-Rx | [x] |
| I3.3 | Admission doctor assessment (structured + templates) | [x] structured panel + templates |
| I3.4 | Nursing assessment forms (fall/pain/skin/… hospital-configurable) | [~] free-text ASSESSMENT + seed template |
| I3.5 | Care plan MVP | [ ] placeholder tab |
| I3.6 | Progress notes with templates (SOAP optional, not forced) + signed versions | [~] doctor rounds + structured consult |
| I3.7 | Ward round worklist (doctor) | [~] existing `/doctor/ipd` list |
| I3.8 | Nursing workspace (tasks due, acuity, isolation flags) | [ ] deferred |
| I3.9 | Specialist consult request lifecycle | [ ] placeholder |
| I3.10 | Structured handover | [x] SBAR handover via rounds |

**Code complete (I3 core):** 2026-09-08 — shared `IpdPatientChart` on doctor/nurse/hospital admission routes. See [PHASE-I-NOTES.md](./PHASE-I-NOTES.md).

**Exit:** One chart for one admission; no duplicate clinical modules.

---

### I4 — Medications & diagnostics integration (2 weeks)

| ID | Deliverable |
|----|-------------|
| I4.1 | Medication reconciliation (admit + discharge) | [x] |
| I4.2 | Tighten eMAR: never auto-administer; omission/refusal reasons | [x] |
| I4.3 | Central order placement UX from IPD chart → existing lab/rad/pharmacy/nursing/diet/physio (service-gated) | [x] |
| I4.4 | Critical lab result → alert → acknowledge → document | [x] |
| I4.5 | Radiology result visibility in IPD chart (PACS later) | [x] findings/impression |

**Code complete (I4 core):** 2026-09-08 — migration `V82`, MAR outcomes, med recon APIs, critical lab ack, chart orders/diagnostics. See [PHASE-I-NOTES.md](./PHASE-I-NOTES.md).

**Exit:** Orders and MAR only through existing modules; reconciliation audited.

---

### I5 — ICU / OT / procedures / blood (2–3 weeks) — **core complete 2026-09-08**

| ID | Deliverable |
|----|-------------|
| I5.1 | Escalation: IPD → ICU (reuse ICU admit + link; ward bed CLEANING; episode preserved) — **done** |
| I5.2 | Step-down ICU → ward — **done** |
| I5.3 | Procedure order + OT worklist link when `IPD_OT_INTEGRATION` — **done** (checklist deferred) |
| I5.4 | Reuse OT implants/anesthesia on linked procedure — via OT portal (no rebuild) |
| I5.5 | Blood request stub when `IPD_BLOOD_BANK` — **done** |
| I5.6 | Isolation flags on admission + chart — **done** (sensitive-data RBAC later) |

**Exit:** One continuous episode across ward↔ICU↔OT return.

---

### I6 — Financial, payer, clearance (3 weeks) — **core complete 2026-09-08**

| ID | Deliverable |
|----|-------------|
| I6.1 | Charge event model → invoice lines — **done** (`ipd.charge_events` → INTERIM) |
| I6.2 | Admission deposit (`IPD_DEPOSIT`) — **done** |
| I6.3 | Interim billing (`IPD_INTERIM_BILLING`) — **done** |
| I6.4 | Generic payer framework — **done** ([ADR-IPD-002](../06-architecture/ADR-IPD-002-payer-framework.md)) |
| I6.5 | Pre-auth / enhancement / final auth — **done** |
| I6.6 | Financial clearance gate (configurable) — **done** |
| I6.7 | India country pack flags — **done** (cashless / reimbursement / co-pay / package + gates) |

**Exit:** Self-pay hospitals work without insurance UI; TPA hospitals cannot skip auth when configured.

---

### I7 — Discharge, LAMA, death, bed turnaround (2–3 weeks) — **core complete 2026-09-08**

| ID | Deliverable |
|----|-------------|
| I7.1 | Discharge planning (EDD, readiness, pending results) — **done** |
| I7.2 | Discharge order ≠ status flip; med recon gate (configurable) — **done** |
| I7.3 | Structured/versioned discharge summary — **done** (PDF/print deferred to docs follow-up) |
| I7.4 | Discharge meds via med recon + summary medications text / e-Rx — **done** (CTA pattern) |
| I7.5 | Multi-dept clearance checklist — **done** (BILLING syncs from I6 financial clear) |
| I7.6 | Discharge types + LAMA/DAMA (`IPD_LAMA_DAMA`) — **done** |
| I7.7 | Death workflow (`IPD_DEATH_WORKFLOW`) — **done** |
| I7.8 | Transfer-out — **done** |
| I7.9 | Bed cleaning metadata after discharge — **done** (CLEANING + cleaned_at/by) |
| I7.10 | Pending results remain on chart post-discharge — **done** (encounter-keyed tabs) |

**Exit:** Unauthorized users cannot bypass clinical LAMA/death paths (service-gated).

---

### I8 — Post-discharge & readmission (1–2 weeks)

| ID | Deliverable |
|----|-------------|
| I8.1 | Follow-up appointment hook (scheduling module) — **done** |
| I8.2 | Episode CLOSED after follow-up rules / manual close — **done** |
| I8.3 | Readmission link + configurable window analytics — **done** |
| I8.4 | Patient portal IPD summary / discharge docs (`IPD_PATIENT_PORTAL`) — **done** |

**Exit:** Follow-up books via scheduling; episode closes; readmits link within window; portal gated by service.

---

### I9 — Dashboards, reporting, mobile, hardening (2–3 weeks)

| ID | Deliverable |
|----|-------------|
| I9.1 | Role-aware IPD / ward / doctor / nurse / admin dashboards — **done** (`IpdOpsMetricsPanel`) |
| I9.2 | Occupancy, ALOS, turnaround, discharge delay, auth delay metrics — **done** (`GET /ipd/dashboard`) |
| I9.3 | Mobile nursing charting MVP (vitals, MAR, tasks) when service ON — **done** (responsive nursing dashboard + `IPD_MOBILE_NURSING`) |
| I9.4 | Performance: indexes, pagination, no N+1 on chart APIs — **done** (V87 indexes; chart remains encounter-keyed) |
| I9.5 | Full E2E automated test (section 7 scenario) — **deferred** (manual smoke in QA manual; extend `IpdIntegrationTest` later) |
| I9.6 | Security review: tenant isolation, least privilege, audit completeness — **notes** (tenant-scoped dashboard queries; existing `@PreAuthorize`) |
| I9.7 | Docs: architecture, state machine, API map, permission matrix, config guide — **done** (ADR-IPD-003 + PHASE-I notes) |

**Exit:** Ops KPIs visible to admin/doctor/nurse; mobile nursing path clear; V87 applied.

---

## 6. Critical E2E acceptance scenario (must pass)

```
Existing patient + UHID
→ OPD consult
→ Doctor recommends admission (service ON)
→ Request → approve → reserve bed
→ Patient arrives → admit checklist → ADMITTED
→ Nursing assessment + doctor assessment
→ Med reconciliation → initial orders
→ Lab order → result → (critical alert if needed)
→ eMAR administer
→ Progress note + specialist consult
→ Transfer bed / optional ICU escalate & return
→ Optional OT procedure
→ Discharge planning → clearances
→ Final med recon + discharge summary
→ Financial (+ payer if ON)
→ Discharge type ROUTINE
→ Bed CLEANING → AVAILABLE
→ Follow-up → episode CLOSED
```

**Regression:** OPD golden path, patient UHID, existing Phase D direct admit (for hospitals with PRE_ADMISSION off) must still work.

---

## 7. Frontend screen backlog (reuse design system)

| Screen | Primary roles | Phase |
|--------|---------------|-------|
| Hospital IPD services settings + presets | HOSPITAL_ADMIN | I0 |
| IPD operational dashboard | Admin / Nurse / Doctor | I9 |
| Admission requests inbox + detail | Admin / Doctor | I1 |
| Bed map / ward board | Admin / Nurse | I2 |
| Patient IPD Summary (chart) | Doctor / Nurse / Admin | I3 |
| Ward round list | Doctor | I3 |
| Nursing workspace | Nurse | I3 |
| eMAR (enhance existing) | Nurse | I4 |
| Consultations | Doctor | I3 |
| Transfers / ICU escalate | Doctor / Admin | I5 |
| Discharge planning + summary | Doctor / Admin | I7 |
| Financial / payer clearance | Billing / Admin | I6 |
| Handover | Nurse / Doctor | I3 |
| Reports | Admin | I9 |

Do **not** invent a new visual language; extend `PortalShellLayout`, shared dashboard, clinical panels.

---

## 8. API design principles

- Follow existing `/api/v1/ipd/...` style (`IpdController`).
- Prefer command endpoints for transitions:  
  `.../approve`, `.../assign-bed`, `.../arrive`, `.../transfer`, `.../plan-discharge`, `.../clearances/{type}`, `.../discharge`.
- No generic `PATCH status`.
- DTOs + validation + `@PreAuthorize` + hospital scope + **service catalog check**.
- Events via existing notification/audit infrastructure (`IPDAdmissionApproved`, `BedAssigned`, `PatientDischarged`, …).

---

## 9. Testing strategy

| Layer | Focus |
|-------|-------|
| Unit | State machines, allocation rules, clearance gates |
| Integration | Flyway + admit/request/transfer/discharge/cleaning |
| API | Permission + service-disabled 403 |
| E2E | OPD→IPD full path; LAMA; ICU round-trip; self-pay vs TPA hospital presets |
| Regression | OPD walk-in golden path; existing `IpdIntegrationTest` |

---

## 10. Documentation deliverables

| Doc | When |
|-----|------|
| This plan (living) | Kickoff |
| ADR: Hospital IPD service catalog | I0 |
| ADR: Payer framework (country-neutral) | I6 |
| Update `HMS-IPD-FLOW.md` → enterprise flow | After I1/I7 |
| Permission matrix | I0 + each phase |
| QA manual IPD chapter | I9 |
| Feature-status-board IPD-E* rows | I0 |

---

## 11. Explicit non-goals (until contracted / later)

| Item | Reason |
|------|--------|
| Full PACS/DICOM | External vendor (G4) |
| External LIS rewrite | Use existing lab; G5 later |
| Hard-coded insurer rule engines | Configurable payer only |
| Separate IPD per country codebase | Country packs only |
| Second patient/UHID/billing/pharmacy | Forbidden |
| Auto-administer meds / auto AVAILABLE bed | Safety |

---

## 12. Recommended kickoff order (next 30 days)

1. **Stabilize:** commit Phase G/H; run API; smoke OPD + current IPD.  
2. **I0:** service catalog + FEATURE_IPD + board updates.  
3. **I1:** OPD → admission request → approve → admit (highest clinical value).  
4. **I2:** bed cleaning + reserve (makes IPD feel like a real ward).  
5. Demo to hospital stakeholders with two presets: *Nursing home* vs *Multi-specialty*.

---

## 13. Success definition

IPD is **not** done when forms exist. It is done when:

- Hospitals configure only the services they run.
- Existing Patient/UHID/OPD remain unbroken.
- Request→bed→care→discharge→cleaning works under RBAC + audit.
- Lab/pharmacy/OT/ICU/billing are **integrated**, not cloned.
- India payer flows work as a **country pack**, not core hard-coding.
- Automated tests cover the critical E2E path.
- UI matches Health360 design system and supports multi-tenant chains.

---

## 14. Traceability — master prompt → phase

| Prompt section | Phase |
|----------------|-------|
| Audit / reuse | Done in this doc §1; continuous |
| Hospital services / multi-type hospitals | **I0** |
| Admission request / sources / types | **I1** |
| Pre-admission / eligibility | **I1** + **I6** |
| Bed management / assignment / cleaning | **I2** |
| Assessments / care / rounds / consult / handover | **I3** |
| Orders / MAR / lab / rad | **I4** |
| ICU / OT / procedures / infection / blood | **I5** |
| Billing / insurance / clearance | **I6** |
| Discharge / LAMA / death / summary | **I7** |
| Follow-up / readmission | **I8** |
| Dashboards / reporting / mobile / performance | **I9** |
| Country-neutral + India first | **I0** stub + **I6/I7** packs |
| RBAC / audit / tenancy / APIs / tests | Every phase |
