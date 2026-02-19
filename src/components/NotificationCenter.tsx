import React from 'react';
import { X, Check, Trash2, Bell, Info, CheckCircle, Trophy, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { ToastNotification } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: ToastNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onDismiss: (id: string) => void;
  onNavigateToEvent?: () => void;
}

export const NotificationCenter: React.FC<Props> = ({ 
  isOpen, onClose, notifications, onMarkAllRead, onClearAll, onDismiss, onNavigateToEvent
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'error': return <AlertTriangle size={16} className="text-red-400" />;
      case 'award': return <Trophy size={16} className="text-gold-400" />;
      case 'event': return <Calendar size={16} className="text-purple-400" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80]" onClick={onClose}></div>
      <div className="fixed top-[8.7rem] left-2 right-2 md:left-auto md:right-8 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[90] overflow-hidden flex flex-col animate-scale-in origin-top-right max-h-[calc(100vh-10.5rem)]">
         {/* Header */}
         <div className="p-3 md:p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
           <div className="flex items-center gap-2">
             <Bell size={16} className="text-gold-400" />
             <h3 className="font-bold text-white text-xs md:text-sm uppercase tracking-wider">Kituo Cha Taarifa</h3>
             <span className="bg-white/10 text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono">{notifications.filter(n => !n.read).length}</span>
           </div>
           <div className="flex gap-1">
              {notifications.length > 0 && (
                <>
                  <button onClick={onMarkAllRead} title="Weka zote zimesomwa" className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-green-400 transition-colors"><Check size={14}/></button>
                  <button onClick={onClearAll} title="Futa zote" className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                </>
              )}
              <div className="w-[1px] h-4 bg-white/10 mx-1 self-center"></div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><X size={14}/></button>
           </div>
         </div>
  
         {/* List */}
         <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
           {notifications.length === 0 ? (
             <div className="p-12 text-center text-slate-500 flex flex-col items-center">
               <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                 <Bell size={20} className="opacity-50" />
               </div>
               <p className="text-xs font-medium uppercase tracking-widest">Hakuna taarifa mpya</p>
             </div>
           ) : (
             <div className="divide-y divide-white/5">
               {notifications.map(n => (
                 <div 
                   key={n.id} 
                   onClick={() => n.type === 'event' && onNavigateToEvent?.()}
                   className={`p-3 md:p-4 hover:bg-white/5 transition-colors relative group cursor-pointer ${n.read ? 'opacity-60' : 'bg-blue-500/5'}`}
                 >
                    <div className="flex gap-3">
                       <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                       <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                             <h4 className={`text-sm ${n.read ? 'font-medium text-slate-300' : 'font-bold text-white'}`}>{n.title}</h4>
                             <button onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }} className="text-slate-500 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                          {n.timestamp && (
                            <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-2">
                              <Clock size={10} /> {n.timestamp}
                            </p>
                          )}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
         </div>
         
         <div className="p-3 bg-black/40 border-t border-white/10 text-center">
            <button className="text-[10px] font-bold text-gold-500 uppercase tracking-widest hover:text-white transition-colors">
               Kumbukumbu Za Mawasiliano
            </button>
         </div>
      </div>
    </>
  )
}
