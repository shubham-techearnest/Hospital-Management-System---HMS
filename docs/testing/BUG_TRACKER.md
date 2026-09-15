# Health360 Bug Tracker

| Doc | H360-BUGS-001 |
| Master | [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md) |
| Updated | 2026-09-15 (BUG-001 / BUG-002 fixed + API re-verified) |

## Summary

| Severity | Open | Fixed | Verified |
|----------|-----:|------:|---------:|
| BLOCKER | 0 | 0 | 0 |
| CRITICAL | 0 | 0 | 0 |
| HIGH | 0 | 0 | 1 |
| MEDIUM | 0 | 0 | 1 |
| LOW | 0 | 0 | 0 |

## Known pre-UAT gaps (product)

| ID | Module | Title | Severity | Priority | Status | Notes |
|----|--------|-------|----------|----------|--------|-------|
| GAP-G001 | Billing | Lab does not auto-create invoice lines | HIGH | P1 | KNOWN | Manual lines workaround |
| GAP-G002 | Billing | Pharmacy does not auto-create invoice lines | HIGH | P1 | KNOWN | Manual lines workaround |
| GAP-G003 | Notifications | Email delivery log-only | MEDIUM | P2 | KNOWN | Local UAT OK |
| GAP-G006 | IPD | Blood/transfusion stub | MEDIUM | P2 | KNOWN | Do not mark FAIL if UI labeled stub |
| — | IPD | Attending on admit / My IPD filter / reassign / doctor rounds | — | — | **API VERIFIED** | BUG-001 closed |

---

## Verified fixes (this session)

### BUG-001

```
BUG ID: BUG-001
Module: IPD / Rounds
Title: Doctor cannot record IPD rounds (POST .../rounds returns 403)
Severity: HIGH
Priority: P1
Environment: Local QA / API smoke 2026-09-15
User Role: DOCTOR (siddharth.deshmukh / parmeshwar.doctor)
Precondition: Active admission; HA can create nursing rounds on same admission
Steps to Reproduce:
1. Login as doctor.
2. POST /api/v1/ipd/admissions/{admissionId}/rounds with roundType=DOCTOR.
Expected Result: 201 Created; round stored with recordedBy.
Actual Result (before fix): 403 Forbidden.
API involved: POST /api/v1/ipd/admissions/{id}/rounds
Backend component: HospitalScopeService.assertHospitalScope
Root Cause: DOCTOR already had ipd:round:write (V33), but HospitalScopeService denied all
  doctors by default ("deny hospital-wide ops") before admission/module scope checks completed.
Fix: Allow DOCTOR with ACTIVE doctor.hospital_associations row for the admission hospital
  (same pattern as HospitalClinicalCatalogAccessService).
  Integration test: doctor DOCTOR round after nursing round in IpdIntegrationTest.
Retest Result: 201 for attending (parmeshwar.doctor) and associated doctor (siddharth.deshmukh).
Final Status: VERIFIED
```

### BUG-002

```
BUG ID: BUG-002
Module: Shared / Exception handling
Title: Missing request parameter / unsupported HTTP method return HTTP 500
Severity: MEDIUM
Priority: P2
Environment: Local QA / API smoke 2026-09-15
User Role: HOSPITAL_ADMIN
Precondition: Authenticated
Steps to Reproduce:
1. GET /api/v1/billing/invoices?hospitalId=... without branchId → was 500.
2. GET /api/v1/scheduling/appointments?... (unsupported) → was 500.
Expected Result: 400 / 405 with clear API error body.
Actual Result (before fix): 500 Unhandled exception via GlobalExceptionHandler.
Root Cause: GlobalExceptionHandler did not map MissingServletRequestParameterException /
  HttpRequestMethodNotSupportedException.
Fix: Explicit handlers → 400 VALIDATION_ERROR / 405 METHOD_NOT_ALLOWED (+ ErrorCode.METHOD_NOT_ALLOWED).
Retest Result: missing branchId → 400; wrong GET method → 405 with structured error body.
Final Status: VERIFIED
```

## Log

| BUG ID | Module | Title | Sev | Pri | Status | Linked TC |
|--------|--------|-------|-----|-----|--------|-----------|
| BUG-001 | IPD | Doctor rounds 403 | HIGH | P1 | **VERIFIED** | API-IPD-10 / S3.5b |
| BUG-002 | Shared | 500 on missing param / wrong method | MEDIUM | P2 | **VERIFIED** | API probe |

## Bug entry template (copy per bug)

```
BUG ID: BUG-00N
Module:
Title:
Severity: BLOCKER | CRITICAL | HIGH | MEDIUM | LOW
Priority: P0 | P1 | P2 | P3
Environment:
User Role:
Precondition:
Steps to Reproduce:
Expected Result:
Actual Result:
API involved:
Frontend component / route:
Backend component:
Database entity:
Screenshot / log refs:
Root Cause:
Fix:
Retest Result:
Final Status: OPEN | IN PROGRESS | FIXED | VERIFIED | WONTFIX | DUPLICATE
```
