
import React, { useState } from 'react';
import { 
  CheckCircle2, ChevronRight, History, ScrollText, 
  Layers, FileText, Play, BookOpen, 
  ArrowLeft, Info, BrainCircuit, Trophy, X,
  Heart, ShieldAlert, GraduationCap, Download, Youtube, Music, ChevronLeft,
  File, Headphones
} from 'lucide-react';

interface Resource {
  type: 'PDF' | 'YOUTUBE' | 'AUDIO';
  title: string;
  sizeOrLink: string;
}

interface Lesson {
  id: string;
  title: string;
  abstract: string;
  coreAnalysis: string;
  reference: string;
  synthesis: string;
  heroImage: string;
  quiz: { question: string; options: string[]; correct: number }[];
  resources: Resource[];
}

const LESSONS: Lesson[] = [
  {
    id: 'f-1',
    title: "Asili ya Mungu na Uumbaji",
    heroImage: "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1600",
    abstract: "Uchunguzi wa kwanza wa asili ya Muumba.",
    coreAnalysis: "Biblia inaanza na maneno 'Hapo mwanzo Mungu aliziumba mbingu na nchi.' Mungu yupo kabla ya muda na nafasi.",
    reference: "Mwanzo 1:1, Yohana 1:1-3",
    synthesis: "Mungu ni chanzo cha uhai wote.",
    quiz: [
      { question: "Mungu aliumba nini siku ya kwanza?", options: ["Jua", "Nuru", "Mimea", "Wanyama"], correct: 1 },
      { question: "Dunia ilikuwaje kabla ya uumbaji?", options: ["Ukiwa na utupu", "Ilijaa maji pekee", "Ilikuwa na miti"], correct: 1 }
    ],
    resources: [
      { type: 'YOUTUBE', title: 'Uumbaji wa Dunia (Video)', sizeOrLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { type: 'PDF', title: 'Muhtasari wa Mwanzo 1', sizeOrLink: '1.2 MB' },
      { type: 'AUDIO', title: 'Sauti: Asili ya Mungu', sizeOrLink: '4.5 MB' }
    ]
  },
  {
    id: 'f-2',
    title: "Mamlaka ya Biblia (Sola Scriptura)",
    heroImage: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1600",
    abstract: "Biblia kama chujio pekee la ukweli.",
    coreAnalysis: "Kila andiko lenye pumzi ya Mungu lafaa kwa mafundisho. Biblia pekee ndiyo mamlaka ya mwisho.",
    reference: "2 Timotheo 3:16",
    synthesis: "Andiko ndilo mamlaka ya mwisho.",
    quiz: [
      { question: "Sola Scriptura maana yake nini?", options: ["Biblia Pekee", "Mapokeo", "Kanisa", "Hisia"], correct: 0 },
      { question: "Biblia iliandikwa na waandishi wangapi?", options: ["10", "Zaidi ya 40", "100", "1"], correct: 1 }
    ],
    resources: [
      { type: 'YOUTUBE', title: 'Mamlaka ya Biblia (Video)', sizeOrLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { type: 'PDF', title: 'Mwongozo wa Sola Scriptura', sizeOrLink: '2.1 MB' }
    ]
  }
];

const FULL_14_FOUNDATIONS: Lesson[] = Array.from({ length: 14 }).map((_, i) => {
  const base = LESSONS[i] || LESSONS[0];
  return {
    ...base,
    id: `f-${i + 1}`,
    title: i < LESSONS.length ? base.title : `Somo la ${i + 1}: Kukuza Imani`,
  };
});

export const StageFoundations: React.FC<{ onComplete: (score?: number) => void }> = ({ onComplete }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showExam, setShowExam] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [baptismStep, setBaptismStep] = useState<'NONE' | 'DECISION' | 'ALREADY_CHECK' | 'FORM' | 'SUCCESS'>('NONE');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<Resource | null>(null);

  const lessonIdx = activeId ? FULL_14_FOUNDATIONS.findIndex(l => l.id === activeId) : -1;
  const lesson = FULL_14_FOUNDATIONS[lessonIdx];

  const handleSubmit = () => {
    if (!lesson) return;
    let score = 0;
    lesson.quiz.forEach((q, i) => { if (answers[i] === q.correct) score++; });
    const final = Math.round((score / lesson.quiz.length) * 100);
    setResult(final);
    if (final >= 70 && !completed.includes(lesson.id)) {
      setCompleted([...completed, lesson.id]);
    }
  };

  const handleResourceAction = (r: Resource) => {
    if (r.type === 'YOUTUBE') {
      setActiveVideo(r.sizeOrLink);
    } else {
      setActiveDoc(r);
    }
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText size={20} />;
      case 'YOUTUBE': return <Youtube size={20} />;
      case 'AUDIO': return <Headphones size={20} />;
      default: return <Download size={20} />;
    }
  };

  if (baptismStep !== 'NONE') {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-6 animate-fade-in">
        <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up border border-white/20">
          {baptismStep === 'DECISION' && (
            <div className="p-12 text-center space-y-8">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Heart size={48} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 uppercase">Wito wa Kumfuata Yesu</h2>
              <div className="flex flex-col gap-4">
                <button onClick={() => setBaptismStep('ALREADY_CHECK')} className="py-5 bg-primary-900 text-white rounded-lg font-black uppercase tracking-widest hover:bg-primary-800 transition-all">NDIYO, TAYARI NIMESHABATIZWA</button>
                <button onClick={() => setBaptismStep('FORM')} className="py-5 bg-gold-500 text-slate-900 rounded-lg font-black uppercase tracking-widest hover:bg-gold-400 transition-all">NDIYO, NATAKA KUBATIZWA</button>
                <button onClick={() => { onComplete(); setBaptismStep('NONE'); }} className="py-5 text-slate-400 font-bold uppercase tracking-widest text-xs">Baadaye, endelea na masomo</button>
              </div>
            </div>
          )}
          {baptismStep === 'SUCCESS' && (
            <div className="p-16 text-center space-y-8 animate-fade-in">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <GraduationCap size={50} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 uppercase">Heko, Scholar!</h2>
              <button onClick={() => { onComplete(); setBaptismStep('NONE'); }} className="w-full py-5 bg-primary-900 text-gold-400 rounded-lg font-black uppercase tracking-widest hover:bg-gold-500 transition-all">INGIA LEVEL 2 (UNABII)</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FULL_14_FOUNDATIONS.map((l, idx) => (
          <button key={l.id} onClick={() => setActiveId(l.id)} className="group bg-slate-900 border border-white/5 p-6 rounded-2xl text-left relative overflow-hidden transition-all hover:border-gold-500/50 shadow-xl">
            <div className="absolute inset-0 opacity-10 grayscale group-hover:grayscale-0 transition-all"><img src={l.heroImage} className="w-full h-full object-cover" alt="" /></div>
            <div className="relative z-10">
              <div className="flex justify-between mb-4"><span className="text-[10px] font-black text-gold-500 uppercase tracking-widest">Somo {idx+1}</span>{completed.includes(l.id) && <CheckCircle2 size={16} className="text-green-500" />}</div>
              <h3 className="text-lg font-bold text-white uppercase mb-2 group-hover:text-gold-400">{l.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 italic mb-4">"{l.abstract}"</p>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">Ingia Darasani <ChevronRight size={10} className="inline ml-1" /></div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-fade-in overflow-hidden">
      {/* Video Modal with Clear Back Navigation */}
      {activeVideo && (
        <div className="fixed inset-0 z-[500] bg-black/95 flex flex-col animate-fade-in">
          <div className="h-16 bg-black border-b border-white/10 flex items-center px-4 md:px-8">
             <button onClick={() => setActiveVideo(null)} className="flex items-center gap-2 text-white hover:text-gold-500 transition-colors group">
               <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all"><ArrowLeft size={18} /></div>
               <span className="text-xs font-black uppercase tracking-widest">Rudi kwenye Somo</span>
             </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <iframe src={activeVideo} className="w-full h-full" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Doc Modal with Clear Back Navigation */}
      {activeDoc && (
        <div className="fixed inset-0 z-[500] bg-slate-900/98 flex flex-col animate-fade-in">
          <div className="h-16 bg-slate-950 border-b border-white/10 flex items-center justify-between px-4 md:px-8">
             <button onClick={() => setActiveDoc(null)} className="flex items-center gap-2 text-white hover:text-gold-500 transition-colors group">
               <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all"><ArrowLeft size={18} /></div>
               <span className="text-xs font-black uppercase tracking-widest">Rudi kwenye Somo</span>
             </button>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">{activeDoc.title}</h3>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-12 text-center space-y-8 shadow-2xl">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl rotate-3 flex items-center justify-center mx-auto shadow-lg"><FileText size={40}/></div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{activeDoc.title}</h3>
                 <p className="text-slate-500 text-sm font-medium">Resource Preview Mode</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 italic">Maudhui ya somo hili yanapatikana kwa ukamilifu katika rasilimali hii ya kupakuliwa.</div>
              <button className="w-full px-8 py-5 bg-primary-900 text-gold-400 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-primary-800 transition-all flex items-center justify-center gap-3 shadow-xl">
                <Download size={18} /> Pakua Rasilimali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Simplified */}
      <header className="h-16 md:h-20 border-b border-white/10 bg-black/60 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-between shrink-0">
        <button onClick={() => { setActiveId(null); setShowExam(false); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /><span className="text-[10px] font-black uppercase tracking-widest">Ondoka Darasani</span>
        </button>
        <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest truncate">{lesson.title}</span>
        <div className="w-8"></div> {/* Spacer for balance */}
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-slate-950">
          {!showExam ? (
            <div className="animate-slide-up">
              
              {/* Hero Image with Integrated Resource Dock */}
              <div className="relative h-[40vh] md:h-[50vh] overflow-hidden group">
                <img src={lesson.heroImage} className="w-full h-full object-cover brightness-[0.3]" alt="" />
                
                {/* Title Container - Adjusted bottom position and added padding-right to avoid overlap */}
                <div className="absolute bottom-20 left-6 right-16 md:left-12 md:right-auto max-w-3xl space-y-4 pointer-events-none z-10">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none shadow-black drop-shadow-2xl">
                    {lesson.title}
                  </h1>
                  {/* The Separator Line */}
                  <div className="h-[2px] w-20 bg-gold-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                </div>

                {/* Resource Dock - Bottom Right - Floating Icons */}
                <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
                   {resourcesOpen && (
                      <div className="flex items-center gap-3 animate-scale-in origin-right mr-2">
                         {lesson.resources.map((r, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleResourceAction(r)}
                              title={r.title}
                              className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-2xl ${
                                r.type === 'PDF' ? 'bg-red-600 text-white' : 
                                r.type === 'YOUTUBE' ? 'bg-red-500 text-white' : 
                                'bg-blue-600 text-white'
                              }`}
                            >
                               {getResourceIcon(r.type)}
                            </button>
                         ))}
                      </div>
                   )}
                   <button 
                     onClick={() => setResourcesOpen(!resourcesOpen)}
                     className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${resourcesOpen ? 'bg-slate-900 text-white border border-white/20' : 'bg-gold-500 text-primary-950 hover:scale-105'}`}
                   >
                      {resourcesOpen ? <X size={24} /> : <BookOpen size={24} />}
                   </button>
                </div>
              </div>

              <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 pb-32">
                <section className="space-y-4">
                  <h4 className="flex items-center gap-3 text-[10px] font-black text-gold-500 uppercase tracking-widest"><History size={16}/> I. Muhtasari</h4>
                  <p className="text-xl md:text-3xl text-slate-200 leading-relaxed font-serif italic border-l-4 border-gold-500/30 pl-6 py-2">{lesson.abstract}</p>
                </section>
                <section className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[10px] font-black text-blue-500 uppercase tracking-widest"><ScrollText size={16}/> II. Uchambuzi wa Kina</h4>
                  <div className="text-base md:text-xl text-slate-400 leading-relaxed space-y-4">{lesson.coreAnalysis}</div>
                </section>
                <div className="text-center pt-10 border-t border-white/5">
                  <button onClick={() => setShowExam(true)} className="px-12 py-5 bg-gold-500 text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-white transition-all shadow-xl rounded-lg">ANZA MTIHANI</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-12 px-6 animate-fade-in">
              {result !== null ? (
                <div className="bg-white/5 rounded-lg p-10 text-center border border-white/10 space-y-8">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 ${result >= 70 ? 'bg-green-500/10 border-green-500/40 text-green-500' : 'bg-red-500/10 border-red-500/40 text-red-500'}`}>
                    {result >= 70 ? <Trophy size={40}/> : <BrainCircuit size={40}/>}
                  </div>
                  <h3 className="text-6xl font-black text-white">{result}%</h3>
                  <button onClick={result >= 70 ? () => { setActiveId(null); setShowExam(false); } : () => {setResult(null); setAnswers({}); setShowExam(false);}} className="px-10 py-4 bg-gold-500 text-black font-black text-[10px] uppercase tracking-widest rounded-lg">ENDELEA</button>
                </div>
              ) : (
                <div className="space-y-8">
                   {lesson.quiz.map((q, i) => (
                    <div key={i} className="p-6 bg-white/5 rounded-lg space-y-4 border border-white/5">
                      <p className="text-lg font-bold text-slate-200">{i + 1}. {q.question}</p>
                      <div className="grid gap-2">
                        {q.options.map((o, oi) => (
                          <button key={oi} onClick={() => setAnswers({...answers, [i]: oi})} className={`p-4 text-left rounded-lg text-xs font-bold border transition-all ${answers[i] === oi ? 'bg-gold-500 text-black border-gold-400' : 'bg-black/40 text-slate-500 border-white/10 hover:border-white/20'}`}>
                            {String.fromCharCode(65 + oi)}. {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSubmit} className="w-full py-5 bg-primary-900 text-gold-400 font-black text-[10px] uppercase tracking-[0.4em] rounded-lg" disabled={Object.keys(answers).length < lesson.quiz.length}>TUMA MAJIBU</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
