# ADR-004: Encounter-Scoped Clinical Vitals

| Status | ACCEPTED |
| Date | 2026-08-21 |
| Feature | P1-F2 |

## Decision

New table `clinical.vital_signs` linked to `encounter_id`. Keep `patient.vital_sign_records` for consumer/wellness self-tracking.

## Consequences

- Clinical APIs: `POST/GET /api/v1/clinical/encounters/{id}/vitals`
- Permissions: `clinical:vitals:read|write`
- Migration: **V43** (Sprint 2)
- Do not add `encounter_id` to consumer vitals table

## References

- [P1-F2 package](../../09-features/P1-foundation/P1-F2/README.md)
