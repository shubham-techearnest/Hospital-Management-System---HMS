# ADR-006: Flyway V42+ Migration Strategy

| Status | PROPOSED |

## Decision
- V1–V41 are immutable (applied in prod/dev)
- All new schema: V42, V43, … one logical change per migration where practical
- Include RBAC seed in same migration when permissions added
- Integration tests validate migrations via Testcontainers

## Rejected
Editing historical migrations; manual DDL outside Flyway.
