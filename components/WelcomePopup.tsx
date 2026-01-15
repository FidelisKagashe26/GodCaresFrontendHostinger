
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Gift, ArrowRight } from 'lucide-react';

export const WelcomePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('gc365_welcome_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 2500); 
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('gc365_welcome_seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" 
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-[#0f172a] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-up border border-white/10">
        {/* Header */}
        <div className="bg-gradient-to-br from-gold-600 to-gold-500 h-40 flex items-center justify-center relative">
          <Gift size={64} className="text-white relative z-10 animate-float drop-shadow-md" />
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-white p-2 rounded-lg transition-colors z-20"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Karibu <span className="text-gold-400">Nyumbani!</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Asante kwa kujiunga na God Cares 365. Tumeandaa <strong>Kitabu cha Mwongozo wa Unabii</strong> bure kwa ajili yako.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-start gap-4 text-left hover:bg-white/10 transition-colors cursor-pointer">
             <div className="bg-gold-500/20 p-3 rounded-lg text-gold-400 shrink-0">
               <Sparkles size={20} />
             </div>
             <div>
               <h4 className="font-bold text-white text-sm">Pakua Mwongozo wa Bure</h4>
               <p className="text-[10px] text-slate-400 mt-1">Siri za Danieli na Ufunuo zilizofunuliwa.</p>
             </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full py-4 bg-gold-500 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-400 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            POKEA ZAWADI YANGU <ArrowRight size={16} />
          </button>
          
          <button 
            onClick={handleClose}
            className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
          >
            Hapana, asante. Nitaangalia baadaye.
          </button>
        </div>
      </div>
    </div>
  );
};
