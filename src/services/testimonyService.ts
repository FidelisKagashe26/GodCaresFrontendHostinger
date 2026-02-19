export interface TestimonyApi {
  id: number;
  name: string;
  location: string;
  story: string;
  verified: boolean;
  stars: number;
  testimony_type: "text" | "video";
  profile_image?: string;
  thumbnail?: string;
  video_url?: string;
  category: "Miracle" | "Conversion" | "Healing";
  reactions: { amen: number; praise: number; love: number };
  created_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

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
  profile_image_upload?: File;
  thumbnail_upload?: File;
}): Promise<TestimonyApi> => {
  const hasFileUpload = Boolean(payload.profile_image_upload || payload.thumbnail_upload);
  const url = `${API_BASE_URL}/api/testimonies/`;

  let response: Response;
  if (hasFileUpload) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("location", payload.location);
    formData.append("story", payload.story);
    formData.append("testimony_type", payload.testimony_type);
    formData.append("category", payload.category);
    if (payload.video_url) {
      formData.append("video_url", payload.video_url);
    }
    if (payload.profile_image_upload) {
      formData.append("profile_image_upload", payload.profile_image_upload);
    }
    if (payload.thumbnail_upload) {
      formData.append("thumbnail_upload", payload.thumbnail_upload);
    }

    response = await fetch(url, {
      method: "POST",
      body: formData,
    });
  } else {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kutuma shuhuda.");
  }

  return (await response.json()) as TestimonyApi;
};

export const reactToTestimony = async (
  testimonyId: number,
  reaction: "amen" | "praise" | "love",
): Promise<{ id: number; reactions: { amen: number; praise: number; love: number } }> => {
  const response = await fetch(`${API_BASE_URL}/api/testimonies/${testimonyId}/react/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reaction }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kusasisha reaction.");
  }

  return (await response.json()) as { id: number; reactions: { amen: number; praise: number; love: number } };
};

