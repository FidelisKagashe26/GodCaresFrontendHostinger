
export enum StageId {
  HOME = 'home',
  BLOG = 'blog',
  BIBLE_STUDY = 'bible_study',
  TIMELINE = 'timeline',
  EVIDENCE = 'evidence',
  DECEPTION_VAULT = 'deception_vault',
  QUESTION_VAULT = 'question_vault',
  MEDIA = 'media',
  TESTIMONIES = 'testimonies',
  FAITH_BUILDER = 'faith_builder',
  // Resources & Extras
  SHOP = 'shop',
  LIBRARY = 'library',
  EVENTS = 'events',
  NEWS = 'news',
  PRAYERS = 'prayers',
  DONATE = 'donate',
  ABOUT = 'about'
}

export interface StageConfig {
  id: StageId;
  title: string;
  description: string;
  icon: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'award';
  timestamp?: string;
  read?: boolean;
}

export interface Award {
  id: string;
  title: string;
  date: string;
  icon: string;
}

export type LanguageCode = string;

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
  greeting: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';
