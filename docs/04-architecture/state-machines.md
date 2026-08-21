# State Machines — Health360 HMS

| Document ID | ARCH-STATE-001 |
| Status | DRAFT |

Each transition documents: actor, permission, validation, DB update, audit, notification, failure.

---

## Appointment

```text
PENDING → CONFIRMED → ARRIVED → (OPD encounter/queue WAITING) → COMPLETED
  └→ CANCELLED / NO_SHOW / RESCHEDULED / POSTPONED
```

| Transition | Actor | Permission | Audit |
|------------|-------|------------|-------|
| → ARRIVED | Receptionist | `appointment:arrive` | APPOINTMENT_ARRIVED |
| → CANCELLED | Receptionist/Patient | role-specific | APPOINTMENT_CANCELLED |

**Alignment rule (P2-F1):** ARRIVED triggers encounter **WAITING** + queue **WAITING** (V45). Slot status uses BOOKED; appointment does not.

---

## Queue (`opd.queue_entries`)

```text
WAITING → CALLED → IN_SERVICE → COMPLETED
  └→ SKIPPED → CALLED (recall)
  └→ CANCELLED / NO_SHOW
```

| Transition | Actor | Permission |
|------------|-------|------------|
| SKIP | Receptionist | `opd:queue:write` |
| RECALL | Receptionist | `opd:queue:write` |

Recall: SKIPPED → CALLED, priority += 10, `recalled_at` set (P2-F2 / V46).

---

## Encounter

```text
OPEN → IN_PROGRESS → COMPLETED → CLOSED
  └→ CANCELLED
```

Maps to existing `clinical.encounters.status` values; align naming in P2-F1 doc.

---

## Admission (IPD)

```text
REQUESTED → APPROVED → ADMITTED → TRANSFERRED*
  → DISCHARGE_REQUESTED → DISCHARGED
```

*TRANSFERRED via `ipd.bed_movements` (planned P4-F4).

---

## Prescription

```text
DRAFT → SIGNED → DISPENSED / PARTIALLY_DISPENSED → COMPLETED
  └→ CANCELLED
```

Signing = immutable; pharmacy updates fulfillment status only.

---

## Invoice

```text
DRAFT → ISSUED → PARTIALLY_PAID → PAID
  └→ REFUNDED / CANCELLED
```

As-built in `billing.invoices` (V41).
