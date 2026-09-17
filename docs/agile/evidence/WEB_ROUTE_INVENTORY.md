# Evidence — Web Route Inventory

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-EVID-WEB-ROUTES-001 |
| **Source** | `frontend/health360-web/src/app/router.tsx` |
| **Status** | Phase A extract — Phase B adds API/status columns |
| **Last Updated** | 2026-09-17 |

**Status column (Phase A):** `ROUTE_PRESENT` only. Implementation status deferred to Phase B/C.

---

## Legend

| Guard | Meaning |
|-------|---------|
| None | Public |
| Guest | `GuestOnlyRoute` |
| Prot | `ProtectedRoute` |
| Role | `RoleRoute` + role name |

---

## Public & auth

| Route | Page | Module | Guard | Role | Purpose (inferred) | Status |
|-------|------|--------|-------|------|--------------------|--------|
| `/` | LandingPage | public | None | — | Consumer + hospital marketing | ROUTE_PRESENT |
| `/for-hospitals` | HospitalLandingPage | public | None | — | Hospital marketing + demo CTA | ROUTE_PRESENT |
| `/brand` | BrandIdentityPage | public | None | — | Brand page | ROUTE_PRESENT |
| `/login` | LoginPage | auth | Guest | — | Sign-in (+ MFA step) | ROUTE_PRESENT |
| `/forgot-password` | ForgotPasswordPage | auth | Guest | — | Password reset request | ROUTE_PRESENT |
| `/reset-password` | ResetPasswordPage | auth | None | — | Password reset complete | ROUTE_PRESENT |
| `/register` | RegisterPage | auth | Guest | — | PATIENT self-register | ROUTE_PRESENT |
| `/request-access` | RequestAccessPage | auth | Guest | — | Doctor access request | ROUTE_PRESENT |
| `/verify-email` | VerifyEmailPage | auth | None | — | Email verification | ROUTE_PRESENT |
| `/complete-patient-account` | CompletePatientAccountPage | auth | None | — | Invite completion | ROUTE_PRESENT |
| `/doctors/:doctorId` | PublicDoctorProfilePage | public | None | — | Public doctor profile | ROUTE_PRESENT |
| `/hospitals/:hospitalId` | PublicHospitalProfilePage | public | None | — | Public hospital profile | ROUTE_PRESENT |
| `/settings/account` | AccountSettingsPage | settings | Prot | — | Account settings | ROUTE_PRESENT |
| `/settings/notifications` | NotificationPreferencesPage | settings | Prot | — | Notification prefs | ROUTE_PRESENT |
| `/patient/consent` | ConsentPage | patient | Prot | — | Consent gate | ROUTE_PRESENT |

---

## Patient portal (`/patient`) — Prot only, layout PatientPortalLayout

| Route | Page | Purpose (inferred) |
|-------|------|--------------------|
| `/patient` → dashboard | — | Index redirect |
| `/patient/dashboard` | DashboardPage | Patient home |
| `/patient/profile` (+ hash aliases) | ProfileHubPage | Profile hub |
| `/patient/vitals` | VitalsPage | Vitals |
| `/patient/health-score` | HealthScorePage | Health score |
| `/patient/dashboard/metrics/:metricType` | MetricDetailPage | Metric detail |
| `/patient/search` | UnifiedSearchPage | Unified search |
| `/patient/request-opd` | RequestOpdPage | Request OPD |
| `/patient/book` → request-opd | — | Alias |
| `/patient/hospitals` | HospitalSearchPage | Hospital search |
| `/patient/doctors` | DoctorSearchPage | Doctor search |
| `/patient/doctors/:doctorId` | DoctorBookingProfilePage | Doctor booking profile |
| `/patient/book/:doctorId` → request-opd | — | Alias |
| `/patient/reports` | HealthDocumentsPage | Documents |
| `/patient/lab-values` | LabValuesPage | Lab values |
| `/patient/timeline` | HealthTimelinePage | Timeline |
| `/patient/prescriptions` | PatientPrescriptionsPage | Prescriptions |
| `/patient/opd` | PatientOpdStatusPage | OPD status |
| `/patient/payments` | PatientPaymentsPage | Payments |
| `/patient/appointments` → opd | — | Legacy redirect |
| `/patient/encounters` | PatientEncountersPage | Encounters list |
| `/patient/encounters/:encounterId` | PatientEncounterDetailPage | Encounter detail |
| `/patient/ipd` | PatientIpdStaysPage | IPD stays |
| `/patient/ipd/:admissionId` | PatientIpdStaysPage | IPD stay detail |
| `/patient/settings/*` | Account / Notifications | Settings |

---

## Doctor portal — Prot + Role `DOCTOR`

| Route | Page |
|-------|------|
| `/doctor/dashboard` | DoctorDashboardPage |
| `/doctor/my-work` | DoctorMyWorkPage |
| `/doctor/profile` | DoctorProfilePage |
| `/doctor/verification` | DoctorVerificationPage |
| `/doctor/hospitals` | DoctorHospitalAssociationsPage |
| `/doctor/schedule` | DoctorSchedulePage |
| `/doctor/opd` | DoctorOpdPage |
| `/doctor/ipd` | DoctorIpdPage |
| `/doctor/ipd/admissions/:admissionId` | DoctorIpdAdmissionPage |
| `/doctor/encounters/:encounterId` | DoctorEncounterDetailPage |
| `/doctor/settings/*` | Settings |

---

## Hospital portal — Prot + Role `HOSPITAL_ADMIN`

| Route | Page |
|-------|------|
| `/hospital/dashboard` | HospitalDashboardPage |
| `/hospital/profile` | HospitalProfilePage |
| `/hospital/branches` | HospitalBranchesPage |
| `/hospital/departments` | HospitalDepartmentsPage |
| `/hospital/emergency` | HospitalEmergencyPage |
| `/hospital/doctors` | HospitalDoctorRosterPage |
| `/hospital/staff` | HospitalStaffPage |
| `/hospital/opd` | HospitalOpdPage |
| `/hospital/catalogs` | HospitalClinicalCatalogsPage |
| `/hospital/billing/invoices` | HospitalInvoicesPage |
| `/hospital/billing/invoices/:invoiceId` | HospitalInvoiceDetailPage |
| `/hospital/billing/charge-exceptions` | HospitalChargeExceptionsPage |
| `/hospital/billing/checkout/:encounterId` | ReceptionCheckoutPage |
| `/hospital/ipd` | HospitalIpdPage |
| `/hospital/ipd/admissions/:admissionId` | HospitalIpdAdmissionPage |
| `/hospital/ipd-services` | HospitalIpdServicesPage |
| `/hospital/icu` | HospitalIcuPage |
| `/hospital/assets` | HospitalAssetPage |
| `/hospital/my-work` | HospitalMyWorkPage |
| `/hospital/ed` | HospitalEdBoardPage |
| `/hospital/inventory` | HospitalInventoryPage |
| `/hospital/procurement` | HospitalProcurementPage |
| `/hospital/facility` | HospitalFacilityPage |
| `/hospital/insurance` | HospitalInsurancePage |
| `/hospital/blood-bank` | HospitalBloodBankPage |
| `/hospital/staff-ops` | HospitalStaffOpsPage |
| `/hospital/lab` (+ `/dashboard`) | LabDashboardPage |
| `/hospital/radiology` (+ `/dashboard`) | RadiologyDashboardPage |
| `/hospital/ot` (+ `/dashboard`) | OtDashboardPage |
| `/hospital/pharmacy` (+ `/dashboard`) | PharmacyDashboardPage |
| `/hospital/subscription` | HospitalSubscriptionPage |
| `/hospital/facilities` | HospitalFacilitiesPage |
| `/hospital/gallery` | HospitalGalleryPage |
| `/hospital/settings/*` | Settings |

---

## Admin portal — Prot + Role `PLATFORM_ADMIN`

| Route | Page |
|-------|------|
| `/admin/dashboard` | AdminDashboardPage |
| `/admin/verifications` | AdminVerificationQueuePage |
| `/admin/verifications/:doctorId` | AdminVerificationReviewPage |
| `/admin/users` | AdminUsersPage |
| `/admin/hospitals` | AdminHospitalsPage |
| `/admin/hospitals/:hospitalId` | AdminHospitalDetailPage |
| `/admin/onboarding-requests` | AdminOnboardingRequestsPage |
| `/admin/partners` | AdminPartnersPage |
| `/admin/partners/:partnerOrgId` | AdminPartnerDetailPage |
| `/admin/plans` | AdminPlansPage |
| `/admin/audit-logs` | AdminAuditLogsPage |
| `/admin/reviews` | AdminReviewModerationPage |
| `/admin/settings/*` | Settings |

---

## Ancillary portals

### Lab — `LAB_TECHNICIAN`
`/lab/dashboard`, `/lab/worklist`, `/lab/orders/:labOrderId`, `/lab/catalog`, settings

### Radiology — `RADIOLOGY_TECHNICIAN`
`/radiology/dashboard`, `/radiology/worklist`, `/radiology/orders/:imagingOrderId`, `/radiology/catalog`, settings

### OT — `OT_COORDINATOR`
`/ot/dashboard`, `/ot/worklist`, `/ot/procedures/:procedureId`, `/ot/catalog`, settings

### Pharmacy — `PHARMACIST`
`/pharmacy/dashboard`, `/pharmacy/worklist`, `/pharmacy/orders/:medicationOrderId`, `/pharmacy/requests`, `/pharmacy/catalog`, settings

### Assets — `ASSET_MANAGER`
`/assets` → AssetPortalPage, settings

### Reception — `RECEPTIONIST`
`/reception/display`, `/reception/dashboard`, `/reception/checkout/:encounterId`, `/reception/patients/search|new|:patientId|receipt`, settings

### Nursing — `NURSE`
`/nursing/ward`, `/nursing/my-work`, `/nursing/admissions/:admissionId`, `/nursing/mar`, `/nursing/mar/:medicationOrderId`, `/nursing/dashboard`, settings

### ICU Nurse — `ICU_NURSE`
`/icu-nurse/dashboard`, `/icu-nurse/stays/:stayId`, settings

### Documents — Prot
`/documents/prescription|consultation|lab|pharmacy/...` → ClinicalDocumentPrintPage

---

## Feature folders without dedicated routes (API/component libraries)

`analytics`, `blood`, `clinical`, `commandcenter`, `dashboard`, `emergency`, `facility`, `icu`, `insurance`, `inventory`, `ipd`, `location`, `opd`, `org`, `predictive`, `procurement`, `review`, `scheduling`, `search`, `staffops`, `subscription`, `tasks`

These support pages above — inventory of hooks/API in Phase B.

---

## Phase B checklist (per route)

For each route above, add columns:

`Major Components | Actions | Forms | Tables | Filters | API Calls | State | Permissions | Backend Dependency | Impl Status | Confidence | Evidence paths`
