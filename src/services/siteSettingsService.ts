const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  contact_phone: string;
  contact_email: string;
  support_email: string;
  facebook_url: string;
  x_url: string;
  instagram_url: string;
  tiktok_url: string;
  youtube_url: string;
  whatsapp_url: string;
  website_main_url: string;
  website_kids_url: string;
  website_outreach_url: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "God Cares 365",
  site_tagline: "Hope / Prayer / Scripture",
  logo_url: "",
  contact_phone: "+255 744 780 244",
  contact_email: "fathercares365@gmail.com",
  support_email: "support@godcares365.org",
  facebook_url: "",
  x_url: "https://x.com/Godcares365",
  instagram_url: "https://www.instagram.com/god_cares365?igsh=MXdmdmJ4b3c5OTdlYQ==",
  tiktok_url: "https://vm.tiktok.com/ZMHEoAMgBnUD3-hkUHg/",
  youtube_url: "https://www.youtube.com/@GodCares365",
  whatsapp_url: "https://whatsapp.com/channel/0029VaJmiMu3WHTb3achqE1o",
  website_main_url: "https://godcares365.org/pambano-kuu",
  website_kids_url: "https://kids.godcares365.org",
  website_outreach_url: "https://outreach.godcares365.org",
};

const toAbsoluteUrl = (value: string): string => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return value;
  try {
    return new URL(value, API_BASE_URL).toString();
  } catch {
    return value;
  }
};

const normalizeSettings = (input: Partial<SiteSettings>): SiteSettings => ({
  ...DEFAULT_SITE_SETTINGS,
  ...input,
  logo_url: toAbsoluteUrl((input.logo_url || "").trim()),
});

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/site-settings/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata site settings.");
  }
  const data = (await response.json()) as Partial<SiteSettings>;
  return normalizeSettings(data);
};

