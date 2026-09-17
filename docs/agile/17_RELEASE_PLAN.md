# 17 — Release Plan

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-REL-001 |
| **Status** | DRAFT — Phase I |
| **Last Updated** | 2026-09-17 |
| **Calendar dates** | UNKNOWN (no velocity) |

Releases are **named milestones** matching [16_ROADMAP.md](./16_ROADMAP.md). They are not git tags unless later created.

---

## Releases

| Release ID | Name | Roadmap phase | Primary contents | Exit criteria |
|------------|------|---------------|------------------|---------------|
| REL-BASELINE | Baseline Capture | Baseline | Catalog of verified IMPLEMENTED/PARTIAL capabilities; no new feature commitment | Docs 08–15 consistent with Phase C |
| REL-STABILIZATION | Trust & FE Path Stabilization | Stabilization | BUG-AUTH-001/002, BUG-API-001, RoleRoute hardening | Authz gaps closed; FE `/api/v1` double-prefix fixed; CC re-smoke |
| REL-CORE-WF | Core Workflow Continuity | Core Workflow Completion | Charge attach/POST→invoice, onboarding provision, payment secret hygiene start | WF-OPD/BIL/ONB gaps closed or explicitly deferred with PO sign-off |
| REL-MODULE | Module Completion Wave | Module Completion | Verified UNKNOWN→status upgrades across clinical/ops modules; mobile scope decision | Overlay covers majority of in-MVP modules |
| REL-INTEGRATION | Integrated Hospital Ops | Integration | Cross-module journeys, automation/tasks/CC reliability | E2E WF catalog green for listed workflows |
| REL-HARDENING | Hardening | Hardening | Notifications, tests, security, stub removal | TECH-NTF-001 decided; golden-path ITs expanded |
| REL-READINESS | Production Readiness | Release Readiness | UAT, secrets, runbooks, release checklist | Go/no-go for production candidate |
| REL-FUTURE | Future Expansion | Future Expansion | Ambulance, homecare, physio, AI CDS (vision) | Per-item charter only; not implied shipped |

---

## Intake rules

1. Baseline items stay labeled Baseline — do not rewrite history into REL-STABILIZATION.
2. Vision gaps (GAP-VIS-*) only enter REL-FUTURE until PO promotes them.
3. Every release candidate must list open P0/P1 bugs remaining.
