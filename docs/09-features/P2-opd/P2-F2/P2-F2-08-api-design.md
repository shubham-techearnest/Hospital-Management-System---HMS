# P2-F2-08 — API

| Method | Path | Body |
|--------|------|------|
| POST | `/api/v1/opd/queue/{id}/skip` | `{ "reason": "optional" }` |
| POST | `/api/v1/opd/queue/{id}/recall` | `{ "deskId": "optional" }` |

Permission: `opd:queue:write`
