# OPD — Outpatient

## Module Summary

Patient OPD requests, reception desk/walk-in, doctor encounter documentation, and checkout handoff into billing. Themes **THM-002** / **THM-003**. Phase C happy path **IMPLEMENTED**.

## Current Implementation Status

| Overlay features | Status |
|------------------|--------|
| FEAT-PAT-CARE-001 | IMPLEMENTED |
| FEAT-OPD-REQ-001 | IMPLEMENTED |
| FEAT-RCV-REG-001 | IMPLEMENTED |
| FEAT-RCV-DESK-001 | IMPLEMENTED |
| FEAT-RCV-DESK-002 | IMPLEMENTED |
| FEAT-DOC-WORK-001 | IMPLEMENTED |
| FEAT-CLN-NOTE-001/002, FEAT-CLN-RX-001, FEAT-CLN-ORD-001 | IMPLEMENTED |

**Verified OPD-related completeness:** 10/10 IMPLEMENTED in overlay subset = **100% of verified**. Queue self check-in / hospital OPD board features remain **UNKNOWN**.

## Actors

- PATIENT, RECEPTIONIST, DOCTOR, HOSPITAL_ADMIN

## Epic(s)

- EPIC-PAT-001, EPIC-OPD-001, EPIC-RCV-001, EPIC-DOC-001, EPIC-CLN-001

## Feature Groups

- FG-PAT-CARE, FG-OPD-REQ, FG-OPD-QUE, FG-OPD-ENC, FG-RCV-REG, FG-RCV-DESK, FG-DOC-WORK, FG-CLN-*

## Features

Catalog FEAT-OPD-*, FEAT-RCV-*, FEAT-CLN-* (verified subset above).

## Implemented Features

Listed in status table.

## Partially Implemented Features

- None in Phase C OPD happy path overlay (checkout checklist is intentional gate, not a gap).

## Planned Features

- Verify FEAT-OPD-QUE-001, FEAT-OPD-ENC-* UNKNOWN items in next audit wave.

## User Stories

### US-PAT-CARE-001

| Field | Value |
|-------|-------|
| Actor | PATIENT |
| Story | As a patient, I want to request an OPD visit, so that I enter the care queue. |
| Status | IMPLEMENTED |
| Priority | P0 |
| Points | — Baseline |
| Evidence | `RequestOpdPage` → `OpdController.registerOpdRequest` → V31/V67 |

### US-RCV-DESK-001 / US-DOC-WORK-001 / clinical stories

See [08_USER_STORY_CATALOG.md](../08_USER_STORY_CATALOG.md). Workflow: [WF-OPD-001](../evidence/E2E_WORKFLOW_CATALOG.md).

## Bugs

- None specific beyond shared auth (patient portal) affecting OPD URL access.

## Technical Debt

- Expand OPD golden-path IT coverage (TECH-TEST-001).

## Gaps

- UNKNOWN queue/self check-in depth; patient RoleRoute gap affects portal trust.

## Recommended Next Work

Keep OPD regression in every stabilization sprint; verify UNKNOWN OPD queue features next.
