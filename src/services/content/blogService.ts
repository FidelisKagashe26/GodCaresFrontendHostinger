import { invalidateCachedResult, invalidateCachedResultsByPrefix, withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

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

export const BLOG_API_BASE_URL = getApiBaseUrl();
const API_BASE_URL = BLOG_API_BASE_URL;
const CLIENT_ID_KEY = "gc365_blog_client_id";
const ACCESS_TOKEN_KEY = "gc365_access_token";

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
  image: resolveApiAssetUrl(item.image, API_BASE_URL),
  author_image: resolveApiAssetUrl(item.author_image, API_BASE_URL),
  share_url: resolveApiAssetUrl(item.share_url, API_BASE_URL),
  liked: !!item.liked,
});

export interface BlogPostPage {
  posts: BlogPostApi[];
  count: number;
  page: number;
  numPages: number;
}

export const BLOG_PAGE_SIZE = 10;

/**
 * Fetches one page of posts. Searching and paging happen on the server, so the
 * browser never has to hold the whole archive to filter it.
 * Only unsearched pages are cached; search results would pollute the cache.
 */
export const getBlogPosts = async (
  options: { page?: number; query?: string } = {},
): Promise<BlogPostPage> => {
  const clientId = getClientId();
  const page = Math.max(1, options.page || 1);
  const query = (options.query || "").trim();

  const load = async (): Promise<BlogPostPage> => {
    const params = new URLSearchParams({
      client_id: clientId,
      page: String(page),
      page_size: String(BLOG_PAGE_SIZE),
    });
    if (query) {
      params.set("q", query);
    }
    const response = await fetch(`${API_BASE_URL}/api/blog/?${params.toString()}`, {
      headers: { "X-Client-Id": clientId },
    });
    if (!response.ok) {
      throw new Error("Imeshindikana kupata makala.");
    }
    const payload = (await response.json()) as {
      results?: BlogPostApi[];
      count?: number;
      page?: number;
      num_pages?: number;
    };
    const results = Array.isArray(payload.results) ? payload.results : [];
    return {
      posts: results.map(normalizePost),
      count: payload.count ?? results.length,
      page: payload.page ?? page,
      numPages: payload.num_pages ?? 1,
    };
  };

  if (query) {
    return load();
  }
  return withCachedResult(`blog_posts_v3_${clientId}_p${page}`, load, {
    ttlMs: 5 * 60 * 1000,
    persist: true,
  });
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
    throw new Error("Imeshindikana kusasisha kupenda.");
  }
  invalidateCachedResultsByPrefix(`blog_posts_v3_${clientId}`);
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
    throw new Error("Imeshindikana kupata maoni.");
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
    let message = "Imeshindikana kutuma maoni.";
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

  invalidateCachedResultsByPrefix(`blog_posts_v3_${clientId}`);
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


