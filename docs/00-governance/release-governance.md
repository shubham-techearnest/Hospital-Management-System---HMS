# Release Governance

| Document ID | GOV-REL-001 |
| Status | DRAFT |

---

## Release gates

| Gate | Owner | Criteria |
|------|-------|----------|
| Code complete | Tech Lead | DoD met for all stories in release |
| QA | QA Lead | No open critical/major defects |
| Security | Security | RBAC regression pass |
| UAT | Product Owner | UAT scripts signed |
| Ops | DevOps | Migration tested on staging |

---

## Release artifacts

- Release notes
- Migration list
- API changelog
- Rollback plan
- Monitoring dashboard updates

See [14-release/release-roadmap.md](../14-release/release-roadmap.md).
