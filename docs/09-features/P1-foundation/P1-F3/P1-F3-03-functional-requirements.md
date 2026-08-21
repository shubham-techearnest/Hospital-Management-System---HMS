# P1-F3-03 — Functional Requirements

| Feature | P1-F3 |
| Status | APPROVED |

| ID | Requirement |
|----|-------------|
| CLIN-TL-01 | Staff timeline shall aggregate encounter lifecycle, clinical vitals, diagnoses, notes, orders |
| CLIN-TL-02 | Events shall sort by `occurredAt` descending |
| CLIN-TL-03 | Response shall be paginated (`page`, `size`) |
| CLIN-TL-04 | Staff API shall not return consumer wellness timeline events |
| CLIN-TL-05 | Patient self API shall only return the authenticated patient's clinical events |
| CLIN-TL-06 | Missing patient → 404; missing permission → 403 |

NFR: p95 &lt; 2s for ≤50 recent encounters.
