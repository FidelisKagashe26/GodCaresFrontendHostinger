
import React, { useState, useEffect } from 'react';
import { StageConfig, StageId, Award } from '../types';
import { 
  Trophy, ArrowRight, Lock, CheckCircle2, 
  Activity, BookOpen, ShieldCheck, 
  Search, ChevronDown, BookCheck, Heart, Book, Shield, Church
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  userName?: string;
  completedStages: StageId[];
  unlockedStages: StageId[];
  stages: StageConfig[];
  currentActiveStage: StageId;
  onNavigate: (id: StageId) => void;
  awards: Award[];
}

const HERO_CARDS = [
  {
    prompt: "Cinematic digital painting of a majestic heavenly sanctuary, golden light streaming from the throne, seventh-day adventist sanctuary doctrine style, highly detailed, spiritual atmosphere, 4k",
    tag: "Huduma ya Patakatifu",
    title: "Mungu Anakujali",
    swahiliTitle: "UPENDO WA MILELE",
    subtitle: "Gundua jinsi Kristo anavyotuombea katika patakatifu pa mbinguni.",
    cta: "Anza Safari",
    image: "https://images.unsplash.com/photo-1543165731-0d29792694b8?auto=format&fit=crop&q=80&w=2000"
  },
  {
    prompt: "An ancient stone tablet with the Ten Commandments being illuminated by a divine light from above, dramatic clouds in the background, Seventh-day Adventist law and grace theme, 4k",
    tag: "Sheria na Neema",
    title: "Misingi ya Ukweli",
    swahiliTitle: "AMRI ZA MUNGU",
    subtitle: "Zifahamu amri kumi kama kioo cha upendo wa Mungu kwa mwanadamu.",
    cta: "Jifunze Zaidi",
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=2000"
  },
  {
    prompt: "Three angels flying in the midst of heaven against a vibrant sunset sky, holding golden trumpets, proclaiming the everlasting gospel to every nation, SDA three angels message theme, 4k",
    tag: "Ujumbe wa Mwisho",
    title: "Saa ya Hukumu",
    swahiliTitle: "UJUMBE WA MALAIKA",
    subtitle: "Matumaini yapo katika ujumbe wa malaika watatu. Jiandae kwa marejeo ya Yesu.",
    cta: "Gundua Unabii",
    image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=2000"
  }
];

const buildSparklinePath = (data: number[], width: number, height: number) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const step = width / (data.length - 1);
  return data
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  userName = "Seeker", 
  completedStages, 
  unlockedStages,
  stages, 
  currentActiveStage,
  onNavigate,
  awards
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>(HERO_CARDS.map(c => c.image));
  
  const nextStage = stages.find(s => s.id === currentActiveStage && s.id !== StageId.HOME) || stages[1];

  useEffect(() => {
    const generateImages = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const newImages = [...heroImages];
        for (let i = 0; i < HERO_CARDS.length; i++) {
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image', 
              contents: { parts: [{ text: HERO_CARDS[i].prompt }] }
            });
            const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (part) {
               newImages[i] = `data:image/png;base64,${part.inlineData.data}`;
               setHeroImages([...newImages]);
            }
          } catch (e: any) {
            console.warn("Dashboard image generation skipped:", e);
          }
        }
      } catch (e) {
        console.error("Dashboard AI Init Error:", e);
      }
    };
    generateImages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % HERO_CARDS.length), 7000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const zoomScale = Math.max(1, 1.1 - scrollY / 5000);

  const weeklyEngagement = [24, 32, 28, 46, 52, 41, 60];
  const prayerTrend = [12, 18, 15, 21, 19, 26, 30];
  const contentMix = [
    { label: "Maktaba", value: 68 },
    { label: "Video", value: 52 },
    { label: "Mafundisho", value: 74 },
    { label: "Habari", value: 38 }
  ];

  return (
    <div className="animate-fade-in pb-20 overflow-x-hidden">
      <section className="relative h-[70vh] -mt-12 -mx-12 flex items-center justify-center overflow-hidden rounded-b-xl bg-primary-900 shadow-2xl">
        {heroImages.map((img, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${zoomScale})` }}>
              <img src={img} className="w-full h-full object-cover brightness-[0.35] contrast-125" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-primary-950/50"></div>
            </div>
          </div>
        ))}

        <div className="relative z-20 w-full max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center md:text-left space-y-6 animate-scale-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold-400/30 text-gold-400 rounded text-[9px] font-black uppercase tracking-[0.3em] mb-2 backdrop-blur-sm">
              <Book size={12} /> {HERO_CARDS[currentSlide].tag}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
              {HERO_CARDS[currentSlide].title}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed italic border-l-2 border-gold-400 pl-6">
              "{HERO_CARDS[currentSlide].subtitle}"
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button 
                onClick={() => onNavigate(nextStage.id)}
                className="w-full sm:w-auto bg-gold-400 text-primary-900 px-8 py-3.5 rounded-lg font-black text-sm flex items-center justify-center gap-2 hover:bg-gold-300 transition-all shadow-lg active:scale-95"
              >
                {HERO_CARDS[currentSlide].cta} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-12 relative z-30">
          {[
            { icon: <Trophy size={20} />, label: "Tuzo Zako", value: awards.length },
            { icon: <CheckCircle2 size={20} />, label: "Hatua Zilizokamilika", value: completedStages.length },
            { icon: <Activity size={20} />, label: "Lengo la Sasa", value: nextStage.title, isFull: true }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-6 hover:shadow-xl transition-all duration-300 group">
               <div className="text-gold-500 group-hover:scale-110 transition-transform">
                  {stat.icon}
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
                  <p className={`text-lg font-black text-primary-900 dark:text-white ${stat.isFull ? 'truncate max-w-[150px]' : ''}`}>{stat.value}</p>
               </div>
            </div>
          ))}
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Mwenendo wa Wiki</p>
                <h3 className="text-2xl font-black text-primary-900 dark:text-white">Ushiriki wa Wanafunzi</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold-500">
                Live <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
              </div>
            </div>
            <div className="relative h-48">
              <svg viewBox="0 0 600 200" className="w-full h-full">
                <defs>
                  <linearGradient id="engagementGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${buildSparklinePath(weeklyEngagement, 600, 160)} L 600 200 L 0 200 Z`}
                  fill="url(#engagementGradient)"
                />
                <path
                  d={buildSparklinePath(weeklyEngagement, 600, 160)}
                  stroke="#f59e0b"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute bottom-4 left-4 text-xs text-slate-400 dark:text-slate-500">Jumatatu - Jumapili</div>
            </div>
          </div>

          <div className="bg-primary-900 dark:bg-slate-950 rounded-2xl border border-primary-800 dark:border-slate-800 shadow-xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-300/80">Kipimo Cha Roho</p>
                <h3 className="text-2xl font-black">Maombi & Habari</h3>
              </div>
              <Shield size={18} className="text-gold-400" />
            </div>
            <div className="h-36">
              <svg viewBox="0 0 300 160" className="w-full h-full">
                <defs>
                  <linearGradient id="prayerGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${buildSparklinePath(prayerTrend, 300, 120)} L 300 160 L 0 160 Z`}
                  fill="url(#prayerGradient)"
                />
                <path
                  d={buildSparklinePath(prayerTrend, 300, 120)}
                  stroke="#38bdf8"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-xs uppercase tracking-widest text-slate-300">
              <div>
                <p className="text-[10px] text-slate-400">Maombi mapya</p>
                <p className="text-lg font-black text-white">+38%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Habari leo</p>
                <p className="text-lg font-black text-white">12</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Muhtasari wa Vyanzo</p>
                <h3 className="text-2xl font-black text-primary-900 dark:text-white">Maktaba dhidi ya Media</h3>
              </div>
              <BookOpen size={18} className="text-gold-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {contentMix.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <span>{item.label}</span>
                    <span className="text-slate-900 dark:text-white font-black">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Akaunti</p>
                <h3 className="text-2xl font-black text-primary-900 dark:text-white">Hali ya Safari</h3>
              </div>
              <Church size={18} className="text-gold-500" />
            </div>
            <div className="space-y-4">
              {[
                { label: "Hatua Zilizofunguliwa", value: unlockedStages.length, total: stages.length - 1 },
                { label: "Safari Yako", value: completedStages.length, total: stages.length - 1 },
                { label: "Tuzo Zilizopatikana", value: awards.length, total: 12 }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                    <span>{item.label}</span>
                    <span className="text-slate-900 dark:text-white font-black">{item.value}/{item.total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-900 to-gold-500"
                      style={{ width: `${Math.min(100, (item.value / item.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-16 text-center">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em]">HUDUMA YETU</h3>
            <h2 className="text-3xl md:text-5xl font-black text-primary-900 dark:text-white tracking-tighter">Gundua God Cares 365</h2>
            <div className="w-12 h-1 bg-gold-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: StageId.BIBLE_STUDY, title: "Misingi ya Imani", desc: "Anza na maswali ya asili ya Biblia.", icon: <BookCheck size={32} /> },
              { id: StageId.BIBLE_STUDY, title: "Unabii wa Nyakati", desc: "Zijue siri za Danieli na Ufunuo.", icon: <Search size={32} /> },
              { id: StageId.LIBRARY, title: "Maktaba ya Roho", desc: "Pakua vitabu vya bure vya unabii.", icon: <BookOpen size={32} /> }
            ].map((item, i) => (
              <div 
                key={i} 
                onClick={() => onNavigate(item.id)}
                className="bg-primary-900 dark:bg-slate-900 p-10 rounded-xl text-white hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-primary-800 dark:border-slate-800 flex flex-col items-center text-center"
              >
                <div className="mb-6 group-hover:scale-110 transition-all text-gold-400">
                  {item.icon}
                </div>
                <h4 className="text-xl font-black mb-3 group-hover:text-gold-400 transition-colors">{item.title}</h4>
                <p className="text-slate-400 font-medium leading-relaxed mb-8 text-sm">{item.desc}</p>
                <div className="mt-auto flex items-center gap-2 text-gold-400 font-black text-[9px] uppercase tracking-widest">
                  Gundua Zaidi <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
           <div className="bg-primary-900 dark:bg-slate-900 p-12 rounded-xl text-white shadow-xl group transition-all border border-primary-800 dark:border-slate-800">
              <Heart className="text-gold-400 mb-6" size={40} fill="currentColor" />
              <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase">Saidia Misheni</h3>
              <p className="text-slate-400 text-base mb-8 leading-relaxed max-w-sm">Jiunge nasi kusaidia kutangaza injili ya milele ulimwenguni kote.</p>
              <button onClick={() => onNavigate(StageId.DONATE)} className="bg-gold-400 text-primary-900 px-8 py-3 rounded-lg font-black text-sm hover:bg-gold-300 transition-all">
                Changia Sasa
              </button>
           </div>

           <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl group transition-all">
              <ShieldCheck className="text-primary-900 dark:text-white mb-6" size={40} />
              <h3 className="text-3xl font-black text-primary-900 dark:text-white mb-4 tracking-tighter uppercase">Ukweli kwa Wote</h3>
              <p className="text-slate-500 dark:text-slate-400 text-base mb-8 leading-relaxed max-w-sm">Jifunze zaidi kuhusu misingi yetu ya imani na malengo ya huduma hii.</p>
              <button onClick={() => onNavigate(StageId.ABOUT)} className="bg-primary-900 dark:bg-slate-800 text-white px-8 py-3 rounded-lg font-black text-sm hover:bg-primary-800 transition-all">
                Kuhusu Sisi
              </button>
           </div>
        </section>
      </div>
    </div>
  );
};
