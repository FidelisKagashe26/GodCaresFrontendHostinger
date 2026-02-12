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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const getJourneyModules = async (): Promise<JourneyModule[]> => {
  const response = await fetch(`${API_BASE_URL}/api/study/modules/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupakua moduli za safari.");
  }
  const payload = (await response.json()) as JourneyModule[];
  return Array.isArray(payload) ? payload : [];
};
