# Health360 API

Spring Boot 3 modular monolith — Java 21.

## Modules (bounded contexts)

```
com.health360
├── config/          # Cross-cutting Spring configuration
├── shared/          # Shared kernel
├── iam/             # Identity & Access Management
├── patient/         # Patient health profile
├── doctor/          # Doctor professional profile
├── hospital/        # Hospital management
├── scheduling/      # Appointments & schedules
├── location/        # Geo search (ACL)
└── analytics/       # Formula engine & dashboard
```

Each module follows Clean Architecture: `domain` → `application` → `infrastructure` → `presentation`.

## Run locally

```bash
# Requires PostgreSQL 16 + Redis 7
export SPRING_PROFILES_ACTIVE=local
mvn spring-boot:run
```

Health: http://localhost:8080/api/v1/health  
Swagger: http://localhost:8080/swagger-ui.html

## Migrations

Flyway scripts: `src/main/resources/db/migration/`

| Version | Content |
|---------|---------|
| V1 | shared + iam schemas [DOC-06] |

## Tests

```bash
mvn verify   # includes Testcontainers integration test
```
