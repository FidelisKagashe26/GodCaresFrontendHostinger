
import React, { useEffect, useMemo, useState } from 'react';
import { 
  ShieldAlert, Search, BookOpen, CheckCircle2, 
  X, ShieldCheck, Zap, AlertTriangle,
  ChevronRight, Terminal, FileSearch,
  Book, Lock, Activity, Share2, Lightbulb, Microscope, 
  ArrowRight, Shield as ShieldIcon, Info, History as HistoryIcon,
  User, ExternalLink, ArrowLeft, PlayCircle, Youtube, Link, Play
} from 'lucide-react';
import { DeceptionCaseApi, getDeceptionCases } from '../../services/tools/vaultService';

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

const caseHashPrefix = '#kesi-';

const getCaseIdFromHash = (): string | null => {
  const hash = (window.location.hash || '').trim();
  if (!hash.toLowerCase().startsWith(caseHashPrefix)) {
    return null;
  }
  const raw = hash.slice(caseHashPrefix.length);
  if (!raw) {
    return null;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const buildCaseHash = (caseId: string): string => `${caseHashPrefix}${encodeURIComponent(caseId)}`;

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
        setCasesError(error?.message || 'Imeshindikana kupakua kesi za udanganyifu.');
      } finally {
        setLoadingCases(false);
      }
    };

    loadCases();
  }, []);

  useEffect(() => {
    if (!cases.length) return;
    const caseIdFromHash = getCaseIdFromHash();
    if (!caseIdFromHash) return;
    const foundCase = cases.find((item) => item.id === caseIdFromHash);
    if (foundCase) {
      setActiveCaseId(foundCase.id);
    }
  }, [cases]);

  const activeCase = useMemo(() => 
    cases.find(c => c.id === activeCaseId), 
  [activeCaseId, cases]);

  const filteredCases = cases.filter(c => 
    c.topic.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase())
  );
  const topHeadline = filteredCases[0]?.topic || cases[0]?.topic || 'Hakuna uchunguzi kwa sasa.';

  const openCase = (caseItem: CaseStudy) => {
    setActiveCaseId(caseItem.id);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${buildCaseHash(caseItem.id)}`);
  };

  const closeCase = () => {
    setActiveCaseId(null);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  };

  const handleShare = async () => {
    if (!activeCase) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${buildCaseHash(activeCase.id)}`;
    const sharePayload = {
      title: activeCase.topic,
      text: activeCase.shareText,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(sharePayload);
        return;
      } catch {
        // Fallback below when user cancels or device blocks share sheet.
      }
    }

    try {
      await navigator.clipboard.writeText(`${sharePayload.text}\n${sharePayload.url}`);
    } catch {
      window.prompt('Nakili link hii ya kushare:', shareUrl);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-20 max-w-6xl mx-auto animate-fade-in">
      <div className="p-4 sm:p-6 md:p-12 border-b border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl text-primary-900 dark:text-gold-400 border border-slate-200 dark:border-slate-800">
              <ShieldAlert size={22} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                Uchunguzi wa <span className="text-red-600">Kiungu</span>
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">
                Ukweli dhidi ya uongo kwa ushahidi wa maandiko
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Tafuta kesi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-full text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/90 dark:border-red-500/30 dark:bg-red-500/10 px-4 py-3 flex items-center gap-3">
          <span className="shrink-0 px-2 py-1 rounded-full bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-[0.12em] text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/40">
            Tahadhari
          </span>
          <p className="min-w-0 flex-1 text-xs md:text-sm font-bold text-red-700 dark:text-red-200 truncate">
            {topHeadline}
          </p>
          <ArrowRight size={16} className="shrink-0 text-red-600 dark:text-red-300" />
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-8 space-y-5">
        {casesError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
            {casesError}
          </div>
        )}
        {loadingCases && (
          <div className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Inapakia uchunguzi...</div>
        )}
        {!loadingCases && filteredCases.length === 0 && (
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-lg">
            Hakuna taarifa kwa sasa.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCases.map((c) => (
            <article
              key={c.id}
              className="group cursor-pointer rounded-2xl border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] hover:border-gold-400/80 hover:shadow-[0_14px_28px_rgba(212,154,20,0.12)] transition-all"
              onClick={() => openCase(c)}
              role="button"
              tabIndex={0}
              aria-label={`Fungua kesi ${c.id}`}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openCase(c);
                }
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300">
                  Kesi #{c.id}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${
                  c.threatLevel === 'CRITICAL'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : c.threatLevel === 'HIGH'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                }`}>
                  {c.threatLevel}
                </span>
              </div>

              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-gold-700 dark:group-hover:text-gold-300 transition-colors leading-tight">
                {c.topic}
              </h4>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-2 font-serif">
                {c.tradition}
              </p>

              <div className="mt-4 pt-3 border-t border-green-100/90 dark:border-slate-700 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  {c.category}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openCase(c);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/80 bg-gold-100/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-gold-800 hover:bg-gold-200/80 transition-colors"
                >
                  Chunguza
                  <ChevronRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeCase && (
        <div className="fixed inset-0 z-[600] bg-slate-950/98 backdrop-blur-3xl animate-fade-in flex flex-col overflow-hidden">
           
           <header className="h-16 bg-black/40 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-4">
                 <button 
                   onClick={closeCase}
                   className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all flex items-center gap-2 group"
                 >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Kumbukumbu</span>
                 </button>
                 <div className="h-6 w-[1px] bg-white/5"></div>
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] hidden sm:block">CHUMBA CHA UKAGUZI: {activeCase.id}</h3>
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                   onClick={handleShare}
                   className="p-2.5 bg-gold-500 text-primary-950 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all"
                   title="Shiriki Ukweli"
                  >
                    <Share2 size={20} />
                 </button>
                 <div className="h-6 w-[1px] bg-white/5 mx-1"></div>
                 <button onClick={closeCase} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
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
                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 italic">Uongo (Mapokeo)</h3>
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
                             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Ukweli wa Maandiko</h3>
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
                             <span className="text-[8px] font-bold text-slate-600 uppercase">Kituo cha Uchambuzi</span>
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
                             <h4 className="text-[9px] font-black text-gold-500 uppercase tracking-[0.4em]">Maelezo ya Kina</h4>
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



