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

export const getLibraryItems = async (): Promise<LibraryItemApi[]> => {
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
    image: toAbsoluteUrl(item.image),
    content_url: toAbsoluteUrl(item.content_url),
  }));
};

