# Use Cases Catalogue (Master)

| Document ID | REQ-UC-001 |
| Status | DRAFT |

---

## UC-PAT-001 — Register new hospital patient

| Field | Value |
|-------|-------|
| Actor | Receptionist |
| Preconditions | Authenticated; staff assigned to hospital |
| Trigger | Walk-in patient without prior record |
| Main flow | Open register → fill demographics → submit → UHID assigned → receipt |
| Alt | Duplicate candidates → open existing |
| Post | Patient searchable; ready for encounter |
| Feature | P1-F1 |

---

## UC-PAT-002 — Search existing patient

| Field | Value |
|-------|-------|
| Actor | Receptionist |
| Trigger | Patient claims prior visit |
| Main flow | Search UHID/mobile/name → select → verify identity |
| Feature | P1-F1 |

---

## UC-OPD-001 — Mark appointment arrived

| Field | Value |
|-------|-------|
| Actor | Receptionist |
| Main flow | Find appointment → Arrive → encounter + queue created |
| Feature | P2-F1 |

---

## UC-CLIN-001 — Record encounter vitals

| Field | Value |
|-------|-------|
| Actor | Nurse |
| Main flow | Open encounter → enter vitals → save → audit |
| Feature | P1-F2 |

---

*Full UC set expands per phase; trace to FLOW-xxx in [workflows-catalogue.md](../01-product/workflows-catalogue.md).*
