# CI/CD — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-CICD-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## Workflows (`.github/workflows`)

| Workflow | Purpose |
|----------|---------|
| `ci-backend.yml` | Backend CI (JDK 21); paths `backend/**`; branches `main`,`develop` |
| `ci-frontend.yml` | Frontend CI |
| `ci-mobile.yml` | Mobile CI |
| `e2e-opd.yml` | Playwright OPD |
| `keep-alive.yml` | Cron ping health URL (Render-oriented) |

## Gaps

- Repo default branch evidenced as `master` — **mismatch** with workflow branch filters
- No in-repo CD manifests for k8s/terraform
- Production deploy procedure: UNKNOWN beyond PaaS hints

## Release management

Artifact versions still `0.1.0-SNAPSHOT` — formal semver release process UNKNOWN.
