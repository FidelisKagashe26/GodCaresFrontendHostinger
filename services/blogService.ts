export interface BlogPostApi {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image: string;
  tags: string[];
  read_time: string;
  likes: number;
  comments: number;
  published_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getBlogPosts = async (): Promise<BlogPostApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/blog/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata makala.");
  }
  return (await response.json()) as BlogPostApi[];
};

export const getBlogPost = async (id: number): Promise<BlogPostApi> => {
  const response = await fetch(`${API_BASE_URL}/api/blog/${id}/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata makala.");
  }
  return (await response.json()) as BlogPostApi;
};
