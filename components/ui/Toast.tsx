import React, { useEffect } from 'react';
import { X, CheckCircle, Trophy, Info } from 'lucide-react';
import { ToastNotification } from '../../types';

interface Props {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id} 
          className={`pointer-events-auto min-w-[300px] max-w-sm rounded-xl shadow-2xl p-4 flex items-start gap-3 transform transition-all animate-slide-in ${
            n.type === 'award' ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-white' :
            n.type === 'success' ? 'bg-green-600 text-white' :
            'bg-white border border-slate-200 text-slate-800'
          }`}
        >
          <div className="mt-1">
            {n.type === 'award' && <Trophy size={20} />}
            {n.type === 'success' && <CheckCircle size={20} />}
            {n.type === 'info' && <Info size={20} className="text-primary-600" />}
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-sm ${n.type === 'info' ? 'text-slate-900' : 'text-white'}`}>{n.title}</h4>
            <p className={`text-xs mt-1 ${n.type === 'info' ? 'text-slate-600' : 'text-white/90'}`}>{n.message}</p>
          </div>
          <button onClick={() => onDismiss(n.id)} className="opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};