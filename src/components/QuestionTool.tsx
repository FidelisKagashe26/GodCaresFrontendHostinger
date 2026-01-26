
import React, { useState } from 'react';
import { Send, HelpCircle, X, MessageSquare, CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface Props {
  onGoToVault?: () => void;
}

export const QuestionTool: React.FC<Props> = ({ onGoToVault }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [view, setView] = useState<'ASK' | 'SENDING' | 'SENT'>('ASK');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setView('SENDING');
    // Simulate Secure Transmission to Backend Team
    setTimeout(() => { setView('SENT'); }, 2000);
  };

  const reset = () => {
    setIsOpen(false);
    setTimeout(() => {
        setView('ASK');
        setQuestion('');
        setEmail('');
    }, 300);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 rounded-2xl bg-blue-600/90 backdrop-blur-md border border-white/10 text-white hover:bg-blue-500 hover:scale-105 transition-all flex items-center justify-center shadow-lg shadow-blue-900/40 group relative z-50"
        title="Uliza Swali"
      >
        <HelpCircle size={22} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-md animate-fade-in font-sans">
            <div className="relative bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl border border-blue-500/20 overflow-hidden flex flex-col animate-scale-up">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-blue-500/10 bg-slate-900/50 relative z-10">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                         <Mail size={18} />
                      </div>
                      <div className="flex flex-col">
                         <h2 className="text-xs font-black text-white uppercase tracking-widest">
                             Kituo cha Maswali
                         </h2>
                         <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Mawasiliano na Timu ya Theolojia</p>
                      </div>
                   </div>
                   <button onClick={reset} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <X size={16} />
                   </button>
                </div>

                <div className="p-8 min-h-[350px] flex flex-col justify-center relative z-10 bg-[#0f172a]">
                  {view === 'ASK' && (
                    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Swali Lako</label>
                          <textarea 
                             required
                             value={question}
                             onChange={(e) => setQuestion(e.target.value)}
                             placeholder="Andika swali lako la Biblia hapa..."
                             className="w-full h-32 p-4 bg-slate-950 border border-white/10 rounded-xl outline-none text-slate-300 text-xs resize-none transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/40"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Kwa Majibu)</label>
                          <input 
                             type="email"
                             required
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             placeholder="jina@mfano.com"
                             className="w-full p-4 bg-slate-950 border border-white/10 rounded-xl outline-none text-slate-300 text-xs transition-all placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/40"
                          />
                       </div>
                       
                       <div className="flex gap-3 pt-2">
                          <button 
                            type="submit"
                            className="flex-1 py-3.5 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                          >
                            <Send size={12} /> Tuma Swali
                          </button>
                          
                          {onGoToVault && (
                            <button 
                              type="button"
                              onClick={() => { reset(); onGoToVault(); }}
                              className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all border border-white/5"
                              title="Tazama Majibu Yaliyopita"
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}
                       </div>

                       <div className="flex items-center justify-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-wide opacity-60">
                          <ShieldCheck size={10} className="text-green-500" />
                          Majibu yatahakikiwa na wataalamu
                       </div>
                    </form>
                  )}

                  {view === 'SENDING' && (
                     <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in py-8">
                        <div className="relative">
                           <div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center space-y-1">
                           <p className="text-white text-xs font-black uppercase tracking-widest">Inatuma...</p>
                           <p className="text-slate-500 text-[10px]">Mawasiliano salama yanaendelea</p>
                        </div>
                     </div>
                  )}

                  {view === 'SENT' && (
                     <div className="flex flex-col items-center justify-center space-y-6 animate-scale-up py-4 text-center">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20">
                           <CheckCircle2 size={28} />
                        </div>
                        <div className="space-y-2 px-6">
                           <h4 className="text-xl font-black text-white uppercase tracking-tight">Imepokelewa</h4>
                           <p className="text-slate-400 text-xs leading-relaxed">
                              Swali lako limefika salama. Timu yetu itakupatia majibu ya kina kupitia email yako hivi punde.
                           </p>
                        </div>
                        <button 
                           onClick={() => { setView('ASK'); setQuestion(''); setEmail(''); }} 
                           className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2"
                        >
                           <ArrowRight size={12} /> Tuma Lingine
                        </button>
                     </div>
                  )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};
