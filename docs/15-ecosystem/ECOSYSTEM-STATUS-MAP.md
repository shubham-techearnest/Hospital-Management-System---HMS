# Ecosystem Status Map — Vision Vocabulary ↔ Health360 As-Built

| Attribute | Value |
|-----------|-------|
| **Document ID** | ECO-STATUS-001 |
| **Status** | **APPROVED — product standard (UI labels; enums unchanged)** |
| **Updated** | 2026-08-25 |

**Rule:** Prefer **UI labels** that match the vision language. Do **not** rename database enums without an approved ADR + Flyway V56+.

---

## 1. Appointment (`scheduling.appointments`)

| Vision term | Health360 status | Meaning |
|-------------|------------------|---------|
| BOOKED | `PENDING` or `CONFIRMED` | Slot reserved (product may show “Booked”) |
| CONFIRMED | `CONFIRMED` | Confirmed |
| CHECKED_IN | `ARRIVED` | Patient arrived / checked in |
| QUEUED | *(no appointment status)* | Represented by **queue entry** `WAITING`/`CALLED` |
| IN_CONSULTATION | *(no appointment status)* | Encounter `IN_PROGRESS` + queue `IN_SERVICE` |
| COMPLETED | `COMPLETED` | Visit finished |
| CANCELLED | `CANCELLED` | Cancelled |
| NO_SHOW | `NO_SHOW` | Did not attend |
| RESCHEDULED | `RESCHEDULED` | Moved to another slot |
| — | `POSTPONED` | As-built extra |

---

## 2. Queue (`opd.queue_entries`)

| Vision | Health360 | Notes |
|--------|-----------|-------|
| Waiting | `WAITING` | Token issued |
| Called / please proceed | `CALLED` | |
| In consultation | `IN_SERVICE` | Synced from doctor start (P2-F10) |
| Completed | `COMPLETED` | |
| Skipped | `SKIPPED` | Recall → `CALLED` |
| Absent / no-show | `NO_SHOW` | |
| Cancelled | `CANCELLED` | |

---

## 3. Encounter / consultation (`clinical.encounters`)

| Vision | Health360 | Notes |
|--------|-----------|-------|
| Registered | `REGISTERED` | Rare for OPD; walk-in usually WAITING |
| Waiting | `WAITING` | On floor |
| In consultation | `IN_PROGRESS` | Doctor started |
| Completed | `COMPLETED` | |
| Cancelled | `CANCELLED` | |

**Architecture:** Encounter **is** the consultation hub. Do not add a parallel `consultations` table.

---

## 4. Prescription

| Vision | Health360 |
|--------|-----------|
| Draft | `DRAFT` |
| Signed / issued | `SIGNED` |
| (Dispensing) | **Pharmacy request** (future ECO-P4) — not the Rx status itself |

---

## 5. Laboratory (target lifecycle)

Hospital lab today uses module-specific statuses. ECO-P3 UI labels (DB enums unchanged):

```text
ORDERED → RECEIVED (booked) → SAMPLE_COLLECTED → RESULTS_DRAFT → VERIFIED → RELEASED
```

Product journey language maps RECEIVED≈BOOKED and RELEASED≈REPORT_PUBLISHED (see ECO-P3 README).

---

## 6. Pharmacy request (target — ECO-P4)

```text
REQUESTED → RECEIVED → UNDER_REVIEW → PARTIALLY_AVAILABLE → AVAILABLE → READY → DISPENSED
                                         ↘ CANCELLED
```

Distinct from inpatient **MAR** / medication order statuses.

---

## 7. Canonical visit progression (product)

```text
Appointment PENDING/CONFIRMED
    → ARRIVED (check-in)
    → Queue WAITING (+ token)
    → Queue CALLED (optional)
    → Encounter IN_PROGRESS + Queue IN_SERVICE
    → Encounter COMPLETED + Queue COMPLETED + Appointment COMPLETED
    → Billing / Lab booking / Pharmacy request (post-consult)
```

This is the single story all portals must tell.
