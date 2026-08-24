# Health360 HMS — NEXT ACTION

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-NEXT-001 |
| **Status** | **ACTIVE** |
| **Last Updated** | 2026-08-24 |

---

## CURRENT STATUS

**P2-F6 + P2-F7 OPD realism — IN QA**

Delivered:
1. Walk-in find-or-register → auto UHID + ACTIVE desk login (temp email/password in API log + UI once)
2. Doctor pick on walk-in + queue Call/Start/Assign (`GET /opd/doctors`)
3. Reception slot booking + hospital appointment complete/no-show
4. Patient portal live OPD status (`/patient/opd`) + in-app hospital reminders
5. Hospital clinical catalogs (symptoms, dosage templates) on doctor consultation / e-Rx

Flyway: **V51** (receptionist doctor read), **V52** (RBAC + catalogs), **V53** (catalog version columns)

Backlog remaining: SMS/WhatsApp gateway, ICD diagnosis catalog, guided vitals→bill checklist.

---

## IMMEDIATE NEXT ACTION

1. Restart API so Flyway applies **V51–V53**
2. Sign in again (JWT must pick up new permissions)
3. UAT checklist:
   - Walk-in: search miss → Create patient → copy credentials from UI/terminal → register walk-in with doctor
   - Desk: Book / close — book slot, complete/no-show
   - Queue: assign doctor on Call/Start
   - Patient: login with desk credentials → `/patient/opd` + reminders after Call
   - Hospital: `/hospital/catalogs` → symptoms on doctor consultation

---

## Recent

| Item | Status | Date |
|------|--------|------|
| P2-F6/F7 OPD realism (walk-in credentials, book/close, portal, catalogs) | IN QA | 2026-08-24 |
| P2-F1…F5 | IN QA | 2026-08-21 |
