# P1-F1-13 — Release Plan

| Feature | P1-F1 |
| Release | R1 (Foundation) |
| Status | DRAFT |

---

## Release contents

- Flyway V42
- Backend hospital patient APIs
- Web reception: search, register, receipt
- RBAC permissions
- Integration tests
- Documentation closure

**Not in release:** Mobile, emergency registration, patient merge

---

## Deployment order

1. Database migration (Flyway on API startup)
2. API deployment
3. Web deployment
4. Verify RECEPTIONIST staff users exist

---

## Monitoring

- Metric: registrations_per_hour
- Alert: duplicate_override rate spike
- Log: 409 rate on register

---

## Release notes (draft)

**Health360 R1 — Patient Registry Foundation**

- Hospital reception can register patients with unique UHID
- Duplicate detection prevents accidental double registration
- Printable registration receipt
- Requires RECEPTIONIST role assignment

---

## Rollback

See P1-F1-12. Prefer forward fix.

---

## Sign-off

| Role | Date |
|------|------|
| QA Lead | |
| Product Owner | |
| Tech Lead | |
