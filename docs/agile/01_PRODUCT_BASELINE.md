# 01 — Product Baseline (Pre-Agile)

| Attribute | Value |
|-----------|-------|
| **Document ID** | AGILE-BASE-001 |
| **Status** | DRAFT — expands through Phases C–E |
| **Last Updated** | 2026-09-17 |

---

## Management view (Phase A snapshot)

### Where are we now?

Health360 is a **multi-tenant hospital operating system + consumer health platform** implemented as:

- Modular monolith API (Java 21 / Spring Boot 3.3) with **60** REST controllers and **104** Flyway migrations (tip **V104**)
- Web SPA with **12** role portals and a large hospital-admin surface
- Expo mobile app with substantial screen coverage (thinner than web for hospital ops)

Significant clinical HMS (OPD/IPD/ICU/Lab/Rad/OT/Pharmacy) and V2 ops modules (inventory, procurement, assets, ED, automation, etc.) exist as **code + schema**.  
**Agile status of each capability is NOT frozen yet** — Phase C must verify end-to-end before claiming `IMPLEMENTED`.

### What is incomplete? (early signals — not final gap register)

| Signal | Evidence class |
|--------|----------------|
| Nursing depth partial (SSOT hypothesis) | DOCUMENT + needs code trace |
| Charge engine DRY_RUN / partial mode | DOCUMENT + migrations V92–V93 / V103 |
| Notification email/SMS stubs | DOCUMENT + gateway code patterns |
| Patient portal missing RoleRoute | CODE-VERIFIED |
| RoleRoute null-user edge | CODE-VERIFIED |
| Mobile parity gaps vs web ops | DOCUMENT + folder scan |
| Vision items (ambulance, homecare, physio, AI CDS) | No packages / PLANNED only |
| SSOT lag (V103 vs V104) | CODE vs DOCUMENT |

### What are we working on? (git-inferred, not a sprint board)

Recent commits emphasize: landing/auth UX, documentation, assets, OPD/IPD testing, Phase G/H.

**Confidence: MEDIUM** (commit messages only).

### What comes next?

Deferred to [16_ROADMAP.md](./16_ROADMAP.md) after Phases F–H.  
Until then: **stabilize identity/RBAC edges**, **complete incomplete clinical workflows**, **verify charge/billing modes**, **mobile parity decisions**.

### What blocks us?

Unknown team capacity/velocity. Technical blockers to confirm in Phase C (authz edges, charge mode, notification delivery, test gaps).

### When do we expect completion?

**Dates: UNKNOWN** — no measured velocity. Sequencing only after backlog prioritization.

---

## Baseline labeling rule

All work already in `master` before formal Agile adoption is labeled:

```text
Baseline / Pre-Agile Existing Implementation
```

Do **not** assign historical Sprint IDs.

---

## Product definition (CODE + VISION)

| Aspect | Statement | Evidence |
|--------|-----------|----------|
| Product name | Health360 | Repo / branding |
| Positioning | Multi-tenant hospital OS + consumer health | `docs/ssot/01-PRODUCT/PRODUCT-VISION.md` (intent) + implemented portals |
| Tenancy | Hospital-scoped staff + platform admin | Scope services + hospital portals |
| Access policy (current UX) | Patients self-register; hospitals/doctors request/demo; staff via hospital invite | RegisterPage, onboarding V104, StaffService |

---

## Quantitative discovery snapshot (Phase A–E)

| Metric | Value | Confidence |
|--------|------:|------------|
| IAM roles | 12 | HIGH |
| REST controllers | 60 | HIGH |
| Flyway migrations | 104 (tip V104) | HIGH |
| Web feature folders | 39 | HIGH |
| Themes | 8 | HIGH |
| Epics | 38 | HIGH |
| Feature groups | 76 | HIGH |
| Features (catalog) | 112 | HIGH |
| Features status-verified (overlay) | 34 | HIGH |
| User stories (this pass) | ~38 | HIGH |
| Backlog CSV rows | 49 | HIGH |
| Phase C workflows spot-checked | 15 | HIGH |
| Backend test files | 59 | HIGH |
| Mobile screens (~) | 75 | HIGH |

---

## Baseline eras (approximate, git-derived)

| Era | Signal | Notes |
|-----|--------|-------|
| Platform foundation | Early IAM/hospital/patient/doctor/scheduling migrations V1–V29 | Pre-HMS depth |
| Clinical HMS expansion | V30–V89 clinical + billing + letterhead | OPD/IPD heavy commit themes |
| HMS V2 ops | V90–V103 automation → hardening | Ops modules |
| Growth / onboarding | V104 onboarding_requests + marketing/auth UX | Latest |

These are **implementation eras**, not sprints.

---

## Update cadence

This document must be refreshed after:

- Phase C verification (status confidence)
- Phase E baseline story freeze
- Each release planning cycle
