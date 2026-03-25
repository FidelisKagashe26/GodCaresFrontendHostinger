interface CacheRecord<T = unknown> {
  value: T;
  expiresAt: number;
  updatedAt: number;
}

interface CacheOptions {
  ttlMs?: number;
  persist?: boolean;
  allowStaleOnError?: boolean;
  forceRefresh?: boolean;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const STORAGE_PREFIX = "gc365_cache_v1::";
const MEMORY_CACHE = new Map<string, CacheRecord>();
const IN_FLIGHT = new Map<string, Promise<unknown>>();

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

const getStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

const readStoredRecord = (key: string): CacheRecord | null => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(key));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<CacheRecord>;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.updatedAt !== "number" ||
      !("value" in parsed)
    ) {
      window.localStorage.removeItem(getStorageKey(key));
      return null;
    }

    return parsed as CacheRecord;
  } catch {
    return null;
  }
};

const writeStoredRecord = (key: string, record: CacheRecord) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(key), JSON.stringify(record));
  } catch {
    // Ignore storage write errors (quota, private mode restrictions, etc).
  }
};

const removeStoredRecord = (key: string) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(getStorageKey(key));
  } catch {
    // Ignore storage delete errors.
  }
};

const isFresh = (record: CacheRecord) => record.expiresAt > Date.now();

const readCacheRecord = (key: string, includeExpired = false): CacheRecord | null => {
  const memoryRecord = MEMORY_CACHE.get(key);
  if (memoryRecord) {
    if (includeExpired || isFresh(memoryRecord)) {
      return memoryRecord;
    }
    MEMORY_CACHE.delete(key);
  }

  const storedRecord = readStoredRecord(key);
  if (!storedRecord) {
    return null;
  }

  if (!includeExpired && !isFresh(storedRecord)) {
    removeStoredRecord(key);
    return null;
  }

  MEMORY_CACHE.set(key, storedRecord);
  return storedRecord;
};

const saveCacheRecord = <T>(key: string, value: T, ttlMs: number, persist: boolean) => {
  if (!(ttlMs > 0)) {
    return;
  }

  const record: CacheRecord<T> = {
    value,
    updatedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };

  MEMORY_CACHE.set(key, record);
  if (persist) {
    writeStoredRecord(key, record);
  }
};

export const withCachedResult = async <T>(
  key: string,
  loader: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> => {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const allowStaleOnError = options.allowStaleOnError !== false;
  const staleRecord = allowStaleOnError ? readCacheRecord(key, true) : null;

  if (!options.forceRefresh && ttlMs > 0) {
    const freshRecord = readCacheRecord(key, false);
    if (freshRecord) {
      return freshRecord.value as T;
    }
  }

  if (!options.forceRefresh) {
    const inFlight = IN_FLIGHT.get(key) as Promise<T> | undefined;
    if (inFlight) {
      return inFlight;
    }
  }

  const requestPromise = (async () => {
    try {
      const result = await loader();
      saveCacheRecord(key, result, ttlMs, options.persist === true);
      return result;
    } catch (error) {
      if (staleRecord) {
        return staleRecord.value as T;
      }
      throw error;
    } finally {
      IN_FLIGHT.delete(key);
    }
  })();

  IN_FLIGHT.set(key, requestPromise);
  return requestPromise;
};

export const invalidateCachedResult = (key: string) => {
  MEMORY_CACHE.delete(key);
  IN_FLIGHT.delete(key);
  removeStoredRecord(key);
};

