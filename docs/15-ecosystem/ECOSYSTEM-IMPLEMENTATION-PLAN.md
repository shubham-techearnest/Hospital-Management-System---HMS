# Ecosystem Implementation Plan (Docs-first → Step-by-step)

| Attribute | Value |
|-----------|-------|
| **Document ID** | ECO-PLAN-001 |
| **Status** | DRAFT — **NO CODE until package approved** |
| **Updated** | 2026-08-25 |

---

## 1. Strategy

1. **Preserve** working OPD spine (P1–P2-F10, HMS foundations).  
2. **Close journey gaps** in dependency order.  
3. Each phase ships **end-to-end workflow**, not orphan CRUD.  
4. New schemas only via **Flyway V58+**.  
5. Independent lab/pharmacy orgs only after ADR approval.

```text
APPROVE DOCS → ECO-P0 harden & connect → ECO-P1 patient ops →
ECO-P2 clinical completeness → ECO-P3 lab journey → ECO-P4 pharmacy journey →
ECO-P5 notifications & check-in → ECO-P6 timeline/analytics → ECO-P7 multi-org & HR
```

---

## 2. Phase overview

| Phase | Name | Goal | Depends on |
|-------|------|------|------------|
| **ECO-P0** | Stabilize & document truth | Finish OPD IN QA; freeze status vocabulary; dashboard audit | — |
| **ECO-P1** | Patient ops polish | Discovery UX, UHID prominence, reception search completeness | P0 |
| **ECO-P2** | Clinical completeness | Patient summary strip, wellness plan, structured follow-up | P0 |
| **ECO-P3** | Lab journey (hospital-first) | Order → book → sample → verify → patient report → structured values | P2 |
| **ECO-P4** | Pharmacy Rx share (hospital-first then retail) | Send signed Rx → verify → ready → dispense record | P2 |
| **ECO-P5** | Check-in & notifications | QR/self check-in; SMS/push; approaching/ready/report events | P1, P3, P4 |
| **ECO-P6** | Timeline & analytics | Unified journey timeline; lab/vital trends on patient dashboard | P3–P5 |
| **ECO-P7** | Multi-org & HR depth | Independent lab/pharmacy orgs; employment lifecycle | ADR + P3/P4 |

Parallel existing roadmap (IPD P4, gateway P5, security P6) continues unless resources conflict — see [feature-list.md](../13-project-management/feature-list.md).

---

## 3. Phase detail

### ECO-P0 — Stabilize & document truth

**Features:** ECO-F0.1 … ECO-F0.3

| ID | Work | Type |
|----|------|------|
| ECO-F0.1 | Complete P2-F10 / checkout gate QA; fix only defects | QA |
| ECO-F0.2 | Publish status map (appointment / queue / encounter) as product standard | Docs |
| ECO-F0.3 | Dashboard audit matrix (patient/doctor/reception/hospital/lab/pharmacy) — reuse vs rebuild | Docs |

**Exit:** Approved status map + dashboard audit; OPD spine signed off for extension.

---

### ECO-P1 — Patient & desk operations polish

| ID | Work | Gap tag |
|----|------|---------|
| ECO-F1.1 | Patient portal: UHID hero on dashboard/profile | PARTIAL |
| ECO-F1.2 | Doctor availability by hospital/branch clearer in book flow | PARTIAL |
| ECO-F1.3 | Reception search: appointment ID + stronger duplicate prevention UX | PARTIAL |
| ECO-F1.4 | Hospital discovery filters (services / OPD / emergency) incremental | PARTIAL |

**Exit:** Patient can discover → book → desk can find/register without duplicate friction.

---

### ECO-P2 — Clinical completeness on Encounter

| ID | Work | Gap tag |
|----|------|---------|
| ECO-F2.1 | Doctor pre-consult **patient summary** (profile, allergies, prior Rx, labs, timeline) | **IN QA** |
| ECO-F2.2 | **Wellness plan** entity linked to encounter (diet/rest/exercise/lifestyle/follow-up) | **IN QA** |
| ECO-F2.3 | Patient “Today’s consultation” summary (Dx, Rx, labs, wellness, follow-up) | **IN QA** |
| ECO-F2.4 | Structured follow-up date → reminder job (notification later in P5) | **PARTIAL** (date stored; notify in P5) |

**Architecture:** Wellness plan hangs off **Encounter**, not a new Visit table.

**Exit:** After consult, patient sees complete digital visit package including wellness.

---

### ECO-P3 — Laboratory journey (hospital-linked first)

| ID | Work | Gap tag |
|----|------|---------|
| ECO-F3.1 | Harden lab portal workflows (booking list, sample collect, result entry, verify) | **IN QA** |
| ECO-F3.2 | Patient sees doctor’s lab orders and can book hospital lab slot | **IN QA** |
| ECO-F3.3 | Publish verified report to patient + in-app notify | **IN QA** |
| ECO-F3.4 | Persist structured parameters → patient analytics feed | **IN QA** |

**Defer:** Independent lab marketplace → ECO-P7 (after ADR).

**Exit:** Order → hospital lab → report → structured values without paper.

---

### ECO-P4 — Pharmacy prescription fulfill (share flow)

| ID | Work | Gap tag |
|----|------|---------|
| ECO-F4.1 | Patient “Send prescription to pharmacy” (hospital pharmacy first) | MISSING |
| ECO-F4.2 | Pharmacy request lifecycle REQUESTED→…→DISPENSED (separate from MAR) | MISSING |
| ECO-F4.3 | Pharmacist verify + dispense audit; patient status visible | MISSING |
| ECO-F4.4 | Optional: availability / partial fill | PARTIAL |

**Keep:** Clinical MAR for inpatient remains distinct.

**Defer:** Independent retail pharmacy network → ECO-P7.

**Exit:** Signed e-Rx → pharmacy request → dispensed record on patient journey.

---

### ECO-P5 — Check-in & notifications

| ID | Work | Gap tag |
|----|------|---------|
| ECO-F5.1 | Patient self check-in (appointment QR / deep link) → ARRIVED + queue | MISSING |
| ECO-F5.2 | SMS/WhatsApp gateway (credentials, queue, report, Rx ready) | MISSING |
| ECO-F5.3 | Queue approaching + token called polish | PARTIAL |
| ECO-F5.4 | Follow-up / report available / medicine ready notification types | MISSING |

**Exit:** Patient can minimize desk wait; critical events reach patient off-app.

---

### ECO-P6 — Unified timeline & health dashboard

| ID | Work | Gap tag |
|----|------|---------|
| ECO-F6.1 | Journey timeline: registration→book→queue→encounter→Rx→lab→pharmacy | PARTIAL |
| ECO-F6.2 | Lab trends + vitals trends on patient dashboard | PARTIAL |
| ECO-F6.3 | Document center taxonomy (Rx, reports, invoices, certificates) | PARTIAL |

**Exit:** Follow-up visit reconstructs prior journey in one place.

---

### ECO-P7 — Multi-organization & HR depth

| ID | Work | Gap tag |
|----|------|---------|
| ECO-F7.1 | ADR: independent Laboratory organization + membership | MISSING |
| ECO-F7.2 | ADR: independent Pharmacy organization + membership | MISSING |
| ECO-F7.3 | Patient chooses nearby registered lab/pharmacy network | MISSING |
| ECO-F7.4 | Employment lifecycle / HR documents / transfer | PARTIAL |
| ECO-F7.5 | Cross-org access grants (explicit only) | MISSING |

**Exit:** Platform hosts Hospital A + Lab B + Pharmacy C with isolation + patient choice.

---

## 4. Mapping vision “Development Order” → ECO phases

| Vision phase | ECO phase |
|--------------|-----------|
| 1 Identity | Mostly **EXISTS** → polish in P1 |
| 2 Organizations | Hospital **EXISTS**; lab/pharm orgs → **P7** |
| 3 Staff | **PARTIAL** → P7 HR; P0/P1 ops |
| 4 Hospital OPD | **EXISTS** → P0 stabilize |
| 5 Clinical consultation | **EXISTS** + P2 wellness/summary |
| 6 Laboratory | P3 then P7 |
| 7 Pharmacy | P4 then P7 |
| 8 Documents | P6 |
| 9 Notifications | P5 |
| 10 Analytics | P6 |
| 11 Security & audit | Continuous + existing P6-F* |

---

## 5. Feature ID registry (new)

| Feature ID | Phase | Name | Doc status |
|------------|-------|------|------------|
| ECO-F0.1 | P0 | OPD spine QA closeout | DRAFT |
| ECO-F0.2 | P0 | Status vocabulary standard | DRAFT |
| ECO-F0.3 | P0 | Dashboard audit matrix | DRAFT |
| ECO-F1.1–F1.4 | P1 | Patient/desk polish | DRAFT |
| ECO-F2.1–F2.4 | P2 | Clinical completeness | IN QA |
| ECO-F3.1–F3.4 | P3 | Lab journey | IN QA |
| ECO-F4.1–F4.4 | P4 | Pharmacy Rx share | DRAFT |
| ECO-F5.1–F5.4 | P5 | Check-in & notifications | DRAFT |
| ECO-F6.1–F6.3 | P6 | Timeline & analytics | IN QA |
| ECO-F7.1–F7.5 | P7 | Multi-org & HR | IN QA (F7.1–F7.3 first slice) |

Detailed stories: [ECOSYSTEM-USER-STORIES.md](./ECOSYSTEM-USER-STORIES.md).

When a feature is approved for build, create a full package under `docs/09-features/` (same pattern as P2-F1).

---

## 6. Explicit non-goals (until approved)

- Editing Flyway V1–V55  
- Parallel Patient / Visit / Consultation tables  
- Replacing OPD queue with appointment-only status  
- Full WHO ICD import / external coding API  
- SMS provider choice before DEC/gateway ADR  
- Blind UI rebuild of working portals  

---

## 7. Step-by-step after documentation approval

1. Senior approval of this package (README approval gate).  
2. Execute **ECO-P0** only (QA + status map + dashboard audit deliverable).  
3. Product picks **ECO-P1** or **ECO-P2** as first build slice.  
4. For that slice: write feature README + stories + FR + DB/API (V56+ if needed) → implement → QA.  
5. Do not start P3–P7 until prior phase exit criteria met.

**Current engineering stance:** Package **approved**. ECO-P3–P4 **RELEASED**. ECO-P5–P7 **IN QA** (partner orgs per ADR-016).
