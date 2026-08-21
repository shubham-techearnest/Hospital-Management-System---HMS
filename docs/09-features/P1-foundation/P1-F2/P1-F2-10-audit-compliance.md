# P1-F2-10 — Audit & Compliance

| Feature | P1-F2 |
| Status | IMPLEMENTED |

---

## Events

| Event | Entity | Payload |
|-------|--------|---------|
| `VITALS_RECORDED` | `ClinicalVitalSign` | `encounterId`, `recordedAt` |

Retention: follow clinical PHI policy (audit matrix — 7y target).

Access logging: GET list is authorized via RBAC; MVP does not emit a separate SEARCH event (append-only clinical write is primary control).
