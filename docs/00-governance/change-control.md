# Change Control

| Document ID | GOV-CHANGE-001 |
| Status | DRAFT |

---

## When to raise a Change Request (CR)

- Requirement change after approval
- Architecture impact discovered during implementation
- Breaking API change
- New database entity not in approved design
- Scope expansion beyond feature package

---

## CR process

1. **STOP** implementation on affected area
2. Document CR: description, reason, impact (req, DB, API, web, mobile, security, test)
3. Architect review + updated ADR if needed
4. Product Owner approval
5. Update feature docs + traceability matrix
6. Resume implementation

---

## Emergency fix

Production critical: hotfix branch allowed with retroactive CR within 48h.

---

## Versioning

Schema: new Flyway migration only.  
API: additive preferred; breaking requires CR + consumer notification.
