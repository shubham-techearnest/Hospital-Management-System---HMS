# Patient — Consumer Portal & Care Self-Service

## Module Summary

Patient account (via IAM registration), public discovery adjacency, OPD request/status, and care self-service surfaces. Themes **THM-001** / **THM-002**. Phase C verified registration and OPD request; portal **RoleRoute** gap documented.

## Current Implementation Status

| Feature | Overlay |
|---------|---------|
| FEAT-IAM-ACCT-001 | IMPLEMENTED |
| FEAT-PAT-CARE-001 | IMPLEMENTED |
| FEAT-PUB-LAND-001 | IMPLEMENTED (MEDIUM) |
| FEAT-PAT-PROF-*, FEAT-PAT-HLTH-*, other FEAT-PAT-CARE-* | UNKNOWN |

**Verified subset:** registration + OPD request IMPLEMENTED. Portal authz PARTIAL via shared IAM gap.

## Actors

- PATIENT, Public visitor

## Epic(s)

- EPIC-PAT-001, EPIC-IAM-001 (registration), EPIC-PUB-001 (landing), EPIC-OPD-001 (request)

## Feature Groups

- FG-PAT-PROF, FG-PAT-HLTH, FG-PAT-CARE, FG-IAM-ACCT, FG-PUB-LAND

## Features

Catalog FEAT-PAT-*; verified CARE-001 + account.

## Implemented Features

- Patient self-registration + UHID
- OPD request & status (verified path)
- Landing pages (MEDIUM confidence)

## Partially Implemented Features

- Patient portal access control (missing RoleRoute — IAM)

## Planned Features

- US-AUTH-FIX-001
- Verify profile/consent/vitals/documents/IPD view/payments pages in next Phase B/C wave

## User Stories

### US-IAM-ACCT-001

| Field | Value |
|-------|-------|
| Actor | Public → PATIENT |
| Story | As a patient, I want to create an account with UHID, so that I can use care services. |
| Status | IMPLEMENTED |
| Priority | P0 |
| Points | — Baseline |
| Frontend | `RegisterPage.tsx` |
| Backend | `RegistrationService`, `PatientUhidAssignmentService` |
| Database | V42 |

### US-PAT-CARE-001

| Field | Value |
|-------|-------|
| Actor | PATIENT |
| Story | As a patient, I want to request OPD, so that I can see a doctor. |
| Status | IMPLEMENTED |
| Dependencies | US-IAM-ACCT-001 |
| Evidence | Phase C #3 |

### US-BIL-PAY-002 (patient payments)

| Field | Value |
|-------|-------|
| Status | IMPLEMENTED |
| Notes | Patient online pay path verified in billing Phase C #8 |

## Bugs

- BUG-AUTH-001 (patient portal)
- BUG-AUTH-002 (shared)

## Technical Debt

- None patient-specific beyond authz.

## Gaps

- GAP-AUTH-001; UNKNOWN patient profile/health/document features

## Recommended Next Work

Sprint 01 RoleRoute; then audit remaining `/patient/*` routes for overlay upgrades.
