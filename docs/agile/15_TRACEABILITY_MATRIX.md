# 15 — Traceability Matrix (Story → Implementation)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-TRC-001 |
| **Status** | DRAFT — Phase E (verified stories) |
| **Last Updated** | 2026-09-17 |
| **Rule** | Only Phase C / overlay verified stories listed with HIGH confidence |

Paths are representative entry points, not exhaustive file lists.

---

## Matrix

| Story ID | Story | Theme | Epic | Feature | Frontend Evidence | Backend Evidence | Database Evidence | Test Evidence | Status |
|----------|-------|-------|------|---------|-------------------|------------------|-------------------|---------------|--------|
| US-IAM-AUTH-001 | JWT login | THM-001 | EPIC-IAM-001 | FEAT-IAM-AUTH-001 | `LoginPage.tsx`, auth API client, `roleNavigation.ts` | `AuthController`, `AuthenticationService`, JWT | IAM users/sessions (V1+) | Auth-related ITs (suite present; exact class names MEDIUM conf.) | IMPLEMENTED |
| US-IAM-AUTH-002 | MFA TOTP | THM-001 | EPIC-IAM-001 | FEAT-IAM-AUTH-003 | Account settings MFA UI; login challenge | `MfaService`, `TotpService` | V77 MFA | MFA tests if present — MEDIUM | IMPLEMENTED |
| US-IAM-ACCT-001 | Patient register | THM-001 | EPIC-IAM-001 | FEAT-IAM-ACCT-001 | `RegisterPage.tsx`, `authApi` | `AuthController`, `RegistrationService`, `PatientUhidAssignmentService` | V42 UHID | Registration ITs — MEDIUM | IMPLEMENTED |
| US-IAM-RBAC-001 | 12-role RBAC | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-001 | `RoleRoute`, portal mounts | `@PreAuthorize`, IAM seeds | V1/V2 role seeds | HmsRbac-style ITs — MEDIUM | IMPLEMENTED |
| US-IAM-RBAC-002 | Role portal routing | THM-001 | EPIC-IAM-002 | FEAT-IAM-RBAC-003 | `roleNavigation.ts`, `RoleRoute`, `router.tsx` | JWT authorities | IAM roles | — | PARTIAL |
| US-PUB-LAND-001 | Landing pages | THM-002 | EPIC-PUB-001 | FEAT-PUB-LAND-001 | Landing / for-hospitals routes | Public permitAll | — | — | IMPLEMENTED (MED) |
| US-PUB-ONB-001 | Doctor access request | THM-002 | EPIC-PUB-001 | FEAT-PUB-ONB-001 | Request access pages | `PublicOnboardingRequestController` | V104 | — | IMPLEMENTED |
| US-PUB-ONB-002 | Hospital demo request | THM-002 | EPIC-PUB-001 | FEAT-PUB-ONB-002 | Demo/onboarding forms | Onboarding controllers/services | V104 | — | IMPLEMENTED |
| US-ADM-HOS-002 | Onboarding queue | THM-007 | EPIC-ADM-001 | FEAT-ADM-HOS-002 | Admin onboarding queue UI | `OnboardingRequestService` | V104 | — | PARTIAL |
| US-ADM-VFY-001 | Doctor verification review | THM-007 | EPIC-ADM-001 | FEAT-ADM-VFY-001 | Admin verification UI | `AdminDoctorVerificationController` | Doctor verification tables | — | IMPLEMENTED |
| US-DOC-PROF-002 | Doctor verification submit | THM-002 | EPIC-DOC-001 | FEAT-DOC-PROF-002 | Doctor verification submit UI | Doctor verification APIs | Same | — | IMPLEMENTED |
| US-HOS-STAFF-001 | Staff invite | THM-003 | EPIC-HOS-001 | FEAT-HOS-STAFF-001 | `HospitalStaffPage` | `StaffController`, `StaffService.inviteStaff` | Staff assignment tables | — | IMPLEMENTED |
| US-PAT-CARE-001 | Patient OPD request | THM-002 | EPIC-PAT-001 | FEAT-PAT-CARE-001 | `RequestOpdPage.tsx` | `OpdController.registerOpdRequest` | V31/V67 | OPD ITs — MEDIUM | IMPLEMENTED |
| US-OPD-REQ-001 | OPD request intake | THM-003 | EPIC-OPD-001 | FEAT-OPD-REQ-001 | Patient + reception OPD UIs | `OpdController` | V31/V67 | — | IMPLEMENTED |
| US-RCV-REG-001 | Hospital patient registry | THM-003 | EPIC-RCV-001 | FEAT-RCV-REG-001 | Reception registry pages | `HospitalPatientRegistryController` | Registry/UHID | — | IMPLEMENTED |
| US-RCV-DESK-001 | Reception OPD desk | THM-003 | EPIC-RCV-001 | FEAT-RCV-DESK-001 | Reception desk/display | `OpdController.registerWalkIn` | OPD queue | — | IMPLEMENTED |
| US-RCV-DESK-002 | Reception checkout | THM-003 | EPIC-RCV-001 | FEAT-RCV-DESK-002 | `ReceptionCheckoutPage` | Billing + OPD checkout APIs | V41/V73 | — | IMPLEMENTED |
| US-DOC-WORK-001 | Doctor OPD workbench | THM-002 | EPIC-DOC-001 | FEAT-DOC-WORK-001 | `DoctorEncounterDetailPage` + panels | Clinical/OPD controllers | V30/V48 | — | IMPLEMENTED |
| US-CLN-NOTE-001 | Clinical notes | THM-003 | EPIC-CLN-001 | FEAT-CLN-NOTE-001 | Clinical note panels | `ClinicalController` | V30/V48 | — | IMPLEMENTED |
| US-CLN-NOTE-002 | Encounter vitals | THM-003 | EPIC-CLN-001 | FEAT-CLN-NOTE-002 | Vitals panels | `ClinicalController` | Clinical vitals | — | IMPLEMENTED |
| US-CLN-RX-001 | Prescriptions | THM-003 | EPIC-CLN-001 | FEAT-CLN-RX-001 | Rx panels | Clinical Rx APIs | Rx tables | — | IMPLEMENTED |
| US-CLN-ORD-001 | Clinical orders | THM-003 | EPIC-CLN-001 | FEAT-CLN-ORD-001 | Order panels | Order placement → lab | V35 path | — | IMPLEMENTED |
| US-LAB-WRK-001 | Lab worklist | THM-003 | EPIC-LAB-001 | FEAT-LAB-WRK-001 | Lab worklist/detail pages | `LabController`, `LabFulfillmentService` | V35 | — | IMPLEMENTED |
| US-DOC-WORK-002 | Doctor IPD recommend | THM-002 | EPIC-DOC-001 | FEAT-DOC-WORK-002 | Doctor IPD admissions UI | `IpdController` (recommend path) | V33+ | — | IMPLEMENTED |
| US-IPD-ADM-001 | Admit + bed | THM-003 | EPIC-IPD-001 | FEAT-IPD-ADM-001 | Hospital IPD admit UI | `IpdController` | V33+ beds/wards | IPD ITs — MEDIUM | IMPLEMENTED |
| US-NUR-MAR-001 | MAR administer | THM-003 | EPIC-NUR-001 | FEAT-NUR-MAR-001 | Nursing MAR pages | `PharmacyController.administerMedication` | V38/V82 | — | IMPLEMENTED |
| US-BIL-INV-001 | Invoices | THM-004 | EPIC-BIL-001 | FEAT-BIL-INV-001 | Hospital invoice UI | Billing invoice APIs | V41 | — | IMPLEMENTED |
| US-BIL-PAY-001 | Checkout payment | THM-004 | EPIC-BIL-002 | FEAT-BIL-PAY-001 | Reception checkout / payments | Billing payment services | V41/V73 | — | IMPLEMENTED |
| US-BIL-PAY-002 | Razorpay | THM-004 | EPIC-BIL-002 | FEAT-BIL-PAY-002 | `PatientPaymentsPage` | OnlinePayment / Razorpay client | V73 | — | IMPLEMENTED |
| US-BIL-CHG-001 | Charge engine | THM-004 | EPIC-BIL-001 | FEAT-BIL-CHG-001 | Charges / exceptions UI | `ChargePostingService` | V92–V93 / V103 | — | PARTIAL |
| US-BIL-CHG-002 | Charge→invoice link | THM-004 | EPIC-BIL-001 | FEAT-BIL-CHG-002 | `chargesApi.ts` (incomplete attach) | `ChargeController` attach | Charge/invoice link tables | — | PARTIAL |
| US-BIL-XCP-001 | Charge exceptions | THM-004 | EPIC-BIL-001 | FEAT-BIL-XCP-001 | Exceptions UI | Charge exception APIs | Exceptions tables | — | IMPLEMENTED |
| US-CC-OPS-001 | Command center | THM-006 | EPIC-CC-001 | FEAT-CC-OPS-001 | Hospital dashboard CC entry; `commandCenterApi.ts` | `CommandCenterController` | CC-related schema | — | PARTIAL |
| US-PLT-AUDIT-002 | Health endpoint | THM-001 | EPIC-PLT-001 | FEAT-PLT-AUDIT-002 | Ops/clients calling health | `HealthController` | — | Health smoke | IMPLEMENTED |

---

## Reverse lookup (sample)

| Evidence artifact | Stories |
|-------------------|---------|
| `OpdController` | US-PAT-CARE-001, US-OPD-REQ-001, US-RCV-DESK-001 |
| `ClinicalController` | US-CLN-NOTE-001/002, US-CLN-RX-001, US-DOC-WORK-001 |
| `IpdController` | US-DOC-WORK-002, US-IPD-ADM-001 |
| `ChargePostingService` | US-BIL-CHG-001/002 |
| `router.tsx` / `RoleRoute` | US-IAM-RBAC-002, BUG-AUTH-001/002 |

Future stories (US-AUTH-FIX-*, US-BIL-CHG-003, US-ONB-PROV-001) intentionally omit “done” evidence until implemented.
