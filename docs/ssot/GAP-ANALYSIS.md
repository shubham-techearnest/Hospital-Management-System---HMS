# Gap Analysis

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-GAP-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## Compare three baselines

| Baseline | Meaning |
|----------|---------|
| CURRENT | Code + Flyway V103 + web/mobile |
| APPROVED | HMS V2 locked decisions + implemented REQ seed |
| TARGET / VISION | UX spec + long-term Health OS list |

## Gaps

| ID | Gap | Class | Notes |
|----|-----|-------|-------|
| G-01 | Notification templates | Missing | Deferred HMS-24 |
| G-02 | Charge POST default | Partial | Config DRY_RUN |
| G-03 | Mobile hospital ops | Missing/Partial | Web-first |
| G-04 | Configurable rules UI | Missing | In-code rules |
| G-05 | Real email SMTP | Missing | Log stub |
| G-06 | Object storage | Missing | Local FS |
| G-07 | Infra as code | Missing | No tf/k8s/render.yaml |
| G-08 | Doc SSOT adoption | Process | Competing docs |
| G-09 | OpenAPI frozen file | Missing | Runtime only |
| G-10 | Formal security ASVS | Missing | Not assessed |
| G-11 | Ambulance/homecare/AI | Vision | Not started |
| G-12 | Encounter Workspace merge | UX Partial | Spec vs multiple pages |
| G-13 | CI branch mismatch | Broken process | main vs master |
| G-14 | Uncommitted V2 bulk | Release risk | git dirty |

## Broken

No single production outage list evidenced; treat G-13/G-14 as process breakage.
