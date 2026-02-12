export interface DonationProjectApi {
  id: number;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const getDonationProjects = async (): Promise<DonationProjectApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/donations/projects/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata miradi.");
  }
  return (await response.json()) as DonationProjectApi[];
};

export const submitDonation = async (payload: {
  project?: number | null;
  donor_name?: string;
  donor_email?: string;
  amount: number;
  payment_method: "mobile" | "card";
}) => {
  const response = await fetch(`${API_BASE_URL}/api/donations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kutuma sadaka.");
  }

  return response.json().catch(() => ({}));
};

