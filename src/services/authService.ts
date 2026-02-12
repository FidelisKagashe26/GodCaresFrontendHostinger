export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthUser {
  name: string;
  email: string;
}

interface TokenPair {
  access: string;
  refresh: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");
const ACCESS_TOKEN_KEY = "gc365_access_token";
const REFRESH_TOKEN_KEY = "gc365_refresh_token";

const toAuthUser = (user: ApiUser): AuthUser => {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  return {
    name: fullName || user.username || user.email || "Mtafuta Ukweli",
    email: user.email || "",
  };
};

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const setTokens = (tokens: TokenPair) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
};

const safeFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Imeshindikana kuwasiliana na seva. Hakikisha internet na API zipo sawa.");
  }
};

const readErrorMessage = async (response: Response, fallback: string) => {
  const payload = await response.json().catch(() => ({} as any));
  const detail = payload?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;

  const keys = Object.keys(payload || {});
  if (keys.length) {
    const first = payload[keys[0]];
    if (Array.isArray(first) && first.length && typeof first[0] === "string") {
      return first[0];
    }
    if (typeof first === "string") return first;
  }
  return fallback;
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const request = async (path: string, options: RequestInit = {}, retry = true) => {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await safeFetch(url, { ...options, headers });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(path, options, false);
    }
  }

  return response;
};

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const response = await safeFetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = (await response.json()) as { access: string };
  const currentRefresh = getRefreshToken();
  if (data.access && currentRefresh) {
    setTokens({ access: data.access, refresh: currentRefresh });
    return true;
  }

  return false;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> => {
  const [first_name, ...rest] = payload.name.trim().split(" ");
  const last_name = rest.join(" ");

  const response = await request("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      username: payload.email,
      email: payload.email,
      password: payload.password,
      first_name: first_name || "",
      last_name: last_name || "",
    }),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, "Imeshindikana kusajili.");
    throw new Error(message);
  }

  const user = (await response.json()) as ApiUser;
  return toAuthUser(user);
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<void> => {
  const response = await safeFetch(`${API_BASE_URL}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: payload.email, password: payload.password }),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, "Imeshindikana kuingia.");
    const detail = String(message).toLowerCase();
    if (detail.includes("no active account")) {
      throw new Error("Akaunti haijathibitishwa au taarifa za kuingia si sahihi.");
    }
    throw new Error(message);
  }

  const data = (await response.json()) as TokenPair;
  setTokens(data);
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await request("/api/auth/me/");

  if (!response.ok) {
    const message = await readErrorMessage(response, "Imeshindikana kupata taarifa za mtumiaji.");
    throw new Error(message);
  }

  const user = (await response.json()) as ApiUser;
  return toAuthUser(user);
};

export const forgotPassword = async (email: string): Promise<void> => {
  const response = await safeFetch(`${API_BASE_URL}/api/auth/forgot-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, "Imeshindikana kutuma link.");
    throw new Error(message);
  }
};

export const resetPassword = async (payload: {
  uid: string;
  token: string;
  password: string;
}): Promise<void> => {
  const response = await safeFetch(`${API_BASE_URL}/api/auth/reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response, "Imeshindikana kubadili nenosiri.");
    throw new Error(message);
  }
};

