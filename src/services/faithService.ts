export interface FaithHeroApi {
  id: number;
  name: string;
  title: string;
  challenge: string;
  faith_action: string;
  swahili_quote: string;
  verse: string;
  image: string;
  story: string;
  lesson: string;
  period: 'Agano la Kale' | 'Agano Jipya' | 'Wafia Dini';
  category: 'Wapiganaji' | 'Wanawake' | 'Manabii';
  video_url: string;
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

export const getFaithHeroes = async (): Promise<FaithHeroApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/faith/heroes/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata mashujaa wa imani.");
  }
  const payload = (await response.json()) as FaithHeroApi[];
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((item) => ({
    ...item,
    image: toAbsoluteUrl(item.image),
    video_url: toAbsoluteUrl(item.video_url),
  }));
};

