import { withCachedResult } from "./cacheService";

export interface BlogPostApi {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  author_image?: string;
  image: string;
  tags: string[];
  read_time: string;
  likes: number;
  comments: number;
  published_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

const toAbsoluteUrl = (value?: string | null): string => {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
};

export const getBlogPosts = async (): Promise<BlogPostApi[]> => {
  return withCachedResult(
    "blog_posts_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata makala.");
      }
      const payload = (await response.json()) as BlogPostApi[];
      return payload.map((item) => ({
        ...item,
        image: toAbsoluteUrl(item.image),
        author_image: toAbsoluteUrl(item.author_image),
      }));
    },
    { ttlMs: 5 * 60 * 1000, persist: true },
  );
};

export const getBlogPost = async (id: number): Promise<BlogPostApi> => {
  return withCachedResult(
    `blog_post_${id}_v1`,
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/${id}/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata makala.");
      }
      const item = (await response.json()) as BlogPostApi;
      return {
        ...item,
        image: toAbsoluteUrl(item.image),
        author_image: toAbsoluteUrl(item.author_image),
      };
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );
};

