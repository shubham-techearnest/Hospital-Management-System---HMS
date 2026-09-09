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
| API-IPD-01 | POST | `/api/v1/ipd/...` admission request | DOCTOR | Request | 200/201 | | | |
| API-IPD-02 | POST | admit + bed | HOSPITAL_ADMIN/RX | Admit | 200 | | | |
| API-IPD-03 | POST | assign occupied bed | Staff | Reject | 409/400 | | | |
| API-IPD-04 | POST | transfer | Staff | Transfer | 200 | | | |
| API-IPD-05 | POST | discharge | Doctor/Admin | Discharge | 200 | | | |
| API-IPD-06 | GET | `/api/v1/ipd/...` | PATIENT | Own history | 200 | | | |
| API-ISO-01 | GET | Hospital B patient as HA-A | HOSPITAL_ADMIN A | Deny | 403/404 | | | |

## How to discover exact subpaths

1. Perform UI action.  
2. Copy path from browser Network tab.  
3. Update this matrix with concrete paths (replace `...`).  
4. Controllers: `AuthController`, `AdminHospitalController`, `HospitalPatientRegistryController`, `SchedulingController`, `OpdController`, `LabController`, `PharmacyController`, `BillingController`, `IpdController`, `ClinicalController`.
