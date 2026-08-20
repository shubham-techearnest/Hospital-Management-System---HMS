# Domain Model — Health360 HMS

| Document ID | DOM-001 |
| Status | DRAFT |
| Last Updated | 2026-08-20 |

---

## Core principle

**`clinical.encounters` is the PatientVisit / clinical episode hub.**  
No parallel `PatientVisit` entity.

| Concept | Implementation |
|---------|----------------|
| PatientVisit | `clinical.encounters` |
| QueueToken | `opd.queue_entries` |
| Consumer wellness vitals | `patient.vital_sign_records` |
| Clinical encounter vitals | `clinical.vital_signs` (planned V43) |
| Prescription (clinical) | `clinical.prescriptions` (planned) |
| Pharmacy fulfillment | `pharmacy.*` (as-built partial) |

---

## Aggregate map

```text
patient.patient_profiles (longitudinal identity)
        |
        +-- scheduling.appointments
        |
        +-- clinical.encounters  ← HUB
                  |
                  +-- opd.queue_entries
                  +-- ipd.admissions
                  +-- clinical.diagnoses / notes / orders
                  +-- clinical.vital_signs (planned)
                  +-- clinical.prescriptions (planned)
                  +-- billing.invoices
                  +-- laboratory / radiology / pharmacy / ot / icu (via orders or direct FK)
```

---

## Bounded contexts (modular monolith)

| Module | Package | Schema |
|--------|---------|--------|
| IAM | `com.health360.iam` | `iam` |
| Hospital | `com.health360.hospital` | `hospital`, staff V39 |
| Patient | `com.health360.patient` | `patient` |
| Scheduling | `com.health360.scheduling` | `scheduling` |
| Clinical | `com.health360.clinical` | `clinical` |
| OPD | `com.health360.opd` | `opd` |
| IPD | `com.health360.ipd` | `ipd` |
| ICU | `com.health360.icu` | `icu` |
| Laboratory | `com.health360.laboratory` | `laboratory` |
| Radiology | `com.health360.radiology` | `radiology` |
| Pharmacy | `com.health360.pharmacy` | `pharmacy` |
| OT | `com.health360.ot` | `ot` |
| Billing | `com.health360.billing` | `billing` |

Cross-context rules enforced via **EncounterAccessService** and **HospitalScopeService**.

---

## Patient domain (target P1-F1)

Extend `patient.patient_profiles` — **do not create duplicate Patient table**.

| Addition | Purpose |
|----------|---------|
| `uhid` | Tenant-scoped unique hospital identifier (DEC-001 pending) |
| `patient.hospital_registrations` | Link profile to hospital/branch with registration metadata |
| Search indexes | mobile, name+DOB, uhid |

Hospital registration creates or links profile; encounter always references `patient_id`.

---

## State machines (summary)

See [04-architecture/state-machines.md](../04-architecture/state-machines.md).

---

## References

- As-built: [hms/HMS-DOMAIN-MODEL.md](../hms/HMS-DOMAIN-MODEL.md)
- ADR-002: encounters as PatientVisit
