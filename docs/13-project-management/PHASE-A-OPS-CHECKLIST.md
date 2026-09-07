# Phase A — Ops checklist (A1 + A6)

| Attribute | Value |
|-----------|-------|
| **Document ID** | PM-PHASE-A-OPS-001 |
| **Parent** | [MODULE-DEVELOPMENT-PLAN.md](./MODULE-DEVELOPMENT-PLAN.md) |
| **Last Updated** | 2026-09-07 |

Use this to finish **A1** (push + golden path) and **A6** (keep-alive) on production. Code for both is already in the repo.

**Status: COMPLETE** — production QA signed off 2026-09-07.

---

## A6 — Keep API awake (Render free tier)

### Code (done)

- [x] Web: `frontend/health360-web/src/shared/api/keepAlive.ts` — ping `/health/awake` every 5 min in production
- [x] GitHub Actions: `.github/workflows/keep-alive.yml` — cron every 5 min
- [x] Backend: `GET /api/v1/health/awake` (public, 204)

### You must do on GitHub / Render

- [ ] Merge/push keep-alive workflow to the **default branch**
- [ ] Repo → Settings → Secrets and variables → Actions → Variables:
  - `API_HEALTH_URL` = `https://health360-api-6hz5.onrender.com/api/v1/health/awake`
  (adjust host if your Render URL differs)
- [ ] Actions → **Keep API awake** → Run workflow once → confirm green
- [ ] Render **web** env: `VITE_API_BASE_URL` = absolute API URL  
  e.g. `https://health360-api-6hz5.onrender.com/api/v1`  
  (not `/api/v1` unless the web host proxies to the API)
- [ ] Optional backup: UptimeRobot every 5 min on the same `/health/awake` URL

### Quick verify

```bash
curl -i https://health360-api-6hz5.onrender.com/api/v1/health/awake
# expect HTTP 204
```

Open production web → Network tab → confirm periodic `health/awake` calls while logged in.

**Note (2026-09-03):** Direct ping from engineer machine timed out (HTTP `000` / curl exit 28 after 90s). Treat production API as **asleep or unreachable** until keep-alive workflow is running on the default branch and Render service is confirmed live.

---

## A5 — Playwright OPD smoke (done in repo)

```bash
cd frontend/health360-web
npm run test:e2e:install   # once
npm run test:e2e           # needs local API :8080 + Vite :5173
```

- Spec: `frontend/health360-web/e2e/opd-golden-path.spec.ts`
- CI: `.github/workflows/e2e-opd.yml` — API smoke on push; full UI via workflow_dispatch
- Backend IT retained: `OpdWalkInGoldenPathIntegrationTest.java`

---

## A1 — Push notifications + OPD golden path QA

### Code (done)

- [x] Backend: `V68__device_push_tokens.sql`, Expo push service, wired on `OPD_CALLED`
- [x] Mobile: device token register on login; unregister on logout
- [x] Polling fallback when no Expo token

### You must do for production push

- [ ] Create/link EAS project: `cd mobile/health360-mobile && npx eas init`
- [ ] Replace placeholder in `app.json` → `extra.eas.projectId` with the real EAS UUID
- [ ] Build a **development or production** native app (`eas build`) — Expo Go has limited Android push
- [ ] Restart backend so Flyway **V68** applies
- [ ] Confirm `health360.push.enabled=true` (default) on Render API

### Golden path QA (local then production)

Credentials: see `mannual/QA-TEST-CREDENTIALS-AND-FUNCTIONALITY.txt` §7 / §11.

- [ ] Patient requests OPD (web or mobile)
- [ ] Reception: patient appears WAITING on queue
- [ ] Reception: **Call patient** → patient gets push / notification (CALLED)
- [ ] Doctor: start consult → IN_SERVICE
- [ ] Doctor: complete + sign e-Rx
- [ ] Reception: checkout → invoice → record payment
- [ ] Patient: My OPD shows COMPLETED + Paid

Mark A1 complete in MODULE-DEVELOPMENT-PLAN only after **production** golden path passes.

---

## Decisions locked in Phase A code (A2 / A4)

| Topic | Decision |
|-------|----------|
| Primary entry | **Request OPD + walk-in + desk arrive** (canonical) |
| Patient slot booking UI | Remains redirected to Request OPD; `ReceptionSlotBookingPanel` deferred |
| Patient self check-in UI | Deprecated for now (routes → `/patient/opd`); API kept |
| Desk arrive | Wired on Reception dashboard **Arrive** tab |
| Clinical catalogs | Wired at `/hospital/catalogs` + nav |

---

*End of PM-PHASE-A-OPS-001*
