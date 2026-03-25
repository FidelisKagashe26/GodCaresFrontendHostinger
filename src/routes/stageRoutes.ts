import { StageConfig, StageId } from '../types';

export const STAGES: StageConfig[] = [
  { id: StageId.HOME, title: 'Nyumbani', description: 'Karibu katika mafundisho.', icon: 'home' },
  { id: StageId.BLOG, title: 'Blog', description: 'Makala na Maarifa', icon: 'book-open' },
  { id: StageId.FAITH_BUILDER, title: 'Kuza Imani Yako', description: 'Hadithi za Mashujaa', icon: 'book-open' },
  { id: StageId.BIBLE_STUDY, title: 'Darasa la Biblia', description: 'Misingi, Unabii na Pambano Kuu.', icon: 'book-check' },
  { id: StageId.TIMELINE, title: 'Ramani ya Unabii', description: 'Historia ya Kale na Ijayo.', icon: 'clock' },
  { id: StageId.EVIDENCE, title: 'Hifadhi ya Ushahidi', description: 'Sayansi na Historia', icon: 'microscope' },
  { id: StageId.DECEPTION_VAULT, title: 'Ukweli vs Uongo', description: 'Fichua Udanganyifu', icon: 'shield-alert' },
  { id: StageId.QUESTION_VAULT, title: 'Maswali & Majibu', description: 'Majibu ya Biblia', icon: 'message-square' },
  { id: StageId.MEDIA, title: 'Media Hub', description: 'Video na Mafundisho', icon: 'play-circle' },
  { id: StageId.TESTIMONIES, title: 'Shuhuda', description: 'Matendo ya Mungu', icon: 'message-square-quote' },
  { id: StageId.SHOP, title: 'Duka', description: 'Vitabu na Vifaa', icon: 'shopping-bag' },
  { id: StageId.LIBRARY, title: 'Maktaba', description: 'Nyaraka za Bure', icon: 'library' },
  { id: StageId.EVENTS, title: 'Matukio', description: 'Mikutano Ijayo', icon: 'calendar' },
  { id: StageId.NEWS, title: 'Habari', description: 'Taarifa za Huduma', icon: 'newspaper' },
  { id: StageId.PRAYERS, title: 'Maombi', description: 'Omba na Uombewe', icon: 'heart' },
  { id: StageId.DONATE, title: 'Changia', description: 'Saidia Injili', icon: 'gift' },
  { id: StageId.ABOUT, title: 'Kuhusu Sisi', description: 'Lengo Letu', icon: 'info' },
];

export const STAGE_PATHS: Record<StageId, string> = {
  [StageId.HOME]: '/',
  [StageId.BLOG]: '/blog',
  [StageId.FAITH_BUILDER]: '/faith-builder',
  [StageId.BIBLE_STUDY]: '/bible-study',
  [StageId.TIMELINE]: '/timeline',
  [StageId.EVIDENCE]: '/evidence',
  [StageId.DECEPTION_VAULT]: '/deception-vault',
  [StageId.QUESTION_VAULT]: '/question-vault',
  [StageId.MEDIA]: '/media',
  [StageId.TESTIMONIES]: '/testimonies',
  [StageId.SHOP]: '/shop',
  [StageId.LIBRARY]: '/library',
  [StageId.EVENTS]: '/events',
  [StageId.NEWS]: '/news',
  [StageId.PRAYERS]: '/prayers',
  [StageId.DONATE]: '/donate',
  [StageId.ABOUT]: '/about',
};

export const STAGE_ROUTE_ENTRIES = Object.entries(STAGE_PATHS) as Array<[StageId, string]>;

export const RESTRICTED_STAGES = new Set<StageId>([
  StageId.BIBLE_STUDY,
  StageId.FAITH_BUILDER,
  StageId.TIMELINE,
  StageId.EVIDENCE,
  StageId.DECEPTION_VAULT,
  StageId.QUESTION_VAULT,
]);

export const normalizePath = (pathname: string): string => {
  if (!pathname) {
    return '/';
  }

  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash || '/';
};

const STAGE_BY_PATH = new Map<string, StageId>(
  STAGE_ROUTE_ENTRIES.map(([stage, path]) => [normalizePath(path), stage]),
);

export const getStagePath = (stage: StageId): string => STAGE_PATHS[stage] || '/';

export const getStageFromPath = (pathname: string): StageId | null =>
  STAGE_BY_PATH.get(normalizePath(pathname)) || null;

export const isRestrictedStage = (stage: StageId): boolean => RESTRICTED_STAGES.has(stage);
