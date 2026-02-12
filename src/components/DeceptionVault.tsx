
import React, { useEffect, useMemo, useState } from 'react';
import { 
  ShieldAlert, Search, BookOpen, CheckCircle2, 
  X, ShieldCheck, Zap, AlertTriangle,
  ChevronRight, Terminal, FileSearch,
  Book, Lock, Activity, Share2, Lightbulb, Microscope, 
  ArrowRight, Shield as ShieldIcon, Info, History as HistoryIcon,
  User, ExternalLink, ArrowLeft, PlayCircle, Youtube, Link, Play
} from 'lucide-react';
import { DeceptionCaseApi, getDeceptionCases } from '../services/vaultService';

interface CaseStudy {
  id: string;
  topic: string;
  category: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  tradition: string; 
  traditionSource: string;
  scripture: string; 
  reference: string;
  logic: string; 
  history: string; 
  videoUrl: string;
  shareText: string;
  detailedDescription: string;
}

const CASES: CaseStudy[] = [
  {
    id: 'TRUTH-001',
    topic: 'Hali ya Wafu',
    category: 'Misingi ya Roho',
    threatLevel: 'CRITICAL',
    tradition: "Inasemekana kuwa wapendwa wetu waliokufa wanatuona, wanatulinda, au wanaishi sehemu fulani mara tu baada ya kukata roho.",
    traditionSource: "Mapokeo ya Gnostic na Mafundisho ya 'Spiritism'",
    scripture: "Biblia inafundisha kuwa kifo ni usingizi mzito; wafu hawajui neno lo lote na hawana sehemu tena katika mambo yanayofanyika chini ya jua mpaka ufufuo.",
    reference: "Mhubiri 9:5-6, Yohana 11:11",
    logic: "Ikiwa mtu anaenda mbinguni mara moja akifa, ufufuo wa mwisho hautakuwa na maana yoyote.",
    history: "Fundisho la roho kutokufa lilianzia katika falsafa za Kigiriki (Plato) na kuingizwa kanisani karne ya pili.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    shareText: "Nimegundua kuwa wafu wamelala wakimngojea Yesu. #GodCares365 #Ukweli",
    detailedDescription: "Suala la hali ya wafu ni moja ya udanganyifu mkubwa wa shetani tangu bustani ya Edeni pale aliposema 'Hamtakufa hakika'. Biblia inafuta dhana ya kwamba wafu wanaweza kuwasiliana na walio hai, ikionyesha kuwa kifo ni mapumziko kabisa ya mwili na roho hadi siku ya ufufuo mkuu Yesu atakaporejea. Hii inatulinda dhidi ya udanganyifu wa roho chafu zinazojifanya kuwa ndugu zetu."
  },
  {
    id: 'TRUTH-002',
    topic: 'Siku ya Ibada (Sabato)',
    category: 'Mamlaka ya Mungu',
    threatLevel: 'CRITICAL',
    tradition: "Jumapili ndiyo siku ya Bwana; utakatifu ulihamishwa kutoka Jumamosi kwa mamlaka ya kanisa.",
    traditionSource: "The Convert’s Catechism of Catholic Doctrine, p. 50",
    scripture: "Mungu alibariki na kuitakasa siku ya saba tangu uumbaji kama ukumbusho wa milele. Hakuna andiko hata moja linaloamuru Jumapili kuwa siku takatifu.",
    reference: "Kutoka 20:8-11, Luka 4:16, Malaki 3:6",
    logic: "Ikiwa mwanadamu anaweza kubadili sheria ya Mungu, basi mwanadamu amekuwa juu ya Mungu. 'The Convert’s Catechism' inakiri wazi: 'Q: Why do we observe Sunday? A: Because the Church transferred the solemnity.'",
    history: "Father Peter Geiermann anathibitisha kuwa Kanisa Katoliki lilihamisha utakatifu huo. Mwaka 321 BK Konstantino alitoa amri ya kwanza ya Jumapili.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    shareText: "Sabato bado ni ishara ya utii kwa Muumba. #BibleTruth #GodCares365",
    detailedDescription: "Uchunguzi wa 'The Convert’s Catechism' unaonyesha kuwa mabadiliko haya hayana msingi wa Biblia bali ni mamlaka ya kanisa. Kitabu hicho kinasema Maandiko lazima yaeleweke katika maana ambayo Kanisa pekee linashikilia (Uk. 139)."
  },
  {
    id: 'TRUTH-004',
    topic: 'Mamlaka ya Kasisi',
    category: 'Mamlaka ya Kidini',
    threatLevel: 'CRITICAL',
    tradition: "Kasisi ana nguvu ya funguo za kuokoa watu kutoka kuzimu, na Mungu analazimika kufuata hukumu ya makasisi wake.",
    traditionSource: "The Catholic Priest (Michael Müller, p. 78-79)",
    scripture: "Mungu pekee ndiye mwenye mamlaka ya kusamehe dhambi na kuhukumu kwa haki. 'Nani awezaye kusamehe dhambi isipokuwa Mungu pekee?'",
    reference: "Marko 2:7, 1 Timotheo 2:5",
    logic: "Kufundisha kuwa Mungu analazimika kufuata hukumu ya mwanadamu ni kumpindua Muumba kwenye kiti chake cha enzi. Kasisi anapewa hadhi ya 'Nuru ya Ulimwengu'.",
    history: "Michael Müller anadai: 'God himself is obliged to abide by the judgment of his priests, and either not to forgive or to forgive.' Hii inapingana na upatanishi wa Kristo.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    shareText: "Yesu pekee ndiye mpatanishi wetu. #GodCares365 #Truth",
    detailedDescription: "Nyaraka kama 'The Catholic Priest' na 'Faith of Millions' zinadai kanisa lina mamlaka hata juu ya Biblia kwa sababu kanisa liliitangulia Biblia. Huu ni udanganyifu wa kujiinua juu ya Neno la Mungu."
  },
  {
    id: 'TRUTH-003',
    topic: 'Moto wa Jehanamu',
    category: 'Tabia ya Mungu',
    threatLevel: 'HIGH',
    tradition: "Watu wanasema Mungu atawachoma waovu motoni milele na milele bila mwisho.",
    traditionSource: "Divine Comedy (Inferno) ya Dante Alighieri",
    scripture: "Mshahara wa dhambi ni mauti (kifo), si maisha ya mateso. Moto wa mwisho utawaangamiza waovu kabisa na kuwa majivu.",
    reference: "Warumi 6:23, Malaki 4:1-3",
    logic: "Mungu wa upendo hawezi kutesa kiumbe chake milele kwa ajili ya dhambi za maisha mafupi. Hii inaharibu sifa ya upendo wa Mungu.",
    history: "Dhana ya moto usiozimika ilikuzwa wakati wa zama za giza ili kutisha watu watoe fedha kwa kanisa.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    shareText: "Mungu ni wa haki. Waovu wataangamizwa kabisa, si kuteswa milele. #GodIsLove",
    detailedDescription: "Mungu ni pendo lakini pia ni moto ulao dhidi ya dhambi. Jehanamu ni tukio la mwisho la kusafisha ulimwengu kutokana na dhambi na waasi."
  }
];

export const DeceptionVault: React.FC = () => {
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [casesError, setCasesError] = useState('');

  useEffect(() => {
    const loadCases = async () => {
      setLoadingCases(true);
      setCasesError('');
      try {
        const data: DeceptionCaseApi[] = await getDeceptionCases();
        setCases(data.map((item) => ({
          id: item.id,
          topic: item.topic,
          category: item.category || 'Hakuna taarifa',
          threatLevel: item.threatLevel,
          tradition: item.tradition || 'Hakuna taarifa',
          traditionSource: item.traditionSource || 'Hakuna taarifa',
          scripture: item.scripture || 'Hakuna taarifa',
          reference: item.reference || 'Hakuna taarifa',
          logic: item.logic || 'Hakuna taarifa',
          history: item.history || 'Hakuna taarifa',
          videoUrl: item.videoUrl || '',
          shareText: item.shareText || `Nimejifunza kuhusu ${item.topic}.`,
          detailedDescription: item.detailedDescription || 'Hakuna taarifa.',
        })));
      } catch (error: any) {
        setCases([]);
        setCasesError(error?.message || 'Imeshindikana kupakua deception cases.');
      } finally {
        setLoadingCases(false);
      }
    };

    loadCases();
  }, []);

  const activeCase = useMemo(() => 
    cases.find(c => c.id === activeCaseId), 
  [activeCaseId, cases]);

  const filteredCases = cases.filter(c => 
    c.topic.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleShare = () => {
    if (activeCase && navigator.share) {
      navigator.share({ 
        title: activeCase.topic, 
        text: activeCase.shareText, 
        url: window.location.href 
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#020617] text-slate-300 overflow-hidden relative p-4 md:p-8">
      
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-lg text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest">
                 <ShieldAlert size={14} /> Counter-Deception Lab
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">
                Ukweli vs <span className="text-red-600">Uongo</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-xl font-medium">Chunguza mapokeo ya wanadamu dhidi ya ukweli wa Biblia. Usikubali kudanganywa tena.</p>
           </div>
           
           <div className="w-full md:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="text" 
                placeholder="Tafuta mada ya uongo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-red-500/50 transition-all text-white text-sm"
              />
           </div>
        </div>

        {casesError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
            {casesError}
          </div>
        )}
        {loadingCases && (
          <div className="py-6 text-center text-xs font-black uppercase tracking-widest text-slate-500">
            Inapakia data...
          </div>
        )}
        {!loadingCases && filteredCases.length === 0 && (
          <div className="py-6 text-center text-xs font-black uppercase tracking-widest text-slate-500">
            Hakuna taarifa kwa sasa.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
           {filteredCases.map(c => (
             <button
               key={c.id}
               onClick={() => setActiveCaseId(c.id)}
               className="group text-left p-8 rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/40 hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden flex flex-col h-full shadow-sm hover:shadow-2xl"
             >
               <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-red-500 transition-colors">
                    Dossier #{c.id}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${c.threatLevel === 'CRITICAL' ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`}></div>
               </div>
               
               <h4 className="text-2xl font-black leading-none text-slate-400 group-hover:text-white transition-all uppercase mb-6 flex-1">
                  Inawezekana ukawa umedanganywa kuhusu <span className="text-red-500 italic">{c.topic}</span>?
               </h4>
               
               <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{c.category}</span>
                  <div className="flex items-center gap-2 text-[10px] font-black text-red-500">
                     CHUNGUZA <ChevronRight size={14} />
                  </div>
               </div>
             </button>
           ))}
        </div>
      </div>

      {activeCase && (
        <div className="fixed inset-0 z-[600] bg-slate-950/98 backdrop-blur-3xl animate-fade-in flex flex-col overflow-hidden">
           
           <header className="h-16 bg-black/40 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setActiveCaseId(null)}
                   className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all flex items-center gap-2 group"
                 >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Archives</span>
                 </button>
                 <div className="h-6 w-[1px] bg-white/5"></div>
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] hidden sm:block">CHUMBA CHA UKAGUZI: {activeCase.id}</h3>
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                   onClick={handleShare}
                   className="p-2.5 bg-gold-500 text-primary-950 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all"
                   title="Share Truth"
                 >
                    <Share2 size={20} />
                 </button>
                 <div className="h-6 w-[1px] bg-white/5 mx-1"></div>
                 <button onClick={() => setActiveCaseId(null)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                    <X size={20} />
                 </button>
              </div>
           </header>

           <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-10">
                 
                 <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full text-red-500">
                       <Zap size={12} fill="currentColor" />
                       <span className="text-[8px] font-black uppercase tracking-[0.4em]">Matokeo ya Ukaguzi</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none italic">
                       {activeCase.topic}
                    </h1>
                 </div>

                 {/* CORE CONTRAST: UONGO vs UKWELI */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
                    <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full items-center justify-center shadow-2xl border-4 border-slate-950 font-black text-slate-950 italic text-sm">Vs</div>

                    <div className="bg-red-950/10 border border-red-500/10 p-8 rounded-2xl space-y-4 flex flex-col justify-between">
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <AlertTriangle size={24} className="text-red-500" />
                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 italic">Uongo (Tradition)</h3>
                          </div>
                          <p className="text-xl md:text-2xl font-bold italic text-red-100/80 leading-tight">"{activeCase.tradition}"</p>
                       </div>
                       <div className="pt-4 mt-4 border-t border-red-500/10 flex items-center gap-2 text-[9px] font-black uppercase text-red-400">
                          <Link size={12} /> Marejeo: {activeCase.traditionSource}
                       </div>
                    </div>

                    <div className="bg-emerald-950/10 border border-emerald-500/10 p-8 rounded-2xl space-y-4 flex flex-col justify-between">
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <ShieldCheck size={24} className="text-emerald-500" />
                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Ukweli (Scripture)</h3>
                          </div>
                          <p className="text-xl md:text-2xl font-bold text-white leading-tight">{activeCase.scripture}</p>
                       </div>
                       <div className="pt-4 mt-4 border-t border-emerald-500/10 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                          <BookOpen size={14} /> Biblia: {activeCase.reference}
                       </div>
                    </div>
                 </div>

                 {/* VIDEO & EVIDENCE SIDE-BY-SIDE + DESCRIPTION BELOW VIDEO */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pb-24">
                    <div className="lg:col-span-7 space-y-6">
                       {/* Compact Video Card */}
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-xl space-y-4 group">
                          <div className="flex items-center justify-between px-1">
                             <div className="flex items-center gap-2 text-red-500">
                                <PlayCircle size={16} />
                                <h3 className="text-[8px] font-black uppercase tracking-[0.4em]">Ushahidi wa Video</h3>
                             </div>
                             <span className="text-[8px] font-bold text-slate-600 uppercase">Analysis Portal v2</span>
                          </div>
                          <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-white/5">
                             {activeCase.videoUrl ? (
                               <>
                                 <iframe 
                                   src={`${activeCase.videoUrl}?autoplay=0`} 
                                   className="w-full h-full border-none opacity-80 group-hover:opacity-100 transition-opacity" 
                                   allowFullScreen
                                 ></iframe>
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-10 transition-opacity">
                                    <Play size={48} className="text-white" fill="currentColor" />
                                 </div>
                               </>
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-500">
                                 Hakuna video kwa sasa
                               </div>
                             )}
                          </div>
                       </div>
                       
                       {/* Maelezo ya Kina Block - Chini ya Video */}
                       <div className="p-8 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                          <div className="flex items-center gap-2 mb-4">
                             <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></div>
                             <h4 className="text-[9px] font-black text-gold-500 uppercase tracking-[0.4em]">Maelezo ya Kina (In-Depth Analysis)</h4>
                          </div>
                          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium italic">
                             {activeCase.detailedDescription}
                          </p>
                       </div>
                    </div>

                    <div className="lg:col-span-5 flex flex-col gap-4">
                       <div className="flex items-center gap-3 text-gold-500 px-1">
                          <Microscope size={20} />
                          <h3 className="text-[9px] font-black uppercase tracking-[0.4em]">Vigezo vya Ukaguzi</h3>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3 hover:border-blue-500/30 transition-all shadow-sm">
                             <div className="flex items-center gap-3 text-blue-400">
                                <HistoryIcon size={18} />
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Historia</h4>
                             </div>
                             <p className="text-sm text-slate-400 leading-relaxed font-bold italic">"{activeCase.history}"</p>
                          </div>

                          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3 hover:border-red-500/30 transition-all shadow-sm">
                             <div className="flex items-center gap-3 text-red-400">
                                <Lightbulb size={18} />
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Mantiki</h4>
                             </div>
                             <p className="text-sm text-slate-400 leading-relaxed font-bold italic">"{activeCase.logic}"</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};
