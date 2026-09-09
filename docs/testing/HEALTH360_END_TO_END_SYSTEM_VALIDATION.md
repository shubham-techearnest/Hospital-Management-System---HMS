# Health360 End-to-End System Validation (Master)

| Document ID | H360-E2E-VAL-001 |
| Version | 1.0 |
| Date | 2026-09-09 |
| Status | READY FOR EXECUTION (not yet executed) |
| Scope | Manual QA of **implemented** Health360 web + API |
| Prerequisite | [Readiness gate PASSED](../readiness/HEALTH360_PRE_TESTING_READINESS_REPORT.md) — 84% E2E ready |
| Rule | Do **not** mark PASS until the step is actually executed. Do **not** invent features. |

---

## 1. Purpose

Operate Health360 like a real hospital on a **fresh** test hospital, validate all developed modules and integrations, log bugs, fix blockers, retest, and establish a stable baseline before further feature development.

Cycle: **BUILD → TEST → FIND ERROR → FIX → RETEST → VALIDATE → DOCUMENT → CONTINUE DEVELOPMENT**

---

## 2. Scope

### In scope

Platform admin hospital create · hospital config · staff/RBAC · doctors/schedules · patient self + desk registration · UHID · appointments · OPD · queue · consultation · prescription · lab · pharmacy · OPD/IPD billing · IPD admit/bed/nursing/chart · transfer · discharge · patient portal · security/tenant isolation · negative/edge cases.

### Out of scope (defer / note only)

Native mobile nursing charting · real SMTP/SMS · PACS/LIS · TPA EDI · discharge PDF · blood bank fulfillment · roles not seeded (Cashier, Ward Manager, TPA) · major new features unless a designed workflow is blocked.

### Supporting documents

| File | Purpose |
|------|---------|
| **[HEALTH360_STORY_BASED_MANUAL_TEST_SCRIPT.md](./HEALTH360_STORY_BASED_MANUAL_TEST_SCRIPT.md)** | **Start here for story-style UAT** (S0 + index) |
| [STORY_01_OPD_RAHUL_SHARMA.md](./STORY_01_OPD_RAHUL_SHARMA.md) | Patient 1 OPD story — step checks + expected outcomes |
| [STORY_02_LAB_PHARMACY_PRIYA_PATIL.md](./STORY_02_LAB_PHARMACY_PRIYA_PATIL.md) | Patient 2 lab + pharmacy + billing story |
| [STORY_03_IPD_AMIT_KULKARNI.md](./STORY_03_IPD_AMIT_KULKARNI.md) | Patient 3 IPD story |
| [STORY_04_RBAC_AND_SECURITY.md](./STORY_04_RBAC_AND_SECURITY.md) | RBAC / isolation story |
| [TEST_DATA.md](./TEST_DATA.md) | Hospital, patients, medicines, lab panels |
| [TEST_USERS.md](./TEST_USERS.md) | Staff + patient credentials |
| [RBAC_MATRIX.md](./RBAC_MATRIX.md) | Role access matrix |
| [API_TEST_MATRIX.md](./API_TEST_MATRIX.md) | Endpoint validation |
| [BUG_TRACKER.md](./BUG_TRACKER.md) | Bug log |
| [REGRESSION_CHECKLIST.md](./REGRESSION_CHECKLIST.md) | Post-fix regression |
| [TEST_EXECUTION_SUMMARY.md](./TEST_EXECUTION_SUMMARY.md) | Module rollup |
| [REQUIREMENT_TRACEABILITY_MATRIX.md](./REQUIREMENT_TRACEABILITY_MATRIX.md) | RTM |

---

## 3. CURRENT IMPLEMENTATION INVENTORY

Status values: **IMPLEMENTED** · **PARTIALLY IMPLEMENTED** · **UI ONLY** · **BACKEND ONLY** · **NOT CONNECTED** · **PLACEHOLDER** · **BROKEN** · **NOT IMPLEMENTED** · **UNKNOWN**

| Module | Sub-area | Status | Evidence / notes |
|--------|----------|--------|------------------|
| Platform | Admin hospital create/activate | IMPLEMENTED | `AdminHospitalController`, `/admin/hospitals` |
| Platform | Multi-tenant productization | PARTIALLY IMPLEMENTED | `tenantId` present; single-tenant ops typical |
| Auth | Login email **or** mobile + JWT/refresh | IMPLEMENTED | `AuthenticationService`, `/api/v1/auth` |
| Auth | Password reset / email verify | PARTIALLY IMPLEMENTED | Works in code; email **log-only** locally |
| RBAC | Seeded roles | IMPLEMENTED | See §3.1 |
| RBAC | Cashier / Ward Manager / TPA / Billing Exec | NOT IMPLEMENTED | Use HOSPITAL_ADMIN / RECEPTIONIST proxies |
| Hospital | Profile, depts, staff, doctors | IMPLEMENTED | `/hospital/*` |
| Hospital | Schedules / slots | IMPLEMENTED | Scheduling module |
| Hospital | IPD services / FEATURE_IPD | IMPLEMENTED | V79, `/hospital/ipd-services` |
| Hospital | Ward/room/bed | IMPLEMENTED | Facilities + IPD |
| Patient | Self-reg + UHID | IMPLEMENTED | `/register` |
| Patient | Desk register + credentials | IMPLEMENTED | Stub email internal; login via mobile |
| Patient | Search / soft duplicates | PARTIALLY IMPLEMENTED | Hard merge limited |
| Appointments | Book/cancel/reschedule/arrive | IMPLEMENTED | Statuses §3.2 |
| OPD | Walk-in + appointment-linked | IMPLEMENTED | Strongest path |
| Queue | Call/skip/recall/no-show | IMPLEMENTED | `QueueEntryStatus` |
| Consultation | Vitals/notes/Dx/Rx | IMPLEMENTED | Doctor OPD |
| Prescription | Sign + pharmacy share | IMPLEMENTED | `PrescriptionStatus` |
| Lab | Order→collect→result→release | IMPLEMENTED | Statuses §3.2 |
| Lab → Billing | Auto invoice | NOT CONNECTED | Manual invoice lines (G-001) |
| Pharmacy | Request/dispense/stock | IMPLEMENTED | `PharmacyRequestStatus` |
| Pharmacy → Billing | Auto invoice | NOT CONNECTED | Manual lines (G-002) |
| Billing | OPD checkout + IPD charges | PARTIALLY IMPLEMENTED | Auto lab/pharm missing |
| IPD | Request→admit→bed→chart→discharge | PARTIALLY IMPLEMENTED | Code complete; UAT required |
| IPD | Blood/transfusion | PLACEHOLDER | Stub UI |
| Discharge | Clearances / summary / bed release | PARTIALLY IMPLEMENTED | PDF deferred |
| Nursing | Ward board / vitals / MAR via IPD+clinical | IMPLEMENTED | No `/api/v1/nursing` prefix |
| Patient portal | OPD/Rx/lab/IPD/payments | IMPLEMENTED | `/patient/*` |
| Notifications | In-app | PARTIALLY IMPLEMENTED | |
| Notifications | Email/SMS | PLACEHOLDER | Local gateways |
| Radiology / OT | Modules exist | PARTIALLY IMPLEMENTED | Optional for this E2E |
| Mobile app | RN nursing | NOT IMPLEMENTED | Deferred |
| Audit | Admin audit logs | PARTIALLY IMPLEMENTED | Not every clinical write |

### 3.1 Seeded roles (actual)

`PLATFORM_ADMIN` · `HOSPITAL_ADMIN` · `DOCTOR` · `PATIENT` · `RECEPTIONIST` · `NURSE` · `ICU_NURSE` · `LAB_TECHNICIAN` · `PHARMACIST` · `RADIOLOGY_TECHNICIAN` · `OT_COORDINATOR`

### 3.2 Actual status vocabularies (use these — not invented names)

| Domain | Statuses |
|--------|----------|
| Appointment | `PENDING`, `CONFIRMED`, `ARRIVED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `RESCHEDULED`, `POSTPONED` |
| Slot | `AVAILABLE`, `BOOKED`, `BLOCKED` |
| Queue | `WAITING`, `CALLED`, `IN_SERVICE`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `SKIPPED` |
| Encounter | `REGISTERED`, `WAITING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| Lab order | `RECEIVED`, `SAMPLE_COLLECTED`, `RESULTS_DRAFT`, `VERIFIED`, `RELEASED`, `CANCELLED` |
| Lab result | `DRAFT`, `VERIFIED` |
| Prescription | `DRAFT`, `SIGNED`, `CANCELLED` |
| Med order | `RECEIVED`, `VERIFIED`, `ACTIVE`, `COMPLETED`, `CANCELLED` |
| Pharmacy request | `REQUESTED`, `RECEIVED`, `UNDER_REVIEW`, `PARTIALLY_AVAILABLE`, `AVAILABLE`, `READY`, `DISPENSED`, `CANCELLED` |
| Admission request | `REQUESTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `SCHEDULED`, `CANCELLED`, `ADMITTED` |
| Admission | `ADMITTED`, `DISCHARGED`, `TRANSFERRED`, `TRANSFERRED_OUT`, `LAMA`, `DAMA`, `DECEASED`, `ABSCONDED`, `CANCELLED`, `FOLLOW_UP`, `CLOSED` |
| Bed | `AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`, `MAINTENANCE`, `BLOCKED` |
| Discharge clearance | `PENDING`, `CLEARED`, `WAIVED`, `BLOCKED` |
| Invoice | `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `CANCELLED` |
| Payment | `PENDING`, `CAPTURED`, `FAILED`, `REFUNDED` |

### 3.3 API prefixes (actual)

`/api/v1/auth` · `/api/v1/admin/hospitals` · `/api/v1/hospital/patients` · `/api/v1/scheduling` · `/api/v1/opd` · `/api/v1/lab` · `/api/v1/pharmacy` · `/api/v1/billing` · `/api/v1/ipd` · `/api/v1/clinical` · `/api/v1/hospitals/me/ipd-services`

Nursing FE uses IPD + clinical APIs (no dedicated nursing controller prefix).

---

## 4. Test Environment

| Item | Value |
|------|-------|
| Hospital name | **Health360 Test Multispeciality Hospital** |
| Hospital code / reg # | **H360-TEST-001** (use as registration number if UI has no separate “code”) |
| Isolation hospital | **Health360 Test Hospital B** (tenant isolation only) |
| Mode | Manual QA / Integration |
| Data rule | No production data; create via UI/API only |
| DB | Fresh or dedicated QA schema; Flyway through **V87** |
| API | Restart after migrate; re-login for JWT perms |
| Email | Expect **log-only** locally — copy tokens from API logs if needed |
| Gap flag | Manual DB insert = **SYSTEM GAP — APPLICATION WORKFLOW MISSING** |

### Pre-flight (PHASE 1)

- [ ] Backend healthy (`/actuator/health` or health endpoint)
- [ ] Frontend loads
- [ ] Flyway V87 applied
- [ ] Platform admin can log in
- [ ] No reliance on seed hospital as the primary test hospital

---

## 5. Test Data

Canonical data: [TEST_DATA.md](./TEST_DATA.md).

---

## 6. Roles & Users

Canonical accounts: [TEST_USERS.md](./TEST_USERS.md).  
RBAC matrix: [RBAC_MATRIX.md](./RBAC_MATRIX.md).

**Role mapping for missing IAM roles:**

| Requested title | Actual role to create | Note |
|-----------------|----------------------|------|
| Hospital Super Admin / Hospital Admin | `HOSPITAL_ADMIN` | One primary + optional second |
| Billing Executive / Cashier | `HOSPITAL_ADMIN` or `RECEPTIONIST` | RECEPTIONIST has billing perms (V49) |
| IPD Admission Executive | `RECEPTIONIST` + hospital IPD access | Admission request perms V80 |
| Ward Manager | `HOSPITAL_ADMIN` or `NURSE` | **NOT IMPLEMENTED** as distinct role |
| Medical Records / Support / Insurance | Skip or HOSPITAL_ADMIN | **NOT IMPLEMENTED** |
| OT / Radiology | `OT_COORDINATOR` / `RADIOLOGY_TECHNICIAN` | Optional Phase |

---

## 7. Hospital Setup (PHASE 2)

### TC-HOSP-001 — Create hospital

| Field | Value |
|-------|-------|
| Role | `PLATFORM_ADMIN` |
| UI | `/admin/hospitals` |
| API | `POST /api/v1/admin/hospitals` |
| Steps | Create hospital name **Health360 Test Multispeciality Hospital**, registration **H360-TEST-001**, type Multispeciality, admin email/name/phone, plan `FREE` (or available plan) |
| Expected | Hospital created; hospital admin user created (`HOSPITAL_ADMIN`); invite/verify flow |
| Actual / Status | _TBD_ |

### TC-HOSP-002 — Activate hospital admin

Verify email (log token if needed) → login as hospital admin → `/hospital` portal opens.

### TC-HOSP-003 — Configure profile

Address, contacts, hours, logo/gallery if UI supports → Save → Reload.

### TC-HOSP-004 — Departments

Create at least: General Medicine, Orthopedics, Cardiology, Laboratory, Pharmacy, IPD/Nursing.

### TC-HOSP-005 — Doctors + schedules

Map Doctor 1/2/3; create future slots for General Medicine doctor (Patient 1 booking).

### TC-HOSP-006 — OPD / catalogs / services

Configure OPD-related catalogs/services used by desk.

### TC-HOSP-007 — IPD services + FEATURE_IPD

`/hospital/ipd-services` — enable IPD feature/services needed for admit.

### TC-HOSP-008 — Wards & beds

Create: General Ward, Semi-Private, Private, ICU — multiple beds each; statuses start `AVAILABLE`.

### TC-HOSP-009 — Lab catalog

CBC, Blood Sugar (FBS/RBS), Lipid Profile — with prices if supported.

### TC-HOSP-010 — Pharmacy catalog + stock

Paracetamol, Amoxicillin, Pantoprazole, Vitamin D, Metformin — batch, expiry, qty, reorder.

### TC-HOSP-011 — Public availability

As patient, search/find hospital in patient search.

### TC-HOSP-012 — Hospital B isolation

Create Hospital B; confirm Hospital A staff cannot see B patients/beds/invoices (PHASE 14).

---

## 8. Staff & RBAC (PHASE 3)

Create all users in [TEST_USERS.md](./TEST_USERS.md) via Staff UI.  
Execute [RBAC_MATRIX.md](./RBAC_MATRIX.md) allow/deny checks.  
**Stop** on BLOCKER if hospital admin cannot create staff or assign roles.

---

## 9. Patient Setup (PHASE 4)

| ID | Name | Mobile | Path |
|----|------|--------|------|
| P1 | Rahul Sharma | 9000000001 | Self-register `/register` |
| P2 | Priya Patil | 9000000002 | Desk register (no prior account) |
| P3 | Amit Kulkarni | 9000000003 | Self-reg first, then hospital association / OPD then IPD |

### Rules to verify

- User may become patient.
- Patient **must** have user account (desk creates user + patient).
- UHID generated and unique (tenant-global per current DEC-001).
- P2 login: **mobile + temporary password** (do not use stub `@patient.health360.local` as login email).

### Search / duplicate cases (TC-PAT-SEARCH-*)

Exact/partial mobile, name, DOB, UHID, email; trim spaces; case-insensitive; duplicate mobile/email/UHID/name+DOB — record **exact** product behavior.

---

## 10. Patient 1 — OPD Journey (PHASE 5–6)

**Journey ID:** J1-OPD

```
P1 login → search hospital → General Medicine → Doctor 1 → slot → book
→ appointment on patient + reception lists
→ reception ARRIVED / check-in → OPD visit → queue token
→ doctor CALLED/IN_SERVICE → consult (vitals, Dx, notes, Rx, advice, follow-up)
→ COMPLETED → patient sees history + Rx + follow-up
```

### Status checkpoints

| Step | Expected statuses |
|------|-------------------|
| Booked | Appointment `PENDING`/`CONFIRMED` |
| Arrived | Appointment `ARRIVED` |
| In queue | Queue `WAITING` → `CALLED` → `IN_SERVICE` |
| Encounter | `REGISTERED`/`WAITING` → `IN_PROGRESS` → `COMPLETED` |
| Rx | `SIGNED` |

### Cancellation / no-show subset

Separate TCs: cancel, no-show, skip, recall — use actual queue statuses.

Record Actual Result per TC in execution log; file bugs in [BUG_TRACKER.md](./BUG_TRACKER.md).

---

## 11. Lab Journey (PHASE 7) — Patient 2 path

**Journey ID:** J2-LAB (subset of Patient 2)

```
Desk register P2 → walk-in OPD → queue → consult
→ order CBC, Blood Sugar, Lipid Profile
→ Lab: RECEIVED → SAMPLE_COLLECTED → RESULTS_DRAFT → VERIFIED → RELEASED
→ Doctor + Patient (if supported) see results
```

Negative: wrong patient, cancel order, modify after verify (expect deny or audit).

---

## 12. Pharmacy Journey (PHASE 8) — Patient 2 path

**Journey ID:** J2-RX

```
Doctor signs Rx → Pharmacy request visible
→ stock check → dispense → inventory ↓
→ request DISPENSED
```

Also: insufficient stock, expired batch, partial dispense (`PARTIALLY_AVAILABLE`), duplicate dispense.

**Billing note:** after dispense, create **manual** invoice lines if auto-bill absent — mark PARTIAL if only consultation fee bills automatically.

---

## 13. Patient 2 — Full cross-module (PHASE 7–9)

**Journey ID:** J2-FULL

Complete §11 + §12 + OPD checkout billing (`/reception/checkout/:encounterId` or hospital billing).

Integrations checklist:

| Link | Expected | Actual |
|------|----------|--------|
| Doctor → Lab | Connected | _TBD_ |
| Lab → Doctor | Connected | _TBD_ |
| Lab → Patient | Connected if portal reports | _TBD_ |
| Doctor → Pharmacy | Connected | _TBD_ |
| Pharmacy → Inventory | Connected | _TBD_ |
| Pharmacy → Billing | **NOT CONNECTED** (manual) | _TBD_ |
| OPD → Billing | Connected | _TBD_ |

---

## 14. IPD Journey — Patient 3 (PHASE 10–12)

**Journey ID:** J3-IPD

```
P3 OPD/consult → doctor admission request (REQUESTED)
→ desk APPROVED/ADMITTED → ward/room/bed → bed OCCUPIED
→ nursing vitals/notes/MAR → doctor progress notes
→ IPD lab + pharmacy supply → charges / deposits
→ bed transfer (old AVAILABLE/CLEANING, new OCCUPIED)
→ discharge advice → clearances PENDING→CLEARED
→ final bill → discharge → admission DISCHARGED/FOLLOW_UP/CLOSED
→ bed released → patient portal IPD history
```

Known stubs: blood bank UI; discharge PDF may be missing — mark **NOT IMPLEMENTED** / **PARTIAL**, not FAIL unless UI claims they work.

---

## 15. Ward / Bed / Nursing (PHASE 11)

- Bed statuses transitions on reserve, admit, transfer, discharge, cleaning.
- Concurrent assign same bed → expect conflict (409 or business error).
- Nurse: access assigned ward patients; cannot hospital-admin configure; cannot forge doctor diagnosis if restricted.

---

## 16. Billing (PHASE 9 + IPD billing)

OPD: consultation (+ manual lab/pharm lines).  
IPD: admission/room/service charges, deposits, interim, final settlement.  
Statuses: invoice `DRAFT`→`ISSUED`→`PARTIALLY_PAID`/`PAID`.  
Check no duplicate encounter fees; refunds if UI supports.

---

## 17. Appointments & Queue extras (PHASE 5–6)

Double book same slot · past date · doctor leave/block · reschedule · multi-doctor queues · token uniqueness.

---

## 18. Doctor module

Profile, fees, schedule, OPD queue, Rx, lab orders, IPD chart access, discharge recommendation — hospital-scoped only.

---

## 19. Patient Portal (PHASE 13)

P1/P2/P3: profile, UHID, appointments, OPD, Rx, lab, bills, IPD/discharge.  
**IDOR:** Patient A URL/ID → Patient B record → expect 403/404.

---

## 20. Notifications (optional)

Document channel: in-app vs email log vs SMS stub. Do not FAIL UAT solely for missing external SMS/SMTP.

---

## 21. Security & Tenant Isolation (PHASE 14)

| Attack | Expected |
|--------|----------|
| Wrong password | 401 |
| Expired/invalid token | 401 |
| Receptionist → platform admin API | 403 |
| Pharmacist → admit/admin config | 403 |
| Hospital A → Hospital B patient | 403/404 |
| Patient A → Patient B | 403/404 |

Record HTTP codes in [API_TEST_MATRIX.md](./API_TEST_MATRIX.md).

---

## 22. Negative & Edge (PHASE 15)

Invalid email/DOB · negative stock · expired dispense · occupy occupied bed · discharge without admit · double submit · concurrent slot/bed/last-unit stock · refresh/back button · large text / special chars.

---

## 23. API Validation

Execute and fill [API_TEST_MATRIX.md](./API_TEST_MATRIX.md).

---

## 24. Database Validation

For each major transaction, spot-check DB (or API GET consistency):

- One user / one patient / unique UHID  
- Correct `tenant_id` / `hospital_id`  
- Appointment ↔ encounter ↔ queue links  
- Lab/Rx/pharmacy/admission/bed/invoice FKs  
- No orphan beds OCCUPIED without admission  
- Soft-delete consistency  

---

## 25. Audit Log

Where admin audit UI exists: create/update patient, book/cancel, prescribe, lab verify, admit, bed change, discharge, billing — who/when/what. Mark PARTIAL if missing.

---

## 26. UI/UX Validation

Per major page: layout, responsive, loading/empty/error, validation, toasts, nav consistency. Log MEDIUM/LOW bugs — do not block clinical PASS unless unusable.

---

## 27. Bug format

Use [BUG_TRACKER.md](./BUG_TRACKER.md) template (BUG-xxx).

---

## 28. Test case format

```
TC-ID | Module | Scenario | Preconditions | Role | Data | Steps |
Expected | Actual | Status (PASS/FAIL/BLOCKED/NOT IMPLEMENTED/PARTIAL) | Bug ID | Remarks
```

Append executed cases to [TEST_EXECUTION_SUMMARY.md](./TEST_EXECUTION_SUMMARY.md) or a spreadsheet linked from there.

---

## 29. Execution phases (order)

| Phase | Name | Gate |
|-------|------|------|
| 1 | Environment baseline | Health + migrate |
| 2 | Hospital create & config | Admin can open portal |
| 3 | Staff & RBAC | Staff login works |
| 4 | Patient registration | UHID + login |
| 5 | Appointments | Book works |
| 6 | OPD + Queue + Consult | J1 complete |
| 7 | Lab | J2 lab |
| 8 | Pharmacy | J2 Rx |
| 9 | Billing | Invoice settle (manual lines OK) |
| 10 | IPD admission | Admit + bed |
| 11 | Ward/Bed/Nursing | Care documented |
| 12 | Discharge | Bed free + portal |
| 13 | Patient portal | No IDOR |
| 14 | Security / isolation | Hospital B |
| 15 | Negative / edge | Concurrency |
| 16 | Regression | [REGRESSION_CHECKLIST.md](./REGRESSION_CHECKLIST.md) |
| 17 | Final readiness | §34 report section |

**Do not advance past a BLOCKER** that stops the current journey.

---

## 30. Fixing rule

Reproduce → smallest safe fix → migration if needed → retest failed TC + related regression → update bug → only then RESOLVED.

No drive-by refactors. No major new features unless workflow blocked.

---

## 31. Traceability

[REQUIREMENT_TRACEABILITY_MATRIX.md](./REQUIREMENT_TRACEABILITY_MATRIX.md)

---

## 32. Final System Validation Report (fill after execution)

### Executive Summary

_TBD after PHASE 17_

### Modules — Fully / Partially / Broken / Not Implemented

_TBD_

### Critical bugs / Security / Data / RBAC / Perf / UI / Integration

_TBD_ → link BUG_TRACKER

### Scores (post-execution)

| Area | % |
|------|--:|
| OPD Readiness | _TBD_ |
| IPD Readiness | _TBD_ |
| Hospital Admin | _TBD_ |
| Patient Portal | _TBD_ |
| Pharmacy | _TBD_ |
| Lab | _TBD_ |
| Security | _TBD_ |
| Overall Stability | _TBD_ |
| Overall Production Readiness | _TBD_ |

### Final recommendation (choose one)

- READY FOR NEXT DEVELOPMENT PHASE  
- READY WITH MINOR FIXES  
- MAJOR FIXES REQUIRED BEFORE DEVELOPMENT  
- SYSTEM NOT STABLE ENOUGH TO CONTINUE  

_Pre-execution expectation from readiness gate: system is **testable**; recommendation above is **outcome of this UAT**, not assumed._

---

## 33. Immediate next step for the tester

1. Complete PHASE 1 pre-flight (V87 + restart).  
2. Fill credentials in [TEST_USERS.md](./TEST_USERS.md) as accounts are created.  
3. Execute PHASE 2 hospital create for **H360-TEST-001**.  
4. Log every FAIL in [BUG_TRACKER.md](./BUG_TRACKER.md).  
5. Update [TEST_EXECUTION_SUMMARY.md](./TEST_EXECUTION_SUMMARY.md) after each phase.

**Do not begin large-scale new development until PHASE 17 recommendation is recorded.**
