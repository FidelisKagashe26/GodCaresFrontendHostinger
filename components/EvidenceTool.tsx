
import React, { useState } from 'react';
import { Microscope, ChevronRight, ChevronLeft, Clock, X, Fingerprint, MapPin, Lightbulb, Info, CheckCircle2 } from 'lucide-react';

interface EvidenceFact {
  id: number;
  title: string;
  evidence: string;
  didYouKnow: string;
  hints: string[]; // Added hints array
  image: string;
  year: string;
  location: string;
}

const FACTS: EvidenceFact[] = [
  { 
    id: 1,
    title: "Dead Sea Scrolls", 
    evidence: "Hati za Kale za Biblia",
    didYouKnow: "Nakala hizi za miaka 2000 iliyopita zinafanana kwa 99% na Biblia yako ya leo, zikithibitisha kuwa Neno la Mungu halijabadilika.",
    hints: [
      "Ziligunduliwa mwaka 1947 mapangoni.",
      "Zina maandiko ya Agano la Kale yote isipokuwa Esta.",
      "Zinathibitisha usahihi wa unabii wa Isaya."
    ],
    image: "https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=1600",
    year: "1947",
    location: "Qumran"
  },
  { 
    id: 2,
    title: "Cyrus Cylinder", 
    evidence: "Silinda ya Koreshi",
    didYouKnow: "Silinda hii inamtaja Mfalme Koreshi na amri yake ya kuwaachia huru mateka, kama ilivyotabiriwa na Isaya miaka 150 kabla.",
    hints: [
      "Inajulikana kama 'Hati ya kwanza ya Haki za Binadamu'.",
      "Iko British Museum leo.",
      "Inathibitisha Ezra 1:1-4."
    ],
    image: "https://images.unsplash.com/photo-1510440842629-a05c440fc75b?q=80&w=1600",
    year: "539 KK",
    location: "Babeli"
  },
  {
    id: 3,
    title: "Pilate Stone",
    evidence: "Jiwe la Pilato",
    didYouKnow: "Kwa miaka mingi wakosoaji walisema Pilato hakuwahi kuwepo. Mwaka 1961, jiwe hili lilipatikana likiwa na jina lake.",
    hints: [
      "Lilipatikana katika ukumbi wa michezo Caesarea.",
      "Linaandikwa 'Pontius Pilatus, Prefect of Judea'.",
      "Ushahidi wa moja kwa moja wa hukumu ya Yesu."
    ],
    image: "https://images.unsplash.com/photo-1599596378252-474026337f71?q=80&w=1600",
    year: "1961",
    location: "Caesarea"
  }
];

interface Props {
  onGoToVault?: () => void;
}

export const EvidenceTool: React.FC<Props> = ({ onGoToVault }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % FACTS.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + FACTS.length) % FACTS.length);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 rounded-2xl bg-emerald-600/90 backdrop-blur-md border border-white/10 text-white hover:bg-emerald-500 hover:scale-105 transition-all flex items-center justify-center shadow-lg shadow-emerald-900/40 group relative z-50"
        title="Kagua Ushahidi"
      >
        <Microscope size={22} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-fade-in font-sans">
            <div className="relative bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-900/50 z-20 absolute top-0 w-full backdrop-blur-sm">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                         <Fingerprint size={18} />
                      </div>
                      <h2 className="text-xs font-black text-white uppercase tracking-widest">
                          Mkaguzi wa Akiolojia
                      </h2>
                   </div>
                   <button onClick={() => setIsOpen(false)} className="p-2 bg-black/40 hover:bg-red-500 text-white rounded-full transition-colors">
                      <X size={16} />
                   </button>
                </div>

                {/* Main Content & Larger Hero Image */}
                <div className="relative h-[350px] md:h-[400px] bg-black group shrink-0">
                   <img 
                     src={FACTS[currentIndex].image} 
                     className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                     alt="Evidence" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-black/60"></div>
                   
                   {/* Overlay Info - Bottom Left with Separator */}
                   <div className="absolute bottom-8 left-8 z-10 max-w-lg">
                      <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none shadow-black drop-shadow-2xl mb-3">
                         {FACTS[currentIndex].title}
                      </h3>
                      
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-4">
                            <span className="text-emerald-400 font-black text-lg tracking-widest shadow-black drop-shadow-md">{FACTS[currentIndex].year}</span>
                            <div className="h-0.5 w-12 bg-emerald-500"></div>
                         </div>
                         <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-widest shadow-black drop-shadow-md">
                            <MapPin size={14} className="text-emerald-500"/> {FACTS[currentIndex].location}
                         </div>
                      </div>

                      <p className="text-sm font-medium text-white/90 border-l-4 border-emerald-500 pl-4 mt-4 leading-relaxed max-w-sm drop-shadow-lg hidden md:block">
                         {FACTS[currentIndex].evidence}
                      </p>
                   </div>
                </div>

                {/* Did You Know & Hints Section - Professional Layout */}
                <div className="bg-[#0f172a] p-6 md:p-8 border-t border-white/5 relative flex-1 overflow-y-auto">
                   
                   {/* Main Fact Card */}
                   <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 mb-6 relative">
                      <div className="absolute -top-3 -right-3 bg-emerald-500 text-primary-950 p-2 rounded-lg shadow-lg">
                         <Lightbulb size={20} fill="currentColor" />
                      </div>
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Je, Wajua?</h4>
                      <p className="text-sm text-slate-200 leading-relaxed font-medium italic">
                         "{FACTS[currentIndex].didYouKnow}"
                      </p>
                   </div>

                   {/* Hints / Dondoo Muhimu */}
                   <div>
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Info size={12} /> Dondoo Muhimu (Hints)
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                         {FACTS[currentIndex].hints.map((hint, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                               <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                               <span className="text-xs text-slate-400 font-medium">{hint}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 bg-slate-900/50 border-t border-white/5 flex justify-between items-center shrink-0">
                   <div className="flex gap-2">
                      <button onClick={prev} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors border border-white/5">
                         <ChevronLeft size={18} />
                      </button>
                      <button onClick={next} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors border border-white/5">
                         <ChevronRight size={18} />
                      </button>
                   </div>

                   {onGoToVault && (
                     <button 
                       onClick={() => { setIsOpen(false); onGoToVault(); }} 
                       className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg border border-emerald-500/30 hover:border-emerald-500 flex items-center gap-2"
                     >
                       Makumbusho Kamili <ChevronRight size={12} />
                     </button>
                   )}
                </div>

            </div>
        </div>
      )}
    </>
  );
};
