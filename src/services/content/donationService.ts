import { invalidateCachedResult, withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

export interface DonationProjectApi {
  id: number;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
}

const API_BASE_URL = getApiBaseUrl();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractApiErrorMessage = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = extractApiErrorMessage(item);
      if (message) {
        return message;
      }
    }
    return "";
  }

  if (isRecord(value)) {
    const preferredKeys = ["detail", "message", "error", "non_field_errors", "errors"];
    for (const key of preferredKeys) {
      if (key in value) {
        const message = extractApiErrorMessage(value[key]);
        if (message) {
          return message;
        }
      }
    }

    for (const item of Object.values(value)) {
      const message = extractApiErrorMessage(item);
      if (message) {
        return message;
      }
    }
  }

  return "";
};

export const getDonationProjects = async (): Promise<DonationProjectApi[]> => {
  return withCachedResult(
    "donation_projects_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/donations/projects/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata miradi.");
      }
      const payload = (await response.json()) as DonationProjectApi[];
      return payload.map((item) => ({
        ...item,
        image: resolveApiAssetUrl(item.image, API_BASE_URL),
      }));
    },
    { ttlMs: 5 * 60 * 1000, persist: true },
  );
};

export const submitDonation = async (payload: {
  project?: number | null;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  amount: number;
  payment_method: "mobile" | "card";
}): Promise<{
  detail: string;
  project_id?: number | null;
  new_raised?: number | null;
  payment_status?: string;
  provider_order_id?: string;
  requires_ussd_approval?: boolean;
}> => {
  const response = await fetch(`${API_BASE_URL}/api/donations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const rawError = await response.text().catch(() => "");
    let errorPayload: unknown = rawError;
    if (rawError) {
      try {
        errorPayload = JSON.parse(rawError);
      } catch {
        errorPayload = rawError;
      }
    }

    const errorMessage = extractApiErrorMessage(errorPayload);
    throw new Error(errorMessage || "Imeshindikana kutuma sadaka.");
  }

  const result = await response.json().catch(() => ({ detail: "Asante kwa sadaka yako." }));
  invalidateCachedResult("donation_projects_v1");
  return result;
};


