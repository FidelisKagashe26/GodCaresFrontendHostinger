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

export interface NewsViewResponse {
  id: number;
  views: number;
  item?: NewsItemApi;
}

const API_BASE_URL = getApiBaseUrl();

const normalizeNewsPayload = (item: NewsItemApi): NewsItemApi => ({
  ...item,
  title: String(item.title || "").trim(),
  category: String(item.category || "Habari").trim() || "Habari",
  image: resolveApiAssetUrl(item.image, API_BASE_URL),
  excerpt: String(item.excerpt || ""),
  content: String(item.content || ""),
  author: String(item.author || "Admin").trim() || "Admin",
  author_image: resolveApiAssetUrl(item.author_image || "", API_BASE_URL),
  featured: Boolean(item.featured),
  views: Number(item.views || 0),
  published_at: String(item.published_at || ""),
});

export const getNewsItems = async (): Promise<NewsItemApi[]> => {
  return withCachedResult(
    "news_items_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/news/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata habari.");
      }
      const payload = (await response.json()) as NewsItemApi[];
      return payload.map(normalizeNewsPayload);
    },
    { ttlMs: 3 * 60 * 1000, persist: true },
  );
};

export const registerNewsView = async (newsId: number): Promise<NewsViewResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/news/${newsId}/view/`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Imeshindikana kusasisha idadi ya wasomaji.");
  }

  const data = (await response.json()) as { id?: number; views?: number; item?: NewsItemApi };
  invalidateCachedResult("news_items_v1");
  return {
    id: Number(data.id || newsId),
    views: Number(data.views || 0),
    item: data.item ? normalizeNewsPayload(data.item) : undefined,
  };
};


