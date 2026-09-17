# Mobile Architecture — CURRENT

| Attribute | Value |
|-----------|-------|
| **Document ID** | SSOT-MOB-001 |
| **Version** | 1.1 |
| **Status** | CURRENT — CODE VERIFIED |
| **Last Updated** | 2026-09-17 |

## Stack

Expo ~52, React Native 0.76.9, React Navigation, TanStack Query, Axios, Expo Secure Store, Expo Notifications, Expo Location, React Native Paper, RHF+Zod.

## Auth storage

Secure Store (native) / prefixed localStorage (web) via platform storage helpers; AuthContext (no Redux).

## Shells

Patient, Doctor, Reception, Hospital Admin, Platform Admin, Staff Worklist (lab/rad/pharm/OT/nurse/ICU).  
**ASSET_MANAGER:** not mapped → unauthorized.

## Local setup (CURRENT)

From repo root:

```powershell
.\scripts\doctor-mobile.ps1   # validate Node / Android / Expo doctor
.\scripts\start-mobile.ps1    # start Metro / Expo
```

App path: `mobile/health360-mobile/`. Requires API at configured base URL (typically `localhost:8080`).

Native Android: `cd mobile/health360-mobile && npm run android` (Android Studio/SDK required).

## Parity statement

Mobile is **not** a full HMS client. Deep ops remain web-first (CODE-VERIFIED). See [SCREEN-CATALOG.md](./SCREEN-CATALOG.md).
