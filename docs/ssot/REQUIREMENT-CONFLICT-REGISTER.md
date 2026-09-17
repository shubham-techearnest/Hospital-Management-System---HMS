# Requirement Conflict Register

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-CONF-001 |
| **Version** | 1.1 |
| **Status** | CURRENT |
| **Last Updated** | 2026-09-17 |

| Conflict ID | Requirement A | Requirement B | Source A | Source B | Actual implementation | Impact | Recommended resolution | Decision required? |
|-------------|---------------|---------------|----------|----------|----------------------|--------|------------------------|--------------------|
| CONF-001 | Await approve roadmap/P1-F1 before build | Continue HMS delivery | Former NEXT-ACTION (deleted) | Code + HMS V2 | Large HMS codebase exists | Process paralysis vs reality | **RESOLVED** — SSOT is sole gate; ack still useful | NO (process) / YES (stakeholder ack) |
| CONF-002 | “Phase 2” = commerce DRAFT pack | “Phase 2” = post-HMS billing bridge | Former phase-2 / post-hms trees (deleted) | Billing/Razorpay code | Billing/Razorpay implemented | Terminology confusion | Use eras: Foundation / HMS / V2 / Vision | YES (naming) |
| CONF-003 | Beds may be separate ADT model | Beds remain in `ipd` with events | Older HMS arch | HMS V2 locked decisions | IPD beds + ADT facade | Wrong redesign risk | **RESOLVED** — keep V2 decision (ADR-007) | NO |
| CONF-004 | Mobile parity implied | Web-first ops | Various product docs | Mobile code | Mobile partial | False expectations | Explicit mobile MVP scope in REQ-MOB-001 | YES |
| CONF-005 | Charge engine production POST | DRY_RUN default | Finance desire (inferred) | application config | DRY_RUN | Missed revenue posting | Explicit cutover decision | YES |
| CONF-006 | CI on `main`/`develop` | Repo on `master` | GitHub workflows | git branch | Mismatch | CI may not run as assumed | Align branch names | YES |
| CONF-007 | Notification templates required (HMS-12.5) | Deferred in HMS-24 | Roadmap V2 | HMS-24 hardening | Inline strings | Ops message inconsistency | Schedule templates epic or accept deferral | YES |

Unresolved rows marked YES must be decided by product owner; do not silently pick in code.
