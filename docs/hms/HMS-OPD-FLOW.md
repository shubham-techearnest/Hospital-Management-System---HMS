# HMS OPD Flow — Registration to Consultation Complete

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-OPD-FLOW-001 |
| **Last Updated** | 2026-08-24 |

---

## Actors

| Actor | Portal | Permissions |
|-------|--------|-------------|
| Hospital admin / front desk | Web `/hospital/opd` | `opd:*`, `clinical:encounter:read` |
| Reception | Web `/reception/dashboard` | `opd:*` |
| Doctor | Web `/doctor/opd`, Mobile Visits tab | `clinical:encounter:*`, `clinical:order:*` |
| Patient | Web `/patient/book`, `/patient/opd`, `/patient/appointments` | `appointment:book`, `clinical:encounter:read` |

Connected visit stories: [P2-F10](../09-features/P2-opd/P2-F10/README.md).

---

## End-to-end flow

```mermaid
sequenceDiagram
  participant Patient as Patient
  participant Desk as Front desk
  participant OPD as OPD API
  participant Clinical as Clinical API
  participant Doctor as Doctor

  alt Patient self-book
    Patient->>Clinical: POST /scheduling/appointments
    Note over Patient: Appointment PENDING/CONFIRMED — no token yet
  end

  alt Walk-in
    Desk->>OPD: POST /opd/registrations/walk-in
    OPD->>Clinical: Create encounter (WAITING)
    OPD->>OPD: Create queue entry (WAITING + token)
  else Appointment arrive
    Desk->>OPD: POST /scheduling/appointments/{id}/arrive
    OPD->>Clinical: Encounter WAITING
    OPD->>OPD: Queue WAITING + token
  end

  Desk->>OPD: GET /opd/queue (paginated)
  Desk->>OPD: POST /queue/{id}/call → CALLED

  alt Desk starts
    Desk->>OPD: POST /queue/{id}/start → IN_SERVICE
    OPD->>Clinical: Encounter → IN_PROGRESS
  else Doctor starts
    Doctor->>Clinical: POST /encounters/{id}/start
    Clinical->>OPD: Queue → IN_SERVICE
  end

  Doctor->>Clinical: Vitals, FINAL consult, ICD, SIGNED e-Rx, labs

  alt Doctor completes
    Doctor->>Clinical: POST /encounters/{id}/complete
    Clinical->>OPD: Queue → COMPLETED
    Clinical->>Clinical: Appointment → COMPLETED if linked
  else Desk completes
    Desk->>OPD: POST /queue/{id}/complete → COMPLETED
    OPD->>Clinical: Encounter → COMPLETED
  end

  Patient->>OPD: GET /opd/me/today
  Desk->>Clinical: Checkout invoice (FINAL consult + SIGNED Rx)
```

---

## Status mappings

### Queue entry (`opd.queue_entries`)

| Status | Meaning |
|--------|---------|
| WAITING | Registered, not yet called |
| CALLED | Token announced / patient at desk |
| IN_SERVICE | Consultation in progress |
| COMPLETED | Visit finished |
| CANCELLED / NO_SHOW | Closed without service |

### Encounter (`clinical.encounters`)

| Status | Meaning |
|--------|---------|
| REGISTERED | Created, not yet in waiting area |
| WAITING | Checked in, awaiting doctor |
| IN_PROGRESS | Active consultation |
| COMPLETED | Closed clinically |
| CANCELLED | Voided |

Queue **start/complete** updates the encounter. Doctor **start/complete** syncs the linked queue (and appointment on complete) so hospital and reception show the same visit.

---

## Encounter numbers (V32+)

New encounters receive concurrency-safe numbers from `clinical.encounter_number_sequences`:

- OPD visits: `OPD-2026-000001`
- Other types: `ENC-2026-000001`

Legacy rows may retain the older `ENC-{hospitalPrefix}-{seq}` format.

---

## UI entry points

| Surface | Route / screen |
|---------|----------------|
| Hospital web | `/hospital/opd` — queue tabs, walk-in, check-in, desks |
| Reception web | `/reception/dashboard` — same queue as hospital |
| Doctor web | `/doctor/opd` — today's encounters; `/doctor/encounters/:id` — detail + actions |
| Patient web | `/patient/book`, `/patient/opd`, `/patient/appointments`, `/patient/encounters` |
| Doctor mobile | Visits tab → Today's OPD → Encounter detail |
| Patient mobile | Dashboard → My visits → Visit detail |

---

## Operational notes

- Re-login required after V30/V31/V32 migrations so JWT includes `clinical:*` and `opd:*` permissions.
- OPD queue polls every 8s on hospital/reception web; doctor OPD refreshes every 10s.
- Queue list is paginated (default `size=50`); use `page` query param for large queues.
