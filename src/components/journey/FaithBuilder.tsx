import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Play,
  Share2,
  Shield,
  Sparkles,
  Sword,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getFaithHeroSharePageUrl, getFaithHeroes } from '../../services/academy/faithService';

interface HeroProfile {
  id: string;
  shareKey: string;
  shareUrl: string;
  name: string;
  title: string;
  challenge: string;
  faithAction: string;
  swahiliQuote: string;
  verse: string;
  image: string;
  story: string;
  lesson: string;
  period: 'Agano la Kale' | 'Agano Jipya' | 'Wafia Dini';
  category: 'Wapiganaji' | 'Wanawake' | 'Manabii';
  videoUrl: string;
}

const CATEGORIES = ['Zote', 'Wapiganaji', 'Wanawake', 'Manabii'] as const;

const normalizeVideoUrl = (value: string): string => {
  const raw = (value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;

    if (host.includes('youtu.be')) {
      const id = path.replace(/^\/+/, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : raw;
    }

    if (host.includes('youtube.com')) {
      if (path.startsWith('/embed/')) return raw;
      if (path.startsWith('/watch')) {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : raw;
      }
      if (path.startsWith('/shorts/')) {
        const id = path.split('/')[2];
        return id ? `https://www.youtube.com/embed/${id}` : raw;
      }
    }
  } catch {
    return raw;
  }

  return raw;
};

const withAutoplay = (value: string): string => {
  const normalized = normalizeVideoUrl(value);
  if (!normalized) return '';
  return `${normalized}${normalized.includes('?') ? '&' : '?'}autoplay=1`;
};

const isIframeVideoSource = (value: string): boolean => {
  const normalized = normalizeVideoUrl(value);
  return /youtube\.com\/embed|player\.vimeo\.com/i.test(normalized);
};

const splitParagraphs = (value: string): string[] =>
  (value || '')
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const copyShareText = async (hero: HeroProfile, shareUrl: string): Promise<void> => {
  const text = `God Cares 365 - ${hero.name}: ${hero.title}`;
  await navigator.clipboard.writeText(`${text} ${shareUrl}`);
};

export const FaithBuilder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeHero, setActiveHero] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('Zote');
  const [showVideoInModal, setShowVideoInModal] = useState(false);
  const [heroes, setHeroes] = useState<HeroProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHeroes = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getFaithHeroes();
        const mapped: HeroProfile[] = data.map((hero) => ({
          id: String(hero.id),
          shareKey: String(hero.share_key || '').trim(),
          shareUrl: String(hero.share_url || '').trim(),
          name: hero.name,
          title: hero.title,
          challenge: hero.challenge,
          faithAction: hero.faith_action,
          swahiliQuote: hero.swahili_quote,
          verse: hero.verse,
          image: hero.image || '',
          story: hero.story,
          lesson: hero.lesson,
          period: hero.period,
          category: hero.category,
          videoUrl: hero.video_url || '',
        }));
        setHeroes(mapped);
      } catch (err: any) {
        setError(err?.message || 'Imeshindikana kupata mashujaa wa imani.');
      } finally {
        setLoading(false);
      }
    };

    void loadHeroes();
  }, []);

  const filteredHeroes = useMemo(
    () => heroes.filter((hero) => activeCategory === 'Zote' || hero.category === activeCategory),
    [activeCategory, heroes],
  );

  const currentHero = useMemo(
    () => heroes.find((hero) => hero.id === activeHero) || null,
    [activeHero, heroes],
  );

  const setHeroQueryParam = (heroId: string | null, replace = false) => {
    const next = new URLSearchParams(searchParams);
    if (heroId) {
      const selectedHero = heroes.find((hero) => hero.id === heroId);
      if (selectedHero?.shareKey) {
        next.set('share', selectedHero.shareKey);
        next.delete('hero');
      } else {
        next.set('hero', heroId);
        next.delete('share');
      }
    } else {
      next.delete('share');
      next.delete('hero');
    }
    setSearchParams(next, { replace });
  };

  const openHero = (id: string, syncUrl = true) => {
    if (syncUrl) {
      setHeroQueryParam(id);
    }
    setActiveHero(id);
    setShowVideoInModal(false);
  };

  const closeHero = (syncUrl = true) => {
    if (syncUrl) {
      setHeroQueryParam(null);
    }
    setActiveHero(null);
    setShowVideoInModal(false);
  };

  useEffect(() => {
    const rawShareKey = (searchParams.get('share') || '').trim().toLowerCase();
    const rawHeroId = (searchParams.get('hero') || '').trim();

    if (!rawShareKey && !rawHeroId) {
      if (activeHero !== null) {
        closeHero(false);
      }
      return;
    }

    if (rawShareKey) {
      const matchedHero = heroes.find((hero) => hero.shareKey.toLowerCase() === rawShareKey);
      if (matchedHero) {
        if (activeHero !== matchedHero.id) {
          openHero(matchedHero.id, false);
        }
        return;
      }

      if (heroes.length > 0) {
        const next = new URLSearchParams(searchParams);
        next.delete('share');
        next.delete('hero');
        setSearchParams(next, { replace: true });
      }
      return;
    }

    const matchedById = heroes.find((hero) => hero.id === rawHeroId);
    if (matchedById) {
      if (activeHero !== matchedById.id) {
        openHero(matchedById.id, false);
      }
      return;
    }

    if (heroes.length > 0) {
      const next = new URLSearchParams(searchParams);
      next.delete('share');
      next.delete('hero');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, heroes, activeHero]);

  const handleShare = async (hero: HeroProfile) => {
    const parsedHeroId = Number.parseInt(hero.id, 10);
    const heroId = Number.isInteger(parsedHeroId) && parsedHeroId > 0 ? parsedHeroId : undefined;
    const shareUrl = hero.shareUrl || getFaithHeroSharePageUrl(hero.shareKey, heroId);
    const shareData = {
      title: `God Cares 365: ${hero.name}`,
      text: `${hero.name} - ${hero.title}`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await copyShareText(hero, shareUrl);
      window.alert('Link imenakiliwa. Unaweza kuipaste sasa.');
    } catch {
      // User cancelled share or browser blocked. No hard failure needed.
    }
  };

  return (
    <div className="animate-fade-in pb-28 md:pb-32 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 space-y-6 md:space-y-8">
      <section className="rounded-2xl border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-5 md:p-7 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-100/60 dark:bg-gold-900/25 px-3 py-1.5">
          <Sparkles size={12} className="text-gold-600 dark:text-gold-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gold-700 dark:text-gold-300">Kuza Imani Yako</span>
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-black leading-tight text-slate-900 dark:text-slate-100">
          Mashujaa wa Imani
        </h1>
        <p className="mt-2 text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Chagua shujaa, soma simulizi yake, na jifunze somo la imani kwa mpangilio safi na rahisi kusoma.
        </p>
      </section>

      <section className="flex flex-wrap gap-2.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] transition-colors border ${
              activeCategory === cat
                ? 'border-gold-300/80 bg-gold-100/70 text-gold-800 dark:border-gold-700/70 dark:bg-gold-900/35 dark:text-gold-200'
                : 'border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:border-gold-300/70 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {loading && (
        <div className="rounded-xl border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 px-4 py-4 text-center text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Inapakia mashujaa wa imani...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-center text-xs font-black uppercase tracking-[0.12em] text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && filteredHeroes.length === 0 && (
        <div className="rounded-xl border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 px-4 py-7 text-center space-y-2">
          <Shield size={24} className="mx-auto text-slate-500 dark:text-slate-400" />
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Hakuna taarifa katika kundi hili.</p>
        </div>
      )}

      {!loading && !error && filteredHeroes.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredHeroes.map((hero) => (
            <article
              key={hero.id}
              role="button"
              tabIndex={0}
              onClick={() => openHero(hero.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openHero(hero.id);
                }
              }}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] hover:border-gold-400/80 hover:shadow-[0_14px_28px_rgba(212,154,20,0.12)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/45"
            >
              <div className="relative h-48 md:h-52 overflow-hidden bg-green-50 dark:bg-slate-800 border-b border-green-100 dark:border-slate-700">
                {hero.image ? (
                  <img src={hero.image} alt={hero.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    Hakuna picha
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleShare(hero);
                  }}
                  className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-slate-900/45 text-white hover:bg-gold-500 hover:text-[#1f1600] hover:border-gold-500 transition-colors"
                  aria-label={`Shiriki ${hero.name}`}
                >
                  <Share2 size={15} />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{hero.name}</h3>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-gold-300 truncate">{hero.title}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/35 bg-black/45 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                    {hero.period}
                  </span>
                </div>
              </div>

              <div className="p-4 md:p-5 space-y-3.5">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {hero.challenge}
                </p>
                <div className="rounded-xl border border-gold-300/35 bg-gold-100/55 dark:border-gold-800/35 dark:bg-gold-900/20 px-3 py-2.5">
                  <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-200 line-clamp-2">
                    "{hero.faithAction}"
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-800 dark:text-emerald-300">
                    {hero.category}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
                    {hero.period}
                  </span>
                </div>

                <div className="pt-3 border-t border-green-100/90 dark:border-slate-700 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    Gusa kadi kusoma
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openHero(hero.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/80 bg-gold-100/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-gold-800 hover:bg-gold-200/80 transition-colors"
                  >
                    Zaidi
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {currentHero && (
        <div className="fixed inset-0 z-[500] bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4">
          <div className="relative mx-auto h-full sm:h-[94vh] max-w-5xl overflow-hidden rounded-2xl border border-green-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.28)]">
            <button
              onClick={() => closeHero()}
              className="absolute top-3 right-3 z-[510] inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900 text-slate-500 dark:text-slate-300 hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/40 transition-colors"
              aria-label="Funga"
            >
              <X size={18} />
            </button>

            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full">
                <div className="relative bg-slate-900 min-h-[260px] sm:min-h-[330px] lg:min-h-full lg:border-r lg:border-green-100 dark:lg:border-slate-700">
                  {showVideoInModal ? (
                    currentHero.videoUrl ? (
                      <div className="w-full h-full">
                        {isIframeVideoSource(currentHero.videoUrl) ? (
                          <iframe
                            src={withAutoplay(currentHero.videoUrl)}
                            className="w-full h-full border-none"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video src={currentHero.videoUrl} className="w-full h-full" controls autoPlay />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase tracking-[0.12em] text-slate-300">
                        Hakuna video
                      </div>
                    )
                  ) : (
                    <>
                      {currentHero.image ? (
                        <img src={currentHero.image} alt={currentHero.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase tracking-[0.12em] text-slate-300">
                          Hakuna picha
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                    </>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{currentHero.name}</h2>
                    <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.12em] text-gold-300">{currentHero.title}</p>
                    <p className="text-sm font-semibold italic text-slate-100">{currentHero.verse}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 md:p-7 space-y-5 bg-white dark:bg-slate-900">
                  <div className="flex flex-wrap items-center gap-2">
                    {currentHero.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setShowVideoInModal((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-200 hover:border-gold-300/70 dark:hover:border-gold-700/60 hover:text-gold-800 dark:hover:text-gold-200 transition-colors"
                      >
                        <Play size={12} />
                        {showVideoInModal ? 'Ficha Video' : 'Tazama Video'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleShare(currentHero)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-200 hover:border-gold-300/70 dark:hover:border-gold-700/60 hover:text-gold-800 dark:hover:text-gold-200 transition-colors"
                    >
                      <Share2 size={12} />
                      Shiriki
                    </button>
                  </div>

                  <section className="rounded-xl border border-gold-300/35 bg-gold-100/55 dark:border-gold-800/35 dark:bg-gold-900/20 px-4 py-3">
                    <p className="text-sm sm:text-base font-semibold italic leading-relaxed text-slate-700 dark:text-slate-200">
                      "{currentHero.swahiliQuote}"
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      <Sword size={13} className="text-red-500" />
                      Pambano la Imani
                    </h4>
                    <div className="space-y-3 rounded-xl border border-green-100 dark:border-slate-700 bg-green-50/40 dark:bg-slate-900/60 px-4 py-3">
                      {splitParagraphs(currentHero.story).map((paragraph, index) => (
                        <p key={`${currentHero.id}-story-${index}`} className="text-sm sm:text-[15px] leading-7 text-slate-700 dark:text-slate-300">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Hatua ya Shujaa</h4>
                    <p className="mt-2 text-sm sm:text-[15px] font-semibold italic leading-7 text-slate-800 dark:text-slate-100">
                      "{currentHero.faithAction}"
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      <GraduationCap size={13} className="text-blue-500" />
                      Somo Kwako
                    </h4>
                    <div className="rounded-xl border border-green-100 dark:border-slate-700 bg-white/95 dark:bg-slate-900/70 px-4 py-3">
                      <div className="space-y-3">
                        {splitParagraphs(currentHero.lesson).map((paragraph, index) => (
                          <p key={`${currentHero.id}-lesson-${index}`} className="text-sm sm:text-[15px] leading-7 text-slate-700 dark:text-slate-300">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={() => closeHero()}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-[0_8px_18px_rgba(5,150,105,0.22)] hover:bg-emerald-800 transition-colors"
                  >
                    <BookOpen size={12} />
                    Rudi Kwenye Orodha
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
