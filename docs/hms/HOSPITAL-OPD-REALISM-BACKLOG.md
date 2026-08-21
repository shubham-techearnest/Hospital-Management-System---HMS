# Hospital OPD — Real-hospital backlog (post walk-in slice)

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-OPD-BACKLOG-001 |
| **Status** | ACTIVE |
| **Updated** | 2026-08-21 |

---

## Done in this slice (desk walk-in)

- Find patient by UHID / mobile / UUID / name+DOB
- If not found: register at desk → auto UHID + ACTIVE portal login (temp email + password)
- Credentials logged to API terminal (SMS deferred) and shown once in UI
- Optional portal invite link to set a personal email later
- Doctor selection on walk-in (`primaryDoctorId`) via `GET /api/v1/opd/doctors`

---

## Remaining real-hospital steps (prioritized)

### P3 — OPD operations

1. **Slot booking from reception** — pick doctor → availability → book appointment (reuse scheduling APIs); close by hospital or doctor
2. **Queue status + doctor change** — reassign doctor when calling / skipping / recalling
3. **Patient portal OPD status** — live token / encounter / billing / Rx status + hospital reminders (notifications module)
4. **SMS / WhatsApp gateway** — replace terminal credential logs with real delivery

### P3 — Clinical catalogs (hospital-scoped)

5. **Master data dropdowns** for doctor charting: symptoms, diagnoses (ICD later), medicines, dosages, lab/radiology tests
6. Wire structured notes + e-Rx item pickers to those catalogs (reduce free typing)
7. Hospital admin UI to maintain catalogs per hospital/branch

### P3 — Full visit loop polish

8. Vitals → consult → Rx → labs orders → billing → pharmacy handoff as one guided reception/doctor checklist
9. Patient notifications for each status change (called, in consult, Rx ready, bill due)

---

## Non-goals until approved

- Parallel Patient/Visit tables
- SMS provider choice (log-first until DEC)
- Editing Flyway V1–V50
