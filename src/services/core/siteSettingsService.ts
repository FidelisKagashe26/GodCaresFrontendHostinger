import { withCachedResult } from "./cacheService";
import { getApiBaseUrl, resolveApiAssetUrl } from "./urlService";

const API_BASE_URL = getApiBaseUrl();

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  home_truth_story_1_image: string;
  home_truth_story_2_image: string;
  home_truth_story_3_image: string;
  home_deception_story_1_image: string;
  home_deception_story_2_image: string;
  home_deception_story_3_image: string;
  home_hope_story_1_image: string;
  home_hope_story_2_image: string;
  contact_phone: string;
  contact_email: string;
  support_email: string;
  donation_card_label: string;
  donation_card_number: string;
  facebook_url: string;
  x_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  whatsapp_url: string;
  website_main_url: string;
  website_kids_url: string;
  website_outreach_url: string;
  dashboard_hero_1_title: string;
  dashboard_hero_1_subtitle: string;
  dashboard_hero_1_image: string;
  dashboard_hero_2_title: string;
  dashboard_hero_2_subtitle: string;
  dashboard_hero_2_image: string;
  dashboard_hero_3_title: string;
  dashboard_hero_3_subtitle: string;
  dashboard_hero_3_image: string;
  prayers_hero_image: string;
  history_hero_image: string;
  evidence_hero_image: string;
  prophecy_hero_image_1: string;
  prophecy_hero_image_2: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "God Cares 365",
  site_tagline: "Hope / Prayer / Scripture",
  logo_url: "",
  home_truth_story_1_image: "",
  home_truth_story_2_image: "",
  home_truth_story_3_image: "",
  home_deception_story_1_image: "",
  home_deception_story_2_image: "",
  home_deception_story_3_image: "",
  home_hope_story_1_image: "",
  home_hope_story_2_image: "",
  contact_phone: "+255 744 780 244",
  contact_email: "fathercares365@gmail.com",
  support_email: "support@godcares365.org",
  donation_card_label: "",
  donation_card_number: "",
  facebook_url: "",
  x_url: "https://x.com/Godcares365",
  instagram_url: "https://www.instagram.com/god_cares365?igsh=MXdmdmJ4b3c5OTdlYQ==",
  tiktok_url: "https://vm.tiktok.com/ZMHEoAMgBnUD3-hkUHg/",
  youtube_url: "https://www.youtube.com/@GodCares365",
  whatsapp_url: "https://whatsapp.com/channel/0029VaJmiMu3WHTb3achqE1o",
  website_main_url: "https://godcares365.org/pambano-kuu",
  website_kids_url: "https://kids.godcares365.org",
  website_outreach_url: "https://outreach.godcares365.org",
  dashboard_hero_1_title: "Mungu Anakujali",
  dashboard_hero_1_subtitle: "Gundua jinsi Kristo anavyotuombea katika patakatifu pa mbinguni.",
  dashboard_hero_1_image: "",
  dashboard_hero_2_title: "Misingi ya Ukweli",
  dashboard_hero_2_subtitle: "Zifahamu amri kumi kama kioo cha upendo wa Mungu kwa mwanadamu.",
  dashboard_hero_2_image: "",
  dashboard_hero_3_title: "Saa ya Hukumu",
  dashboard_hero_3_subtitle: "Matumaini yapo katika ujumbe wa malaika watatu. Jiandae kwa marejeo ya Yesu.",
  dashboard_hero_3_image: "",
  prayers_hero_image: "",
  history_hero_image: "",
  evidence_hero_image: "",
  prophecy_hero_image_1: "",
  prophecy_hero_image_2: "",
};

const normalizeSettings = (input: Partial<SiteSettings>): SiteSettings => ({
  ...DEFAULT_SITE_SETTINGS,
  ...input,
  logo_url: resolveApiAssetUrl((input.logo_url || "").trim(), API_BASE_URL),
  home_truth_story_1_image: resolveApiAssetUrl((input.home_truth_story_1_image || "").trim(), API_BASE_URL),
  home_truth_story_2_image: resolveApiAssetUrl((input.home_truth_story_2_image || "").trim(), API_BASE_URL),
  home_truth_story_3_image: resolveApiAssetUrl((input.home_truth_story_3_image || "").trim(), API_BASE_URL),
  home_deception_story_1_image: resolveApiAssetUrl((input.home_deception_story_1_image || "").trim(), API_BASE_URL),
  home_deception_story_2_image: resolveApiAssetUrl((input.home_deception_story_2_image || "").trim(), API_BASE_URL),
  home_deception_story_3_image: resolveApiAssetUrl((input.home_deception_story_3_image || "").trim(), API_BASE_URL),
  home_hope_story_1_image: resolveApiAssetUrl((input.home_hope_story_1_image || "").trim(), API_BASE_URL),
  home_hope_story_2_image: resolveApiAssetUrl((input.home_hope_story_2_image || "").trim(), API_BASE_URL),
  dashboard_hero_1_image: resolveApiAssetUrl((input.dashboard_hero_1_image || "").trim(), API_BASE_URL),
  dashboard_hero_2_image: resolveApiAssetUrl((input.dashboard_hero_2_image || "").trim(), API_BASE_URL),
  dashboard_hero_3_image: resolveApiAssetUrl((input.dashboard_hero_3_image || "").trim(), API_BASE_URL),
  prayers_hero_image: resolveApiAssetUrl((input.prayers_hero_image || "").trim(), API_BASE_URL),
  history_hero_image: resolveApiAssetUrl((input.history_hero_image || "").trim(), API_BASE_URL),
  evidence_hero_image: resolveApiAssetUrl((input.evidence_hero_image || "").trim(), API_BASE_URL),
  prophecy_hero_image_1: resolveApiAssetUrl((input.prophecy_hero_image_1 || "").trim(), API_BASE_URL),
  prophecy_hero_image_2: resolveApiAssetUrl((input.prophecy_hero_image_2 || "").trim(), API_BASE_URL),
});

export const getSiteSettings = async (): Promise<SiteSettings> => {
  return withCachedResult(
    "site_settings_v1",
    async () => {
      const response = await fetch(`${API_BASE_URL}/api/site-settings/`);
      if (!response.ok) {
        throw new Error("Imeshindikana kupata mipangilio ya tovuti.");
      }
      const data = (await response.json()) as Partial<SiteSettings>;
      return normalizeSettings(data);
    },
    { ttlMs: 10 * 60 * 1000, persist: true },
  );
};

