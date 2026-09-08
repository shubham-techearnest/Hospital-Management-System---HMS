# ADR — Hospital IPD service catalog

| Attribute | Value |
|-----------|-------|
| **ADR** | ADR-IPD-001 |
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Context** | [PHASE-I-IPD-ENTERPRISE-PLAN.md](../13-project-management/PHASE-I-IPD-ENTERPRISE-PLAN.md) |

## Decision

IPD capability is gated in two layers:

1. **Subscription plan** — `FEATURE_IPD` / `FEATURE_ICU` via existing `FeatureAccessService`.
2. **Hospital IPD service catalog** — per-hospital JSON map of workflow services (`IPD_CORE`, maternity, insurance, OT, …) with one-click presets.

Country-specific legal/payer behavior is stored as `country_code` + `country_config` (India stub first). Core IPD domain stays country-neutral.

## Consequences

- Operational IPD APIs require plan `FEATURE_IPD` and hospital `IPD_CORE`.
- ICU create/admit requires plan `FEATURE_ICU`.
- Hospital admin configures services at `/hospital/ipd-services` (`GET/PUT /api/v1/hospitals/me/ipd-services`).
- Later IPD waves (I1+) must call `assertIpdServiceEnabled(...)` for gated workflows.
