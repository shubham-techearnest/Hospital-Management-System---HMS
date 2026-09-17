# Test Strategy — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-TEST-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## What exists

| Layer | Evidence | Status |
|-------|----------|--------|
| Backend unit tests | `src/test/java/**/*Test.java` | PRESENT |
| Backend integration tests | `*IntegrationTest` + Testcontainers pattern | PRESENT (Docker-gated) |
| HMS RBAC / golden path IT | `com.health360.hms.*` | PRESENT |
| Web Playwright | `test:e2e` scripts + `e2e-opd.yml` | PRESENT |
| Manual QA session docs | Deleted in 2026-09-17 reset; strategy remains here | NOT IN REPO |
| Mobile E2E automation | — | UNKNOWN / not first-class |
| Performance suite | — | NOT EVIDENCED |
| Formal security testing | — | NOT EVIDENCED |

## Strategy going forward

1. Map each P0 REQ to at least one automated API IT
2. Keep Playwright for OPD/checkout smoke
3. Add charge-engine + ED golden-path ITs
4. Publish coverage % (currently UNKNOWN)
5. Do not claim ASVS compliance without assessment
