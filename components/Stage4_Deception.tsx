
import React, { useState } from 'react';
import { 
  CheckCircle2, ChevronRight, History, ScrollText, 
  Layers, FileText, Play, BookOpen, 
  ArrowLeft, Info, Sparkles, BrainCircuit, Trophy, X, ShieldAlert, Zap
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  deceptionSummary: string;
  logicalAnalysis: string;
  biblicalCorrection: string;
  dangerLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  quiz: { question: string; options: string[]; correct: number }[];
}

const DISCERNMENT_LESSONS: Lesson[] = [
  { id: 'd-1', title: "Siri ya Uovu: Asili ya Udanganyifu", deceptionSummary: "Asili ya uongo tangu mbinguni.", logicalAnalysis: "Shetani anatumia nusu ukweli kupofusha akili.", biblicalCorrection: "Biblia inasema: 'Maana huyu ni mpinga Kristo.'", dangerLevel: 'CRITICAL', quiz: [{question: "Uongo wa kwanza ulikuwa upi?", options: ["Hamtakufa", "Mungu ni pendo", "Musa ni nabii"], correct: 0}] },
  { id: 'd-2', title: "Mapokeo vs Neno la Mungu", deceptionSummary: "Dini zinazofuata wanadamu.", logicalAnalysis: "Hisia zimewekwa juu ya 'Ndivyo asemavyo Bwana'.", biblicalCorrection: "Mathayo 15:9", dangerLevel: 'HIGH', quiz: [{question: "Nini mamlaka yetu?", options: ["Kanisa", "Biblia", "Mfalme"], correct: 1}] },
  { id: 'd-3', title: "Hali ya Wafu (Spiritism)", deceptionSummary: "Uongo kuwa wafu wanatuona.", logicalAnalysis: "Inafungua mlango wa pepo kusema na watu.", biblicalCorrection: "Mhubiri 9:5", dangerLevel: 'CRITICAL', quiz: [{question: "Je wafu wanajua neno?", options: ["Ndiyo", "Hapana", "Mara chache"], correct: 1}] },
  { id: 'd-4', title: "Mabadiliko ya Sabato", deceptionSummary: "Jaribio la kubadili sheria ya Mungu.", logicalAnalysis: "Kubadilisha siku ni kubadili mamlaka ya Muumba.", biblicalCorrection: "Kutoka 20:8", dangerLevel: 'HIGH', quiz: [{question: "Sabato ilibadilishwa na nani?", options: ["Mungu", "Mwanadamu", "Malaika"], correct: 1}] },
  { id: 'd-5', title: "Fundisho la Jehanamu", deceptionSummary: "Mungu mkatili anayechoma watu milele.", logicalAnalysis: "Inaharibu tabia ya upendo wa Mungu.", biblicalCorrection: "Warumi 6:23", dangerLevel: 'MODERATE', quiz: [{question: "Mshahara wa dhambi ni nini?", options: ["Mauti", "Mateso ya milele", "Moto wa milele"], correct: 0}] },
  { id: 'd-6', title: "Secret Rapture", deceptionSummary: "Yesu atakuja kwa siri kuchukua wateule.", logicalAnalysis: "Inawafanya watu wasijiandae kwa sasa.", biblicalCorrection: "Ufunuo 1:7", dangerLevel: 'HIGH', quiz: [{question: "Kila jicho litamuona?", options: ["Ndiyo", "Hapana"], correct: 0}] },
  { id: 'd-7', title: "Alama ya Mnyama", deceptionSummary: "Udanganyifu kuhusu alama ya utii.", logicalAnalysis: "Ni suala la ibada na utii kwa sheria ya Mungu.", biblicalCorrection: "Ufunuo 13", dangerLevel: 'CRITICAL', quiz: [{question: "Alama ni nini?", options: ["Chip", "Suala la Utii", "Bar-code"], correct: 1}] },
  { id: 'd-8', title: "Mara Moja Umeokoka, Daima Umeokoka", deceptionSummary: "Uongo kuwa wokovu haupotei.", logicalAnalysis: "Inafanya watu waendelee kutenda dhambi bila hofu.", biblicalCorrection: "Mathayo 24:13", dangerLevel: 'HIGH', quiz: [{question: "Nani ataokoka?", options: ["Aliyeamini mara moja", "Atakayevumilia mwisho", "Wote"], correct: 1}] },
  { id: 'd-9', title: "Ecumenism: Umoja wa Uongo", deceptionSummary: "Umoja wa kidini usio na msingi wa kweli.", logicalAnalysis: "Ukweli unafichwa ili kupata umoja wa kidunia.", biblicalCorrection: "2 Wakorintho 6:14", dangerLevel: 'HIGH', quiz: [{question: "Umoja wa kweli msingi wake ni nini?", options: ["Ukweli", "Hisia", "Wingi"], correct: 0}] },
  { id: 'd-10', title: "Maajabu ya Uongo", deceptionSummary: "Miujiza inayopotosha watu.", logicalAnalysis: "Si kila muujiza unatoka kwa Mungu.", biblicalCorrection: "Mathayo 7:22-23", dangerLevel: 'HIGH', quiz: [{question: "Kila muujiza ni wa Mungu?", options: ["Ndiyo", "Hapana"], correct: 1}] },
  { id: 'd-11', title: "New Age na Filosofia", deceptionSummary: "Kujitafuta ndani badala ya kumtafuta Mungu.", logicalAnalysis: "Mwanadamu anajigeuza kuwa mungu.", biblicalCorrection: "Isaya 8:20", dangerLevel: 'MODERATE', quiz: [{question: "Chujio letu ni nini?", options: ["Nia", "Sheria na Ushuhuda", "Sayansi"], correct: 1}] },
  { id: 'd-12', title: "Saikolojia vs Imani", deceptionSummary: "Kutegemea akili badala ya uweza wa Roho.", logicalAnalysis: "Dhambi inaitwa ugonjwa badala ya uasi.", biblicalCorrection: "Zaburi 51", dangerLevel: 'MODERATE', quiz: [{question: "Toba inatibu dhambi?", options: ["Ndiyo", "Hapana"], correct: 0}] },
  { id: 'd-13', title: "Higher Criticism", deceptionSummary: "Kushambulia usahihi wa Biblia.", logicalAnalysis: "Inajaribu kufanya Biblia ionekane ni fasihi tu.", biblicalCorrection: "2 Petro 1:21", dangerLevel: 'CRITICAL', quiz: [{question: "Biblia ilitungwa na nani?", options: ["Mungu kupitia watu", "Wasomi", "Wafalme"], correct: 0}] },
  { id: 'd-14', title: "Ushindi wa Ukweli", deceptionSummary: "Hitimisho: Ukweli utasimama.", logicalAnalysis: "Wale walioshika amri za Mungu na imani ya Yesu.", biblicalCorrection: "Ufunuo 14:12", dangerLevel: 'CRITICAL', quiz: [{question: "Wateule ni nani?", options: ["Walio na bidii", "Walioshika amri/imani ya Yesu", "Wasomi"], correct: 1}] }
];

export const StageFourDeception: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showExam, setShowExam] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<number | null>(null);

  const lesson = DISCERNMENT_LESSONS.find(l => l.id === activeId);

  const handleSubmit = () => {
    if (!lesson) return;
    let score = 0;
    lesson.quiz.forEach((q, i) => { if (answers[i] === q.correct) score++; });
    const final = Math.round((score / lesson.quiz.length) * 100);
    setResult(final);
    if (final >= 70 && !completed.includes(lesson.id)) setCompleted([...completed, lesson.id]);
    if (completed.length + 1 >= 14 && final >= 70) onComplete();
  };

  if (!lesson) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DISCERNMENT_LESSONS.map((l, idx) => (
          <button key={l.id} onClick={() => setActiveId(l.id)} className="group bg-slate-900 border border-white/5 p-8 rounded-none text-left transition-all hover:border-red-500/50">
            <div className="flex justify-between mb-6"><span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Analysis {idx+1}</span>{completed.includes(l.id) && <CheckCircle2 size={16} className="text-green-500" />}</div>
            <h3 className="text-xl font-bold text-white uppercase mb-2 group-hover:text-red-500">{l.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 italic mb-6">"{l.deceptionSummary}"</p>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-white/5 pt-4">Ingia Analysis Room <ChevronRight size={10} className="inline ml-1" /></div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col animate-fade-in overflow-hidden">
      <header className="h-16 md:h-20 border-b border-white/10 bg-black/60 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-between">
        <button onClick={() => {setActiveId(null); setShowExam(false);}} className="flex items-center gap-2 text-slate-400 hover:text-white"><ArrowLeft size={20} /><span className="text-[10px] font-black uppercase">Back</span></button>
        <span className="text-[10px] md:text-[11px] font-black text-red-500 uppercase tracking-widest truncate">{lesson.title}</span>
        <div className="hidden lg:block text-[10px] font-bold text-slate-600 uppercase">Analysis ID: {lesson.id}</div>
      </header>
      <main className="flex-1 overflow-y-auto scrollbar-hide bg-[#020617]">
        {!showExam ? (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-16 pb-40">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-[9px] font-black uppercase tracking-widest"><ShieldAlert size={12} /> Counter-Deception Thesis</div>
              <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{lesson.title}</h1>
              <div className="h-1 w-24 bg-red-500"></div>
            </div>
            <section className="space-y-4"><h4 className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase tracking-widest"><X size={18} className="text-red-500" /> False Paradigm</h4><p className="text-xl md:text-3xl text-slate-300 italic border-l-2 border-red-500/20 pl-8 py-2">{lesson.deceptionSummary}</p></section>
            <section className="space-y-6"><h4 className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase tracking-widest"><Zap size={18} className="text-orange-500" /> Logical Breakdown</h4><p className="text-base md:text-xl text-slate-400 leading-relaxed font-light">{lesson.logicalAnalysis}</p></section>
            <div className="grid md:grid-cols-2 gap-8"><div className="p-8 bg-green-500/5 border border-green-500/10 rounded-2xl space-y-4"><h5 className="text-[10px] font-black text-green-500 uppercase tracking-widest">Scriptural Antidote</h5><p className="text-lg font-bold text-white italic leading-relaxed">{lesson.biblicalCorrection}</p></div><div className="p-8 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4"><h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Threat Assessment</h5><p className="text-xl font-black text-white uppercase">{lesson.dangerLevel} RISK</p></div></div>
            <div className="text-center pt-10"><button onClick={() => setShowExam(true)} className="px-16 py-6 bg-red-700 text-white font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black shadow-2xl">START DISCERNMENT EXAM</button></div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-12 px-6 animate-fade-in">
            {result !== null ? (
              <div className="bg-white/5 rounded-3xl p-10 text-center border border-white/10 space-y-8">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20"><Trophy size={40} className="text-red-500"/></div>
                <h3 className="text-6xl font-black text-white">{result}%</h3>
                <button onClick={result >= 70 ? () => {setActiveId(null); setShowExam(false);} : () => {setResult(null); setAnswers({}); setShowExam(false);}} className="px-10 py-4 bg-red-700 text-white font-black text-[10px] uppercase tracking-widest">{result >= 70 ? 'Complete Analysis' : 'Retake Test'}</button>
              </div>
            ) : (
              <div className="space-y-8">
                <h2 className="text-2xl font-black text-white uppercase text-center mb-10">Discernment Check</h2>
                {lesson.quiz.map((q, i) => (
                  <div key={i} className="p-6 bg-white/5 rounded-2xl space-y-4">
                    <p className="text-lg font-bold text-slate-200">{q.question}</p>
                    <div className="grid gap-2">{q.options.map((o, oi) => <button key={oi} onClick={() => setAnswers({...answers, [i]: oi})} className={`p-4 text-left rounded-xl text-xs font-bold border transition-all ${answers[i] === oi ? 'bg-red-600 text-white' : 'bg-black/40 text-slate-500 border-white/5'}`}>{o}</button>)}</div>
                  </div>
                ))}
                <button onClick={handleSubmit} className="w-full py-5 bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.4em]" disabled={Object.keys(answers).length < lesson.quiz.length}>SUBMIT ANALYSIS</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
