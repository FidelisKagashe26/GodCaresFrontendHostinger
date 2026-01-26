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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getMediaPlaylists = async (): Promise<MediaPlaylistApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/media/playlists/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata playlists.");
  }
  return (await response.json()) as MediaPlaylistApi[];
};
