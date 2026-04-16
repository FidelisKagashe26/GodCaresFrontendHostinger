import { withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

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

const API_BASE_URL = getApiBaseUrl();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const sanitizeMilestone = (value: unknown): TimelineMilestoneApi | null => {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: toNumber(value.id),
    code: toStringValue(value.code),
    year_label: toStringValue(value.year_label),
    title: toStringValue(value.title),
    swahili_title: toStringValue(value.swahili_title),
    summary: toStringValue(value.summary),
    category:
      value.category === "Past" || value.category === "Present" || value.category === "Future"
        ? value.category
        : "Past",
    image: resolveApiAssetUrl(toStringValue(value.image), API_BASE_URL),
    verse: toStringValue(value.verse),
    full_story: toStringValue(value.full_story),
    swahili_deep: toStringValue(value.swahili_deep),
    did_you_know: toStringValue(value.did_you_know),
    evidence_id: toStringValue(value.evidence_id),
    video_url: toStringValue(value.video_url),
    sort_order: toNumber(value.sort_order),
  };
};

const sanitizeSections = (payload: unknown): TimelineSectionApi[] => {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((section) => {
      if (!isRecord(section)) {
        return null;
      }

      const milestones = Array.isArray(section.milestones)
        ? section.milestones
            .map((milestone) => sanitizeMilestone(milestone))
            .filter((milestone): milestone is TimelineMilestoneApi => Boolean(milestone))
            .sort((a, b) => {
              if ((a.sort_order || 0) !== (b.sort_order || 0)) {
                return (a.sort_order || 0) - (b.sort_order || 0);
              }
              return (a.id || 0) - (b.id || 0);
            })
        : [];

      return {
        id: toNumber(section.id),
        code: toStringValue(section.code),
        title: toStringValue(section.title),
        swahili_title: toStringValue(section.swahili_title),
        description: toStringValue(section.description),
        accent_color: toStringValue(section.accent_color),
        icon_key: toStringValue(section.icon_key),
        sort_order: toNumber(section.sort_order),
        milestones,
      };
    })
    .filter((section): section is TimelineSectionApi => Boolean(section))
    .sort((a, b) => {
      if ((a.sort_order || 0) !== (b.sort_order || 0)) {
        return (a.sort_order || 0) - (b.sort_order || 0);
      }
      return (a.id || 0) - (b.id || 0);
    });
};

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

export const getTimelineSections = async (): Promise<TimelineSectionApi[]> => {
  const result = await withCachedResult(
    "timeline_sections_v1",
    async () => {
      const response = await safeFetch(`${API_BASE_URL}/api/timelines/`);

      if (!response.ok) {
        const message = await readFriendlyError(response, "Imeshindikana kupakua timeline ya mfumo.");
        throw new Error(message);
      }

      const payload = (await response.json()) as unknown;
      return sanitizeSections(payload);
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );

  // Defensive sanitize for stale cache fallback values returned by withCachedResult.
  return sanitizeSections(result);
};

