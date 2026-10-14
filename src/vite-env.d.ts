/// <reference types="vite/client" />

/** Set per build in vite.config.js; the persisted cache's buster. */
declare const __APP_BUILD__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_VERSION?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_API_MOCKS?: string;
}

