# 13 — Bug Backlog

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-BUG-001 |
| **Status** | DRAFT — from Phase C verification |
| **Last Updated** | 2026-09-17 |
| **Source** | [evidence/PHASE_C_VERIFICATION.md](./evidence/PHASE_C_VERIFICATION.md) |

**Rule:** Do not invent historical “found in Sprint N” labels. Discovery era = Phase C spot-check (2026-09-17) unless later updated.

---

## Open bugs

| ID | Severity | Priority | Title | Module | Status | Points | Proposed Sprint | Evidence | Linked work |
|----|----------|----------|-------|--------|--------|--------|-----------------|----------|-------------|
| BUG-API-001 | High | P1 | Double `/api/v1` prefix on several FE API modules when `baseURL` already includes `/api/v1` | Command center / inventory / facility / asset / tasks | OPEN | 5 | Sprint 01 | `commandCenterApi.ts` (+ siblings) | TECH-API-001, US-CC-OPS-001 |
| BUG-BIL-001 | High | P1 | Charge attach not wired in FE; POST mode does not auto-create invoice lines | Billing / charges | OPEN | 8 | Sprint 02 | `ChargeController` attach vs `chargesApi.ts`; `ChargePostingService` | US-BIL-CHG-003, GAP-BIL-001 |
| BUG-AUTH-001 | High | P1 | `/patient/*` lacks `RoleRoute role="PATIENT"` | IAM / Patient portal | OPEN | 3 | Sprint 01 | `router.tsx` | US-AUTH-FIX-001, GAP-AUTH-001 |
| BUG-AUTH-002 | Medium | P2 | `RoleRoute` skips role check when `user` is null but token exists | IAM | OPEN | 3 | Sprint 01 | `RoleRoute.tsx` | US-AUTH-FIX-002, GAP-AUTH-002 |

---

## Related non-bug defects tracked elsewhere

| ID | Type | Summary | Track in |
|----|------|---------|----------|
| GAP-ONB-001 | GAP | Onboarding APPROVED ≠ auto-provision | [11_GAP_ANALYSIS.md](./11_GAP_ANALYSIS.md) |
| TECH-NTF-001 | TECH | SMS log stub | [12_TECHNICAL_DEBT.md](./12_TECHNICAL_DEBT.md) |
| SEC-PAY-001 | SEC | Razorpay sandbox blank webhook secret | [12_TECHNICAL_DEBT.md](./12_TECHNICAL_DEBT.md) / backlog |

---

## Triage notes

- **P1 auth + API path bugs** first — they undermine trust and block verification of ops modules.
- **BUG-BIL-001** is both bug and product-gap; resolve with explicit invoice-line policy.
- Re-verify after fixes using ACP packs in [09_ACCEPTANCE_CRITERIA.md](./09_ACCEPTANCE_CRITERIA.md).
