
import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, RefreshCcw, ShieldCheck, ArrowRight, BookOpen, AlertOctagon, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onGoToVault?: () => void;
}

const DECEPTIONS = [
  { 
    topic: "Hali ya Wafu", 
    myth: "Roho Haifi", 
    mythDesc: "Wafu wanatuona, wanatulinda, na wanaishi mbinguni au kuzimu mara baada ya kufa.", 
    truth: "Usingizi Mzito",
    truthDesc: "Wafu hawajui neno lo lote. Wamelala kaburini wakisubiri ufufuo wa mwisho.",
    ref: "Mhubiri 9:5",
    risk: "CRITICAL"
  },
  { 
    topic: "Siku ya Ibada", 
    myth: "Jumapili Takatifu", 
    mythDesc: "Siku ya kwanza iliwekwa badala ya Sabato kwa amri ya kanisa na ufufuo.", 
    truth: "Sabato ya Bwana",
    truthDesc: "Siku ya saba (Jumamosi) ni takatifu milele tangu uumbaji. Mungu hajawahi kubadili.",
    ref: "Kutoka 20:8",
    risk: "HIGH"
  },
  { 
    topic: "Jehanamu", 
    myth: "Moto wa Milele", 
    mythDesc: "Waovu watachomwa motoni milele na milele bila kufa.", 
    truth: "Mauti ya Pili",
    truthDesc: "Waovu watateketea na kuwa majivu. Malipo ya dhambi ni mauti, si mateso yasiyoisha.",
    ref: "Malaki 4:3",
    risk: "MODERATE"
  },
  { 
    topic: "Sheria & Neema", 
    myth: "Sheria Imekoma", 
    mythDesc: "Tumeokolewa kwa neema, hivyo hatupaswi tena kushika Amri Kumi za Mungu.", 
    truth: "Uthibitisho wa Imani", 
    truthDesc: "Neema haifuti sheria, bali inatupa nguvu ya kuitii. Imani huithibitisha sheria.",
    ref: "Warumi 3:31",
    risk: "HIGH"
  },
  { 
    topic: "Ujio wa Yesu", 
    myth: "Unyakuo wa Siri", 
    mythDesc: "Watakatifu watatoweka ghafla na dunia haitajua, wakiacha nguo na magari nyuma.", 
    truth: "Kila Jicho Litamuona", 
    truthDesc: "Kuja kwa Yesu kutakuwa dhahiri kama umeme, kwa kelele kuu na tarumbeta.",
    ref: "Ufunuo 1:7",
    risk: "CRITICAL"
  },
  { 
    topic: "Lugha Mpya", 
    myth: "Lugha za Malaika", 
    mythDesc: "Kunena maneno yasiyoeleweka (gibberish) ndiyo ishara pekee ya kujazwa Roho Mtakatifu.", 
    truth: "Lugha za Mataifa", 
    truthDesc: "Karama ya lugha ilitolewa ili kuhubiri injili kwa watu wa mataifa katika lugha zao.",
    ref: "Matendo 2:4-8",
    risk: "MODERATE"
  }
];

export const DeceptionTool: React.FC<Props> = ({ onGoToVault }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const nextDeception = () => setActiveTab((prev) => (prev + 1) % DECEPTIONS.length);
  const prevDeception = () => setActiveTab((prev) => (prev - 1 + DECEPTIONS.length) % DECEPTIONS.length);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 rounded-2xl bg-red-600/90 backdrop-blur-md border border-white/10 text-white hover:bg-red-500 hover:scale-105 transition-all flex items-center justify-center shadow-lg shadow-red-900/40 group relative z-50"
        title="Kichungi cha Uongo"
      >
        <ShieldAlert size={22} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-red-950/40 backdrop-blur-md animate-fade-in font-sans">
            <div className="relative bg-[#0f172a] w-full max-w-3xl rounded-2xl shadow-2xl border border-red-500/20 overflow-hidden flex flex-col animate-scale-up max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-red-500/10 bg-slate-900/50 flex-shrink-0">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                         <AlertOctagon size={18} />
                      </div>
                      <div>
                         <h2 className="text-xs font-black text-white uppercase tracking-widest">
                            Maabara ya Utambuzi
                         </h2>
                         <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Protokali ya Ukweli</p>
                      </div>
                   </div>
                   <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <X size={16} />
                   </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto scrollbar-hide flex-shrink-0">
                  {DECEPTIONS.map((d, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`flex-1 py-3 px-4 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                        activeTab === i ? 'text-white border-red-500 bg-white/5' : 'text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      {d.topic}
                    </button>
                  ))}
                </div>

                {/* Content - Side by Side Cards */}
                <div className="p-6 md:p-8 flex-1 bg-[#0f172a] overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                      
                      {/* LIE */}
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 flex flex-col relative group hover:border-red-500/20 transition-all h-full">
                         <div className="flex items-center gap-2 text-red-500 mb-4">
                            <AlertTriangle size={16} />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Mapokeo (Uongo)</h4>
                         </div>
                         <h3 className="text-lg font-black text-red-200 uppercase leading-none mb-3">{DECEPTIONS[activeTab].myth}</h3>
                         <p className="text-xs text-slate-400 leading-relaxed font-medium">"{DECEPTIONS[activeTab].mythDesc}"</p>
                         
                         <div className="mt-auto pt-4 flex justify-end">
                            <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-[8px] font-black uppercase tracking-widest border border-red-500/20">
                               {DECEPTIONS[activeTab].risk} Risk
                            </span>
                         </div>
                      </div>

                      {/* TRUTH */}
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6 flex flex-col relative group hover:border-emerald-500/20 transition-all shadow-[0_0_30px_rgba(16,185,129,0.05)] h-full">
                         <div className="flex items-center gap-2 text-emerald-500 mb-4">
                            <ShieldCheck size={16} />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Biblia (Ukweli)</h4>
                         </div>
                         <h3 className="text-lg font-black text-emerald-200 uppercase leading-none mb-3">{DECEPTIONS[activeTab].truth}</h3>
                         <p className="text-xs text-slate-300 leading-relaxed font-medium">"{DECEPTIONS[activeTab].truthDesc}"</p>
                         
                         <div className="mt-auto pt-4 flex justify-start">
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                               <BookOpen size={8} /> {DECEPTIONS[activeTab].ref}
                            </span>
                         </div>
                      </div>

                   </div>
                </div>

                {/* Footer */}
                <div className="p-5 bg-slate-900/50 border-t border-white/5 flex justify-between items-center flex-shrink-0">
                   <div className="flex gap-2">
                      <button onClick={prevDeception} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors border border-white/5">
                         <ChevronLeft size={18} />
                      </button>
                      <button onClick={nextDeception} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors border border-white/5">
                         <ChevronRight size={18} />
                      </button>
                   </div>

                   {onGoToVault && (
                     <button 
                       onClick={() => { setIsOpen(false); onGoToVault(); }}
                       className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg"
                     >
                       Ripoti Kamili <ArrowRight size={12} />
                     </button>
                   )}
                </div>

            </div>
        </div>
      )}
    </>
  );
};
