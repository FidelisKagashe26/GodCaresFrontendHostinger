export interface SystemMessage {
  id: number;
  title: string;
  body: string;
  level: "info" | "warning" | "success";
  created_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const getSystemMessages = async (): Promise<SystemMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/api/messages/`);

  if (!response.ok) {
    throw new Error("Imeshindikana kupata ujumbe.");
  }

  return (await response.json()) as SystemMessage[];
};

