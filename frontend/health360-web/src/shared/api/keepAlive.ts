/**
 * Keeps hosted backends (e.g. Render free tier) warm by pinging a no-work endpoint.
 * Render sleeps after ~15 minutes without traffic — ping every 5 minutes when enabled.
 *
 * Requires VITE_API_BASE_URL to be the **absolute API origin** in production
 * (e.g. https://health360-api-xxx.onrender.com/api/v1), not a relative /api/v1 path.
 */
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const KEEP_ALIVE_TIMEOUT_MS = 30_000;

function parseIntervalMs(): number {
  const raw = import.meta.env.VITE_KEEP_ALIVE_INTERVAL_MS;
  if (!raw) return DEFAULT_INTERVAL_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 60_000 ? parsed : DEFAULT_INTERVAL_MS;
}

function isEnabled(): boolean {
  const flag = import.meta.env.VITE_KEEP_ALIVE_ENABLED;
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return true;
  return import.meta.env.PROD;
}

function wakeUrl(): string | null {
  const override = import.meta.env.VITE_KEEP_ALIVE_URL?.trim();
  if (override) return override;

  const base = import.meta.env.VITE_API_BASE_URL?.trim() ?? '/api/v1';
  if (base.startsWith('/')) {
    if (import.meta.env.PROD) {
      console.warn(
        '[keep-alive] VITE_API_BASE_URL is relative; pings hit the web host, not the API. ' +
          'Set VITE_API_BASE_URL or VITE_KEEP_ALIVE_URL to your deployed API URL.',
      );
    }
    return `${window.location.origin}${base.replace(/\/$/, '')}/health/awake`;
  }
  return `${base.replace(/\/$/, '')}/health/awake`;
}

function pingBackend() {
  const url = wakeUrl();
  if (!url) return;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), KEEP_ALIVE_TIMEOUT_MS);

  fetch(url, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'omit',
    signal: controller.signal,
    keepalive: true,
  })
    .catch(() => {
      /* never surface to UI */
    })
    .finally(() => window.clearTimeout(timer));
}

export function startBackendKeepAlive(): (() => void) | undefined {
  if (!isEnabled() || typeof window === 'undefined') return undefined;

  pingBackend();

  const intervalId = window.setInterval(pingBackend, parseIntervalMs());

  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      pingBackend();
    }
  };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', pingBackend);

  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', pingBackend);
  };
}
