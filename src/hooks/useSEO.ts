import { useEffect } from 'react';
import { StageId } from '../types';

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  type?: string;
  image?: string;
}

const SITE_URL = 'https://godcares365.com';

const STAGE_SEO_MAP: Record<string, SEOProps> = {
  [StageId.HOME]: {
    title: 'God Cares 365 - Ultimate Truth',
    description: 'Discover the ultimate truth, daily inspiration, and spiritual guidance with God Cares 365.',
    url: '/',
  },
  [StageId.BLOG]: {
    title: 'Makala na Maarifa | God Cares 365',
    description: 'Soma makala mbalimbali kuhusu imani na neno la Mungu.',
    url: '/blog',
  },
  [StageId.FAITH_BUILDER]: {
    title: 'Kuza Imani Yako | God Cares 365',
    description: 'Jifunze na ukue kiroho kupitia hadithi na masomo ya mashujaa wa imani.',
    url: '/faith-builder',
  },
  [StageId.BIBLE_STUDY]: {
    title: 'Darasa la Biblia | God Cares 365',
    description: 'Fuatilia misingi, unabii na pambano kuu kati ya wema na uovu.',
    url: '/bible-study',
  },
  [StageId.TIMELINE]: {
    title: 'Ramani ya Unabii | God Cares 365',
    description: 'Chunguza historia ya kale na ijayo kupitia ramani ya unabii wa Biblia.',
    url: '/prophecy-timeline',
  },
  [StageId.EVIDENCE]: {
    title: 'Hifadhi ya Ushahidi | God Cares 365',
    description: 'Pata ushahidi wa kisayansi na kihistoria unaothibitisha ukweli wa Biblia.',
    url: '/evidence-vault',
  },
  [StageId.DECEPTION_VAULT]: {
    title: 'Ukweli vs Uongo | God Cares 365',
    description: 'Fichua udanganyifu na kuelewa ukweli halisi kupitia mafundisho ya Neno.',
    url: '/deception-watch',
  },
  [StageId.QUESTION_VAULT]: {
    title: 'Maswali & Majibu | God Cares 365',
    description: 'Pata majibu ya kibiblia kwa maswali magumu kuhusu maisha na imani.',
    url: '/questions',
  },
  [StageId.MEDIA]: {
    title: 'Kituo cha Habari | God Cares 365',
    description: 'Tazama video, mafundisho, na vipindi mbalimbali vya kiroho.',
    url: '/media-hub',
  },
  [StageId.TESTIMONIES]: {
    title: 'Shuhuda | God Cares 365',
    description: 'Soma matendo makuu ya Mungu kupitia shuhuda za watu mbalimbali.',
    url: '/testimonies',
  },
  [StageId.SHOP]: {
    title: 'Duka | God Cares 365',
    description: 'Pata vitabu na vifaa mbalimbali vya kiroho.',
    url: '/shop',
  },
  [StageId.LIBRARY]: {
    title: 'Maktaba | God Cares 365',
    description: 'Fikia nyaraka, vitabu vya bure na rasilimali muhimu.',
    url: '/library',
  },
  [StageId.EVENTS]: {
    title: 'Matukio | God Cares 365',
    description: 'Fuatilia mikutano, semina, na matukio yetu yajayo.',
    url: '/events',
  },
  [StageId.NEWS]: {
    title: 'Habari | God Cares 365',
    description: 'Pata taarifa za hivi punde na habari kutoka katika huduma yetu.',
    url: '/news',
  },
  [StageId.PRAYERS]: {
    title: 'Maombi | God Cares 365',
    description: 'Jumuika nasi katika maombi na tuma maombi yako ili uombewe.',
    url: '/prayer-center',
  },
  [StageId.DONATE]: {
    title: 'Changia | God Cares 365',
    description: 'Saidia uenezi wa injili kwa kutoa sadaka na michango yako.',
    url: '/donate',
  },
  [StageId.ABOUT]: {
    title: 'Kuhusu Sisi | God Cares 365',
    description: 'Fahamu zaidi kuhusu huduma yetu, malengo yetu, na imani yetu.',
    url: '/about-us',
  },
};

export const useSEO = (stage: StageId) => {
  useEffect(() => {
    const seoConfig = STAGE_SEO_MAP[stage] || STAGE_SEO_MAP[StageId.HOME];
    
    // Set Document Title
    document.title = seoConfig.title;

    // Update or create Meta Tags
    const updateMetaTag = (nameAttr: string, valueAttr: string, content: string) => {
      let tag = document.querySelector(`meta[${nameAttr}="${valueAttr}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(nameAttr, valueAttr);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMetaTag('name', 'description', seoConfig.description);
    updateMetaTag('property', 'og:title', seoConfig.title);
    updateMetaTag('property', 'og:description', seoConfig.description);
    updateMetaTag('property', 'og:type', seoConfig.type || 'website');
    updateMetaTag('name', 'twitter:title', seoConfig.title);
    updateMetaTag('name', 'twitter:description', seoConfig.description);

    if (seoConfig.url) {
      updateMetaTag('property', 'og:url', `${SITE_URL}${seoConfig.url}`);
      
      // Update canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${SITE_URL}${seoConfig.url}`);
    }

    if (seoConfig.image) {
      updateMetaTag('property', 'og:image', `${SITE_URL}${seoConfig.image}`);
      updateMetaTag('name', 'twitter:image', `${SITE_URL}${seoConfig.image}`);
    }
  }, [stage]);
};
