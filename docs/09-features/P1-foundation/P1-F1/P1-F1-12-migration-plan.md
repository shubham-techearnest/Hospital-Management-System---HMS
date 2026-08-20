# P1-F1-12 — Migration Plan

| Feature | P1-F1 |
| Migration | V42 |
| Status | DRAFT |

---

## Pre-migration

- [ ] DEC-001, DEC-004 approved
- [ ] Staging backup
- [ ] Review V41 applied on all envs

---

## Migration steps

1. Deploy API with Flyway disabled in canary (optional)
2. Run Flyway V42 on staging
3. Verify indexes, permissions, role mappings
4. Smoke test register + search
5. Production deploy during maintenance window (low risk — additive)

---

## V42 contents

1. Add columns to patient_profiles
2. Create uhid_sequences
3. Create hospital_registrations
4. Create indexes
5. Seed RBAC permissions + role mappings

---

## Data migration

- Existing profiles: uhid NULL allowed initially
- Optional backfill job post-release (separate change request)

---

## Rollback strategy

| Scenario | Action |
|----------|--------|
| Pre-prod failure | Drop V42 objects if no data |
| Post-prod critical bug | Forward fix; do not drop columns if registrations exist |
| Permission error | Hotfix migration V42_1 seed fix |

---

## Verification queries

```sql
SELECT COUNT(*) FROM patient.patient_profiles WHERE uhid IS NOT NULL;
SELECT * FROM iam.permissions WHERE code LIKE 'patient:registry:%';
```

---

## Flyway checksum

Never edit V42 after apply; use V43 for fixes.
