# ECO-P7 — Multi-organization (partner lab/pharmacy)

| Feature ID | ECO-P7 |
| Status | **IN QA** |
| Updated | 2026-08-27 |

## Delivered (first slice)

| ID | Work | Result |
|----|------|--------|
| ECO-F7.1 | Independent Laboratory org | ADR-016 + `org.partner_organizations` type `LABORATORY` (V62) |
| ECO-F7.2 | Independent Pharmacy org | Same model, type `PHARMACY` |
| ECO-F7.3 | Nearby choice | `GET /partners/nearby`; patient `book` / `send` with partner + location |
| ECO-F7.4 | HR depth | Deferred (membership table only) |
| ECO-F7.5 | Cross-org grants | Deferred beyond membership + hospital_partner_links |

## Rules (ADR-016)

- Encounter / Rx / clinical orders stay **hospital-owned**
- `hospital_id`/`branch_id` on lab orders & pharmacy requests = ordering site
- `fulfill_partner_org_id` NULL ⇒ hospital path (default)
- Non-NULL ⇒ independent partner fulfillment

## APIs

- `GET /api/v1/partners/nearby?type=LABORATORY|PHARMACY&lat=&lng=&radiusKm=&hospitalId=`
- `POST /api/v1/lab/me/orders/{id}/book-hospital` (unchanged)
- `POST /api/v1/lab/me/orders/{id}/book` `{ partnerOrgId, locationId }`
- `POST /api/v1/pharmacy/me/prescriptions/{id}/send-hospital` (unchanged)
- `POST /api/v1/pharmacy/me/prescriptions/{id}/send` `{ partnerOrgId, locationId }`

## QA

| Check | Evidence |
|-------|----------|
| Nearby search | `PartnerNearbySearchServiceTest.findNearbyReturnsSortedPartners` |
| Wrong type reject | `requireActiveLocationRejectsWrongType` |
| Compile | `mvn -DskipTests compile` |

**Seed:** PathCare lab + MedPlus pharmacy near Undri for demo tenant.

**Next:** Partner staff worklists by fulfill org; HR transfer; ECO-P7 QA sign-off.
