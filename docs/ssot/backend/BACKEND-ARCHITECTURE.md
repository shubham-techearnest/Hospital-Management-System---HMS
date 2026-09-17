# Backend Architecture — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-BE-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |

## Module catalog

See REPOSITORY-INVENTORY packages + API-CATALOG controllers.

## Cross-cutting services

| Concern | Implementation |
|---------|----------------|
| Errors | `GlobalExceptionHandler` + `ErrorCode` |
| Audit | `AuditLogService` |
| Notifications | `TransactionalNotificationService` + gateways |
| Features | `FeatureAccessService` |
| Events | `EventPublisher` / `AutomationReactor` |

## Transactions

Service methods commonly `@Transactional`; event publish typically same transaction then sync react.

## Caching

Redis optional; not relied on in local/production profiles as configured.
