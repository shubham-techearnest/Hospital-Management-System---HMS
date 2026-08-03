# Health360 Mobile — Developer Setup Guide

| Document ID | MOBILE-SETUP-001 |
|-------------|------------------|
| Version | 1.0.0 |
| Last Updated | 2026-07-31 |
| Scope | Infrastructure setup for `mobile/health360-mobile` (Expo SDK 52) |

This guide stabilizes the React Native mobile environment so every developer can run the app after clone **without manual dependency fixes**.

---

## 1. Architecture Notes

| Item | Value |
|------|-------|
| Framework | **Expo SDK 52** (managed workflow + prebuild for native runs) |
| Navigation | **React Navigation v7** (NOT Expo Router) |
| Entry point | `index.ts` → `src/App.tsx` |
| Native folders | `android/` and `ios/` are **generated** — not committed. Run `npx expo prebuild` before `expo run:android`. |

---

## 2. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20 LTS or 22 LTS | Required (`engines.node >= 20` in package.json) |
| **npm** | 10+ | Bundled with Node |
| **Java JDK** | 17 | Android Studio bundled JDK works |
| **Android Studio** | Latest stable | For SDK, emulator, and build tools |
| **Git** | Any recent | Clone the repository |

Optional:

- **Expo Go** app on a physical device (fastest path for UI testing)
- **Watchman** (macOS only — not required on Windows)

---

## 3. Quick Start (Recommended)

From the repository root:

```powershell
# 1. Validate environment + install deps + run Expo Doctor
.\scripts\doctor-mobile.ps1

# 2. Start Metro / Expo dev server
.\scripts\start-mobile.ps1
```

Or manually:

```powershell
cd mobile/health360-mobile
npm install
npx expo-doctor
npx expo start
```

---

## 4. Android Studio & SDK Setup

### 4.1 Install Android Studio

1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. During setup, install:
   - Android SDK
   - Android SDK Platform (API **34** or **35** recommended)
   - Android SDK Build-Tools (latest)
   - Android Emulator
   - Android SDK Platform-Tools

### 4.2 Environment Variables (Windows)

Set **user** or **system** environment variables (do not commit machine-specific paths):

| Variable | Value |
|----------|-------|
| `ANDROID_HOME` | Your SDK path, e.g. `C:\Users\<you>\AppData\Local\Android\Sdk` |
| `ANDROID_SDK_ROOT` | Same as `ANDROID_HOME` |

Add to **PATH**:

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

**Verify in a new terminal:**

```powershell
echo $env:ANDROID_HOME
adb version
```

If `adb` is not recognized, PATH is not configured correctly.

### 4.3 Create an Android Emulator

1. Open Android Studio → **Device Manager**
2. **Create Virtual Device** → Pixel 6 (or similar)
3. Select a system image (API 34+ recommended)
4. Finish and start the emulator before running the app

### 4.4 Physical Android Device

1. Enable **Developer options** → **USB debugging**
2. Connect via USB
3. Verify: `adb devices`

---

## 5. Running the App

### 5.1 Expo Go (fastest — no native build)

```powershell
cd mobile/health360-mobile
npx expo start
```

- Scan the QR code with Expo Go
- Backend API must be reachable from the device (see §7)

### 5.2 Development build on emulator (`expo run:android`)

Requires Android SDK + emulator running:

```powershell
cd mobile/health360-mobile
npm install
npx expo prebuild --platform android   # generates android/ folder
npx expo run:android
```

Or use the npm script (runs prebuild automatically on first run):

```powershell
npm run android
```

> **Note:** `android/` is gitignored. Each developer generates it locally via prebuild.

---

## 6. Backend API Connectivity

Default API URL is in `app.json` → `extra.apiBaseUrl`: `http://localhost:8080/api/v1`

| Target | URL |
|--------|-----|
| iOS Simulator | `http://localhost:8080/api/v1` |
| Android Emulator | `http://10.0.2.2:8080/api/v1` |
| Physical device | `http://<your-LAN-IP>:8080/api/v1` |

Set at runtime:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL = "http://10.0.2.2:8080/api/v1"
npx expo start
```

Start the backend first:

```powershell
.\scripts\start-s1-local.ps1
```

---

## 7. NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo / Metro |
| `npm run android` | Native Android build + launch |
| `npm run ios` | Native iOS build + launch (macOS only) |
| `npm run doctor` | Run Expo Doctor |
| `npm run prebuild` | Generate native `android/` / `ios/` |
| `npm run prebuild:clean` | Regenerate native projects from scratch |
| `npm run typecheck` | TypeScript validation |

---

## 8. Dependency Stack (SDK 52 aligned)

Core packages installed and validated:

- `expo` ~52, `react-native` 0.76.9, `react` 18.3.1
- `@react-navigation/*` v7
- `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`
- `react-native-paper`, `react-native-reanimated`, `react-native-gesture-handler`
- `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`
- `expo-asset`, `expo-font`, `expo-splash-screen`, `expo-secure-store`
- `expo-document-picker`, `expo-file-system`, `@expo/vector-icons`

**Do not** install Expo Router — this project uses React Navigation.

After adding any Expo package:

```powershell
npx expo install <package-name>
```

Never use `npm install` alone for Expo modules — it may install incompatible versions.

---

## 9. Clean Project Reset

If Metro or native builds behave unexpectedly:

```powershell
cd mobile/health360-mobile

# Clear caches
Remove-Item -Recurse -Force node_modules, .expo -ErrorAction SilentlyContinue
npm install

# Regenerate native projects
npx expo prebuild --clean

# Restart Metro with cache clear
npx expo start -c
```

---

## 10. Troubleshooting

### `expo-asset cannot be found`

**Cause:** Required Expo peer dependency was missing from `package.json`.

**Fix:** Already resolved in repo. If it recurs:

```powershell
npx expo install expo-asset expo-font expo-splash-screen
```

### `Using src/app as the root directory for Expo Router`

**Cause:** Expo SDK 52 auto-detects a folder named `src/app` as Expo Router root.

**Fix:** Project structure uses `src/navigation/` and `src/App.tsx` instead (React Navigation). This message should no longer appear.

### `Android SDK cannot be located`

**Cause:** `ANDROID_HOME` / `ANDROID_SDK_ROOT` not set, or Android Studio SDK not installed.

**Fix:**

1. Install Android Studio + SDK (§4)
2. Set environment variables (§4.2)
3. Open a **new** terminal and run `.\scripts\doctor-mobile.ps1`

### `adb is not recognized`

**Cause:** `%ANDROID_HOME%\platform-tools` not on PATH.

**Fix:** Add platform-tools to PATH (§4.2), restart terminal, verify with `adb version`.

### Expo Doctor: native folder / CNG warning

**Cause:** Stale `android/` folder present alongside `app.json` native config.

**Fix:** `android/` and `ios/` are gitignored. Delete local folders and regenerate:

```powershell
Remove-Item -Recurse -Force android, ios -ErrorAction SilentlyContinue
npx expo prebuild
```

### Metro port 8081 in use

```powershell
# Find and stop the process using port 8081 (Windows)
Get-NetTCPConnection -LocalPort 8081 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Gradle / JDK errors during `expo run:android`

- Ensure JDK 17 is active: `java -version`
- In Android Studio: **Settings → Build → Gradle → Gradle JDK → 17**

---

## 11. Helper Scripts (Repository Root)

| Script | Purpose |
|--------|---------|
| `scripts/doctor-mobile.ps1` | Full environment validation + Expo Doctor |
| `scripts/doctor-mobile.bat` | Windows batch wrapper |
| `scripts/start-mobile.ps1` | Install deps + start Expo |
| `scripts/start-mobile.bat` | Windows batch wrapper |

---

## 12. CI / Typecheck

```powershell
cd mobile/health360-mobile
npm ci
npm run typecheck
npx expo-doctor
```

---

## 13. Test Accounts

See root README and `V9__seed_dev_admin_users.sql` for local dev credentials:

| Email | Password | Role |
|-------|----------|------|
| `hospital.admin@health360.test` | `SecureP@ss1!` | HOSPITAL_ADMIN |
| `platform.admin@health360.test` | `SecureP@ss1!` | PLATFORM_ADMIN |
| Register via app | — | PATIENT / DOCTOR |

---

## 14. Related Documents

- [MOBILE_SPRINT_STATUS.md](./MOBILE_SPRINT_STATUS.md) — feature progress
- [MOBILE_DEVELOPMENT_STRATEGY.md](./MOBILE_DEVELOPMENT_STRATEGY.md) — parallel sprint policy
- [MOBILE_API_INTEGRATION_GUIDE.md](./MOBILE_API_INTEGRATION_GUIDE.md) — API reference
