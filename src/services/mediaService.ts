export interface MediaVideoApi {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  posted_at: string;
  embed_url: string;
}

export interface MediaPlaylistApi {
  id: number;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  video_count: number;
  videos: MediaVideoApi[];
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

export const getMediaPlaylists = async (): Promise<MediaPlaylistApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/media/playlists/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata playlists.");
  }
  const payload = (await response.json()) as MediaPlaylistApi[];
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((playlist) => ({
    ...playlist,
    thumbnail: toAbsoluteUrl(playlist.thumbnail),
    videos: Array.isArray(playlist.videos)
      ? playlist.videos.map((video) => ({
          ...video,
          thumbnail: toAbsoluteUrl(video.thumbnail),
          embed_url: toAbsoluteUrl(video.embed_url),
        }))
      : [],
  }));
};

