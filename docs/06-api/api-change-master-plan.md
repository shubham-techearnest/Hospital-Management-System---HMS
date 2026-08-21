# API Change Master Plan

| Document ID | API-PLAN-001 |
| Status | DRAFT |

Base: `/api/v1` — additive evolution per ADR-007.

---

## P1-F1 — Patient Registry (new namespace)

| Method | Path | Purpose | Permission |
|--------|------|---------|------------|
| GET | `/hospital/patients/search` | Universal patient search | `patient:registry:read` |
| POST | `/hospital/patients/register` | Hospital desk registration + UHID | `patient:registry:write` |
| GET | `/hospital/patients/{patientId}` | Profile for reception | `patient:registry:read` |
| POST | `/hospital/patients/register/resolve-duplicate` | Continue new with reason | `patient:registry:write` |
| GET | `/hospital/patients/{patientId}/registration-receipt` | Receipt payload/PDF | `patient:registry:read` |

**Scope:** Hospital/branch from staff assignment (ADR-008).

**Errors:** 409 DUPLICATE_CANDIDATES with candidate list; 403 scope; 422 validation.

---

## P1-F2 — Clinical Vitals

| Method | Path | Permission |
|--------|------|------------|
| POST | `/clinical/encounters/{id}/vitals` | `clinical:vitals:write` |
| GET | `/clinical/encounters/{id}/vitals` | `clinical:vitals:read` |

---

## P1-F3 — Patient Clinical Timeline

| Method | Path | Permission |
|--------|------|------------|
| GET | `/clinical/patients/{patientId}/timeline` | `clinical:timeline:read` |
| GET | `/patients/me/clinical-timeline` | `patient:profile:read` |

Live aggregate of encounters, clinical vitals, diagnoses, notes, and orders. Separate from consumer `/patients/me/profile/timeline`.

---

## P2-F1 — Appointment Arrival

| Method | Path | Permission |
|--------|------|------------|
| POST | `/scheduling/appointments/{id}/arrive` | `appointment:arrive` (or `opd:registration:write`) |

Also: `POST /opd/registrations/check-in` sets appointment `ARRIVED` (V45).

Migration: **V45**

Feature package: [P2-F1](../09-features/P2-opd/P2-F1/README.md). ADR-015. Compat: OPD check-in also sets ARRIVED.

---

## Existing (preserve)

- Patient self-service profile APIs
- OPD queue, encounter, billing APIs (V41)
- See [hms/HMS-API-MAP.md](../hms/HMS-API-MAP.md)

---

## Standards

- Pagination: `page`, `size`, `sort`
- Error envelope: existing `BusinessException` / `ErrorCode`
- Audit headers: correlation ID from gateway/filter
- Idempotency: payment endpoints (future)

Detail per feature in `09-features/*/P*-F*-08-api-design.md`.
