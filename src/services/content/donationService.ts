import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

export interface DonationProjectApi {
  id: number;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
}

export interface DonationStatusApi {
  detail: string;
  donation_id?: number;
  payment_status?: string;
  provider_order_id?: string;
  is_final?: boolean;
}

const API_BASE_URL = getApiBaseUrl();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractApiErrorMessage = (value: unknown): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    const looksLikeHtml = /^<!doctype html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed);
    if (looksLikeHtml) {
      return "";
    }
    return trimmed;
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
  const response = await fetch(`${API_BASE_URL}/api/donations/projects/`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Imeshindikana kupata miradi.");
  }
  const payload = (await response.json()) as DonationProjectApi[];
  return payload.map((item) => ({
    ...item,
    image: resolveApiAssetUrl(item.image, API_BASE_URL),
  }));
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
  requires_manual_payment?: boolean;
  card_payment_label?: string;
  card_payment_number?: string;
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
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    if (response.status >= 500) {
      throw new Error("Huduma ya malipo ina hitilafu kwa sasa. Tafadhali jaribu tena baada ya muda mfupi.");
    }
    throw new Error("Imeshindikana kutuma sadaka.");
  }

  const result = await response.json().catch(() => ({ detail: "Asante kwa sadaka yako." }));
  return result;
};

export const getDonationStatus = async (providerOrderId: string): Promise<DonationStatusApi> => {
  const orderId = (providerOrderId || "").trim();
  if (!orderId) {
    throw new Error("order_id inahitajika.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/donations/status/?order_id=${encodeURIComponent(orderId)}`,
    { cache: "no-store" },
  );

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
    throw new Error(errorMessage || "Imeshindikana kupata hali ya malipo.");
  }

  return (await response.json()) as DonationStatusApi;
};

