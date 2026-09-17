# IPD — Inpatient

## Module Summary

Doctor IPD recommendation, hospital admit with bed assignment, and nursing MAR administration. Theme **THM-003**. Phase C verified recommend→admit→bed and MAR; discharge features remain **UNKNOWN**.

## Current Implementation Status

| Feature | Overlay |
|---------|---------|
| FEAT-DOC-WORK-002 | IMPLEMENTED |
| FEAT-IPD-ADM-001 | IMPLEMENTED |
| FEAT-NUR-MAR-001 | IMPLEMENTED |
| FEAT-IPD-BED-001, FEAT-IPD-CARE-001, FEAT-IPD-DC-* | UNKNOWN |

**Verified subset:** 3/3 IMPLEMENTED. **Module-wide % not claimed** (UNKNOWN majority).

## Actors

- DOCTOR, HOSPITAL_ADMIN, NURSE, ICU roles (ICU UNKNOWN this pass)

## Epic(s)

- EPIC-IPD-001, EPIC-DOC-001, EPIC-NUR-001 (MAR)

## Feature Groups

- FG-IPD-ADM, FG-IPD-BED, FG-IPD-CARE, FG-IPD-DC, FG-NUR-MAR, FG-DOC-WORK

## Features

See catalog; only overlay-listed treated as verified.

## Implemented Features

- Doctor IPD admissions recommend path
- Hospital admit + bed
- MAR administer when READY

## Partially Implemented Features

- None in verified trio; overall IPD lifecycle still incomplete pending discharge/bed board verification.

## Planned Features

- Phase C wave for bed board, payer, discharge, post-discharge.

## User Stories

### US-DOC-WORK-002

| Field | Value |
|-------|-------|
| Actor | DOCTOR |
| Story | As a doctor, I want to recommend inpatient admission, so that hospital ops can admit the patient. |
| Status | IMPLEMENTED |
| Priority | P0 |
| Points | — Baseline |
| Evidence | Phase C #7 |

### US-IPD-ADM-001

| Field | Value |
|-------|-------|
| Actor | HOSPITAL_ADMIN |
| Story | As hospital ops, I want to admit and assign a bed, so that inpatient care can start. |
| Status | IMPLEMENTED |
| Dependencies | US-DOC-WORK-002 |
| Evidence | `IpdController`, V33+ |

### US-NUR-MAR-001

| Field | Value |
|-------|-------|
| Actor | NURSE |
| Story | As a nurse, I want to administer READY medications on the MAR, so that administration is recorded. |
| Status | IMPLEMENTED |
| Evidence | `PharmacyController.administerMedication`, V38/V82 |

## Bugs

- None unique in Phase C IPD path.

## Technical Debt

- TECH-TEST-001 IPD golden path.

## Gaps

- Discharge / post-discharge UNKNOWN; ICU depth UNKNOWN.

## Recommended Next Work

Verify FEAT-IPD-DC-* and bed board before claiming full IPD module completion. Workflow: [WF-IPD-001](../evidence/E2E_WORKFLOW_CATALOG.md).
