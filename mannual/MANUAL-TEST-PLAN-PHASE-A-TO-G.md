# Health360 — Manual Test Plan (Phase A → G)

| Attribute | Value |
|-----------|-------|
| **Document ID** | QA-MTP-A-G-001 |
| **Audience** | Manual QA / UAT team |
| **Scope** | All functionality delivered from Phase A start (2026-09-03) through Phase G wave (2026-09-07) |
| **Last Updated** | 2026-09-07 |
| **Companion** | [QA-TEST-CREDENTIALS-AND-FUNCTIONALITY.txt](./QA-TEST-CREDENTIALS-AND-FUNCTIONALITY.txt) |
| **Product plan** | [MODULE-DEVELOPMENT-PLAN.md](../docs/13-project-management/MODULE-DEVELOPMENT-PLAN.md) |

---

## 1. How testers should use this document

1. **Act as the role** named in each section (Patient, Receptionist, Doctor, etc.). Use only that role’s login unless the step says otherwise.
2. For every case, fill the result columns:

   | Result | Meaning |
   |--------|---------|
   | **Pass** | Behaviour matches Expected |
   | **Fail** | Unexpected behaviour / error / wrong data |
   | **Blocked** | Cannot run (env, missing staff user, dependency failed) |
   | **N/A** | Not applicable in this environment (e.g. real Razorpay keys not configured) |

3. Record **Tester**, **Date**, **Build/URL**, and **Defect ID** (if any) in the run log (Section 15).
4. Prefer **local Docker / Vite** first; then re-run critical golden paths on the deployed environment if available.
5. After any backend restart or new Flyway migration (**V73–V76+**), **log out and log in again** so JWT permissions refresh.

### Environments

| Item | Local default | Notes |
|------|---------------|-------|
| Web (Vite) | http://localhost:5173 | Preferred for UI testing |
| Web (Docker) | http://localhost:3000 | Optional |
| API | http://localhost:8080 | Health: `/api/v1/health` |
| Mobile | Expo / emulator | See Section 14 |

### Credentials (quick)

Full list: `mannual/QA-TEST-CREDENTIALS-AND-FUNCTIONALITY.txt`.

| Role | Email | Password |
|------|-------|----------|
| Patient (seeded) | `shubham@gmail.com` | `Kadam@123` |
| Doctor | `siddharth.deshmukh@health360.test` | `SecureP@ss1!` |
| Hospital Admin | `hospital.admin@health360.test` | `SecureP@ss1!` |
| Platform Admin | `platform.admin@health360.test` | `SecureP@ss1!` |
| Reception / Nurse / Lab / Pharmacy / Radiology / OT / ICU Nurse | Invite via Hospital → Staff | Set at invite (use `SecureP@ss1!`) |

**Staff setup (do once before staff sections):**  
Hospital Admin → **Staff** → Invite each role for **Health360 Hospital / Main Campus**.

Suggested emails:

- `reception.test@health360.test` → RECEPTIONIST  
- `nurse.test@health360.test` → NURSE  
- `lab.test@health360.test` → LAB_TECHNICIAN  
- `pharmacy.test@health360.test` → PHARMACIST  
- `radiology.test@health360.test` → RADIOLOGY_TECHNICIAN  
- `ot.test@health360.test` → OT_COORDINATOR  
- `icu.nurse.test@health360.test` → ICU_NURSE  

Reference IDs (dev): Hospital `…000030`, Branch Main Campus `…000031`.

---

## 2. Coverage map (what this plan includes)

| Phase | Status | Tester focus |
|-------|--------|--------------|
| **A** OPD stabilize | COMPLETE | Golden path, desk Arrive, catalogs, multi-reception |
| **B** Patient + Hospital polish | COMPLETE (code) | Reviews, mobile reception/hospital, catalogs |
| **C** Platform Admin | COMPLETE (code) | Hospitals, plans, verify, reviews, audit |
| **D** IPD depth | COMPLETE | Admit → rounds → nursing → discharge → bill |
| **E** Staff portals | COMPLETE | Lab / Rad / Pharmacy / OT / Nursing / Doctor depth |
| **F** Payments & SaaS | COMPLETE (code) | Desk pay methods; patient online pay; SaaS renew |
| **G** Advanced (partial) | IN PROGRESS | QR check-in, OPD approaching, pharmacy stock API, OT implants, partners, ops trend, forgot password |

### Explicitly out of scope for this wave (do not Fail)

- SMS / WhatsApp **live** needs MSG91 keys (`SMS_PROVIDER=msg91` + `SMS_AUTH_KEY`) — HTTP path is implemented  
- PACS / DICOM (G4), LIS (G5) — deferred on hospital contracts  
- TV / display board (G11)  
- Real Razorpay live keys (sandbox / blank keys is OK)

---

## 3. Cross-cutting smoke (any tester, start of day)

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| XC-01 | Open web app URL | Login / landing loads without blank screen | |
| XC-02 | `GET /api/v1/health` (or browser Network on login) | API healthy / reachable | |
| XC-03 | Login as Hospital Admin, then logout | Session ends; protected routes redirect to login | |
| XC-04 | Login as Patient with wrong password | Clear error; no crash | |
| XC-05 | Open `/forgot-password` | Form loads; no auth required | |

---

## 4. Auth & account — act as Guest / any user

**URLs:** `/login`, `/register`, `/forgot-password`, `/reset-password`

| ID | Role | Steps | Expected | Result |
|----|------|-------|----------|--------|
| AUTH-01 | Guest | Register new **Patient** with unique email | Account created; can log in | |
| AUTH-02 | Guest | Register **Doctor** (if offered) | Account created; may need verification | |
| AUTH-03 | Guest | Login seeded patient `shubham@gmail.com` | Lands on patient portal | |
| AUTH-04 | Guest | Login hospital admin | Lands on `/hospital/...` | |
| AUTH-05 | Guest | Login platform admin | Lands on `/admin/...` | |
| AUTH-06 | Guest | Login → wrong role URL (e. of patient opening `/admin`) | Denied / redirected | |
| AUTH-07 | Guest | **Forgot password**: enter known email → submit | Success message (no email leak); reset mail logged or sent (local may use console / LocalEmail) | |
| AUTH-08 | Guest | Open reset link / `/reset-password?token=…` with valid token | Can set new password; old password fails; new works | |
| AUTH-09 | Guest | Reset with expired/invalid token | Clear error | |
| AUTH-10 | Any | Logged-in → Settings → change password | New password works next login | |
| AUTH-11 | Any | Account settings → Set up authenticator → enter TOTP → Enable | MFA enabled; backup codes shown once | |
| AUTH-12 | Any | Logout → login with password | Prompted for MFA code; valid code completes login | |
| AUTH-13 | Any | Login MFA with backup code | Login succeeds; that backup code cannot be reused | |
| AUTH-14 | Any | Account settings → Disable MFA (password + code) | MFA off; next login skips MFA | |

**Notes for AUTH-07/08:** In local/dev, check API logs or local email service for the reset link if inbox is not configured.

---

## 5. Patient portal — act as Patient

**Login:** `shubham@gmail.com` / `Kadam@123`  
**Base:** `/patient/*`

### 5.1 Navigation & profile

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| PAT-01 | Open Dashboard | Overview / health summary loads | |
| PAT-02 | Health Profile | Sections editable / visible (allergies, etc. for seeded user) | |
| PAT-03 | Vitals — add a reading | Saved and listed | |
| PAT-04 | Lab values — add entry | Saved | |
| PAT-05 | Documents — upload PDF/image | Upload succeeds; download works | |
| PAT-06 | Timeline | Events appear chronologically | |
| PAT-07 | Search / Find doctor / Find hospital | Results; open public doctor & hospital profiles | |
| PAT-08 | Public hospital `/hospitals/{id}` without login (incognito) | Profile visible | |
| PAT-09 | Public doctor `/doctors/{id}` without login | Profile visible | |
| PAT-10 | Prescriptions list | Loads (may be empty until consult) | |
| PAT-11 | Payments / invoices list | Loads | |
| PAT-12 | Encounters / visits list | Loads; open detail | |
| PAT-13 | Settings → notification preferences | Toggles save | |

### 5.2 Request OPD (canonical booking)

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| PAT-OPD-01 | **Request OPD** → Health360 Hospital → **Main Campus** → optional doctor → reason → Submit | Success; entry on **My OPD today** | |
| PAT-OPD-02 | My OPD shows status (Waiting / Called / …) | Status matches desk actions | |
| PAT-OPD-03 | After reception Call | Status **Called** (web refresh / poll) | |
| PAT-OPD-04 | After checkout Paid | Billing chip / status shows Paid / completed visit | |
| PAT-OPD-05 | Request OPD UI: hospital + doctor profile panels visible on form | Profiles render beside form | |

### 5.3 Online payment (Phase F)

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| PAT-PAY-01 | Complete OPD with unpaid invoice OR use existing unpaid invoice | Invoice visible under Payments | |
| PAT-PAY-02 | Start **Pay online** / payment intent | Sandbox order created (or Razorpay Checkout if keys set) | |
| PAT-PAY-03 | Confirm sandbox / complete checkout | Invoice becomes Paid / Partially paid; history updated | |

*If keys blank: sandbox mock path is expected — mark Pass if confirm works without real Razorpay UI.*

### 5.4 Appointment QR check-in (Phase G2)

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| PAT-QR-01 | Open an appointment detail that supports check-in | QR / deep link `health360://appointments/{id}/check-in` shown | |
| PAT-QR-02 | Perform web self check-in action if available | Success message; token/status updated if applicable | |
| PAT-QR-03 | (Mobile) Open deep link while logged in | Navigates to appointment check-in flow | |

### 5.5 Reviews (Phase B)

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| PAT-REV-01 | After completed visit with encounter | Can rate doctor / submit review from visit detail | |
| PAT-REV-02 | Review appears on doctor public profile (after moderation if required) | Visible or pending per rules | |

---

## 6. Reception desk — act as Receptionist

**Login:** invited receptionist  
**Base:** `/reception/*`  
**Critical:** Select branch **Main Campus** (must match patient’s OPD request).

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| REC-01 | Dashboard → Queue tab | Live queue loads | |
| REC-02 | Filter **App requests** after patient Request OPD | Patient row with App request badge / reason | |
| REC-03 | Assign doctor (e.g. Siddharth) | Doctor assigned | |
| REC-04 | **Call** patient | Status → Called | |
| REC-05 | **Start** consult | Status → In service | |
| REC-06 | New OPD tab — walk-in register / add to queue | Queue entry created without app request | |
| REC-07 | Arrive / desk check-in tab (if present) | Appointment / visit marked arrived | |
| REC-08 | Patient search by phone/UHID/name | Finds seeded patient | |
| REC-09 | Register new patient | UHID generated; receipt page works | |
| REC-10 | After doctor completes → Checkout | Invoice created; payment methods: **Cash, Online, UPI, Card, Other** | |
| REC-11 | Record payment Cash | Status Paid; no duplicate checkout CTA | |
| REC-12 | Two receptionists same branch | Same shared queue; either can Call/Start/Checkout | |

---

## 7. Doctor — act as Doctor

**Login:** `siddharth.deshmukh@health360.test` / `SecureP@ss1!`  
**Base:** `/doctor/*`

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| DOC-01 | Dashboard | Today’s summary loads | |
| DOC-02 | Today’s OPD — open assigned encounter | Encounter workspace opens | |
| DOC-03 | Record / skip vitals | Saved or skip allowed | |
| DOC-04 | Consultation notes + assessment | Saved | |
| DOC-05 | E-prescription — add ≥1 medicine → sign/complete Rx | Rx visible to patient later | |
| DOC-06 | Place **lab** clinical order | Order appears in Lab worklist | |
| DOC-07 | Place **imaging** order | Appears in Radiology worklist | |
| DOC-08 | Place **pharmacy / medication** order if UI offers | Appears for pharmacy / nursing | |
| DOC-09 | Place **OT / procedure** order if UI offers | Appears on OT worklist | |
| DOC-10 | Complete encounter | Status completed; reception can checkout | |
| DOC-11 | Schedule / profile / hospitals | Pages load; edits save where allowed | |
| DOC-12 | IPD list → open admission → record round | Round note saved (Phase D) | |

---

## 8. Hospital Admin — act as Hospital Admin

**Login:** `hospital.admin@health360.test` / `SecureP@ss1!`  
**Base:** `/hospital/*`

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| HA-01 | Dashboard KPIs | Numbers load | |
| HA-02 | **OPD trend (7 days)** section (G9) | `opsTrend7d` days with wait/completed (or empty-state OK) | |
| HA-03 | OPD desk page | Same queue capabilities as reception | |
| HA-04 | Staff invite — create receptionist | Invite succeeds; user can login | |
| HA-05 | Staff list / deactivate (if available) | Status changes | |
| HA-06 | Branches / Departments / Profile / Facilities / Gallery / Emergency | CRUD or edit works without crash | |
| HA-07 | Doctors roster | Doctors listed | |
| HA-08 | Clinical catalogs `/hospital/catalogs` | Catalogs wired and usable | |
| HA-09 | IPD — wards/beds setup | Create/view beds | |
| HA-10 | IPD — admit by patient search (UHID/name) | Admission + bed assigned | |
| HA-11 | IPD — bed transfer | Old bed free; new assigned | |
| HA-12 | IPD — discharge | Bed released; invoice linked/created | |
| HA-13 | ICU — units / stays / monitoring | Can open stay and add monitoring record | |
| HA-14 | Lab / Radiology / Pharmacy / OT hospital dashboards | Pages load | |
| HA-15 | Billing invoices list | Lists invoices | |
| HA-16 | Subscription page | Current plan shown | |
| HA-17 | SaaS renew / online pay (Phase F) | Payment intent + sandbox confirm extends subscription (or clear success) | |

---

## 9. Platform Admin — act as Platform Admin

**Login:** `platform.admin@health360.test` / `SecureP@ss1!`  
**Base:** `/admin/*`

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| ADM-01 | Dashboard KPIs | Pending verifications, users, hospitals, reviews | |
| ADM-02 | Users — filter by role/status | List filters correctly | |
| ADM-03 | Hospitals — list / search | Dev hospital visible | |
| ADM-04 | Create hospital (test data) | Created; admin invite flow if prompted | |
| ADM-05 | Hospital detail — status change | Status updates | |
| ADM-06 | Invite doctor to hospital | Invite succeeds | |
| ADM-07 | Change hospital subscription plan | Plan updates; history entry | |
| ADM-08 | Plans — view / edit limits | Saves | |
| ADM-09 | Doctor verifications — approve/reject with reason | Queue updates | |
| ADM-10 | Reviews moderation — hide/show | Visibility changes | |
| ADM-11 | Audit logs — search/page | Entries load | |
| ADM-12 | **Partners** list `/admin/partners` (G8) | Labs/pharmacies listed (seeded PathCare etc. may appear) | |
| ADM-13 | Create partner org (LABORATORY or PHARMACY) | Appears in list | |
| ADM-14 | Partner detail — Add location (name, address, lat/lng) | Location listed | |
| ADM-15 | Partner detail — Link hospital (use hospital UUID `…000030`) | Link ACTIVE | |
| ADM-16 | Suspend / Activate partner | Status chip updates | |
| ADM-17 | Partner detail — Add membership (user UUID) | Member listed | |
| ADM-18 | Deactivate / activate membership | Employment status updates | |

---

## 10. Nursing — act as Nurse

**Login:** invited NURSE · **Base:** `/nursing/*`

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| NUR-01 | Dashboard / ward board | Admissions or MAR worklist loads | |
| NUR-02 | Open IPD patient — chart vitals | Vitals saved on encounter | |
| NUR-03 | Assessments / notes if available | Saved | |
| NUR-04 | MAR — administer scheduled med (after pharmacy verified order) | Administration recorded | |

---

## 11. ICU Nurse — act as ICU Nurse

**Login:** invited ICU_NURSE · **Base:** `/icu-nurse/*`

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| ICU-01 | Dashboard / stay board | Active stays visible | |
| ICU-02 | Add monitoring record (allowed type) | Saved on stay | |

---

## 12. Lab Technician — act as Lab Tech

**Login:** invited LAB_TECHNICIAN · **Base:** `/lab/*`

Prerequisite: Doctor placed a lab order (DOC-06).

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| LAB-01 | Worklist pending | Order appears | |
| LAB-02 | Open order detail | Patient / tests visible | |
| LAB-03 | Progress status (receive → result → release as UI allows) | Status transitions; patient can see released results | |
| LAB-04 | Catalog page | Loads | |

---

## 13. Radiology Technician — act as Radiology Tech

**Login:** invited RADIOLOGY_TECHNICIAN · **Base:** `/radiology/*`

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| RAD-01 | Worklist | Imaging order from doctor appears | |
| RAD-02 | Order detail — update status / complete | Transitions work | |
| RAD-03 | Catalog | Loads | |

---

## 14. Pharmacist — act as Pharmacist

**Login:** invited PHARMACIST · **Base:** `/pharmacy/*`

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| PH-01 | Dashboard / worklist | Medication orders load | |
| PH-02 | Verify order → plan → complete items | Status updates | |
| PH-03 | Pharmacy **requests** — receive → review → ready → dispense | Full request lifecycle | |
| PH-04 | Catalog — list/create medicine | Medicine available for Rx | |
| PH-05 | **Stock receive** on Pharmacy Catalog — pick medicine, batch, qty, expiry | Success toast; batch stored | |
| PH-06 | Dispense request after stock received | Stock on hand decreases (FEFO); dispense still allowed if no stock (legacy soft-fail) | |

*PH-05 may be API-only (Swagger / Postman) if UI not yet wired — still in scope.*

---

## 15. OT Coordinator — act as OT Coordinator

**Login:** invited OT_COORDINATOR · **Base:** `/ot/*`

Prerequisite: Doctor ordered OT procedure / clinical order item for OT.

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| OT-01 | Worklist pending | Pending procedure items listed | |
| OT-02 | Receive / create procedure | Procedure in RECEIVED | |
| OT-03 | Schedule theatre + time | SCHEDULED; theatre assigned | |
| OT-04 | Add team member | Listed on detail | |
| OT-05 | Add PRE_OP note | Required before start | |
| OT-06 | **Add implant** (G7) — name, type, manufacturer, lot, serial, qty | Implant listed on procedure | |
| OT-06b | Save **anesthesia chart** + add VITALS event | Chart + event on procedure | |
| OT-07 | Start procedure | IN_PROGRESS | |
| OT-08 | Add INTRA_OP note; complete with summary | COMPLETED; implant still visible | |
| OT-09 | Catalog / theatres | Create theatre if needed | |

---

## 16. End-to-end scripts (must run)

Use these as **mandatory** scripts. Mark overall Pass only if all steps Pass.

### E2E-01 — OPD Golden Path (Phase A)

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Patient | Request OPD → Main Campus | My OPD shows Waiting |
| 2 | Reception | Same branch → Assign → Call → Start | Called then In service |
| 3 | Doctor | Consult + e-Rx + complete | Encounter done |
| 4 | Reception | Checkout → pay Cash | Paid |
| 5 | Patient | My OPD / Payments | Completed + Paid |

**Run result:** Pass / Fail / Blocked · Tester: ______ · Date: ______

### E2E-02 — Walk-in OPD (no app)

| Step | Actor | Action | Expected |
|------|-------|--------|----------|
| 1 | Reception | New OPD walk-in | In queue |
| 2 | Reception | Assign → Call → Start | In service |
| 3 | Doctor | Consult + complete | Done |
| 4 | Reception | Checkout | Paid |

**Run result:** ______

### E2E-03 — Lab fulfillment

Patient OPD → Doctor lab order → Lab tech release → Patient sees result.

**Run result:** ______

### E2E-04 — IPD admit → discharge

Hospital Admin admit by search → Nurse vitals → Doctor round → Discharge → Invoice → Bed free.

**Run result:** ______

### E2E-05 — Online patient pay (Phase F)

Create unpaid invoice → Patient online pay (sandbox) → Invoice Paid.

**Run result:** ______

### E2E-06 — Partner admin (Phase G8)

Platform Admin create partner → location → link hospital `…000030` → list shows link count.

**Run result:** ______

### E2E-07 — OT + implant (Phase G7)

OT order → schedule → team → notes → implant → start → complete → implant on completed view.

**Run result:** ______

### E2E-08 — Forgot / reset password (Phase G10)

Forgot password for test user → reset via token → login with new password → optionally restore password.

**Run result:** ______

---

## 17. Mobile testing (patient + selective staff)

**Start:** `powershell -File scripts/start-mobile.ps1`  
**API (emulator):** `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1`

| ID | Role | Steps | Expected | Result |
|----|------|-------|----------|--------|
| MOB-01 | Patient | Login | Home tabs load | |
| MOB-02 | Patient | Request OPD | Appears on My OPD | |
| MOB-03 | Patient | My OPD status after web Call | Updates / push if configured | |
| MOB-04 | Patient | Visits / prescriptions / payments | Lists load | |
| MOB-05 | Patient | Documents / vitals / timeline | Parity with web | |
| MOB-06 | Patient | Deep link `health360://request-opd` | Opens Request OPD | |
| MOB-07 | Patient | Deep link `health360://appointments/{id}/check-in` | Check-in screen | |
| MOB-08 | Reception | Mobile OPD desk (if role enabled) | Queue Call / Start / Complete | |
| MOB-09 | Doctor | Today’s OPD / light consult | Can open visit | |
| MOB-10 | Platform Admin | Hospitals / plans / audit on mobile | Screens usable | |
| MOB-11 | Other staff | Open app | Unauthorized or light worklist per build | |

**Push (optional):** Grant notification permission → background app → reception Calls → OPD_CALLED notification.  
**OPD_APPROACHING (G3):** When queue position ≤ 3 while Waiting, patient should get approaching alert once (push/inbox). Coordinate with multiple WAITING tokens.

---

## 18. Negative / edge cases

| ID | Steps | Expected | Result |
|----|-------|----------|--------|
| NEG-01 | Reception wrong branch vs patient request | Patient not in queue (or empty filter) | |
| NEG-02 | Start OT without PRE_OP / team | Validation error | |
| NEG-03 | Complete OT without INTRA_OP | Validation error | |
| NEG-04 | Link same hospital twice to partner | Conflict / clear error | |
| NEG-05 | Checkout already Paid visit | No second payment / clear message | |
| NEG-06 | Patient opens `/ot` or `/admin` | Access denied | |
| NEG-07 | Suspend partner org | Nearby/admin behaviour consistent with SUSPENDED | |

---

## 19. Defect reporting template

```
Title:
Role / Actor:
Environment (local URL / production):
Build / commit / date:
Steps to reproduce:
Expected:
Actual:
Screenshot / video:
Severity: Blocker / Major / Minor / Cosmetic
Related case ID: (e.g. E2E-01 step 4)
```

---

## 20. Test run log

| Field | Value |
|-------|-------|
| Tester name(s) | |
| Start date | |
| End date | |
| Web URL | |
| API URL | |
| Mobile build | |
| Migrations confirmed | V73+ (payments), V74–V76 (Phase G) |
| Overall verdict | Pass / Fail / Conditional |
| Blockers | |
| Sign-off | |

### Suite summary (fill at end)

| Suite | Total | Pass | Fail | Blocked | N/A |
|-------|-------|------|------|---------|-----|
| XC Cross-cut | | | | | |
| AUTH | | | | | |
| Patient | | | | | |
| Reception | | | | | |
| Doctor | | | | | |
| Hospital Admin | | | | | |
| Platform Admin | | | | | |
| Nursing / ICU | | | | | |
| Lab / Rad / Pharmacy / OT | | | | | |
| E2E scripts | | | | | |
| Mobile | | | | | |
| Negative | | | | | |

---

## 21. Suggested execution order (1–2 days)

1. XC + AUTH (incl. forgot password)  
2. Staff invites (Hospital Admin)  
3. **E2E-01 OPD golden path** (blocks many suites)  
4. Patient portal depth + PAT-PAY  
5. Doctor orders → Lab / Rad / Pharmacy / OT suites  
6. IPD E2E-04 + Nursing / ICU  
7. Platform Admin + Partners  
8. Hospital ops trend + SaaS pay  
9. Mobile smoke  
10. Negatives + sign-off  

---

*End of QA-MTP-A-G-001 — use with `QA-TEST-CREDENTIALS-AND-FUNCTIONALITY.txt` for logins and IDs.*
