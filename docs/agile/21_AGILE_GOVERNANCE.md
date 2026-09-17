# 21 — Agile Governance

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-GOV-001 |
| **Status** | ACTIVE DRAFT |
| **Last Updated** | 2026-09-17 |

---

## Purpose

Govern how Health360 moves from **evidence-based backlog** to sprint delivery without inventing completion, velocity, or vision features.

---

## Roles (lightweight)

| Role | Owns |
|------|------|
| Product Owner | Priority, release intent, AC acceptance, vision intake |
| Tech Lead | Feasibility, dependency cuts, DoD technical bars |
| Scrum Master / Facilitator | Sprint hygiene, assumption transparency (capacity UNKNOWN until measured) |
| Engineering | Implementation per DoR/DoD |
| QA | AC packs, WF catalog execution |
| Docs steward | `docs/agile/` ID stability and Phase checkpoint honesty |

---

## Cadence (proposed)

| Event | Cadence | Notes |
|-------|---------|-------|
| Sprint | 2 weeks | See [18_SPRINT_PLAN.md](./18_SPRINT_PLAN.md) |
| Backlog refinement | Weekly or mid-sprint | Promote UNKNOWN→verified before storying |
| Release review | Per named release | [17_RELEASE_PLAN.md](./17_RELEASE_PLAN.md) |
| Velocity review | After ≥3 sprints measured | Until then velocity = UNKNOWN |

---

## Change control

1. **Stable IDs** — never reuse US/BUG/FEAT IDs for different meaning.
2. **Status upgrades** require evidence (prefer Phase C-style FE→BE→DB trace).
3. **SSOT vs Agile** — implementation wins for CURRENT; SSOT may describe INTENDED.
4. **Vision items** enter backlog only as PLANNED/P3/REL-FUTURE unless PO promotes.
5. **No product code changes** under pure documentation tasks unless separately approved.
6. **Bugs/gaps/tech/sec** stay typed distinctly in the master backlog.

---

## Definition linkage

- Ready: [19_DEFINITION_OF_READY.md](./19_DEFINITION_OF_READY.md)
- Done: [20_DEFINITION_OF_DONE.md](./20_DEFINITION_OF_DONE.md)

---

## Progressive elaboration

This tree starts with ~34 verified stories. Additional stories are added when UNKNOWN features are verified — not by speculative bulk generation.

---

## Checkpoint integrity

Update [00_README.md](./00_README.md) phase table when phase status changes. Do not mark Phase B complete until full route inventory + per-route status exists; Phase C remains “spot-check complete” until broader WF coverage is done.
