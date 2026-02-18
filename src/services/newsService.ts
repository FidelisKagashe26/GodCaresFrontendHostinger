export interface NewsItemApi {
  id: number;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  author: string;
  featured: boolean;
  views?: number;
  published_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const getNewsItems = async (): Promise<NewsItemApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/news/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata habari.");
  }
  return (await response.json()) as NewsItemApi[];
};

export const registerNewsView = async (newsId: number): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/api/news/${newsId}/view/`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Imeshindikana kusasisha idadi ya wasomaji.");
  }

  const data = (await response.json()) as { views?: number };
  return Number(data.views || 0);
};

