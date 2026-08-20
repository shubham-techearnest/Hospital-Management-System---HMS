# Feature Documentation Approval Workflow

| Document ID | GOV-APPROVAL-001 |
| Status | DRAFT |

---

## Workflow

```mermaid
stateDiagram-v2
  [*] --> DRAFT
  DRAFT --> INTERNAL_REVIEW: Author complete
  INTERNAL_REVIEW --> ARCHITECT_REVIEW: BA/Tech Lead OK
  ARCHITECT_REVIEW --> SENIOR_REVIEW: Architecture OK
  SENIOR_REVIEW --> APPROVED: PO + Architect sign-off
  APPROVED --> IMPLEMENTATION: Sprint start
  IMPLEMENTATION --> QA
  QA --> UAT
  UAT --> RELEASED
  RELEASED --> CLOSED
  INTERNAL_REVIEW --> DRAFT: Revisions
  ARCHITECT_REVIEW --> DRAFT: Revisions
  SENIOR_REVIEW --> DRAFT: Revisions
```

---

## Reviewers by gate

| Gate | Reviewers | Checklist |
|------|-----------|-----------|
| Internal Review | BA, Tech Lead | Requirements complete, flows realistic |
| Architect Review | Solution Architect | DB/API/module boundaries, no duplicate entities |
| Senior Review | PO, Architect, QA Lead, Security | Scope, risk, testability, compliance |
| QA | QA Lead | Test strategy executable |
| UAT | Product Owner | Acceptance criteria observable |

---

## Approval record (template)

| Feature ID | Version | Approved By | Role | Date | Notes |
|------------|---------|-------------|------|------|-------|
| P1-F1 | 1.0 | | | | Pending |

Store approvals in feature README status section.
