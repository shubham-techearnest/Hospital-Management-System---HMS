# Health360 — Single Source of Truth (SSOT)

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-INDEX-001 |
| **Title** | Documentation Index (Canonical) |
| **Version** | 2.0 |
| **Status** | CURRENT — CODE VERIFIED |
| **Created** | 2026-09-16 |
| **Last Updated** | 2026-09-17 |
| **Evidence basis** | CODE-VERIFIED + DATABASE-VERIFIED + GIT-VERIFIED |

---

## Rule

**`docs/ssot/` is the ONLY Health360 documentation tree.**

Do not add competing plans under `docs/`. Do not resurrect deleted phase/HMS/feature doc trees.

---

## What is Health360?

A multi-tenant **hospital operating system + consumer health platform**.  
Read: [01-PRODUCT/PRODUCT-VISION.md](./01-PRODUCT/PRODUCT-VISION.md)

---

## Start here

| Question | Document |
|----------|----------|
| Where are we today? | [17-IMPLEMENTATION-STATUS/CURRENT-STATE.md](./17-IMPLEMENTATION-STATUS/CURRENT-STATE.md) |
| One-page status | [PROJECT-DASHBOARD.md](./PROJECT-DASHBOARD.md) |
| Modules & workflows | [MODULES-AND-WORKFLOWS.md](./MODULES-AND-WORKFLOWS.md) |
| Features matrix | [FEATURE-INVENTORY.md](./FEATURE-INVENTORY.md) |
| **Complete user stories (Excel)** | [Health360_Complete_User_Stories.xlsx](./Health360_Complete_User_Stories.xlsx) — single sheet master backlog |
| **User stories — execution order** | [Health360_Complete_User_Stories_Execution_Ordered.xlsx](./Health360_Complete_User_Stories_Execution_Ordered.xlsx) — same stories, sorted by dependency-safe module → status |
| Requirements | [03-REQUIREMENTS/MASTER-REQUIREMENTS.md](./03-REQUIREMENTS/MASTER-REQUIREMENTS.md) |
| Open conflicts/decisions | [REQUIREMENT-CONFLICT-REGISTER.md](./REQUIREMENT-CONFLICT-REGISTER.md) |
| Architecture (now) | [architecture/SYSTEM-ARCHITECTURE.md](./architecture/SYSTEM-ARCHITECTURE.md) |
| Architecture (target) | [architecture/TARGET-ARCHITECTURE.md](./architecture/TARGET-ARCHITECTURE.md) |
| Database | [database/DATABASE-ARCHITECTURE.md](./database/DATABASE-ARCHITECTURE.md) · tip **V103** |
| APIs | [api/API-CATALOG.md](./api/API-CATALOG.md) · [api/AUTHENTICATION.md](./api/AUTHENTICATION.md) · [api/RBAC.md](./api/RBAC.md) |
| Web / Mobile | [web/](./web/) · [mobile/](./mobile/) |
| Roadmap / sprint | [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md) · [CURRENT-SPRINT.md](./CURRENT-SPRINT.md) |
| Gaps / debt / risks | [GAP-ANALYSIS.md](./GAP-ANALYSIS.md) · [TECHNICAL-DEBT.md](./TECHNICAL-DEBT.md) · [RISK-REGISTER.md](./RISK-REGISTER.md) |
| **Product Owner master plan** | [PRODUCT-OWNER-MASTER-PLAN.md](./PRODUCT-OWNER-MASTER-PLAN.md) |
| Decisions | [decisions/ADR-INDEX.md](./decisions/ADR-INDEX.md) |
| Repo inventory | [REPOSITORY-INVENTORY.md](./REPOSITORY-INVENTORY.md) |
| Doc reset record | [DOCUMENTATION-AUDIT.md](./DOCUMENTATION-AUDIT.md) |

---

## Structure

```text
docs/ssot/
├── README.md                          ← you are here
├── 01-PRODUCT/                        ← vision & scope
├── 03-REQUIREMENTS/                   ← master requirements
├── 17-IMPLEMENTATION-STATUS/          ← current state
├── architecture/ | database/ | backend/ | api/
├── web/ | mobile/ | ux/
├── testing/ | devops/ | integrations/ | decisions/
└── planning & quality (root md files)
```

---

## Evidence labels

| Label | Meaning |
|-------|---------|
| CODE-VERIFIED | Confirmed in source |
| DATABASE-VERIFIED | Confirmed in Flyway / schema |
| GIT-VERIFIED | Confirmed in git |
| DOCUMENT-VERIFIED | From prior docs only |
| INFERRED | Reasonable conclusion |
| PROPOSED / FUTURE | Not implemented |
| UNKNOWN | Not established |

Never invent completion percentages. Use **UNKNOWN** when the denominator is not frozen.

---

## CURRENT vs TARGET vs FUTURE

| Layer | Meaning |
|-------|---------|
| CURRENT | Exists in code/DB now |
| NEXT | Near-term backlog (needs approval to commit) |
| TARGET | Intended architecture direction |
| FUTURE / PROPOSED | Long-term vision only |

---

## Change management

Any requirement change must update: master requirements → feature inventory → current state → affected arch/API/DB/client docs → traceability → roadmap/sprint → conflict/ADR when needed.

---

## Catalog (all canonical docs)

### Product & status
[PRODUCT-VISION](./01-PRODUCT/PRODUCT-VISION.md) · [MODULES-AND-WORKFLOWS](./MODULES-AND-WORKFLOWS.md) · [CURRENT-STATE](./17-IMPLEMENTATION-STATUS/CURRENT-STATE.md) · [PROJECT-DASHBOARD](./PROJECT-DASHBOARD.md) · [FEATURE-INVENTORY](./FEATURE-INVENTORY.md) · [PRODUCT-ROADMAP](./PRODUCT-ROADMAP.md) · [SPRINT-CATALOG](./SPRINT-CATALOG.md) · [CURRENT-SPRINT](./CURRENT-SPRINT.md) · [REPOSITORY-INVENTORY](./REPOSITORY-INVENTORY.md) · [DOCUMENTATION-AUDIT](./DOCUMENTATION-AUDIT.md)

### Requirements & planning
[MASTER-REQUIREMENTS](./03-REQUIREMENTS/MASTER-REQUIREMENTS.md) · [USER-STORY-CATALOG](./USER-STORY-CATALOG.md) · [REQUIREMENT-CONFLICT-REGISTER](./REQUIREMENT-CONFLICT-REGISTER.md) · [TRACEABILITY-MATRIX](./TRACEABILITY-MATRIX.md) · [DEPENDENCY-MATRIX](./DEPENDENCY-MATRIX.md)

### Architecture
[SYSTEM](./architecture/SYSTEM-ARCHITECTURE.md) · [C4](./architecture/C4-OVERVIEW.md) · [DATA-FLOW](./architecture/DATA-FLOW.md) · [SECURITY](./architecture/SECURITY-ARCHITECTURE.md) · [DEPLOYMENT](./architecture/DEPLOYMENT-ARCHITECTURE.md) · [TARGET](./architecture/TARGET-ARCHITECTURE.md) · [ADRs](./decisions/ADR-INDEX.md)

### Data / API / Backend
[DATABASE](./database/DATABASE-ARCHITECTURE.md) · [SCHEMAS](./database/SCHEMA-CATALOG.md) · [MIGRATIONS](./database/MIGRATIONS.md) · [API-CATALOG](./api/API-CATALOG.md) · [AUTHENTICATION](./api/AUTHENTICATION.md) · [RBAC](./api/RBAC.md) · [BACKEND](./backend/BACKEND-ARCHITECTURE.md) · [JOBS](./backend/BACKGROUND-JOBS.md)

### Clients
[WEB](./web/WEB-ARCHITECTURE.md) · [ROUTES](./web/ROUTE-CATALOG.md) · [MOBILE](./mobile/MOBILE-ARCHITECTURE.md) · [SCREENS](./mobile/SCREEN-CATALOG.md) · [UX](./ux/UX-OVERVIEW.md)

### Quality & ops
[TEST-STRATEGY](./testing/TEST-STRATEGY.md) · [LOCAL-DEV](./devops/LOCAL-DEVELOPMENT.md) · [CI-CD](./devops/CI-CD.md) · [INTEGRATIONS](./integrations/INTEGRATION-CATALOG.md) · [GAP-ANALYSIS](./GAP-ANALYSIS.md) · [TECHNICAL-DEBT](./TECHNICAL-DEBT.md) · [RISK-REGISTER](./RISK-REGISTER.md)
