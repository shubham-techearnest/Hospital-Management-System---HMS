# Health360
## Product Owner Master Plan

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Date** | 2026-09-17 |
| **Status** | CURRENT — AUDITED |
| **Prepared For** | Product Owner / Management |
| **Prepared By** | Product / Architecture audit (repository-based) |
| **Evidence Basis** | CODE-VERIFIED · DATABASE-VERIFIED · GIT-VERIFIED · docs/ssot |
| **File** | `docs/ssot/PRODUCT-OWNER-MASTER-PLAN.md` |

**Re-verified snapshot (2026-09-17):** Flyway **V103** (103 migrations) · **58** REST controllers · **29** PostgreSQL schemas · **27** integration + **29** unit test classes · Web **12** role portals · Mobile Expo ~52 (partial vs web).

**Completion %:** UNKNOWN (no frozen MVP denominator approved by Product Owner).

---

# 1. Executive Summary

### Product
Health360 is a **multi-tenant hospital operating system** plus **consumer health** portals: one identity/tenancy model connecting patients, doctors, hospital staff, clinical care, diagnostics, pharmacy, billing, and hospital operations.

### Current position
A **working MVP-scale platform** on **API + Web**, with delivery history **HMS-0…24**. Mobile covers patient/doctor/reception and thin staff worklists — **not** full hospital ops. Charge engine defaults to **DRY_RUN**. Email is a **log stub**; SMS optional.

### Major implemented capabilities (Web + API)
Auth/RBAC · Hospital SaaS subscriptions · Patient/Doctor/Hospital · Appointments/OPD · Encounters · IPD/ICU/ED · Lab/Rad/OT/Pharmacy · Billing/Razorpay · Automation/My Work · Inventory/Procurement/Assets/Facility · Insurance/Blood/Staff ops · Command Center · Predictive heuristics

### Major incomplete / needs attention
Charge **POST** cutover · Notification templates · Real email · Mobile ops depth · Nursing depth · Payment webhook amount reconcile · `BED_RELEASED` event not published · CI branch mismatch · Uncommitted large V2 surface · Formal security/compliance assessments **not done**

### Remaining MVP work (proposed definition — needs PO approval)
Stabilize production readiness (security, payments, charge mode, notifications, CI/release) + close critical logic gaps + define mobile MVP scope + UAT golden paths. **Does not** include ambulance/homecare/AI vision.

### Estimated effort (Scenario B — Complete defined MVP)
**Optimistic 95 · Expected 140 · Conservative 200 person-days** (see §30–33). Contingency ~20% included in conservative.

### Estimated timeline (Scenario B)
| Team scenario | Expected calendar |
|---------------|-------------------|
| Small (~4 FTE) | ~14–20 weeks |
| Medium (~7–8 FTE) | ~8–12 weeks |
| Parallel larger (~10+ FTE) | ~6–9 weeks |

Dates absolute: **UNKNOWN** (no locked start date / team).

### Major risks
Silent revenue (DRY_RUN / swallowed charge errors) · Payment webhook gaps · Mobile expectation mismatch · Release/git hygiene · Tenant/PHI without formal review · Email/SMS stubs mistaken for production

### Product Owner decisions required
MVP boundary · Charge POST · Mobile scope · Notification/email providers · Redis in prod · Naming eras · Vision items (ambulance/telemedicine/AI) in or out of MVP

### Next milestone
**M1 — Stabilize & Decide (2–4 weeks expected):** commit/release hygiene, CI branch fix, payment webhook harden, publish or drop `BED_RELEASED`, RoleRoute fail-closed, PO decisions on charge/mobile/notifications, UAT script for OPD+IPD+Billing golden paths.

---

# 2. Product Vision & Objectives

### Vision
Become the healthcare operating system that connects **patient journey → clinical care → diagnostics → medication → revenue → operations → follow-up / long-term health**.

### Mission
Reduce duplicate entry, make role UI task-driven, coordinate departments via events/tasks, and keep billing/inventory/assets consistent with clinical reality.

### Business objectives
- Run multi-branch hospitals on one SaaS platform  
- Monetize via hospital subscriptions + feature flags  
- Support patient self-service (booking, records, payments)  
- Scale modules without rebuilding identity/tenancy  

### Target users (evidence-backed)

| Persona | Web | Mobile |
|---------|-----|--------|
| Patient | Yes | Yes |
| Doctor | Yes | Yes |
| Receptionist | Yes | Yes |
| Hospital Admin | Yes | Partial |
| Nurse / ICU Nurse | Yes | Thin worklist |
| Lab / Radiology / OT / Pharmacy staff | Yes | Thin worklist |
| Asset Manager | Yes | No (unauthorized) |
| Platform Admin | Yes | Partial |

---

# 3. Product Scope

## A. CURRENT MVP (implemented major paths — Web+API)

Platform IAM/RBAC/subscriptions · Patient/Doctor/Hospital · Scheduling/OPD/Encounters · IPD/ICU/ED+ADT · Lab/Rad/OT/Pharmacy · Billing + Razorpay · Documents · Assets/EAM · Automation/My Work/Approvals · Inventory/Procurement/Facility · Insurance/Blood/Staff ops · Command Center · Predictive (heuristics) · Partial Mobile

## B. DEFINED REMAINING MVP (proposed — **PO must confirm**)

1. Production readiness: charge mode decision, payment webhook harden, email/SMS real or explicitly “dev-only”  
2. Critical logic fixes (BED_RELEASED, RoleRoute, charge observability)  
3. CI/release hygiene  
4. Golden-path automated + UAT (OPD, IPD, Lab, Pharmacy, Billing)  
5. Mobile scope freeze (patient/doctor/reception only **or** add My Work)  
6. Security review of tenant isolation + PHI handling (assessment, not certification claim)  

## C. FUTURE HEALTH360 PLATFORM (PROPOSED — not current commitments)

Ambulance · Home healthcare/nursing · Physiotherapy product · Full telemedicine/video · Chronic care programs · Marketplace scale · LIMS/RIS/PACS depth · AI CDS · FHIR/ABDM · S3 · Configurable rules UI · Full notification templates product

```text
CURRENT SYSTEM → STABILIZATION → MVP COMPLETION → PRODUCTION READY
        → PATIENT ECOSYSTEM → FULL HEALTH360 PLATFORM (vision)
```

---

# 4. Health360 Module Map (actual)

```text
HEALTH360
├── PLATFORM
│   ├── Auth / JWT / MFA (partial)
│   ├── RBAC / Roles
│   ├── Multi-tenant + Hospital scope
│   ├── Subscriptions / Feature flags
│   ├── Notifications (in-app; email stub; SMS optional)
│   ├── Automation (events, tasks, approvals, escalation)
│   ├── Command Center
│   └── Predictive (heuristics)
├── PATIENT
│   ├── Profile / Consent / UHID registry
│   ├── Vitals / Analytics
│   ├── Search / Public discovery
│   └── Portal payments / encounters / OPD status
├── PROVIDER
│   ├── Doctor profile / Verification
│   ├── Hospital associations / Schedule
│   └── Clinical consult / My Work
├── HOSPITAL
│   ├── Profile / Branches / Departments
│   ├── Staff / Staff ops (roster/leave)
│   └── Admin portals
├── CLINICAL
│   ├── Appointments
│   ├── OPD queue / desk
│   ├── Encounter hub
│   ├── IPD (+ ADT facade)
│   ├── ICU / Emergency / OT / Nursing
├── DIAGNOSTICS
│   ├── Laboratory
│   └── Radiology
├── MEDICATION
│   ├── Pharmacy orders / dispense
│   └── (Clinical inventory links)
├── REVENUE
│   ├── Invoices / Payments / Razorpay
│   ├── Charge engine (DRY_RUN default)
│   └── Insurance / TPA
├── OPERATIONS
│   ├── Inventory / Procurement
│   ├── Assets / EAM / Facility
│   └── Blood bank
└── FUTURE (not built)
    ├── Ambulance / Homecare / Physio
    ├── Full Telemedicine / Wellness programs
    └── AI / Marketplace scale
```

High-level journey:

```text
        PATIENT ── PROVIDER ── HOSPITAL
                    │
            HEALTHCARE JOURNEY
         OPD / IPD / ICU / OT / ER
                    │
         LAB / RADIOLOGY → PHARMACY
                    │
      BILLING / PAYMENT / INSURANCE
                    │
     FOLLOW-UP / (future HOMECARE / WELLNESS)
```

---

# 5–7. Feature Inventory, Status & Completeness

Statuses used: `IMPLEMENTED` · `PARTIALLY IMPLEMENTED` · `PLANNED` · `NOT STARTED` · `UNKNOWN`

| ID | Module | Feature | Business Purpose | Status | Logic | Web | Mobile | Backend | DB | Testing | Remaining Work |
|----|--------|---------|------------------|--------|-------|-----|--------|---------|-----|---------|----------------|
| F01 | Platform | Login / JWT / refresh | Secure access | IMPLEMENTED | CORRECT | Y | Y | Y | Y | PARTIAL | MFA UX clarity |
| F02 | Platform | RBAC permissions | Role access | IMPLEMENTED | CORRECT | Y | PARTIAL | Y | Y | PARTIAL | Continuous matrix tests |
| F03 | Platform | MFA TOTP | Extra auth | PARTIALLY IMPLEMENTED | UNKNOWN UX | ? | ? | Y | Y | UNKNOWN | Complete clients + UAT |
| F04 | Platform | Multi-tenant + hospital scope | Isolation | IMPLEMENTED | CORRECT | Y | PARTIAL | Y | Y | PARTIAL | Formal security review |
| F05 | Platform | Subscription feature flags | SaaS packaging | IMPLEMENTED | CORRECT | Y | PARTIAL | Y | Y | PARTIAL | — |
| F06 | Patient | Registration / profile / consent | Identity | IMPLEMENTED | CORRECT* | Y | Y | Y | Y | PARTIAL | *business edge cases UAT |
| F07 | Patient | Vitals / health analytics | Self health | IMPLEMENTED | CORRECT* | Y | Y | Y | Y | PARTIAL | — |
| F08 | Doctor | Profile / verification | Credentialing | IMPLEMENTED | CORRECT* | Y | Y | Y | Y | PARTIAL | — |
| F09 | Hospital | Org / branches / staff | Operate hospital | IMPLEMENTED | CORRECT* | Y | PARTIAL | Y | Y | PARTIAL | Mobile depth |
| F10 | Clinical | Appointment booking | Access care | IMPLEMENTED | CORRECT* | Y | PARTIAL | Y | Y | PARTIAL | Teleconsult = flag only |
| F11 | Clinical | OPD queue / desk / walk-in | Front desk ops | IMPLEMENTED | CORRECT | Y | PARTIAL | Y | Y | PARTIAL | SMS/QR polish PLANNED |
| F12 | Clinical | Encounter consult / Dx / Rx | Doctor visit | IMPLEMENTED | CORRECT* | Y | PARTIAL | Y | Y | PARTIAL | UX workspace merge |
| F13 | Clinical | Checkout gate → invoice | Prevent incomplete bill | IMPLEMENTED | CORRECT | Y | PARTIAL | Y | Y | PARTIAL | Document exceptions |
| F14 | Clinical | IPD admit / transfer / discharge | Inpatient care | IMPLEMENTED | INCOMPLETE event | Y | N | Y | Y | PARTIAL | Publish BED_RELEASED |
| F15 | Clinical | ICU stays | Critical care | IMPLEMENTED | CORRECT* | Y | THIN | Y | Y | PARTIAL | Mobile |
| F16 | Clinical | Emergency + ADT | ED ops | IMPLEMENTED | CORRECT* | Y | N | Y | Y | UNKNOWN | Tests + mobile |
| F17 | Clinical | OT procedures | Surgery ops | IMPLEMENTED | CORRECT* | Y | THIN | Y | Y | PARTIAL | — |
| F18 | Clinical | Nursing / MAR | Ward nursing | PARTIALLY IMPLEMENTED | UNKNOWN depth | Y | THIN | PARTIAL | PARTIAL | UNKNOWN | Define nursing MVP |
| F19 | Dx | Laboratory orders/results | Diagnostics | IMPLEMENTED | CORRECT* | Y | THIN | Y | Y | PARTIAL | Mobile processing |
| F20 | Dx | Radiology | Imaging | IMPLEMENTED | CORRECT* | Y | THIN | Y | Y | PARTIAL | — |
| F21 | Meds | Pharmacy dispense | Medication | IMPLEMENTED | CORRECT | Y | THIN | Y | Y | PARTIAL | — |
| F22 | Revenue | Invoices / cash payments | Collect revenue | IMPLEMENTED | CORRECT* | Y | PARTIAL | Y | Y | PARTIAL | — |
| F23 | Revenue | Razorpay online pay | Online collect | IMPLEMENTED | INCOMPLETE webhook | Y | PARTIAL | Y | Y | UNKNOWN | Amount reconcile |
| F24 | Revenue | Charge engine | Auto charge lines | PARTIALLY IMPLEMENTED | CORRECT DRY_RUN | Y | N | Y | Y | UNKNOWN | POST cutover decision |
| F25 | Revenue | Insurance / TPA | Payer workflows | IMPLEMENTED | CORRECT* | Y | N | Y | Y | UNKNOWN | Depth UAT |
| F26 | Ops | Inventory | Stock control | IMPLEMENTED | CORRECT* | Y | N | Y | Y | UNKNOWN | — |
| F27 | Ops | Procurement | Buy supplies | IMPLEMENTED | CORRECT* | Y | N | Y | Y | UNKNOWN | — |
| F28 | Ops | Assets / EAM | Equipment lifecycle | IMPLEMENTED | CORRECT* | Y | N | Y | Y | PARTIAL | — |
| F29 | Ops | Facility work orders | HK / facility | IMPLEMENTED | CORRECT* | Y | N | Y | Y | UNKNOWN | Event completeness |
| F30 | Ops | Blood bank | Blood ops | IMPLEMENTED | CORRECT* | Y | N | Y | Y | UNKNOWN | — |
| F31 | Ops | Staff roster / leave | Workforce | IMPLEMENTED | CORRECT* | Y | N | Y | Y | UNKNOWN | — |
| F32 | Platform | My Work / tasks / approvals | Ops coordination | IMPLEMENTED | CORRECT* | Y | N | Y | Y | PARTIAL | Mobile My Work |
| F33 | Platform | Command Center | Ops snapshot | IMPLEMENTED | CORRECT* | Y | N | Y | flag | UNKNOWN | — |
| F34 | Platform | Predictive insights | Pressure signals | IMPLEMENTED | CORRECT heuristics | Y | N | Y | Y | UNKNOWN | Not ML |
| F35 | Platform | Clinical documents / letterhead | Printables | IMPLEMENTED | CORRECT* | Y | N | Y | Y | UNKNOWN | — |
| F36 | Platform | Partners / marketplace | Provider network | PARTIALLY IMPLEMENTED | PARTIAL | Admin | N | Y | Y | UNKNOWN | Scope decision |
| F37 | Future | Full telemedicine | Video care | NOT STARTED / flag only | INCOMPLETE | — | — | flag | flag | — | Build or defer |
| F38 | Future | Ambulance / Homecare / Physio / AI | Ecosystem | NOT STARTED | — | — | — | — | — | — | Vision only |

\* `CORRECT*` = core coded path looks coherent; full clinical UAT not exhaustively proven in this audit.

### Counts (feature rows above)

| Status | Count |
|--------|-------|
| IMPLEMENTED | 30 |
| PARTIALLY IMPLEMENTED | 5 |
| NOT STARTED / vision | 2 (+ more vision not rowed) |
| Logic correction required (known) | 3 (BED_RELEASED, webhook, RoleRoute/reactor observability) |
| IN DEVELOPMENT | UNKNOWN (no single ticket board evidenced) |

---

# 8. Current System Inventory

### Backend
Modular monolith `health360-api` · Java 21 · Spring Boot 3.3 · **58** controllers · domain packages (iam, patient, hospital, clinical, opd, ipd, … predictive) · JWT RS256 · `@PreAuthorize` · 4 schedulers (appointments, follow-ups, task escalation, predictive)

### Database
PostgreSQL · Flyway **V1–V103** · **29** schemas · Soft-delete + `tenant_id` audit pattern

### Web
React 19 + Vite + MUI · TanStack Query · Redux auth · **12** portals (patient, doctor, hospital, admin, lab, rad, OT, pharmacy, assets, reception, nurse, ICU nurse)

### Mobile
Expo ~52 · Patient/Doctor/Reception/Hospital-admin/Admin shells · Staff worklist thin · No ASSET_MANAGER · No IPD/ED/inventory/etc.

### APIs (by domain)
`/auth` · `/patients` · `/doctors` · `/hospitals` · `/scheduling` · `/opd` · `/clinical` · `/ipd` `/adt` `/icu` `/emergency` · `/lab` `/radiology` `/ot` `/pharmacy` · `/billing` `/billing/charges` · `/tasks` `/approvals` · `/inventory` `/procurement` `/assets` `/facility` · `/insurance` `/blood` `/staff-ops` · `/command-center` `/predictive` · admin/*

---

# 9. Business Workflow Audit (summary)

| Workflow | Actor | Trigger → Outcome | Completion | Notes |
|----------|-------|-------------------|------------|-------|
| Patient register / UHID desk | Reception/Patient | Register → profile/UHID | Working (Web) | SMS credentials often log-first |
| Appointment → OPD | Patient/Reception | Book/arrive → queue | Working | |
| OPD consult → checkout | Doctor/Reception | Notes/Rx → invoice gate | Working | Gate enforces FINAL+SIGNED (OPD) |
| IPD admit | Staff | Bed AVAILABLE → OCCUPIED + events | Working | PATIENT_ADMITTED + BED_ASSIGNED |
| IPD discharge | Staff | Status → CLEANING bed + PATIENT_DISCHARGED | Working DB; event gap | BED_RELEASED not published |
| Lab order → result | Lab | Order → release (+ charge event) | Working | |
| Pharmacy READY→DISPENSED | Pharmacist | Dispense + MEDICATION_DISPENSED | Working | |
| Invoice / pay | Reception/Patient | Invoice → cash/Razorpay | Working* | Webhook harden needed |
| Charge posting | System | Event → posting/exception | Working DRY_RUN | POST needs PO decision |
| My Work task | Ops roles | Event → task → complete | Working Web | No mobile |
| ED visit | ED staff | Arrival→triage→disposition→ADT | Working Web | |

---

# 10. Logic Validation (critical findings)

| Area | Expected | Actual | Finding | Impact | Action |
|------|----------|--------|---------|--------|--------|
| OPD checkout | Block incomplete bill | Blocks without FINAL note + SIGNED Rx | LOGIC CORRECT | Protects revenue quality | KEEP |
| IPD admit | Occupy bed + events | AVAILABLE/RESERVED checks; events published | LOGIC CORRECT | — | KEEP |
| IPD discharge bed event | BED_RELEASED for consumers | Only PATIENT_DISCHARGED; bed→CLEANING in DB | LOGIC INCOMPLETE | Downstream listeners may miss signal | FIX |
| Pharmacy dispense | Strict READY→DISPENSED + event | Enforced + MEDICATION_DISPENSED | LOGIC CORRECT | — | KEEP |
| Charges | Configurable POST/DRY_RUN | Default DRY_RUN; reactor swallows charge errors | LOGIC CORRECT by design / DESIGN ISSUE for prod | Silent non-billing | DECIDE + FIX observability |
| Razorpay webhook | Verify + match amount + PENDING only | Signature yes; amount not reconciled; non-PENDING can capture | LOGIC INCOMPLETE | Payment integrity risk | FIX |
| Telemedicine | Full product if sold | Plan flag + booking type gate only | LOGIC INCOMPLETE | False product expectation | DECIDE |
| Web RoleRoute | Deny if no user | May render children if user null | SECURITY DEFECT (edge) | Authz hole risk | FIX |
| OPD queue states | Enforced graph | Enforced in OpdQueueService | LOGIC CORRECT | — | KEEP |
| Tenant scope | Hospital scoped queries | HospitalScopeService + tenantId pattern | LOGIC CORRECT* | Needs continuous tests | KEEP + TEST |

---

# 11. Function / Method Audit (P0 sample)

| Class | Method | Purpose | Finding | Action |
|-------|--------|---------|---------|--------|
| EncounterCheckoutGateService | assertReadyForCheckout | Gate invoices | CORRECT | KEEP |
| BillingService | createInvoice | Create invoice | Calls gate — CORRECT | KEEP |
| IpdAdmissionService | admitPatient | Admit + events | CORRECT | KEEP |
| IpdDischargeService | discharge flow | Discharge + bed release DB | INCOMPLETE event | FIX |
| PharmacyRequestService | dispense | Dispense + event | CORRECT | KEEP |
| ChargePostingService | onHospitalEvent | Post charges | CORRECT DRY_RUN | KEEP / configure |
| AutomationReactor | onEvent | React to events | Swallows charge errors | REFACTOR metrics |
| OnlinePaymentService | webhook handler | Capture payment | INCOMPLETE checks | FIX |
| HospitalScopeService | assertHospitalScope | Authorization scope | CORRECT | KEEP |
| OpdQueueService | transitions | Queue FSM | CORRECT | KEEP |
| JwtAuthenticationFilter | doFilter | AuthN | CORRECT | KEEP |

Trivial getters/setters skipped.

---

# 12. State Transition Audit

| Entity | States (representative) | Enforcement |
|--------|-------------------------|-------------|
| OPD queue | WAITING→CALLED→IN_SERVICE→COMPLETED (+ SKIPPED/CANCEL) | CODE-VERIFIED |
| Pharmacy request | … READY→DISPENSED | CODE-VERIFIED |
| IPD admission | Active → DISCHARGED/LAMA/DAMA/… | CODE-VERIFIED |
| IPD bed | AVAILABLE/RESERVED→OCCUPIED→CLEANING→… | CODE-VERIFIED |
| Charge posting | DRY_RUN/POSTED/ATTACHED/… | CODE-VERIFIED |
| Charge exception | OPEN→RESOLVED/IGNORED | CODE-VERIFIED |
| Payment | PENDING→CAPTURED (webhook) | PARTIAL validation |

Invalid transitions: generally rejected via business exceptions where FSM coded; **not** every module exhaustively audited.

---

# 13. Multi-Tenancy Audit

| Control | Status |
|---------|--------|
| `tenant_id` on auditable entities | PRESENT |
| JWT carries tenantId | PRESENT |
| Hospital/branch scope services | PRESENT |
| Cross-tenant automated proof suite | PARTIAL (RBAC IT exists; full matrix UNKNOWN) |
| Formal isolation pen-test | NOT DONE |

---

# 14. RBAC / Authorization Audit

```text
User → JWT (roles + permissions) → @PreAuthorize → HospitalScope → DB tenant/hospital filters
```

| Issue | Severity |
|-------|----------|
| Frontend RoleRoute null-user edge | HIGH |
| Mobile missing ASSET_MANAGER shell | MEDIUM (product) |
| Permission matrix living only in DB/seeds | MEDIUM (ops) |
| Webhook public by design (signature) | OK if secret enforced |

---

# 15. Database Logic Audit

| Topic | Finding |
|-------|---------|
| Schemas | 29 domain schemas — coherent modular design |
| Soft delete | Common `deleted_at` |
| Migrations | Additive V1–V103 |
| BED_RELEASED | Event constant/consumers without publisher — consistency gap |
| Indexes | Performance indexes present (e.g. V40, V103 overdue) |
| Full FK/orphan audit | NOT fully executed this pass — residual UNKNOWN |

---

# 16. API Logic Audit (themes)

| Theme | Status |
|-------|--------|
| AuthN on protected routes | PRESENT |
| AuthZ method security | PRESENT |
| Validation / business exceptions | PRESENT (pattern) |
| Idempotent charge postings | Unique event+code index (V92) |
| Payment webhook integrity | NEEDS FIX |
| Frozen OpenAPI artifact | MISSING |

---

# 17. Web Application Audit

| Area | Status |
|------|--------|
| 12 portals wired to APIs | PRESENT |
| OPD/IPD/Billing major screens | PRESENT |
| Charge exceptions UI | PRESENT (HMS-24) |
| Command Center / Predictive | PRESENT |
| Encounter Workspace UX merge | PARTIAL vs target UX |
| RoleRoute fail-closed | NEEDS FIX |

UI can complete major hospital workflows on **Web** for coded modules.

---

# 18. Mobile Application Audit

| Persona | Status |
|---------|--------|
| Patient | Major journeys present |
| Doctor | Visits/OPD/encounter present |
| Reception | Queue/patients/checkout present |
| Hospital admin | Org subset only |
| Staff departments | List-only worklists |
| IPD/ED/Assets/Inventory/Insurance/Blood/CC | MISSING |

**Explicit:** Web-complete ≠ Mobile-complete.

---

# 19. Testing Status

| Layer | Evidence | Status |
|-------|----------|--------|
| Backend unit | ~29 classes | PRESENT |
| Backend IT | ~27 classes (+ Docker gate) | PRESENT |
| HMS RBAC / golden path IT | Present | PARTIAL coverage of V2 |
| Playwright OPD | Workflow exists | PRESENT |
| Mobile E2E | Not first-class | UNKNOWN / weak |
| Coverage % | — | UNKNOWN |
| Formal security tests | — | NOT EVIDENCED |

Business-critical under-tested relative to breadth: ED, charges POST, insurance, blood, predictive, payments webhook.

---

# 20. Security Status

| Area | Status |
|------|--------|
| Authentication JWT RS256 | IMPLEMENTED |
| RBAC | IMPLEMENTED |
| Tenant/hospital scope | IMPLEMENTED (needs ongoing proof) |
| Audit logging | PRESENT pattern |
| Secrets / .env | Example present; discipline ongoing |
| Email/SMS production | STUB / OPTIONAL |
| Redis token blacklist in prod | Often disabled — decision needed |
| Compliance claims | **NONE claimed** |

---

# 21. Integrations

| Integration | Purpose | Status | Remaining |
|-------------|---------|--------|-----------|
| PostgreSQL | SoR | IMPLEMENTED | — |
| Redis | Optional cache/blacklist | OPTIONAL / often off | Decide prod |
| Razorpay | Payments | IMPLEMENTED | Webhook harden |
| MSG91 | SMS | OPTIONAL | Provider choice |
| Email | Notify | STUB | Real SMTP or accept log |
| Expo Push | Mobile push | IMPLEMENTED when enabled | — |
| Local FS | Documents | IMPLEMENTED | S3 future |
| S3 / FHIR / ABDM | — | NOT STARTED | Vision |

---

# 22. Technical Debt (PO-relevant)

| ID | Problem | Impact | Priority | Effort (pd) |
|----|---------|--------|----------|-------------|
| TD-02 | Large uncommitted V2 code | Release risk | P0 | 3–8 |
| TD-03 | CI branch ≠ master | CI may skip | P0 | 1–2 |
| TD-05 | Charge errors swallowed | Silent revenue | P1 | 2–5 |
| TD-06 | RoleRoute null user | Authz risk | P1 | 1–2 |
| TD-04 | Email/SMS stubs | False readiness | P1 | 5–15 |
| TD-11 | Redis off in prod | Blacklist durability | P1 | 2–5 |
| TD-08 | No PHI inventory | Compliance risk | P1 | 5–10 |
| TD-09 | Mobile/web gap | Support cost | P1 | (see mobile scope) |
| TD-01 | Docs competition | **Largely addressed** by SSOT reset | P2 | monitor |
| TD-07/10/12 | OpenAPI / rules UI / coverage | Quality | P2 | 5–20 |

---

# 23. Defect & Logic Findings (PO summary)

| ID | Area | Problem | Business Impact | Action | Priority |
|----|------|---------|-----------------|--------|----------|
| DEF-01 | Payments | Webhook amount/status gaps | Incorrect capture risk | FIX | CRITICAL |
| DEF-02 | IPD events | BED_RELEASED unpublished | Automation/facility inconsistency | FIX | HIGH |
| DEF-03 | Web authz | RoleRoute edge | Possible UI exposure | FIX | HIGH |
| DEF-04 | Charges | DRY_RUN + silent failures | Think revenue is posting when not | DECIDE + harden | HIGH |
| DEF-05 | Telemedicine | Flag marketed as product | Expectation mismatch | DECIDE | MEDIUM |
| DEF-06 | Release | Dirty tree / CI branches | Cannot trust ship | FIX process | HIGH |

---

# 24. What Is Actually Complete?

### Fully implemented (E2E Web+API evidence strong enough for “usable MVP path”)
Auth login · Hospital/patient/doctor core · OPD queue/consult with checkout gate · IPD admit/discharge DB lifecycle · Pharmacy dispense · Lab/Rad/OT modules present · Invoicing · Subscription flags · My Work (web) · Many V2 ops modules on web

### Partially implemented
Charge engine (DRY_RUN) · MFA · Nursing · Mobile ops · Partners marketplace · Wellness plans · Notifications (channels) · Predictive (heuristics only) · Insurance depth UNKNOWN beyond MVP APIs

### Requires logic correction
Payment webhook · BED_RELEASED · RoleRoute · Charge observability

### In development
UNKNOWN (no single tracked sprint board in-repo)

### Planned / Not started
Notification templates · Real email · Mobile My Work · Vision modules (ambulance, homecare, AI, full telemedicine)

---

# 25. Remaining Work Inventory

### P0 — Critical

| Work ID | Module | Work | Why | BE | DB | Web | Mobile | QA | Sec | Effort pd | Deps |
|---------|--------|------|-----|----|----|-----|--------|----|-----|-----------|------|
| W-P0-01 | Release | Commit/review HMS V2 surface; align CI branches | Ship integrity | — | — | — | — | Y | — | 3–8 | PO freeze |
| W-P0-02 | Payments | Webhook amount + PENDING-only | Money integrity | Y | — | — | — | Y | Y | 3–6 | Razorpay |
| W-P0-03 | IPD | Publish BED_RELEASED (or remove consumers) | Event consistency | Y | — | — | — | Y | — | 1–3 | — |
| W-P0-04 | Web | RoleRoute fail-closed | Authz | — | — | Y | — | Y | Y | 1–2 | — |
| W-P0-05 | Revenue | PO decision + implement charge POST cutover plan | Revenue truth | Y | — | Y | — | Y | — | 5–15 | DEC-CHG |
| W-P0-06 | QA | Golden-path UAT pack OPD+IPD+Bill+Rx | Confidence | — | — | — | — | Y | — | 8–15 | environments |

### P1 — High

| Work ID | Work | Effort pd |
|---------|------|-----------|
| W-P1-01 | Email SMTP or explicit non-prod labeling | 5–12 |
| W-P1-02 | SMS/WhatsApp decision (or defer) | 3–20 |
| W-P1-03 | Charge failure metrics/alerts (don’t swallow silently in prod) | 2–5 |
| W-P1-04 | Redis prod decision + config | 2–5 |
| W-P1-05 | Mobile scope freeze + optional My Work MVP | 15–40 |
| W-P1-06 | PHI/PII inventory + logging redaction pass | 5–10 |
| W-P1-07 | Expand IT for ED/charges/insurance smoke | 8–15 |
| W-P1-08 | Notification templates (if in MVP) | 10–25 |

### P2 — Medium

OpenAPI freeze · Rules UI · Encounter workspace UX merge · Coverage gates · Nursing depth definition · Document storage strategy

### P3 — Future

Ambulance · Homecare · Physio · Full telemedicine · AI · Marketplace scale · S3 · Compliance certifications

---

# 26. MVP Definition (proposal for PO approval)

### CURRENT MVP (as-built)
Web hospital OS through HMS-24 capabilities + consumer/patient web/mobile basics + billing with DRY_RUN charges.

### REMAINING MVP (to call “MVP complete / production-ready”)
All P0 items + agreed P1 subset (email/SMS stance, mobile freeze, charge POST decision executed, UAT passed). **Excludes** P3 vision unless PO adds them.

**“MVP complete” means:** critical clinical+billing golden paths work in staging; known CRITICAL/HIGH defects closed; charge mode intentional; notifications channels intentional; CI green on primary branch; UAT signed.

---

# 27. MVP Completion Checklist

| Area | Status |
|------|--------|
| Product vision documented | COMPLETE (this doc + SSOT) |
| Patient core | PARTIAL (mobile OK; SMS polish remaining) |
| Hospital admin | PARTIAL (web strong; mobile subset) |
| Clinical OPD/IPD | PARTIAL (logic gaps + UAT) |
| Diagnostics | PARTIAL (web; mobile thin; tests) |
| Pharmacy | PARTIAL (same) |
| Billing/payments | PARTIAL (webhook harden; charge mode) |
| Security/RBAC | PARTIAL (fixes + review) |
| Multi-tenancy | PARTIAL (review/tests) |
| Web | PARTIAL (RoleRoute) |
| Mobile | PARTIAL |
| Testing | PARTIAL |
| Integrations | PARTIAL |
| Reporting/analytics clinical ops | PARTIAL |
| Notifications | PARTIAL / STUB channels |
| Deployment/IaC | PARTIAL / NOT IMPLEMENTED k8s/tf |
| Monitoring/backup/DR | UNKNOWN / NOT DOCUMENTED as complete |
| UAT | REMAINING |

---

# 28. Product Roadmap (phases)

| Phase | Name | Focus |
|-------|------|-------|
| 0 | Audit & Stabilization | P0 defects, release hygiene, PO decisions |
| 1 | Core MVP Completion | Charges, payments, notifications stance, UAT |
| 2 | Clinical Hardening | ED/ICU/Nursing depth as agreed; golden paths |
| 3 | Diagnostics & Pharmacy polish | Mobile/worklist depth if in scope |
| 4 | Revenue & Ops polish | Insurance/inventory UAT; charge POST live |
| 5 | Mobile Completion | Only if PO includes |
| 6 | Production Hardening & UAT | Security review, monitoring, go-live |
| 7 | Future Platform | Vision modules |

---

# 29–34. Estimation, Capacity, Timeline

### Methodology
Bottom-up from remaining work packages (§25) + QA + rework contingency. **Not** based on LOC.

### Assumptions
| Assumption | Value |
|------------|-------|
| Working days/week | 5 |
| Hours/day | 8 |
| Team size | UNKNOWN — scenarios below |
| PO availability | Assumed responsive for decisions within 3 business days |
| Staging environment | Assumed available; else +10–20 pd |
| Absolute calendar start | UNKNOWN |
| Contingency | ~20% in conservative |

### Person-day ranges (Scenario B — Complete defined MVP)

| Package | Optimistic | Expected | Conservative |
|---------|------------:|----------:|-------------:|
| Release/CI hygiene | 3 | 5 | 8 |
| Payment webhook + payment tests | 3 | 5 | 8 |
| BED_RELEASED + facility verify | 1 | 2 | 4 |
| RoleRoute + authz smoke | 1 | 2 | 3 |
| Charge POST cutover + finance UI verify | 5 | 10 | 18 |
| Notifications/email/SMS stance implementation | 5 | 12 | 25 |
| Redis/security hardening pass | 3 | 6 | 12 |
| Mobile scope (none beyond freeze) | 0 | 2 | 5 |
| Mobile My Work (if included) | 15 | 25 | 40 |
| Golden path QA + UAT support | 10 | 18 | 28 |
| Bug bash / rework buffer | 8 | 15 | 25 |
| **Subtotal** | **54** | **102** | **176** |
| + Contingency ~15–20% | → | → | → |
| **Total Scenario B** | **~95** | **~140** | **~200** |

Scenario A (stabilize only): **~35–70 pd** expected ~50.  
Scenario C (full vision): **UNKNOWN / multi-quarter** — do not quote a single end date.

### Team capacity → calendar (Scenario B expected ~140 pd)

| Scenario | Approx FTE | Parallel factor | Calendar (expected) |
|----------|------------|-----------------|---------------------|
| A Small | 4 | 0.6 effective | ~14–20 weeks |
| B Medium | 7–8 | 0.7 | ~8–12 weeks |
| C Larger | 10+ | 0.75 | ~6–9 weeks |

### Delivery timeline table (Scenario B expected)

| Phase | Scope | Person-Days | Calendar (medium team) | Dependency | Deliverable |
|-------|-------|------------:|------------------------|------------|-------------|
| 0 | Stabilize P0 | 25–40 | 2–4 weeks | PO decisions | Safe staging |
| 1 | MVP completion | 50–80 | 4–6 weeks | Phase 0 | MVP checklist green |
| 6 | Prod harden + UAT | 20–40 | 2–3 weeks | Phase 1 | Go-live ready |
| **Total** | | **~95–160** | **~8–12 weeks** | | |

Optimistic/conservative widen to ~6–16 weeks medium team.

---

# 33. Three Delivery Scenarios

### SCENARIO A — Stabilize current system
P0 fixes + security edges + CI/release + limited UAT.  
**Effort:** ~35–70 pd · **Outcome:** safer as-is system, not “feature complete.”

### SCENARIO B — Complete defined MVP
Scenario A + charge/notifications decisions executed + broader UAT + optional limited mobile.  
**Effort:** ~95–200 pd · **Outcome:** production-ready agreed MVP.

### SCENARIO C — Full Health360 vision
Adds ecosystem modules.  
**Effort:** multi-phase; **timeline UNKNOWN** without scoped backlog.

---

# 35. Risks

| Risk | Impact | Likelihood | Mitigation | Owner | Status |
|------|--------|------------|------------|-------|--------|
| DRY_RUN mistaken for live charging | High | Medium | Explicit POST decision + dashboards | PO + Eng | OPEN |
| Payment webhook integrity | High | Medium | DEF-01 fix | Eng | OPEN |
| Mobile expectations | Medium | High | Written mobile MVP scope | PO | OPEN |
| Uncommitted / CI mismatch | High | High | W-P0-01 | Eng | OPEN |
| PHI without classification | High | Medium | W-P1-06 | Sec/PO | OPEN |
| Stub email/SMS in “prod” | Medium | Medium | Label or implement | PO | OPEN |
| Scope creep (vision into MVP) | High | Medium | Freeze MVP in writing | PO | OPEN |

---

# 36. Dependencies

Internal: Event reactor, IPD beds, encounter hub, feature flags.  
External: Razorpay, optional MSG91, Expo, Postgres hosting, (future SMTP).  
Process: PO decisions §37, staging env, UAT users/data.  
Compliance: **UNKNOWN requirements** until PO states market/regulatory target.

---

# 37. Product Owner Decisions Required

| Decision ID | Topic | Current | Question | Options | Impact |
|-------------|-------|---------|----------|---------|--------|
| DEC-01 | MVP boundary | Implicit as-built | What is in/out of MVP complete? | Approve §26 / amend | Timeline |
| DEC-02 | Charge mode | DRY_RUN | Go POST in staging/prod when? | Stay DRY_RUN / POST now / phased | Revenue |
| DEC-03 | Mobile scope | Partial | MVP = patient/doctor/reception only? Add My Work? | Freeze A/B/C | Cost 0–40 pd |
| DEC-04 | Notifications | Stub email | Require real email/SMS for MVP? | Dev-only label / implement | Cost/risk |
| DEC-05 | Telemedicine | Flag only | Sell as feature or hide? | Hide / build / partner | Product honesty |
| DEC-06 | Redis in prod | Often off | Require Redis for token blacklist? | Yes / No+accept risk | Security |
| DEC-07 | Vision modules | Not started | Any in next 2 quarters? | None / shortlist | Roadmap |
| DEC-08 | Naming | Confusing eras | Adopt Foundation/HMS/V2/Vision labels? | Yes | Comms |
| DEC-09 | CI branch | master vs main | Official branch name? | Align workflows | Delivery |
| DEC-10 | Go-live target | UNKNOWN | Target month for Scenario B? | Set date after team known | Planning |

**Do not decide in engineering without PO.**

---

# 38. Next Milestone — M1 Stabilize & Decide

**Objective:** Make the current system safe to plan a production MVP cut; remove CRITICAL integrity issues; lock decisions.

**Includes:** W-P0-01…04 · draft charge/mobile/notification decisions · payment webhook fix · BED_RELEASED · RoleRoute · CI/branch · UAT script draft for OPD+IPD+Billing

**Excludes:** Vision modules · Full mobile ops · Charge POST go-live unless DEC-02 says so

**Acceptance criteria:**
- Critical DEF-01…03 fixed or explicitly waived in writing  
- CI runs on agreed branch  
- V2 code on a releasable branch/commit set  
- DEC-01…04 answered  
- Golden-path test script executed once on staging (pass/fail logged)

**Expected outcome:** Clear Scenario B plan with dated staffing.

---

# 39. Success Criteria (M1)

| Criterion | Measure |
|-----------|---------|
| Critical money path safer | Webhook tests pass |
| Event consistency | BED_RELEASED published or removed |
| Authz edge closed | RoleRoute test |
| Decisions locked | DEC-01…04 recorded |
| Delivery hygiene | CI green on primary branch |

---

# 40. Product Owner Meeting View (≈5 minutes)

## 1. What we are building
A multi-tenant **hospital OS + patient app** connecting care → diagnostics → pharmacy → billing → operations.

## 2. What we have built
HMS-0…24 on **API + Web** (V103, 58 controllers, 29 schemas, 12 portals). Mobile partial.

## 3. What is working
OPD, IPD core, pharmacy dispense, invoices, Razorpay (with caveats), automation/My Work, many ops modules on web.

## 4. What is partially working
Charges (DRY_RUN), notifications, MFA, nursing, mobile ops, insurance depth UAT, telemedicine flag.

## 5. What needs correction
Payment webhook · BED_RELEASED · RoleRoute · charge observability · CI/release hygiene.

## 6. What remains
P0/P1 package (~95–200 pd for defined MVP) + PO scope decisions. Vision modules not started.

## 7. How much work remains
**Expected ~140 person-days** for Scenario B (range 95–200).

## 8. Estimated timeline
**~8–12 weeks** with a medium team; **~14–20 weeks** small team. Absolute dates UNKNOWN.

## 9. Major risks
Silent charging · payment integrity · mobile expectations · ship hygiene · PHI review gap.

## 10. Product Owner decisions
MVP boundary · Charge POST · Mobile scope · Email/SMS · Telemedicine honesty · Redis · Go-live window.

## 11. Next milestone
**M1 Stabilize & Decide (2–4 weeks):** fix critical defects, lock decisions, releasable baseline.

---

# Appendix A — Evidence anchors

| Claim | Evidence |
|-------|----------|
| V103 / 103 migrations | `db/migration/V*.sql` |
| 58 controllers | `*Controller.java` count |
| 29 schemas | Flyway `CREATE SCHEMA` |
| Checkout gate | `EncounterCheckoutGateService` |
| Admit/discharge/pharmacy/charges/reactor/webhook | packages under `ipd`, `pharmacy`, `billing`, `automation` |
| Feature inventory baseline | `docs/ssot/FEATURE-INVENTORY.md` |
| Conflicts | `docs/ssot/REQUIREMENT-CONFLICT-REGISTER.md` |

---

# Appendix B — Document control

This is the **only** Product Owner master plan file. Engineering detail remains in other `docs/ssot/*` files. Update this file when MVP definition, estimates, or critical findings change.
