import { invalidateCachedResult, withCachedResult } from "../core/cacheService";

export interface BlogPostApi {
  id: number;
  share_key?: string;
  share_url?: string;
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
  liked?: boolean;
  published_at: string;
}

export interface BlogLikeApi {
  id: number;
  likes: number;
  liked: boolean;
}

export interface BlogCommentApi {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

export const BLOG_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");
const API_BASE_URL = BLOG_API_BASE_URL;
const CLIENT_ID_KEY = "gc365_blog_client_id";
const ACCESS_TOKEN_KEY = "gc365_access_token";

const toAbsoluteUrl = (value?: string | null): string => {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
};

const getClientId = (): string => {
  if (typeof window === "undefined") {
    return "server";
  }

  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing && existing.trim()) {
    return existing.trim();
  }

  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(CLIENT_ID_KEY, generated);
  return generated;
};

const getRequestHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Client-Id": getClientId(),
  };
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

const normalizePost = (item: BlogPostApi): BlogPostApi => ({
  ...item,
  image: toAbsoluteUrl(item.image),
  author_image: toAbsoluteUrl(item.author_image),
  share_url: toAbsoluteUrl(item.share_url),
  liked: !!item.liked,
});

export const getBlogPosts = async (): Promise<BlogPostApi[]> => {
  const clientId = getClientId();
  return withCachedResult(
    `blog_posts_v2_${clientId}`,
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/?client_id=${encodeURIComponent(clientId)}`, {
        headers: {
          "X-Client-Id": clientId,
        },
      });
      if (!response.ok) {
        throw new Error("Imeshindikana kupata makala.");
      }
      const payload = (await response.json()) as BlogPostApi[];
      return payload.map(normalizePost);
    },
    { ttlMs: 5 * 60 * 1000, persist: true },
  );
};

export const getBlogPost = async (id: number): Promise<BlogPostApi> => {
  const clientId = getClientId();
  return withCachedResult(
    `blog_post_${id}_v2_${clientId}`,
    async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/blog/${id}/?client_id=${encodeURIComponent(clientId)}`,
        {
          headers: {
            "X-Client-Id": clientId,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Imeshindikana kupata makala.");
      }
      const item = (await response.json()) as BlogPostApi;
      return normalizePost(item);
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );
};

export const toggleBlogLike = async (postId: number): Promise<BlogLikeApi> => {
  const clientId = getClientId();
  const response = await fetch(`${API_BASE_URL}/api/blog/${postId}/like/`, {
    method: "POST",
    headers: getRequestHeaders(),
    body: JSON.stringify({ client_id: clientId }),
  });
  if (!response.ok) {
    throw new Error("Imeshindikana kusasisha like.");
  }
  invalidateCachedResult(`blog_posts_v2_${clientId}`);
  invalidateCachedResult(`blog_post_${postId}_v2_${clientId}`);
  return (await response.json()) as BlogLikeApi;
};

export const getBlogComments = async (postId: number): Promise<BlogCommentApi[]> => {
  const clientId = getClientId();
  const response = await fetch(
    `${API_BASE_URL}/api/blog/${postId}/comments/?client_id=${encodeURIComponent(clientId)}`,
    {
      headers: {
        "X-Client-Id": clientId,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Imeshindikana kupata comments.");
  }
  return (await response.json()) as BlogCommentApi[];
};

export const createBlogComment = async (
  postId: number,
  payload: { author_name?: string; content: string },
): Promise<BlogCommentApi> => {
  const clientId = getClientId();
  const response = await fetch(`${API_BASE_URL}/api/blog/${postId}/comments/`, {
    method: "POST",
    headers: getRequestHeaders(),
    body: JSON.stringify({
      ...payload,
      client_id: clientId,
    }),
  });
  if (!response.ok) {
    let message = "Imeshindikana kutuma comment.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (typeof body?.detail === "string" && body.detail.trim()) {
        message = body.detail.trim();
      }
    } catch {
      // Ignore JSON parsing issues and use fallback message.
    }
    throw new Error(message);
  }

  invalidateCachedResult(`blog_posts_v2_${clientId}`);
  invalidateCachedResult(`blog_post_${postId}_v2_${clientId}`);
  return (await response.json()) as BlogCommentApi;
};

export const getBlogSharePageUrl = (shareKey?: string, postId?: number): string => {
  const token = (shareKey || "").trim();
  if (token) {
    return `${API_BASE_URL}/api/share/blog/${encodeURIComponent(token)}/`;
  }
  if (postId && Number.isInteger(postId) && postId > 0) {
    return `${API_BASE_URL}/api/share/blog/${postId}/`;
  }
  return `${API_BASE_URL}/blog`;
};


