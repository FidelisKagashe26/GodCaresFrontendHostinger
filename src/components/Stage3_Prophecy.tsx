
import React, { useState } from 'react';
import { 
  CheckCircle2, ChevronRight, History, ScrollText, 
  Layers, FileText, Play, BookOpen, 
  ArrowLeft, Info, Sparkles, BrainCircuit, Trophy, X, BarChart3, GraduationCap, Edit2, Check
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  heroImage: string;
  abstract: string;
  coreAnalysis: string;
  symbols: { icon: string; name: string; meaning: string }[];
  reference: string;
  quiz: { question: string; options: string[]; correct: number }[];
  resources: { type: 'PDF' | 'VIDEO' | 'CHART'; title: string; size: string }[];
}

const PROPHECY_DATA: Lesson[] = [
  { id: 'p-1', title: "Sanamu ya Danieli 2", heroImage: "https://images.unsplash.com/photo-1599596378252-474026337f71?q=80&w=1600", abstract: "Historia ya dunia kuanzia Babeli mpaka marejeo ya Yesu.", coreAnalysis: "Dhahabu (Babeli), Fedha (Umedi/Uajemi), Shaba (Ugiriki), Chuma (Roma). Mawe yanayopiga miguu ni ufalme wa Mungu.", symbols: [{icon: "Gold", name: "Dhahabu", meaning: "Babeli"}, {icon: "Silver", name: "Fedha", meaning: "Uajemi"}], reference: "Danieli 2", quiz: [
    {question: "Kichwa cha dhahabu ni nani?", options: ["Roma", "Ugiriki", "Babeli", "Misri"], correct: 2},
    {question: "Fedha inawakilisha nini?", options: ["Umedi na Uajemi", "Ugiriki", "Roma", "Ufaransa"], correct: 0},
    {question: "Jiwe lililopiga miguu lilichongwa na?", options: ["Wafalme", "Musa", "Bila kazi ya mikono", "Shetani"], correct: 2},
    {question: "Vidole vya miguu vilikuwa mchanganyiko wa?", options: ["Chuma na Shaba", "Dhahabu na Fedha", "Chuma na Udongo", "Shaba na Udongo"], correct: 2},
    {question: "Danieli alipewa ufunuo huu wapi?", options: ["Yerusalemu", "Babeli", "Misri", "Roma"], correct: 1},
    {question: "Mfalme aliyeshindwa kukumbuka ndoto ni?", options: ["Koreshi", "Dario", "Nebukadreza", "Farao"], correct: 2},
    {question: "Ufalme wa milele ni upi?", options: ["Ugiriki", "Dunia mpya ya Mungu", "Marekani", "Roma iliyohuishwa"], correct: 1}
  ], resources: [] },
  { id: 'p-2', title: "Danieli 7: Wanyama Wanne", heroImage: "https://images.unsplash.com/photo-1543165731-0d29792694b8?q=80&w=1600", abstract: "Upanuzi wa Danieli 2 kupitia ishara za wanyama.", coreAnalysis: "Simba, Dubu, Chui, na mnyama wa kutisha. Pembe ndogo inachomoza kumpinga Mungu.", symbols: [{icon: "Lion", name: "Simba", meaning: "Babeli"}], reference: "Danieli 7", quiz: [
    {question: "Chui anawakilisha nini?", options: ["Babeli", "Ugiriki", "Roma", "Uajemi"], correct: 1},
    {question: "Simba mwenye mabawa ni ufalme gani?", options: ["Babeli", "Misri", "Asiria", "Uajemi"], correct: 0},
    {question: "Dubu anawakilisha nini?", options: ["Ugiriki", "Umedi na Uajemi", "Rumi", "Ujerumani"], correct: 1},
    {question: "Mnyama wa nne ana pembe ngapi?", options: ["4", "7", "10", "12"], correct: 2},
    {question: "Pembe ndogo inatokea wapi?", options: ["Katikati ya pembe 10", "Mbinguni", "Jangwani", "Bahari nyingine"], correct: 0},
    {question: "Pembe ndogo inanena maneno ya?", options: ["Baraka", "Kufuru", "Haki", "Unabii safi"], correct: 1},
    {question: "Nani aliketi juu ya kiti cha enzi kuhukumu?", options: ["Mzee wa siku", "Nebukadreza", "Danieli", "Malaika Gabriel"], correct: 0}
  ], resources: [] }
];

const FULL_14_PROPHECIES: Lesson[] = Array.from({ length: 14 }).map((_, i) => {
  const base = PROPHECY_DATA[i] || PROPHECY_DATA[0];
  return {
    ...base,
    id: `p-${i + 1}`,
    title: i < PROPHECY_DATA.length ? base.title : `Prophetic Vision ${i + 1}`,
  };
});

export const StageThreeProphecy: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showExam, setShowExam] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [showLevelFinish, setShowLevelFinish] = useState(false);

  const lessonIdx = activeId ? FULL_14_PROPHECIES.findIndex(l => l.id === activeId) : -1;
  const lesson = FULL_14_PROPHECIES[lessonIdx];

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: optionIndex });
    setEditingQuestionIndex(null); // Auto-collapse after selection
  };

  const handleSubmit = () => {
    if (!lesson) return;
    let score = 0;
    lesson.quiz.forEach((q, i) => { if (answers[i] === q.correct) score++; });
    const final = Math.round((score / lesson.quiz.length) * 100);
    setResult(final);
    if (final >= 70 && !completed.includes(lesson.id)) setCompleted([...completed, lesson.id]);
  };

  const handleNextAction = () => {
    if (lessonIdx === FULL_14_PROPHECIES.length - 1) {
      setShowLevelFinish(true);
    } else {
      setActiveId(FULL_14_PROPHECIES[lessonIdx + 1].id);
      setShowExam(false);
      setAnswers({});
      setResult(null);
    }
  };

  if (showLevelFinish) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-6 animate-fade-in">
        <div className="bg-white rounded-[3rem] w-full max-w-2xl p-12 text-center space-y-8 animate-scale-up border border-white/20">
           <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trophy size={50} />
           </div>
           <h2 className="text-4xl font-black text-slate-900 uppercase leading-none">Prophetic Master!</h2>
           <p className="text-slate-500 italic">"Umekamilisha Level 2: Neno la Unabii. Sasa una macho ya kuona historia ya dunia kama Mungu alivyoifunua."</p>
           <div className="p-10 border-4 border-double border-blue-500 bg-slate-50 rounded-lg">
             <GraduationCap size={40} className="mx-auto text-blue-500 mb-4" />
             <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400">GC365 ACADEMY CERTIFICATE</p>
             <h3 className="text-2xl font-serif font-bold text-primary-900 mt-2">Prophetic Analyst</h3>
             <p className="mt-2 text-[10px] font-bold text-slate-400">Awarded for Advanced Eschatology Excellence</p>
           </div>
           <button onClick={() => onComplete()} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl">
             INGIA LEVEL 3 (DISCERNMENT)
           </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FULL_14_PROPHECIES.map((l, idx) => (
          <button key={l.id} onClick={() => setActiveId(l.id)} className="group bg-slate-900 border border-white/5 p-6 rounded-2xl text-left relative overflow-hidden hover:border-blue-500/50 shadow-xl">
            <div className="absolute inset-0 opacity-10 grayscale group-hover:grayscale-0 transition-all"><img src={l.heroImage} className="w-full h-full object-cover" alt="" /></div>
            <div className="relative z-10">
              <div className="flex justify-between mb-4"><span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Vision {idx+1}</span>{completed.includes(l.id) && <CheckCircle2 size={16} className="text-green-500" />}</div>
              <h3 className="text-lg font-bold text-white uppercase mb-2 group-hover:text-blue-400">{l.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 italic mb-4">"{l.abstract}"</p>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-white/5 pt-4">Chambua Unabii <ChevronRight size={10} className="inline ml-1" /></div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-fade-in overflow-hidden">
      <header className="h-16 md:h-20 border-b border-white/10 bg-black/60 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-between shrink-0">
        <button onClick={() => {setActiveId(null); setShowExam(false);}} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Rudi</span>
        </button>
        <span className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest truncate">{lesson.title}</span>
        <button onClick={() => setSideOpen(true)} className="lg:hidden p-2 text-blue-500"><Info size={20} /></button>
        <div className="hidden lg:flex gap-4 text-[10px] font-bold text-slate-500 uppercase">Prophetic Record #{lessonIdx + 1}</div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-slate-950">
          {!showExam ? (
            <div className="animate-slide-up">
              <div className="relative h-[40vh] md:h-[55vh] overflow-hidden">
                <img src={lesson.heroImage} className="w-full h-full object-cover brightness-[0.25]" alt="" />
                <div className="absolute bottom-10 left-6 right-6 md:left-12 max-w-4xl space-y-4">
                  <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{lesson.title}</h1>
                </div>
              </div>
              <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 pb-32">
                <section className="space-y-4"><h4 className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"><History size={16} className="text-blue-500"/> Historia iliyotabiriwa</h4><p className="text-xl md:text-3xl text-slate-300 italic border-l-2 border-blue-500/20 pl-6 py-2">{lesson.abstract}</p></section>
                <section className="space-y-6"><h4 className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"><ScrollText size={16} className="text-blue-500"/> Analysis</h4><div className="text-base md:text-xl text-slate-400 leading-relaxed space-y-4">{lesson.coreAnalysis}</div><div className="grid md:grid-cols-2 gap-4 mt-8">{lesson.symbols.map((s,i) => <div key={i} className="p-6 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5"><span className="text-3xl">{s.icon}</span><div><p className="font-black text-white text-[10px] uppercase tracking-widest">{s.name}</p><p className="text-xs text-slate-500 mt-1">{s.meaning}</p></div></div>)}</div></section>
                <div className="text-center pt-10"><button onClick={() => setShowExam(true)} className="px-12 py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-xl">ANZA MTIHANI (MASWALI 7)</button></div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-12 px-6 animate-fade-in">
              {result !== null ? (
                <div className="bg-white/5 rounded-3xl p-10 text-center border border-white/10 space-y-8 shadow-2xl">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20"><Trophy size={40} className="text-blue-500"/></div>
                  <div>
                    <h3 className="text-6xl font-black text-white">{result}%</h3>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest mt-2">{result >= 70 ? 'UMEFAULU VEMA' : 'RUDIA TENA'}</p>
                  </div>
                  <button onClick={result >= 70 ? handleNextAction : () => {setResult(null); setAnswers({}); setShowExam(false);}} className="px-10 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest transition-all">
                    {result >= 70 ? (lessonIdx === FULL_14_PROPHECIES.length - 1 ? 'Finish Level 2' : 'Somo Linalofuata') : 'Try Again'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <h2 className="text-2xl font-black text-white uppercase text-center mb-10">Validation Quiz</h2>
                  {lesson.quiz.map((q, i) => {
                    const isAnswered = answers[i] !== undefined;
                    const isEditing = editingQuestionIndex === i;
                    const isCollapsed = isAnswered && !isEditing;

                    return (
                      <div key={i} className={`rounded-2xl transition-all duration-300 border ${isCollapsed ? 'bg-green-500/10 border-green-500/30 p-4' : 'bg-white/5 border-white/5 p-6'}`}>
                        <div className="flex justify-between items-start gap-4">
                           <p className={`font-bold ${isCollapsed ? 'text-green-400 text-sm' : 'text-slate-200 text-lg'}`}>{i + 1}. {q.question}</p>
                           {isCollapsed && (
                             <button 
                               onClick={() => setEditingQuestionIndex(i)} 
                               className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-lg transition-colors"
                             >
                               <Edit2 size={12} /> Badilisha
                             </button>
                           )}
                        </div>

                        {isCollapsed ? (
                          <div className="mt-2 flex items-center gap-2 text-white">
                             <CheckCircle2 size={16} className="text-green-500" />
                             <span className="font-bold text-sm">{q.options[answers[i]]}</span>
                          </div>
                        ) : (
                          <div className="grid gap-2 mt-4 animate-fade-in">
                            {q.options.map((o, oi) => (
                              <button 
                                key={oi} 
                                onClick={() => handleAnswerSelect(i, oi)} 
                                className={`p-4 text-left rounded-xl text-xs font-bold border transition-all flex items-center gap-3 ${answers[i] === oi ? 'bg-blue-600 text-white border-blue-400' : 'bg-black/40 text-slate-500 border-white/10 hover:border-white/30 hover:text-white'}`}
                              >
                                {answers[i] === oi && <Check size={14} />}
                                {String.fromCharCode(65 + oi)}. {o}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button 
                    onClick={handleSubmit} 
                    className={`w-full py-5 font-black text-[10px] uppercase tracking-[0.4em] rounded-xl transition-all ${Object.keys(answers).length < lesson.quiz.length ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl'}`} 
                    disabled={Object.keys(answers).length < lesson.quiz.length}
                  >
                    TUMA MAJIBU YA MTIHANI
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
        <aside className={`fixed inset-y-0 right-0 z-[110] w-80 bg-slate-900 p-8 transition-transform lg:relative lg:translate-x-0 lg:block lg:w-96 lg:border-l lg:border-white/5 ${sideOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <button onClick={() => setSideOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 text-slate-400"><X size={20}/></button>
          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Nyaraka za Unabii</h3>
            {lesson.resources.length > 0 ? lesson.resources.map((r, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-3 group hover:border-blue-500/30 transition-all cursor-pointer"><BarChart3 size={18} className="text-blue-500"/><div className="flex-1 min-w-0"><p className="text-xs font-bold text-white truncate">{r.title}</p><p className="text-[9px] text-slate-500 uppercase font-black">{r.size}</p></div></div>
            )) : <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest text-center italic">Hakuna nyaraka hapa.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
};
