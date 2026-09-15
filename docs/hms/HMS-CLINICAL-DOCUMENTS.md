# Clinical letterheaded documents

| Status | Implemented 2026-09-15 |
| Delivery | Print-ready HTML (`window.print` / Save as PDF) |
| Letterhead | Hospital profile + primary branch + dedicated logo (`V89`) |

## Documents

| Type | API | FE print route |
|------|-----|----------------|
| Medical prescription | `GET /api/v1/clinical/encounters/{id}/documents/prescription/{prescriptionId}` | `/documents/prescription/:encounterId/:prescriptionId` |
| Consultation summary | `GET /api/v1/clinical/encounters/{id}/documents/consultation/{noteId}` | `/documents/consultation/:encounterId/:noteId` |
| Laboratory report | `GET /api/v1/lab/orders/{id}/documents/report` | `/documents/lab/:labOrderId` |
| Pharmacy dispense slip | `GET /api/v1/pharmacy/requests/{id}/documents/dispense-slip` | `/documents/pharmacy/:requestId` |

Each response includes a letterhead snapshot (name, reg no, address/phone, logo URL, tagline/footer), patient block, clinician/signatory, and document-specific payload.

## Letterhead branding

| Method | Path | Notes |
|--------|------|-------|
| PUT | `/api/v1/hospitals/me/profile/letterhead` | Tagline + footer text |
| POST | `/api/v1/hospitals/me/profile/letterhead/logo` | Multipart image |
| GET | `/api/v1/hospitals/{hospitalId}/letterhead/logo` | Authenticated image bytes |

UI: Hospital Portal → Profile → **Letterhead & stationery**.

## Asset Manager portal

Invited `ASSET_MANAGER` staff land on `/assets` (same asset CRUD as Hospital Portal `/hospital/assets`).

## Out of scope

- Server-side PDF download (OpenPDF can follow)
- GST pharmacy invoice engine, eSign certificates
