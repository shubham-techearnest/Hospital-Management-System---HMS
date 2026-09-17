# Background Jobs — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-JOBS-001 |
| **Version** | 1.0 |
| **Status** | DRAFT |
| **Evidence** | CODE-VERIFIED `@Scheduled` |

| Job | Interval | Purpose |
|-----|----------|---------|
| `AppointmentReminderScheduler` | 60s | Appointment reminders |
| `FollowUpReminderScheduler` | 5m | Clinical follow-up reminders |
| `TaskEscalationScheduler` | 5m | Overdue My Work escalation |
| `PredictiveInsightScheduler` | 15m | Heuristic predictive refresh |

Enabled via `@EnableScheduling` on `Health360Application`.
