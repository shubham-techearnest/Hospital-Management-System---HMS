# Health360 AI

Multi-tenant hospital operating system and consumer health platform.

## Documentation

**Single source of truth:** [`docs/ssot/`](docs/ssot/README.md)

| Start here | Path |
|------------|------|
| SSOT index | [docs/ssot/README.md](docs/ssot/README.md) |
| Current state | [docs/ssot/17-IMPLEMENTATION-STATUS/CURRENT-STATE.md](docs/ssot/17-IMPLEMENTATION-STATUS/CURRENT-STATE.md) |
| Product vision | [docs/ssot/01-PRODUCT/PRODUCT-VISION.md](docs/ssot/01-PRODUCT/PRODUCT-VISION.md) |
| Local development | [docs/ssot/devops/LOCAL-DEVELOPMENT.md](docs/ssot/devops/LOCAL-DEVELOPMENT.md) |

## Repository layout

| Layer | Path |
|-------|------|
| Backend API | `backend/health360-api/` (Java 21, Spring Boot 3.3, Flyway) |
| Web App | `frontend/health360-web/` (React 19, Vite, MUI) |
| Mobile App | `mobile/health360-mobile/` (Expo ~52) |
| Docker / NGINX | `docker/` |

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | 3.9+ |
| Node.js | 20+ |
| Docker | 24+ |
| Docker Compose | v2+ |

## Quick Start (Local)

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --build
curl http://localhost:8080/api/v1/health
```

Web: [http://localhost:3000](http://localhost:3000) (when compose/dev server maps that port).

### Without Docker (partial)

**Backend** (PostgreSQL required; Redis optional / excluded in `local` profile):

```bash
cd backend/health360-api
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Mobile:**

```powershell
.\scripts\doctor-mobile.ps1
.\scripts\start-mobile.ps1
```

## Architecture (CURRENT)

Modular monolith API + React web SPA + Expo mobile + PostgreSQL 16.  
Details: [docs/ssot/architecture/SYSTEM-ARCHITECTURE.md](docs/ssot/architecture/SYSTEM-ARCHITECTURE.md).

## License

Proprietary — see project owner.
