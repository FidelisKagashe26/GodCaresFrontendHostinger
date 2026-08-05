import { withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

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

const API_BASE_URL = getApiBaseUrl();

export const getMediaPlaylists = async (): Promise<MediaPlaylistApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/media/playlists/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata orodha za video.");
  }
  const payload = (await response.json()) as MediaPlaylistApi[];
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((playlist) => ({
    ...playlist,
    thumbnail: resolveApiAssetUrl(playlist.thumbnail, API_BASE_URL),
    videos: Array.isArray(playlist.videos)
      ? playlist.videos.map((video) => ({
          ...video,
          thumbnail: resolveApiAssetUrl(video.thumbnail, API_BASE_URL),
          embed_url: resolveApiAssetUrl(video.embed_url, API_BASE_URL),
        }))
      : [],
  }));
};


