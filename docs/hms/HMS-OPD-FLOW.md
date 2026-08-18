# HMS OPD Flow — Registration to Consultation Complete

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-OPD-FLOW-001 |
| **Last Updated** | 2026-08-18 |

---

## Actors

| Actor | Portal | Permissions |
|-------|--------|-------------|
| Hospital admin / front desk | Web `/hospital/opd` | `opd:*`, `clinical:encounter:read` |
| Doctor | Web `/doctor/opd`, Mobile Visits tab | `clinical:encounter:*`, `clinical:order:*` |
| Patient | Web `/patient/encounters`, Mobile Home → My visits | `clinical:encounter:read` |

---

## End-to-end flow

```mermaid
sequenceDiagram
  participant Desk as Front desk
  participant OPD as OPD API
  participant Clinical as Clinical API
  participant Doctor as Doctor
  participant Patient as Patient

  alt Walk-in
    Desk->>OPD: POST /opd/registrations/walk-in
    OPD->>Clinical: Create encounter (REGISTERED)
    OPD->>OPD: Create queue entry (WAITING)
  else Appointment check-in
    Desk->>OPD: POST /opd/registrations/check-in
    OPD->>Clinical: Create/link encounter
    OPD->>OPD: Queue entry (WAITING)
  end

  Desk->>OPD: GET /opd/queue (paginated)
  Desk->>OPD: POST /queue/{id}/call → CALLED
  Desk->>OPD: POST /queue/{id}/start → IN_SERVICE
  OPD->>Clinical: Encounter → IN_PROGRESS

  Doctor->>Clinical: GET /encounters/doctor/me?todayOnly=true
  Doctor->>Clinical: POST /encounters/{id}/start (if needed)
  Doctor->>Clinical: Diagnoses, notes, orders
  Doctor->>Clinical: POST /encounters/{id}/complete
  Desk->>OPD: POST /queue/{id}/complete → COMPLETED

  Patient->>Clinical: GET /encounters/me
  Patient->>Clinical: GET /encounters/{id}/diagnoses|notes|orders
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

Queue **start** transitions both queue entry and linked encounter. Doctor convenience endpoints (`check-in`, `start`, `complete`) can drive encounter status directly when working from the doctor OPD screen.

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
| Doctor web | `/doctor/opd` — today's encounters; `/doctor/encounters/:id` — detail + actions |
| Patient web | `/patient/encounters`, `/patient/encounters/:id` |
| Doctor mobile | Visits tab → Today's OPD → Encounter detail |
| Patient mobile | Dashboard → My visits → Visit detail |

---

## Operational notes

- Re-login required after V30/V31/V32 migrations so JWT includes `clinical:*` and `opd:*` permissions.
- OPD queue polls every 15s on hospital web; doctor OPD refreshes every 30s.
- Queue list is paginated (default `size=50`); use `page` query param for large queues.
