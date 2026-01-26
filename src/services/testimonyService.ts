export interface TestimonyApi {
  id: number;
  name: string;
  location: string;
  story: string;
  verified: boolean;
  stars: number;
  testimony_type: "text" | "video";
  thumbnail?: string;
  video_url?: string;
  category: "Miracle" | "Conversion" | "Healing";
  reactions: { amen: number; praise: number; love: number };
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getTestimonies = async (): Promise<TestimonyApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/testimonies/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata shuhuda.");
  }
  return (await response.json()) as TestimonyApi[];
};

export const submitTestimony = async (payload: {
  name: string;
  location: string;
  story: string;
  testimony_type: "text" | "video";
  video_url?: string;
  category: "Miracle" | "Conversion" | "Healing";
}): Promise<TestimonyApi> => {
  const response = await fetch(`${API_BASE_URL}/api/testimonies/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kutuma shuhuda.");
  }

  return (await response.json()) as TestimonyApi;
};
