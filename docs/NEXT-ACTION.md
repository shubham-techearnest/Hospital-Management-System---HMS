# Health360 HMS — NEXT ACTION

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-NEXT-001 |
| **Status** | **ACTIVE** |
| **Last Updated** | 2026-08-21 |

---

## CURRENT STATUS

**Walk-in find-or-register + desk credentials + OPD doctor pick — READY FOR QA**

- Auto UHID + temp login (logged to terminal + returned once) on desk patient register
- Walk-in UI: search existing or create new, then queue with optional doctor
- `GET /api/v1/opd/doctors` for reception/hospital OPD
- V51: receptionist doctor-read RBAC
- Backlog: [HOSPITAL-OPD-REALISM-BACKLOG.md](./hms/HOSPITAL-OPD-REALISM-BACKLOG.md)

---

## IMMEDIATE NEXT ACTION

1. Restart API so Flyway V51 applies; register a new walk-in and confirm terminal shows `PATIENT DESK CREDENTIALS`
2. Login as patient with printed temp email/password; confirm portal access
3. Pick next backlog item: reception slot booking **or** hospital clinical catalogs

---

## Recent

| Item | Status | Date |
|------|--------|------|
| Walk-in find-or-register + credentials | IN QA | 2026-08-21 |
| P2-F1…F5 OPD features | IN QA | 2026-08-21 |
