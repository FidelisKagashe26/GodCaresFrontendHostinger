
import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Shield,
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle2,
  GraduationCap,
  Menu,
  X,
  Zap,
  RefreshCw,
} from 'lucide-react';
import {
  JourneyLesson,
  JourneyModule,
  getJourneyModuleLessons,
  getJourneyModules,
} from '../services/journeyService';

const MODULE_PROGRESS_KEY = 'gc365_completed_module_codes';

const readCompletedModuleCodes = (): string[] => {
  const raw = localStorage.getItem(MODULE_PROGRESS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  } catch {
    return [];
  }
};

const moduleIcon = (componentKey: JourneyModule['component_key']) => {
  if (componentKey === 'prophecy') return <Sparkles size={18} />;
  if (componentKey === 'deception') return <Shield size={18} />;
  return <BookOpen size={18} />;
};

const valueToText = (value: unknown): string => {
  if (value === null || value === undefined) return 'Hakuna taarifa';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const BibleStudyJourney: React.FC = () => {
  const [modules, setModules] = useState<JourneyModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessons, setCurrentLessons] = useState<JourneyLesson[]>([]);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [completedModuleCodes, setCompletedModuleCodes] = useState<string[]>(readCompletedModuleCodes);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [modulesError, setModulesError] = useState('');
  const [lessonsError, setLessonsError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name?: string } | null>(null);

  const currentModule = modules[currentModuleIndex] || null;
  const selectedLesson = currentLessons[selectedLessonIndex] || null;

  useEffect(() => {
    const savedUser = localStorage.getItem('gc365_user');
    if (!savedUser) return;

    try {
      const parsed = JSON.parse(savedUser) as { name?: string };
      setUserProfile(parsed);
    } catch {
      setUserProfile(null);
    }
  }, []);

  const loadModules = async () => {
    setLoadingModules(true);
    setModulesError('');

    try {
      const payload = await getJourneyModules();
      setModules(payload);
      setCurrentModuleIndex(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Imeshindikana kupakua moduli za darasa la Biblia.';
      setModulesError(message);
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  useEffect(() => {
    void loadModules();
  }, []);

  useEffect(() => {
    setCurrentModuleIndex((prev) => {
      if (modules.length === 0) return 0;
      if (prev >= modules.length) return modules.length - 1;
      return prev;
    });

    setCompletedModuleCodes((prev) => {
      const validCodes = new Set(modules.map((module) => module.code));
      const filtered = prev.filter((code) => validCodes.has(code));
      if (filtered.length !== prev.length) {
        localStorage.setItem(MODULE_PROGRESS_KEY, JSON.stringify(filtered));
      }
      return filtered;
    });
  }, [modules]);

  useEffect(() => {
    let isMounted = true;

    const loadLessons = async () => {
      if (!currentModule) {
        setCurrentLessons([]);
        setLessonsError('');
        return;
      }

      setLoadingLessons(true);
      setLessonsError('');
      setSelectedLessonIndex(0);

      try {
        const lessons = await getJourneyModuleLessons(currentModule.code);
        if (!isMounted) return;
        setCurrentLessons(lessons);
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'Imeshindikana kupakua masomo ya moduli.';
        setLessonsError(message);
        setCurrentLessons([]);
      } finally {
        if (isMounted) {
          setLoadingLessons(false);
        }
      }
    };

    void loadLessons();

    return () => {
      isMounted = false;
    };
  }, [currentModule?.code]);

  useEffect(() => {
    setSelectedLessonIndex((prev) => {
      if (currentLessons.length === 0) return 0;
      if (prev >= currentLessons.length) return currentLessons.length - 1;
      return prev;
    });
  }, [currentLessons]);

  const markModuleCompleted = (moduleCode: string) => {
    setCompletedModuleCodes((prev) => {
      if (prev.includes(moduleCode)) return prev;
      const next = [...prev, moduleCode];
      localStorage.setItem(MODULE_PROGRESS_KEY, JSON.stringify(next));
      return next;
    });

    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setIsSidebarOpen(false);
    }
  };

  const totalKP = useMemo(
    () => modules.filter((module) => completedModuleCodes.includes(module.code)).reduce((acc, module) => acc + module.kp_points, 0),
    [completedModuleCodes, modules]
  );

  const completedCount = completedModuleCodes.length;
  const nextRankThreshold = Math.max((completedCount + 1) * 2000, 1);
  const progressToNextRank = Math.min(100, (totalKP / nextRankThreshold) * 100);

  const currentRank = useMemo(() => {
    if (completedCount === 0) return 'Mwanafunzi Mpya';
    if (completedCount === 1) return 'Faith Scholar';
    if (completedCount === 2) return 'Prophecy Analyst';
    return 'Truth Guardian';
  }, [completedCount]);

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
            <p className="text-[9px] text-gold-500 font-bold uppercase tracking-widest">{currentRank}</p>
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
              <div className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-1000" style={{ width: `${progressToNextRank}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 pl-2">Curriculum</h3>
        <div className="space-y-2">
          {modules.map((module, index) => {
            const previousCode = modules[index - 1]?.code;
            const isLocked = index > 0 && previousCode ? !completedModuleCodes.includes(previousCode) : false;
            const isActive = currentModuleIndex === index;
            const isDone = completedModuleCodes.includes(module.code);

            return (
              <button
                key={module.code}
                disabled={isLocked}
                onClick={() => {
                  setCurrentModuleIndex(index);
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
                  {isLocked ? <Lock size={16} /> : isDone ? <CheckCircle2 size={16} /> : moduleIcon(module.component_key)}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold truncate ${isActive ? 'text-gold-600 dark:text-gold-400' : 'text-slate-800 dark:text-slate-300'}`}>
                    {module.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">{module.lessons_count} Lessons</span>
                    <span className="text-[8px] text-slate-600 font-medium">•</span>
                    <span className="text-[8px] text-gold-600 font-bold">{module.kp_points} KP</span>
                  </div>
                </div>

                {isActive && <ChevronRight size={14} className="text-gold-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5">
        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Darasa hili linaendeshwa na data kutoka backend. Hakikisha moduli na masomo vimejazwa kwenye admin panel.
        </p>
      </div>
    </div>
  );

  if (loadingModules) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] animate-fade-in flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Inapakua darasa la Biblia kutoka backend...</p>
        </div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] animate-fade-in flex items-center justify-center px-4">
        <div className="max-w-xl w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-6 text-center space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Hakuna Moduli Zilizopatikana</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {modulesError || 'Tafadhali ongeza moduli za Darasa la Biblia kwenye admin panel, kisha jaribu tena.'}
          </p>
          <button
            onClick={() => {
              void loadModules();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-950 dark:bg-gold-500 text-white dark:text-primary-950 text-xs font-black uppercase tracking-[0.2em]"
          >
            <RefreshCw size={14} />
            Jaribu Tena
          </button>
        </div>
      </div>
    );
  }

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
            <div className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
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
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-10 space-y-6">
            {currentModule && (
              <>
                <section className="space-y-3">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{currentModule.title}</h1>
                  {(currentModule.swahili_title || currentModule.description) && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
                      {currentModule.swahili_title || currentModule.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap text-[10px] font-black uppercase tracking-wider">
                    <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300">{currentModule.lessons_count} Lessons</span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300">{currentModule.kp_points} KP</span>
                    <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300">{currentModule.code}</span>
                  </div>
                </section>

                {lessonsError && (
                  <section className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                    {lessonsError}
                  </section>
                )}

                <section className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5">
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Masomo</h3>

                    {loadingLessons ? (
                      <div className="text-xs text-slate-500 dark:text-slate-400">Inapakua masomo...</div>
                    ) : currentLessons.length === 0 ? (
                      <div className="text-xs text-slate-500 dark:text-slate-400">Hakuna somo kwenye moduli hii kwa sasa.</div>
                    ) : (
                      <div className="space-y-2">
                        {currentLessons.map((lesson, index) => (
                          <button
                            key={`${lesson.id}-${lesson.code}`}
                            onClick={() => setSelectedLessonIndex(index)}
                            className={`w-full text-left rounded-lg border p-3 transition-all ${
                              index === selectedLessonIndex
                                ? 'border-gold-500 bg-gold-500/10'
                                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 hover:border-gold-500/40'
                            }`}
                          >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Somo {index + 1}</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{lesson.title}</p>
                            {lesson.focus && <p className="text-[11px] text-gold-700 dark:text-gold-300 mt-1">{lesson.focus}</p>}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => markModuleCompleted(currentModule.code)}
                      disabled={completedModuleCodes.includes(currentModule.code)}
                      className={`w-full px-4 py-3 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all ${
                        completedModuleCodes.includes(currentModule.code)
                          ? 'bg-green-500/20 text-green-700 dark:text-green-300 cursor-default'
                          : 'bg-primary-950 dark:bg-gold-500 text-white dark:text-primary-950 hover:opacity-90'
                      }`}
                    >
                      {completedModuleCodes.includes(currentModule.code) ? 'Moduli Imekamilika' : 'Kamilisha Moduli'}
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 p-5 md:p-6 space-y-4">
                    {loadingLessons ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400">Inapakua maelezo ya somo...</div>
                    ) : !selectedLesson ? (
                      <div className="text-sm text-slate-500 dark:text-slate-400">Chagua somo upande wa kushoto ili kuona maelezo yake.</div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedLesson.title}</h2>
                          {selectedLesson.swahili_title && <p className="text-sm text-slate-600 dark:text-slate-400">{selectedLesson.swahili_title}</p>}
                          {selectedLesson.scripture && <p className="text-xs font-bold uppercase tracking-widest text-gold-700 dark:text-gold-300">{selectedLesson.scripture}</p>}
                        </div>

                        {selectedLesson.hero_image && (
                          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                            <img src={selectedLesson.hero_image} alt={selectedLesson.title} className="w-full h-56 object-cover" />
                          </div>
                        )}

                        {selectedLesson.focus && (
                          <div className="rounded-lg border border-gold-400/30 bg-gold-500/10 p-3 text-sm text-gold-800 dark:text-gold-200">
                            <strong>Focus:</strong> {selectedLesson.focus}
                          </div>
                        )}

                        {selectedLesson.summary && (
                          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{selectedLesson.summary}</p>
                        )}

                        {selectedLesson.content && (
                          <article className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-line">
                            {selectedLesson.content}
                          </article>
                        )}

                        {selectedLesson.payload && Object.keys(selectedLesson.payload).length > 0 && (
                          <section className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Maelezo Zaidi</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(selectedLesson.payload).map(([key, value]) => (
                                <div key={key} className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{key}</p>
                                  <pre className="mt-2 text-xs whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300 font-sans">
                                    {valueToText(value)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
