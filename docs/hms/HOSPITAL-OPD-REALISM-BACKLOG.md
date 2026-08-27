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
4. Doctor consultation / e-Rx dropdowns use **platform** symptom + dosage catalogs (hospitals do not add these; meds/labs still Pharmacy/Lab modules)

## Done in P2-F8 (2026-08-24)

5. **Platform ICD diagnosis catalog** (`hospital.diagnosis_catalog`, V54 + V55 defaults)
6. Doctor encounter ICD search → fills existing `clinical.diagnoses.diagnosis_code` / `diagnosis_text`
7. Hospital Catalogs admin UI removed — catalogs are system-seeded

## Done in P2-F9 (2026-08-24)

8. Guided **visit checklist** on doctor encounter + reception checkout (vitals → consult → diagnosis → e-Rx → labs → bill), computed from existing encounter data
9. **Checkout gate** — invoice create blocked until finalized consultation + signed e-prescription (hospital admin included)

## Done in P2-F10 (2026-08-24)

10. **Connected visit status** — doctor start/complete syncs queue (+ appointment on complete); hospital/reception show Queue + Consult; patient Book OPD in nav
11. Stories: [P2-F10](../09-features/P2-opd/P2-F10/README.md)

---

## Remaining real-hospital steps (prioritized)

OPD spine work continues under **ecosystem program** — see [../15-ecosystem/README.md](../15-ecosystem/README.md) (docs-first; ECO-P0 → ECO-P7).

### Later (also tracked in ecosystem plan)

1. **SMS / WhatsApp gateway** — ECO-P5
2. Patient notifications polish for Rx ready / bill due — ECO-P5
3. Self check-in / QR — ECO-P5
4. Wellness plan + patient consult summary — ECO-P2
5. Lab / pharmacy patient journeys — ECO-P3 / ECO-P4

---

## Non-goals until approved

- Full WHO ICD-10 master import / external coding API
- Parallel Patient/Visit tables
- SMS provider choice (log-first until DEC)
- Editing Flyway V1–V55
