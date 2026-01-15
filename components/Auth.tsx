
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, X, Zap, Chrome, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (userData: { name: string; email: string }) => void;
  onClose: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: name || 'Mtafuta Ukweli', email });
      setLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: 'Mtumiaji wa Google', email: 'google.user@gmail.com' });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#0f172a] rounded-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 animate-scale-up">
        
        {/* Decorative Top Pattern - Fixed */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-gold-500 to-gold-600 opacity-10 dark:opacity-20 pointer-events-none"></div>
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10 pt-12 relative overflow-y-auto">
          <div className="text-center space-y-3 mb-10">
            <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center text-primary-950 shadow-xl shadow-gold-500/20 mx-auto mb-6">
              <Zap size={32} fill="currentColor" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {isLogin ? 'Karibu Tena' : 'Jiunge Nasi'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest px-4">
              {isLogin ? 'Ingia ili uendelee na uchambuzi wa ujasusi' : 'Tengeneza akaunti kuanza safari ya ukweli'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm active:scale-[0.98]"
            >
              <Chrome size={20} className="text-blue-500" />
              <span>Endelea na Google</span>
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AU TUMIA EMAIL</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={18} />
                  <input 
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Jina Lako" 
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-gold-500 transition-all text-sm text-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={18} />
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Barua Pepe" 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-gold-500 transition-all text-sm text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={18} />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Nenosiri" 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:border-gold-500 transition-all text-sm text-slate-900 dark:text-white font-medium"
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-primary-950 dark:bg-gold-500 text-white dark:text-primary-950 py-5 rounded-xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Inachakata...' : (isLogin ? 'INGIA SASA' : 'TENGENEZA AKAUNTI')} 
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-gold-600 transition-colors"
            >
              {isLogin ? 'Hujawahi kujiunga? Jisajili' : 'Tayari unayo akaunti? Ingia'}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Ulinzi wa GC-Shield Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
