# Phase H — Experience polish / parity

| Attribute | Value |
|-----------|-------|
| **Document ID** | PM-PHASE-H-001 |
| **Started** | 2026-09-07 |
| **Status** | **IN PROGRESS** (code) |
| **Parent** | [MODULE-DEVELOPMENT-PLAN.md](../13-project-management/MODULE-DEVELOPMENT-PLAN.md) |

## Goals

Close remaining UX gaps after Phase G without new vendor contracts: waiting-room visibility, docs sync, and mobile auth parity.

## Tasks

| ID | Task | Status | Notes |
|----|------|--------|-------|
| H1 | OPD waiting-room display board (web) | [x] | Full-screen `/reception/display`; auto-refresh; desk filter via query |
| H2 | Phase H plan + feature-status-board sync | [x] | This doc + MODULE plan + board row |
| H3 | Mobile forgot / reset password | [x] | Screens + deep link `health360://reset-password?token=` |

## Ops / QA

- Reception: open **Display board** from nav or dashboard button (TV / kiosk; keep session logged in).
- Mobile: Login → Forgot password; open reset deep link from API logs (local email).
- Still deferred from G: PACS (G4), LIS (G5).

## Exit criteria (code)

- [x] Display board shows CALLED / IN_SERVICE + WAITING without desk actions
- [x] Mobile can request reset and apply token via deep link
- [ ] Manual QA signed on display board + mobile reset
