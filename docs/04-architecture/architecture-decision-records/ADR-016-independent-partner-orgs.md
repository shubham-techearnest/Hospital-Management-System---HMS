# ADR-016: Independent Laboratory & Pharmacy Partner Organizations

| Status | ACCEPTED |
| Date | 2026-08-27 |
| Feature | ECO-P7 / ECO-F7.1–F7.3 |

## Context

Lab and pharmacy fulfillment today are **hospital/branch-scoped**. The ecosystem requires independent Laboratory and Pharmacy organizations under the same tenant, with patient choice of nearby partners, without rebuilding clinical hubs (encounter / Rx / clinical orders remain hospital-owned).

## Decision

1. Introduce schema **`org`** with:
   - `partner_organizations` (`LABORATORY` | `PHARMACY`)
   - `partner_org_locations` (geo + address; mirror `hospital.branches`)
   - `partner_org_memberships` (staff assignment to partner)
   - `hospital_partner_links` (optional in-network / preferred)
2. Ordering site remains on existing rows:
   - `laboratory.lab_orders.hospital_id` / `branch_id` = encounter hospital (source of truth for audit)
   - `pharmacy.pharmacy_requests.hospital_id` / `branch_id` = prescription hospital
3. Fulfillment destination is additive:
   - `fulfill_partner_org_id` / `fulfill_location_id` NULL ⇒ **hospital path** (default)
   - non-NULL ⇒ independent partner fulfillment
4. Patient APIs:
   - Keep `book-hospital` / `send-hospital` unchanged
   - Add `book` / `send` with `{ partnerOrgId, locationId }`
   - Add `GET /partners/nearby?type=&lat=&lng=&radiusKm=`
5. Partner staff scope uses membership (parallel to ADR-008 hospital scope); hospital staff continue to use hospital scope for NULL fulfill rows.
6. Defer for later slices: full HR transfer/docs (ECO-F7.4), explicit cross-org grants beyond membership (ECO-F7.5), partner-owned test catalogs.

## Consequences

- Flyway **V62**
- New module package `com.health360.org`
- Clinical hubs unchanged (ADR-002 / ADR-005 preserved)
