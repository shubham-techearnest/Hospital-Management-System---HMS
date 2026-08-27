# Ecosystem Gap Analysis — Vision vs Health360 As-Built

| Attribute | Value |
|-----------|-------|
| **Document ID** | ECO-GAP-001 |
| **Status** | DRAFT — pending architect review |
| **Updated** | 2026-08-25 |
| **Basis** | Codebase + docs inspection (Flyway V1–V55, HMS-0…11, P1–P2-F10) |

**Legend**

| Tag | Meaning |
|-----|---------|
| **EXISTS** | Production-shaped and usable end-to-end (may still be IN QA) |
| **PARTIAL** | Backend and/or UI present; depth, journey link, or UX incomplete |
| **MISSING** | Not implemented as a product capability |
| **NEEDS REFACTOR** | Exists but model/API/UI conflicts with target journey |
| **INCORRECT ARCHITECTURE** | Would violate Health360 rules if built as proposed — map carefully |

---

## 1. Identity & patient

| Requirement | Status | Notes |
|-------------|--------|-------|
| User authentication | **EXISTS** | IAM login/register/verify |
| User 1→1 Patient | **EXISTS** | `patient.patient_profiles` |
| UHID | **EXISTS** | V42; desk + portal visibility |
| OTP / mobile verification | **PARTIAL** | Email verification strong; SMS OTP deferred |
| Health profile (demographics, allergies, meds, lifestyle, emergency) | **EXISTS** | Rich patient profile modules |
| Insurance fields | **PARTIAL** | Limited; full TPA **MISSING** |
| Profile photo | **PARTIAL** | Document/storage patterns exist; polish varies |
| Duplicate detection / desk find-or-register | **EXISTS** | P2-F6 walk-in |

---

## 2. Hospital & doctor discovery

| Requirement | Status | Notes |
|-------------|--------|-------|
| Hospital search (name, location) | **EXISTS** | Search + location modules |
| Distance / specialization / services filters | **PARTIAL** | Some filters; not all vision criteria |
| Hospital org profile (branches, depts, facilities) | **EXISTS** | Hospital portal |
| Doctor search | **EXISTS** | Public + patient search |
| Doctor–hospital association + multi-site schedules | **EXISTS** | Association model + schedules |
| Show “doctor available at Hospital X 9–1 / Clinic Y 5–8” clearly in UI | **PARTIAL** | Data exists; UX can be clearer |

---

## 3. Appointment & check-in

| Requirement | Status | Notes |
|-------------|--------|-------|
| Book appointment (patient portal) | **EXISTS** | `/patient/book` |
| Reception book / close slots | **EXISTS** | P2-F7 |
| Appointment statuses | **EXISTS** | PENDING/CONFIRMED/ARRIVED/COMPLETED/… — see [status map](./ECOSYSTEM-STATUS-MAP.md) |
| Vision names BOOKED/CHECKED_IN/QUEUED | **NEEDS REFACTOR** | Do **not** rename enums casually; map vocabulary |
| Self check-in (app / QR / appointment QR) | **MISSING** | Desk arrive EXISTS; patient self check-in / QR **MISSING** |
| Desk-assisted arrive → encounter + queue | **EXISTS** | P2-F1 |

---

## 4. OPD queue

| Requirement | Status | Notes |
|-------------|--------|-------|
| Digital queue + token | **EXISTS** | `opd.queue_entries` |
| Call / skip / recall / start / complete | **EXISTS** | P2-F2 + queue actions |
| Doctor start/complete syncs desk boards | **EXISTS** | P2-F10 |
| Patient live token page | **EXISTS** | `/patient/opd` |
| Patients ahead / ETA / room number | **PARTIAL** | Token + status; ETA/room polish **MISSING** |
| “Turn approaching” notification | **PARTIAL** | Called/in-service/completed in-app; approaching SMS **MISSING** |
| Pause queue / transfer / priority tools | **PARTIAL** | Priority field exists; advanced ops **MISSING** |

---

## 5. Reception

| Requirement | Status | Notes |
|-------------|--------|-------|
| Patient search (UHID, mobile, name, DOB) | **EXISTS** | Reception + hospital registry |
| Search by appointment ID | **PARTIAL** | Arrive by appointment ID; unified search polish |
| Register new patient + portal credentials | **EXISTS** | Walk-in / register flows |
| Queue + booking + checkout on one desk | **EXISTS** | Reception dashboard |
| Must not create duplicate identity | **EXISTS** | Find-or-register rules |

---

## 6. Clinical consultation (encounter hub)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Encounter as consultation hub | **EXISTS** | Architecture rule — keep |
| Patient summary before consult | **PARTIAL** | Timeline/profile exist; single “summary strip” incomplete |
| Chief complaint / structured note | **EXISTS** | P2-F3 |
| Symptoms catalog | **EXISTS** | Platform catalogs |
| Vitals | **EXISTS** | Encounter vitals P1-F2 |
| Diagnosis (+ ICD) | **EXISTS** | P2-F8 |
| E-prescription + sign | **EXISTS** | P2-F4; checkout gate |
| Lab/radiology clinical orders | **EXISTS** | Clinical orders → lab/rad modules |
| Daily routine / diet / exercise **wellness plan** | **EXISTS** | ECO-P2 V56 `clinical.encounter_wellness_plans` |
| Follow-up instruction as first-class | **PARTIAL** | Date stored on wellness + `clinical.followups`; reminder notify is ECO-P5 |
| Digital Rx as permanent record | **EXISTS** | Signed Rx + patient Rx page |
| Guided visit checklist | **EXISTS** | P2-F9 |

---

## 7. Laboratory ecosystem

| Requirement | Status | Notes |
|-------------|--------|-------|
| Hospital-scoped lab + tests + samples + results + reports | **EXISTS** | ECO-P3 portal + patient book/release |
| Patient chooses nearby **independent** lab | **MISSING** | No independent lab org product |
| Patient books lab from doctor order | **EXISTS** (hospital lab) | ECO-P3 book-hospital; independent marketplace **MISSING** (P7) |
| Home collection | **MISSING** | |
| Sample ID tracking end-to-end UX | **PARTIAL** | Model exists; journey UX thin |
| Pathologist verification workflow UI | **PARTIAL** | Status model; portal depth thin |
| Structured result values for analytics | **PARTIAL** | Lab results entities; not fully wired to patient trends |
| Patient self-entered lab values | **EXISTS** | Consumer lab-values (separate from clinical lab) |
| PDF + structured report to patient | **PARTIAL** | Needs journey polish |

---

## 8. Pharmacy / medical store ecosystem

| Requirement | Status | Notes |
|-------------|--------|-------|
| Hospital clinical pharmacy / MAR | **PARTIAL** | HMS pharmacy foundation |
| Independent pharmacy org registration | **MISSING** | |
| Patient “send e-Rx to pharmacy” | **MISSING** | |
| Pharmacy request statuses (REQUESTED→DISPENSED) | **MISSING** | Distinct from MAR |
| Pharmacist verify + dispense audit | **MISSING** (retail) | MAR has hospital-side actions |
| Inventory / POS | **MISSING** | Feature list P3-F2 |
| Medicine ready notification | **MISSING** | |

---

## 9. Documents, timeline, analytics

| Requirement | Status | Notes |
|-------------|--------|-------|
| Health documents upload | **PARTIAL** | Patient reports |
| Unified medical timeline | **PARTIAL** | Clinical timeline P1-F3; not full journey (Rx→lab→pharmacy) |
| Personal health dashboard / metrics | **PARTIAL** | Dashboard + health score |
| Lab trends from verified clinical reports | **EXISTS** | ECO-P3 ingest into `lab_value_records` |
| Document versioning + org ACL matrix | **PARTIAL** | Basic storage; enterprise DM **MISSING** |

---

## 10. Organizations, staff, HR

| Requirement | Status | Notes |
|-------------|--------|-------|
| Hospital as organization | **EXISTS** | |
| Staff invite / roles / RBAC | **PARTIAL** | Staff + roles; not full HRIS |
| Employment lifecycle (INVITED→TERMINATED history) | **PARTIAL** | Status-ish; full HR **MISSING** |
| Pharmacy/Lab staff management (independent org) | **MISSING** | Tied to hospital today |
| Multi-tenant isolation | **EXISTS** | `tenant_id` |
| Multi-org network (hospital + external lab + external pharmacy) | **PARTIAL** / **MISSING** | Hospitals yes; external orgs no |

---

## 11. Notifications & channels

| Requirement | Status | Notes |
|-------------|--------|-------|
| In-app notifications | **EXISTS** | |
| Email (dev/local patterns) | **PARTIAL** | |
| SMS / WhatsApp gateway | **MISSING** | Explicit backlog |
| Push notifications | **MISSING** / **PARTIAL** | Mobile capability limited |
| Queue approaching / Rx ready / report available / follow-up | **PARTIAL** | OPD + LAB_REPORT_READY; SMS/Rx-ready remain P4/P5 |

---

## 12. Billing & payments

| Requirement | Status | Notes |
|-------------|--------|-------|
| OPD invoice + checkout | **EXISTS** / **PARTIAL** | Backend + UI; gate with consult+Rx |
| Payment gateway | **MISSING** | P5-F1 |
| Insurance / TPA | **MISSING** | P5-F2 |

---

## 13. Security & audit

| Requirement | Status | Notes |
|-------------|--------|-------|
| RBAC + portal RoleRoute | **EXISTS** | |
| Audit log service on many writes | **PARTIAL** | Matrix incomplete vs vision |
| Org isolation | **EXISTS** | Hospital-scoped; external org TBD |
| Rate limiting / enterprise hardening | **PARTIAL** | Ongoing P6 |

---

## 14. Architecture risk flags

| Vision ask | Risk | Decision |
|------------|------|----------|
| New “Consultation” table | **INCORRECT ARCHITECTURE** | Use **Encounter** hub |
| New Patient table | **INCORRECT ARCHITECTURE** | Extend `patient_profiles` |
| Merge Appointment + Queue | **INCORRECT ARCHITECTURE** | Keep separate |
| Rename appointment statuses to BOOKED/CHECKED_IN | **NEEDS REFACTOR** | Prefer status map + UI labels; migration only if approved |
| Independent lab/pharmacy orgs | New domain | Requires ADRs + V56+ schemas; do not break hospital lab/pharm |

---

## 15. Summary scores (rough)

| Journey segment | Maturity |
|-----------------|----------|
| Identity → Profile → Search → Book | **Strong** |
| Arrive → Queue → Consult → e-Rx → Bill | **Strong** (IN QA) |
| Wellness plan + follow-up automation | **Partial** (plan + date IN QA; notify ECO-P5) |
| Patient-driven lab marketplace | **Weak** |
| Patient-driven pharmacy fulfill | **Weak** |
| Unified cross-org timeline + analytics | **Medium-weak** |
| SMS/push + QR self check-in | **Weak** |
| Full HR / independent orgs | **Weak** |

**Bottom line:** Health360 is a solid **hospital OPD digital spine**. The ecosystem brief’s largest gaps are **connected post-consult journeys** (lab choice, pharmacy Rx share, wellness plans, notifications, self check-in) and **independent multi-org** lab/pharmacy — not rebuilding OPD from scratch.
