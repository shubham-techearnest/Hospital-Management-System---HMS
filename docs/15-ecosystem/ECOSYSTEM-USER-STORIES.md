# Ecosystem User Stories — Connected Healthcare Journey

| Attribute | Value |
|-----------|-------|
| **Document ID** | ECO-US-001 |
| **Status** | DRAFT — pending approval |
| **Updated** | 2026-08-25 |

Stories are grouped by **ECO phase**. Acceptance criteria are journey-oriented. Points are indicative.

Existing stories (P1/P2) remain authoritative for delivered OPD work; these stories **extend** the ecosystem.

---

## ECO-P0 — Stabilize

### US-ECO-001 — One status language for all roles

**As a** hospital product owner,  
**I want** appointment / queue / encounter statuses documented and used consistently in UI copy,  
**so that** reception, doctors, and patients do not invent conflicting meanings.

**Acceptance:**

- Status map published ([ECOSYSTEM-STATUS-MAP.md](./ECOSYSTEM-STATUS-MAP.md))
- Hospital, reception, doctor, patient UIs use mapped labels
- No silent enum rename without migration ADR

**Phase:** P0 | **Points:** 3

---

### US-ECO-002 — Dashboard audit before rebuild

**As a** product manager,  
**I want** each role dashboard audited (exists / reuse / gap),  
**so that** we do not rebuild working screens.

**Acceptance:**

- Matrix for Patient, Doctor, Reception, Hospital Admin, Lab, Pharmacy
- Each row: screen path, APIs used, gap vs §46–51 of master brief
- Approved list of “reuse / enhance / new”

**Phase:** P0 | **Points:** 5

---

## ECO-P1 — Patient & desk

### US-ECO-010 — See my UHID everywhere that matters

**As a** patient,  
**I want** my UHID visible on dashboard and profile,  
**so that** reception and labs can identify me quickly.

**Acceptance:** UHID displayed; copy-friendly; matches registry format.

**Phase:** P1 | **Points:** 2

---

### US-ECO-011 — Book OPD seeing doctor–hospital schedule clearly

**As a** patient,  
**I want** to see which hospital/branch and time window a doctor is available,  
**so that** I book the right location.

**Acceptance:** Booking flow shows association + schedule; slot book still prevents double booking.

**Phase:** P1 | **Points:** 5

---

### US-ECO-012 — Reception finds me without creating a duplicate

**As a** receptionist,  
**I want** search by UHID / mobile / name+DOB / appointment id,  
**so that** I never create a second patient for the same person.

**Acceptance:** Find-or-register; conflict when duplicate; appointment arrive works from search.

**Phase:** P1 | **Points:** 5

---

## ECO-P2 — Clinical completeness

### US-ECO-020 — Doctor sees complete summary before consult

**As a** doctor,  
**I want** allergies, prior diagnoses, Rx, labs, and key vitals on one summary,  
**so that** I do not hunt across modules.

**Acceptance:** Summary on encounter open; respects RBAC; links to detail.

**Phase:** P2 | **Points:** 8

---

### US-ECO-021 — Doctor issues wellness / daily routine plan

**As a** doctor,  
**I want** to attach diet, rest, exercise, lifestyle, and follow-up guidance to the encounter,  
**so that** the patient leaves with more than medicines.

**Acceptance:**

- Wellness plan stored linked to encounter
- Patient can view in portal
- Appears on “Today’s consultation” summary

**Phase:** P2 | **Points:** 8

---

### US-ECO-022 — Patient sees today’s consultation package

**As a** patient,  
**I want** doctor, hospital, diagnosis, medicines, tests, wellness, and follow-up in one view after visit,  
**so that** I do not need paper.

**Acceptance:** Available after consult complete (and Rx signed where applicable); printable/shareable later optional.

**Phase:** P2 | **Points:** 5

---

### US-ECO-023 — Follow-up is scheduled as data

**As a** patient,  
**I want** a follow-up date from my doctor,  
**so that** the system can remind me (notifications in P5).

**Acceptance:** Follow-up date on wellness/encounter; queryable for reminder job.

**Phase:** P2 | **Points:** 3

---

## ECO-P3 — Laboratory journey

### US-ECO-030 — Patient books hospital lab from doctor order

**As a** patient,  
**I want** to book CBC/CRP ordered by my doctor at the hospital lab,  
**so that** I do not carry a paper form.

**Acceptance:** Order visible; booking creates lab workflow; statuses protected.

**Phase:** P3 | **Points:** 13

---

### US-ECO-031 — Lab collects sample and tracks sample ID

**As a** lab technician,  
**I want** to mark sample collected with a unique sample ID,  
**so that** results stay linked to the right patient and order.

**Acceptance:** Sample ID unique; audit who collected; linked to order/encounter/patient.

**Phase:** P3 | **Points:** 8

---

### US-ECO-032 — Pathologist verifies and patient gets report

**As a** pathologist,  
**I want** to verify results before publish,  
**so that** patients only see validated reports.

**Acceptance:** Cannot publish without verify where configured; patient notified in-app; report in health record.

**Phase:** P3 | **Points:** 8

---

### US-ECO-033 — Structured values feed health metrics

**As a** patient,  
**I want** hemoglobin and similar values charted over time,  
**so that** reports become insights.

**Acceptance:** Parameters stored with unit/ref/abnormal; appear on dashboard trends.

**Phase:** P3 | **Points:** 8

---

## ECO-P4 — Pharmacy Rx share

### US-ECO-040 — Send e-prescription to pharmacy

**As a** patient,  
**I want** to send my signed prescription to a registered pharmacy,  
**so that** I can collect medicines without rewriting the Rx.

**Acceptance:** Only SIGNED Rx; creates pharmacy request; patient sees status.

**Phase:** P4 | **Points:** 13

---

### US-ECO-041 — Pharmacist verifies and dispenses

**As a** pharmacist,  
**I want** to verify the Rx and record dispensing,  
**so that** the patient record shows who dispensed what and when.

**Acceptance:** Status transitions enforced; audit trail; patient “medicines ready/dispensed”.

**Phase:** P4 | **Points:** 13

---

## ECO-P5 — Check-in & notifications

### US-ECO-050 — Self check-in at hospital

**As a** patient,  
**I want** to check in via app/QR when I arrive,  
**so that** I join the queue without always standing at reception.

**Acceptance:** Appointment → ARRIVED; encounter+queue created same as desk arrive; desk can still assist.

**Phase:** P5 | **Points:** 13

---

### US-ECO-051 — Notify when my turn approaches

**As a** patient,  
**I want** a notification when I am next / called,  
**so that** I need not wait in the lobby the whole time.

**Acceptance:** In-app always; SMS when gateway enabled; no spam duplicates.

**Phase:** P5 | **Points:** 8

---

### US-ECO-052 — Notify report ready / medicine ready / follow-up due

**As a** patient,  
**I want** notifications for report available, medicines ready, and follow-up due,  
**so that** the journey continues outside the hospital.

**Acceptance:** Notification types registered; prefs respected; deep links to correct screens.

**Phase:** P5 | **Points:** 8

---

## ECO-P6 — Timeline & analytics

### US-ECO-060 — Unified healthcare timeline

**As a** patient (and authorized doctor),  
**I want** one timeline of appointments, queue, consults, Rx, labs, pharmacy,  
**so that** follow-up care has full context.

**Acceptance:** Events ordered; each links to source entity; RBAC enforced.

**Phase:** P6 | **Points:** 13

---

## ECO-P7 — Multi-org

### US-ECO-070 — Choose an independent laboratory

**As a** patient,  
**I want** to pick a registered nearby lab (not only hospital lab),  
**so that** I can use convenient accredited labs.

**Acceptance:** Requires ADR + org model; isolation between orgs; order still links to patient/encounter.

**Phase:** P7 | **Points:** 21

---

### US-ECO-071 — Choose an independent pharmacy

**As a** patient,  
**I want** to send my Rx to a registered medical store near me,  
**so that** fulfillment is not limited to hospital pharmacy.

**Acceptance:** Same isolation + audit rules as hospital pharmacy flow.

**Phase:** P7 | **Points:** 21

---

## Role permission reminders (all stories)

| Role | Must | Must not |
|------|------|----------|
| Patient | Own data, book, queue view, Rx/lab/pharmacy own | Others’ records |
| Reception | Search, register, book, arrive, queue | Diagnosis / Rx / lab results |
| Doctor | Consult, Dx, Rx, orders, wellness | Dispense as pharmacist / verify lab as pathologist (unless dual role) |
| Pharmacist | Rx request verify/dispense | Edit diagnosis |
| Lab tech | Sample/process/enter | Publish without pathologist when required; edit Rx |
| Hospital admin | Org/staff/schedules/queue oversight | Bypass clinical authorship silently |

---

## Traceability

| Master brief § | Stories |
|----------------|---------|
| §3–4 Identity/profile | US-ECO-010 |
| §5–7 Discovery/book | US-ECO-011 |
| §8–11 Check-in/queue/reception | US-ECO-012, US-ECO-050, US-ECO-051 |
| §12–18 Consultation | US-ECO-020–023 |
| §19–20 Pharmacy | US-ECO-040–041, US-ECO-071 |
| §21–26 Lab | US-ECO-030–033, US-ECO-070 |
| §27–28 Timeline/dashboard | US-ECO-060, US-ECO-002 |
| §38 Notifications | US-ECO-051–052 |
| §45–51 Dashboards | US-ECO-002 |
