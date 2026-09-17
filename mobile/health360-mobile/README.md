# Health360 Mobile (React Native + Expo)

Expo SDK ~52 app. Canonical docs: [`docs/ssot/mobile/`](../../docs/ssot/mobile/MOBILE-ARCHITECTURE.md).

## Status (CURRENT — CODE VERIFIED)

| Area | Status |
|------|--------|
| Auth + settings | Implemented |
| Patient profile / vitals / OPD / payments | Implemented |
| Doctor profile / verification / OPD visits | Implemented |
| Hospital admin org subset | Partial vs web |
| Staff worklists (lab/rad/pharm/OT/nurse/ICU) | Partial — processing on web |
| Full HMS ops (IPD/ED/assets/inventory/…) | Not on mobile |

See [SCREEN-CATALOG](../../docs/ssot/mobile/SCREEN-CATALOG.md).

## Setup

```powershell
# from repo root
.\scripts\doctor-mobile.ps1
.\scripts\start-mobile.ps1
```

```powershell
cd mobile/health360-mobile
npm run android   # requires Android Studio + SDK
```

## Stack

- Expo SDK 52 / React Native 0.76.9
- TypeScript
- React Navigation
- TanStack Query + Axios
- Expo Secure Store / Notifications / Location
