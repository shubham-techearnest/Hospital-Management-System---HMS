# Health360 Current Capability Audit

| Document | HEALTH360-AUDIT-001 |
| Date | 2026-09-09 |
| Scope | Full repository readiness gate (pre–manual E2E) |
| Method | UI → API → Service → DB trace + docs/feature board cross-check |
| Decision companion | [HEALTH360_PRE_TESTING_READINESS_REPORT.md](./HEALTH360_PRE_TESTING_READINESS_REPORT.md) |

**Status legend:** COMPLETE · MOSTLY COMPLETE · PARTIALLY COMPLETE · UI ONLY · BACKEND ONLY · DATABASE ONLY · API EXISTS BUT NOT CONNECTED · CONNECTED BUT BROKEN · PLACEHOLDER · MOCK IMPLEMENTATION · NOT IMPLEMENTED · UNKNOWN

---

## 1. Platform foundation

| Module | Sub-Module | Frontend | Backend | Database | API Integration | RBAC | Business Logic | Current Status | Critical Gap | Evidence |
|--------|------------|----------|---------|----------|-----------------|------|----------------|----------------|--------------|----------|
| Platform admin | Hospital create | Yes | Yes | Yes | Connected | `admin:hospitals:write` | Yes | COMPLETE | — | `AdminHospitalController`, `AdminHospitalsPage.tsx` |
| Platform admin | Hospital activate/deactivate/suspend | Yes | Yes | Yes | Connected | Same | Yes | COMPLETE | — | `PATCH .../status`, `AdminHospitalDetailPage.tsx` |
| Multi-hospital | List/search hospitals | Yes | Yes | Yes | Connected | Scoped | Yes | COMPLETE | — | Hospital public + admin APIs |
| Multi-tenancy | Tenant on principal/entities | N/A | Yes | Yes | Connected | Tenant filters | Single default tenant typical | MOSTLY COMPLETE | Product multi-tenant onboarding not productized | `UserPrincipal.tenantId`, repo `findByIdAndTenantId` |
| Hospital isolation | Staff/admin scope | Yes | Yes | Yes | Connected | `HospitalScopeService` | Yes | COMPLETE | Manual UAT for IDOR | `HospitalScopeService.java` |
| Auth | Login email/mobile + password | Yes | Yes | Yes | Connected | Public | Yes | COMPLETE | — | `AuthenticationService`, `LoginPage.tsx` |
| Auth | JWT + refresh | Yes | Yes | Yes | Connected | Yes | Yes | COMPLETE | — | `JwtTokenService`, `AuthController` |
| Auth | Password reset | Yes | Yes | Yes | Connected | Public | Email log-only locally | MOSTLY COMPLETE | SMTP for prod | `PasswordResetService`, `LocalEmailNotificationService` |
| Auth | Email verification | Yes | Yes | Yes | Connected | Public | Log-only locally | MOSTLY COMPLETE | SMTP for prod | `EmailVerificationService` |
| Auth | MFA | Yes | Yes | Yes | Connected | Optional | Present | MOSTLY COMPLETE | Not required for E2E | `AuthController` MFA endpoints |
| RBAC | Roles + permissions | Admin UI partial | Yes | Seeded | Connected | JWT authorities | Yes | MOSTLY COMPLETE | Some niche roles (Ward Manager, Cashier, TPA) not first-class | Seeds V1/V13/V36/V37/V39 |
| Audit logging | Security/clinical audit | Partial | Yes | Yes | Partial | Role-gated | Present where wired | PARTIALLY COMPLETE | Not every clinical write audited | IAM / domain audit patterns |
| Notifications | In-app | Yes | Yes | Yes | Connected | Yes | Event-driven partial | MOSTLY COMPLETE | — | Notification types + FE |
| Notifications | Email/SMS | N/A | Gateway | N/A | MOCK IMPLEMENTATION | N/A | Local log | MOCK IMPLEMENTATION | External providers | `LocalEmailNotificationService`, `DefaultSmsNotificationGateway` |
| File storage | Documents/logo | Partial | Partial | Partial | Partial | Scoped | Partial | PARTIALLY COMPLETE | Full document vault | Hospital gallery / profile patterns |

---

## 2. Hospital management

| Module | Sub-Module | Frontend | Backend | Database | API Integration | RBAC | Business Logic | Current Status | Critical Gap | Evidence |
|--------|------------|----------|---------|----------|-----------------|------|----------------|----------------|--------------|----------|
| Hospital | Profile / code / address / contact | Yes | Yes | Yes | Connected | Hospital admin | Yes | COMPLETE | — | Hospital profile pages + APIs |
| Hospital | Logo / gallery | Yes | Yes | Yes | Connected | Admin | Yes | MOSTLY COMPLETE | — | Gallery routes |
| Hospital | Branches | Yes | Yes | Yes | Connected | Admin | Yes | MOSTLY COMPLETE | — | `/hospital/branches` |
| Departments | CRUD / list | Yes | Yes | Yes | Connected | Admin | Yes | COMPLETE | — | Departments feature |
| Specializations | Catalog + mapping | Yes | Yes | Yes | Connected | Admin | Yes | MOSTLY COMPLETE | — | Catalogs |
| Staff | Create / assign roles | Yes | Yes | Yes | Connected | Admin | Yes | COMPLETE | — | Staff pages + StaffRepository |
| Doctors | Hospital mapping | Yes | Yes | Yes | Connected | Admin/Doctor | Yes | COMPLETE | — | Doctor hospital join |
| Schedules | Slots / leave | Yes | Yes | Yes | Connected | Doctor/Admin | Yes | MOSTLY COMPLETE | Edge cases on leave | Scheduling module |
| Services | OPD/hospital services | Yes | Yes | Yes | Connected | Admin | Yes | MOSTLY COMPLETE | — | Catalogs / OPD config |
| IPD services | Feature flags + presets | Yes | Yes | V79+ | Connected | Admin | Yes | COMPLETE | Restart API for Flyway | `HospitalIpdServicesController`, V79 |
| Ward/Room/Bed | Facility setup | Yes | Yes | Yes | Connected | Admin | Yes | COMPLETE | — | `IpdFacilityService`, facilities UI |
| Lab setup | Catalog | Yes | Yes | Yes | Connected | Lab/Admin | Yes | COMPLETE | — | Lab catalog routes |
| Pharmacy setup | Catalog / stock | Yes | Yes | Yes | Connected | Pharm/Admin | Yes | MOSTLY COMPLETE | Supplier/GRN depth | Pharmacy catalog |
| Billing config | Tax/tariff depth | Partial | Partial | Partial | Partial | Billing | Basic invoice | PARTIALLY COMPLETE | Advanced tariff engine | Billing module |
| Public availability | Patient search hospitals | Yes | Yes | Yes | Connected | Public/Patient | Yes | COMPLETE | — | Patient search |
| Operational without DB hacks | Fresh hospital | Yes | Yes | Flyway | Connected | Platform admin | Seed roles | MOSTLY COMPLETE | Must assign admin, depts, beds, schedules via UI | Admin create + hospital setup UIs |

---

## 3. User / staff / patient

| Module | Sub-Module | Frontend | Backend | Database | API Integration | RBAC | Business Logic | Current Status | Critical Gap | Evidence |
|--------|------------|----------|---------|----------|-----------------|------|----------------|----------------|--------------|----------|
| User↔Patient rule | Patient requires user | Yes | Enforced | FK | Connected | Yes | Desk creates user+patient | MOSTLY COMPLETE | Stub email internal | `HospitalPatientRegistryService` |
| Self-registration | Patient signup + UHID | Yes | Yes | Yes | Connected | Public | Yes | COMPLETE | Email verify local | `RegistrationService` |
| Desk registration | Walk-in find-or-register | Yes | Yes | Yes | Connected | Reception | Credentials response | COMPLETE | Mobile login preferred | Walk-in panel + registry |
| UHID | Generate / unique / display | Yes | Yes | V42 | Connected | Yes | Tenant-global DEC-001 | COMPLETE | Business: global vs hospital UHID | `PatientUhidAssignmentService` |
| Patient search | Name/mobile/UHID/DOB | Yes | Yes | Yes | Connected | Staff | Yes | COMPLETE | — | Hospital patient search |
| Duplicate detection | Soft | Partial | Partial | Partial | Partial | Staff | Partial | PARTIALLY COMPLETE | Hard merge tools | Registry / search |
| Patient portal | Records access | Yes | Yes | Yes | Connected | PATIENT | Scoped | MOSTLY COMPLETE | — | `/patient/*` router |
| Roles present | PATIENT, DOCTOR, HOSPITAL_ADMIN, PLATFORM_ADMIN, RECEPTIONIST, NURSE, ICU_NURSE, LAB_TECHNICIAN, PHARMACIST, RADIOLOGY_TECHNICIAN, OT_COORDINATOR | Seeded | Seeded | Yes | Connected | Yes | Sufficient for E2E | MOSTLY COMPLETE | Cashier/TPA/Ward Manager not distinct | IAM seeds |

---

## 4. Appointments / OPD / Queue

| Module | Sub-Module | Frontend | Backend | Database | API Integration | RBAC | Business Logic | Current Status | Critical Gap | Evidence |
|--------|------------|----------|---------|----------|-----------------|------|----------------|----------------|--------------|----------|
| Appointment | Book / cancel / reschedule | Yes | Yes | Yes | Connected | Patient/Staff | Slot conflict checks | MOSTLY COMPLETE | — | `SchedulingController` |
| Appointment → OPD | Arrival / conversion | Yes | Yes | Yes | Connected | Reception | Yes | COMPLETE | — | `OpdRegistrationService` |
| Walk-in OPD | Register + queue | Yes | Yes | Yes | Connected | Reception | Strongest path | COMPLETE | — | OPD realism P2-F6–F10 |
| Queue | Token call/skip/recall/no-show | Yes | Yes | Yes | Connected | Desk/Doctor | Yes | COMPLETE | Real-time is poll/refresh | `OpdController` queue APIs |
| Consultation | Vitals, notes, diagnosis, Rx | Yes | Yes | Yes | Connected | Doctor | Guided checklist | COMPLETE | — | Doctor OPD UI + services |
| Follow-up | Schedule from OPD | Yes | Yes | Yes | Connected | Doctor | Yes | MOSTLY COMPLETE | — | ECO-P2 / OPD |
| Waiting board | TV/kiosk | Yes | Yes | Yes | Connected | Hospital | Phase H | MOSTLY COMPLETE | Manual QA pending | P2-F11 |

---

## 5. Prescription / Lab / Pharmacy / Billing

| Module | Sub-Module | Frontend | Backend | Database | API Integration | RBAC | Business Logic | Current Status | Critical Gap | Evidence |
|--------|------------|----------|---------|----------|-----------------|------|----------------|----------------|--------------|----------|
| Prescription | Create / history / patient view | Yes | Yes | Yes | Connected | Doctor/Patient | Yes | COMPLETE | — | P2-F4, ECO-P4 |
| Lab | Order → worklist → result | Yes | Yes | Yes | Connected | Doctor/Lab | Hospital-first | COMPLETE | Auto-bill missing | ECO-P3 RELEASED |
| Lab → Doctor/Patient | Result visibility | Yes | Yes | Yes | Connected | Yes | Yes | COMPLETE | — | Reports / lab-values |
| Pharmacy | Rx share → dispense → stock | Yes | Yes | Yes | Connected | Pharm | Yes | MOSTLY COMPLETE | Partial dispense edge cases | ECO-P4 |
| Billing | Encounter checkout invoice | Yes | Yes | Yes | Connected | Reception/Billing | OPD fee path | MOSTLY COMPLETE | — | Checkout routes + `BillingService` |
| Billing | Lab/Pharmacy auto lines | Enum only | Accepts sourceType | Yes | **DISCONNECTED** | N/A | Manual createInvoice | API EXISTS BUT NOT CONNECTED | No service calls from Lab/Pharmacy to Billing | `InvoiceLineSourceType.LAB_ORDER/MEDICATION_ORDER`; no Lab/Pharmacy → BillingService |
| Billing | IPD deposits/interim | Yes | Yes | Yes | Connected | IPD billing | Phase I6 | MOSTLY COMPLETE | Real TPA EDI deferred | `IpdBillingService` |
| Payment | Partial / online intent | Partial | Yes | Yes | Partial | Yes | Present | PARTIALLY COMPLETE | Gateway config | `OnlinePaymentService` |

---

## 6. IPD / Bed / Nursing / Discharge

| Module | Sub-Module | Frontend | Backend | Database | API Integration | RBAC | Business Logic | Current Status | Critical Gap | Evidence |
|--------|------------|----------|---------|----------|-----------------|------|----------------|----------------|--------------|----------|
| Admission request | OPD recommend → desk | Yes | Yes | V80 | Connected | Doctor/Hospital | Yes | MOSTLY COMPLETE | Manual UAT | I1 |
| Admission | Register + bed assign | Yes | Yes | Yes | Connected | Admission roles | Occupancy | COMPLETE | — | `IpdAdmissionService` |
| Bed board | Reserve / cleaning / transfer | Yes | Yes | V81+ | Connected | Yes | Status machine | MOSTLY COMPLETE | Concurrent edge UAT | I2 |
| Patient chart | Shared doctor/nurse/hospital | Yes | Yes | Yes | Connected | Role views | Assessments, notes, MAR | MOSTLY COMPLETE | Care-plan/consult placeholders | `IpdPatientChart` |
| Med recon / eMAR | Outcomes + critical lab ack | Yes | Yes | V82 | Connected | Nurse/Doctor | Yes | MOSTLY COMPLETE | — | I4 |
| ICU escalate/step-down | Care transition | Yes | Yes | V83 | Connected | Yes | Yes | MOSTLY COMPLETE | Blood bank stub | I5, `IpdCareTransitionsPanel` |
| Discharge | Plan/order/clearances/LAMA/death | Yes | Yes | V84–V86 | Connected | Doctor/Admin | Bed release | MOSTLY COMPLETE | PDF deferred | I7–I8 |
| Post-discharge | Follow-up / CLOSED / portal | Yes | Yes | V86 | Connected | Patient | History | MOSTLY COMPLETE | — | `/patient/ipd` |
| Nursing | Ward list + vitals + MAR | Yes | Yes | Yes | Connected | NURSE | Permission split | MOSTLY COMPLETE | Native RN charting deferred | Nursing routes |
| Ops dashboard | Metrics | Yes | Yes | V87 | Connected | Hospital | Yes | MOSTLY COMPLETE | — | I9 |

---

## 7. Cross-module integration summary

| Integration | Status | Notes |
|-------------|--------|-------|
| USER ↔ PATIENT | CONNECTED | Enforced on desk + self-reg |
| PATIENT ↔ HOSPITAL | CONNECTED | Hospital-patient association |
| HOSPITAL ↔ STAFF/DOCTOR | CONNECTED | Staff + doctor mapping |
| DOCTOR ↔ SCHEDULE ↔ APPOINTMENT | CONNECTED | Scheduling module |
| PATIENT → APPOINTMENT → OPD → QUEUE → DOCTOR | CONNECTED | Strongest validated path |
| DOCTOR → PRESCRIPTION → PHARMACY | CONNECTED | ECO-P4 |
| DOCTOR → LAB → RESULT → DOCTOR/PATIENT | CONNECTED | ECO-P3 |
| OPD → BILLING | CONNECTED | Checkout / encounter invoice |
| LAB → BILLING | DISCONNECTED | Manual invoice workaround |
| PHARMACY → BILLING | DISCONNECTED | Manual invoice workaround |
| OPD → ADMISSION → BED | CONNECTED | Admission request + admit |
| IPD → LAB / PHARMACY | CONNECTED | Chart-driven orders |
| IPD → BILLING | MOSTLY CONNECTED | Charges/deposits/clearance |
| IPD → DISCHARGE → BED RELEASE | CONNECTED | Discharge services |
| DISCHARGE → PATIENT HISTORY | CONNECTED | Portal IPD history |

---

## 8. Database / migrations

- Flyway present through **V87** (IPD indexes / ops).
- Core clinical + billing + IPD enterprise schemas present.
- Risk: large Phase G/H/I work may be **uncommitted** locally — testers must run migrations on a clean DB and restart API.

---

## 9. Tests

| Area | Evidence | Gap |
|------|----------|-----|
| OPD walk-in golden path | Integration tests (historical) | Prefer re-run before UAT |
| IPD | `IpdIntegrationTest.java` | Still closer to MVP admit→discharge than full enterprise I0–I9 path |
| Lab/Pharmacy E2E auto-bill | Absent | Expected given disconnect |

---

## 10. Audit conclusion (capability only)

The repository contains **connected implementations** for hospital bootstrap, staff/RBAC, patient/UHID, OPD/queue/consultation/Rx, lab clinical loop, pharmacy dispense, OPD billing, and IPD admit→care→discharge. Primary structural gaps are **lab/pharmacy→billing automation**, **external notification delivery**, and **unproven enterprise IPD UAT** — not missing modules.
