# P1-F3-02 — User Stories

| Feature | P1-F3 |
| Status | APPROVED |

## US-CLIN-010 — Staff view clinical timeline

**As a** Doctor/Nurse/Receptionist, **I want** a clinical timeline for a patient, **so that** I see visit activity in order.

**AC:** Given `clinical:timeline:read`, GET by patientId returns newest-first clinical events (encounters, vitals, diagnoses, notes, orders). Does not include consumer `VITALS_RECORDED` wellness rows.

## US-CLIN-011 — Patient view own clinical timeline

**As a** Patient, **I want** to see my hospital visit clinical events, **so that** I understand what happened in care.

**AC:** `GET /patients/me/clinical-timeline` with `patient:profile:read` and consent.

## US-CLIN-012 — Keep wellness timeline separate

**As a** Product Owner, **I want** `/profile/timeline` unchanged for wellness events, **so that** FR-PAT-015 holds.
