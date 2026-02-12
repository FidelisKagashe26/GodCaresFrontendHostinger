
import React from 'react';
import { Moon, Sun, Monitor, Check, X, Palette } from 'lucide-react';
import { ThemePreference } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

export const ThemeCenter: React.FC<Props> = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  if (!isOpen) return null;

  const themes: { id: ThemePreference; name: string; icon: React.ReactNode }[] = [
    { id: 'light', name: 'Mwanga', icon: <Sun size={20} className="text-gold-500" /> },
    { id: 'dark', name: 'Giza', icon: <Moon size={20} className="text-blue-400" /> },
    { id: 'system', name: 'Fuata Mfumo', icon: <Monitor size={20} className="text-slate-400" /> }
  ];

  return (
    <>
      <div className="fixed inset-0 z-[80]" onClick={onClose}></div>
      <div className="fixed top-24 right-28 md:right-36 w-72 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/20 rounded-2xl shadow-2xl z-[90] overflow-hidden flex flex-col animate-scale-in origin-top-right">
         {/* Header */}
         <div className="p-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-black/40">
           <div className="flex items-center gap-2">
             <Palette size={16} className="text-gold-500" />
             <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Muonekano</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={14}/></button>
         </div>
  
         {/* List */}
         <div className="p-2">
             <div className="space-y-1">
               {themes.map(theme => (
                 <button 
                    key={theme.id} 
                    onClick={() => onThemeChange(theme.id)}
                    className={`w-full p-3 rounded-xl transition-all flex items-center justify-between group ${
                        currentTheme === theme.id 
                        ? 'bg-gold-50 dark:bg-white/10 ring-1 ring-gold-500/20' 
                        : 'hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                 >
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${currentTheme === theme.id ? 'bg-white dark:bg-black/20 shadow-sm' : 'bg-slate-100 dark:bg-white/5'}`}>
                          {theme.icon}
                       </div>
                       <span className={`text-sm font-bold ${currentTheme === theme.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                           {theme.name}
                       </span>
                    </div>
                    {currentTheme === theme.id && <Check size={16} className="text-gold-500" />}
                 </button>
               ))}
             </div>
         </div>
         
         <div className="p-3 text-center border-t border-slate-100 dark:border-white/5">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Chagua rangi ya mfumo wako.
            </p>
         </div>
      </div>
    </>
  )
}
