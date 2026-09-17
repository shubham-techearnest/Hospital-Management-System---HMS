# Project Dashboard

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-DASH-001 |
| **Version** | 1.0 |
| **Status** | CURRENT — CODE VERIFIED |
| **Last Updated** | 2026-09-17 |

```text
HEALTH360 PROJECT STATUS

Product:           Health360 (Hospital + consumer health OS)
Artifact version:  backend 0.1.0-SNAPSHOT · web/mobile 0.1.0
DB Flyway tip:     V103
Git branch:        master (CI workflows reference main/develop)

Backend:           STRONG MVP — modular monolith, 58 controllers, V1–V103
Web:               STRONG MVP — 12 role portals, deep HMS ops
Mobile:            PARTIAL — patient/doctor/reception/admin; ops lag web
Database:          STRONG — 29 schemas; additive Flyway chain
Testing:           PARTIAL — Java IT/unit + Playwright OPD; coverage % UNKNOWN
Deployment:        PARTIAL — Docker Compose + GitHub Actions; Render refs; no in-repo k8s/tf

Current focus:     SSOT documentation freeze + release hygiene after HMS-24
Last delivery:     HMS-24 V2 hardening (charge exceptions, RX_DISPENSE, indexes)
Completed:         UNKNOWN % (scope not frozen numerically)
In progress:       Documentation SSOT; uncommitted HMS V2 code integration
Planned:           Production hardening, ECO/OPD polish, mobile My Work, templates
Blocked:           UNKNOWN (no single ticket system evidenced in-repo)
Technical debt:    See TECHNICAL-DEBT.md (open items exist; exact count fluid)
Critical risks:    Doc/code drift; dirty git tree; integration stubs; mobile gap
Next milestone:    Stakeholder approve SSOT as sole truth + cut release branch
```

## Where to dig deeper

| Topic | Doc |
|-------|-----|
| Narrative current state | [17-IMPLEMENTATION-STATUS/CURRENT-STATE.md](./17-IMPLEMENTATION-STATUS/CURRENT-STATE.md) |
| Feature matrix | [FEATURE-INVENTORY.md](./FEATURE-INVENTORY.md) |
| Roadmap | [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md) |
| Gaps | [GAP-ANALYSIS.md](./GAP-ANALYSIS.md) |
| Risks | [RISK-REGISTER.md](./RISK-REGISTER.md) |
