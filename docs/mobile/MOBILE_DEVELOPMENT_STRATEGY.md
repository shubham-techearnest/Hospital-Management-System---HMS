# Health360 AI — Mobile Development Strategy

| Attribute | Value |
|-----------|-------|
| **Document ID** | MOBILE-STRAT-001 |
| **Version** | 1.0.0 |
| **Status** | **Active** |
| **Effective Date** | 2026-07-30 |
| **References** | [DOC-15](../15-DEVELOPMENT-ROADMAP.md), [MOBILE-API-001](./MOBILE_API_INTEGRATION_GUIDE.md), [DOC-10](../10-UI-UX-SCREEN-SPECIFICATION.md), [DOC-11](../11-SYSTEM-ARCHITECTURE-DOCUMENT.md) |

---

## 1. Executive Summary

Mobile development is no longer deferred to the end of Phase 1. From this sprint onward, **React Native development runs in parallel** with backend and web frontend work. Every sprint produces **four deliverables**: Backend, Web, Mobile, and Documentation.

Backend and web development **must not stop or slow down**. Mobile catches up incrementally—one sprint's worth of features at a time—while future sprints continue on all three codebases simultaneously.

**Goal:** By Sprint S15, the React Native application is nearly feature-complete and ready for final testing—not starting from scratch.

---

## 2. Permanent Development Workflow

### 2.1 Four-Deliverable Policy

| # | Deliverable | Repository Path |
|---|-------------|-----------------|
| 1 | Backend (Spring Boot) | `backend/health360-api/` |
| 2 | Web Frontend (React + Vite) | `frontend/health360-web/` |
| 3 | Mobile (React Native) | `mobile/health360-mobile/` |
| 4 | Documentation | `docs/mobile/` |

### 2.2 Within-Sprint Execution Order

For each sprint feature slice:

1. **Finish backend** — migrations, domain logic, REST APIs, validation, RBAC
2. **Finish web** — screens, forms, React Query hooks, role routing
3. **Implement equivalent mobile** — same APIs, mobile-friendly UX
4. **Update documentation** — screens, APIs consumed, navigation, pending work

This order applies to **new sprint work**. Mobile catch-up replays the same sequence for historical sprints (S1 → S7) without blocking S8+.

### 2.3 Sprint Review Output Template

Every sprint review must report:

| Item | Required |
|------|----------|
| Backend work completed | ✓ |
| Web work completed | ✓ |
| Mobile work completed | ✓ |
| Database migrations | ✓ |
| APIs added | ✓ |
| Documentation updated | ✓ |
| Tests passed | ✓ |
| Remaining work | ✓ |

Track status in [MOBILE_SPRINT_STATUS.md](./MOBILE_SPRINT_STATUS.md).

---

## 3. Functional Alignment

The mobile application consumes **exactly the same** platform contracts as the web application:

| Shared Contract | Source of Truth |
|-----------------|-----------------|
| REST APIs | `backend/health360-api/` controllers |
| DTOs / request shapes | Backend DTOs + web Zod schemas |
| Validation rules | Jakarta Validation (BE) + Zod (FE/Mobile) |
| Business rules | Domain services |
| RBAC | Spring Security + role claims in JWT |
| Authentication | JWT access + refresh token rotation |
| Authorization | `@PreAuthorize` + client-side route guards |

**No mobile-specific API layer.** See [MOBILE_API_INTEGRATION_GUIDE.md](./MOBILE_API_INTEGRATION_GUIDE.md) for endpoint reference.

---

## 4. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.76+ |
| Language | TypeScript |
| Navigation | React Navigation (Stack, Bottom Tabs, Drawer) |
| Server state | TanStack React Query |
| HTTP client | Axios (with refresh-token interceptor) |
| Forms | React Hook Form |
| Validation | Zod |
| UI | React Native Paper |
| Animation | React Native Reanimated (where appropriate) |
| Secure storage | expo-secure-store or react-native-keychain |

---

## 5. Architecture

Mirror the web application's feature-based structure:

```
mobile/health360-mobile/
├── src/
│   ├── app/                 # Navigation root, providers
│   ├── features/
│   │   ├── auth/
│   │   ├── patient/
│   │   ├── doctor/
│   │   ├── hospital/
│   │   └── settings/
│   ├── shared/
│   │   ├── api/             # Axios client, interceptors (mirror web)
│   │   ├── components/      # Reusable UI primitives
│   │   ├── hooks/
│   │   ├── schemas/         # Zod schemas (shared shapes with web)
│   │   └── theme/
│   └── config.ts
```

### 5.1 Code Reuse Principles

- **Reuse Zod schemas** — copy or extract shared validation from `frontend/health360-web/src/features/*/schemas/`
- **Reuse API types** — align TypeScript interfaces with web `*Api.ts` response types
- **Reuse business constants** — enums, option lists, completion weights
- **Do not duplicate** — extract shared logic to `src/shared/` when used by 2+ screens

### 5.2 API Client

The mobile Axios client must mirror `frontend/health360-web/src/shared/api/`:

- Base URL from config (`http://localhost:8080/api/v1` in dev)
- Bearer token on authenticated requests
- 401 → refresh token → retry (single-flight)
- Logout on refresh failure
- Standard `ApiError` shape handling

---

## 6. Mobile UX Guidelines

Maintain **feature parity** with web; adapt **layout** for mobile.

| Pattern | Usage |
|---------|-------|
| Bottom Tabs | Patient portal (Dashboard, Profile, Vitals, Appointments) |
| Stack Navigation | Auth flow, profile sections, booking wizard |
| Drawer | Settings, account, logout (optional) |
| Native pickers | Date of birth, appointment times |
| Native date/time | Schedule selection, reminders |
| Camera / file picker | Doctor verification documents (S6+) |

**Do not** copy desktop sidebar layouts verbatim. Use collapsible sections, bottom sheets, and full-screen forms where appropriate.

---

## 7. Catch-Up Program (S1–S7)

### 7.1 Current Status (2026-07-30)

| Workstream | Progress |
|------------|----------|
| Backend | Through Sprint S7 (target) |
| Web | Through Sprint S7 (target) |
| Mobile | S0 scaffold only |

Mobile is **~7 sprints behind**. Catch-up proceeds **one sprint per mobile iteration**, never all at once.

### 7.2 Catch-Up Mapping

| Sprint | Web Feature | Mobile Deliverable |
|--------|-------------|-------------------|
| S1 | Auth (register, login, verify email) | Auth stack + token storage + API client |
| S2 | RBAC, account settings, notification prefs | Settings screens + role-aware navigation |
| S3 | Patient profile (consent + accordion sections) | Patient profile screens |
| S4 | Vitals + profile completion | Vitals entry + completion widget |
| S5 | Doctor profile (accordion) | Doctor profile screens |
| S6 | Doctor verification + admin review | Document upload + verification status |
| S7 | Hospital setup + doctor association | Hospital admin screens |

After catch-up reaches the current sprint, **every new sprint** adds mobile work inline (S8+ scheduling, S11 dashboard, etc.).

### 7.3 Catch-Up Rules

1. **One sprint per mobile iteration** — e.g., first iteration = S1 mobile only
2. **Do not block backend/web** — catch-up runs alongside ongoing sprint work
3. **Same Definition of Done** — mobile sprint item is not "done" until docs updated
4. **Tests** — typecheck + manual smoke on iOS/Android simulator per sprint

---

## 8. Documentation Requirements

After each sprint (including catch-up iterations), update `docs/mobile/`:

| Document | Purpose |
|----------|---------|
| [MOBILE_SPRINT_STATUS.md](./MOBILE_SPRINT_STATUS.md) | Sprint-by-sprint completion tracker |
| [MOBILE_API_INTEGRATION_GUIDE.md](./MOBILE_API_INTEGRATION_GUIDE.md) | API reference (when new endpoints ship) |
| Sprint notes (inline in status doc) | Screens added, navigation changes, components, pending work |

### 8.1 Per-Sprint Doc Checklist

- [ ] Implemented mobile screens listed
- [ ] APIs consumed documented
- [ ] Navigation structure updated (diagram or tree)
- [ ] New reusable components listed
- [ ] Pending / blocked work noted
- [ ] Screens available for QA smoke test

---

## 9. Native Project Initialization

The current `mobile/health360-mobile/` directory is a TypeScript scaffold. Before S1 mobile catch-up:

```bash
cd mobile
npx @react-native-community/cli@latest init Health360Mobile --directory health360-mobile --skip-git-init
# Or: npx create-expo-app health360-mobile --template blank-typescript
```

Then install stack dependencies and migrate `src/` structure per Section 5.

---

## 10. Quality Gates

| Gate | Requirement |
|------|-------------|
| TypeScript | `npm run typecheck` passes |
| Lint | ESLint configured (S1 mobile+) |
| API parity | Mobile uses same endpoints as web for the feature |
| RBAC | Role guards prevent unauthorized screen access |
| Offline | Queue writes per MOBILE-API-001 offline strategy (S4+) |
| Accessibility | Paper components with labels; 44pt touch targets |

---

## 11. Related Documents

| ID | Document |
|----|----------|
| DOC-15 | [Development Roadmap](../15-DEVELOPMENT-ROADMAP.md) |
| MOBILE-API-001 | [Mobile API Integration Guide](./MOBILE_API_INTEGRATION_GUIDE.md) |
| MOBILE-STATUS-001 | [Mobile Sprint Status](./MOBILE_SPRINT_STATUS.md) |
| DOC-10 | [UI/UX Screen Specification](../10-UI-UX-SCREEN-SPECIFICATION.md) |
| ADR-013 | Parallel Mobile Development (see [DOC-00](../00-PROJECT-MEMORY.md)) |

---

## 12. Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Technical Lead | — | 2026-07-30 | Approved |
| Product Owner | — | Pending | — |
