import { withCachedResult } from "./cacheService";

export interface TimelineMilestoneApi {
  id: number;
  code: string;
  year_label: string;
  title: string;
  swahili_title: string;
  summary: string;
  category: "Past" | "Present" | "Future";
  image: string;
  verse: string;
  full_story: string;
  swahili_deep: string;
  did_you_know: string;
  evidence_id?: string;
  video_url?: string;
  sort_order: number;
}

export interface TimelineSectionApi {
  id: number;
  code: string;
  title: string;
  swahili_title: string;
  description: string;
  accent_color: string;
  icon_key: string;
  sort_order: number;
  milestones: TimelineMilestoneApi[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

const readFriendlyError = async (response: Response, fallback: string) => {
  const payload = await response.json().catch(() => ({} as { detail?: string }));
  const detail = payload?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }
  return fallback;
};

const safeFetch = async (url: string) => {
  try {
    return await fetch(url);
  } catch {
    throw new Error("Hakuna mawasiliano ya mtandao kwa sasa. Tafadhali angalia muunganisho wako wa mtandao kisha ujaribu tena.");
  }
};

const toAbsoluteUrl = (value: string) => {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed, `${API_BASE_URL}/`).toString();
  } catch {
    return trimmed;
  }
};

export const getTimelineSections = async (): Promise<TimelineSectionApi[]> => {
  return withCachedResult(
    "timeline_sections_v1",
    async () => {
      const response = await safeFetch(`${API_BASE_URL}/api/timelines/`);

      if (!response.ok) {
        const message = await readFriendlyError(response, "Imeshindikana kupakua timeline ya mfumo.");
        throw new Error(message);
      }

      const payload = (await response.json()) as TimelineSectionApi[];
      if (!Array.isArray(payload)) {
        return [];
      }

      return [...payload]
        .map((section) => ({
          ...section,
          milestones: Array.isArray(section.milestones)
            ? [...section.milestones]
                .map((milestone) => ({
                  ...milestone,
                  image: toAbsoluteUrl(milestone.image || ""),
                }))
                .sort((a, b) => {
                  if ((a.sort_order || 0) !== (b.sort_order || 0)) {
                    return (a.sort_order || 0) - (b.sort_order || 0);
                  }
                  return (a.id || 0) - (b.id || 0);
                })
            : [],
        }))
        .sort((a, b) => {
          if ((a.sort_order || 0) !== (b.sort_order || 0)) {
            return (a.sort_order || 0) - (b.sort_order || 0);
          }
          return (a.id || 0) - (b.id || 0);
        });
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );
};
