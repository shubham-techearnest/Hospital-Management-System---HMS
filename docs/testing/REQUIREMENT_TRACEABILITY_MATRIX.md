# Health360 Requirement Traceability Matrix

| Doc | H360-RTM-001 |
| Master | [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md) |
| Related | Feature board, readiness audit, Phase I plan |

| Req ID | Business need | Module | UI / Route | API prefix | Entity / DB | Roles | Test refs | Status |
|--------|---------------|--------|------------|------------|-------------|-------|-----------|--------|
| REQ-01 | Create hospital | Platform | `/admin/hospitals` | `/api/v1/admin/hospitals` | hospital | PLATFORM_ADMIN | TC-HOSP-001 | PENDING |
| REQ-02 | Configure hospital | Hospital | `/hospital/*` | hospital APIs | hospital profile | HOSPITAL_ADMIN | TC-HOSP-003+ | PENDING |
| REQ-03 | Departments & staff | Hospital | staff/depts | staff APIs | staff, roles | HOSPITAL_ADMIN | PHASE 3 | PENDING |
| REQ-04 | Doctors & schedules | Doctors | `/hospital/doctors`, doctor schedule | `/api/v1/scheduling` | slots | ADMIN/DOCTOR | TC-HOSP-005 | PENDING |
| REQ-05 | Patient self-reg + UHID | Patient | `/register` | `/api/v1/auth` | user, patient | PATIENT | P1/P3 | PENDING |
| REQ-06 | Desk register + user link | Patient | reception patients | `/api/v1/hospital/patients` | user+patient | RECEPTIONIST | P2 | PENDING |
| REQ-07 | Patient search / duplicates | Patient | desk search | hospital patients | patient | RECEPTIONIST | TC-PAT-SEARCH | PENDING |
| REQ-08 | Appointment book/arrive | Appointments | patient book, reception | `/api/v1/scheduling` | appointment | PATIENT/RX | PHASE 5 | PENDING |
| REQ-09 | OPD + queue | OPD | `/reception`, `/doctor/opd` | `/api/v1/opd` | queue, encounter | RX/DOCTOR | J1 | PENDING |
| REQ-10 | Consultation + Rx | Clinical | doctor OPD | `/api/v1/clinical` | prescription | DOCTOR | J1 | PENDING |
| REQ-11 | Lab order → result | Lab | `/lab`, doctor order | `/api/v1/lab` | lab_order | DOCTOR/LAB | J2 | PENDING |
| REQ-12 | Pharmacy dispense | Pharmacy | `/pharmacy` | `/api/v1/pharmacy` | pharmacy_request | PHARMACIST | J2 | PENDING |
| REQ-13 | OPD billing | Billing | checkout | `/api/v1/billing` | invoice | RECEPTIONIST | PHASE 9 | PENDING |
| REQ-14 | Lab/Pharm auto-bill | Billing | — | enum only | invoice line | — | G-001/002 | NOT CONNECTED |
| REQ-15 | IPD admit + bed | IPD | `/hospital/ipd` | `/api/v1/ipd` | admission, bed | ADMIN/RX | J3 | PENDING |
| REQ-16 | Nursing / MAR | Nursing | `/nursing` | ipd + clinical | vitals, MAR | NURSE | PHASE 11 | PENDING |
| REQ-17 | Discharge + bed release | Discharge | IPD chart | `/api/v1/ipd` | admission | DOCTOR/ADMIN | PHASE 12 | PENDING |
| REQ-18 | Patient portal records | Portal | `/patient/*` | various | scoped reads | PATIENT | PHASE 13 | PENDING |
| REQ-19 | RBAC enforcement | Security | all portals | all | iam.* | all | RBAC_MATRIX | PENDING |
| REQ-20 | Hospital isolation | Security | — | scoped APIs | tenant/hospital id | all | Hospital B | PENDING |
| REQ-21 | Notifications | Notify | in-app | notification | events | all | optional | PARTIAL |
| REQ-22 | Audit trail | Audit | admin audit | audit APIs | audit log | PLATFORM/ADMIN | PHASE 14 | PENDING |
| REQ-23 | IPD service catalog | IPD | `/hospital/ipd-services` | ipd-services | V79 | HOSPITAL_ADMIN | TC-HOSP-007 | PENDING |
| REQ-24 | Mobile nursing | Mobile | — | — | — | NURSE | — | NOT IMPLEMENTED |

## Journey → requirements

| Journey | Requirements |
|---------|----------------|
| J1 OPD | REQ-01…05, 08–10, 18–20 |
| J2 Lab+Rx+Bill | REQ-06–07, 09–13 (14 PARTIAL), 18–20 |
| J3 IPD | REQ-09–10, 15–18, 20, 23 |
