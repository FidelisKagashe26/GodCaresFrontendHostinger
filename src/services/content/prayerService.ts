import { invalidateCachedResult, withCachedResult } from "../core/cacheService";

export interface PrayerRequestPublic {
  id: number;
  name: string;
  category: string;
  request: string;
  praying_count: number;
  created_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const getPublicPrayers = async (): Promise<PrayerRequestPublic[]> => {
  return withCachedResult(
    "prayers_public_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/prayers/public/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata maombi.");
      }
      return (await response.json()) as PrayerRequestPublic[];
    },
    { ttlMs: 60 * 1000, persist: false },
  );
};

export const getAnsweredPrayers = async (): Promise<PrayerRequestPublic[]> => {
  return withCachedResult(
    "prayers_answered_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/prayers/answered/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata shuhuda za maombi.");
      }
      return (await response.json()) as PrayerRequestPublic[];
    },
    { ttlMs: 60 * 1000, persist: false },
  );
};

export const submitPrayer = async (payload: {
  name?: string;
  email?: string;
  category?: string;
  request: string;
  is_public: boolean;
}): Promise<PrayerRequestPublic> => {
  const response = await fetch(`${API_BASE_URL}/api/prayers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kutuma ombi.");
  }

  const result = (await response.json()) as PrayerRequestPublic;
  invalidateCachedResult("prayers_public_v1");
  return result;
};


