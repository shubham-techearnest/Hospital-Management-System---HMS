# 08 — User Story Catalog (Phase E Progressive Pass)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-US-001 |
| **Status** | DRAFT — Phase E (verified features only) |
| **Last Updated** | 2026-09-17 |
| **Baseline label** | `Baseline / Pre-Agile Existing Implementation` |
| **Story points** | Fibonacci for **FUTURE / gap** work only; baseline stories = `—` |
| **Parents** | [07_FEATURE_CATALOG.md](./07_FEATURE_CATALOG.md) · [evidence/FEATURE_STATUS_OVERLAY.md](./evidence/FEATURE_STATUS_OVERLAY.md) |
| **Note** | ~34 stories this pass. More stories will be added as UNKNOWN features are Phase-C verified. |

**Status vocabulary for stories:** `IMPLEMENTED` | `PARTIAL` (maps to overlay `PARTIALLY_IMPLEMENTED`) | `PLANNED` / future.

---

## Index

| Story ID | Feature | Title | Status | Points | Sprint era |
|----------|---------|-------|--------|--------|------------|
| US-IAM-AUTH-001 | FEAT-IAM-AUTH-001 | Sign in with JWT session | IMPLEMENTED | — | Baseline |
| US-IAM-AUTH-002 | FEAT-IAM-AUTH-003 | Complete MFA TOTP challenge | IMPLEMENTED | — | Baseline |
| US-IAM-ACCT-001 | FEAT-IAM-ACCT-001 | Patient self-register with UHID | IMPLEMENTED | — | Baseline |
| US-IAM-RBAC-001 | FEAT-IAM-RBAC-001 | Operate under twelve-role RBAC | IMPLEMENTED | — | Baseline |
| US-IAM-RBAC-002 | FEAT-IAM-RBAC-003 | Land in role portal after login | PARTIAL | — | Baseline |
| US-PUB-LAND-001 | FEAT-PUB-LAND-001 | Browse public landing pages | IMPLEMENTED | — | Baseline |
| US-PUB-ONB-001 | FEAT-PUB-ONB-001 | Submit doctor access request | IMPLEMENTED | — | Baseline |
| US-PUB-ONB-002 | FEAT-PUB-ONB-002 | Submit hospital demo request | IMPLEMENTED | — | Baseline |
| US-ADM-VFY-001 | FEAT-ADM-VFY-001 | Review doctor verification | IMPLEMENTED | — | Baseline |
| US-ADM-HOS-002 | FEAT-ADM-HOS-002 | Process onboarding queue | PARTIAL | — | Baseline |
| US-ONB-PROV-001 | *(gap)* | Auto-provision after onboarding approve | PLANNED | 8 | Future |
| US-HOS-STAFF-001 | FEAT-HOS-STAFF-001 | Invite hospital staff | IMPLEMENTED | — | Baseline |
| US-DOC-PROF-002 | FEAT-DOC-PROF-002 | Submit doctor verification | IMPLEMENTED | — | Baseline |
| US-PAT-CARE-001 | FEAT-PAT-CARE-001 | Request OPD visit | IMPLEMENTED | — | Baseline |
| US-OPD-REQ-001 | FEAT-OPD-REQ-001 | Capture patient OPD request | IMPLEMENTED | — | Baseline |
| US-RCV-REG-001 | FEAT-RCV-REG-001 | Search/register hospital patient | IMPLEMENTED | — | Baseline |
| US-RCV-DESK-001 | FEAT-RCV-DESK-001 | Run reception OPD desk | IMPLEMENTED | — | Baseline |
| US-RCV-DESK-002 | FEAT-RCV-DESK-002 | Complete reception checkout | IMPLEMENTED | — | Baseline |
| US-DOC-WORK-001 | FEAT-DOC-WORK-001 | Document OPD encounter | IMPLEMENTED | — | Baseline |
| US-CLN-NOTE-001 | FEAT-CLN-NOTE-001 | Capture clinical notes | IMPLEMENTED | — | Baseline |
| US-CLN-NOTE-002 | FEAT-CLN-NOTE-002 | Record encounter vitals | IMPLEMENTED | — | Baseline |
| US-CLN-RX-001 | FEAT-CLN-RX-001 | Write prescriptions | IMPLEMENTED | — | Baseline |
| US-CLN-ORD-001 | FEAT-CLN-ORD-001 | Place lab/imaging/med orders | IMPLEMENTED | — | Baseline |
| US-LAB-WRK-001 | FEAT-LAB-WRK-001 | Fulfill lab orders | IMPLEMENTED | — | Baseline |
| US-DOC-WORK-002 | FEAT-DOC-WORK-002 | Recommend IPD admission | IMPLEMENTED | — | Baseline |
| US-IPD-ADM-001 | FEAT-IPD-ADM-001 | Admit patient and assign bed | IMPLEMENTED | — | Baseline |
| US-NUR-MAR-001 | FEAT-NUR-MAR-001 | Administer medications (MAR) | IMPLEMENTED | — | Baseline |
| US-BIL-INV-001 | FEAT-BIL-INV-001 | View hospital invoices | IMPLEMENTED | — | Baseline |
| US-BIL-PAY-001 | FEAT-BIL-PAY-001 | Collect encounter checkout payment | IMPLEMENTED | — | Baseline |
| US-BIL-PAY-002 | FEAT-BIL-PAY-002 | Pay via Razorpay intent | IMPLEMENTED | — | Baseline |
| US-BIL-CHG-001 | FEAT-BIL-CHG-001 | Capture charges (engine) | PARTIAL | — | Baseline |
| US-BIL-CHG-002 | FEAT-BIL-CHG-002 | Link charges to invoice | PARTIAL | — | Baseline |
| US-BIL-CHG-003 | *(gap/bug)* | Wire charge attach + POST invoice lines | PLANNED | 8 | Future |
| US-BIL-XCP-001 | FEAT-BIL-XCP-001 | Handle charge exceptions | IMPLEMENTED | — | Baseline |
| US-CC-OPS-001 | FEAT-CC-OPS-001 | View hospital command center | PARTIAL | — | Baseline |
| US-PLT-AUDIT-002 | FEAT-PLT-AUDIT-002 | Probe platform health | IMPLEMENTED | — | Baseline |
| US-AUTH-FIX-001 | *(bug)* | Enforce PATIENT RoleRoute | PLANNED | 3 | Future |
| US-AUTH-FIX-002 | *(bug)* | Fix RoleRoute null-user bypass | PLANNED | 3 | Future |

---

## Stories (detail)

### US-IAM-AUTH-001 — Sign in with JWT session

| Field | Value |
|-------|-------|
| **Theme** | THM-001 |
| **Epic** | EPIC-IAM-001 |
| **Feature Group** | FG-IAM-AUTH |
| **Feature** | FEAT-IAM-AUTH-001 |
| **Actor** | Any authenticated role |
| **Status** | IMPLEMENTED |
| **Priority** | P0 |
| **Points** | — (Baseline / Pre-Agile Existing Implementation) |
| **Evidence** | Phase C #2 |

**Story:** As a registered user, I want to sign in with my credentials and receive a JWT session, so that I can access my role portal.

**Acceptance criteria (CURRENT behavior):**

- **AC-01** Given valid credentials, When I submit login, Then the API returns access (and refresh) tokens and the web client stores the session.
- **AC-02** Given MFA is enabled for my account, When password succeeds, Then I am challenged for TOTP before portal access.
- **AC-03** Given successful auth without pending MFA, When login completes, Then I am redirected using role navigation rules.

**Evidence:** `LoginPage.tsx` → `AuthenticationService` / JWT → `roleNavigation.ts`

---

### US-IAM-AUTH-002 — Complete MFA TOTP challenge

| Field | Value |
|-------|-------|
| **Theme / Epic / FG / Feature** | THM-001 · EPIC-IAM-001 · FG-IAM-AUTH · FEAT-IAM-AUTH-003 |
| **Actor** | User with MFA enabled |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #11 |

**Story:** As a security-conscious user, I want to enroll and complete TOTP MFA, so that account takeover risk is reduced.

**AC:**

- **AC-01** Given account settings MFA setup, When I enroll TOTP, Then secrets/QR are persisted (V77) and MFA is active.
- **AC-02** Given MFA-enabled login, When I enter a valid TOTP code, Then session proceeds.
- **AC-03** Given invalid TOTP, When I submit, Then access is denied without issuing a full session.

**Evidence:** Account settings + `MfaService` / `TotpService` → V77

---

### US-IAM-ACCT-001 — Patient self-register with UHID

| Field | Value |
|-------|-------|
| **Theme / Epic / FG / Feature** | THM-001 · EPIC-IAM-001 · FG-IAM-ACCT · FEAT-IAM-ACCT-001 |
| **Actor** | Public → PATIENT |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #1 |

**Story:** As a patient, I want to create a Health360 account, so that I can request care and view my records.

**AC:**

- **AC-01** Given I am unauthenticated, When I complete patient registration with valid data, Then a PATIENT user is created (registration hardcodes PATIENT).
- **AC-02** Given registration succeeds, When UHID assignment runs, Then a patient UHID is allocated (`PatientUhidAssignmentService`, V42).
- **AC-03** Given registration completes, When I continue, Then I can proceed to verification/login paths as implemented.

**Evidence:** `RegisterPage.tsx` → `authApi` → `AuthController` → `RegistrationService`

---

### US-IAM-RBAC-001 — Operate under twelve-role RBAC

| Field | Value |
|-------|-------|
| **Feature** | FEAT-IAM-RBAC-001 |
| **Actor** | Platform / hospital operators |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As the platform, I want twelve seeded IAM roles with method security, so that portals and APIs enforce role boundaries.

**AC:**

- **AC-01** Given IAM seeds, When the system boots, Then twelve roles are available for assignment.
- **AC-02** Given a secured controller method, When called without required authority, Then access is denied (`@PreAuthorize` patterns).
- **AC-03** Given a user with a role, When they open their portal mount, Then RoleRoute (where applied) gates the tree.

**Confidence:** HIGH for role count/portals; MEDIUM for exhaustive permission matrix dump.

---

### US-IAM-RBAC-002 — Land in role portal after login

| Field | Value |
|-------|-------|
| **Feature** | FEAT-IAM-RBAC-003 |
| **Actor** | Authenticated user |
| **Status** | PARTIAL |
| **Points** | — Baseline |
| **Related** | BUG-AUTH-001, BUG-AUTH-002 |

**Story:** As a signed-in user, I want to be routed to the correct role portal, so that I only use surfaces meant for my role.

**AC (current):**

- **AC-01** Given login succeeds, When role navigation runs, Then I am sent to the portal matching my primary role.
- **AC-02** Given DOCTOR (and other RoleRoute-mounted roles), When I open foreign portal URLs, Then RoleRoute blocks mismatched roles.
- **AC-03** Given PATIENT portal `/patient/*`, When I navigate there with a non-patient token, Then **RoleRoute is NOT currently applied** (gap — BUG-AUTH-001). ProtectedRoute alone may allow entry.
- **AC-04** Given token exists but `user` is null, When RoleRoute evaluates, Then role check may be skipped (BUG-AUTH-002).

---

### US-PUB-LAND-001 — Browse public landing pages

| Field | Value |
|-------|-------|
| **Feature** | FEAT-PUB-LAND-001 |
| **Actor** | Public visitor |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Confidence** | MEDIUM (pages present; not deep-traced) |

**Story:** As a visitor, I want to view marketing/landing pages, so that I understand Health360 and can start registration or demo request.

**AC:**

- **AC-01** Given I am unauthenticated, When I open consumer/hospital landing routes, Then pages render without requiring JWT.
- **AC-02** Given landing CTAs, When I choose register or request access, Then I am taken to the corresponding public flow.

---

### US-PUB-ONB-001 — Submit doctor access request

| Field | Value |
|-------|-------|
| **Feature** | FEAT-PUB-ONB-001 |
| **Actor** | Public visitor / prospective doctor |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #15 |

**Story:** As a prospective doctor, I want to submit an access request, so that platform admins can review my onboarding.

**AC:**

- **AC-01** Given public request-access form, When I submit valid doctor access data, Then an onboarding request is persisted (V104).
- **AC-02** Given submission succeeds, When admin opens the queue, Then my request is visible for review.

---

### US-PUB-ONB-002 — Submit hospital demo request

| Field | Value |
|-------|-------|
| **Feature** | FEAT-PUB-ONB-002 |
| **Actor** | Public visitor / hospital prospect |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As a hospital prospect, I want to request a demo/onboarding, so that platform admins can process my interest.

**AC:**

- **AC-01** Given hospital demo/onboarding form, When I submit, Then a request is stored and appears in the admin queue.
- **AC-02** Given APPROVED status later, When approval completes, Then **accounts are not auto-provisioned** today (see US-ONB-PROV-001 / GAP-ONB-001).

---

### US-ADM-VFY-001 — Review doctor verification

| Field | Value |
|-------|-------|
| **Feature** | FEAT-ADM-VFY-001 |
| **Actor** | PLATFORM_ADMIN |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #9 |

**Story:** As a platform admin, I want to review doctor verification submissions, so that only verified doctors practice on the platform.

**AC:**

- **AC-01** Given a doctor has submitted verification, When I open the admin verification queue, Then the submission is listed.
- **AC-02** Given a pending submission, When I approve or reject, Then status updates via `AdminDoctorVerificationController`.

---

### US-ADM-HOS-002 — Process onboarding queue

| Field | Value |
|-------|-------|
| **Feature** | FEAT-ADM-HOS-002 |
| **Actor** | PLATFORM_ADMIN |
| **Status** | PARTIAL |
| **Points** | — Baseline |

**Story:** As a platform admin, I want to review public onboarding requests, so that doctor/hospital prospects can be accepted or declined.

**AC:**

- **AC-01** Given queued requests, When I open the admin onboarding queue, Then I can review and set status including APPROVED.
- **AC-02** Given APPROVED, When processing finishes, Then **no automatic hospital/doctor account provisioning** occurs (GAP-ONB-001).

---

### US-ONB-PROV-001 — Auto-provision after onboarding approve *(FUTURE)*

| Field | Value |
|-------|-------|
| **Theme** | THM-007 |
| **Epic** | EPIC-ADM-001 |
| **Actor** | PLATFORM_ADMIN / system |
| **Status** | PLANNED |
| **Priority** | P2 |
| **Points** | 8 |
| **Dependencies** | US-ADM-HOS-002, GAP-ONB-001 |
| **Target** | Stabilization / Core Workflow |

**Story:** As a platform admin, I want APPROVED onboarding to provision the appropriate hospital/doctor accounts, so that manual setup is not required for every approval.

**AC (desired — not current):**

- **AC-01** Given APPROVED hospital onboarding, When provisioning runs, Then tenant/hospital user scaffolding is created per product policy.
- **AC-02** Given APPROVED doctor onboarding, When provisioning runs, Then doctor user/profile stubs are created ready for verification/staff link.
- **AC-03** Given provisioning failure, When error occurs, Then approval state remains auditable and retryable.

---

### US-HOS-STAFF-001 — Invite hospital staff

| Field | Value |
|-------|-------|
| **Feature** | FEAT-HOS-STAFF-001 |
| **Actor** | HOSPITAL_ADMIN |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #10 |

**Story:** As a hospital admin, I want to invite staff with roles, so that receptionists, nurses, and others can operate the hospital tenant.

**AC:**

- **AC-01** Given Hospital Staff page, When I invite a staff member with a role, Then `StaffService.inviteStaff` creates the invite/assignment.
- **AC-02** Given invite succeeds, When the invitee completes access, Then they can authenticate into the hospital-scoped portal for that role.

---

### US-DOC-PROF-002 — Submit doctor verification

| Field | Value |
|-------|-------|
| **Feature** | FEAT-DOC-PROF-002 |
| **Actor** | DOCTOR |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As a doctor, I want to submit verification materials, so that platform admins can approve my professional status.

**AC:**

- **AC-01** Given doctor profile/verification UI, When I submit verification, Then the request is available to admin review (pairs with US-ADM-VFY-001).

---

### US-PAT-CARE-001 — Request OPD visit

| Field | Value |
|-------|-------|
| **Feature** | FEAT-PAT-CARE-001 |
| **Actor** | PATIENT |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #3 |

**Story:** As a patient, I want to request an OPD visit with a doctor/hospital, so that I enter the same-day care queue.

**AC:**

- **AC-01** Given authenticated patient, When I submit an OPD request on `RequestOpdPage`, Then `OpdController.registerOpdRequest` persists the request (V31/V67).
- **AC-02** Given request succeeds, When I view status, Then I can see the request in patient care status surfaces.

---

### US-OPD-REQ-001 — Capture patient OPD request

| Field | Value |
|-------|-------|
| **Feature** | FEAT-OPD-REQ-001 |
| **Actor** | PATIENT / system |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As the OPD domain, I want patient OPD requests stored on the same-day queue model, so that reception and doctors can act on them.

**AC:**

- **AC-01** Given a valid OPD request payload, When registered, Then queue/request state is available to hospital OPD desk flows.
- **AC-02** Given walk-in path, When reception registers walk-in, Then OPD request/encounter path proceeds via `registerWalkIn` (see US-RCV-DESK-001).

---

### US-RCV-REG-001 — Search/register hospital patient

| Field | Value |
|-------|-------|
| **Feature** | FEAT-RCV-REG-001 |
| **Actor** | RECEPTIONIST / HOSPITAL_ADMIN |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #4 |

**Story:** As a receptionist, I want to search and register patients in the hospital registry, so that OPD/IPD work uses a hospital UHID record.

**AC:**

- **AC-01** Given registry UI, When I search by identifiers/name, Then matching hospital patients are returned via `HospitalPatientRegistryController`.
- **AC-02** Given no match, When I register a patient, Then a hospital registry record is created for subsequent desk flows.

---

### US-RCV-DESK-001 — Run reception OPD desk

| Field | Value |
|-------|-------|
| **Feature** | FEAT-RCV-DESK-001 |
| **Actor** | RECEPTIONIST |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As a receptionist, I want an OPD desk and display board, so that I can check in walk-ins and manage the queue.

**AC:**

- **AC-01** Given reception desk pages, When I register a walk-in, Then `OpdController.registerWalkIn` creates the OPD entry.
- **AC-02** Given active queue, When I open display board views, Then queue state is shown for operational use.

---

### US-RCV-DESK-002 — Complete reception checkout

| Field | Value |
|-------|-------|
| **Feature** | FEAT-RCV-DESK-002 |
| **Actor** | RECEPTIONIST |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #8 |

**Story:** As a receptionist, I want to checkout an encounter with payment handoff, so that the visit can close commercially.

**AC:**

- **AC-01** Given checkout-ready encounter, When I open `ReceptionCheckoutPage`, Then billing/payment actions are available.
- **AC-02** Given doctor checkout checklist gate, When clinical checkout requirements are unmet, Then checkout remains blocked as implemented in clinical/doctor flow.

---

### US-DOC-WORK-001 — Document OPD encounter

| Field | Value |
|-------|-------|
| **Feature** | FEAT-DOC-WORK-001 |
| **Actor** | DOCTOR |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #5 |

**Story:** As a doctor, I want an OPD workbench encounter detail, so that I can document the visit before checkout.

**AC:**

- **AC-01** Given an active OPD encounter, When I open `DoctorEncounterDetailPage`, Then clinical panels load for notes/vitals/Rx/orders.
- **AC-02** Given checkout checklist requirements, When incomplete, Then checkout remains gated.

---

### US-CLN-NOTE-001 — Capture clinical notes

| Field | Value |
|-------|-------|
| **Feature** | FEAT-CLN-NOTE-001 |
| **Actor** | DOCTOR |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As a doctor, I want to record structured notes (and related wellness/review content), so that the encounter documentation is complete.

**AC:**

- **AC-01** Given encounter detail, When I save notes via clinical panels, Then `ClinicalController` persists documentation (V30/V48).

---

### US-CLN-NOTE-002 — Record encounter vitals

| Field | Value |
|-------|-------|
| **Feature** | FEAT-CLN-NOTE-002 |
| **Actor** | DOCTOR / clinical staff |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As a clinician, I want to record vital signs on the encounter, so that the clinical record includes measurements.

**AC:**

- **AC-01** Given encounter vitals UI, When I submit vitals, Then they persist with the encounter clinical record.

---

### US-CLN-RX-001 — Write prescriptions

| Field | Value |
|-------|-------|
| **Feature** | FEAT-CLN-RX-001 |
| **Actor** | DOCTOR |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As a doctor, I want to write prescriptions during the encounter, so that pharmacy/patient can fulfill medications.

**AC:**

- **AC-01** Given encounter Rx panel, When I save a prescription, Then clinical prescription records are stored and available downstream.

---

### US-CLN-ORD-001 — Place lab/imaging/med orders

| Field | Value |
|-------|-------|
| **Feature** | FEAT-CLN-ORD-001 |
| **Actor** | DOCTOR |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #6 |

**Story:** As a doctor, I want to place lab (and related) orders from the encounter, so that diagnostics can fulfill them.

**AC:**

- **AC-01** Given clinical order UI, When I place a lab order, Then an order enters lab fulfillment (`LabController` / `LabFulfillmentService`, V35).

---

### US-LAB-WRK-001 — Fulfill lab orders

| Field | Value |
|-------|-------|
| **Feature** | FEAT-LAB-WRK-001 |
| **Actor** | LAB staff / HOSPITAL_ADMIN |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As lab staff, I want a worklist and order detail, so that I can process ordered tests.

**AC:**

- **AC-01** Given placed lab orders, When I open lab worklist, Then orders appear for processing.
- **AC-02** Given order detail, When I progress fulfillment, Then status updates via lab fulfillment services.

---

### US-DOC-WORK-002 — Recommend IPD admission

| Field | Value |
|-------|-------|
| **Feature** | FEAT-DOC-WORK-002 |
| **Actor** | DOCTOR |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #7 |

**Story:** As a doctor, I want to recommend inpatient admission, so that the hospital can admit and assign a bed.

**AC:**

- **AC-01** Given doctor IPD admissions surfaces, When I recommend admission, Then an IPD admission request is created with linked states.

---

### US-IPD-ADM-001 — Admit patient and assign bed

| Field | Value |
|-------|-------|
| **Feature** | FEAT-IPD-ADM-001 |
| **Actor** | HOSPITAL_ADMIN / IPD ops |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As hospital operations, I want to admit a recommended patient and assign a bed, so that inpatient care can begin.

**AC:**

- **AC-01** Given a pending IPD recommendation/request, When hospital admits via `IpdController`, Then admission and bed linkage persist (V33+).
- **AC-02** Given admit succeeds, When request states update, Then doctor and hospital views reflect linked status.

---

### US-NUR-MAR-001 — Administer medications (MAR)

| Field | Value |
|-------|-------|
| **Feature** | FEAT-NUR-MAR-001 |
| **Actor** | NURSE |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Evidence** | Phase C #13 |

**Story:** As a nurse, I want a MAR worklist to administer ready medications, so that inpatient medication administration is recorded.

**AC:**

- **AC-01** Given medication orders in READY state, When I open nursing MAR pages, Then administerable items are listed.
- **AC-02** Given READY item, When I administer, Then `PharmacyController.administerMedication` records administration (V38/V82).
- **AC-03** Given non-READY status, When I attempt administer, Then administration is not allowed as implemented.

---

### US-BIL-INV-001 — View hospital invoices

| Field | Value |
|-------|-------|
| **Feature** | FEAT-BIL-INV-001 |
| **Actor** | HOSPITAL_ADMIN / billing roles |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As hospital billing staff, I want invoice list/detail, so that I can track charges owed for encounters.

**AC:**

- **AC-01** Given billing UI, When I open invoices, Then list/detail load from billing APIs (V41/V73 evidence chain).

---

### US-BIL-PAY-001 — Collect encounter checkout payment

| Field | Value |
|-------|-------|
| **Feature** | FEAT-BIL-PAY-001 |
| **Actor** | RECEPTIONIST / PATIENT |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As reception/patient, I want to collect or pay encounter checkout amounts, so that the visit can settle.

**AC:**

- **AC-01** Given checkout context, When payment is recorded through billing/online payment paths, Then payment state updates on the encounter/invoice.

---

### US-BIL-PAY-002 — Pay via Razorpay intent

| Field | Value |
|-------|-------|
| **Feature** | FEAT-BIL-PAY-002 |
| **Actor** | PATIENT |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |
| **Related** | SEC-PAY-001 |

**Story:** As a patient, I want to pay online via Razorpay, so that I can settle bills without cash-only checkout.

**AC:**

- **AC-01** Given `PatientPaymentsPage` / online payment flow, When I create a payment intent, Then Razorpay sandbox/online path proceeds.
- **AC-02** Given sandbox webhook configuration, When secret is blank, Then sandbox acceptance behavior applies (SEC-PAY-001 — not production-hard).

---

### US-BIL-CHG-001 — Capture charges (engine)

| Field | Value |
|-------|-------|
| **Feature** | FEAT-BIL-CHG-001 |
| **Actor** | HOSPITAL_ADMIN / billing |
| **Status** | PARTIAL |
| **Points** | — Baseline |
| **Evidence** | Phase C #12 |

**Story:** As billing ops, I want a charge capture engine with DRY_RUN vs POST modes, so that charges can be previewed or posted.

**AC (current):**

- **AC-01** Given charge engine, When DRY_RUN mode is used, Then charges can be evaluated without full posting side effects as implemented.
- **AC-02** Given POST mode, When charges post, Then posting occurs **but does not automatically create invoice lines** (gap — BUG-BIL-001).
- **AC-03** Given exceptions UI, When exceptions exist, Then they are visible (pairs with US-BIL-XCP-001).

---

### US-BIL-CHG-002 — Link charges to invoice

| Field | Value |
|-------|-------|
| **Feature** | FEAT-BIL-CHG-002 |
| **Actor** | HOSPITAL_ADMIN / billing |
| **Status** | PARTIAL |
| **Points** | — Baseline |

**Story:** As billing ops, I want posted charges linked as invoice sources, so that invoices reflect clinical charge capture.

**AC (current):**

- **AC-01** Given ChargeController attach API, When called from API, Then attach capability exists on backend.
- **AC-02** Given web `chargesApi.ts`, When using FE charge UX, Then **attach is not wired** (BUG-BIL-001).

---

### US-BIL-CHG-003 — Wire charge attach + POST invoice lines *(FUTURE)*

| Field | Value |
|-------|-------|
| **Status** | PLANNED |
| **Priority** | P1 |
| **Points** | 8 |
| **Dependencies** | US-BIL-CHG-001, US-BIL-CHG-002, BUG-BIL-001 |
| **Related** | FEAT-BIL-CHG-001/002 |

**Story:** As billing ops, I want FE charge attach and POST mode to create invoice lines, so that charge engine and invoices are continuous.

**AC (desired):**

- **AC-01** Given posted charges, When I attach from FE, Then invoice source linkage is created.
- **AC-02** Given POST mode, When posting completes, Then invoice lines are created or explicitly queued per product rule.
- **AC-03** Given failure, When attach/post fails, Then errors surface without silent drop.

---

### US-BIL-XCP-001 — Handle charge exceptions

| Field | Value |
|-------|-------|
| **Feature** | FEAT-BIL-XCP-001 |
| **Actor** | HOSPITAL_ADMIN / billing |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As billing ops, I want to review charge exceptions, so that failed or exceptional charge events can be resolved.

**AC:**

- **AC-01** Given exceptions exist, When I open exceptions UI, Then API-backed exception list/detail is available.

---

### US-CC-OPS-001 — View hospital command center

| Field | Value |
|-------|-------|
| **Feature** | FEAT-CC-OPS-001 |
| **Actor** | HOSPITAL_ADMIN |
| **Status** | PARTIAL |
| **Points** | — Baseline |
| **Related** | BUG-API-001 |

**Story:** As a hospital admin, I want a command center dashboard, so that I can see operational status across the hospital.

**AC (current):**

- **AC-01** Given hospital dashboard command center entry, When backend `CommandCenterController` is called correctly, Then ops data is available.
- **AC-02** Given FE `commandCenterApi.ts` (and similar modules), When `baseURL` already includes `/api/v1`, Then some calls double-prefix `/api/v1` (BUG-API-001) — UI may fail or degrade.

---

### US-PLT-AUDIT-002 — Probe platform health

| Field | Value |
|-------|-------|
| **Feature** | FEAT-PLT-AUDIT-002 |
| **Actor** | Ops / unauthenticated health consumers (as configured) |
| **Status** | IMPLEMENTED |
| **Points** | — Baseline |

**Story:** As platform operations, I want a health endpoint, so that uptime checks can verify API liveness.

**AC:**

- **AC-01** Given API running, When health endpoint is called, Then `HealthController` returns a healthy response per configuration.

---

### US-AUTH-FIX-001 — Enforce PATIENT RoleRoute *(FUTURE)*

| Field | Value |
|-------|-------|
| **Status** | PLANNED |
| **Priority** | P1 |
| **Points** | 3 |
| **Dependencies** | BUG-AUTH-001 |
| **Related feature** | FEAT-IAM-RBAC-003 |

**Story:** As a patient portal owner, I want `/patient/*` wrapped in `RoleRoute role="PATIENT"`, so that other roles cannot browse patient URLs with a token.

**AC (desired):**

- **AC-01** Given non-PATIENT authenticated user, When navigating to `/patient/*`, Then access is denied/redirected.
- **AC-02** Given PATIENT user, When navigating to `/patient/*`, Then portal loads as today.

---

### US-AUTH-FIX-002 — Fix RoleRoute null-user bypass *(FUTURE)*

| Field | Value |
|-------|-------|
| **Status** | PLANNED |
| **Priority** | P2 |
| **Points** | 3 |
| **Dependencies** | BUG-AUTH-002 |

**Story:** As a security owner, I want RoleRoute to deny when user is null even if a token exists, so that role checks cannot be skipped.

**AC (desired):**

- **AC-01** Given token present but user null, When RoleRoute renders, Then access is blocked until user is hydrated or session cleared.
- **AC-02** Given user hydrated with matching role, When RoleRoute renders, Then children render.

---

## Progressive elaboration note

78 features remain `UNKNOWN` in the catalog (outside Phase C overlay). Do **not** invent stories for them until verification. Next story waves should prioritize UNKNOWN features on critical workflows (ED, pharmacy dispense depth, insurance, inventory FE path after BUG-API-001, mobile parity).
