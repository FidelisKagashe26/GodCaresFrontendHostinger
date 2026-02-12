import React, { useEffect, useState } from 'react';
import { StageFoundations } from './Stage_Foundations';
import { StageThreeProphecy } from './Stage3_Prophecy';
import { StageFourDeception } from './Stage4_Deception';
import {
  BookOpen,
  Shield,
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle2,
  GraduationCap,
  Trophy,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { JourneyLesson, getJourneyModules } from '../services/journeyService';

type ComponentKey = 'foundations' | 'prophecy' | 'deception' | 'custom';

interface ModuleConfig {
  id: string;
  title: string;
  swahili: string;
  componentKey: ComponentKey;
  lessons: number;
  KP: number;
  description: string;
  remoteLessons: JourneyLesson[];
}

const DEFAULT_MODULES: ModuleConfig[] = [
  {
    id: 'foundations',
    title: 'Misingi ya Imani',
    swahili: 'Academic Level I: Foundations',
    componentKey: 'foundations',
    lessons: 14,
    KP: 500,
    description: 'Masomo ya msingi ya imani ya Biblia.',
    remoteLessons: [],
  },
  {
    id: 'prophecy',
    title: 'Neno la Unabii',
    swahili: 'Academic Level II: Prophecy',
    componentKey: 'prophecy',
    lessons: 14,
    KP: 1200,
    description: 'Mafunzo ya unabii wa Danieli na Ufunuo.',
    remoteLessons: [],
  },
  {
    id: 'deception',
    title: 'Kuepuka Udanganyifu',
    swahili: 'Academic Level III: Discernment',
    componentKey: 'deception',
    lessons: 14,
    KP: 2500,
    description: 'Kupambanua ukweli dhidi ya uongo.',
    remoteLessons: [],
  },
];

const getModuleIcon = (componentKey: ComponentKey) => {
  if (componentKey === 'foundations') return <BookOpen size={18} />;
  if (componentKey === 'prophecy') return <Sparkles size={18} />;
  if (componentKey === 'deception') return <Shield size={18} />;
  return <BookOpen size={18} />;
};

const CustomModuleContent: React.FC<{ module: ModuleConfig; isCompleted: boolean; onComplete: () => void }> = ({
  module,
  isCompleted,
  onComplete,
}) => {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{module.title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{module.description || module.swahili || 'Moduli hii bado inatengenezwa.'}</p>
      </div>

      <div className="grid gap-3">
        {module.remoteLessons.length > 0 ? (
          module.remoteLessons.map((lesson) => (
            <article key={lesson.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">{lesson.title}</h3>
              {lesson.focus && <p className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-wider mt-1">{lesson.focus}</p>}
              {lesson.summary && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{lesson.summary}</p>}
            </article>
          ))
        ) : (
          <article className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-400">
            Hakuna masomo yaliyowekwa kwenye moduli hii bado.
          </article>
        )}
      </div>

      <button
        onClick={onComplete}
        disabled={isCompleted}
        className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-[0.25em] transition-all ${
          isCompleted
            ? 'bg-green-500/20 text-green-600 dark:text-green-400 cursor-default'
            : 'bg-gold-500 text-slate-950 hover:opacity-90'
        }`}
      >
        {isCompleted ? 'Imekamilika' : 'Kamilisha Moduli'}
      </button>
    </div>
  );
};

export const BibleStudyJourney: React.FC = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    const saved = localStorage.getItem('gc365_completed_modules');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [modules, setModules] = useState<ModuleConfig[]>(DEFAULT_MODULES);

  useEffect(() => {
    const savedUser = localStorage.getItem('gc365_user');
    if (savedUser) setUserProfile(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadModules = async () => {
      try {
        const payload = await getJourneyModules();
        if (!isMounted || payload.length === 0) return;

        const mapped: ModuleConfig[] = payload.map((module) => ({
          id: module.code || `module-${module.id}`,
          title: module.title,
          swahili: module.swahili_title || module.description || 'Academic Module',
          componentKey: module.component_key || 'custom',
          lessons: module.lessons_count || module.lessons.length || 0,
          KP: module.kp_points || 0,
          description: module.description || '',
          remoteLessons: Array.isArray(module.lessons) ? module.lessons : [],
        }));

        if (mapped.length > 0) {
          setModules(mapped);
        }
      } catch {
        // Keep local fallback modules when API is unavailable.
      }
    };

    loadModules();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setCompletedModules((prev) => {
      const filtered = prev.filter((idx) => idx >= 0 && idx < modules.length);
      if (filtered.length !== prev.length) {
        localStorage.setItem('gc365_completed_modules', JSON.stringify(filtered));
      }
      return filtered;
    });
    setCurrentModule((prev) => (prev >= modules.length ? 0 : prev));
  }, [modules.length]);

  const handleModuleComplete = (idx: number) => {
    if (!completedModules.includes(idx)) {
      const newCompleted = [...completedModules, idx].sort((a, b) => a - b);
      setCompletedModules(newCompleted);
      localStorage.setItem('gc365_completed_modules', JSON.stringify(newCompleted));
    }
    if (idx < modules.length - 1) {
      setCurrentModule(idx + 1);
    }
  };

  const totalKP = completedModules.reduce((acc, idx) => acc + (modules[idx]?.KP || 0), 0);
  const nextRankThreshold = Math.max((completedModules.length + 1) * 2000, 1);
  const progressToNextRank = Math.min(100, (totalKP / nextRankThreshold) * 100);

  const getRankName = () => {
    if (completedModules.length === 0) return 'Novice Seeker';
    if (completedModules.length === 1) return 'Faith Scholar';
    if (completedModules.length === 2) return 'Prophecy Analyst';
    return 'Truth Guardian';
  };

  const renderCurrentModule = () => {
    const module = modules[currentModule];
    if (!module) {
      return <div className="p-8 text-sm text-slate-500">Hakuna moduli zilizopatikana.</div>;
    }

    if (module.remoteLessons.length > 0) {
      return (
        <CustomModuleContent
          module={module}
          isCompleted={completedModules.includes(currentModule)}
          onComplete={() => handleModuleComplete(currentModule)}
        />
      );
    }

    if (module.componentKey === 'foundations') {
      return <StageFoundations onComplete={() => handleModuleComplete(currentModule)} />;
    }
    if (module.componentKey === 'prophecy') {
      return <StageThreeProphecy onComplete={() => handleModuleComplete(currentModule)} />;
    }
    if (module.componentKey === 'deception') {
      return <StageFourDeception onComplete={() => handleModuleComplete(currentModule)} />;
    }

    return <CustomModuleContent module={module} isCompleted={completedModules.includes(currentModule)} onComplete={() => handleModuleComplete(currentModule)} />;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5">
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

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
        <div>
          <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 pl-2">Curriculum</h3>
          <div className="space-y-2">
            {modules.map((module, i) => {
              const isLocked = i > 0 && !completedModules.includes(i - 1);
              const isActive = currentModule === i;
              const isDone = completedModules.includes(i);
              return (
                <button
                  key={module.id}
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
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-gold-500 text-slate-950 shadow-lg'
                        : isDone
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-500'
                    }`}
                  >
                    {isLocked ? <Lock size={16} /> : isDone ? <CheckCircle2 size={16} /> : getModuleIcon(module.componentKey)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold truncate ${isActive ? 'text-gold-600 dark:text-gold-400' : 'text-slate-800 dark:text-slate-300'}`}>
                      {module.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">{module.lessons} Lessons</span>
                      <span className="text-[8px] text-slate-600 font-medium">•</span>
                      <span className="text-[8px] text-gold-600 font-bold">{module.KP} KP</span>
                    </div>
                  </div>

                  {isActive && <ChevronRight size={14} className="text-gold-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
        <aside className="hidden lg:flex w-80 bg-white dark:bg-slate-950 flex-col shrink-0 z-20">
          <SidebarContent />
        </aside>

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
          <div className="flex-1 overflow-y-auto scrollbar-hide">{renderCurrentModule()}</div>
        </main>
      </div>
    </div>
  );
};

