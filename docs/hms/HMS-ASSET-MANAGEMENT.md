# Hospital Asset Management (v1)

| Status | Implemented · API smoke verified 2026-09-15 |
| Module | `asset` schema · `/api/v1/assets` · Hospital Portal `/hospital/assets` · **Asset Manager portal `/assets`** |
| Plan feature | `FEATURE_ASSET_MANAGEMENT` |

## Scope

- Register fixed assets and medical equipment (tag, category, location, serial, warranty).
- Status lifecycle: `AVAILABLE` → `IN_USE` | `MAINTENANCE` | `RETIRED` | `DISPOSED`.
- Maintenance logs: preventive / corrective / calibration / inspection.
- RBAC: `HOSPITAL_ADMIN`, `ASSET_MANAGER`, `PLATFORM_ADMIN` (`asset:read`, `asset:write`, `asset:maintenance:write`).
- **ASSET_MANAGER** staff portal: login → `/assets` (shared `AssetManagementPanel`).
- Beds remain in IPD/ICU; ICU stay equipment assignment is unchanged.

## Out of scope (later)

- Purchase orders, vendors, depreciation, consumable stock
- Assign asset to IPD admission / ICU stay
- Migrate `icu.equipment` into `asset.assets`

## Key APIs

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/v1/assets/categories` | Seeded categories |
| GET/POST | `/api/v1/assets` | List (hospitalId, branchId, status, categoryId, q) / create |
| GET/PATCH | `/api/v1/assets/{id}` | Detail / update |
| POST | `/api/v1/assets/{id}/status` | Status transition |
| GET/POST | `/api/v1/assets/{id}/maintenance` | List / record |

## Flyway

`V88__create_asset_schema.sql`

## Related

Letterheaded clinical print documents and hospital stationery: [HMS-CLINICAL-DOCUMENTS.md](./HMS-CLINICAL-DOCUMENTS.md) (`V89`).
