# Repository / Codebase Inventory

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-REPO-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Created** | 2026-09-16 |
| **Evidence** | CODE-VERIFIED / GIT-VERIFIED |

---

## Monorepo layout (CURRENT)

| Path | Role |
|------|------|
| `backend/health360-api/` | Spring Boot 3.3.5 / Java 21 API (`0.1.0-SNAPSHOT`) |
| `frontend/health360-web/` | React 19 + Vite 6 + MUI 6 web |
| `mobile/health360-mobile/` | Expo ~52 / RN 0.76.9 |
| `docker/` | Compose (Postgres 16, Redis 7, API, nginx) |
| `docs/` | Documentation (~323 md) + SSOT under `docs/ssot/` |
| `scripts/` | Local DB / utility scripts |
| `.github/workflows/` | CI + keep-alive |
| `Figma/`, `Figma1/`, `mannual/` | Design / misc (non-runtime) |

---

## Backend packages (`com.health360`) — CODE-VERIFIED

`adt`, `analytics`, `asset`, `automation`, `billing`, `blood`, `clinical`, `commandcenter`, `config`, `dashboard`, `doctor`, `documents`, `emergency`, `facility`, `hospital`, `iam`, `icu`, `insurance`, `inventory`, `ipd`, `laboratory`, `location`, `opd`, `org`, `ot`, `patient`, `pharmacy`, `predictive`, `procurement`, `radiology`, `review`, `scheduling`, `search`, `shared`, `staffops`, `subscription`, `tasks`, `workflow`

**Controllers:** 58 `@RestController` classes.  
**Flyway:** V1–**V103** (103 files).  
**Tests:** ~59 Java test files (~27 IT, ~29 unit, 3 support).

---

## Web features (`frontend/health360-web/src/features`) — CODE-VERIFIED

`admin`, `analytics`, `asset`, `auth`, `billing`, `blood`, `clinical`, `commandcenter`, `dashboard`, `doctor`, `documents`, `emergency`, `facility`, `hospital`, `icu`, `icu-nurse`, `insurance`, `inventory`, `ipd`, `lab`, `location`, `nursing`, `opd`, `org`, `ot`, `patient`, `pharmacy`, `predictive`, `procurement`, `public`, `radiology`, `reception`, `review`, `scheduling`, `search`, `settings`, `staffops`, `subscription`, `tasks`

**Portals:** 12 role layouts (patient, doctor, hospital admin, platform admin, lab, radiology, OT, pharmacy, asset manager, reception, nurse, ICU nurse).

---

## Mobile — CODE-VERIFIED

Expo app with role shells: patient, doctor, reception, hospital admin, platform admin, staff worklist (lab/rad/pharm/OT/nurse/ICU).  
**Missing vs web:** IPD/ICU/ED ops, assets, inventory, procurement, facility, insurance, blood, command center, predictive, charge exceptions, ASSET_MANAGER shell.

---

## Infrastructure artifacts

| Artifact | Status |
|----------|--------|
| `docker/docker-compose.yml` (+ `.dev`) | PRESENT |
| Dockerfiles (API, web) | PRESENT |
| GitHub Actions CI (backend/frontend/mobile/e2e/keep-alive) | PRESENT |
| `render.yaml` / Terraform / k8s manifests | **NOT IN REPO** (Render referenced in config/comments only) |
| Root `.env.example` | PRESENT |
| Git branch | `master` (workflows mention `main`/`develop`) |

---

## Runtime stack (CURRENT)

| Layer | Technology |
|-------|------------|
| API | Java 21, Spring Boot 3.3.5, JPA/Hibernate, Flyway |
| DB | PostgreSQL 16 |
| Cache | Redis 7 (optional; excluded in local/production profiles) |
| Web | React 19, Vite, MUI, TanStack Query, Redux (auth only) |
| Mobile | Expo 52, React Navigation, TanStack Query, Secure Store |
| Auth | JWT RS256, BCrypt(12), method `@PreAuthorize` |
| Payments | Razorpay (orders + webhook) |
| SMS | MSG91 or log stub |
| Email | Log-based local service (no SMTP found) |
| Push | Expo Push |
| Files | Local filesystem storage (no S3 found) |
