# Target Architecture — PROPOSED / APPROVED DIRECTION

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-TARCH-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Label** | TARGET / PROPOSED — not current runtime |

## Sources of target intent

- Locked HMS V2 decisions (2026-09-15): ADT facade; beds remain in `ipd` — DOCUMENT-VERIFIED (migrated into SSOT ADRs)
- UX direction: My Work + Encounter Workspace — PARTIALLY realized
- Long-term Health OS vision (ambulance, homecare, AI, marketplace) — PROPOSED

## Target themes (not yet fully realized)

1. Event-driven hospital OS with shared task/approval engines (MVP exists; configurability incomplete)
2. Persona-simplified UI (My Work primary; fewer specialty tabs)
3. Charge engine in POST mode with finance exception discipline
4. Mobile parity for operational My Work
5. Stronger integration layer (real email/SMS, object storage)
6. Clearer service boundaries inside monolith (package APIs) before any split

## Explicit non-claims

This document does **not** assert microservices, AI CDS, or ambulance modules exist today.
