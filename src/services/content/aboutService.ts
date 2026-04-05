import { withCachedResult } from "../core/cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "../core/urlService";

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

const API_BASE_URL = getApiBaseUrl();

export const getTeamMembers = async (): Promise<TeamMemberApi[]> => {
  return withCachedResult(
    "about_team_members_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/about/team/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata taarifa za viongozi.");
      }

      const payload = (await response.json()) as TeamMemberApi[];
      if (!Array.isArray(payload)) {
        return [];
      }

      return payload
        .map((item) => ({
          ...item,
          avatar_url: resolveApiAssetUrl(item.avatar_url, API_BASE_URL),
        }))
        .sort((a, b) => {
        if ((a.sort_order || 0) !== (b.sort_order || 0)) {
          return (a.sort_order || 0) - (b.sort_order || 0);
        }
        return (a.id || 0) - (b.id || 0);
        });
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );
};

