# P1-F2-12 — Migration Plan

| Feature | P1-F2 |
| Status | IMPLEMENTED |

---

## Apply

1. Deploy app with Flyway enabled
2. Apply `V43__clinical_vital_signs.sql` (never edit V42 or earlier)
3. Verify permissions exist: `SELECT code FROM iam.permissions WHERE code LIKE 'clinical:vitals:%'`

## Rollback

Forward-fix preferred. If empty environments: drop `clinical.vital_signs` and revoke new permissions (dev only).
