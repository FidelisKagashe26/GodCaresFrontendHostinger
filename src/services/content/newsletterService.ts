const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const subscribeNewsletter = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/api/newsletter/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kujiunga.");
  }

  return response.json().catch(() => ({}));
};

