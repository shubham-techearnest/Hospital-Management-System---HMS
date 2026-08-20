# Release Checklist

| Document ID | REL-CHECK-001 |
| Status | DRAFT |

---

## Pre-release

- [ ] All features in release scope = RELEASED or CLOSED on feature board
- [ ] Flyway migrations applied on staging
- [ ] Integration tests green
- [ ] RBAC regression pass
- [ ] UAT sign-off recorded
- [ ] Release notes drafted
- [ ] Rollback plan reviewed
- [ ] Monitoring/alerts configured

---

## Deploy

- [ ] Backup database
- [ ] Deploy API
- [ ] Verify Flyway success
- [ ] Deploy web/mobile as applicable
- [ ] Smoke test critical paths

---

## Post-release

- [ ] Update executive dashboard
- [ ] Close sprint
- [ ] Documentation closure (MODE I)
- [ ] Retro scheduled
