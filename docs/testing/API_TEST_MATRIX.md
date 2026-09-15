# Health360 API Test Matrix

| Doc | H360-API-001 |
| Master | [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md) |
| Auth | `Authorization: Bearer <access_token>` unless Public |

Fill **Actual** and **Status** during execution. Prefer capturing request IDs from network tab.

| TC | Method | Path (prefix) | Role | Purpose | Expected HTTP | Actual | Status | Notes |
|----|--------|---------------|------|---------|----------------|--------|--------|-------|
| API-AUTH-01 | POST | `/api/v1/auth/register` | Public | P1/P3 self-reg | 200/201 | | | |
| API-AUTH-02 | POST | `/api/v1/auth/login` | Public | Email login | 200 | | | |
| API-AUTH-03 | POST | `/api/v1/auth/login` | Public | Mobile login (P2) | 200 | | | email field = mobile |
| API-AUTH-04 | POST | `/api/v1/auth/login` | Public | Wrong password | 401 | | | |
| API-AUTH-05 | POST | `/api/v1/auth/refresh` | User | Refresh | 200 | | | |
| API-AUTH-06 | POST | `/api/v1/auth/logout` | User | Logout | 200 | | | |
| API-AUTH-07 | POST | `/api/v1/auth/forgot-password` | Public | Reset request | 200 | | | email may log-only |
| API-ADM-01 | POST | `/api/v1/admin/hospitals` | PLATFORM_ADMIN | Create hospital | 200/201 | | | H360-TEST-001 |
| API-ADM-02 | PATCH | `/api/v1/admin/hospitals/{id}/status` | PLATFORM_ADMIN | Activate/suspend | 200 | | | |
| API-ADM-03 | POST | `/api/v1/admin/hospitals` | RECEPTIONIST | Unauthorized | 403 | | | |
| API-PAT-01 | POST | `/api/v1/hospital/patients` (register) | RECEPTIONIST | Desk register P2 | 200/201 | | | confirm path in controller |
| API-PAT-02 | GET | hospital patient search | RECEPTIONIST | Search mobile | 200 | | | |
| API-SCH-01 | POST | `/api/v1/scheduling/...` book | PATIENT | Book slot | 200/201 | | | exact subpath from FE |
| API-SCH-02 | POST | book same slot twice | PATIENT/Other | Double book | 409/400 | | | |
| API-SCH-03 | POST | past date book | PATIENT | Reject | 400/422 | | | |
| API-OPD-01 | POST | `/api/v1/opd/...` walk-in | RECEPTIONIST | Walk-in | 200/201 | | | |
| API-OPD-02 | POST | queue call/start | DOCTOR/RX | Queue | 200 | | | |
| API-OPD-03 | POST | skip/recall | RECEPTIONIST | Queue ops | 200 | | | |
| API-CLIN-01 | POST | `/api/v1/clinical/...` vitals | DOCTOR/NURSE | Vitals | 200 | | | |
| API-CLIN-02 | POST | prescription sign | DOCTOR | Rx | 200 | | | |
| API-LAB-01 | POST | `/api/v1/lab/...` order | DOCTOR | Lab order | 200/201 | | | |
| API-LAB-02 | PATCH | sample collect | LAB_TECH | Status | 200 | | | |
| API-LAB-03 | POST | result + verify | LAB_TECH | Result | 200 | | | |
| API-LAB-04 | GET | results | PATIENT | Own only | 200 | | | |
| API-LAB-05 | GET | other patient result | PATIENT | Deny | 403/404 | | | |
| API-PH-01 | GET | `/api/v1/pharmacy/...` requests | PHARMACIST | Worklist | 200 | | | |
| API-PH-02 | POST | dispense | PHARMACIST | Dispense | 200 | | | |
| API-PH-03 | POST | dispense zero stock | PHARMACIST | Reject | 400/409 | | | |
| API-BILL-01 | POST | `/api/v1/billing/invoices` | RECEPTIONIST | Create invoice | 200/201 | | | |
| API-BILL-02 | POST | payment | RECEPTIONIST | Capture | 200 | | | |
| API-BILL-03 | POST | invoice as PATIENT for other | PATIENT | Deny | 403 | | | |
| API-IPD-01 | POST | `/api/v1/ipd/admission-requests` | DOCTOR | Request (seeds attendingDoctorId) | 200/201 | — | NOT RUN | UI/doctor flow |
| API-IPD-02 | POST | `/api/v1/ipd/admissions` | HOSPITAL_ADMIN/RX | Admit + bed + **primaryDoctorId** | 201 | **201** | **PASS** | 2026-09-15 |
| API-IPD-02a | POST | `/api/v1/ipd/admissions` | HOSPITAL_ADMIN | Admit **without** primaryDoctorId | 400 | **400** | **PASS** | |
| API-IPD-02b | POST | `/api/v1/ipd/admissions` | HOSPITAL_ADMIN | Admit with doctor not at hospital | 400 | — | NOT RUN | |
| API-IPD-03 | POST | assign occupied bed | Staff | Reject | 409/400 | — | NOT RUN | |
| API-IPD-04 | POST | `/api/v1/ipd/admissions/{id}/transfer-bed` | Staff | Transfer | 200 | — | NOT RUN | |
| API-IPD-05 | POST | `/api/v1/ipd/admissions/{id}/discharge` | Doctor/Admin | Discharge | 200 | **200** | **PASS** | DISCHARGED |
| API-IPD-06 | GET | `/api/v1/ipd/...` patient history | PATIENT | Own history | 200 | — | NOT RUN | |
| API-IPD-07 | GET | `/api/v1/ipd/admissions?primaryDoctorId=` | DOCTOR/HA | My inpatients filter | 200 | **200** | **PASS** | found admission |
| API-IPD-08 | PATCH | `/api/v1/ipd/admissions/{id}/attending-doctor` | HOSPITAL_ADMIN | Reassign attending | 200 | **200** | **PASS** | |
| API-IPD-09 | PATCH | `/api/v1/ipd/admissions/{id}/attending-doctor` | DOCTOR (no write) | Unauthorized reassign | 403 | **403** | **PASS** | |
| API-IPD-10 | POST | `/api/v1/ipd/admissions/{id}/rounds` | DOCTOR | Doctor round note | 201 | **201** | **PASS** | BUG-001 fixed (hospital association scope) |
| API-ERR-01 | GET | `/api/v1/billing/invoices` missing `branchId` | HA | Client error mapping | 400 | **400** | **PASS** | BUG-002 |
| API-ERR-02 | GET | `/api/v1/scheduling/appointments` | HA | Wrong method mapping | 405 | **405** | **PASS** | BUG-002 |
| API-IPD-10b | POST | `/api/v1/ipd/admissions/{id}/rounds` | HOSPITAL_ADMIN | Nursing round | 201 | **201** | **PASS** | roundType=NURSING |
| API-AUTH-01 | POST | `/api/v1/auth/login` | PA/HA/DR | Login | 200 | **200** | **PASS** | |
| API-AUTH-04 | POST | `/api/v1/auth/login` | Public | Wrong password | 401 | **401** | **PASS** | |
| API-ADM-03 | GET | `/api/v1/admin/hospitals` | DOCTOR | Unauthorized | 403 | **403** | **PASS** | |
| API-BILL-01 | GET | `/api/v1/billing/invoices` | HA | List | 200 | **200** | **PASS** | needs branchId |
| API-LAB-01 | GET | lab orders list | HA | List | 200 | **200** | **PASS** | |
| API-PH-01 | GET | pharmacy requests | HA | List | 200 | **200** | **PASS** | |
| API-ISO-01 | GET | Hospital B patient as HA-A | HOSPITAL_ADMIN A | Deny | 403/404 | | | |
| API-AST-01 | GET | `/api/v1/assets/categories` | HOSPITAL_ADMIN | List categories | 200 | **200** | **PASS** | 6 seeded |
| API-AST-02 | POST | `/api/v1/assets` | HOSPITAL_ADMIN | Register asset | 201 | **201** | **PASS** | |
| API-AST-03 | GET | `/api/v1/assets?hospitalId&branchId` | HOSPITAL_ADMIN | List/filter | 200 | **200** | **PASS** | q=tag |
| API-AST-04 | POST | `/api/v1/assets/{id}/maintenance` | HOSPITAL_ADMIN | Log maintenance | 201 | **201** | **PASS** | → MAINTENANCE |
| API-AST-05 | POST | `/api/v1/assets/{id}/status` | HOSPITAL_ADMIN | Status transition | 200 | **200** | **PASS** | → AVAILABLE |
| API-AST-06 | POST | `/api/v1/assets` | DOCTOR | Deny write | 403 | **403** | **PASS** | |

## Letterhead + clinical documents (2026-09-15)

| ID | Method | Path | Actor | Expected | Actual | Result | Notes |
|----|--------|------|-------|----------|--------|--------|-------|
| API-LH-01 | PUT | `/hospitals/me/profile/letterhead` | HOSPITAL_ADMIN | 200 | **200** | **PASS** | tagline+footer |
| API-LH-02 | POST | `/hospitals/me/profile/letterhead/logo` | HOSPITAL_ADMIN | 200 | **200** | **PASS** | multipart PNG |
| API-LH-03 | GET | `/hospitals/{id}/letterhead/logo` | HOSPITAL_ADMIN | 200 | **200** | **PASS** | image bytes |
| API-DOC-01 | GET | `/clinical/encounters/{id}/documents/prescription/{rxId}` | DOCTOR | 200 | **200** | **PASS** | hasLogo after upload |
| API-DOC-02 | GET | `/clinical/encounters/{id}/documents/consultation/{noteId}` | DOCTOR | 200 | **200** | **PASS** | |
| API-DOC-03 | GET | `/pharmacy/requests/{id}/documents/dispense-slip` | HOSPITAL_ADMIN | 200 | **200** | **PASS** | |
| API-DOC-04 | GET | `/lab/orders/{id}/documents/report` | HOSPITAL_ADMIN | 404 (no data) | **404** | **PASS** | endpoint wired; no RELEASED lab in seed |

## How to discover exact subpaths

1. Perform UI action.  
2. Copy path from browser Network tab.  
3. Update this matrix with concrete paths (replace `...`).  
4. Controllers: `AuthController`, `AdminHospitalController`, `HospitalPatientRegistryController`, `SchedulingController`, `OpdController`, `LabController`, `PharmacyController`, `BillingController`, `IpdController`, `ClinicalController`, `AssetController`.
