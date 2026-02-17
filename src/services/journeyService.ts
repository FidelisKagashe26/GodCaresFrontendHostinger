export interface JourneyLesson {
  id: number;
  code: string;
  title: string;
  swahili_title: string;
  focus: string;
  summary: string;
  content: string;
  hero_image: string;
  scripture: string;
  payload: Record<string, unknown>;
  sort_order: number;
}

export interface JourneyModule {
  id: number;
  code: string;
  title: string;
  swahili_title: string;
  description: string;
  component_key: 'foundations' | 'prophecy' | 'deception' | 'custom';
  lessons_count: number;
  kp_points: number;
  sort_order: number;
  lessons: JourneyLesson[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');

const readFriendlyError = async (response: Response, fallback: string) => {
  const payload = await response.json().catch(() => ({} as any));
  const detail = payload?.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }
  return fallback;
};

const safeFetch = async (url: string) => {
  try {
    return await fetch(url);
  } catch {
    throw new Error('Hakuna mawasiliano ya mtandao kwa sasa. Tafadhali angalia internet yako kisha ujaribu tena.');
  }
};

export const getJourneyModules = async (): Promise<JourneyModule[]> => {
  const response = await safeFetch(`${API_BASE_URL}/api/study/modules/`);

  if (!response.ok) {
    const message = await readFriendlyError(response, 'Imeshindikana kupakua moduli za darasa la Biblia.');
    throw new Error(message);
  }

  const payload = (await response.json()) as JourneyModule[];
  if (!Array.isArray(payload)) {
    return [];
  }

  return [...payload].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.id - b.id;
  });
};

export const getJourneyModuleLessons = async (moduleCode: string): Promise<JourneyLesson[]> => {
  const normalizedCode = (moduleCode || '').trim();
  if (!normalizedCode) {
    return [];
  }

  const response = await safeFetch(`${API_BASE_URL}/api/study/modules/${encodeURIComponent(normalizedCode)}/lessons/`);

  if (!response.ok) {
    const message = await readFriendlyError(response, 'Imeshindikana kupakua masomo ya moduli.');
    throw new Error(message);
  }

  const payload = (await response.json()) as JourneyLesson[];
  if (!Array.isArray(payload)) {
    return [];
  }

  return [...payload].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.id - b.id;
  });
};
