import { withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

export type LibraryItemType = "PDF" | "Audio" | "Video" | "Image";

export interface LibraryItemApi {
  id: number;
  type: LibraryItemType;
  title: string;
  swahili_title: string;
  description: string;
  size_or_duration: string;
  image: string;
  category: string;
  content_url: string;
  album_name: string;
  created_at: string;
}

const API_BASE_URL = getApiBaseUrl();

export const getLibraryItems = async (): Promise<LibraryItemApi[]> => {
  return withCachedResult(
    "library_items_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/library/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata maktaba.");
      }
      const payload = (await response.json()) as LibraryItemApi[];
      if (!Array.isArray(payload)) {
        return [];
      }
      return payload.map((item) => ({
        ...item,
        image: resolveApiAssetUrl(item.image, API_BASE_URL),
        content_url: resolveApiAssetUrl(item.content_url, API_BASE_URL),
      }));
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );
};


