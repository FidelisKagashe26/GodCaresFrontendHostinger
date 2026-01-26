
import React, { useState, useEffect, useRef } from 'react';
import { StageId } from '../types';
import { 
  ArrowRight, BookOpen, ShieldCheck, Microscope, PlayCircle, 
  Clock, ChevronDown, Compass, AlertTriangle, 
  HelpCircle, Cross, Fingerprint, 
  Layers, Search, Lightbulb, Zap, Play
} from 'lucide-react';

interface HomeProps {
  onNavigate: (id: StageId) => void;
}

const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string; threshold?: number }> = ({ children, className = "", threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    }, { threshold });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={domRef}
      className={`${className} transition-all duration-[1200ms] cubic-bezier(0.23, 1, 0.32, 1) transform ${
        isVisible ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-20 blur-sm'
      }`}
    >
      {children}
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);
  const [activeDef, setActiveDef] = useState<'ukweli' | 'uongo' | null>(null);

  const QUESTIONS = [
    { id: 0, q: "Nimetoka Wapi?", a: "Sisi si ajali ya kibiolojia. Mungu alisema, 'Na tumfanye mtu kwa mfano wetu, kwa sura yetu.' Tumeumbwa kwa mfano wa Mungu (Mwanzo 1:26-27). Asili yako ni Mbinguni.", icon: <Fingerprint /> },
    { id: 1, q: "Kwanini Nipo Hapa?", a: "Kumtukuza Mungu na kuwa wakili wa uumbaji wake. 'Kila mmoja aliyeitwa kwa jina langu, niliyemwumba kwa ajili ya utukufu wangu.' (Isaya 43:7).", icon: <Compass /> },
    { id: 2, q: "Kwanini Kuna Uovu?", a: "Uovu ni matokeo ya uhuru wa kuchagua. Mungu alitaka upendo wa hiari, si wa kulazimishwa. Uasi ulianzia mbinguni (Isaya 14:12-14).", icon: <AlertTriangle /> },
    { id: 3, q: "Naenda Wapi Nikifa?", a: "Kifo ni usingizi. 'Kwa maana walio hai wanajua ya kwamba watakufa; lakini wafu hawajui neno lo lote.' (Mhubiri 9:5). Tunangoja ufufuo.", icon: <Clock /> },
    { id: 4, q: "Suluhisho ni Nini?", a: "Yesu Kristo. 'Mimi ndimi njia, na kweli, na uzima; mtu haji kwa Baba, ila kwa njia ya mimi.' (Yohana 14:6).", icon: <Cross /> }
  ];

  const TOOLS = [
    { id: StageId.BIBLE_STUDY, title: "Biblia", desc: "Andiko safi.", icon: <BookOpen size={18} />, color: "text-gold-400" },
    { id: StageId.TIMELINE, title: "Unabii", desc: "Historia.", icon: <Clock size={18} />, color: "text-blue-400" },
    { id: StageId.DECEPTION_VAULT, title: "Fichua", desc: "Pambanua.", icon: <ShieldCheck size={18} />, color: "text-red-400" },
    { id: StageId.EVIDENCE, title: "Ushahidi", desc: "Sayansi.", icon: <Microscope size={18} />, color: "text-green-400" },
    { id: StageId.QUESTION_VAULT, title: "Majibu", desc: "Maswali.", icon: <HelpCircle size={18} />, color: "text-purple-400" },
    { id: StageId.MEDIA, title: "Media", desc: "Video.", icon: <PlayCircle size={18} />, color: "text-pink-400" }
  ];

  return (
    <div className="relative w-full bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-slate-200 overflow-x-hidden font-sans selection:bg-gold-500/30">
      
      {/* --- HERO --- */}
      <section className="relative min-h-[90vh] md:h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2500" className="w-full h-full object-cover opacity-25 dark:opacity-40 animate-ken-burns" alt="Cosmos" />
           <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90 dark:from-[#020617] dark:via-transparent dark:to-[#020617]"></div>
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl space-y-6">
           <ScrollReveal>
             <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 rounded-md border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-gold-400">Yohana 8:32</span>
             </div>
             <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] drop-shadow-2xl uppercase">GOD CARES <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400">365</span></h1>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-8 sm:pt-12">
                <button onClick={() => onNavigate(StageId.BIBLE_STUDY)} className="group relative px-8 py-4 sm:px-12 sm:py-5 bg-slate-900 text-white dark:bg-white dark:text-black font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-gold-500 hover:-translate-y-1 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] rounded-md overflow-hidden w-full sm:w-auto">
                  <span className="relative z-10">Anza Safari <ArrowRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform"/></span>
                </button>
                <button onClick={() => onNavigate(StageId.MEDIA)} className="group relative px-8 py-4 sm:px-12 sm:py-5 border border-slate-300 text-slate-900 dark:border-white/20 dark:text-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-slate-200/70 dark:hover:bg-white/10 hover:-translate-y-1 transition-all rounded-md overflow-hidden w-full sm:w-auto">
                  <span className="relative z-10">Tazama Video <Play size={16} className="inline ml-2 group-hover:scale-110 transition-transform" fill="currentColor"/></span>
                </button>
             </div>
           </ScrollReveal>
        </div>
      </section>

      {/* --- Hitaji letu la Ukweli --- */}
      <section className="relative pt-16 sm:pt-24 pb-10 sm:pb-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 text-center">
            <h3 className="text-gold-500 font-black text-xs uppercase tracking-[0.5em] mb-4 italic">Hitaji letu la Ukweli</h3>
            <div className="h-1 w-20 bg-gold-500 mx-auto mt-4 rounded-full"></div>
         </div>

        {[
          { id: 1, tag: "Mwaka 31 B.K - Yerusalemu", h2: "Pilato Anauiliza swali la milenia..", h3: "KWELI NI NINI", p: <><span className="text-gold-400 font-medium">swali hili lenye umri wa miaka 2000 liloulizwa na gavana wa kirumi limesafiri kweney korido za wakati na bado linasumbua hadi leo likihitaji majibu, kwenye zama zetu za AI ukweli umechakachuliwa, umeburuzwa, umepuuziwa, umehafifishwa, kuzimwa na sehmu nyingine kuangamizwa kabisa.</span></>, img: "https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=2000" },
          { id: 2, tag: "Jibu la Mfalme", h2: "Yesu Anamjibu Pilato.", h3: "NIMEKUJA NIISHUHUDIE KWELI.", p: <>"Mimi nimezaliwa kwa ajili ya haya, na kwa ajili ya haya mimi nalikuja ulimwenguni, ili niishuhudie kweli. Kila aliye wa hiyo kweli hunisikia sauti yangu." — <span className="text-gold-400 font-black">Yohana 18:37</span></>, img: "https://images.unsplash.com/photo-1512117187123-f365d9c227ba?q=80&w=2000" },
          { id: 3, tag: "Dhana Moja", h2: "Kweli zipo Ngapi?", h3: "UKWELI UPO MMOJA TU.", p: <>"Yesu akamwambia, Mimi ndimi njia, na kweli, na uzima; mtu haji kwa Baba, ila kwa njia ya mimi." — <span className="text-gold-400 font-black">Yohana 14:6</span> <br/><br/> <span className="text-gold-400 font-medium">kwa vile ukweli ni msingi wa kile tunachoamini lazima uwe mmoja.</span></>, img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000" }
        ].map((step, i) => (
          <div key={i} className="relative min-h-[85vh] md:h-screen flex items-center overflow-hidden border-b border-slate-200 dark:border-white/5">
            <img src={step.img} className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-20 transition-transform duration-[8s] ease-out hover:scale-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#020617] dark:via-[#020617]/90"></div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
              <ScrollReveal className={i % 2 === 1 ? "text-right ml-auto" : ""}>
                <div className={`inline-flex items-center gap-3 mb-6 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-gold-600 dark:text-gold-500 font-black text-xl">0{step.id}</div>
                    <span className="text-gold-500 font-black text-xs uppercase tracking-[0.4em]">{step.tag}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-serif text-slate-900 dark:text-white italic opacity-90 dark:opacity-80 mb-6 leading-tight">{step.h2}</h2>
                <div className={`bg-white/90 dark:bg-white/5 p-6 sm:p-10 md:p-14 border-l-4 ${i % 2 === 1 ? 'border-r-4 border-l-0 text-right' : 'border-l-4'} border-gold-500/50 backdrop-blur-md shadow-2xl max-w-3xl ${i % 2 === 1 ? 'ml-auto' : ''} rounded-sm transition-all hover:bg-white dark:hover:bg-white/[0.08]`}>
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">{step.h3}</h3>
                  <div className="text-slate-700 dark:text-slate-300 font-serif italic text-base sm:text-lg md:text-xl leading-relaxed">{step.p}</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        ))}
      </section>

      {/* --- Changamoto ya Kudanganywa --- */}
      <section className="relative pt-16 sm:pt-24 pb-10 sm:pb-12 bg-slate-50 dark:bg-[#050b1d]">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 text-center">
            <h3 className="text-red-500 font-black text-xs uppercase tracking-[0.5em] mb-4 italic">Changamoto ya Kudanganywa</h3>
            <div className="h-1 w-20 bg-red-600 mx-auto mt-4 rounded-full"></div>
         </div>

        {[
          { id: 1, tag: "Utabiri", h2: "Siku za mwisho itakuwaje.", h3: "WATU WENGI WATADANGANYWA.", p: <>"Yesu akajibu, akawaambia, Angalieni, mtu asiwadanganye" — <span className="text-red-500 font-black">Mathayo 24:6</span> <br/><br/> <span className="text-red-500 font-medium italic">yesu alionya kuhusu udanganyifu and kudhani kila mtu ana ukweli wake.</span></>, img: "https://images.unsplash.com/photo-1463130436662-3162799c0a37?q=80&w=2000" },
          { id: 2, tag: "Asili ya Uongo", h2: "Shetani ndie Muongo.", h3: "YESU ALISEMA.", p: <>"Ninyi ni wa baba yenu, Ibilisi, na tamaa za baba yenu ndizo mpendazo kuzitenda. Yeye alikuwa mwuaji tangu mwanzo; wala hakusimama katika kweli, kwa kuwa hamna hiyo kweli ndani yake. Asemapo uongo, husema yaliyo yake mwenyewe; kwa sababu yeye ni mwongo, na baba wa huo." — <span className="text-red-500 font-black">Yohana 8:44</span></>, img: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2000" },
          { id: 3, tag: "Kilele cha Udanganyifu", h2: "Shetani ameudanganya ulimwengu wote.", h3: "KILA MTU AMEDANGANYWA.", p: <>"Yule joka akatupwa, yule mkubwa, nyoka wa zamani, aitwaye Ibilisi na Shetani, audanganyaye ulimwengu wote; akatupwa hata nchi, na malaika zake wakatupwa pamoja naye." — <span className="text-red-500 font-black">Ufunuo 12:9</span></>, img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2000" }
        ].map((step, i) => (
          <div key={i} className="relative min-h-[85vh] md:h-screen flex items-center overflow-hidden border-b border-slate-200 dark:border-white/5">
            <img src={step.img} className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-20" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#050b1d] dark:via-[#050b1d]/90"></div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
              <ScrollReveal className={i % 2 === 0 ? "text-right ml-auto" : ""}>
                <div className={`inline-flex items-center gap-3 mb-6 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 backdrop-blur-xl border border-red-200 dark:border-red-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-500 font-black text-xl">0{step.id}</div>
                    <span className="text-red-500 font-black text-xs uppercase tracking-[0.4em]">{step.tag}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-serif text-slate-900 dark:text-white italic opacity-90 dark:opacity-80 mb-6 leading-tight">{step.h2}</h2>
                <div className={`bg-red-50 dark:bg-red-950/5 p-6 sm:p-10 md:p-14 border-l-4 ${i % 2 === 0 ? 'border-r-4 border-l-0 text-right' : 'border-l-4'} border-red-500 backdrop-blur-md shadow-2xl max-w-3xl ${i % 2 === 0 ? 'ml-auto' : ''} rounded-sm transition-all hover:bg-red-100 dark:hover:bg-red-950/10`}>
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">{step.h3}</h3>
                  <div className="text-red-700 dark:text-red-50/70 font-serif italic text-base sm:text-lg md:text-xl leading-relaxed">{step.p}</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        ))}
      </section>

      {/* --- Ukweli upo. --- */}
      <section className="relative pt-16 sm:pt-24 pb-10 sm:pb-12 bg-white dark:bg-[#020617]">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 text-center">
            <h3 className="text-emerald-500 font-black text-xs uppercase tracking-[0.5em] mb-4 italic">Ukweli upo.</h3>
            <div className="h-1 w-20 bg-emerald-500 mx-auto mt-4 rounded-full"></div>
         </div>

        {[
          { id: 1, tag: "Tumaini Limerejea", h2: "Tunalo Tumaini", h3: "TUNAWEZA KUUJUA UKWELI", p: <>"tena mtaifahamu kweli, nayo hiyo kweli itawaweka huru." — <span className="text-emerald-400 font-black">Yohana 8:32</span> <br/><br/> <span className="text-emerald-400 font-medium italic">Ukweli unaweza kufichwa lakini hauwezi kufichwa milele.</span></>, img: "https://images.unsplash.com/photo-1491466424936-e304919aada7?q=80&w=2000" },
          { id: 2, tag: "Njia ya Mafanikio", h2: "Kuutafuta Ukweli", h3: "UKWELI UNAPATIKANA", p: <>"tafuteni, nanyi mtaona;" — <span className="text-emerald-400 font-black">Mathayo 7:7</span> <br/> "Mtafuteni Bwana, maadamu anapatikana, Mwiteni, maadamu yu karibu;" — <span className="text-emerald-400 font-black">Isaya 55:6</span> <br/><br/> <span className="text-emerald-400 font-medium italic">Tukiutafuta ukweli tutaupata. hili ni jukumu letu kulifanya yaani kutafuta Ukweli</span></>, img: "https://images.unsplash.com/photo-1454165833767-02638a5996bc?q=80&w=2000" },
        ].map((step, i) => (
          <div key={i} className="relative min-h-[85vh] md:h-screen flex items-center overflow-hidden border-b border-slate-200 dark:border-white/5">
            <img src={step.img} className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-20" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#020617] dark:via-[#020617]/90"></div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
              <ScrollReveal className={i % 2 === 1 ? "text-right ml-auto" : ""}>
                <div className={`inline-flex items-center gap-3 mb-6 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-500 font-black text-xl">0{step.id}</div>
                    <span className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em]">{step.tag}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-serif text-slate-900 dark:text-white italic opacity-90 dark:opacity-80 mb-6 leading-tight">{step.h2}</h2>
                <div className={`bg-emerald-50 dark:bg-emerald-950/5 p-6 sm:p-10 md:p-14 border-l-4 ${i % 2 === 1 ? 'border-r-4 border-l-0 text-right' : 'border-l-4'} border-emerald-500/50 backdrop-blur-md shadow-2xl max-w-3xl ${i % 2 === 1 ? 'ml-auto' : ''} rounded-sm transition-all hover:bg-emerald-100 dark:hover:bg-emerald-950/10`}>
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">{step.h3}</h3>
                  <div className="text-slate-700 dark:text-slate-300 font-serif italic text-base sm:text-lg md:text-xl leading-relaxed">{step.p}</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        ))}
      </section>

      {/* --- Mgongano wa Mawazo --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-[#020617]">
         <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
            <ScrollReveal className="text-center space-y-6 sm:space-y-8">
               <h3 className="text-gold-500 font-black text-xs uppercase tracking-[0.5em] mb-4 italic">Mgongano wa Mawazo</h3>
               <div className="h-1 w-20 bg-slate-200 dark:bg-white/20 mx-auto rounded-full"></div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <ScrollReveal className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 sm:p-12 rounded-xl shadow-inner group hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 sm:mb-8">Dilema ya Leo.</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 font-light">
                    <span className="text-gold-400 font-medium italic">wakristo wengi wanapenda Neema ya Mungu lakini wanakata ukweli aliomtuma Yesu kushuhudia, wansahau huwezi kutenganisha neema na kweli maan yesu amejaa vyote viwii</span>
                  </p>
                  <div className="space-y-6">
                     <div className="p-6 bg-slate-50 dark:bg-white/5 border-l-2 border-gold-500 italic text-sm text-slate-700 dark:text-slate-300">
                        "Kwa kuwa torati ilitolewa kwa mkono wa Musa; neema na kweli zilikuja kwa mkono wa Yesu Kristo." — <span className="text-gold-500 font-black">Yohana 1:17</span>
                     </div>
                     <div className="p-6 bg-slate-50 dark:bg-white/5 border-l-2 border-gold-500 italic text-sm text-slate-700 dark:text-slate-300">
                        "Naye Neno alifanyika mwili, akakaa kwetu; nasi tukauona utukufu wake, utukufu kama wa Mwana pekee atokaye kwa Baba; amejaa neema na kweli." — <span className="text-gold-500 font-black">Yohana 1:14</span>
                     </div>
                  </div>
               </ScrollReveal>

               <ScrollReveal className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 sm:p-12 rounded-xl shadow-inner group hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 sm:mb-8">Ukweli Unapatikana Wapi?</h3>
                  <div className="p-6 sm:p-12 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-500/20 rounded-lg text-center space-y-6 mb-8 sm:mb-10">
                     <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 dark:bg-primary-500/20 rounded-full flex items-center justify-center mx-auto text-primary-700 dark:text-primary-400 mb-4"><Search size={28}/></div>
                     <h5 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">KWENYE NENO LA MUNGU</h5>
                     <p className="text-primary-800 dark:text-primary-200 text-base sm:text-lg italic">"Uwatakase kwa ile kweli; neno lako ndiyo kweli" — <span className="text-gold-500 font-black">Yohana 17:17</span></p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-500 text-sm italic">
                    <span className="text-primary-400 font-medium italic">Bila neno la Mungu hatuwezi kutofautisha kati ya ukweli na uongo</span>
                  </p>
               </ScrollReveal>
            </div>

            {/* Definitions Dropdown */}
            <ScrollReveal className="max-w-4xl mx-auto space-y-6">
               <h3 className="text-center text-gold-500 font-black text-xs uppercase tracking-[0.5em] mb-8 italic">Kupambanua Misingi</h3>
               <div className="space-y-3">
                  <div className={`rounded-lg border transition-all duration-500 overflow-hidden ${activeDef === 'ukweli' ? 'bg-white dark:bg-white/5 border-gold-500/50 shadow-2xl' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/5'}`}>
                     <button onClick={() => setActiveDef(activeDef === 'ukweli' ? null : 'ukweli')} className="w-full p-5 sm:p-8 flex items-center justify-between text-left">
                        <h3 className={`text-lg sm:text-xl font-black uppercase tracking-widest ${activeDef === 'ukweli' ? 'text-gold-600 dark:text-gold-500' : 'text-slate-700 dark:text-slate-400'}`}>Ukweli ni nini?</h3>
                        <ChevronDown className={`transition-transform duration-500 ${activeDef === 'ukweli' ? 'rotate-180 text-gold-500' : 'text-slate-500 dark:text-slate-600'}`} />
                     </button>
                     <div className={`px-10 overflow-hidden transition-all duration-500 ${activeDef === 'ukweli' ? 'max-h-96 pb-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed italic border-l-2 border-gold-500/30 pl-6 font-serif">
                           Ukweli si hisia au kile ambacho watu wengi wanakikubali. Ukweli ni halisi, hautikisiki, na asili yake ni Mungu mwenweye kupitia Neno lake. Ni kioo kinachoonyesha hali halisi ya roho.
                        </p>
                     </div>
                  </div>

                  <div className={`rounded-lg border transition-all duration-500 overflow-hidden ${activeDef === 'uongo' ? 'bg-white dark:bg-white/5 border-red-500/50 shadow-2xl' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/5'}`}>
                     <button onClick={() => setActiveDef(activeDef === 'uongo' ? null : 'uongo')} className="w-full p-5 sm:p-8 flex items-center justify-between text-left">
                        <h3 className={`text-lg sm:text-xl font-black uppercase tracking-widest ${activeDef === 'uongo' ? 'text-red-600 dark:text-red-500' : 'text-slate-700 dark:text-slate-400'}`}>Uongo ni nini?</h3>
                        <ChevronDown className={`transition-transform duration-500 ${activeDef === 'uongo' ? 'rotate-180 text-red-500' : 'text-slate-500 dark:text-slate-600'}`} />
                     </button>
                     <div className={`px-10 overflow-hidden transition-all duration-500 ${activeDef === 'uongo' ? 'max-h-96 pb-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed italic border-l-2 border-red-500/30 pl-6 font-serif">
                           Uongo ni sumu iliyovikwa sukari. Ni kile kinachopingana na Neno la Mungu, kikitumia mapokeo ya wanadamu au falsafa za dunia kupofusha akili za watu wasiuone utukufu wa Injili.
                        </p>
                     </div>
                  </div>
               </div>
               
               {/* Call to Actions - Moved below definitions */}
               <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 pt-10 sm:pt-12">
                  <button onClick={() => onNavigate(StageId.BIBLE_STUDY)} className="px-8 py-4 sm:px-12 sm:py-5 bg-gold-500 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">ANZA KUCHUNGUZA</button>
                  <button onClick={() => onNavigate(StageId.DECEPTION_VAULT)} className="px-8 py-4 sm:px-12 sm:py-5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] hover:bg-slate-200/70 dark:hover:bg-white/5 transition-all">ANGALIA KAMA UMEDANGANYWA</button>
               </div>
            </ScrollReveal>

            {/* Questions Section - Moved below CTAs */}
            <div className="pt-16 sm:pt-24 space-y-12 sm:space-y-16">
               <ScrollReveal className="text-center space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium text-gold-500 tracking-tight leading-none lowercase">
                    Bila ukweli ni vigumu kuyajibu maswali makuu matano ya maisha.
                  </h2>
               </ScrollReveal>

               <ScrollReveal className="max-w-4xl mx-auto space-y-4">
                  {QUESTIONS.map((item, idx) => (
                     <div key={idx} onClick={() => setActiveQuestion(activeQuestion === idx ? null : idx)} className={`group cursor-pointer rounded-xl transition-all duration-500 overflow-hidden border ${activeQuestion === idx ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/20 shadow-2xl scale-[1.02]' : 'bg-white dark:bg-transparent border-slate-200/80 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
                        <div className="p-5 sm:p-6 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${activeQuestion === idx ? 'bg-gold-500 text-slate-950' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-500'}`}>
                                 {item.icon}
                              </div>
                              <h3 className={`font-black text-base uppercase tracking-widest ${activeQuestion === idx ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                 {item.q}
                              </h3>
                           </div>
                           <ChevronDown size={18} className={`transition-transform duration-500 ${activeQuestion === idx ? 'rotate-180 text-gold-500' : 'text-slate-500 dark:text-slate-600'}`} />
                        </div>
                        <div className={`px-6 sm:px-20 overflow-hidden transition-all duration-500 ease-in-out ${activeQuestion === idx ? 'max-h-40 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                           <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-light italic border-l-2 border-gold-500/20 pl-6">{item.a}</p>
                        </div>
                     </div>
                  ))}
               </ScrollReveal>
            </div>
         </div>
      </section>

      {/* --- ZANA ZA UKWELI (TOOLS) - Compact & Staggered --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-[#050b1d] border-t border-slate-200 dark:border-white/5">
         <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
            <ScrollReveal className="text-center space-y-4">
               <h3 className="text-gold-500 font-black text-xs uppercase tracking-[0.5em] mb-4 italic">Zana za Ukweli</h3>
               <div className="h-1 w-20 bg-gold-500 mx-auto mt-4 rounded-full"></div>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-x-12 md:gap-y-8">
               {TOOLS.map((tool, index) => (
                  <ScrollReveal 
                    key={index} 
                    threshold={0.2}
                    className={index % 2 === 1 ? "md:translate-y-8" : ""}
                  >
                    <div 
                      onClick={() => onNavigate(tool.id)} 
                      className="group relative bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl p-5 sm:p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.08] hover:border-gold-500/40 transition-all duration-500 flex flex-col items-center text-center space-y-4 shadow-sm"
                    >
                       <div className={`w-12 h-12 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center ${tool.color} group-hover:bg-gold-500 group-hover:text-black transition-all duration-500 shadow-xl`}>
                          {tool.icon}
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-gold-400 transition-colors">{tool.title}</h3>
                          <p className="text-[10px] text-slate-600 dark:text-slate-500 font-light opacity-80 italic">{tool.desc}</p>
                       </div>
                       <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                          <span className="text-[7px] font-black uppercase tracking-widest text-gold-500 flex items-center gap-1">FUNGUA <ArrowRight size={8} /></span>
                       </div>
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
          animation: ken-burns 20s infinite alternate ease-in-out; 
        }
      `}</style>
    </div>
  );
};
