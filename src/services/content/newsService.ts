import { invalidateCachedResult, withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

export interface NewsItemApi {
  id: number;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  author: string;
  author_image?: string;
  featured: boolean;
  views?: number;
  published_at: string;
}

const API_BASE_URL = getApiBaseUrl();

export const getNewsItems = async (): Promise<NewsItemApi[]> => {
  return withCachedResult(
    "news_items_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/news/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata habari.");
      }
      const payload = (await response.json()) as NewsItemApi[];
      return payload.map((item) => ({
        ...item,
        image: resolveApiAssetUrl(item.image, API_BASE_URL),
        author_image: resolveApiAssetUrl(item.author_image, API_BASE_URL),
      }));
    },
    { ttlMs: 3 * 60 * 1000, persist: true },
  );
};

export const registerNewsView = async (newsId: number): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/api/news/${newsId}/view/`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Imeshindikana kusasisha idadi ya wasomaji.");
  }

  const data = (await response.json()) as { views?: number };
  invalidateCachedResult("news_items_v1");
  return Number(data.views || 0);
};


