# ADR-002: clinical.encounters as PatientVisit

| Status | PROPOSED |

## Context
Audit identified risk of duplicate visit concepts.

## Decision
**PatientVisit = `clinical.encounters`**. Queue = `opd.queue_entries`.

## Consequences
All OPD/IPD/emergency flows create or reference encounters; no `patient_visits` table.

## Rejected
Parallel PatientVisit entity.
