# Hospital Asset Management — Module Brief (Roadmap)

| Attribute | Value |
|-----------|-------|
| **Module** | Hospital Asset Management (HAM) |
| **Product** | Health360 by TechEarnest |
| **Status** | **ROADMAP** — featured in marketing pack; build after ECO-P4 planning |
| **Updated** | 2026-08-25 |

## Why this module

Clinical HMS without asset visibility is incomplete for hospital CIOs and IT partners. TechEarnest already delivers **ServiceNow ITAM** for enterprises; Health360 extends that discipline into hospital biomedical, facility, and care-unit assets.

## Scope (target)

| Domain | Examples |
|--------|----------|
| Biomedical | Monitors, ventilators, infusion pumps, imaging peripherals |
| Care unit | Beds, stretchers, wheelchairs linked to ward/ICU |
| Facility | Generators, oxygen, HVAC critical assets |
| IT | Workstations, printers, network gear (hospital IT inventory) |

## Capabilities (v1 target)

1. Asset registry (tag/barcode, category, location, owner)
2. Lifecycle status (IN_STOCK → ASSIGNED → MAINTENANCE → RETIRED)
3. Warranty & AMC dates with reminder hooks
4. Link optional assets to ward/bed/OT/lab location
5. Role portals: Hospital Admin + Biomedical Engineer
6. Optional enterprise bridge to ServiceNow ITAM (future ADR)

## Non-goals (v1)

- Full CMMS work-order shop floor
- Independent marketplace for device vendors
- Replacing ServiceNow ITAM for pure IT estates (complement, don’t duplicate)

## Next engineering step

Create feature package under `docs/09-features/` when product prioritizes HAM vs ECO-P4 pharmacy share.
