import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/providers';
import { AppRouter } from './app/router';
import { startBackendKeepAlive } from './shared/api/keepAlive';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);

const BOOT_DURATION_MS = 2000;
const bootLoader = document.getElementById('boot-loader');
const bootStartedAt = performance.now();

const hideBootLoader = () => {
  if (!bootLoader) {
    startBackendKeepAlive();
    return;
  }
  const remaining = Math.max(0, BOOT_DURATION_MS - (performance.now() - bootStartedAt));
  window.setTimeout(() => {
    bootLoader.classList.add('is-done');
    window.setTimeout(() => {
      bootLoader.classList.add('is-complete');
      window.setTimeout(() => bootLoader.remove(), 300);
    }, 100);
    startBackendKeepAlive();
  }, remaining);
};

if (document.readyState === 'complete') {
  hideBootLoader();
} else {
  window.addEventListener('load', hideBootLoader, { once: true });
}
