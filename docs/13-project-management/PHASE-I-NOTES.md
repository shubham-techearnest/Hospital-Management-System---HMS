# Phase I — Complete IPD enterprise (notes)

| Field | Value |
|-------|--------|
| Plan | [PHASE-I-IPD-ENTERPRISE-PLAN.md](./PHASE-I-IPD-ENTERPRISE-PLAN.md) |
| Started | 2026-09-08 |

## I0 — Foundations (code complete 2026-09-08)

- Migration `V79__ipd_service_catalog.sql`
- Plan keys `FEATURE_IPD` / `FEATURE_ICU`
- API + UI: `/hospital/ipd-services`
- ADR: `docs/06-architecture/ADR-IPD-001-hospital-service-catalog.md`

## I1 — Admission request & OPD→IPD (code complete 2026-09-08)

### Delivered

- Migration `V80__ipd_admission_requests.sql` — `ipd.admission_requests`; admission source/type/request link; RBAC
- State machine: REQUESTED → UNDER_REVIEW → APPROVED → SCHEDULED → ADMITTED (+ reject/cancel)
- Catalogs: sources / types / priorities
- APIs under `/api/v1/ipd/admission-requests*`
- Doctor OPD: **Recommend IPD admission** on encounter detail
- Hospital IPD: **Requests** tab (review / approve / reject / schedule / allocate bed)
- Admit from approved/scheduled request marks request **ADMITTED** (same patient/UHID)
- Direct admit still works without a request

### Deferred (later waves)

- I1.6 Configurable pre-admission checklist → fold into I6 / eligibility
- I1.7 Patient/staff notifications on request lifecycle → notification gateway follow-up
- I1.8 Full integration/E2E test → unit coverage (`AdmissionRequestStatusTest`); E2E in I9

### Ops

1. Restart API (Flyway V79–V81)
2. Re-login (new `ipd:admission-request:*` / `ipd:settings:*` permissions)
3. Smoke: OPD recommend → Requests approve → Reserve/Allocate bed → Admissions
4. Discharge → bed CLEANING → Beds tab → Mark available


### Delivered

- Migration `V81__ipd_bed_enterprise.sql` — `CLEANING` status; `reserved_bed_id` on requests
- Bed status state machine + `POST /ipd/beds/{id}/status`
- Discharge/transfer release → **CLEANING** (staff marks AVAILABLE)
- `POST /ipd/admission-requests/{id}/reserve-bed` → RESERVED; admit may use reserved bed
- Hospital IPD **Beds** tab: ward board with labeled statuses + actions

### Deferred

- I2.3 Allocation rules engine
- I2.5 Transfer handover notes / full history UI
- I2.7 Building/floor fields

### Ops

Restart API for Flyway V81; re-login if needed.

## I3 — Clinical IPD workspace (core code 2026-09-08)

### Delivered

- Shared `IpdPatientChart` (`features/ipd/components/IpdPatientChart.tsx`)
- Routes (same chart, role gates):
  - `/doctor/ipd/admissions/:admissionId`
  - `/nursing/admissions/:admissionId`
  - `/hospital/ipd/admissions/:admissionId` (new; **Chart** on admissions table)
- Tabs reuse existing clinical panels (timeline, vitals, structured consult, e-Rx, orders, lab/rad/OT, MAR list, billing)
- Admission assessment templates + SBAR handover via IPD rounds
- No new clinical modules — everything keyed by `admission.encounterId`

### Deferred

- I3.4 hospital-configurable nursing forms schema
- I3.5 care plan entity
- I3.8 nursing acuity/task board
- I3.9 specialist consult lifecycle

## I4 — Medications & diagnostics (core code 2026-09-08)

### Delivered

- Migration `V82__ipd_meds_diagnostics.sql`
- eMAR outcomes: **GIVEN / OMITTED / REFUSED** (+ required reason when not given); never auto-admin
- Med reconciliation: `POST/GET .../admissions/{id}/med-reconciliations` + chart Meds tab panel
- Orders panel: nursing/diet/physio as `OTHER` (diet/physio gated by `IPD_DIET` / `IPD_PHYSIO`)
- Critical lab flag on release + acknowledge on IPD diagnostics tab
- Imaging reports show impression/findings on chart

### Ops

Restart API for Flyway **V82**.

## I5 — ICU / OT / isolation / blood (core code 2026-09-08)

### Delivered

- Migration `V83__ipd_icu_ot_isolation.sql` — admission `isolation_required` / `care_level` / `active_icu_stay_id`; `ipd.blood_requests` stub
- `IpdCareTransitionService`: escalate to ICU (reuses `IcuStayService`, frees ward bed → CLEANING, keeps IPD ADMITTED), step-down to ward bed
- APIs: `POST .../escalate-to-icu`, `.../step-down-from-icu`, `PATCH .../isolation`, blood-request list/create
- Service gates: `IPD_ICU_ESCALATION`, `IPD_OT_INTEGRATION`, `IPD_ISOLATION`, `IPD_BLOOD_BANK`
- Chart: care-level / isolation chips + `IpdCareTransitionsPanel`; OT procedure list + hospital OT worklist link; PROCEDURE orders gated
- OT encounter procedure list supports non-completed (`completedOnly`)

### Deferred

- I5.3 full procedure checklist UI
- I5.4 deep OT implant/anesthesia editing from IPD chart (reuse OT portal)
- Full blood-bank fulfillment module

### Ops

1. Restart API (Flyway **V79–V83**)
2. Enable relevant IPD services (Multi-specialty / Tertiary presets include ICU+OT+isolation+blood)
3. Smoke: admit → Escalate to ICU → ICU stay linked → Step down to ward bed → Isolation toggle → Blood request stub

## I6 — Financial / payer / clearance (core code 2026-09-08)

### Delivered

- Migration `V84__ipd_billing_payer.sql` — charge events; invoice `invoice_kind` (STANDARD/DEPOSIT/INTERIM/FINAL); admission payers; authorizations; financial clearance
- Billing: kinded invoices, append lines, list invoices by encounter; DEPOSIT/INTERIM skip discharge-summary checkout gate
- `IpdBillingService` + chart **Billing** tab (`IpdBillingPanel`)
- Service gates: `IPD_DEPOSIT`, `IPD_INTERIM_BILLING`, `IPD_INSURANCE_TPA`
- Country pack flags + hospital IPD services UI toggles; discharge blocked when clearance/pre-auth required
- ADR: `docs/06-architecture/ADR-IPD-002-payer-framework.md`

### Ops

1. Restart API (Flyway **V79–V84**)
2. Enable deposit/interim/TPA services as needed; optionally turn on clearance/pre-auth gates in IPD services country flags
3. Smoke: Chart Billing → add bed-day charge → deposit → interim invoice → assign payer → pre-auth approve → financial clear → discharge

## I7 — Discharge / LAMA / death / turnaround (core code 2026-09-08)

### Delivered

- Migration `V85__ipd_discharge_enterprise.sql` — plans, orders, versioned summaries, multi-dept clearances, death/transfer-out records, bed cleaning metadata
- `IpdDischargeService`: plan → order (≠ status flip) → clearances → complete with type ROUTINE/LAMA/DAMA/DEATH/TRANSFER_OUT/ABSCONDED
- Gates (country flags, default off): med recon, discharge order, multi-dept clearance; LAMA/death service-gated
- ICU-escalated admits: discharge no longer requires active ward bed
- Chart Discharge tab: `IpdDischargeWorkflowPanel`; post-discharge summary + pending-results note; bed CLEANING → Mark available

### Deferred

- OpenPDF / document-center store for discharge PDF
- Dedicated housekeep cleaning queue UI beyond Beds tab

### Ops

1. Restart API (Flyway **V79–V85**)
2. Optional: enable med-recon / order / multi-dept gates on IPD services country flags
3. Smoke: plan → Meds DISCHARGE recon → discharge order → clearances → complete → bed CLEANING → Available

## I8 — Post-discharge & readmission (core code 2026-09-08)

### Delivered

- Migration `V86__ipd_post_discharge.sql` — expands admission status CHECK (I7 terminals + `FOLLOW_UP`/`CLOSED`); follow-up appointment link; episode close fields; readmission link
- `IpdPostDischargeService`: schedule follow-up (reuses scheduling `bookAppointment`), close episode, readmission analytics, prior-admit link on admit, patient portal stays
- APIs: `POST .../follow-up`, `POST .../close-episode`, `GET /ipd/readmission-analytics`, `GET /patients/me/ipd-stays[+/{id}]`
- Chart Discharge tab: schedule follow-up (slot picker) + close episode; READMISSION / FOLLOW-UP chips
- Hospital IPD Admissions: readmission window count; IPD services: `readmissionWindowDays`
- Patient portal: `/patient/ipd` (+ detail) when `IPD_PATIENT_PORTAL` enabled

### Ops

1. Restart API (Flyway **V79–V86**) — V86 also unlocks I7 statuses at DB level
2. Enable `IPD_READMISSION_TRACKING` / `IPD_PATIENT_PORTAL` as needed; set readmission window days
3. Smoke: discharge → schedule follow-up → status FOLLOW_UP → close episode → CLOSED; re-admit within window → READMISSION chip; patient `/patient/ipd`

## I9 — Dashboards, reporting, mobile, hardening (core code 2026-09-08)

### Delivered

- Enriched `GET /api/v1/ipd/dashboard` — occupancy %, cleaning/reserved beds, open requests, active discharge orders, 30d ALOS / bed turnaround / discharge delay / auth delay, discharges + readmissions in window
- Migration `V87__ipd_dashboard_metrics_indexes.sql`
- Shared `IpdOpsMetricsPanel` on: Hospital dashboard, Hospital IPD, Doctor IPD, Nursing dashboard
- Nursing nav: **Dashboard** added; `IPD_MOBILE_NURSING` messaging for phone/tablet charting path (ward → chart / MAR)
- ADR: `docs/06-architecture/ADR-IPD-003-ipd-ops-metrics.md`

### Deferred

- Full automated section-7 E2E (manual QA smoke remains)
- Formal external security audit package
- Native RN vitals/MAR beyond worklist deep-link

### Ops

1. Restart API (Flyway **V79–V87**)
2. Smoke: `/hospital/dashboard` + `/hospital/ipd` metrics; `/nursing/dashboard`; `/doctor/ipd` compact strip
3. Optional: enable `IPD_MOBILE_NURSING` on Tertiary / as needed

### Phase I status

**I0–I9 core implementation complete.** Remaining work is QA / UAT / production hardening of the enterprise IPD path.

