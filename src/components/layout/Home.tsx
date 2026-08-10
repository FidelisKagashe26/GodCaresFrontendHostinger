import React, { useState, useEffect, useRef } from 'react';
import { StageId } from '../../types';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../../services/core/siteSettingsService';
import { getApiBaseUrl } from '../../services/core/urlService';
import { 
  ArrowRight, BookOpen, ShieldCheck, Microscope, PlayCircle, 
  Clock, ChevronRight, ChevronLeft, Calendar, Newspaper, BookMarked, Play,
  Globe, Users, Star, Gift, Book
} from 'lucide-react';

interface HomeProps {
  /** `search` is an optional query string, e.g. "?video=12" to open a video directly. */
  onNavigate: (id: StageId, search?: string) => void;
  siteSettings?: SiteSettings;
}

const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string; threshold?: number }> = ({ children, className = "", threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={domRef}
      className={`${className} transform-gpu will-change-transform transition duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 md:translate-y-12'
      }`}
    >
      {children}
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ onNavigate, siteSettings }) => {
  const resolvedSiteSettings = siteSettings || DEFAULT_SITE_SETTINGS;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [latestVideos, setLatestVideos] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/media/videos/latest/`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLatestVideos(data);
      })
      .catch(err => console.error("Failed to fetch videos", err));
  }, []);

  const HERO_SLIDES = [
    {
      image: resolvedSiteSettings.dashboard_hero_1_image,
      title: resolvedSiteSettings.dashboard_hero_1_title || "Mungu Anakujali",
      subtitle: resolvedSiteSettings.dashboard_hero_1_subtitle || "Gundua jinsi Kristo anavyotuombea katika patakatifu pa mbinguni.",
      tag: "Mafundisho Mapya",
      action: "Anza Kujifunza",
      stageId: StageId.BIBLE_STUDY
    },
    {
      image: resolvedSiteSettings.dashboard_hero_2_image,
      title: resolvedSiteSettings.dashboard_hero_2_title || "Misingi ya Ukweli",
      subtitle: resolvedSiteSettings.dashboard_hero_2_subtitle || "Zifahamu amri kumi kama kioo cha upendo wa Mungu kwa mwanadamu.",
      tag: "Unabii wa Biblia",
      action: "Chunguza Unabii",
      stageId: StageId.TIMELINE
    },
    {
      image: resolvedSiteSettings.dashboard_hero_3_image,
      title: resolvedSiteSettings.dashboard_hero_3_title || "Saa ya Hukumu",
      subtitle: resolvedSiteSettings.dashboard_hero_3_subtitle || "Matumaini yapo katika ujumbe wa malaika watatu. Jiandae kwa marejeo ya Yesu.",
      tag: "Vipindi vya Televisheni",
      action: "Tazama Sasa",
      stageId: StageId.MEDIA
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));

  const QUICK_LINKS = [
    { id: StageId.BIBLE_STUDY, title: "Darasa la Biblia", icon: <BookOpen size={24} />, desc: "Anza mafunzo ya Biblia mtandaoni bila malipo.", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: StageId.MEDIA, title: "Tazama TV", icon: <PlayCircle size={24} />, desc: "Fuatilia vipindi vyetu vipya kila siku.", color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: StageId.LIBRARY, title: "Maktaba ya Rasilimali", icon: <BookMarked size={24} />, desc: "Pakua vitabu na makala za kukuza imani.", color: "text-gold-500", bg: "bg-gold-500/10" },
    { id: StageId.DONATE, title: "Ubia na Injili", icon: <Gift size={24} />, desc: "Saidia kupeleka ujumbe huu kwa ulimwengu.", color: "text-emerald-500", bg: "bg-emerald-500/10" }
  ];

  const DEEP_DIVE_SECTIONS = [
    { id: StageId.TIMELINE, title: "Ramani ya Unabii", icon: <Clock size={20} />, img: resolvedSiteSettings.home_truth_story_2_image, desc: "Tazama historia ya dunia kwa mtazamo wa kinabii." },
    { id: StageId.EVIDENCE, title: "Hifadhi ya Ushahidi", icon: <Microscope size={20} />, img: resolvedSiteSettings.home_deception_story_2_image, desc: "Sayansi na akiolojia zinazothibitisha ukweli wa Biblia." },
    { id: StageId.DECEPTION_VAULT, title: "Kutambua Uongo", icon: <ShieldCheck size={20} />, img: resolvedSiteSettings.home_hope_story_2_image, desc: "Jilinde dhidi ya mafundisho potofu ya siku za mwisho." },
  ];

  return (
    <div className="w-full min-h-screen bg-[color:var(--page-bg)] text-[color:var(--text-primary)] font-sans overflow-x-hidden">
      
      {/* --- DYNAMIC CAROUSEL HERO --- */}
      <section className="relative w-full min-h-[100dvh] lg:h-screen lg:min-h-[600px] lg:overflow-hidden group bg-green-950 lg:bg-[color:var(--page-bg)] flex flex-col">
        
        <style>{`
          @keyframes slideProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
        {/* Mobile Top Progress Timer */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-[40] md:hidden">
          <div 
            key={currentSlide}
            className="h-full bg-[color:var(--accent)]"
            style={{ animation: 'slideProgress 8s linear forwards' }}
          />
        </div>

        {HERO_SLIDES.map((slide, index) => {
          const isActive = currentSlide === index;
          return (
            <div 
              key={index} 
              className={`absolute inset-0 flex flex-col lg:block transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              {/* IMAGE WRAPPER */}
              <div className="relative w-full shrink-0 lg:absolute lg:inset-0">
                {slide.image ? (
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className={`w-full h-auto lg:absolute lg:inset-0 lg:w-full lg:h-full lg:object-cover lg:object-center brightness-[0.82] transition-opacity duration-1000 ease-out ${isActive ? 'opacity-100' : 'opacity-80'}`} 
                  />
                ) : (
                  <div className="w-full aspect-video lg:absolute lg:inset-0 lg:h-full bg-slate-900" />
                )}
                
                {/* Gradient to fade the bottom of the image smoothly into the background */}
                <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-green-950 to-transparent lg:hidden z-10" />
              </div>
              
              {/* Text container */}
              <div className="relative z-20 flex-1 flex flex-col items-center justify-start lg:justify-center px-4 md:px-10 pt-8 pb-10 lg:py-0 bg-green-950 lg:bg-transparent lg:absolute lg:inset-0">
                <div className="text-center max-w-5xl space-y-5 md:space-y-8 flex flex-col items-center">
                  
                  <div className={`overflow-hidden transition-all duration-1000 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <span className="inline-flex items-center gap-3 md:gap-4 text-white font-bold text-xs md:text-base uppercase tracking-[0.25em]">
                      <span className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-[color:var(--accent)] animate-pulse"></span>
                      {slide.tag}
                    </span>
                  </div>

                  <h1 className={`max-w-full text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-normal leading-[1.05] drop-shadow-2xl break-words [overflow-wrap:anywhere] transition-all duration-1000 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    {slide.title}
                  </h1>

                  <p className={`text-base sm:text-lg md:text-2xl text-white font-semibold max-w-3xl mx-auto drop-shadow-lg leading-relaxed transition-all duration-1000 delay-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {slide.subtitle}
                  </p>



                </div>
              </div>
            </div>
          );
        })}

        {/* Modern Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center px-4 md:px-8 z-30 pointer-events-none">
          <button onClick={prevSlide} className="pointer-events-auto p-4 rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <ChevronLeft size={28} />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 md:px-8 z-30 pointer-events-none">
          <button onClick={nextSlide} className="pointer-events-auto p-4 rounded-full bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Modern Floating Indicators */}
        <div className="hidden md:flex absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 z-30 gap-2 px-5 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
          {HERO_SLIDES.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-500 rounded-full h-1.5 ${currentSlide === index ? 'w-10 bg-[color:var(--accent)] shadow-[0_0_10px_var(--accent)]' : 'w-3 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* --- LATEST VIDEOS --- */}
      <section className="py-16 md:py-24 px-4 md:px-10 bg-[color:var(--page-bg)]">
        <div className="max-w-7xl mx-auto space-y-10">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-[color:var(--text-primary)] tracking-tight">Vipindi Vipya</h3>
              </div>
              <button onClick={() => onNavigate(StageId.MEDIA)} className="flex items-center gap-2 text-sm font-bold text-[color:var(--accent)] hover:text-[color:var(--text-primary)] transition-colors group">
                Tazama video zote <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestVideos.slice(0, 6).map((video: any, idx: number) => (
              <ScrollReveal key={video.id || idx} threshold={0.2} className="group cursor-pointer">
                <div onClick={() => onNavigate(StageId.MEDIA, `?video=${encodeURIComponent(video.id)}`)} className="flex flex-col h-full bg-[color:var(--surface-2)] rounded-3xl border border-[color:var(--line-strong)] hover:border-[color:var(--accent)] hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="relative aspect-video overflow-hidden bg-slate-900">
                    <img src={video.thumbnail || "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=800&auto=format&fit=crop"} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-full p-2">
                       <PlayCircle size={24} className="text-white opacity-90 group-hover:text-gold-400 transition-colors" />
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <span className="inline-block px-3 py-1 bg-[color:var(--surface-3)] border border-[color:var(--line-strong)] text-[color:var(--text-muted)] text-[9px] font-black uppercase tracking-widest rounded-full mb-4 w-fit">
                      {video.category || "Video Mpya"}
                    </span>
                    <h4 className="text-xl font-black text-[color:var(--text-primary)] mb-3 group-hover:text-[color:var(--accent)] transition-colors line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-sm text-[color:var(--text-muted)] leading-relaxed line-clamp-3 mb-6 flex-grow">
                      {video.description || "Tazama video hii mpya yenye mafundisho ya kiroho."}
                    </p>
                    <div className="mt-auto flex justify-between items-center text-xs font-bold text-[color:var(--text-muted)] opacity-70">
                      <span>{video.date || video.posted_at || ""}</span>
                      {video.duration && <span>{video.duration} min</span>}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- QUICK ACCESS / WAYS TO GROW --- */}
      <section className="py-12 md:py-20 px-4 md:px-10 bg-[color:var(--surface-1)]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUICK_LINKS.map((link, idx) => (
                <button 
                  key={idx}
                  onClick={() => onNavigate(link.id)}
                  className="group flex flex-col items-center text-center p-8 bg-[color:var(--surface-2)] rounded-3xl border border-[color:var(--line-strong)] hover:border-[color:var(--accent)] hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${link.bg} ${link.color} group-hover:scale-110 transition-transform`}>
                    {link.icon}
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-[color:var(--text-primary)] mb-3">{link.title}</h3>
                  <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">{link.desc}</p>
                </button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- FEATURED DEEP DIVE --- */}
      <section className="py-16 md:py-24 px-4 md:px-10 bg-[color:var(--page-bg)]">
        <div className="max-w-7xl mx-auto space-y-12">
          <ScrollReveal className="text-center space-y-4">
             <h2 className="text-sm font-black text-[color:var(--accent)] uppercase tracking-[0.2em]">Chunguza Zaidi</h2>
             <h3 className="text-3xl md:text-5xl font-black text-[color:var(--text-primary)] uppercase tracking-tight">Kina cha Ukweli</h3>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DEEP_DIVE_SECTIONS.map((section, idx) => (
              <ScrollReveal key={idx} threshold={0.2} className="relative group cursor-pointer" >
                <div onClick={() => onNavigate(section.id)} className="block w-full h-[400px] rounded-3xl overflow-hidden relative shadow-lg">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                  {section.img ? (
                    <img 
                      src={section.img} 
                      alt={section.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-slate-800" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                    <div className="flex items-center gap-3 mb-3 text-[color:var(--accent)]">
                      {section.icon}
                      <span className="text-xs font-black uppercase tracking-[0.2em]">{section.title}</span>
                    </div>
                    <p className="text-white font-medium text-sm md:text-base opacity-90 group-hover:opacity-100 transition-opacity line-clamp-3">
                      {section.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION (DONATE / SUPPORT) --- */}
      <section className="py-20 md:py-32 px-4 md:px-10 bg-[color:var(--surface-2)] relative overflow-hidden border-t border-[color:var(--line-strong)]">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[color:var(--accent)] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
         <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            <ScrollReveal>
              <div className="w-20 h-20 bg-[color:var(--accent-soft)] text-[color:var(--accent)] rounded-full flex items-center justify-center mx-auto mb-8">
                <Globe size={40} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-[color:var(--text-primary)] uppercase tracking-tight leading-tight">
                Peleka Injili <br/> Hadi Mwisho wa Dunia
              </h2>
              <p className="text-lg md:text-xl text-[color:var(--text-muted)] font-medium max-w-2xl mx-auto mt-6">
                Msaada wako unatuwezesha kufikia mamilioni ya watu duniani kote kwa ujumbe wa matumaini, uponyaji, na ukweli wa Biblia.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => onNavigate(StageId.DONATE)} 
                  className="px-10 py-4 bg-[color:var(--accent)] text-[color:var(--accent-ink)] font-black uppercase tracking-widest rounded-full hover:bg-[color:var(--accent-strong)] hover:scale-105 transition-all shadow-[0_10px_30px_rgba(234,179,8,0.2)]"
                >
                  Saidia Huduma
                </button>
                <button 
                  onClick={() => onNavigate(StageId.ABOUT)} 
                  className="px-10 py-4 border-2 border-[color:var(--line-strong)] text-[color:var(--text-primary)] font-black uppercase tracking-widest rounded-full hover:border-[color:var(--text-primary)] hover:bg-[color:var(--surface-3)] transition-all"
                >
                  Soma Kuhusu Sisi
                </button>
              </div>
            </ScrollReveal>
         </div>
      </section>

    </div>
  );
};
