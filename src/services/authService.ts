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

export interface RegisterResult {
  success: boolean;
  message: string;
  phone: string;
  email: string;
}

export interface VerifyOtpResult {
  user: AuthUser;
  welcomeMessage: string;
}

interface TokenPair {
  access: string;
  refresh: string;
}

export type FieldErrorMap = Record<string, string>;

interface AuthRequestErrorOptions {
  code?: string;
  fieldErrors?: FieldErrorMap;
  phone?: string;
  email?: string;
  status?: number;
}

export class AuthRequestError extends Error {
  code?: string;
  fieldErrors: FieldErrorMap;
  phone?: string;
  email?: string;
  status?: number;

  constructor(message: string, options: AuthRequestErrorOptions = {}) {
    super(message);
    this.name = "AuthRequestError";
    this.code = options.code;
    this.fieldErrors = options.fieldErrors || {};
    this.phone = options.phone;
    this.email = options.email;
    this.status = options.status;
  }
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

const parseValueMessage = (value: unknown): string => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (Array.isArray(value) && value.length) {
    const first = value[0];
    if (typeof first === "string" && first.trim()) {
      return first.trim();
    }
  }
  return "";
};

const buildFieldErrors = (payload: any): FieldErrorMap => {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const skipKeys = new Set(["detail", "message", "status_code", "success"]);
  const errors: FieldErrorMap = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (skipKeys.has(key)) {
      return;
    }
    if (key === "code" && value === "verification_required") {
      return;
    }
    const parsed = parseValueMessage(value);
    if (parsed) {
      errors[key] = parsed;
    }
  });

  return errors;
};

const toAuthRequestError = async (response: Response, fallback: string): Promise<AuthRequestError> => {
  const payload = await response.json().catch(() => ({} as any));
  const code = typeof payload?.code === "string" ? payload.code.trim() : undefined;
  const fieldErrors = buildFieldErrors(payload);

  if (code && code !== "verification_required" && !fieldErrors.code) {
    fieldErrors.code = code;
  }

  let message = "";
  if (typeof payload?.detail === "string" && payload.detail.trim()) {
    message = payload.detail.trim();
  }
  if (!message && typeof payload?.message === "string" && payload.message.trim()) {
    message = payload.message.trim();
  }
  if (!message && Object.keys(fieldErrors).length) {
    message = fieldErrors[Object.keys(fieldErrors)[0]];
  }

  return new AuthRequestError(message || fallback, {
    code,
    fieldErrors,
    phone: typeof payload?.phone === "string" ? payload.phone : undefined,
    email: typeof payload?.email === "string" ? payload.email : undefined,
    status: response.status,
  });
};

const safeFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    return await fetch(input, init);
  } catch {
    throw new AuthRequestError(
      "Hakuna mawasiliano ya mtandao kwa sasa. Tafadhali angalia internet yako kisha ujaribu tena.",
      { code: "network_unavailable" }
    );
  }
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
  passwordConfirm: string;
  phone: string;
}): Promise<RegisterResult> => {
  const [first_name, ...rest] = payload.name.trim().split(" ");
  const last_name = rest.join(" ");

  const response = await request("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      username: payload.email,
      email: payload.email,
      password: payload.password,
      password_confirm: payload.passwordConfirm,
      phone: payload.phone.trim(),
      first_name: first_name || "",
      last_name: last_name || "",
    }),
  });

  if (!response.ok) {
    throw await toAuthRequestError(response, "Imeshindikana kusajili. Tafadhali jaribu tena.");
  }

  const data = (await response.json()) as {
    success: boolean;
    message: string;
    phone: string;
    email: string;
  };

  return {
    success: Boolean(data.success),
    message: data.message || "Tumekutumia OTP kwenye simu yako.",
    phone: data.phone,
    email: data.email,
  };
};

export const verifyRegistrationOtp = async (payload: {
  email: string;
  phone: string;
  code: string;
}): Promise<VerifyOtpResult> => {
  const response = await request("/api/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await toAuthRequestError(response, "Imeshindikana kuthibitisha msimbo wa OTP.");
  }

  const data = (await response.json()) as (ApiUser & { welcome_message?: string; user?: ApiUser });
  const rawUser = (data.user || data) as ApiUser;
  return {
    user: toAuthUser(rawUser),
    welcomeMessage: data.welcome_message || "Hongera! Uthibitisho umekamilika.",
  };
};

export const resendRegistrationOtp = async (payload: {
  email?: string;
  phone?: string;
}): Promise<{ message: string; email?: string; phone?: string }> => {
  const response = await request("/api/auth/resend-otp/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await toAuthRequestError(response, "Imeshindikana kutuma OTP tena.");
  }

  const data = (await response.json()) as {
    message?: string;
    email?: string;
    phone?: string;
  };

  return {
    message: data.message || "OTP mpya imetumwa.",
    email: data.email,
    phone: data.phone,
  };
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<void> => {
  const response = await safeFetch(`${API_BASE_URL}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: payload.email.trim(), password: payload.password }),
  });

  if (!response.ok) {
    throw await toAuthRequestError(response, "Imeshindikana kuingia. Tafadhali jaribu tena.");
  }

  const data = (await response.json()) as TokenPair;
  setTokens(data);
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await request("/api/auth/me/");

  if (!response.ok) {
    throw await toAuthRequestError(response, "Imeshindikana kupata taarifa za mtumiaji.");
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
    throw await toAuthRequestError(response, "Imeshindikana kutuma link ya kubadili nenosiri.");
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
    throw await toAuthRequestError(response, "Imeshindikana kubadili nenosiri.");
  }
};
