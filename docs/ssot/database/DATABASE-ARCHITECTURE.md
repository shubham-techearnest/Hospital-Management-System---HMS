# Database Architecture — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-DB-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Flyway tip** | V103 |
| **Evidence** | DATABASE-VERIFIED |

## Engine

PostgreSQL 16 (Compose + local installs evidenced).

## Patterns

| Pattern | Implementation |
|---------|----------------|
| Multi-schema | Domain schemas (`clinical`, `ipd`, `billing`, …) |
| Soft delete | `deleted_at` + Hibernate `@SQLRestriction` |
| Audit columns | `created_at/by`, `updated_at/by`, `version` via base entity |
| Tenant | `tenant_id` |
| IDs | UUID primary keys common |
| Migrations | Flyway `V{n}__*.sql` additive chain |

## Schema list (29) — DATABASE-VERIFIED

`shared`, `iam`, `patient`, `doctor`, `hospital`, `scheduling`, `analytics`, `location`, `clinical`, `opd`, `ipd`, `icu`, `laboratory`, `radiology`, `ot`, `pharmacy`, `billing`, `org`, `asset`, `automation`, `tasks`, `workflow`, `emergency`, `inventory`, `procurement`, `facility`, `insurance`, `blood`, `staffops`

Notes:

- Subscriptions live in `shared`
- Staff records primarily in `hospital`
- Predictive insights in `automation` (V102)

## ERD note

Full column-level data dictionary for every table is **not** regenerated in this pass (would be enormous and drift-prone). Authoritative structure = Flyway migrations + JPA entities. See [SCHEMA-CATALOG.md](./SCHEMA-CATALOG.md) and [MIGRATIONS.md](./MIGRATIONS.md).

## Sensitive data (high level)

Patient demographics, clinical notes, Rx, labs, billing — treat as PHI/PII. Formal field inventory: OPEN (TECHNICAL-DEBT).
