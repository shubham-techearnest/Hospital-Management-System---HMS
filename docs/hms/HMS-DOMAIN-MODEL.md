# HMS Domain Model — Clinical & OPD

| Attribute | Value |
|-----------|-------|
| **Document ID** | HMS-DOMAIN-001 |
| **Last Updated** | 2026-08-18 |

---

## Schema map (implemented)

| Schema | Migration | Entities |
|--------|-----------|----------|
| `clinical` | V30, V32 | encounters, diagnoses, notes, orders, order_items, followups, reminders, encounter_number_sequences |
| `opd` | V31 | desks, queue_entries |
| `ipd` | V33 | wards, rooms, beds, admissions, bed_assignments, rounds, discharge_summaries |
| `icu` | V34 | icu_units, icu_beds, icu_stays, icu_bed_assignments, equipment, equipment_assignments, monitoring_records |

---

## Encounter (hub entity)

**Table:** `clinical.encounters`

| Column | Notes |
|--------|-------|
| encounter_number | Unique per tenant; V32 allocates via sequence table |
| patient_id | → `patient.patient_profiles` |
| hospital_id, branch_id | → `hospital.*` |
| department_id | Optional |
| primary_doctor_id | → `doctor.doctor_profiles` |
| appointment_id | Optional → `scheduling.appointments` |
| encounter_type | OPD, IPD, EMERGENCY, … |
| status | REGISTERED → WAITING → IN_PROGRESS → COMPLETED \| CANCELLED |
| visit_reason, started_at, ended_at | Clinical metadata |

**Relationships:**

```
Encounter
 ├── ClinicalDiagnosis (1:N)
 ├── ClinicalNote (1:N)
 ├── ClinicalOrder (1:N)
 │    └── ClinicalOrderItem (1:N)
 ├── ClinicalFollowup (1:N) — future scheduling link
 └── ClinicalReminder (1:N)
```

---

## OPD domain

**Desk** (`opd.desks`): physical or logical service point at a branch.

**Queue entry** (`opd.queue_entries`):

| Field | Purpose |
|-------|---------|
| encounter_id | Required link to clinical encounter |
| token_number / token_display | Patient-facing queue token |
| queue_date | Business date for queue partition |
| desk_id | Optional assignment |
| status | Queue lifecycle (distinct from encounter status) |
| priority | Higher = earlier in sort (DESC, then token ASC) |

One encounter may have at most one active queue entry per branch/date (enforced in service layer).

---

## Encounter number sequence (V32)

**Table:** `clinical.encounter_number_sequences`

| Column | Purpose |
|--------|---------|
| tenant_id, hospital_id, sequence_year | Composite uniqueness |
| last_value | Incremented under `SELECT … FOR UPDATE` |

Allocation service retries on duplicate-key race when two threads create the sequence row concurrently.

---

## RBAC (current)

| Permission | Roles (seeded) |
|------------|----------------|
| `clinical:encounter:read` | PATIENT, DOCTOR, HOSPITAL_ADMIN |
| `clinical:encounter:write` | DOCTOR, HOSPITAL_ADMIN |
| `clinical:order:read` / `write` | DOCTOR |
| `opd:desk:*`, `opd:queue:*`, `opd:registration:write` | HOSPITAL_ADMIN |
| `ipd:*` | HOSPITAL_ADMIN, DOCTOR (subset) |
| `icu:*` | HOSPITAL_ADMIN, DOCTOR (subset) |

HMS-9 will add RECEPTIONIST / NURSE roles with scoped permissions.

---

## Package layout (backend)

```
com.health360.clinical
 ├── domain/          EncounterStatus, EncounterType, …
 ├── application/     EncounterService, EncounterNumberService, ClinicalOrderService
 ├── infrastructure/  JPA entities + repositories
 └── presentation/    ClinicalController, DTOs

com.health360.opd
 ├── application/     OpdQueueService, OpdRegistrationService, OpdDeskService
 ├── infrastructure/  queue + desk persistence
 └── presentation/    OpdController

com.health360.ipd
 └── … (see HMS-IPD-FLOW.md)

com.health360.icu
 ├── application/     IcuStayService, IcuFacilityService, IcuEquipmentService
 ├── infrastructure/  units, beds, stays, equipment, monitoring persistence
 └── presentation/    IcuController
```

---

## Frontend modules

| App | Module | Purpose |
|-----|--------|---------|
| Web | `features/clinical/` | Shared encounter API + hooks |
| Web | `features/opd/` | Hospital queue API |
| Web | `features/ipd/` | Hospital IPD API |
| Web | `features/icu/` | Hospital ICU API |
| Web | `features/lab/` | Lab catalog + fulfillment API |
| Web | `features/radiology/` | Radiology catalog + fulfillment API |
| Web | Patient/doctor pages | Portal-specific list/detail |
| Mobile | `features/clinical/` | Same API surface, RN screens |

---

## Laboratory (HMS-5)

```
clinical.orders (LAB) + order_items
  └── laboratory.lab_orders (1:1 clinical_order_item_id)
        ├── lab_samples
        ├── lab_results (per parameter)
        └── lab_reports → visible on encounter
```

Catalog: `laboratories` → `lab_tests` → `lab_test_parameters`

---

## Radiology (HMS-6)

```
clinical.orders (IMAGING) + order_items
  └── radiology.imaging_orders (1:1 clinical_order_item_id)
        ├── imaging_studies (schedule + perform)
        └── imaging_reports → visible on encounter
```

Catalog: `imaging_modalities` (X_RAY, USG, CT, MRI, EEG, OTHER)

---

## Operation theatre (HMS-7)

```
clinical.orders (PROCEDURE) + order_items
  └── ot.ot_procedures (1:1 clinical_order_item_id)
        ├── ot_schedules (theatre + time slot, conflict check)
        ├── ot_team_members (surgeon, nurses, anaesthetist)
        └── ot_notes (PRE_OP, INTRA_OP, POST_OP) → visible on encounter when COMPLETED
```

Catalog: `operation_theatres` per hospital branch

---

## Clinical pharmacy (HMS-8)

```
clinical.orders (MEDICATION) + order_items
  └── pharmacy.medication_orders (1:1 clinical_order_id)
        └── medication_order_items (1:1 clinical_order_item_id)
              └── medication_administrations (MAR: encounter + time + administered_by)
```

Catalog: `medicines` per hospital branch. No commerce/billing.

---

## Future extensions (HMS-9+)

- Observations: vitals captured with `encounter_id`
- Staff RBAC and nursing MAR delegation

See [HMS-ROADMAP.md](./HMS-ROADMAP.md).
