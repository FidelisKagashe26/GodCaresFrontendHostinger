
import React, { useState, useEffect } from 'react';
import { StageFoundations } from './Stage_Foundations';
import { StageThreeProphecy } from './Stage3_Prophecy';
import { StageFourDeception } from './Stage4_Deception';
import { 
  BookOpen, Shield, Sparkles, ChevronRight, Lock, 
  CheckCircle2, GraduationCap, Trophy, ListTodo, Menu, X, Layers,
  Star, Zap, Award
} from 'lucide-react';

export const BibleStudyJourney: React.FC = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    const saved = localStorage.getItem('gc365_completed_modules');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('gc365_user');
    if (savedUser) setUserProfile(JSON.parse(savedUser));
  }, []);

  const handleModuleComplete = (idx: number) => {
    if (!completedModules.includes(idx)) {
      const newCompleted = [...completedModules, idx];
      setCompletedModules(newCompleted);
      localStorage.setItem('gc365_completed_modules', JSON.stringify(newCompleted));
    }
    // Auto-advance to next module if available
    if (idx < 2) {
      setCurrentModule(idx + 1);
    }
  };

  const modules = [
    { 
      id: 'foundations',
      title: "Misingi ya Imani", 
      swahili: "Academic Level I: Foundations", 
      component: <StageFoundations onComplete={() => handleModuleComplete(0)} />, 
      icon: <BookOpen size={18} />,
      lessons: 14,
      KP: 500
    },
    { 
      id: 'prophecy',
      title: "Neno la Unabii", 
      swahili: "Academic Level II: Prophecy", 
      component: <StageThreeProphecy onComplete={() => handleModuleComplete(1)} />, 
      icon: <Sparkles size={18} />,
      lessons: 14,
      KP: 1200
    },
    { 
      id: 'deception',
      title: "Kuepuka Udanganyifu", 
      swahili: "Academic Level III: Discernment", 
      component: <StageFourDeception onComplete={() => handleModuleComplete(2)} />, 
      icon: <Shield size={18} />,
      lessons: 14,
      KP: 2500
    }
  ];

  // Gamification Logic
  const totalKP = completedModules.reduce((acc, idx) => acc + modules[idx].KP, 0);
  const nextRankThreshold = (completedModules.length + 1) * 2000;
  const progressToNextRank = Math.min(100, (totalKP / nextRankThreshold) * 100);
  
  const getRankName = () => {
    if (completedModules.length === 0) return "Novice Seeker";
    if (completedModules.length === 1) return "Faith Scholar";
    if (completedModules.length === 2) return "Prophecy Analyst";
    return "Truth Guardian";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5">
      {/* Student Profile Card */}
      <div className="p-6 bg-gradient-to-br from-white to-slate-100 dark:from-slate-900 dark:to-black border-b border-slate-200 dark:border-white/5">
         <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-gold-600 to-gold-300">
               <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden">
                  <img 
                    src={localStorage.getItem('gc365_profile_pic') || `https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=0f172a&color=eab308`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
               </div>
            </div>
            <div>
               <h3 className="text-slate-900 dark:text-white font-black uppercase text-sm tracking-tight">{userProfile?.name || 'Mwanafunzi'}</h3>
               <p className="text-[9px] text-gold-500 font-bold uppercase tracking-widest">{getRankName()}</p>
            </div>
         </div>
         
         {/* Gamification Stats */}
         <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
               <span className="flex items-center gap-1"><Zap size={10} className="text-gold-500" /> Total KP</span>
               <span className="text-slate-900 dark:text-white">{totalKP.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
               <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                  <span>Next Rank Progress</span>
                  <span>{Math.round(progressToNextRank)}%</span>
               </div>
               <div className="h-1 w-full bg-slate-200 dark:bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-1000" style={{ width: `${progressToNextRank}%` }}></div>
               </div>
            </div>
         </div>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
        <div>
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 pl-2">
            Curriculum
          </h3>
          <div className="space-y-2">
            {modules.map((m, i) => {
              const isLocked = i > 0 && !completedModules.includes(i - 1);
              const isActive = currentModule === i;
              const isDone = completedModules.includes(i);
              return (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => {
                    setCurrentModule(i);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl text-left transition-all relative group flex items-center gap-3 border ${
                    isActive 
                      ? 'bg-gold-500/10 border-gold-500/50' 
                      : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-gold-500 text-slate-950 shadow-lg' : isDone ? 'bg-green-500/20 text-green-500' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-500'
                  }`}>
                    {isLocked ? <Lock size={16} /> : isDone ? <CheckCircle2 size={16} /> : m.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold truncate ${isActive ? 'text-gold-600 dark:text-gold-400' : 'text-slate-800 dark:text-slate-300'}`}>
                      {m.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">{m.lessons} Lessons</span>
                       <span className="text-[8px] text-slate-600 font-medium">•</span>
                       <span className="text-[8px] text-gold-600 font-bold">{m.KP} KP</span>
                    </div>
                  </div>

                  {isActive && <ChevronRight size={14} className="text-gold-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Motivation */}
      <div className="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5">
         <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-500/10">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
               <Trophy size={16} />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-300 tracking-widest">Motivational Tip</p>
               <p className="text-[10px] text-slate-600 dark:text-slate-400 italic leading-tight">"Ukweli huweka huru." Endelea kusoma!</p>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] animate-fade-in flex flex-col h-screen overflow-hidden text-slate-900 dark:text-slate-200">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 px-4 flex items-center justify-between shrink-0 shadow-2xl z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center text-primary-950">
            <GraduationCap size={16} />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">GC365 ACADEMY</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-gold-500">
           <Menu size={20} />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-80 bg-white dark:bg-slate-950 flex-col shrink-0 z-20">
          <SidebarContent />
        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <div className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-950 shadow-2xl animate-slide-in">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-2 -right-12 p-2 text-slate-900 dark:text-white bg-white/80 dark:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </div>
          </div>
        )}

        <main className="flex-1 bg-white dark:bg-[#020617] flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {modules[currentModule].component}
          </div>
        </main>
      </div>
    </div>
  );
};
