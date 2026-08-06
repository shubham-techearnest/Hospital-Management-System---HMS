# Health360 Mobile (React Native + Expo)

Expo-based React Native app aligned with [MOBILE-STRAT-001](../../docs/phase-1/mobile/MOBILE_DEVELOPMENT_STRATEGY.md).

## Status — S7 Complete (Catch-Up)

| Feature | Status |
|---------|--------|
| Auth + Settings (S1–S2) | ✅ |
| Patient profile + vitals (S3–S4) | ✅ |
| Doctor profile + verification (S5–S6) | ✅ |
| Hospital admin + doctor associations (S7) | ✅ |

Track progress: [MOBILE_SPRINT_STATUS.md](../../docs/phase-1/mobile/MOBILE_SPRINT_STATUS.md)

## Setup (Read This First)

**Full setup guide:** [MOBILE_SETUP.md](../../docs/phase-1/mobile/MOBILE_SETUP.md)

Quick start from repo root:

```powershell
.\scripts\doctor-mobile.ps1   # validate environment
.\scripts\start-mobile.ps1    # start Expo
```

## Stack

- Expo SDK 52 / React Native 0.76.9
- TypeScript
- React Navigation v7 (not Expo Router)
- TanStack React Query
- Axios
- React Hook Form + Zod
- React Native Paper
- React Native Reanimated

## Prerequisites

- Node.js 20+
- Android Studio + SDK (for emulator / `expo run:android`)
- See [MOBILE_SETUP.md](../../docs/phase-1/mobile/MOBILE_SETUP.md) for ANDROID_HOME, adb, and emulator setup

## Run Locally

1. Start the backend API (`http://localhost:8080`):

   ```powershell
   .\scripts\start-s1-local.ps1
   ```

2. Start mobile:

   ```powershell
   .\scripts\start-mobile.ps1
   ```

3. Open in Expo Go (scan QR) or press `a` for Android emulator.

### API URL for emulators

| Environment | URL |
|-------------|-----|
| iOS Simulator | `http://localhost:8080/api/v1` (default) |
| Android Emulator | `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1` |
| Physical device | `http://<LAN-IP>:8080/api/v1` |

## Deep Links

Email verification: `health360://verify-email?token=<token>`

## Project Structure

```
src/
├── App.tsx           # Root component
├── navigation/       # React Navigation (tabs, stacks)
├── features/
│   ├── auth/
│   ├── patient/
│   ├── doctor/
│   ├── hospital/
│   └── settings/
├── shared/
│   ├── api/
│   ├── storage/
│   ├── components/
│   └── theme/
└── config.ts
index.ts              # Expo entry point
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Native Android build (requires SDK) |
| `npm run doctor` | Run Expo Doctor |
| `npm run prebuild:clean` | Regenerate android/ios folders |
| `npm run typecheck` | TypeScript check |

Repository helpers: `scripts/start-mobile.ps1`, `scripts/doctor-mobile.ps1`
