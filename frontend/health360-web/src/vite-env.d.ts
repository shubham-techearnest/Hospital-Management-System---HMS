/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_KEEP_ALIVE_ENABLED?: string;
  readonly VITE_KEEP_ALIVE_INTERVAL_MS?: string;
  readonly VITE_KEEP_ALIVE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
