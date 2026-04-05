const FALLBACK_ORIGIN =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "http://localhost";

const INTERNAL_HOST_PATTERNS = [
  /^localhost$/i,
  /^127(?:\.\d{1,3}){3}$/,
  /^0\.0\.0\.0$/,
  /^10(?:\.\d{1,3}){3}$/,
  /^192\.168(?:\.\d{1,3}){2}$/,
  /^172\.(1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/,
  /^::1$/,
];

const stripTrailingSlash = (value: string): string => value.replace(/\/$/, "");

const splitPathSuffix = (raw: string): [string, string] => {
  const match = raw.match(/^([^?#]*)(.*)$/);
  if (!match) {
    return [raw, ""];
  }
  return [match[1] || "", match[2] || ""];
};

const normalizePathForAsset = (rawValue: string): string => {
  const normalizedSlashes = (rawValue || "").replace(/\\/g, "/").trim();
  if (!normalizedSlashes) {
    return "";
  }

  const [pathPart, suffix] = splitPathSuffix(normalizedSlashes);
  let cleanPath = pathPart.replace(/^\.?\//, "").replace(/^\/+/, "");
  if (!cleanPath) {
    return "";
  }

  if (/^api\/media\//i.test(cleanPath)) {
    cleanPath = `media/${cleanPath.slice("api/media/".length)}`;
  } else if (/^api\/uploads\//i.test(cleanPath)) {
    cleanPath = `media/${cleanPath.slice("api/".length)}`;
  } else if (/^uploads\//i.test(cleanPath)) {
    cleanPath = `media/${cleanPath}`;
  }

  return `/${cleanPath}${suffix}`;
};

const isInternalHostname = (hostname: string): boolean => {
  const normalized = (hostname || "").trim().toLowerCase();
  return INTERNAL_HOST_PATTERNS.some((pattern) => pattern.test(normalized));
};

const toAbsoluteWithBase = (path: string, baseUrl: string): string => {
  if (!path) {
    return "";
  }
  const normalizedBase = `${stripTrailingSlash(baseUrl)}/`;
  try {
    return new URL(path, normalizedBase).toString();
  } catch {
    return `${stripTrailingSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
  }
};

const isNonHttpScheme = (value: string): boolean => {
  const raw = (value || "").trim();
  if (!raw) {
    return false;
  }
  if (raw.startsWith("data:")) {
    return false;
  }
  return /^[a-z][a-z\d+\-.]*:/i.test(raw) && !/^https?:/i.test(raw);
};

export const getApiBaseUrl = (): string =>
  stripTrailingSlash(import.meta.env.VITE_API_BASE_URL || FALLBACK_ORIGIN);

export const resolveApiAssetUrl = (
  value?: string | null,
  apiBaseUrl: string = getApiBaseUrl(),
): string => {
  const raw = (value || "").trim();
  if (!raw) {
    return "";
  }

  if (raw.startsWith("data:") || isNonHttpScheme(raw)) {
    return raw;
  }

  const base = stripTrailingSlash(apiBaseUrl || FALLBACK_ORIGIN);
  const baseOrigin = (() => {
    try {
      return new URL(base).origin;
    } catch {
      return FALLBACK_ORIGIN;
    }
  })();

  if (/^(https?:)?\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw, `${base}/`);
      if (!/^https?:$/i.test(parsed.protocol)) {
        return raw;
      }

      const originalPathWithSuffix = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      const normalizedPath = normalizePathForAsset(originalPathWithSuffix);

      if (isInternalHostname(parsed.hostname)) {
        return normalizedPath ? `${baseOrigin}${normalizedPath}` : baseOrigin;
      }

      if (normalizedPath && normalizedPath !== originalPathWithSuffix) {
        return `${parsed.origin}${normalizedPath}`;
      }

      return parsed.toString();
    } catch {
      return raw;
    }
  }

  const normalizedPath = normalizePathForAsset(raw);
  if (!normalizedPath) {
    return "";
  }
  return toAbsoluteWithBase(normalizedPath, base);
};
