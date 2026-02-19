export interface Annotation {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
}

export interface EvidenceMetadata {
  page: number;
  totalPages: number;
  annotations: Annotation[];
  confidence: number;
  extractionMethod: string;
  sourceHash: string;
  scanDate: string;
  originalLanguage: string;
}

export interface AuthorProfile {
  name: string;
  role: string;
  authority: string;
  organization: string;
  image: string;
  bio?: string;
}

export interface EvidenceItemApi {
  id: string;
  category: string;
  subCategory: string;
  hint: string;
  type: "PDF" | "Audio" | "Video" | "Image";
  title: string;
  swahiliTitle: string;
  description: string;
  fact: string;
  sourceBook: string;
  publisher: string;
  author: AuthorProfile;
  yearPublished: string;
  translations: {
    original: string;
    en: string;
    sw: string;
  };
  heroImage: string;
  videoUrl?: string;
  evidenceData: EvidenceMetadata;
}

export interface DeceptionCaseApi {
  id: string;
  topic: string;
  category: string;
  threatLevel: "CRITICAL" | "HIGH" | "MODERATE";
  tradition: string;
  traditionSource: string;
  scripture: string;
  reference: string;
  logic: string;
  history: string;
  videoUrl: string;
  shareText: string;
  detailedDescription: string;
}

export interface QuestionVaultItemApi {
  id: number;
  category: string;
  q: string;
  a: string;
  detailedResponse: string;
  ref: string;
  tags: string[];
  isPopular?: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
}

export interface QuestionVaultSubmissionPayload {
  name?: string;
  email?: string;
  question: string;
}

export interface QuestionVaultSubmissionApi {
  id: number;
  name: string;
  email: string;
  question: string;
  is_reviewed: boolean;
  created_at: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

const toAbsoluteUrl = (value: string): string => {
  const raw = (value || "").trim();
  if (!raw) {
    return "";
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) {
    return raw;
  }
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_BASE_URL}${normalized}`;
};

export const getEvidenceItems = async (): Promise<EvidenceItemApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/evidence-vault/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata evidence vault.");
  }
  const payload = (await response.json()) as EvidenceItemApi[];
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((item) => ({
    ...item,
    heroImage: toAbsoluteUrl(item.heroImage),
    videoUrl: toAbsoluteUrl(item.videoUrl || ""),
    author: {
      ...item.author,
      image: toAbsoluteUrl(item.author?.image || ""),
    },
  }));
};

export const getDeceptionCases = async (): Promise<DeceptionCaseApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/deception-cases/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata deception cases.");
  }
  const payload = (await response.json()) as DeceptionCaseApi[];
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((item) => ({
    ...item,
    videoUrl: toAbsoluteUrl(item.videoUrl),
  }));
};

export const getQuestionVaultItems = async (): Promise<QuestionVaultItemApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/question-vault/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata question vault.");
  }
  const payload = (await response.json()) as QuestionVaultItemApi[];
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((item) => ({
    ...item,
    videoUrl: toAbsoluteUrl(item.videoUrl || ""),
    videoThumbnail: toAbsoluteUrl(item.videoThumbnail || ""),
  }));
};

export const submitQuestionVaultQuestion = async (
  payload: QuestionVaultSubmissionPayload
): Promise<QuestionVaultSubmissionApi> => {
  const response = await fetch(`${API_BASE_URL}/api/question-vault/submit/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kutuma swali.");
  }
  return (await response.json()) as QuestionVaultSubmissionApi;
};
