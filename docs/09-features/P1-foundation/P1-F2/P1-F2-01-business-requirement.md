# P1-F2-01 — Business Requirement

| Feature | P1-F2 |
| Status | APPROVED |

---

## Business problem

Clinical staff need **encounter-scoped vitals** (BP, HR, temp, SpO2, etc.) that belong to a hospital visit. Patient app wellness vitals (`patient.vital_sign_records`) must remain separate so clinical documentation is not mixed with consumer self-tracking.

---

## Real-life scenario

A nurse opens an active OPD/IPD encounter, records vitals before the doctor consults, and saves. The doctor reviews the same vitals on the encounter. Later readings append new rows for the same encounter.

---

## Business goal

Enable **auditable clinical vital signs on the encounter** as part of Phase 1 (R1) patient foundation, unblocking nursing and consultation workflows.

---

## Scope

- Table `clinical.vital_signs` (Flyway V43)
- POST/GET `/api/v1/clinical/encounters/{id}/vitals`
- RBAC `clinical:vitals:read|write`
- Doctor encounter UI + nursing encounter vitals entry
- Audit `VITALS_RECORDED` with `encounterId`

## Out of scope

- Changing consumer `/patients/me/profile/vitals*`
- Editing/deleting historical clinical vitals
- Device/IoT ingestion
- ICU JSON monitoring (`icu.monitoring_records`) — keep separate
- Mobile nurse app (deferred)
- P1-F3 patient clinical timeline API

---

## Actors

Nurse, Doctor, Hospital Admin, Receptionist (read)

---

## Success metrics

- 100% clinical vitals rows linked to a valid encounter
- Record + list p95 &lt; 2s
- Consumer vitals APIs unchanged

---

## Dependencies

- `clinical.encounters` (V30)
- ADR-004, EncounterAccessService
- Staff roles NURSE / DOCTOR (V39)

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | 2026-08-21 | Approved to implement |
| Architect | | 2026-08-21 | ADR-004 accepted |
