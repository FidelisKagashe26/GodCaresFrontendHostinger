export interface SystemMessage {
  id: number;
  title: string;
  body: string;
  level: "info" | "warning" | "success";
  target_audience?: "all" | "stage" | "users";
  target_stage?: string;
  target_emails?: string;
  created_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const getSystemMessages = async (params?: {
  stage?: string;
  userEmail?: string;
}): Promise<SystemMessage[]> => {
  const search = new URLSearchParams();
  if (params?.stage) {
    search.set("stage", params.stage);
  }
  if (params?.userEmail) {
    search.set("user_email", params.userEmail);
  }

  const query = search.toString();
  const url = `${API_BASE_URL}/api/messages/${query ? `?${query}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Imeshindikana kupata ujumbe.");
  }

  return (await response.json()) as SystemMessage[];
};

