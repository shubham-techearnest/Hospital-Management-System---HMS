# Architecture Principles

| Document ID | ARCH-PRIN-001 |
| Status | DRAFT |

1. **Modular monolith** — clear package boundaries; no premature microservices.
2. **Encounter hub** — `clinical.encounters` is the single visit episode root.
3. **Single patient identity** — one `patient.patient_profiles` aggregate; UHID extends it.
4. **Separation of concerns** — prescription (clinical) vs pharmacy fulfillment (inventory).
5. **Server-side tenancy** — hospital/branch from staff assignment, not manual UUID entry.
6. **Immutable clinical artifacts** — signed notes/Rx versioned; no silent overwrite.
7. **Auditable financial/clinical ops** — who/what/when/old/new/reason.
8. **Flyway-only schema** — never edit applied migrations; V42+ forward.
9. **Additive APIs** — preserve existing consumers.
10. **Test every feature** — unit, integration, RBAC, migration tests.
