import { AppState, type AppStateStatus } from 'react-native';
import { API_BASE_URL } from '@/config';

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 30_000;

function isLocalApi(): boolean {
  return API_BASE_URL.includes('localhost') || API_BASE_URL.includes('10.0.2.2');
}

function wakeUrl(): string {
  return `${API_BASE_URL.replace(/\/$/, '')}/health/awake`;
}

async function pingBackend(): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await fetch(wakeUrl(), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch {
    /* ignore */
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pings the API while the mobile app is in the foreground (production APIs only).
 */
export function startBackendKeepAlive(): () => void {
  if (isLocalApi()) {
    return () => undefined;
  }

  void pingBackend();

  const intervalId = setInterval(() => {
    if (AppState.currentState === 'active') {
      void pingBackend();
    }
  }, DEFAULT_INTERVAL_MS);

  const onAppState = (state: AppStateStatus) => {
    if (state === 'active') {
      void pingBackend();
    }
  };
  const subscription = AppState.addEventListener('change', onAppState);

  return () => {
    clearInterval(intervalId);
    subscription.remove();
  };
}
