# P2-F10 — Connected OPD visit (all roles, one status)

| Feature ID | P2-F10 |
| Epic | EPIC-04 OPD + EPIC-03 Scheduling |
| Sprint | 12 |
| Release | R2 |
| **Approval Status** | **APPROVED — IN QA** |
| Approved | 2026-08-24 |

---

## Business problem

Doctors start and complete consultation on the doctor panel (`clinical.encounters`). Hospital admin and reception watch `opd.queue_entries`. The patient watches appointments until they arrive, then the token. Those stores were updated independently, so a doctor “Start consultation” left the desk queue on WAITING/CALLED.

## Goal

One visit, one truth:

- **Encounter** is the clinical hub (already the PatientVisit).
- **Queue** is the desk/token view of that same visit.
- **Appointment** is the booked slot until the patient arrives, then ARRIVED, then COMPLETED when the visit closes.

Each role only does the work they own. Everyone can **see** the same visit progress.

## Package

| Doc | Title |
|-----|-------|
| [P2-F10-02](./P2-F10-02-user-stories.md) | User stories (patient, reception, doctor, hospital) |
| [P2-F10-04](./P2-F10-04-business-workflow.md) | Real-hospital scenarios and status map |

## Architecture rules preserved

- Encounter remains PatientVisit hub — no parallel Visit table
- Flyway V1–V55 unchanged (no schema change required)
- Patient self-book remains `POST /scheduling/appointments`
- Checkout still requires FINAL consult + SIGNED e-Rx (P2-F9)
