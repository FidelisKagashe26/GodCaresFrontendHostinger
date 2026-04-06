import { withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

const API_BASE_URL = getApiBaseUrl();

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
        throw new Error("Imeshindikana kupata tukio la siku katika historia.");
      }

      const payload = (await response.json()) as HistoryMomentApi[];
      if (!Array.isArray(payload)) {
        return [];
      }

      return payload.map((item) => ({
        ...item,
        image: resolveApiAssetUrl(item.image || "", API_BASE_URL),
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
        image: resolveApiAssetUrl(item.image || "", API_BASE_URL),
        hints: Array.isArray(item.hints) ? item.hints.filter((hint) => typeof hint === "string" && hint.trim()) : [],
      }));
    },
    { ttlMs: 60 * 60 * 1000, persist: true },
  );
};

