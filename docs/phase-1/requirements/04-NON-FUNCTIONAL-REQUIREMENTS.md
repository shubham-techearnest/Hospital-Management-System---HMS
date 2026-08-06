# DOC-04: Health360 AI — Non-Functional Requirements (NFR)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-04 |
| **Title** | Non-Functional Requirements Specification |
| **Version** | 1.0 |
| **Status** | **Approved** |
| **Date** | 2026-07-28 |
| **Author** | Chief Software Architect / Technical Lead |
| **References** | [DOC-00] Project Memory, [DOC-01] Vision & Scope Charter, [DOC-02] Business Requirements Document, [DOC-03] Functional Requirements Specification |
| **Next Document** | [DOC-05] Domain Model & Bounded Contexts |

---

## 1. Executive Summary

This Non-Functional Requirements (NFR) Specification defines the quality attributes, operational constraints, and technical standards that **Health360 AI Phase 1** must satisfy. While [DOC-03] defines *what* the system does, this document defines *how well* the system must perform — across performance, security, scalability, availability, reliability, compliance, usability, maintainability, and operability.

All NFRs are measurable, testable, and traceable to strategic objectives [DOC-01 §3] and business goals [DOC-02 §5]. NFRs constrain architecture decisions in [DOC-11] and security design in [DOC-12].

---

## 2. Document Purpose & Scope

### 2.1 Purpose

Establish binding quality targets for:
- Architecture and technology selection [DOC-11]
- Security controls [DOC-12]
- Infrastructure sizing [DOC-13]
- Performance and load testing [DOC-14]
- Production readiness gates

### 2.2 NFR ID Convention

| Prefix | Category |
|--------|----------|
| NFR-PERF-XXX | Performance |
| NFR-SEC-XXX | Security |
| NFR-SCAL-XXX | Scalability |
| NFR-AVAIL-XXX | Availability & Reliability |
| NFR-COMP-XXX | Compliance & Privacy |
| NFR-USAB-XXX | Usability & Accessibility |
| NFR-MAINT-XXX | Maintainability & Extensibility |
| NFR-OPS-XXX | Operability & DevOps |
| NFR-DATA-XXX | Data Management |
| NFR-INT-XXX | Integration & Compatibility |

### 2.3 Priority

| Priority | Meaning |
|----------|---------|
| P0 | Launch blocker — must meet before production |
| P1 | Launch target — should meet before production |
| P2 | Post-launch improvement — tracked as tech debt if deferred |

---

## 3. Performance Requirements

Reference: [DOC-01 SO-003, SO-004], [DOC-03 AC-SRH-001, AC-ANL-001]

### 3.1 API Response Time

| ID | Requirement | Target | Measurement | Priority |
|----|-------------|--------|-------------|----------|
| NFR-PERF-001 | REST API response time (read operations) | ≤ 200ms p95, ≤ 500ms p99 | APM under normal load | P0 |
| NFR-PERF-002 | REST API response time (write operations) | ≤ 300ms p95, ≤ 800ms p99 | APM under normal load | P0 |
| NFR-PERF-003 | Authentication endpoints (login, refresh) | ≤ 300ms p95 | APM | P0 |
| NFR-PERF-004 | Search endpoints (doctors, hospitals) | ≤ 500ms p95 | APM | P0 |
| NFR-PERF-005 | Health dashboard (formula engine aggregation) | ≤ 2000ms p95 | APM | P0 |
| NFR-PERF-006 | File upload initiation (pre-signed URL) | ≤ 500ms p95 | APM | P1 |
| NFR-PERF-007 | Appointment booking (atomic transaction) | ≤ 1000ms p95 | APM | P0 |
| NFR-PERF-008 | Audit log write (async, non-blocking to caller) | ≤ 50ms additional latency | APM | P0 |

**Normal Load Definition:** 100 concurrent users, 50 requests/second aggregate.

### 3.2 Frontend Performance

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-PERF-010 | Web — Largest Contentful Paint (LCP) | ≤ 2.5 seconds | P0 |
| NFR-PERF-011 | Web — First Input Delay (FID) | ≤ 100ms | P0 |
| NFR-PERF-012 | Web — Cumulative Layout Shift (CLS) | ≤ 0.1 | P1 |
| NFR-PERF-013 | Web — Time to Interactive (TTI) | ≤ 3.5 seconds on 4G | P1 |
| NFR-PERF-014 | Mobile — App cold start to login screen | ≤ 3 seconds | P1 |
| NFR-PERF-015 | Mobile — Screen transition | ≤ 300ms | P1 |
| NFR-PERF-016 | Web — Initial JavaScript bundle (gzipped) | ≤ 500 KB | P1 |
| NFR-PERF-017 | Search results rendered in UI | ≤ 1 second after API response | P0 |

### 3.3 Database Performance

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-PERF-020 | PostgreSQL query execution (indexed reads) | ≤ 50ms p95 | P0 |
| NFR-PERF-021 | Complex search queries (multi-filter) | ≤ 200ms p95 | P0 |
| NFR-PERF-022 | Appointment slot lock query | ≤ 20ms p95 | P0 |
| NFR-PERF-023 | Connection pool utilization under normal load | ≤ 70% | P1 |

### 3.4 Caching Performance

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-PERF-030 | Redis cache hit for formula engine results | ≤ 5ms p95 | P0 |
| NFR-PERF-031 | Redis cache hit for geo/distance results | ≤ 5ms p95 | P1 |
| NFR-PERF-032 | Cache invalidation on profile update | ≤ 100ms | P0 |
| NFR-PERF-033 | Formula engine cache TTL | 5 minutes; invalidated on profile mutation | P0 |

### 3.5 Throughput

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-PERF-040 | Sustained API throughput (Phase 1 launch) | ≥ 100 requests/second | P0 |
| NFR-PERF-041 | Peak API throughput (burst) | ≥ 250 requests/second for 5 minutes | P1 |
| NFR-PERF-042 | Concurrent appointment bookings | ≥ 50 simultaneous without failure | P0 |
| NFR-PERF-043 | Notification dispatch throughput | ≥ 500 notifications/minute | P1 |

---

## 4. Security Requirements

Reference: [DOC-01 SO-006], [DOC-02 §10 CR-001–010], [ADR-004, ADR-005, ADR-010]

Detailed security architecture in [DOC-12]. NFR-level security targets:

### 4.1 Authentication & Authorization

| ID | Requirement | Standard / Implementation | Priority |
|----|-------------|--------------------------|----------|
| NFR-SEC-001 | All API endpoints (except public) require valid JWT | [FR-IAM-003] | P0 |
| NFR-SEC-002 | Access token expiry | 15 minutes [BR-AUTH-002] | P0 |
| NFR-SEC-003 | Refresh token expiry with rotation | 7 days; single-use rotation [BR-AUTH-003] | P0 |
| NFR-SEC-004 | Password hashing | bcrypt, cost factor ≥ 12 | P0 |
| NFR-SEC-005 | RBAC enforced on every protected endpoint | [FR-IAM-007] | P0 |
| NFR-SEC-006 | Account lockout after failed attempts | 5 attempts → 30 min lock [BR-AUTH-005] | P0 |
| NFR-SEC-007 | Password complexity policy enforced | [BR-AUTH-004] | P0 |
| NFR-SEC-008 | JWT signed with RS256 (asymmetric keys) | Industry best practice | P0 |
| NFR-SEC-009 | Refresh token stored as hash in Redis | Prevent token theft exposure | P0 |
| NFR-SEC-010 | Logout invalidates refresh token and blacklists access token JTI | [FR-IAM-005] | P0 |

### 4.2 Data Protection

| ID | Requirement | Implementation | Priority |
|----|-------------|----------------|----------|
| NFR-SEC-020 | Encryption in transit | TLS 1.2+ for all HTTP/API; HSTS enabled | P0 |
| NFR-SEC-021 | Encryption at rest — PostgreSQL | AWS RDS encryption (AES-256) | P0 |
| NFR-SEC-022 | Encryption at rest — S3 documents | SSE-S3 or SSE-KMS | P0 |
| NFR-SEC-023 | Encryption at rest — Redis | ElastiCache encryption in transit and at rest | P1 |
| NFR-SEC-024 | Sensitive fields never logged | Passwords, tokens, health data excluded from application logs | P0 |
| NFR-SEC-025 | PII masked in non-production environments | Data anonymization for dev/staging | P1 |
| NFR-SEC-026 | Health documents accessed via pre-signed URLs only | Time-limited (15 min), tenant-scoped | P0 |
| NFR-SEC-027 | Database credentials stored in AWS Secrets Manager | No hardcoded secrets | P0 |

### 4.3 Application Security

| ID | Requirement | Standard | Priority |
|----|-------------|----------|----------|
| NFR-SEC-030 | OWASP Top 10 mitigation | All categories addressed in design | P0 |
| NFR-SEC-031 | SQL injection prevention | Parameterized queries via JPA/Hibernate | P0 |
| NFR-SEC-032 | XSS prevention | Input sanitization; React auto-escaping; CSP headers | P0 |
| NFR-SEC-033 | CSRF protection | Not required for stateless JWT API; SameSite cookies if used | P0 |
| NFR-SEC-034 | Rate limiting on authentication endpoints | 10 requests/minute/IP for login | P0 |
| NFR-SEC-035 | Rate limiting on public search endpoints | 60 requests/minute/IP | P1 |
| NFR-SEC-036 | Rate limiting on registration | 5 requests/hour/IP | P0 |
| NFR-SEC-037 | Request payload size limit | 10 MB max (API gateway / NGINX) | P0 |
| NFR-SEC-038 | CORS policy | Whitelist known frontend origins only | P0 |
| NFR-SEC-039 | Security headers | X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy | P0 |
| NFR-SEC-040 | Dependency vulnerability scanning | Zero critical/high CVEs at launch | P0 |
| NFR-SEC-041 | Static application security testing (SAST) | Integrated in CI pipeline | P1 |
| NFR-SEC-042 | Dynamic application security testing (DAST) | Pre-launch pen test; zero critical findings | P0 |

### 4.4 Audit & Monitoring Security

| ID | Requirement | Implementation | Priority |
|----|-------------|----------------|----------|
| NFR-SEC-050 | Immutable audit log for all mutations | [FR-IAM-010] append-only table | P0 |
| NFR-SEC-051 | Authentication events logged | Login, logout, failed attempts, password change | P0 |
| NFR-SEC-052 | Health data access logged | Doctor viewing patient summary [FR-PAT-015] | P0 |
| NFR-SEC-053 | Audit log retention | Minimum 7 years (healthcare compliance) | P0 |
| NFR-SEC-054 | Security event alerting | Failed login spikes, unauthorized access attempts | P1 |

---

## 5. Scalability Requirements

Reference: [DOC-01 SO-007], [ADR-001]

| ID | Requirement | Phase 1 Target | Future Target | Priority |
|----|-------------|---------------|---------------|----------|
| NFR-SCAL-001 | Registered users | 50,000 | 1,000,000 | P0 |
| NFR-SCAL-002 | Concurrent active users | 500 | 10,000 | P0 |
| NFR-SCAL-003 | Patient profiles | 50,000 | 1,000,000 | P0 |
| NFR-SCAL-004 | Doctor profiles | 5,000 | 100,000 | P0 |
| NFR-SCAL-005 | Hospital profiles | 1,000 | 20,000 | P0 |
| NFR-SCAL-006 | Appointments per day | 5,000 | 100,000 | P0 |
| NFR-SCAL-007 | Health documents stored | 100,000 files / 500 GB | 10M files / 50 TB | P1 |
| NFR-SCAL-008 | Audit log entries per day | 100,000 | 10,000,000 | P0 |
| NFR-SCAL-009 | Search index size | 10,000 doctors + 1,000 hospitals | 100x growth without re-architecture | P1 |
| NFR-SCAL-010 | Horizontal scaling readiness | Stateless API behind load balancer | Auto-scaling group | P1 |
| NFR-SCAL-011 | Database vertical scaling headroom | 4 vCPU / 16 GB RAM initial; scalable to 32 vCPU / 128 GB | Read replicas for search | P1 |
| NFR-SCAL-012 | Module extraction readiness | Any domain module extractable as microservice without schema redesign | [ADR-001] | P0 |
| NFR-SCAL-013 | Multi-tenant data isolation | tenant_id on all tables; row-level filtering | Full tenant isolation with separate schemas | P0 |

### 5.1 Scalability Strategy (Phase 1)

```
Phase 1 Launch          Phase 1 Growth           Phase 2+
─────────────────       ─────────────────        ─────────────
Single API instance  →  2–3 API instances    →  Module extraction
Single PostgreSQL    →  Primary + read replica →  Sharding / per-module DB
Single Redis         →  Redis cluster          →  Dedicated cache per module
S3 single bucket     →  S3 with lifecycle      →  Multi-region
```

---

## 6. Availability & Reliability Requirements

Reference: [DOC-01 SO-004], [DOC-02 KPI-010]

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-AVAIL-001 | Platform uptime (production) | 99.9% monthly (≤ 43.8 min downtime) | P0 |
| NFR-AVAIL-002 | Planned maintenance window | ≤ 4 hours/month; announced 48 hours ahead | P1 |
| NFR-AVAIL-003 | Recovery Time Objective (RTO) | ≤ 1 hour | P0 |
| NFR-AVAIL-004 | Recovery Point Objective (RPO) | ≤ 15 minutes (database) | P0 |
| NFR-AVAIL-005 | Zero double-bookings under concurrent load | 100% correctness | P0 |
| NFR-AVAIL-006 | Zero data loss on confirmed appointment booking | 100% durability | P0 |
| NFR-AVAIL-007 | Notification delivery success rate | ≥ 99% (with retry) | P1 |
| NFR-AVAIL-008 | Graceful degradation — Google Maps unavailable | Search works without distance/travel time | P1 |
| NFR-AVAIL-009 | Graceful degradation — SMS gateway unavailable | Email + in-app notifications still delivered | P1 |
| NFR-AVAIL-010 | Graceful degradation — Formula engine cache miss | Recalculate from database (slower but correct) | P0 |
| NFR-AVAIL-011 | Database automated backups | Daily full + continuous WAL archiving | P0 |
| NFR-AVAIL-012 | Backup restoration tested | Monthly restore drill | P1 |
| NFR-AVAIL-013 | Health check endpoints | `/actuator/health` for API, DB, Redis, S3 | P0 |
| NFR-AVAIL-014 | Circuit breaker for external services | Google Maps, SMS, Email | P1 |

### 6.1 Fault Tolerance

| Component | Failure Mode | Expected Behavior |
|-----------|-------------|-------------------|
| PostgreSQL primary | Down | API returns 503; no data corruption; failover to standby (Phase 1 growth) |
| Redis | Down | Auth refresh fails gracefully; formula cache bypassed; rate limiting disabled |
| S3 | Down | Document upload fails with clear error; existing documents served from CDN cache |
| Google Maps API | Down/Quota exceeded | Search returns results without distance; map shows static fallback |
| Email service | Down | Queue for retry (3 attempts, exponential backoff) |
| SMS gateway | Down | Email + in-app still delivered; SMS queued for retry |

---

## 7. Compliance & Privacy Requirements

Reference: [DOC-01 §14], [DOC-02 §10]

| ID | Requirement | Regulation / Standard | Priority |
|----|-------------|----------------------|----------|
| NFR-COMP-001 | Explicit consent before health data collection | DPDP Act 2023 (India) | P0 |
| NFR-COMP-002 | Privacy policy and terms of service acceptance at registration | DPDP Act 2023 | P0 |
| NFR-COMP-003 | Right to access personal data | DPDP Act 2023 | P0 |
| NFR-COMP-004 | Right to correct personal data | DPDP Act 2023 | P0 |
| NFR-COMP-005 | Right to erasure (account deactivation + data purge on request) | DPDP Act 2023 | P0 |
| NFR-COMP-006 | Data processing purpose limitation | Health data used only for stated purposes | P0 |
| NFR-COMP-007 | Medical disclaimer on all health calculations | Consumer protection | P0 |
| NFR-COMP-008 | Doctor credential verification before public listing | Medical council regulations | P0 |
| NFR-COMP-009 | Audit trail for health data access and modification | Healthcare best practice | P0 |
| NFR-COMP-010 | Data residency — primary storage in India region (ap-south-1) | DPDP Act 2023 | P0 |
| NFR-COMP-011 | HIPAA-ready architecture (not certified in Phase 1) | HIPAA [ASM-009] | P1 |
| NFR-COMP-012 | Data retention policy documented and enforced | Internal policy | P0 |
| NFR-COMP-013 | Breach notification procedure documented | DPDP Act 2023 | P0 |
| NFR-COMP-014 | Cookie consent for web application | IT Act / DPDP | P1 |

### 7.1 Data Retention Policy

| Data Category | Retention Period | Deletion Method |
|--------------|-----------------|-----------------|
| Active user profiles | Duration of account + 1 year | Soft delete → hard purge on request |
| Deactivated accounts | 3 years | Hard purge after retention |
| Audit logs | 7 years | Archive to cold storage after 2 years |
| Health documents | Duration of account + 1 year | S3 lifecycle → Glacier → delete |
| Appointment records | 7 years | Soft delete; hard purge on compliance request |
| Session/token data | 7 days (refresh token max) | Redis TTL auto-expiry |
| Application logs | 90 days | CloudWatch log retention |
| Backup snapshots | 30 days | Automated rotation |

---

## 8. Usability & Accessibility Requirements

Reference: [DOC-01 SO-008], [DOC-02 SN-P-*]

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-USAB-001 | Patient completes registration in ≤ 3 minutes | Usability test | P0 |
| NFR-USAB-002 | Patient completes basic profile + first vital recording in ≤ 10 minutes | Usability test | P0 |
| NFR-USAB-003 | Patient books appointment in ≤ 5 minutes (returning user) | Usability test | P0 |
| NFR-USAB-004 | New user can discover and understand core features without training | Usability test (n ≥ 10) | P0 |
| NFR-USAB-005 | Consistent navigation across all web screens | Design system compliance | P0 |
| NFR-USAB-006 | Responsive design — functional on mobile, tablet, desktop | Breakpoints: 360px, 768px, 1024px, 1440px | P0 |
| NFR-USAB-007 | Error messages are user-friendly, actionable, non-technical | UX review | P0 |
| NFR-USAB-008 | Loading states for all async operations | Skeleton loaders / spinners | P0 |
| NFR-USAB-009 | Empty states with guidance for all list views | UX review | P1 |
| NFR-USAB-010 | Form validation feedback inline, on blur | UX review | P0 |
| NFR-USAB-011 | WCAG 2.1 Level AA compliance (web) | Accessibility audit | P1 |
| NFR-USAB-012 | Color contrast ratio ≥ 4.5:1 for text | WCAG AA | P1 |
| NFR-USAB-013 | Keyboard navigation for all web interactions | WCAG AA | P1 |
| NFR-USAB-014 | Screen reader compatibility for core flows | WCAG AA | P2 |
| NFR-USAB-015 | Mobile app follows platform guidelines (Material Design / iOS HIG) | Design review | P1 |
| NFR-USAB-016 | Touch targets minimum 44×44 px on mobile | Mobile UX | P0 |
| NFR-USAB-017 | Offline indicator when network unavailable (mobile) | Mobile UX | P1 |
| NFR-USAB-018 | i18n-ready architecture (English only in Phase 1) | [ASM-008] | P0 |

---

## 9. Maintainability & Extensibility Requirements

Reference: [ADR-001, ADR-006], [DOC-01 SO-007]

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-MAINT-001 | Code coverage (unit tests) | ≥ 80% for service layer | P0 |
| NFR-MAINT-002 | Code coverage (integration tests) | ≥ 70% for repository layer | P1 |
| NFR-MAINT-003 | API contract tests for all P0 endpoints | 100% P0 endpoints | P0 |
| NFR-MAINT-004 | Modular monolith — zero circular dependencies between domain modules | Architecture review | P0 |
| NFR-MAINT-005 | Each module follows Clean Architecture layers (domain, application, infrastructure, presentation) | Code review | P0 |
| NFR-MAINT-006 | OpenAPI spec auto-generated and published for all REST endpoints | Swagger UI | P0 |
| NFR-MAINT-007 | Database migrations versioned and reversible | Flyway/Liquibase | P0 |
| NFR-MAINT-008 | Structured logging (JSON format) with correlation ID | All API requests | P0 |
| NFR-MAINT-009 | Code quality gate in CI — no merge with critical SonarQube issues | CI pipeline | P1 |
| NFR-MAINT-010 | Documentation — README, setup guide, API docs for every module | Developer onboarding ≤ 1 day | P0 |
| NFR-MAINT-011 | Feature flags for future monetization hooks | Architecture prepared | P2 |
| NFR-MAINT-012 | New domain module addable without modifying existing modules | Open/Closed principle | P0 |
| NFR-MAINT-013 | MapStruct mappers for all entity ↔ DTO conversions | [ADR-007] | P0 |
| NFR-MAINT-014 | Consistent error response format across all endpoints | [DOC-09] | P0 |

---

## 10. Operability & DevOps Requirements

Reference: [DOC-01 tech stack], future [DOC-13]

| ID | Requirement | Implementation | Priority |
|----|-------------|----------------|----------|
| NFR-OPS-001 | Containerized deployment (Docker) | Docker + Docker Compose (dev); ECS/EKS-ready (prod) | P0 |
| NFR-OPS-002 | CI/CD pipeline | GitHub Actions: build → test → scan → deploy | P0 |
| NFR-OPS-003 | Automated deployment to staging on merge to `develop` | GitHub Actions | P0 |
| NFR-OPS-004 | Manual approval gate for production deployment | GitHub Actions | P0 |
| NFR-OPS-005 | Environment separation | dev, staging, production | P0 |
| NFR-OPS-006 | Infrastructure as Code | Terraform or AWS CDK for AWS resources | P1 |
| NFR-OPS-007 | NGINX reverse proxy | SSL termination, rate limiting, static asset serving | P0 |
| NFR-OPS-008 | Application monitoring | AWS CloudWatch + custom dashboards | P0 |
| NFR-OPS-009 | APM (Application Performance Monitoring) | Request tracing, latency breakdown | P1 |
| NFR-OPS-010 | Error tracking | Sentry or equivalent for frontend + backend | P0 |
| NFR-OPS-011 | Log aggregation | CloudWatch Logs; searchable by correlation ID | P0 |
| NFR-OPS-012 | Uptime monitoring | External health check every 1 minute | P0 |
| NFR-OPS-013 | Alerting — P0 incidents | PagerDuty/Slack alert within 5 minutes | P0 |
| NFR-OPS-014 | Alerting — P1 incidents | Slack notification within 15 minutes | P1 |
| NFR-OPS-015 | Database migration runs automatically in CI/CD | Zero-downtime migrations preferred | P0 |
| NFR-OPS-016 | Rollback capability | Previous Docker image deployable within 10 minutes | P0 |
| NFR-OPS-017 | Secrets management | AWS Secrets Manager; no secrets in code or env files in repo | P0 |
| NFR-OPS-018 | Local development setup | `docker-compose up` starts full stack in ≤ 5 minutes | P0 |

---

## 11. Data Management Requirements

Reference: [DOC-02 BR-PAT-004], [ASM-005, ASM-010]

| ID | Requirement | Implementation | Priority |
|----|-------------|----------------|----------|
| NFR-DATA-001 | Soft delete on all user-facing entities | `deleted_at` timestamp; excluded from queries by default | P0 |
| NFR-DATA-002 | Audit fields on all entities | `created_at`, `updated_at`, `created_by`, `updated_by` | P0 |
| NFR-DATA-003 | Tenant ID on all tenant-scoped entities | `tenant_id` UUID column [ASM-010] | P0 |
| NFR-DATA-004 | UTC storage for all timestamps | Display in user timezone [ASM-004] | P0 |
| NFR-DATA-005 | UUID primary keys for all entities | No sequential/guessable IDs exposed | P0 |
| NFR-DATA-006 | Database referential integrity | Foreign key constraints enforced | P0 |
| NFR-DATA-007 | Optimistic locking for concurrent updates | `@Version` on appointment, slot entities | P0 |
| NFR-DATA-008 | Vital signs and lab values are append-only | No in-place edits; new records for corrections | P0 |
| NFR-DATA-009 | Database connection pooling | HikariCP; max pool size configurable per environment | P0 |
| NFR-DATA-010 | Read-only database user for reporting queries | Separate credentials | P2 |
| NFR-DATA-011 | Data export for patient (profile + documents metadata) | JSON/CSV export on request | P1 |
| NFR-DATA-012 | Database index strategy for all search and filter columns | Defined in [DOC-06] | P0 |

---

## 12. Integration & Compatibility Requirements

Reference: [DOC-02 §12.2 Dependencies]

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-INT-001 | Google Maps JavaScript API (web) | Latest stable API version | P0 |
| NFR-INT-002 | Google Maps SDK (React Native) | Latest stable | P0 |
| NFR-INT-003 | Google Geocoding API | For address → coordinates | P1 |
| NFR-INT-004 | Google Distance Matrix API | For travel time calculation | P1 |
| NFR-INT-005 | AWS SES for email delivery | Transactional emails | P0 |
| NFR-INT-006 | AWS SNS for SMS delivery | Appointment reminders | P0 |
| NFR-INT-007 | AWS S3 for file storage | Health documents, images | P0 |
| NFR-INT-008 | Browser support (web) | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ | P0 |
| NFR-INT-009 | Mobile OS support | Android 10+ (API 29), iOS 15+ | P0 |
| NFR-INT-010 | REST API versioning | `/api/v1/` prefix; backward-compatible changes only | P0 |
| NFR-INT-011 | OpenAPI 3.0 specification | Auto-generated, published at `/swagger-ui.html` | P0 |
| NFR-INT-012 | External API timeout | 5 seconds default; 10 seconds for Maps | P0 |
| NFR-INT-013 | External API retry | 3 retries with exponential backoff for transient failures | P1 |
| NFR-INT-014 | External API circuit breaker | Open after 5 consecutive failures; half-open after 30 seconds | P1 |

---

## 13. Testing Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-TEST-001 | Unit test coverage — service layer | ≥ 80% | P0 |
| NFR-TEST-002 | Integration test coverage — repository layer | ≥ 70% | P1 |
| NFR-TEST-003 | API contract tests — all P0 endpoints | 100% | P0 |
| NFR-TEST-004 | End-to-end tests — core user flows | Registration, profile, search, booking, dashboard | P0 |
| NFR-TEST-005 | Load test — normal load (100 concurrent users) | All NFR-PERF targets met | P0 |
| NFR-TEST-006 | Load test — peak load (250 concurrent users) | ≤ 2x degradation from normal | P1 |
| NFR-TEST-007 | Security penetration test | Zero critical findings | P0 |
| NFR-TEST-008 | Concurrent booking stress test | Zero double-bookings at 50 concurrent | P0 |
| NFR-TEST-009 | Formula engine accuracy test | 100% match against [DOC-08] reference values | P0 |
| NFR-TEST-010 | Accessibility audit (WCAG 2.1 AA) | Zero Level A violations | P1 |
| NFR-TEST-011 | Mobile device testing matrix | Minimum 3 Android + 3 iOS devices | P1 |
| NFR-TEST-012 | Regression test suite in CI | Runs on every PR; blocks merge on failure | P0 |

---

## 14. NFR Traceability Matrix

| NFR ID | Traces To (DOC-01) | Traces To (DOC-03) | Verification Method |
|--------|-------------------|-------------------|---------------------|
| NFR-PERF-004 | SO-003 | AC-SRH-001 | Load test |
| NFR-PERF-005 | SO-005 | AC-ANL-001 | APM |
| NFR-PERF-007 | SO-004 | AC-SCH-008 | Load test + integration test |
| NFR-SEC-001–010 | SO-006 | FR-IAM-003–007 | Security test |
| NFR-SEC-042 | SO-006 | — | Pen test report |
| NFR-AVAIL-001 | KPI-010 | — | Uptime monitoring |
| NFR-AVAIL-005 | SO-004 | AC-SCH-009 | Stress test |
| NFR-COMP-001–005 | §14 Compliance | FR-PAT-001 | Compliance audit |
| NFR-SCAL-012 | SO-007 | — | Architecture review |
| NFR-USAB-003 | Success Criteria §11 | UC-007 | Usability test |
| NFR-MAINT-004 | SO-007, ADR-001 | — | Architecture review |
| NFR-TEST-009 | SO-005 | FR-ANL-002 | Unit test suite |

---

## 15. NFR Summary Dashboard

| Category | P0 Count | P1 Count | P2 Count | Total |
|----------|----------|----------|----------|-------|
| Performance | 14 | 12 | 0 | 26 |
| Security | 24 | 8 | 0 | 32 |
| Scalability | 8 | 5 | 0 | 13 |
| Availability | 8 | 6 | 0 | 14 |
| Compliance | 11 | 3 | 0 | 14 |
| Usability | 8 | 8 | 1 | 17 |
| Maintainability | 9 | 4 | 1 | 14 |
| Operability | 12 | 6 | 0 | 18 |
| Data Management | 10 | 1 | 1 | 12 |
| Integration | 9 | 5 | 0 | 14 |
| Testing | 7 | 5 | 0 | 12 |
| **Total** | **120** | **63** | **3** | **186** |

---

## 16. Production Readiness Gate

All **P0 NFRs** must pass before Phase 1 production launch. Gate checklist:

| Gate | Criteria | Owner |
|------|----------|-------|
| Performance Gate | All NFR-PERF P0 targets met in staging load test | QA Lead |
| Security Gate | Zero critical/high CVEs; pen test passed; all NFR-SEC P0 met | Security Architect |
| Availability Gate | Health checks operational; backup/restore tested; NFR-AVAIL P0 met | DevOps Lead |
| Compliance Gate | Consent flows implemented; privacy policy published; NFR-COMP P0 met | Compliance Officer |
| Testing Gate | NFR-TEST P0 items passed | QA Lead |
| Operability Gate | CI/CD pipeline operational; monitoring and alerting active | DevOps Lead |
| Documentation Gate | DOC-01 through DOC-16 approved | Technical Lead |

---

## 17. Assumptions & Constraints

| ID | Assumption / Constraint | Impact |
|----|------------------------|--------|
| NFR-ASM-001 | Phase 1 deployed on AWS ap-south-1 (Mumbai) | Latency targets assume India users |
| NFR-ASM-002 | Single-region deployment in Phase 1 | RTO/RPO based on single-region failover |
| NFR-ASM-003 | No CDN in Phase 1 MVP; added in growth phase | LCP targets may need CDN for global users |
| NFR-ASM-004 | Load testing uses simulated data, not production data | Staging environment mirrors production topology |
| NFR-ASM-005 | Penetration test conducted by third-party vendor | Required for healthcare platform trust |

---

## 18. Open Items

| ID | Item | Default | Target Document |
|----|------|---------|----------------|
| OQ-NFR-001 | APM tool selection (Datadog vs New Relic vs CloudWatch only) | CloudWatch + X-Ray | DOC-13 |
| OQ-NFR-002 | Error tracking tool (Sentry vs Rollbar) | Sentry | DOC-13 |
| OQ-NFR-003 | IaC tool (Terraform vs AWS CDK) | Terraform | DOC-13 |
| OQ-NFR-004 | Database migration tool (Flyway vs Liquibase) | Flyway | DOC-11 |

---

## 19. Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Product Owner | _________________ | _________________ | ________ | Pending |
| Technical Lead / Architect | _________________ | _________________ | ________ | Pending |
| Security Architect | _________________ | _________________ | ________ | Pending |
| DevOps Lead | _________________ | _________________ | ________ | Pending |
| QA Lead | _________________ | _________________ | ________ | Pending |

---

*End of DOC-04 — Non-Functional Requirements Specification v1.0*
