# Database Migration Master Plan (V42+)

| Document ID | DB-MIG-001 |
| Status | DRAFT |

---

## Rules

1. Never modify V1–V41
2. One migration per sprint feature where possible
3. RBAC permissions in same migration as feature
4. Backfill scripts in migration with idempotent logic
5. Test with Testcontainers on CI

---

## Planned migration sequence

| Version | Sprint | Feature | Changes |
|---------|--------|---------|---------|
| **V42** | 1 | P1-F1 | `uhid`, `legal_name`, search indexes, `patient.hospital_registrations`, RBAC `patient:registry:*` |
| **V43** | 2 | P1-F2 | `clinical.vital_signs` |
| **V47** | 5 | P2-F3 | Structured consultation fields + DRAFT/FINAL on `clinical.notes` |
| **V48** | 6 | P2-F4 | `clinical.prescriptions`, `prescription_items` + RBAC |
| **V49** | 7 | P2-F5 | RECEPTIONIST billing RBAC (OPD checkout) |
| **V50+** | — | TBD | Next release extras |
| **V45** | 12 | P4-F4 | `ipd.bed_movements` |
| **V46** | 9 | P3-F1 | Pharmacy batches, stock_transactions |
| **V47+** | 17+ | Payments/insurance | TBD after ADR-012/013 approval |

---

## V42 detail (P1-F1 — draft for approval)

### Extend `patient.patient_profiles`

| Column | Type | Notes |
|--------|------|-------|
| uhid | VARCHAR(20) | Unique per tenant (pending DEC-001) |
| legal_first_name | VARCHAR(100) | Hospital registration name |
| legal_last_name | VARCHAR(100) | |
| registration_source | VARCHAR(30) | APP, HOSPITAL_DESK, EMERGENCY |

### New `patient.hospital_registrations`

| Column | Purpose |
|--------|---------|
| patient_id | FK → patient_profiles |
| hospital_id, branch_id | Registration location |
| registered_at, registered_by | Audit |
| registration_number | Optional hospital-local MRN if DEC-001 = tenant UHID + hospital MRN |

### Indexes

- `uq_patient_profiles_tenant_uhid` (WHERE deleted_at IS NULL)
- `idx_patient_profiles_search_mobile` on normalized mobile
- Trigram or ILIKE index on legal name (DEC-003)

### Sequences

- `patient.uhid_sequences (tenant_id, year, last_value)` for formatted UHID e.g. `H360-2026-00001234`

---

## Entities preserved (no duplicate)

- `patient.patient_profiles` — extend only
- `clinical.encounters` — hub
- `iam.users` — link via user_id (DEC-004: walk-in without app account)

---

## Data integrity

- FK constraints on all new references
- Soft delete on profiles unchanged
- Optimistic locking via `version` column

See [schema-map.md](./schema-map.md).
