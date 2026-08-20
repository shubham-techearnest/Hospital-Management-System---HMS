# Definition of Done (DoD)

| Document ID | GOV-DOD-001 |
| Status | DRAFT |

A feature is **DONE** only when:

## Database
- [ ] Flyway migration applied in dev/test (V42+ only; never edit applied migrations)
- [ ] Constraints and indexes verified
- [ ] Rollback strategy documented and tested where feasible

## Backend
- [ ] Code merged; follows modular monolith conventions
- [ ] Validation (Bean Validation + service rules)
- [ ] Authorization (`@PreAuthorize` + scope services)
- [ ] Audit events for sensitive writes
- [ ] Unit + integration tests pass
- [ ] No breaking API changes (or approved with migration guide)

## Web (if in scope)
- [ ] Routes, forms, validation, RBAC guards
- [ ] Loading, empty, error states
- [ ] API integration (no mock production data)
- [ ] Responsive behavior on target breakpoints

## Mobile (if in scope)
- [ ] Screens, navigation, API integration
- [ ] Auth + permission checks
- [ ] Loading/error states

## QA
- [ ] Test cases executed per feature test strategy
- [ ] Regression suite pass (backend CI)
- [ ] Security/RBAC negative tests pass
- [ ] Known defects triaged; no open **Critical** defects

## Documentation
- [ ] Feature docs updated to RELEASED/CLOSED
- [ ] API map / endpoint catalog updated
- [ ] Schema map updated
- [ ] Traceability matrix updated
- [ ] Release notes draft

## Governance
- [ ] PO acceptance sign-off
- [ ] Feature board status = CLOSED or RELEASED
