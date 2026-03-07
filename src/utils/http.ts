import axios from "axios";

const DEFAULT_TIMEOUT_MS = 8_000;

type CacheRecord = {
  expiresAt: number;
  data: unknown;
};

const cache = new Map<string, CacheRecord>();

export async function getJsonWithCache<T>(
  key: string,
  url: string,
  ttlMs = 20_000,
  headers?: Record<string, string>,
): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.data as T;
  }

  const response = await axios.get<T>(url, {
    headers,
    timeout: DEFAULT_TIMEOUT_MS,
  });

  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    data: response.data,
  });

  return response.data;
}

export function sanitizeAxiosError(error: unknown): string {
  if (!error || typeof error !== "object") return "Unknown error";
  const maybeAny = error as { message?: string; response?: { status?: number } };
  if (maybeAny.response?.status) {
    return `HTTP ${maybeAny.response.status}: ${maybeAny.message ?? "request failed"}`;
  }
  return maybeAny.message ?? "Unknown error";
}
