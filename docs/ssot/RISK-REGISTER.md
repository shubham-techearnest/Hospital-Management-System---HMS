# Risk Register

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-RISK-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

| Risk | Probability | Impact | Area | Mitigation | Owner | Status |
|------|-------------|--------|------|------------|-------|--------|
| Doc/code divergence causes wrong delivery | High | High | PM/Docs | SSOT governance | PM + Architect | OPEN |
| Ship DRY_RUN charges thinking live | Medium | High | Billing | Explicit mode checklist | Backend lead | OPEN |
| PHI exposure via logs/local files | Medium | High | Security | Redact logs; storage controls | Security | OPEN |
| Mobile users expect full HMS | Medium | Medium | Product | Scope communication | PM | OPEN |
| Uncommitted code loss / conflict | Medium | High | Engineering | Commit/PR hygiene | Tech lead | OPEN |
| External Render keep-alive dependency | Low | Medium | Ops | Document SLA; health checks | DevOps | OPEN |
| Event reactor bottleneck | Low | Medium | Architecture | Monitor; modularize consumers | Architect | OPEN |
| Regulatory claims without assessment | Low | High | Security/Legal | No compliance claims until audit | Exec | OPEN |
