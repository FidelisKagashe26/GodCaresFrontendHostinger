export interface TeamMemberApi {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar_url: string;
  accent_color: string;
  sort_order: number;
  is_active: boolean;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const getTeamMembers = async (): Promise<TeamMemberApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/about/team/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata taarifa za viongozi.");
  }

  const payload = (await response.json()) as TeamMemberApi[];
  if (!Array.isArray(payload)) {
    return [];
  }

  return [...payload].sort((a, b) => {
    if ((a.sort_order || 0) !== (b.sort_order || 0)) {
      return (a.sort_order || 0) - (b.sort_order || 0);
    }
    return (a.id || 0) - (b.id || 0);
  });
};
