import axios from "axios";

const DEFAULT_TIMEOUT_MS = 8_000;

type CacheRecord = {
  fetchedAt: number;
  expiresAt: number;
  data: unknown;
};

const cache = new Map<string, CacheRecord>();

export interface CachedJsonResult<T> {
  data: T;
  fetchedAt: string;
  ageMs: number;
  cacheStatus: "hit" | "miss";
}

export async function getJsonWithCacheMeta<T>(
  key: string,
  url: string,
  ttlMs = 20_000,
  headers?: Record<string, string>,
): Promise<CachedJsonResult<T>> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    return {
      data: hit.data as T,
      fetchedAt: new Date(hit.fetchedAt).toISOString(),
      ageMs: now - hit.fetchedAt,
      cacheStatus: "hit",
    };
  }

  const response = await axios.get<T>(url, {
    headers,
    timeout: DEFAULT_TIMEOUT_MS,
  });

  const fetchedAt = Date.now();
  cache.set(key, {
    fetchedAt,
    expiresAt: fetchedAt + ttlMs,
    data: response.data,
  });

  return {
    data: response.data,
    fetchedAt: new Date(fetchedAt).toISOString(),
    ageMs: 0,
    cacheStatus: "miss",
  };
}

export async function getJsonWithCache<T>(
  key: string,
  url: string,
  ttlMs = 20_000,
  headers?: Record<string, string>,
): Promise<T> {
  const result = await getJsonWithCacheMeta<T>(key, url, ttlMs, headers);
  return result.data;
}

export function sanitizeAxiosError(error: unknown): string {
  if (!error || typeof error !== "object") return "Unknown error";
  const maybeAny = error as { message?: string; response?: { status?: number } };
  if (maybeAny.response?.status) {
    return `HTTP ${maybeAny.response.status}: ${maybeAny.message ?? "request failed"}`;
  }
  return maybeAny.message ?? "Unknown error";
}
