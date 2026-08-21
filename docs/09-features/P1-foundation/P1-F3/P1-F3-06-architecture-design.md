# P1-F3-06 — Architecture Design

- Module: `com.health360.clinical`
- Service: `ClinicalTimelineService` (live projection)
- Access: `EncounterAccessService.assertCanReadClinicalTimeline`
- Patient self: resolve patient profile via consent, then same aggregate
- Does not write a new event store; reads clinical schema

```text
ClinicalController / PatientProfileController
  → ClinicalTimelineService
    → EncounterRepository + vitals/diagnoses/notes/orders repos
```
