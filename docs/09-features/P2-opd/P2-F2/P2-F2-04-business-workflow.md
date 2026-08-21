# P2-F2-04 — Business Workflow (FLOW-007)

```text
Patient CALLED / WAITING
  → Receptionist Skip (optional reason)
       → status SKIPPED, skipped_at set
  → Later: Recall
       → status CALLED, called_at refreshed, priority += 10
  → Start → Complete (existing)
```
