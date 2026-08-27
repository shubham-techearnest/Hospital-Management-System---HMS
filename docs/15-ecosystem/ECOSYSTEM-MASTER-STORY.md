# Complete Digital Healthcare Ecosystem — Master Product Story


| Attribute       | Value                    |
| --------------- | ------------------------ |
| **Document ID** | ECO-STORY-001            |
| **Status**      | DRAFT — pending approval |
| **Updated**     | 2026-08-25               |


---

## 1. Product vision

Build a **complete digital healthcare ecosystem** that removes unnecessary physical waiting, paperwork, fragmented records, and disconnected communication between patients, hospitals, doctors, laboratories, and pharmacies.

The product is **not** “Appointment + Prescription + Lab + Pharmacy as separate apps.”

The product is:

# Patient Healthcare Journey

Everything connects back to the patient. Organizations create healthcare events around that patient. Dashboards reconstruct the journey.

```text
User → Patient → Healthcare Journey
  ├── Hospitals / Doctors / Appointments / OPD Queue
  ├── Encounters (consultation hub)
  ├── Diagnoses / Prescriptions / Wellness plans
  ├── Lab orders → booking → sample → result → report
  ├── Pharmacy requests → verification → dispensing
  ├── Documents / Notifications / Analytics
  └── Follow-up → next consultation
```

---



## 2. Core real-life story (Rahul)

Rahul has fever, weakness, headache, and body pain.

**Traditional path:** stand at reception → register → token → wait → handwritten Rx → find pharmacy → find lab → collect paper reports → lose history next visit.

**Digital path (target):** register once → search hospital/doctor → book → check-in → live queue → digital consult → digital Rx + lab order + wellness plan → choose lab → digital report → structured values → choose pharmacy → dispense → follow-up with full history.

---



## 3. Rahul’s complete digital journey (target)


| Step | Actor               | Outcome                                                |
| ---- | ------------------- | ------------------------------------------------------ |
| 1    | Patient             | Register User + Patient + UHID                         |
| 2    | Patient             | Complete health profile                                |
| 3    | Patient             | Search hospitals                                       |
| 4    | Patient             | Search doctors (see hospital associations + schedules) |
| 5    | Patient             | Book appointment                                       |
| 6    | Patient / Reception | Check-in (app / QR / desk)                             |
| 7    | System              | Join OPD queue + token                                 |
| 8    | Patient             | Track live queue + notifications                       |
| 9    | Doctor              | Consultation on encounter hub                          |
| 10   | Doctor              | Diagnosis + e-Rx + lab orders + wellness plan`         |
| 11   | Patient             | See today’s consultation summary                       |
| 12   | Patient             | Book lab / send Rx to pharmacy                         |
| 13   | Lab                 | Sample → process → verify → publish report             |
| 14   | System              | Structured lab values → dashboard trends               |
| 15   | Pharmacy            | Verify → dispense                                      |
| 16   | Patient             | Unified timeline + follow-up reminder                  |


---



## 4. Identity principles



### User vs Patient


| Concept     | Meaning                         |
| ----------- | ------------------------------- |
| **User**    | Authenticated platform identity |
| **Patient** | Healthcare identity             |


**Rule (already in Health360):** `User 1 → 1 Patient`. A patient is always a user. Healthcare records belong to the patient profile (`patient.patient_profiles`), not to a second patient table.

UHID is the lifelong healthcare identifier (visible in patient portal). Example pattern: `HLT-2026-00001234`.

### Multi-role users

A user may later gain staff roles (doctor, receptionist, pharmacist, etc.) via organization membership + RBAC. Clinical records still hang off the **patient** identity when the person is receiving care.

---



## 5. Organization principles


| Org type                     | Role in journey                                          |
| ---------------------------- | -------------------------------------------------------- |
| **Hospital**                 | OPD/IPD care, doctors, reception, billing                |
| **Laboratory**               | Independent or hospital-linked testing (target: both)    |
| **Pharmacy / medical store** | Independent or hospital-linked dispensing (target: both) |


**As-built today:** Lab and pharmacy are largely **hospital/branch-scoped**. Independent multi-org lab/pharmacy networks are a **future architecture expansion** (see gap analysis + implementation plan). Do not invent parallel clinical hubs.

### Doctor–hospital association

Doctors may affiliate with multiple hospitals/branches/schedules via association (already modeled). Never assume a single permanent hospital ID on the doctor alone.

---



## 6. Clinical event principles


| Concept            | As-built Health360                  | Vision alignment                                        |
| ------------------ | ----------------------------------- | ------------------------------------------------------- |
| Scheduled visit    | `scheduling.appointments`           | Appointment                                             |
| Floor token        | `opd.queue_entries`                 | Queue entry                                             |
| Clinical visit hub | `clinical.encounters`               | Encounter / consultation                                |
| Diagnosis          | `clinical.diagnoses`                | Diagnosis                                               |
| Prescription       | clinical prescriptions (SIGNED)     | Digital Rx                                              |
| Lab order          | clinical orders + laboratory module | Lab order                                               |
| Pharmacy MAR       | pharmacy medication orders          | **Hospital** dispensing — separate from retail Rx share |


**Rule:** Appointment ≠ Queue ≠ Encounter. They link; they do not collapse into one row.

---



## 7. Dashboards (journey-aware)


| Dashboard      | Must show (target)                                                             |
| -------------- | ------------------------------------------------------------------------------ |
| Patient        | UHID, appointments, live queue, Rx, lab, pharmacy, wellness, timeline, metrics |
| Doctor         | Today’s OPD, waiting patients, consultation workspace, history, follow-ups     |
| Reception      | Search, register, book, arrive, queue, tokens                                  |
| Hospital admin | Org, staff, schedules, OPD analytics, settings, audit                          |
| Laboratory     | Bookings, samples, processing, verification, reports                           |
| Pharmacy       | Rx requests, verification, availability, dispensing                            |


**Rule:** Audit existing dashboards before rebuilding. Reuse what works; fill gaps.

---



## 8. Security & audit (non-negotiable)

- Authentication + RBAC + organization isolation
- Patient sees only own clinical data
- Reception cannot edit diagnosis / Rx / lab results
- Pharmacist cannot edit doctor diagnosis
- Lab tech cannot edit prescriptions
- Sensitive actions auditable and non-casually deletable
- Minimum necessary access

---



## 9. Definition of Done (ecosystem features)

A feature is **not** done because a screen exists. It is done when:

- Domain model + migration (V58+ if needed)
- Entity / repository / service / API
- Authorization + validation + error handling
- Status transitions protected on backend
- Frontend integration (loading / empty / error)
- Notifications where required
- Audit where required
- Tests + documentation
- **Real-world workflow works end-to-end**

See also: [Definition of Done](../00-governance/definition-of-done.md).

---



## 10. Implementation philosophy

For every workflow, document before coding:

1. Actor
2. Business goal
3. Preconditions
4. User action
5. System action
6. Database changes
7. API calls
8. Notifications
9. Permissions
10. Audit
11. Success / failure / edge cases

Then implement **dependency order** (see [ECOSYSTEM-IMPLEMENTATION-PLAN.md](./ECOSYSTEM-IMPLEMENTATION-PLAN.md)).

---



## 11. What already works (do not discard)

Health360 already delivers a strong **hospital-centric OPD spine**:

Identity → search/book → arrive → queue → encounter → structured consult → e-Rx → checkout gate → patient OPD live status.

This master story **extends** that spine into lab choice, pharmacy choice, wellness plans, richer notifications, independent orgs, and longitudinal analytics — it does not replace it.

---



## 12. Final experience (acceptance narrative)

Rahul books Dr. Sharma at ABC Hospital → arrives / checks in → token A-23 → sees queue live → consult → viral fever diagnosis → Rx + CBC/CRP + hydration plan → books ABC Diagnostics → report lands with structured Hb/WBC → sends Rx to XYZ Medical Store → medicines ready → 5-day follow-up → doctor sees prior consult + labs + dispense history.

Until that continuous journey works with role-correct permissions and audit, the ecosystem is incomplete — even if individual CRUD screens exist.