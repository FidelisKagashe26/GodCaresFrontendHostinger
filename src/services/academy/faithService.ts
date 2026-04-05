import { withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

export interface FaithHeroApi {
  id: number;
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

export const getFaithHeroes = async (): Promise<FaithHeroApi[]> => {
  return withCachedResult(
    "faith_heroes_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/faith/heroes/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata mashujaa wa imani.");
      }
      const payload = (await response.json()) as FaithHeroApi[];
      if (!Array.isArray(payload)) {
        return [];
      }
      return payload.map((item) => ({
        ...item,
        image: resolveApiAssetUrl(item.image, API_BASE_URL),
        video_url: resolveApiAssetUrl(item.video_url, API_BASE_URL),
      }));
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );
};


