# ADR-015: Appointment Arrival Status Alignment

| Status | ACCEPTED |
| Date | 2026-08-21 |
| Feature | P2-F1 |

## Context

OPD check-in created encounter + queue but left appointment status as CONFIRMED/PENDING, causing status drift (risk R-003).

## Decision

1. Appointment gains status **`ARRIVED`**.
2. Canonical staff action: `POST /api/v1/scheduling/appointments/{id}/arrive` with `scheduling:appointment:arrive`.
3. On arrive (atomic):
   - Appointment → `ARRIVED`
   - Encounter created if missing → `WAITING` (as-built; maps to docs “OPEN/WAITING”)
   - OPD queue entry created if missing → `WAITING`
4. Existing `POST /opd/registrations/check-in` also sets appointment `ARRIVED` (compat alias).
5. Idempotent: if already `ARRIVED` and encounter+queue exist, return current registration payload.

## Consequences

- Flyway V45 status CHECK + RBAC
- Receptionists can arrive without `clinical:encounter:write` via registration-scoped encounter helpers
