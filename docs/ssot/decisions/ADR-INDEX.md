# Architecture Decision Records — Index

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-ADR-IDX-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

Only decisions with evidence. Fictional history avoided.

| ADR | Title | Status | Date | Evidence |
|-----|-------|--------|------|----------|
| ADR-001 | Modular monolith (not microservices) | ACCEPTED | UNKNOWN (early) | Single `health360-api` artifact |
| ADR-002 | JWT RS256 + permission authorities | ACCEPTED | ~Phase-1 | SecurityConfig, JwtTokenService |
| ADR-003 | Flyway additive migrations only | ACCEPTED | continuous | migration policy docs + chain |
| ADR-004 | Multi-schema PostgreSQL by domain | ACCEPTED | Phase-1/HMS | CREATE SCHEMA migrations |
| ADR-005 | Soft delete via deleted_at | ACCEPTED | Phase-1 | BaseAuditableEntity |
| ADR-006 | Hospital subscriptions own feature flags | ACCEPTED | Phase-1.5 | PlanFeatureKeys, V26–V28 |
| ADR-007 | HMS V2: beds remain in `ipd`; ADT facade | ACCEPTED | 2026-09-15 | HMS-IMPLEMENTATION-ROADMAP-V2 locked decisions |
| ADR-008 | Automation via events + reactor (sync MVP) | ACCEPTED | HMS-12 | EventPublisher, AutomationReactor |
| ADR-009 | Charge engine default DRY_RUN | ACCEPTED (interim) | HMS-14 | application config / charge docs |
| ADR-010 | Predictive = heuristics not ML | ACCEPTED | HMS-23 | predictive module docs |
| ADR-011 | Web-first hospital ops; mobile subset | DE FACTO | continuous | client inventories |
| ADR-012 | Local FS document storage (not S3) | DE FACTO | continuous | DocumentStorageService |
| ADR-013 | IPD dual gate: plan feature + hospital service catalog | ACCEPTED | 2026-09-08 | Former ADR-IPD-001; `FEATURE_IPD` + `/hospitals/me/ipd-services` |
| ADR-014 | IPD payer framework (country_config stub) | ACCEPTED | 2026-09-08 | Former ADR-IPD-002 |
| ADR-015 | IPD ops metrics approach | ACCEPTED | 2026-09-08 | Former ADR-IPD-003 |

## Historical ADR titles (documents deleted 2026-09-17; substance retained above where still valid)

Former `docs/04-architecture/architecture-decision-records/ADR-001…016` covered: modular monolith, encounters-as-visit, no duplicate patient, encounter-scoped vitals, prescription vs pharmacy, Flyway strategy, additive APIs, server-side hospital scope, clinical immutability, bed movement, pharmacy inventory txns, payment architecture, insurance/TPA, mobile HMS expansion, appointment arrival status, independent partner orgs. Re-open from git history if full text needed.

## Reconstruction required

Decisions without clear date/owner remain UNKNOWN — expand when stakeholders confirm.
