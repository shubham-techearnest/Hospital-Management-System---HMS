# P2-F2-06 — Architecture

Extend `QueueEntryStatus` + `OpdQueueService` with `skipPatient` / `recallPatient`.  
Permission: existing `opd:queue:write`.  
No encounter status change on skip/recall (encounter stays WAITING).
