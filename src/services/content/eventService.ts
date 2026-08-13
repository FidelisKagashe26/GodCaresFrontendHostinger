import { invalidateCachedResult, withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

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

export interface EventRegisterResponse {
  detail: string;
  created?: boolean;
  event?: EventApi;
}

const API_BASE_URL = getApiBaseUrl();

const normalizeEventPayload = (item: EventApi): EventApi => ({
  ...item,
  image: resolveApiAssetUrl(item.image, API_BASE_URL),
  speakers: (item.speakers || []).map((speaker) => ({
    ...speaker,
    img: resolveApiAssetUrl(speaker.img, API_BASE_URL),
  })),
  resources: (item.resources || []).map((resource) => ({
    ...resource,
    url: resolveApiAssetUrl(resource.url || "", API_BASE_URL),
  })),
});

export const getEvents = async (search?: string): Promise<EventApi[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return withCachedResult(
    `events_list_v1_${search || 'all'}`,
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/events/${query}`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata matukio.");
      }
      const payload = (await response.json()) as EventApi[];
      return payload.map(normalizeEventPayload);
    },
    { ttlMs: 3 * 60 * 1000, persist: true },
  );
};

export const registerForEvent = async (
  eventId: number,
  payload: { name: string; email: string; phone?: string },
): Promise<EventRegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kusajili.");
  }

  const result = (await response.json().catch(() => ({}))) as EventRegisterResponse;
  invalidateCachedResult("events_list_v1");
  return {
    ...result,
    event: result.event ? normalizeEventPayload(result.event) : undefined,
  };
};


