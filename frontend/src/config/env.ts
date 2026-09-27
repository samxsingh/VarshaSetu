/**
 * VarshaSetu - Frontend Centralized Environment Configuration
 * Provides typed, validated access to Vite environment variables.
 */

export interface FrontendEnvConfig {
  /** Base URL for backend API requests (e.g. '/api/v1' or 'http://localhost:5001/api/v1') */
  API_BASE_URL: string;
  /** WebSocket / Socket.IO server URL (defaults to window.location.origin) */
  WS_URL: string;
  /** Active application mode: 'development' | 'production' | 'test' */
  MODE: string;
  /** True when running under local development */
  IS_DEV: boolean;
  /** True when running under production build */
  IS_PROD: boolean;
  /** True when running in automated test suite */
  IS_TEST: boolean;
}

const resolveEnvVar = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    const val = String(import.meta.env[key]).trim();
    return val || fallback;
  }
  return fallback;
};

export const env: FrontendEnvConfig = {
  API_BASE_URL: resolveEnvVar('VITE_API_BASE_URL', '/api/v1'),
  WS_URL: resolveEnvVar('VITE_WS_URL', ''),
  MODE: typeof import.meta !== 'undefined' && import.meta.env?.MODE ? import.meta.env.MODE : 'development',
  IS_DEV: Boolean(typeof import.meta !== 'undefined' && import.meta.env?.DEV),
  IS_PROD: Boolean(typeof import.meta !== 'undefined' && import.meta.env?.PROD),
  IS_TEST: Boolean(typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test'),
};
