import { withCachedResult } from "../core/cacheService";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

const toAbsoluteUrl = (value: string): string => {
  const raw = (value || "").trim();
  if (!raw) {
    return "";
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_BASE_URL}${normalized}`;
};

const safeFetch = async (url: string) => {
  try {
    return await fetch(url);
  } catch {
    throw new Error("Hakuna mawasiliano ya mtandao kwa sasa. Tafadhali angalia muunganisho wako wa mtandao kisha ujaribu tena.");
  }
};

export interface HistoryMomentApi {
  id: number;
  title: string;
  year_label: string;
  description: string;
  significance: string;
  image: string;
  tag: string;
  location: string;
  month: number;
  day: number;
  sort_order: number;
}

export interface EvidenceHighlightApi {
  id: number;
  title: string;
  evidence: string;
  did_you_know: string;
  hints: string[];
  image: string;
  year_label: string;
  location: string;
  sort_order: number;
}

export const getHistoryMoments = async (): Promise<HistoryMomentApi[]> => {
  return withCachedResult(
    "tool_history_moments_v1",
    async () => {
      const response = await safeFetch(`${API_BASE_URL}/api/tools/history/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata This Day in History.");
      }

      const payload = (await response.json()) as HistoryMomentApi[];
      if (!Array.isArray(payload)) {
        return [];
      }

      return payload.map((item) => ({
        ...item,
        image: toAbsoluteUrl(item.image || ""),
      }));
    },
    { ttlMs: 60 * 60 * 1000, persist: true },
  );
};

export const getEvidenceHighlights = async (): Promise<EvidenceHighlightApi[]> => {
  return withCachedResult(
    "tool_evidence_highlights_v1",
    async () => {
      const response = await safeFetch(`${API_BASE_URL}/api/tools/evidence-highlights/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata dondoo za ushahidi.");
      }

      const payload = (await response.json()) as EvidenceHighlightApi[];
      if (!Array.isArray(payload)) {
        return [];
      }

      return payload.map((item) => ({
        ...item,
        image: toAbsoluteUrl(item.image || ""),
        hints: Array.isArray(item.hints) ? item.hints.filter((hint) => typeof hint === "string" && hint.trim()) : [],
      }));
    },
    { ttlMs: 60 * 60 * 1000, persist: true },
  );
};

