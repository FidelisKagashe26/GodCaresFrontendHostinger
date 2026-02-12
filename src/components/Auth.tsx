
import React, { useEffect, useState } from 'react';
import { Mail, Lock, User, ArrowRight, X, Zap, Chrome, ShieldCheck } from 'lucide-react';
import { forgotPassword, getCurrentUser, loginUser, registerUser, resetPassword } from '../services/authService';

const LOGO_SRC = `${import.meta.env.BASE_URL}Logo.png`;

interface AuthProps {
  onLogin: (userData: { name: string; email: string }) => void;
  onClose: () => void;
  resetParams?: { uid: string; token: string } | null;
  onResetComplete?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onClose, resetParams, onResetComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    if (resetParams) {
      setIsResetMode(true);
      setIsLogin(true);
    }
  }, [resetParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      if (isResetMode) {
        if (!resetParams) {
          throw new Error('Link ya kubadili nenosiri haipo.');
        }
        if (password.length < 8) {
          throw new Error('Nenosiri liwe na angalau herufi 8.');
        }
        if (password !== confirmPassword) {
          throw new Error('Nenosiri hazilingani.');
        }
        await resetPassword({
          uid: resetParams.uid,
          token: resetParams.token,
          password,
        });
        setInfoMessage('Nenosiri limebadilishwa. Sasa ingia.');
        setIsResetMode(false);
        setPassword('');
        setConfirmPassword('');
        onResetComplete?.();
        return;
      }

      if (isLogin) {
        await loginUser({ email, password });
        const user = await getCurrentUser();
        onLogin(user);
      } else {
        await registerUser({ name, email, password });
        setInfoMessage('Tumetuma link ya uthibitisho kwenye email yako. Tafadhali thibitisha akaunti kabla ya kuingia.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Imeshindikana kuingia.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setInfoMessage('');
    setErrorMessage('Google login bado haijaunganishwa. Tumia email na nenosiri.');
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      if (!email) {
        throw new Error('Weka barua pepe kwanza.');
      }
      await forgotPassword(email);
      setInfoMessage('Tumepeleka link kwenye email yako.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Imeshindikana kutuma link.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[95vh] flex flex-col bg-white dark:bg-[#0f172a] rounded-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 animate-scale-up">
        
        {/* Decorative Top Pattern - Fixed */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-gold-500 to-gold-600 opacity-10 dark:opacity-20 pointer-events-none"></div>
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8 pt-8 relative overflow-y-auto">
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-4">
              <img src={LOGO_SRC} alt="God Cares 365" className="h-20 w-auto" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {isResetMode ? 'Badili Nenosiri' : (isLogin ? 'Karibu Tena' : 'Jiunge Nasi')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest px-4">
              {isResetMode
                ? 'Weka nenosiri jipya ili kuendelea'
                : (isLogin ? 'Ingia ili uendelee na uchambuzi' : 'Tengeneza akaunti kuanza safari')}
            </p>
          </div>

          <div className="space-y-3">
            {!isResetMode && (
              <>
                {/* Google Login Button */}
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Chrome size={18} className="text-blue-500" />
                  <span>Endelea na Google</span>
                </button>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AU EMAIL</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                  {errorMessage}
                </div>
              )}
              {infoMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                  {infoMessage}
                </div>
              )}
              {!isLogin && !isResetMode && (
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                  <input 
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Jina Lako" 
                    className="w-full pl-14 pr-6 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-gold-500 transition-all text-sm text-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              {!isResetMode && (
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                  <input 
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Barua Pepe" 
                    className="w-full pl-14 pr-6 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-gold-500 transition-all text-sm text-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={isResetMode ? "Nenosiri Jipya" : "Nenosiri"}
                  className="w-full pl-14 pr-6 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-gold-500 transition-all text-sm text-slate-900 dark:text-white font-medium"
                />
              </div>

              {isResetMode && (
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={16} />
                  <input 
                    type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Thibitisha Nenosiri"
                    className="w-full pl-14 pr-6 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-gold-500 transition-all text-sm text-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              {isLogin && !isResetMode && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-gold-600 dark:text-gold-400 uppercase tracking-widest hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                  >
                    Kusahau Nenosiri?
                  </button>
                </div>
              )}

              <button 
                type="submit" disabled={loading}
                className="w-full bg-primary-950 dark:bg-gold-500 text-white dark:text-primary-950 py-4 rounded-lg font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Inachakata...' : (isResetMode ? 'BADILISHA NENOSIRI' : (isLogin ? 'INGIA' : 'JISAJILI'))} 
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>

          <div className="mt-5 text-center space-y-3">
            {!isResetMode && (
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-gold-600 transition-colors"
              >
                {isLogin ? 'Hujawahi kujiunga? Jisajili' : 'Tayari unayo akaunti? Ingia'}
              </button>
            )}
            
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck size={12} className="text-green-500" />
              <span className="text-[8px] font-bold uppercase tracking-widest">GC-Shield Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
