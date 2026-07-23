
import React, { useState, useEffect, useRef } from 'react';
import { StageId } from '../../types';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../../services/core/siteSettingsService';
import { 
  ArrowRight, BookOpen, ShieldCheck, Microscope, PlayCircle, 
  Clock, ChevronDown, Compass, AlertTriangle, 
  HelpCircle, Cross, Fingerprint, 
  Search, Play
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
      className={`${className} transform-gpu will-change-transform transition duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 md:translate-y-10'
      }`}
    >
      {children}
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ onNavigate, siteSettings }) => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);
  const [activeDef, setActiveDef] = useState<'ukweli' | 'uongo' | null>(null);
  const resolvedSiteSettings = siteSettings || DEFAULT_SITE_SETTINGS;

  const QUESTIONS = [
    { id: 0, q: "Nimetoka Wapi?", a: "Sisi si ajali ya kibiolojia. Mungu alisema, 'Na tumfanye mtu kwa mfano wetu, kwa sura yetu.' Tumeumbwa kwa mfano wa Mungu (Mwanzo 1:26-27). Asili yako ni Mbinguni.", icon: <Fingerprint /> },
    { id: 1, q: "Kwanini Nipo Hapa?", a: "Kumtukuza Mungu na kuwa wakili wa uumbaji wake. 'Kila mmoja aliyeitwa kwa jina langu, niliyemwumba kwa ajili ya utukufu wangu.' (Isaya 43:7).", icon: <Compass /> },
    { id: 2, q: "Kwanini Kuna Uovu?", a: "Uovu ni matokeo ya uhuru wa kuchagua. Mungu alitaka upendo wa hiari, si wa kulazimishwa. Uasi ulianzia mbinguni (Isaya 14:12-14).", icon: <AlertTriangle /> },
    { id: 3, q: "Naenda Wapi Nikifa?", a: "Kifo ni usingizi. 'Kwa maana walio hai wanajua ya kwamba watakufa; lakini wafu hawajui neno lo lote.' (Mhubiri 9:5). Tunangoja ufufuo.", icon: <Clock /> },
    { id: 4, q: "Suluhisho ni Nini?", a: "Yesu Kristo. 'Mimi ndimi njia, na kweli, na uzima; mtu haji kwa Baba, ila kwa njia ya mimi.' (Yohana 14:6).", icon: <Cross /> }
  ];

  const TOOLS = [
    { id: StageId.BIBLE_STUDY, title: "Biblia", desc: "Andiko safi.", icon: <BookOpen size={18} />, color: "text-green-700 dark:text-green-300" },
    { id: StageId.TIMELINE, title: "Unabii", desc: "Historia.", icon: <Clock size={18} />, color: "text-blue-700 dark:text-blue-300" },
    { id: StageId.DECEPTION_VAULT, title: "Fichua", desc: "Pambanua.", icon: <ShieldCheck size={18} />, color: "text-green-700 dark:text-green-300" },
    { id: StageId.EVIDENCE, title: "Ushahidi", desc: "Sayansi.", icon: <Microscope size={18} />, color: "text-blue-700 dark:text-blue-300" },
    { id: StageId.QUESTION_VAULT, title: "Majibu", desc: "Maswali.", icon: <HelpCircle size={18} />, color: "text-gold-700 dark:text-gold-300" },
    { id: StageId.MEDIA, title: "Midia", desc: "Video.", icon: <PlayCircle size={18} />, color: "text-blue-700 dark:text-blue-300" }
  ];

  const truthSteps = [
    { id: 1, tag: "Mwaka 31 B.K. - Yerusalemu", h2: "Pilato Anauliza Swali la Milenia.", h3: "KWELI NI NINI?", p: <><span className="text-slate-900 dark:text-slate-100 font-medium">Swali hili la miaka 2,000, lililoulizwa na gavana wa Kirumi, limesafiri katika korido za wakati na bado linasumbua hadi leo. Katika zama zetu za AI, ukweli umechakachuliwa, umeburuzwa, umepuuzwa, umefifishwa, na katika sehemu nyingine umeangamizwa kabisa.</span></>, img: resolvedSiteSettings.home_truth_story_1_image || "https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=2000" },
    { id: 2, tag: "Jibu la Mfalme", h2: "Yesu Anamjibu Pilato.", h3: "NIMEKUJA NIISHUHUDIE KWELI.", p: <>"Mimi nimezaliwa kwa ajili ya haya, na kwa ajili ya haya mimi nalikuja ulimwenguni, ili niishuhudie kweli. Kila aliye wa hiyo kweli hunisikia sauti yangu." - <span className="text-green-700 dark:text-green-300 font-black">Yohana 18:37</span></>, img: resolvedSiteSettings.home_truth_story_2_image || "https://images.unsplash.com/photo-1512117187123-f365d9c227ba?q=80&w=2000" },
    { id: 3, tag: "Dhana Moja", h2: "Kweli Zipo Ngapi?", h3: "UKWELI UPO MMOJA TU.", p: <>"Yesu akamwambia, Mimi ndimi njia, na kweli, na uzima; mtu haji kwa Baba, ila kwa njia ya mimi." - <span className="text-green-700 dark:text-green-300 font-black">Yohana 14:6</span> <br/><br/> <span className="text-slate-900 dark:text-slate-100 font-medium">Kwa kuwa ukweli ni msingi wa kile tunachoamini, lazima uwe mmoja.</span></>, img: resolvedSiteSettings.home_truth_story_3_image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000" }
  ];

  const deceptionSteps = [
    { id: 1, tag: "Utabiri", h2: "Siku za Mwisho Zitakuwaje?", h3: "WATU WENGI WATADANGANYWA.", p: <>"Yesu akajibu, akawaambia, Angalieni, mtu asiwadanganye." - <span className="text-green-600 font-black">Mathayo 24:6</span> <br/><br/> <span className="text-green-600 font-medium italic">Yesu alionya kuhusu udanganyifu na fikra kwamba kila mtu ana ukweli wake.</span></>, img: resolvedSiteSettings.home_deception_story_1_image || "https://images.unsplash.com/photo-1463130436662-3162799c0a37?q=80&w=2000" },
    { id: 2, tag: "Asili ya Uongo", h2: "Shetani Ndiye Muongo.", h3: "YESU ALISEMA.", p: <>"Ninyi ni wa baba yenu, Ibilisi, na tamaa za baba yenu ndizo mpendazo kuzitenda. Yeye alikuwa mwuaji tangu mwanzo; wala hakusimama katika kweli, kwa kuwa hamna hiyo kweli ndani yake. Asemapo uongo, husema yaliyo yake mwenyewe; kwa sababu yeye ni mwongo, na baba wa huo." - <span className="text-green-600 font-black">Yohana 8:44</span></>, img: resolvedSiteSettings.home_deception_story_2_image || "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2000" },
    { id: 3, tag: "Kilele cha Udanganyifu", h2: "Shetani Ameudanganya Ulimwengu Wote.", h3: "KILA MTU AMEDANGANYWA.", p: <>"Yule joka akatupwa, yule mkubwa, nyoka wa zamani, aitwaye Ibilisi na Shetani, audanganyaye ulimwengu wote; akatupwa hata nchi, na malaika zake wakatupwa pamoja naye." - <span className="text-green-600 font-black">Ufunuo 12:9</span></>, img: resolvedSiteSettings.home_deception_story_3_image || "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2000" }
  ];

  const hopeSteps = [
    { id: 1, tag: "Tumaini Limerejea", h2: "Tunalo Tumaini", h3: "TUNAWEZA KUUJUA UKWELI", p: <>"Tena mtaifahamu kweli, nayo hiyo kweli itawaweka huru." - <span className="text-green-600 font-black">Yohana 8:32</span> <br/><br/> <span className="text-green-600 font-medium italic">Ukweli unaweza kufichwa kwa muda, lakini hauwezi kufichwa milele.</span></>, img: resolvedSiteSettings.home_hope_story_1_image || "https://images.unsplash.com/photo-1491466424936-e304919aada7?q=80&w=2000" },
    { id: 2, tag: "Njia ya Mafanikio", h2: "Kuutafuta Ukweli", h3: "UKWELI UNAPATIKANA", p: <>"Tafuteni, nanyi mtaona;" - <span className="text-green-600 font-black">Mathayo 7:7</span> <br/> "Mtafuteni Bwana, maadamu anapatikana; mwiteni, maadamu yu karibu;" - <span className="text-green-600 font-black">Isaya 55:6</span> <br/><br/> <span className="text-green-600 font-medium italic">Tukiutafuta ukweli, tutaupata. Hili ni jukumu letu: kuutafuta ukweli.</span></>, img: resolvedSiteSettings.home_hope_story_2_image || "https://images.unsplash.com/photo-1454165833767-02638a5996bc?q=80&w=2000" },
  ];

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden font-sans selection:bg-green-500/30">
      
      {/* --- HERO --- */}
      <section className="relative min-h-[62vh] sm:min-h-[66vh] md:min-h-[72vh] flex flex-col items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2500" className="w-full h-full object-cover opacity-85 dark:opacity-75 animate-zoom-in-subtle" alt="Anga" />
           <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/35 to-white/80 dark:from-slate-950/75 dark:via-slate-950/30 dark:to-slate-950/85"></div>
        </div>
         <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl space-y-6">
           <ScrollReveal>
             <div className="inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 mb-6 shadow-sm">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.12em] uppercase text-green-700 dark:text-green-300">Yohana 8:32</span>
             </div>
             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.92] uppercase">GOD CARES <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-green-600 to-green-800">365</span></h1>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 pt-8 sm:pt-14">
                <button onClick={() => onNavigate(StageId.BIBLE_STUDY)} className="group relative px-7 sm:px-10 py-3.5 bg-green-700 text-white font-black text-[11px] uppercase tracking-[0.09em] hover:bg-green-800 hover:shadow-lg transition-all rounded-full w-full sm:w-auto border border-green-700">
                  <span className="relative z-10 flex items-center justify-center gap-2">Anza Safari <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/></span>
                </button>
                <button onClick={() => onNavigate(StageId.MEDIA)} className="group relative px-7 sm:px-10 py-3.5 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-black text-[11px] uppercase tracking-[0.09em] hover:border-slate-500 dark:hover:border-slate-400 hover:shadow-md transition-all rounded-full w-full sm:w-auto bg-white/95 dark:bg-slate-900/95">
                  <span className="relative z-10 flex items-center justify-center gap-2">Tazama Video <Play size={14} className="group-hover:scale-110 transition-transform" fill="currentColor"/></span>
                </button>
             </div>
           </ScrollReveal>
        </div>
      </section>

      {/* --- Hitaji letu la Ukweli --- */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 bg-white dark:bg-slate-950">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14 text-center">
            <h3 className="text-green-700 dark:text-green-300 font-black text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-widest mb-6 italic">Hitaji letu la Ukweli</h3>
            <div className="h-1 w-20 bg-green-700 mx-auto rounded-full"></div>
         </div>

        {truthSteps.map((step, i) => (
          <div key={i} className="relative min-h-[58vh] sm:min-h-[64vh] md:min-h-[75vh] flex items-center overflow-hidden border-b border-slate-200 dark:border-white/5">
            <img src={step.img} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70 dark:opacity-65 transition-transform duration-[5s] ease-out md:hover:scale-105" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 via-green-50/20 to-transparent dark:from-[#020617]/60 dark:via-[#020617]/15 dark:to-transparent"></div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
              <ScrollReveal className={i % 2 === 1 ? "text-right ml-auto" : ""}>
                <div className={`inline-flex items-center gap-3 mb-6 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-green-200 dark:border-slate-700 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-black text-[18px] shadow-sm">0{step.id}</div>
                    <span className="text-green-700 dark:text-green-300 font-black text-[12px] sm:text-[13px] md:text-[14px] lg:text-[14px] uppercase tracking-widest">{step.tag}</span>
                </div>
                <h2 className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] xl:text-[32px] font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">{step.h2}</h2>
                <div className={`bg-white/95 dark:bg-slate-900/90 p-5 xs:p-7 sm:p-10 md:p-12 lg:p-14 border-l-4 ${i % 2 === 1 ? 'border-r-4 border-l-0 text-right' : 'border-l-4'} border-green-500 shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] max-w-3xl ${i % 2 === 1 ? 'ml-auto' : ''} rounded-2xl transition-all border border-green-200/80 dark:border-slate-700 hover:border-gold-400/70`}>
                  <h3 className="text-[16px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 sm:mb-6">{step.h3}</h3>
                  <div className="text-sm sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] text-slate-700 dark:text-slate-200 font-serif leading-relaxed">{step.p}</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        ))}
      </section>

      {/* --- Changamoto ya Kudanganywa --- */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 bg-white dark:bg-slate-950">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14 text-center">
            <h3 className="text-green-700 dark:text-green-300 font-black text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-widest mb-6 italic">Changamoto ya Kudanganywa</h3>
            <div className="h-1 w-20 bg-green-700 mx-auto rounded-full"></div>
         </div>

        {deceptionSteps.map((step, i) => (
          <div key={i} className="relative min-h-[58vh] sm:min-h-[64vh] md:min-h-[75vh] flex items-center overflow-hidden border-b border-slate-200 dark:border-white/5">
            <img src={step.img} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70 dark:opacity-65 transition-transform duration-[5s] ease-out md:hover:scale-105" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 via-green-50/20 to-transparent dark:from-[#050b1d]/60 dark:via-[#050b1d]/15 dark:to-transparent"></div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
              <ScrollReveal className={i % 2 === 0 ? "text-right ml-auto" : ""}>
                <div className={`inline-flex items-center gap-3 mb-6 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-green-200 dark:border-slate-700 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-black text-[18px] shadow-sm">0{step.id}</div>
                    <span className="text-green-700 dark:text-green-300 font-black text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-widest">{step.tag}</span>
                </div>
                <h2 className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] xl:text-[32px] font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">{step.h2}</h2>
                <div className={`bg-white/95 dark:bg-slate-900/90 p-5 xs:p-7 sm:p-10 md:p-12 lg:p-14 border-l-4 ${i % 2 === 1 ? 'border-r-4 border-l-0 text-right' : 'border-l-4'} border-green-500 shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] max-w-3xl ${i % 2 === 1 ? 'ml-auto' : ''} rounded-2xl transition-all border border-green-200/80 dark:border-slate-700 hover:border-gold-400/70`}>
                  <h3 className="text-[16px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 sm:mb-6">{step.h3}</h3>
                  <div className="text-sm sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] text-slate-700 dark:text-slate-200 font-serif leading-relaxed">{step.p}</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        ))}
      </section>

      {/* --- Ukweli upo. --- */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 bg-white dark:bg-slate-950">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14 text-center">
            <h3 className="text-green-700 dark:text-green-300 font-black text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-widest mb-6 italic">Ukweli upo.</h3>
            <div className="h-1 w-20 bg-green-700 mx-auto rounded-full"></div>
         </div>

        {hopeSteps.map((step, i) => (
          <div key={i} className="relative min-h-[58vh] sm:min-h-[64vh] md:min-h-[75vh] flex items-center overflow-hidden border-b border-slate-200 dark:border-white/5">
            <img src={step.img} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70 dark:opacity-65 transition-transform duration-[5s] ease-out md:hover:scale-105" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 via-green-50/20 to-transparent dark:from-[#020617]/60 dark:via-[#020617]/15 dark:to-transparent"></div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
              <ScrollReveal className={i % 2 === 1 ? "text-right ml-auto" : ""}>
                <div className={`inline-flex items-center gap-3 mb-6 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 border border-green-200 dark:border-slate-700 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-black text-[18px] shadow-sm">0{step.id}</div>
                    <span className="text-green-500 font-black text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-widest">{step.tag}</span>
                </div>
                <h2 className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[30px] xl:text-[32px] font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">{step.h2}</h2>
                <div className={`bg-white/95 dark:bg-slate-900/90 p-5 xs:p-7 sm:p-10 md:p-12 lg:p-14 border-l-4 ${i % 2 === 1 ? 'border-r-4 border-l-0 text-right' : 'border-l-4'} border-green-500 shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] max-w-3xl ${i % 2 === 1 ? 'ml-auto' : ''} rounded-2xl transition-all border border-green-200/80 dark:border-slate-700 hover:border-gold-400/70`}>
                  <h3 className="text-[16px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 sm:mb-6">{step.h3}</h3>
                  <div className="text-sm sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] text-slate-700 dark:text-slate-200 font-serif leading-relaxed">{step.p}</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        ))}
      </section>

      {/* --- Mgongano wa Mawazo --- */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950">
         <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
            <ScrollReveal className="text-center space-y-6 sm:space-y-8">
               <h3 className="text-green-500 font-black text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-widest mb-6 italic">Mgongano wa Mawazo</h3>
               <div className="h-1 w-20 bg-green-700 mx-auto rounded-full"></div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
               <ScrollReveal className="bg-white/95 dark:bg-slate-900/90 border border-green-200/80 dark:border-slate-700 p-7 xs:p-8 sm:p-10 rounded-2xl shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] group hover:border-gold-400/80 hover:shadow-[0_14px_28px_rgba(212,154,20,0.12)] transition-all">
                  <h3 className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[28px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 sm:mb-8">Dilema ya Leo</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-[15px] md:text-[16px] leading-relaxed mb-8 sm:mb-10 font-serif">
                    <span className="text-slate-900 dark:text-slate-100 font-medium italic">Wakristo wengi wanapenda neema ya Mungu, lakini wanaukataa ukweli aliomtuma Yesu kuushuhudia. Wanasahau kuwa huwezi kutenganisha neema na kweli, maana Yesu amejaa vyote viwili.</span>
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                     <div className="p-4 xs:p-5 sm:p-6 bg-slate-50 dark:bg-slate-900 border-l-4 border-green-500 text-slate-700 dark:text-slate-300 text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed italic rounded-lg">
                        "Kwa kuwa torati ilitolewa kwa mkono wa Musa; neema na kweli zilikuja kwa mkono wa Yesu Kristo." - <span className="text-green-500 font-black">Yohana 1:17</span>
                     </div>
                     <div className="p-4 xs:p-5 sm:p-6 bg-slate-50 dark:bg-slate-900 border-l-4 border-green-500 text-slate-700 dark:text-slate-300 text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed italic rounded-lg">
                        "Naye Neno alifanyika mwili, akakaa kwetu; nasi tukauona utukufu wake, utukufu kama wa Mwana pekee atokaye kwa Baba; amejaa neema na kweli." - <span className="text-green-500 font-black">Yohana 1:14</span>
                     </div>
                  </div>
               </ScrollReveal>

               <ScrollReveal className="bg-white/95 dark:bg-slate-900/90 border border-green-200/80 dark:border-slate-700 p-7 xs:p-8 sm:p-10 rounded-2xl shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] group hover:border-gold-400/80 hover:shadow-[0_14px_28px_rgba(212,154,20,0.12)] transition-all">
                  <h3 className="text-[18px] sm:text-[22px] md:text-[26px] lg:text-[28px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 sm:mb-8">Ukweli Unapatikana Wapi?</h3>
                  <div className="p-6 xs:p-7 sm:p-10 bg-gold-50 dark:bg-slate-900 border border-gold-300/60 dark:border-gold-500/40 rounded-2xl text-center space-y-4 sm:space-y-5 mb-8 sm:mb-10">
                     <div className="w-12 xs:w-14 sm:w-16 bg-gold-100 dark:bg-gold-900/40 rounded-full flex items-center justify-center mx-auto text-gold-700 dark:text-gold-300 shadow-sm"><Search size={24}/></div>
                     <h5 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-black text-slate-900 dark:text-white uppercase tracking-widest">KWENYE NENO LA MUNGU</h5>
                     <p className="text-gold-800 dark:text-gold-100 text-[14px] sm:text-[15px] md:text-[16px] italic font-serif">"Uwatakase kwa ile kweli; neno lako ndiyo kweli" - <span className="text-gold-500 font-black">Yohana 17:17</span></p>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-serif">
                     <span className="text-green-700 dark:text-green-300 font-medium">Bila Neno la Mungu, hatuwezi kutofautisha kati ya ukweli na uongo.</span>
                  </p>
               </ScrollReveal>
            </div>

            {/* Definitions Dropdown */}
            <ScrollReveal className="max-w-4xl mx-auto space-y-8">
               <h3 className="text-center text-green-500 font-black text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-widest mb-10 italic">Kupambanua Misingi</h3>
               <div className="space-y-4">
                  <div className={`rounded-lg border transition-all duration-500 overflow-hidden ${activeDef === 'ukweli' ? 'bg-white dark:bg-slate-900 border-gold-400/70 shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)]' : 'bg-white/95 dark:bg-slate-900/85 border-slate-200 dark:border-slate-700'}`}>
                     <button onClick={() => setActiveDef(activeDef === 'ukweli' ? null : 'ukweli')} className="w-full p-5 sm:p-7 md:p-8 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <h3 className={`text-[14px] sm:text-[16px] md:text-[18px] font-black uppercase tracking-widest ${activeDef === 'ukweli' ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-400'}`}>Ukweli ni nini?</h3>
                        <ChevronDown className={`transition-transform duration-500 ${activeDef === 'ukweli' ? 'rotate-180 text-green-500' : 'text-slate-400 dark:text-slate-600'}`} />
                     </button>
                     <div className={`px-6 sm:px-8 md:px-10 overflow-hidden transition-all duration-500 ${activeDef === 'ukweli' ? 'max-h-96 pb-8 md:pb-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-slate-800 dark:text-slate-200 text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed italic border-l-3 border-gold-500/60 pl-5 sm:pl-6 font-serif">
                           Ukweli si hisia au kile ambacho watu wengi wanakikubali. Ukweli ni halisi, hautikisiki, na asili yake ni Mungu mwenyewe kupitia Neno lake. Ni kioo kinachoonyesha hali halisi ya roho.
                        </p>
                     </div>
                  </div>

                  <div className={`rounded-lg border transition-all duration-500 overflow-hidden ${activeDef === 'uongo' ? 'bg-white dark:bg-slate-900 border-gold-400/70 shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)]' : 'bg-white/95 dark:bg-slate-900/85 border-slate-200 dark:border-slate-700'}`}>
                     <button onClick={() => setActiveDef(activeDef === 'uongo' ? null : 'uongo')} className="w-full p-5 sm:p-7 md:p-8 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <h3 className={`text-[14px] sm:text-[16px] md:text-[18px] font-black uppercase tracking-widest ${activeDef === 'uongo' ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-400'}`}>Uongo ni nini?</h3>
                        <ChevronDown className={`transition-transform duration-500 ${activeDef === 'uongo' ? 'rotate-180 text-green-500' : 'text-slate-400 dark:text-slate-600'}`} />
                     </button>
                     <div className={`px-6 sm:px-8 md:px-10 overflow-hidden transition-all duration-500 ${activeDef === 'uongo' ? 'max-h-96 pb-8 md:pb-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-slate-800 dark:text-slate-200 text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed italic border-l-3 border-gold-500/60 pl-5 sm:pl-6 font-serif">
                           Uongo ni sumu iliyovikwa sukari. Ni kile kinachopingana na Neno la Mungu, kikitumia mapokeo ya wanadamu au falsafa za dunia kupofusha akili za watu wasiuone utukufu wa Injili.
                        </p>
                     </div>
                  </div>
               </div>
               
               {/* Call to Actions - Moved below definitions */}
               <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-12 sm:pt-14">
                  <button onClick={() => onNavigate(StageId.BIBLE_STUDY)} className="px-8 py-3.5 sm:px-10 bg-gold-500 text-black font-black text-[12px] sm:text-[13px] uppercase tracking-widest border border-gold-500 rounded-full hover:bg-gold-600 transition-colors">Anza Kuchunguza</button>
                  <button onClick={() => onNavigate(StageId.DECEPTION_VAULT)} className="px-8 py-3.5 sm:px-10 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-black text-[12px] sm:text-[13px] uppercase tracking-widest rounded-full hover:border-slate-500 dark:hover:border-slate-400 transition-colors">Angalia Kama Umedanganywa</button>
               </div>
            </ScrollReveal>

            {/* Questions Section - Moved below CTAs */}
            <div className="pt-12 sm:pt-16 space-y-10 sm:space-y-14">
               <ScrollReveal className="text-center space-y-4 sm:space-y-6">
                  <h2 className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Bila ukweli, ni vigumu kujibu maswali makuu matano ya maisha.
                  </h2>
               </ScrollReveal>

               <ScrollReveal className="max-w-4xl mx-auto space-y-4">
                  {QUESTIONS.map((item, idx) => (
                     <div key={idx} onClick={() => setActiveQuestion(activeQuestion === idx ? null : idx)} className={`group cursor-pointer rounded-lg transition-all duration-400 overflow-hidden border ${activeQuestion === idx ? 'bg-white dark:bg-slate-900 border-gold-400/70 shadow-[0_8px_20px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)]' : 'bg-white/95 dark:bg-slate-900/85 border-slate-200 dark:border-slate-700 hover:border-gold-300/70'}`}>
                        <div className="p-5 sm:p-6 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${activeQuestion === idx ? 'bg-gold-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                 {item.icon}
                              </div>
                              <h3 className={`font-black text-[14px] sm:text-[16px] md:text-[18px] uppercase tracking-widest transition-colors ${activeQuestion === idx ? 'text-slate-900 dark:text-gold-400' : 'text-slate-700 dark:text-slate-400'}`}>
                                 {item.q}
                              </h3>
                           </div>
                           <ChevronDown size={18} className={`transition-transform duration-400 ${activeQuestion === idx ? 'rotate-180 text-gold-500' : 'text-slate-400 dark:text-slate-600'}`} />
                        </div>
                        <div className={`px-6 sm:px-20 overflow-hidden transition-all duration-400 ${activeQuestion === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                           <p className="text-slate-700 dark:text-slate-300 text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed font-serif italic border-l-3 border-gold-500/30 pl-6">{item.a}</p>
                        </div>
                     </div>
                  ))}
               </ScrollReveal>
            </div>
         </div>
      </section>

      {/* --- ZANA ZA UKWELI (TOOLS) - Compact & Staggered --- */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
         <div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
            <ScrollReveal className="text-center space-y-4">
               <h3 className="text-gold-500 font-black text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-widest mb-6 italic">Zana za Ukweli</h3>
               <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full"></div>
            </ScrollReveal>

            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
               {TOOLS.map((tool, index) => (
                  <ScrollReveal key={index} threshold={0.2}>
                    <div
                      onClick={() => onNavigate(tool.id)}
                      className="group relative flex items-center gap-4 bg-white/95 dark:bg-slate-900/90 border border-green-200/80 dark:border-slate-700 rounded-2xl p-4 sm:p-5 cursor-pointer hover:-translate-y-0.5 hover:border-gold-400/80 hover:shadow-[0_10px_22px_rgba(212,154,20,0.12)] transition-all duration-300"
                    >
                       <div className={`shrink-0 w-12 h-12 md:w-14 md:h-14 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center ${tool.color} group-hover:bg-gold-500 group-hover:text-black group-hover:border-gold-500 transition-all duration-400 shadow-sm` }>
                          {tool.icon}
                       </div>
                       <div className="min-w-0 flex-1">
                          <h3 className="text-[13px] md:text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-wide group-hover:text-gold-500 transition-colors">{tool.title}</h3>
                          <p className="text-[11px] md:text-[12px] text-slate-600 dark:text-slate-400 font-light opacity-85 italic truncate">{tool.desc}</p>
                       </div>
                       <ArrowRight size={15} className="shrink-0 text-slate-400 dark:text-slate-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-gold-500 transition-all duration-300" />
                    </div>
                  </ScrollReveal>
               ))}
            </div>
         </div>
      </section>

      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-ken-burns { 
          animation: ken-burns 28s infinite alternate ease-in-out;
          transform-origin: center center;
          will-change: transform;
        }
        @media (max-width: 767px), (prefers-reduced-motion: reduce) {
          .animate-ken-burns {
            animation: none;
            transform: scale(1.03);
          }
        }
      `}</style>
    </div>
  );
};
