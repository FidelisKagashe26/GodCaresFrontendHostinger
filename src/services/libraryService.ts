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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getLibraryItems = async (): Promise<LibraryItemApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/library/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata maktaba.");
  }
  return (await response.json()) as LibraryItemApi[];
};
