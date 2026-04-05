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
import { getFaithHeroes } from '../../services/academy/faithService';

interface HeroProfile {
  id: string;
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

const copyShareText = async (hero: HeroProfile): Promise<void> => {
  const shareUrl = window.location.href;
  const text = `God Cares 365 - ${hero.name}: ${hero.title}`;
  await navigator.clipboard.writeText(`${text} ${shareUrl}`);
};

export const FaithBuilder: React.FC = () => {
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

  const handleHeroOpen = (id: string) => {
    setActiveHero(id);
    setShowVideoInModal(false);
  };

  const handleShare = async (hero: HeroProfile) => {
    const shareData = {
      title: `God Cares 365: ${hero.name}`,
      text: `${hero.name} - ${hero.title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await copyShareText(hero);
      window.alert('Link imenakiliwa. Unaweza kuipaste sasa.');
    } catch {
      // User cancelled share or browser blocked. No hard failure needed.
    }
  };

  return (
    <div className="animate-fade-in pb-28 md:pb-32 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 space-y-6 md:space-y-8">
      <section className="rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] p-4 sm:p-5 md:p-7 shadow-sm">
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

      <section className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] transition-colors border ${
              activeCategory === cat
                ? 'bg-gold-500 text-[#211600] border-gold-500'
                : 'bg-[color:var(--surface-2)] text-[color:var(--text-muted)] border-[color:var(--line-strong)] hover:text-[color:var(--text-primary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {loading && (
        <div className="rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] px-4 py-4 text-center text-xs font-black uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
          Inapakia mashujaa wa imani...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-center text-xs font-black uppercase tracking-[0.12em] text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && filteredHeroes.length === 0 && (
        <div className="rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] px-4 py-7 text-center space-y-2">
          <Shield size={24} className="mx-auto text-[color:var(--text-muted)]" />
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Hakuna taarifa katika kundi hili.</p>
        </div>
      )}

      {!loading && !error && filteredHeroes.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {filteredHeroes.map((hero) => (
            <article
              key={hero.id}
              role="button"
              tabIndex={0}
              onClick={() => handleHeroOpen(hero.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleHeroOpen(hero.id);
                }
              }}
              className="group rounded-2xl overflow-hidden border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] shadow-sm hover:shadow-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
            >
              <div className="relative h-48 bg-slate-900">
                {hero.image ? (
                  <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-300">
                    Hakuna picha
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleShare(hero);
                  }}
                  className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white hover:bg-gold-500 hover:text-[#1f1600] hover:border-gold-500 transition-colors"
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

              <div className="p-4 space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {hero.challenge}
                </p>
                <div className="rounded-xl border border-gold-500/20 bg-gold-50/80 dark:bg-gold-900/20 px-3 py-2.5">
                  <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-200 line-clamp-2">
                    "{hero.faithAction}"
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-800 dark:text-emerald-300">
                    {hero.category}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleHeroOpen(hero.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white"
                  >
                    Soma
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {currentHero && (
        <div className="fixed inset-0 z-[500] bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4">
          <div className="relative mx-auto h-full sm:h-[94vh] max-w-5xl overflow-hidden rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] shadow-2xl">
            <button
              onClick={() => setActiveHero(null)}
              className="absolute top-3 right-3 z-[510] inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] hover:text-red-500 transition-colors"
              aria-label="Funga"
            >
              <X size={18} />
            </button>

            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full">
                <div className="relative bg-slate-900 min-h-[260px] sm:min-h-[330px] lg:min-h-full">
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

                <div className="p-4 sm:p-6 md:p-7 space-y-5 bg-[color:var(--surface-2)]">
                  <div className="flex flex-wrap items-center gap-2">
                    {currentHero.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setShowVideoInModal((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface-3)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[color:var(--text-primary)] hover:border-gold-500/45"
                      >
                        <Play size={12} />
                        {showVideoInModal ? 'Ficha Video' : 'Tazama Video'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleShare(currentHero)}
                      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface-3)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[color:var(--text-primary)] hover:border-gold-500/45"
                    >
                      <Share2 size={12} />
                      Shiriki
                    </button>
                  </div>

                  <section className="rounded-xl border border-gold-500/25 bg-gold-50/70 dark:bg-gold-900/20 px-4 py-3">
                    <p className="text-sm sm:text-base font-semibold italic leading-relaxed text-slate-700 dark:text-slate-200">
                      "{currentHero.swahiliQuote}"
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      <Sword size={13} className="text-red-500" />
                      Pambano la Imani
                    </h4>
                    <div className="space-y-3">
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
                    <div className="rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--surface-3)] px-4 py-3">
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
                    onClick={() => setActiveHero(null)}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:bg-emerald-800"
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
