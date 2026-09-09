# Health360 Gap Tracker

| Document | HEALTH360-GAPS-001 |
| Date | 2026-09-09 |
| Status values | IDENTIFIED · PLANNED · IN DEVELOPMENT · IMPLEMENTED · VALIDATED · BLOCKED · DEFERRED |

| Gap ID | Module | Description | Priority | Status | Dependency | Implementation Reference | Validation Status |
|--------|--------|-------------|----------|--------|------------|--------------------------|-------------------|
| G-001 | Billing | Lab orders do not auto-create invoice lines (`LAB_ORDER` enum unused by Lab services) | P1 | IDENTIFIED | Lab + Billing | `InvoiceLineSourceType`, Lab services vs `BillingService` | NOT STARTED |
| G-002 | Billing | Pharmacy dispense does not auto-create invoice lines (`MEDICATION_ORDER` unused) | P1 | IDENTIFIED | Pharmacy + Billing | Same | NOT STARTED |
| G-003 | Notifications | Email delivery is local log-only (`LocalEmailNotificationService`) | P1 prod / P2 UAT | DEFERRED | SMTP config | IAM notification package | N/A for local UAT |
| G-004 | Notifications | SMS gateway stub | P2 | DEFERRED | SMS provider | `DefaultSmsNotificationGateway` | N/A |
| G-005 | IPD | Enterprise IPD path not covered by full automated E2E (`IpdIntegrationTest` MVP-level) | P1 | IDENTIFIED | Manual UAT | `IpdIntegrationTest.java`, Phase I notes | PENDING MANUAL |
| G-006 | IPD | Blood/transfusion fulfillment stub | P2 | DEFERRED | Blood bank | `IpdCareTransitionsPanel` | N/A |
| G-007 | IPD | Discharge PDF generation deferred | P3 | DEFERRED | Reporting | Phase I deferred list | N/A |
| G-008 | IPD | Care-plan / consult placeholders in chart | P2 | IDENTIFIED | Chart UX | `IpdPatientChart` related panels | PENDING MANUAL |
| G-009 | Billing | Real TPA/EDI payer integration deferred | P3 | DEFERRED | External TPA | ADR-IPD-002 / I6 | N/A |
| G-010 | Nursing | Native React Native nursing charting deferred | P3 | DEFERRED | Mobile app | Phase I deferred | N/A |
| G-011 | Security | Formal security audit package not executed | P1 | IDENTIFIED | Manual/security review | Architecture review only | PENDING |
| G-012 | RBAC | Distinct Cashier / Ward Manager / Insurance-TPA roles not first-class | P3 | DEFERRED | Product decision | IAM seeds | N/A |
| G-013 | Patient | Hard duplicate merge tooling limited | P2 | IDENTIFIED | Registry | Soft detection only | PENDING MANUAL |
| G-014 | Ops | Large Phase G/H/I changes may be uncommitted — env must apply Flyway V79–V87 | P0 env | IDENTIFIED | Deploy/restart | `db/migration` | CHECK BEFORE UAT |
| G-015 | Billing | Advanced tax/tariff configuration shallow | P2 | IDENTIFIED | Billing config | Billing module | PENDING MANUAL |

### P0 note

No **application-code P0** (missing hospital create, auth, patient, OPD, admit, bed, discharge modules) was found. **G-014** is an environment/process P0: testers must migrate and restart before UAT.
