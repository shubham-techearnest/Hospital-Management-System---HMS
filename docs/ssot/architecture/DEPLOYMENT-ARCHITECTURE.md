# Deployment Architecture — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-DEP-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## What exists in-repo

| Piece | Evidence |
|-------|----------|
| Docker Compose (Postgres, Redis, API) | `docker/docker-compose.yml` |
| API + Web Dockerfiles | `backend/.../Dockerfile`, `frontend/.../Dockerfile` |
| Nginx sample | `docker/nginx/nginx.conf` |
| GitHub Actions CI | `.github/workflows/ci-*.yml`, `e2e-opd.yml` |
| Keep-alive cron to health URL | `keep-alive.yml` (Render-oriented) |

## What does not exist in-repo

- `render.yaml` / Terraform / Helm / k8s manifests
- Documented multi-region DR runbooks (UNKNOWN)

## Profiles

| Profile | Notes |
|---------|-------|
| `local` | Default; Redis autoconfig excluded |
| `dev` | Debug logging |
| `production` | `PORT`, production base URL defaults; Redis excluded |

## Labeling

**CURRENT:** Compose + CI + external PaaS hints.  
**TARGET:** Formal staging/prod topology — UNKNOWN until infra-as-code added.
