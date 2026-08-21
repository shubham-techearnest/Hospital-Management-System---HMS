# P1-F2-11 — Testing Strategy

| Feature | P1-F2 |
| Status | IMPLEMENTED |

---

## Automated

| Layer | Coverage |
|-------|----------|
| Integration | `ClinicalVitalsIntegrationTest` — doctor records + lists vitals; validation rejects empty body |
| RBAC | 403 without `clinical:vitals:write` (patient token if available) |
| Regression | Existing `ClinicalEncounterIntegrationTest` unchanged |

## Manual / UAT

See P1-F2-14.
