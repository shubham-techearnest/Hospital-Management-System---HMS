# ECO-P3 — Laboratory journey (hospital-first)

| Feature ID | ECO-P3 |
| Status | **RELEASED** |
| Updated | 2026-08-27 |

## Delivered

| ID | Work | Result |
|----|------|--------|
| ECO-F3.1 | Harden lab portal | Patient name/UHID on worklist & orders; unique auto specimen ID (V57); friendly status labels |
| ECO-F3.2 | Patient books hospital lab | `GET /lab/me/orders` + `POST .../book-hospital`; Labs page Book CTA |
| ECO-F3.3 | Report notify | `LAB_REPORT_READY` in-app notification on release |
| ECO-F3.4 | Structured → analytics | Verified numeric params ingested into patient `lab_value_records` on release |

## APIs

- `GET /api/v1/lab/me/orders`
- `POST /api/v1/lab/me/orders/{clinicalOrderItemId}/book-hospital`
- Existing staff flow: worklist → receive → collect → results → verify → release

## Status map (UI labels; DB enums unchanged)

`ORDERED` → book → `RECEIVED` (booked) → `SAMPLE_COLLECTED` → `RESULTS_DRAFT` → `VERIFIED` → `RELEASED` (report published)

## QA (2026-08-27)

| Check | Evidence |
|-------|----------|
| Worklist name/UHID | `LabIntegrationTest` asserts `patientName` + `uhid` |
| Patient book-hospital | Integration flow uses `POST /lab/me/orders/{id}/book-hospital` |
| Release → patient report | Patient encounter reports + `me/orders` RELEASED |
| Metrics ingest | `GET /patients/me/profile/lab-values` after HB release |
| Mapper unit | `LabResultMetricsMapperTest` |

**Defer:** Independent lab marketplace → ECO-P7.

**Next:** ECO-P4 (pharmacy e-Rx share).
