# Post-HMS → Phase 2 Bridge

| Attribute | Value |
|-----------|-------|
| **Document ID** | POST-HMS-BRIDGE-001 |
| **Last Updated** | 2026-08-19 |
| **HMS status** | **12/12 complete** (HMS-0 … HMS-11) |

---

## What HMS delivered

| Area | HMS sprint | Notes |
|------|------------|-------|
| Clinical encounters | HMS-1 | Hub for all modules |
| OPD / IPD / ICU | HMS-2–4 | Hospital operations |
| Lab / Rad / Pharm / OT | HMS-5–8 | **In-hospital fulfillment** (not consumer marketplace) |
| Staff + RBAC | HMS-9 | Receptionist, nurse, ICU nurse |
| Dashboards | HMS-10 | Single-call KPI APIs |
| Performance + security | HMS-11 | V40 indexes, regression tests |

Flyway boundary: **V30–V40**.

---

## What Phase 2 still adds

Phase 2 draft docs (DOC-21–36) pre-date HMS. **Revised scope** after HMS:

| Original Phase 2 module | Status after HMS | Revised sprint |
|-------------------------|------------------|----------------|
| Laboratory (consumer) | HMS lab covers hospital ops | Defer / narrow to external lab partners |
| Pharmacy (consumer) | HMS pharmacy covers in-hospital Rx | Defer / narrow to retail pharmacy orders |
| **Billing & payments** | **Not built** | **P2-B1 → P2-B3 (start now)** |
| E-prescription | Not built | P2-Rx1–2 |
| Telemedicine | Not built | P2-TEL1–2 |
| Insurance / FHIR | Not built | P2-ENT1 |

---

## Recommended implementation order (post-HMS)

| Sprint | Focus | Migration | Rationale |
|--------|-------|-----------|-----------|
| **P2-B1** | Billing schema + encounter invoices + manual payment | V41 | Closes end-to-end hospital flow |
| **P2-B2** | Razorpay intent + webhooks | V42 | Online payments |
| **P2-B3** | Patient payment history + receipts | — | Patient portal |
| **P2-Rx1** | E-prescription backend | V43+ | Doctor prescribe flow |
| **P2-TEL1** | Telemedicine sessions | TBD | Remote care |

---

## Conventions (unchanged from HMS)

- Modular monolith: `com.health360.{module}.*`
- Flyway **never modify applied migrations** — next version **V41+**
- RBAC via `iam.permissions` + `@PreAuthorize`
- Pagination: Spring `Page` in `data.content`
- Integration tests: Testcontainers + `@EnabledIf(DockerAvailable)`

---

## References

- [HMS sprint status](../hms/HMS-SPRINT-STATUS.md)
- [Phase 2 README](../phase-2/README.md)
- [Phase 2 billing FR](../phase-2/requirements/23-PHASE-2-FUNCTIONAL-REQUIREMENTS.md) § FR2-PAY
