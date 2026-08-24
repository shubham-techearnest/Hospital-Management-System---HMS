# Hospital OPD — Real-hospital backlog (post walk-in slice)

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-OPD-BACKLOG-001 |
| **Status** | ACTIVE |
| **Updated** | 2026-08-24 |

---

## Done in this slice (desk walk-in)

- Find patient by UHID / mobile / UUID / name+DOB
- If not found: register at desk → auto UHID + ACTIVE portal login (temp email + password)
- Credentials logged to API terminal (SMS deferred) and shown once in UI
- Optional portal invite link to set a personal email later
- Doctor selection on walk-in (`primaryDoctorId`) via `GET /api/v1/opd/doctors`

## Done in P2-F7 (2026-08-21)

1. Reception **slot booking** + hospital **complete / no-show** (`Book / close` tab)
2. **Reassign doctor** on queue Call/Start/Skip/Recall + Assign button; patient OPD_* in-app notifications
3. Patient portal **`/patient/opd`** live token status + hospital reminders inbox
4. Hospital **`/hospital/catalogs`** symptoms + dosage templates; doctor consultation / e-Rx dropdowns (meds/labs still Pharmacy/Lab modules)

---

## Remaining real-hospital steps (prioritized)

### Later

1. **SMS / WhatsApp gateway** — replace terminal credential / reminder logs with real delivery
2. **ICD / diagnosis catalog** favorites for assessment
3. Patient notifications polish for Rx ready / bill due
4. Guided end-to-end checklist UI across vitals → consult → Rx → labs → billing

---

## Non-goals until approved

- Parallel Patient/Visit tables
- SMS provider choice (log-first until DEC)
- Editing Flyway V1–V53
