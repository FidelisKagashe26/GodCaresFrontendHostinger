import { withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

export interface FaithHeroApi {
  id: number;
  share_key?: string;
  share_url?: string;
  name: string;
  title: string;
  challenge: string;
  faith_action: string;
  swahili_quote: string;
  verse: string;
  image: string;
  story: string;
  lesson: string;
  period: 'Agano la Kale' | 'Agano Jipya' | 'Wafia Dini';
  category: 'Wapiganaji' | 'Wanawake' | 'Manabii';
  video_url: string;
}

const API_BASE_URL = getApiBaseUrl();

const normalizeFaithHero = (item: FaithHeroApi): FaithHeroApi => ({
  ...item,
  image: resolveApiAssetUrl(item.image, API_BASE_URL),
  video_url: resolveApiAssetUrl(item.video_url, API_BASE_URL),
  share_url: resolveApiAssetUrl(item.share_url, API_BASE_URL),
});

export const getFaithHeroes = async (): Promise<FaithHeroApi[]> => {
  return withCachedResult(
    "faith_heroes_v2",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/faith/heroes/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata mashujaa wa imani.");
      }
      const payload = (await response.json()) as FaithHeroApi[];
      if (!Array.isArray(payload)) {
        return [];
      }
      return payload.map(normalizeFaithHero);
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );
};

export const getFaithHeroSharePageUrl = (shareKey?: string, heroId?: number): string => {
  const token = (shareKey || "").trim();
  if (token) {
    return `${API_BASE_URL}/api/share/faith/${encodeURIComponent(token)}/`;
  }
  if (heroId && Number.isInteger(heroId) && heroId > 0) {
    return `${API_BASE_URL}/api/share/faith/${heroId}/`;
  }
  return `${API_BASE_URL}/faith-builder`;
};


