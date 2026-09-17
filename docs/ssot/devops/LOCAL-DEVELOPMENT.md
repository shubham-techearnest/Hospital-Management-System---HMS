# Local Development — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-DEV-LOCAL-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## Typical stack

1. PostgreSQL `health360_db` / user `health360` (see `.env.example`, `scripts/init-local-db.sql`)
2. API: `SPRING_PROFILES_ACTIVE=local`, Maven `spring-boot:run`
3. Web: `npm run dev` with `VITE_API_BASE_URL`
4. Optional: `docker compose` for Postgres/Redis/API

## Notes

- Redis excluded under local profile
- Flyway runs on startup
- JWT keys via config / generated provider
