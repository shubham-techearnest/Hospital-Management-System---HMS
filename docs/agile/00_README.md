# Health360 — Agile Product System (SSOT for Backlog)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-INDEX-001 |
| **Product** | Health360 |
| **Purpose** | Single source of truth for Agile Themes → Epics → Feature Groups → Features → User Stories → Releases → Sprints |
| **Status** | IN PROGRESS — A complete; B partial; C spot-check complete; D skeleton complete; E in progress |
| **Created** | 2026-09-17 |
| **Last Updated** | 2026-09-17 |
| **Evidence basis** | CODE-VERIFIED first; DOCUMENT-VERIFIED (`docs/ssot/`) for intent only |
| **Hierarchy counts** | 8 Themes · 38 Epics · 76 FGs · 112 Features · ~38 stories this pass |

---

## Relationship to `docs/ssot/`

| Tree | Owns |
|------|------|
| [`docs/ssot/`](../ssot/README.md) | Product vision, architecture, API/DB catalogs, implementation status notes |
| **`docs/agile/` (this tree)** | Agile hierarchy, backlog, gaps, roadmap, sprint governance |

**Rule:** When CURRENT STATE conflicts, **implementation evidence wins**. SSOT docs may describe INTENDED / PLANNED state — keep them labeled separately.

---

## Non-negotiable rules

1. **Audit before stories** — no speculative “ideal HIS” backlog.
2. **No fake completion** — UI ≠ done; API ≠ done; table ≠ done.
3. **No fake sprint history** — pre-Agile work = Baseline.
4. **Stable IDs** once published (see ID convention below).
5. **Do not modify product code** as part of this reconstruction unless separately approved.

---

## Execution phases

| Phase | Name | Status |
|-------|------|--------|
| A | Repository Discovery | **COMPLETE** |
| B | Frontend inventory & functional audit | **PARTIAL** (route inventory exists; per-route status incomplete) |
| C | End-to-end implementation verification | **SPOT-CHECK COMPLETE** (15 workflows; see `evidence/PHASE_C_VERIFICATION.md`) |
| D | Product model (Themes → Features) | **SKELETON COMPLETE** (8 / 38 / 76 / 112; overlay upgrades for 34 features) |
| E | Baseline user stories | **IN PROGRESS** (verified features → ~38 stories; more as UNKNOWN verified) |
| F | Gap analysis | **DRAFT** (`11_GAP_ANALYSIS.md`) |
| G | Future backlog | **DRAFT** (gaps/bugs/tech/vision in master backlog) |
| H | Dependencies & priorities | **DRAFT** |
| I | Roadmap / releases | **DRAFT** (no fake dates) |
| J | Sprint planning | **DRAFT** (Sprint 01–03 proposals; capacity/velocity UNKNOWN) |
| K | Documentation validation | PENDING |

---

## Document map

| # | File | Content |
|---|------|---------|
| 00 | [00_README.md](./00_README.md) | Index (this file) |
| 01 | [01_PRODUCT_BASELINE.md](./01_PRODUCT_BASELINE.md) | Pre-Agile existing product baseline |
| 02 | [02_REPOSITORY_AUDIT.md](./02_REPOSITORY_AUDIT.md) | Phase A discovery audit |
| 03 | [03_ACTORS_AND_ROLES.md](./03_ACTORS_AND_ROLES.md) | Actor & role matrix |
| 04 | [04_THEMES.md](./04_THEMES.md) | Themes (draft after Phase D) |
| 05 | [05_EPICS.md](./05_EPICS.md) | Epics |
| 06 | [06_FEATURE_GROUPS.md](./06_FEATURE_GROUPS.md) | Feature groups |
| 07 | [07_FEATURE_CATALOG.md](./07_FEATURE_CATALOG.md) | Features + status |
| 08 | [08_USER_STORY_CATALOG.md](./08_USER_STORY_CATALOG.md) | User stories |
| 09 | [09_ACCEPTANCE_CRITERIA.md](./09_ACCEPTANCE_CRITERIA.md) | AC library |
| 10 | [10_PRODUCT_BACKLOG.md](./10_PRODUCT_BACKLOG.md) | Master backlog |
| 11 | [11_GAP_ANALYSIS.md](./11_GAP_ANALYSIS.md) | Gap register |
| 12 | [12_TECHNICAL_DEBT.md](./12_TECHNICAL_DEBT.md) | Technical items |
| 13 | [13_BUG_BACKLOG.md](./13_BUG_BACKLOG.md) | Bugs |
| 14 | [14_DEPENDENCIES.md](./14_DEPENDENCIES.md) | Dependency matrix |
| 15 | [15_TRACEABILITY_MATRIX.md](./15_TRACEABILITY_MATRIX.md) | Story ↔ code |
| 16 | [16_ROADMAP.md](./16_ROADMAP.md) | Phased roadmap |
| 17 | [17_RELEASE_PLAN.md](./17_RELEASE_PLAN.md) | Releases |
| 18 | [18_SPRINT_PLAN.md](./18_SPRINT_PLAN.md) | Proposed sprints |
| 19 | [19_DEFINITION_OF_READY.md](./19_DEFINITION_OF_READY.md) | DoR |
| 20 | [20_DEFINITION_OF_DONE.md](./20_DEFINITION_OF_DONE.md) | DoD |
| 21 | [21_AGILE_GOVERNANCE.md](./21_AGILE_GOVERNANCE.md) | Governance |
| — | [modules/](./modules/) | Per-module deep dives |
| — | [evidence/](./evidence/) | Raw inventories (routes, APIs) |
| — | [product-backlog.csv](./product-backlog.csv) | Machine-readable backlog |
| — | [product-backlog.json](./product-backlog.json) | Machine-readable backlog |

---

## ID convention

| Type | Pattern | Example |
|------|---------|---------|
| Theme | `THM-###` | `THM-001` |
| Epic | `EPIC-{DOMAIN}-###` | `EPIC-IAM-001` |
| Feature Group | `FG-{DOMAIN}-{AREA}` | `FG-IAM-AUTH` |
| Feature | `FEAT-{DOMAIN}-{AREA}-###` | `FEAT-IAM-AUTH-001` |
| User Story | `US-{DOMAIN}-{AREA}-###` | `US-IAM-AUTH-001` |
| Bug | `BUG-{DOMAIN}-###` | `BUG-AUTH-001` |
| Technical | `TECH-{DOMAIN}-###` | `TECH-API-001` |
| Security | `SEC-{DOMAIN}-###` | `SEC-AUTH-001` |
| Spike | `SPIKE-{DOMAIN}-###` | `SPIKE-CHG-001` |
| Gap | `GAP-{DOMAIN}-###` | `GAP-NUR-001` |
| Workflow | `WF-{DOMAIN}-###` | `WF-OPD-001` |

Domain tokens (initial set from code): `IAM`, `PUB`, `PAT`, `DOC`, `HOS`, `ADM`, `SCH`, `SEA`, `OPD`, `IPD`, `ICU`, `CLN`, `LAB`, `RAD`, `OT`, `PHA`, `NUR`, `RCV`, `BIL`, `AST`, `INV`, `PRC`, `FAC`, `INS`, `BLD`, `ED`, `STO`, `AUT`, `CC`, `PRED`, `SUB`, `MOB`, `PLT`.

---

## Status model (features & stories)

| Status | Meaning |
|--------|---------|
| `IMPLEMENTED` | End-to-end chain evidenced |
| `PARTIALLY_IMPLEMENTED` | Important pieces exist; workflow incomplete |
| `FRONTEND_ONLY` | UI without backend/integration |
| `BACKEND_ONLY` | Backend without complete UI |
| `PLACEHOLDER` | Demo/stub screen |
| `PLANNED` | Explicit intent; little/no implementation |
| `TECHNICAL_FOUNDATION` | Infra, not user-facing |
| `UNKNOWN` | Insufficient evidence — **never upgrade by assumption** |

---

## Applications identified (Phase A)

| App | Path | Stack |
|-----|------|-------|
| API | `backend/health360-api/` | Java 21, Spring Boot 3.3.5, PostgreSQL, Flyway, Redis, JWT |
| Web | `frontend/health360-web/` | React 19, Vite 6, MUI 6, Redux (auth), TanStack Query, axios |
| Mobile | `mobile/health360-mobile/` | Expo ~52, React Native 0.76 |

---

## How to use this tree

1. **Product Owner** → Themes, Epics, Backlog, Roadmap, Releases.
2. **Engineering** → Module docs, Traceability, Tech debt, Bugs.
3. **QA** → Acceptance criteria + critical workflow ACs.
4. **Leadership** → [01_PRODUCT_BASELINE.md](./01_PRODUCT_BASELINE.md) management view (updated after Phase D+).

---

## Checkpoint

- [x] Repository structure mapped (Phase A)
- [x] Technology stack verified from manifests
- [x] Applications identified
- [x] Controllers / migrations / roles counted from code
- [x] Web routes extracted / inventory started (Phase B **partial**)
- [x] Themes/Epics/Feature Groups/Features skeleton (Phase D)
- [x] Phase C spot-check + feature status overlay
- [x] Baseline user stories for verified features (Phase E progressive)
- [x] Gap / bug / tech / backlog / roadmap / sprint proposals drafted
- [ ] Full frontend inventory with per-route status (Phase B complete)
- [ ] Broader E2E verification beyond spot-check (Phase C expand)
- [ ] Themes/Epics frozen after fuller B/C verification
- [ ] Phase K cross-doc ID/count validation pass
