# Health360 AI — Documentation Index

Start here if you are new to the project.

| Document | Path | Purpose |
|----------|------|---------|
| **Project Memory (living doc)** | [00-PROJECT-MEMORY.md](./00-PROJECT-MEMORY.md) | Decisions, terminology, implementation status |
| **Phase 1 (current)** | [phase-1/README.md](./phase-1/README.md) | Requirements, architecture, delivery, mobile |
| **Phase 1.5 (in progress)** | [phase-1.5/README.md](./phase-1.5/README.md) | Hospital SaaS, subscriptions, admin provisioning |
| **Phase 2 (planned)** | [phase-2/README.md](./phase-2/README.md) | Care delivery, commerce, telemedicine — **draft pack** |
| **User manuals** | [../mannual/README.md](../mannual/README.md) | Web and mobile end-user guides |

## Quick links by role

### Product / BA
- [Phase 1 Vision & Scope](./phase-1/requirements/01-PROJECT-VISION-AND-SCOPE-CHARTER.md)
- [Phase 1.5 Vision & Scope](./phase-1.5/requirements/51-PHASE-1.5-VISION-AND-SCOPE-CHARTER.md)
- [User Stories & Acceptance Criteria](./phase-1/requirements/14-USER-STORIES-AND-ACCEPTANCE-CRITERIA.md)
- [Phase 1.5 User Stories](./phase-1.5/requirements/54-PHASE-1.5-USER-STORIES.md)
- [Phase 1 Development Roadmap](./phase-1/delivery/15-DEVELOPMENT-ROADMAP.md)
- [**Phase 1.5 Implementation Plan**](./phase-1.5/delivery/61-PHASE-1.5-DEVELOPMENT-ROADMAP.md)

### Backend engineer
- [REST API Spec](./phase-1/architecture/07-REST-API-DESIGN-SPECIFICATION.md)
- [Phase 1.5 REST API](./phase-1.5/architecture/57-PHASE-1.5-REST-API-DESIGN.md)
- [Database Design](./phase-1/architecture/06-DATABASE-DESIGN-SPECIFICATION.md)
- [Phase 1.5 Database Design](./phase-1.5/architecture/56-PHASE-1.5-DATABASE-DESIGN.md)
- [Business Rules](./phase-1/architecture/09-BUSINESS-RULES-AND-VALIDATION-CATALOG.md)
- [Phase 1.5 Business Rules](./phase-1.5/architecture/58-PHASE-1.5-BUSINESS-RULES.md)
- [Formula Engine](./phase-1/architecture/08-HEALTH-FORMULA-ENGINE-SPECIFICATION.md)

### Frontend / mobile engineer
- [UI/UX Screen Spec](./phase-1/architecture/10-UI-UX-SCREEN-SPECIFICATION.md)
- [Mobile Strategy](./phase-1/mobile/MOBILE_DEVELOPMENT_STRATEGY.md)
- [Mobile API Integration Guide](./phase-1/mobile/MOBILE_API_INTEGRATION_GUIDE.md)
- [Mobile Sprint Status](./phase-1/mobile/MOBILE_SPRINT_STATUS.md)

### DevOps / architect
- [System Architecture](./phase-1/architecture/11-SYSTEM-ARCHITECTURE-DOCUMENT.md)
- [Security Architecture](./phase-1/architecture/12-SECURITY-ARCHITECTURE.md)
- [DevOps & Deployment](./phase-1/architecture/13-DEVOPS-AND-DEPLOYMENT-ARCHITECTURE.md)
- [Architecture Diagrams](./phase-1/architecture/16-ARCHITECTURE-DIAGRAMS-PACK.md)

### Planning & launch decision

- [Phase 2 Overview](./phase-2/README.md)
- [Launch Decision: Phase 1 vs Phase 2](./phase-2/delivery/36-LAUNCH-DECISION-FRAMEWORK.md) ← **read before production go-live**
- [Phase 2 Roadmap](./phase-2/delivery/34-PHASE-2-DEVELOPMENT-ROADMAP.md)

---

```
docs/
├── 00-PROJECT-MEMORY.md      # Living document — update after each milestone
├── README.md                 # This file
├── phase-1/
│   ├── requirements/         # DOC-01 – DOC-04, DOC-14
│   ├── architecture/         # DOC-05 – DOC-13, DOC-16
│   ├── delivery/             # DOC-15 roadmap & sprint plan
│   └── mobile/               # Mobile strategy, API guide, sprint status
├── phase-1.5/                # Hospital SaaS & subscriptions (DOC-51 – DOC-63)
│   ├── requirements/
│   ├── architecture/
│   ├── delivery/             # Implementation plan + sprint status
│   └── testing/
└── phase-2/                  # Future phase placeholder
```
