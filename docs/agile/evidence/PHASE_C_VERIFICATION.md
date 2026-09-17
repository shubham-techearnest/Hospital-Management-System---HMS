# Evidence — Phase C Workflow Verification

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-EVID-PHASEC-001 |
| **Phase** | C — Implementation Verification (spot check) |
| **Date** | 2026-09-17 |
| **Method** | Trace UI → API client → controller → service → persistence |

---

## Verification table

| # | Workflow | Status | Conf. | Key evidence | Notes |
|---|----------|--------|-------|--------------|-------|
| 1 | Patient self-registration (+ UHID) | IMPLEMENTED | HIGH | `RegisterPage.tsx` → `authApi` → `AuthController` → `RegistrationService` → `PatientUhidAssignmentService` → V42 | PATIENT only |
| 2 | Login + JWT + role redirect | IMPLEMENTED | HIGH | `LoginPage.tsx` → `AuthenticationService` / JWT → `roleNavigation.ts` | MFA challenge when enabled |
| 3 | Patient request OPD | IMPLEMENTED | HIGH | `RequestOpdPage.tsx` → `OpdController.registerOpdRequest` → V31/V67 | Same-day queue |
| 4 | Reception search/register + OPD desk | IMPLEMENTED | HIGH | Reception pages → `HospitalPatientRegistryController` + `OpdController.registerWalkIn` | |
| 5 | Doctor OPD encounter (notes/Rx/vitals) | IMPLEMENTED | HIGH | `DoctorEncounterDetailPage` + clinical panels → `ClinicalController` → V30/V48 | Checkout checklist gate |
| 6 | Lab order happy path | IMPLEMENTED | HIGH | Clinical orders → `LabController` / `LabFulfillmentService` → V35 | |
| 7 | IPD recommend → admit → bed | IMPLEMENTED | HIGH | Doctor recommend + hospital admit → `IpdController` → V33+ | Linked request states |
| 8 | Billing checkout / Razorpay | IMPLEMENTED | HIGH | `ReceptionCheckoutPage` + `PatientPaymentsPage` → Billing + OnlinePayment → V41/V73 | Sandbox fallback |
| 9 | Admin doctor verification | IMPLEMENTED | HIGH | Doctor submit + Admin review → `AdminDoctorVerificationController` | |
| 10 | Hospital staff invite | IMPLEMENTED | HIGH | `HospitalStaffPage` → `StaffController` / `StaffService.inviteStaff` | |
| 11 | MFA TOTP | IMPLEMENTED | HIGH | Account settings + login → `MfaService` / `TotpService` → V77 | |
| 12 | Charge engine DRY_RUN vs POST | PARTIALLY_IMPLEMENTED | HIGH | `ChargePostingService` + exceptions UI; attach API exists | FE no attach; POST ≠ invoice lines |
| 13 | Nursing MAR | IMPLEMENTED | HIGH | Nursing MAR pages → `PharmacyController.administerMedication` → V38/V82 | Requires READY |
| 14 | Command center | PARTIALLY_IMPLEMENTED | HIGH | Hospital dashboard → `CommandCenterController` | FE double `/api/v1` path bug |
| 15 | Public onboarding → admin queue | IMPLEMENTED | HIGH | Landing/RequestAccess → V104 → Admin queue | Approve ≠ auto-provision |

---

## Defects found during verification

| ID | Type | Severity | Summary | Evidence |
|----|------|----------|---------|----------|
| BUG-API-001 | BUG | P1 | Double `/api/v1` prefix on several FE API modules when `baseURL` already includes `/api/v1` | `commandCenterApi.ts`, also inventory/facility/asset/tasks APIs |
| BUG-BIL-001 | BUG/GAP | P1 | Charge attach not wired in FE; POST mode does not auto-create invoice lines | `ChargeController` attach vs `chargesApi.ts` |
| BUG-AUTH-001 | BUG | P1 | `/patient/*` lacks `RoleRoute role="PATIENT"` | `router.tsx` |
| BUG-AUTH-002 | BUG | P2 | `RoleRoute` skips role check when `user` is null but token exists | `RoleRoute.tsx` |
| GAP-ONB-001 | GAP | P2 | Onboarding APPROVED does not provision hospital/doctor accounts | `OnboardingRequestService` |
| TECH-NTF-001 | TECH | P2 | SMS defaults to log stub | `DefaultSmsNotificationGateway` |
| SEC-PAY-001 | SEC | P2 | Razorpay sandbox accepts blank webhook secret | `RazorpayPaymentGatewayClient` |

---

## Feature status upgrades applied from this pass

See [07_FEATURE_CATALOG.md](../07_FEATURE_CATALOG.md) status overlay and [evidence/FEATURE_STATUS_OVERLAY.md](./FEATURE_STATUS_OVERLAY.md).
