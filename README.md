# Health360 AI

Enterprise Digital Healthcare Ecosystem — Phase 1 Foundation.

## Documentation

Architecture and requirements live in [`docs/`](docs/). Start with [Documentation Index](docs/README.md) or [DOC-00 Project Memory](docs/00-PROJECT-MEMORY.md).

| Layer | Path |
|-------|------|
| Backend API | `backend/health360-api/` |
| Web App | `frontend/health360-web/` |
| Mobile App | `mobile/health360-mobile/` |
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
# 1. Environment
cp .env.example .env

# 2. Start infrastructure + apps
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --build

# 3. Verify
curl http://localhost:8080/api/v1/health
curl http://localhost:8080/actuator/health
```

Open the web app at [http://localhost:3000](http://localhost:3000).

### Without Docker (partial)

**Backend** (requires PostgreSQL + Redis running locally):

```bash
cd backend/health360-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Mobile** (Expo SDK 52 — see [Mobile Setup Guide](docs/phase-1/mobile/MOBILE_SETUP.md)):

```powershell
.\scripts\doctor-mobile.ps1   # validate Node, Android SDK, Expo Doctor
.\scripts\start-mobile.ps1    # start Metro / Expo
```

Native Android build (requires Android Studio + SDK):

```powershell
cd mobile/health360-mobile
npm run android
```

## Repository Structure

```
health360-ai/
├── docs/                 # Documentation — see docs/README.md
│   ├── phase-1/          # Requirements, architecture, delivery, mobile
│   └── phase-2/          # Future phase placeholder
├── backend/health360-api/  # Spring Boot 3 modular monolith
├── frontend/health360-web/ # React 19 + TypeScript + MUI
├── mobile/health360-mobile/ # React Native + Expo (S1–S7)
├── docker/               # Compose + NGINX
└── .github/workflows/    # CI pipelines
```

## Architecture

- **Style:** Modular Monolith (DDD + Clean Architecture)
- **Modules:** IAM, Patient, Doctor, Hospital, Scheduling, Location, Analytics
- **Stack:** Java 21, Spring Boot 3, PostgreSQL 16, Redis 7, React 19, React Native

See [DOC-11 System Architecture](docs/phase-1/architecture/11-SYSTEM-ARCHITECTURE-DOCUMENT.md).

## Development Roadmap

Implementation follows [DOC-15 Development Roadmap](docs/phase-1/delivery/15-DEVELOPMENT-ROADMAP.md):

| Sprint | Focus |
|--------|-------|
| S0 | Project kickoff (this scaffold) |
| S1–S2 | Auth platform |
| S3–S4 | Patient profile |
| S5–S7 | Doctor + Hospital |
| S8–S9 | Scheduling |
| S10–S12 | Analytics + Search |

## License

Proprietary — TechEarnest / Health360 AI. All rights reserved.
