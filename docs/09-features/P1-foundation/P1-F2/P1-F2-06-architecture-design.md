# P1-F2-06 — Architecture Design

| Feature | P1-F2 |
| Status | APPROVED |

---

## Placement

- Module: `com.health360.clinical`
- Service: `ClinicalVitalsService`
- Persistence: `ClinicalVitalSignEntity` → `clinical.vital_signs`
- Access: `EncounterAccessService.assertCanReadVitals` / `assertCanWriteVitals`
- Reuse: `BpClassificationService` for BP category/interpretation

---

## Boundaries

| Concern | Owner |
|---------|-------|
| Clinical visit vitals | `clinical.vital_signs` |
| Consumer wellness vitals | `patient.vital_sign_records` (unchanged) |
| ICU monitoring JSON | `icu.monitoring_records` (unchanged) |

---

## Sequence

```text
Client → ClinicalController → ClinicalVitalsService
  → requireEncounter + assertCanWriteVitals
  → validate → save → AuditLogService
```
