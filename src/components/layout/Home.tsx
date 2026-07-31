import React, { useState, useEffect, useRef } from 'react';
import { StageId } from '../../types';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../../services/core/siteSettingsService';
import { 
  ArrowRight, BookOpen, ShieldCheck, Microscope, PlayCircle, 
  Clock, ChevronRight, ChevronLeft, Calendar, Newspaper, BookMarked, Play,
  Globe, Users, Star, Gift, Book
} from 'lucide-react';

interface HomeProps {
  onNavigate: (id: StageId) => void;
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

  const HERO_SLIDES = [
    {
      image: resolvedSiteSettings.home_truth_story_1_image || "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=2500",
      title: "Ukweli Unaoweka Huru",
      subtitle: "Gundua mafundisho ya kina ya Biblia, kuelewa Pambano Kuu, na kumkaribia Mungu.",
      tag: "Mafundisho Mapya",
      action: "Anza Kujifunza",
      stageId: StageId.BIBLE_STUDY
    },
    {
      image: resolvedSiteSettings.home_hope_story_1_image || "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=2500",
      title: "Ramani ya Unabii",
      subtitle: "Fahamu matukio ya siku za mwisho na ujumbe wa malaika watatu kwa wakati wetu.",
      tag: "Unabii wa Biblia",
      action: "Chunguza Unabii",
      stageId: StageId.TIMELINE
    },
    {
      image: resolvedSiteSettings.home_deception_story_1_image || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2500",
      title: "Kituo cha Habari",
      subtitle: "Tazama mahubiri, vipindi, na mafundisho ya moja kwa moja ya GodCares 365.",
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
    { id: StageId.TIMELINE, title: "Ramani ya Unabii", icon: <Clock size={20} />, img: resolvedSiteSettings.home_truth_story_2_image || "https://images.unsplash.com/photo-1534430480872-3498384e54e6?q=80&w=1000", desc: "Tazama historia ya dunia kwa mtazamo wa kinabii." },
    { id: StageId.EVIDENCE, title: "Hifadhi ya Ushahidi", icon: <Microscope size={20} />, img: resolvedSiteSettings.home_deception_story_2_image || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000", desc: "Sayansi na akiolojia zinazothibitisha ukweli wa Biblia." },
    { id: StageId.DECEPTION_VAULT, title: "Kutambua Uongo", icon: <ShieldCheck size={20} />, img: resolvedSiteSettings.home_hope_story_2_image || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000", desc: "Jilinde dhidi ya mafundisho potofu ya siku za mwisho." },
  ];

  return (
    <div className="w-full min-h-screen bg-[color:var(--page-bg)] text-[color:var(--text-primary)] font-sans overflow-x-hidden">
      
      {/* --- DYNAMIC CAROUSEL HERO --- */}
      <section className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden group">
        {HERO_SLIDES.map((slide, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img 
              src={slide.image} 
              alt={slide.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out ${currentSlide === index ? 'scale-105' : 'scale-100'}`} 
            />
            <div className="absolute inset-0 flex items-center justify-center z-20 px-4 md:px-10">
              <div className="text-center max-w-4xl space-y-6">
                <span className="inline-block px-4 py-1.5 bg-[color:var(--accent)]/90 backdrop-blur text-[color:var(--accent-ink)] font-black text-xs uppercase tracking-[0.2em] rounded-full">
                  {slide.tag}
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[1.1] drop-shadow-xl">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-2xl text-slate-200 font-medium max-w-2xl mx-auto drop-shadow-md">
                  {slide.subtitle}
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => onNavigate(slide.stageId)} 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-black uppercase tracking-widest text-sm rounded-full hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-ink)] transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                  >
                    {slide.action} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Arrows */}
        <button onClick={prevSlide} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 text-white backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 text-white backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100">
          <ChevronRight size={24} />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {HERO_SLIDES.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full h-1.5 ${currentSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
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
                  <img 
                    src={section.img} 
                    alt={section.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
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
