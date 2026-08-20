/**
 * Lightweight keep-alive ping. Hits a no-work backend endpoint so hosted
 * instances stay warm. Uses native fetch (no auth, no retries, no UI).
 */
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;
const KEEP_ALIVE_TIMEOUT_MS = 4_000;

function wakeUrl() {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
  return `${base.replace(/\/$/, '')}/health/awake`;
}

function pingBackend() {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), KEEP_ALIVE_TIMEOUT_MS);

  fetch(wakeUrl(), {
    method: 'GET',
    cache: 'no-store',
    credentials: 'omit',
    signal: controller.signal,
    keepalive: true,
  })
    .catch(() => {
      /* ignore — wake must never affect the UI */
    })
    .finally(() => window.clearTimeout(timer));
}

export function startBackendKeepAlive() {
  pingBackend();
  const intervalId = window.setInterval(pingBackend, KEEP_ALIVE_INTERVAL_MS);
  return () => window.clearInterval(intervalId);
}
