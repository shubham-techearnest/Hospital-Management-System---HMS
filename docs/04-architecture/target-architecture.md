# Target Architecture — Health360 HMS

| Document ID | ARCH-TARGET-001 |
| Status | DRAFT |

---

## Stack (unchanged)

| Layer | Technology |
|-------|------------|
| API | Spring Boot 3.3.5, Java 21, modular monolith |
| DB | PostgreSQL 16, Flyway V1–V41 applied; **V42+ for new work** |
| Web | React 19, Vite, TypeScript, MUI 6, Redux, React Query |
| Mobile | Expo SDK 52, React Native, React Navigation 7 |
| Security | JWT RS256, refresh tokens, RBAC, `@PreAuthorize` |

**Out of scope:** Next.js migration, Flutter migration, microservices split.

---

## Logical architecture

```text
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ health360-  │  │ health360-  │  │ health360-  │
│ web         │  │ mobile      │  │ (future)    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │ HTTPS /api/v1
              ┌─────────▼─────────┐
              │  health360-api    │
              │  (modular mono)   │
              ├───────────────────┤
              │ IAM │ Hospital    │
              │ Patient │ Clinical│
              │ OPD │ IPD │ Lab   │
              │ Rad │ Pharm │ Bill│
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │ PostgreSQL 16     │
              │ 17 schemas        │
              └───────────────────┘
```

---

## Encounter-centric clinical hub

All visit workflows create or extend **`clinical.encounters`**.  
Appointments, queue, IPD admission, billing, diagnostics attach to encounter or patient via encounter.

---

## Scope enforcement

| Role type | Mechanism |
|-----------|-----------|
| PLATFORM_ADMIN | Global |
| HOSPITAL_ADMIN | Hospital admin scope |
| RECEPTIONIST, NURSE, etc. | Staff assignment via `hospital.staff` |
| DOCTOR | Encounter + doctor profile |
| PATIENT | Own profile + own encounters |

Frontend route guards = UX only. **Backend mandatory.**

---

## API evolution

- Base path: `/api/v1`
- **Additive** endpoints (e.g. `POST /appointments/{id}/arrive`)
- No breaking changes without change control approval

---

## ADRs

[architecture-decision-records/README.md](./architecture-decision-records/README.md)

---

## As-built reference

[hms/HEALTH360-HMS-ARCHITECTURE.md](../hms/HEALTH360-HMS-ARCHITECTURE.md)
