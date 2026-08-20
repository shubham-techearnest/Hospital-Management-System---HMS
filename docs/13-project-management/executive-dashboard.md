# Executive Dashboard — Health360 HMS Program

| Document ID | PM-EXEC-001 |
| Status | DRAFT |
| Report date | 2026-08-20 |

---

## Overall status

| Dimension | Status |
|-----------|--------|
| Program mode | **DOCUMENTATION / PLANNING** |
| As-built HMS (HMS-0…11) | **RELEASED** |
| Governed product plan | **DRAFT — awaiting approval** |
| First implementation | **P1-F1 blocked until approval** |
| Billing backend (P2-B1) | Implemented; web UI pending |

---

## Phase summary

| Phase | Name | Status |
|-------|------|--------|
| 0 | Architecture stabilization | IN REVIEW (Sprint 0 docs) |
| 1 | Patient foundation | NOT STARTED |
| 2 | OPD completion | NOT STARTED |
| 3 | Diagnostics & pharmacy | PARTIAL (as-built modules) |
| 4 | IPD completion | PARTIAL (as-built modules) |
| 5 | Financial & enterprise | PARTIAL (billing schema only) |
| 6 | Enterprise readiness | NOT STARTED |

---

## Documentation approval status

| Artifact | Status |
|----------|--------|
| Product vision & scope | DRAFT |
| Master plan (30 deliverables) | DRAFT |
| ADRs 001–014 | PROPOSED |
| P1-F1 package (14 docs) | DRAFT |
| Pending decisions (10 items) | **Awaiting senior input** |

---

## Top risks

1. **R-001** Duplicate patients without P1-F1
2. **R-015** Walk-in registration without app user (DEC-004)
3. **R-004** Hospital scope bypass
4. **DEC-001** UHID scope undefined

---

## Blockers

| Blocker | Action required |
|---------|-----------------|
| Senior approval gate | Product Owner + Architect sign-off |
| DEC-001, DEC-002, DEC-004 | Resolve before Sprint 1 kickoff |

---

## Next milestone

**Approval:** `"APPROVE ROADMAP AND P1-F1"` → Sprint 1 implementation kickoff.

See [NEXT-ACTION.md](../NEXT-ACTION.md).

---

## Technical debt (selected)

| Item | Priority |
|------|----------|
| Billing web UI missing | P0 (Sprint 7) |
| Manual hospital UUID in some legacy screens | P1 (remove with staff scope) |
| Appointment ↔ encounter status alignment | P0 (Sprint 3) |
| Mobile HMS staff flows | P1 (Sprint 13+) |

---

## Production readiness

**Not production-ready** for full hospital OPD/IPD target workflows until R2–R4 releases complete. Current production suitability: consumer app + partial HMS modules per deployment config.
