
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  ArrowRight, BookOpen, ShieldCheck, Quote, 
  ChevronRight, ChevronLeft, Sparkles, Sword, 
  Play, GraduationCap, X, Video, Monitor, PlayCircle, Shield, Share2
} from 'lucide-react';
import { getFaithHeroes } from '../services/faithService';

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

const CATEGORIES = ['Zote', 'Wapiganaji', 'Wanawake', 'Manabii'];

export const FaithBuilder: React.FC = () => {
  const [activeHero, setActiveHero] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Zote');
  const [showVideoInModal, setShowVideoInModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
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

    loadHeroes();
  }, []);

  const filteredHeroes = useMemo(() => {
    return heroes.filter(h => activeCategory === 'Zote' || h.category === activeCategory);
  }, [activeCategory, heroes]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleHeroOpen = (id: string) => {
    setActiveHero(id);
    setShowVideoInModal(false);
  };

  const handleShare = async (e: React.MouseEvent, hero: HeroProfile) => {
    e.stopPropagation();
    const shareData = {
      title: `God Cares 365: ${hero.name}`,
      text: `Jifunze kuhusu ${hero.name} (${hero.title}) na jinsi imani yake ilivyobadili dunia kupitia God Cares 365.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Imeandikwa kwenye clipboard! Unaweza ku-paste sasa.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const currentHero = heroes.find(h => h.id === activeHero);

  return (
    <div className="animate-fade-in pb-40 max-w-full mx-auto space-y-8 overflow-hidden">
      
      {/* 1. IMPACT HEADER */}
      <section className="relative pt-12 pb-2 px-6 text-center space-y-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-60 bg-gold-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-slate-950 border border-gold-500/20 rounded-full">
             <span className="text-[8px] font-black tracking-[0.3em] uppercase text-gold-500">Kuza Imani yako</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              MASHUJAA WA <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 italic">IMANI.</span>
            </h1>
            <p className="text-slate-500 font-serif italic text-sm md:text-lg max-w-xl mx-auto opacity-70">
              "Ulimwengu haukuwastahili hawa..." — Waebrania 11:38.
            </p>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SELECTOR */}
      <section className="relative z-30 flex justify-center px-4">
         <div className="flex bg-slate-900/40 backdrop-blur-xl p-1 rounded-xl border border-white/5 shadow-xl overflow-x-auto scrollbar-hide max-w-full">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-gold-500 text-slate-950 shadow-lg' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </section>

      {loading && (
        <div className="text-center text-xs font-black uppercase tracking-widest text-slate-400">Inapakia mashujaa...</div>
      )}
      {error && (
        <div className="text-center text-xs font-black uppercase tracking-widest text-red-500">{error}</div>
      )}

      {/* 3. HORIZONTAL SCROLL SECTION */}
      <section className="relative px-4 md:px-20 group min-h-[350px]">
        {/* Navigation Arrows */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 z-40 p-2 md:p-4 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-gold-500 transition-all hover:bg-gold-500 hover:text-black shadow-2xl flex"
        >
          <ChevronLeft size={20} className="md:w-6 md:h-6" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 z-40 p-2 md:p-4 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-gold-500 transition-all hover:bg-gold-500 hover:text-black shadow-2xl flex"
        >
          <ChevronRight size={20} className="md:w-6 md:h-6" />
        </button>

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide py-4 px-4 md:px-10"
        >
          {filteredHeroes.length > 0 ? filteredHeroes.map((hero) => (
            <div 
              key={hero.id}
              onClick={() => handleHeroOpen(hero.id)}
              className="min-w-[75vw] md:min-w-[320px] snap-center cursor-pointer group/card relative transition-all duration-500 animate-fade-in"
            >
              {/* Card Container */}
                <div className="relative h-[340px] md:h-[400px] bg-slate-900 rounded-3xl border border-white/5 overflow-hidden transition-all duration-700 group-hover/card:border-gold-500/30 shadow-xl">
                <div className="h-full w-full relative">
                  {hero.image ? (
                    <img src={hero.image} className="w-full h-full object-cover grayscale opacity-30 group-hover/card:grayscale-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-1000" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-400">
                      Hakuna picha
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
                  
                  {/* Share Button (Mobile-accessible) */}
                  <div className="absolute top-4 right-4 z-20">
                     <button 
                       onClick={(e) => handleShare(e, hero)}
                       className="p-2.5 bg-black/40 backdrop-blur-md hover:bg-gold-500 hover:text-black rounded-lg text-white transition-all border border-white/10 shadow-lg"
                     >
                       <Share2 size={14} />
                     </button>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                    <div className="space-y-0.5">
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">{hero.name}</h3>
                       <p className="text-gold-400 text-[7px] font-black uppercase tracking-[0.3em]">{hero.title}</p>
                    </div>
                    
                    <div className="h-[1px] w-8 bg-gold-500/50 group-hover/card:w-20 transition-all duration-700"></div>
                    
                    <div className="space-y-2">
                       <p className="text-slate-400 text-[10px] leading-relaxed font-medium italic line-clamp-2">
                          "{hero.faithAction}"
                       </p>
                       <div className="flex items-center justify-between pt-1">
                         <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 group-hover/card:text-gold-500">
                            FUNGUA <ChevronRight size={10} />
                         </span>
                         <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{hero.period}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="w-full flex flex-col items-center justify-center text-slate-700 py-16 space-y-4 opacity-50">
               <Shield size={48} />
               <p className="font-black uppercase tracking-[0.3em] text-[10px]">Hakuna shujaa hapa...</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. HERO IMMERSIVE MODAL */}
      {currentHero && (
        <div className="fixed inset-0 z-[500] bg-slate-950/98 backdrop-blur-3xl animate-fade-in flex items-center justify-center p-4 overflow-hidden">
           <div className="w-full max-w-6xl h-full md:h-[85vh] bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/5 relative">
              
              <button 
                onClick={() => setActiveHero(null)}
                className="absolute top-4 right-4 z-[510] p-3 bg-black/40 hover:bg-red-600 text-white transition-all rounded-xl shadow-2xl"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 relative h-[300px] md:h-full bg-slate-900 overflow-hidden group">
                 {showVideoInModal ? (
                    currentHero.videoUrl ? (
                      <div className="w-full h-full bg-black">
                        <iframe 
                          src={`${currentHero.videoUrl}?autoplay=1`} 
                          className="w-full h-full border-none" 
                          allow="autoplay; encrypted-media" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-black uppercase tracking-widest text-slate-300">
                        Hakuna video
                      </div>
                    )
                 ) : (
                    <>
                       {currentHero.image ? (
                         <img src={currentHero.image} className="w-full h-full object-cover contrast-[1.1]" alt="" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-sm font-black uppercase tracking-widest text-slate-300">
                           Hakuna picha
                         </div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20"></div>
                       
                       {/* Play Button in Modal */}
                       <div className="absolute inset-0 flex items-center justify-center z-30">
                          <button 
                            onClick={() => currentHero.videoUrl && setShowVideoInModal(true)}
                            className={`w-20 h-20 backdrop-blur-sm border rounded-full flex items-center justify-center text-white transition-all shadow-2xl animate-pulse-slow group/btn ${currentHero.videoUrl ? 'bg-white/20 border-white/30 hover:bg-red-600 hover:border-red-600' : 'bg-white/10 border-white/15 cursor-not-allowed opacity-60'}`}
                          >
                             <Play size={32} fill="currentColor" className="ml-1 group-hover/btn:scale-110 transition-transform" />
                          </button>
                       </div>

                       <div className="absolute bottom-6 left-6 right-6 space-y-4 z-20 pointer-events-none">
                          <div className="space-y-1">
                             <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">{currentHero.name}</h2>
                             <p className="text-gold-500 font-black text-[10px] md:text-sm uppercase tracking-[0.4em]">{currentHero.title}</p>
                          </div>
                          <div className="p-3 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 w-fit">
                             <p className="text-[14px] font-black text-white italic">{currentHero.verse}</p>
                          </div>
                       </div>
                    </>
                 )}
              </div>

              <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0f172a] overflow-hidden">
                 <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-12 space-y-8">
                    <section className="relative pl-6 border-l-4 border-gold-500 py-2">
                       <p className="text-xl md:text-2xl font-serif italic text-slate-800 dark:text-slate-200 leading-tight">
                          "{currentHero.swahiliQuote}"
                       </p>
                    </section>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <Sword size={14} className="text-red-500" /> Pambano la Imani
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                             {currentHero.story}
                          </p>
                       </div>

                       <div className="p-6 bg-primary-950 rounded-2xl border border-white/5 space-y-3 shadow-lg">
                          <h4 className="text-[9px] font-black text-gold-500 uppercase tracking-widest">Hatua ya Shujaa</h4>
                          <p className="text-lg font-bold text-white italic leading-tight">
                             "{currentHero.faithAction}"
                          </p>
                       </div>

                       <div className="space-y-2">
                          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             <GraduationCap size={14} className="text-blue-500" /> Somo Kwako
                          </h4>
                          <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 italic text-sm text-slate-700 dark:text-slate-400 font-medium">
                             "{currentHero.lesson}"
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                       <button 
                         onClick={(e) => handleShare(e, currentHero)}
                         className="w-full py-4 border border-gold-500/30 text-gold-500 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                       >
                          <Share2 size={14}/> Share Shujaa Huyu
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes ken-burns {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-ken-burns { animation: ken-burns 15s ease-out forwards; }
      `}</style>
    </div>
  );
};

