export interface NewsItemApi {
  id: number;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  author: string;
  featured: boolean;
  published_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getNewsItems = async (): Promise<NewsItemApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/news/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata habari.");
  }
  return (await response.json()) as NewsItemApi[];
};
