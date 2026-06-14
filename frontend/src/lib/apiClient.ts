import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { env } from '../config/env';

type ApiEnvelope<T> = {
  data?: T;
  error?: string;
};

const REQUEST_TIMEOUT_MS = 15_000;

function getExpoDevHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri ??
    null;

  if (!debuggerHost) {
    return null;
  }

  return debuggerHost.split(':')[0] ?? null;
}

function getUrlPort(raw: string, fallback = '8080'): string {
  try {
    return new URL(raw).port || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Rewrites localhost to a reachable host:
 * - Android emulator → 10.0.2.2
 * - Physical device (Expo Go) → same IP Metro uses (your PC on Wi‑Fi)
 * - Web → localhost unchanged
 */
export function resolveApiBaseUrl(): string {
  const raw = env.apiUrl.trim();
  if (!raw) {
    return '';
  }

  if (!/localhost|127\.0\.0\.1/i.test(raw) || Platform.OS === 'web') {
    return raw;
  }

  if (Platform.OS === 'android' && Constants.isDevice === false) {
    return raw.replace(/localhost|127\.0\.0\.1/i, '10.0.2.2');
  }

  const devHost = getExpoDevHost();
  if (devHost) {
    const port = getUrlPort(raw);
    return `http://${devHost}:${port}`;
  }

  if (Platform.OS === 'android') {
    return raw.replace(/localhost|127\.0\.0\.1/i, '10.0.2.2');
  }

  return raw;
}

export function hasApiBackend(): boolean {
  return Boolean(resolveApiBaseUrl());
}

function buildUrl(path: string, params?: Record<string, string | number | undefined | null>): string {
  const baseUrl = resolveApiBaseUrl();
  if (!baseUrl) {
    throw new Error('api url is missing. add EXPO_PUBLIC_API_URL to your .env file.');
  }

  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `api timed out after ${REQUEST_TIMEOUT_MS / 1000}s at ${resolveApiBaseUrl()}. check the go server is running and reachable.`,
      );
    }

    throw new Error(
      `could not connect to the api at ${resolveApiBaseUrl()}. use your pc lan ip in EXPO_PUBLIC_API_URL if auto-detect fails.`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readApiResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new Error(
      response.ok
        ? 'invalid api response'
        : `could not reach the api (${response.status}). check EXPO_PUBLIC_API_URL and that the go server is running.`,
    );
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const response = await fetchWithTimeout(buildUrl(path, params));
  const payload = await readApiResponse<T>(response);

  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? `request failed (${response.status})`);
  }

  if (payload.data === undefined) {
    throw new Error('empty api response');
  }

  return payload.data;
}

export async function apiPost<TBody, TResult>(path: string, body: TBody): Promise<TResult> {
  const response = await fetchWithTimeout(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await readApiResponse<TResult>(response);

  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? `request failed (${response.status})`);
  }

  if (payload.data === undefined) {
    throw new Error('empty api response');
  }

  return payload.data;
}
