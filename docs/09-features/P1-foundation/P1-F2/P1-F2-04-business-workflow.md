# P1-F2-04 — Business Workflow

| Feature | P1-F2 |
| Status | APPROVED |

---

## FLOW-008 — Record encounter vitals

```text
1. Staff opens active encounter (OPD/IPD/etc.)
2. Staff enters one or more vital values + recorded time
3. System validates ranges and BP consistency
4. System inserts clinical.vital_signs row
5. System writes audit VITALS_RECORDED (entity ClinicalVitalSign, encounterId)
6. Staff / doctor views list on encounter (newest first)
```

**Preconditions:** Encounter exists; staff has `clinical:vitals:write`.

**Postconditions:** Vitals visible on GET; consumer vitals unchanged.

**Alt:** Validation failure → 400, no row.

---

## Related

- UC-CLIN-001 in requirements catalogue
- Consumer self-service vitals remain FLOW for patient app (out of scope)
