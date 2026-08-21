# P1-F2-05 — UX Requirements

| Feature | P1-F2 |
| Status | APPROVED |

---

## Surfaces

| Surface | Behavior |
|---------|----------|
| Doctor encounter detail | Section **Clinical vitals**: form (BP, HR, temp, RR, SpO2, glucose) + history list |
| Nursing dashboard | Encounter ID entry + same form/list for MAR-adjacent vitals recording |
| Patient portal vitals page | Unchanged (wellness only) |

---

## UX rules

- Require at least one field before enable Save
- Show BP classification chip when BP present
- Empty state: “No clinical vitals recorded for this encounter.”
- Errors from API shown inline (403/404/400)
- Do not imply clinical vitals sync into patient self-tracking chart
