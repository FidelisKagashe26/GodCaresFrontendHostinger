import { invalidateCachedResult, withCachedResult } from "../core/cacheService";

export interface EventResource {
  name: string;
  type: "PDF" | "Video" | "Link";
  url: string;
}

export interface Speaker {
  name: string;
  role: string;
  img: string;
  bio?: string;
}

export interface EventApi {
  id: number;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  location: string;
  image: string;
  description: string;
  event_type: "Virtual" | "Physical";
  category: "Seminar" | "Summit" | "Revival";
  attendees: number;
  max_attendees: number;
  speakers: Speaker[];
  resources: EventResource[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

const toAbsoluteUrl = (value?: string | null): string => {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? raw : `/${raw}`}`;
};

export const getEvents = async (): Promise<EventApi[]> => {
  return withCachedResult(
    "events_list_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/events/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata matukio.");
      }
      const payload = (await response.json()) as EventApi[];
      return payload.map((item) => ({
        ...item,
        image: toAbsoluteUrl(item.image),
        speakers: (item.speakers || []).map((speaker) => ({
          ...speaker,
          img: toAbsoluteUrl(speaker.img),
        })),
      }));
    },
    { ttlMs: 3 * 60 * 1000, persist: true },
  );
};

export const registerForEvent = async (eventId: number, payload: { name: string; email: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kusajili.");
  }

  const result = await response.json().catch(() => ({}));
  invalidateCachedResult("events_list_v1");
  return result;
};


