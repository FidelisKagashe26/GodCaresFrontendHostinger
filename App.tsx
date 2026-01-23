
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, ProfileModal } from './components/Sidebar';
import { Home } from './components/Home';
import { Auth } from './components/Auth';
import { BibleStudyJourney } from './components/BibleStudyJourney';
import { Shop } from './components/Shop';
import { Library } from './components/Library';
import { Events } from './components/Events';
import { News } from './components/News';
import { Prayers } from './components/Prayers';
import { Donations } from './components/Donations';
import { AboutUs } from './components/AboutUs';
import { MediaProjects } from './components/MediaProjects';
import { Testimonies } from './components/Testimonies';
import { EvidenceVault } from './components/EvidenceVault';
import { DeceptionVault } from './components/DeceptionVault';
import { QuestionVault } from './components/QuestionVault';
import { PropheticTimeline } from './components/PropheticTimeline';
import { Blog } from './components/Blog';
import { FaithBuilder } from './components/FaithBuilder';
import { Footer } from './components/Footer';
import { HistoryTool } from './components/HistoryTool';
import { QuestionTool } from './components/QuestionTool';
import { DeceptionTool } from './components/DeceptionTool';
import { EvidenceTool } from './components/EvidenceTool';
import { StageConfig, StageId, ToastNotification, LanguageCode, ThemePreference } from './types';
import { ToastContainer } from './components/ui/Toast';
import { NotificationCenter } from './components/NotificationCenter';
import { LanguageCenter } from './components/LanguageCenter';
import { ThemeCenter } from './components/ThemeCenter';
import { LogOut, Sun, Moon, Languages, Menu, Bell, User, Monitor, Cross, BookOpen } from 'lucide-react';
import { clearTokens, getCurrentUser } from './services/authService';
import { getSystemMessages } from './services/systemMessageService';

const stages: StageConfig[] = [
  { id: StageId.HOME, title: 'Nyumbani', description: 'Karibu katika mafundisho.', icon: 'home' },
  { id: StageId.BLOG, title: 'Blog', description: 'Makala na Maarifa', icon: 'book-open' },
  { id: StageId.FAITH_BUILDER, title: 'Kuza Imani Yako', description: 'Hadithi za Mashujaa', icon: 'book-open' },
  { id: StageId.BIBLE_STUDY, title: 'Darasa la Biblia', description: 'Misingi, Unabii na Pambano Kuu.', icon: 'book-check' },
  { id: StageId.TIMELINE, title: 'Ramani ya Unabii', description: 'Historia ya Kale na Ijayo.', icon: 'clock' },
  { id: StageId.EVIDENCE, title: 'Hifadhi ya Ushahidi', description: 'Sayansi na Historia', icon: 'microscope' },
  { id: StageId.DECEPTION_VAULT, title: 'Ukweli vs Uongo', description: 'Fichua Udanganyifu', icon: 'shield-alert' },
  { id: StageId.QUESTION_VAULT, title: 'Maswali & Majibu', description: 'Majibu ya Biblia', icon: 'message-square' },
  { id: StageId.MEDIA, title: 'Media Hub', description: 'Video na Mafundisho', icon: 'play-circle' },
  { id: StageId.TESTIMONIES, title: 'Shuhuda', description: 'Matendo ya Mungu', icon: 'message-square-quote' },
  { id: StageId.SHOP, title: 'Duka', description: 'Vitabu na Vifaa', icon: 'shopping-bag' },
  { id: StageId.LIBRARY, title: 'Maktaba', description: 'Nyaraka za Bure', icon: 'library' },
  { id: StageId.EVENTS, title: 'Matukio', description: 'Mikutano Ijayo', icon: 'calendar' },
  { id: StageId.NEWS, title: 'Habari', description: 'Taarifa za Huduma', icon: 'newspaper' },
  { id: StageId.PRAYERS, title: 'Maombi', description: 'Omba na Uombewe', icon: 'heart' },
  { id: StageId.DONATE, title: 'Changia', description: 'Saidia Injili', icon: 'gift' },
  { id: StageId.ABOUT, title: 'Kuhusu Sisi', description: 'Lengo Letu', icon: 'info' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentStage, setCurrentStage] = useState<StageId>(StageId.HOME);
  const [activeTimelineId, setActiveTimelineId] = useState('creation');
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);

  const [centerNotifications, setCenterNotifications] = useState<ToastNotification[]>([
    { id: '1', title: 'Mfumo uko Hewani', message: 'Karibu God Cares 365. Mfumo upo tayari kwa matumizi.', type: 'success', timestamp: 'Hivi punde', read: false },
    { id: '2', title: 'Mkutano Unakuja', message: 'Mwanza Revival Week inaanza hivi punde. Gusa hapa kuona ratiba.', type: 'event' as any, timestamp: '10m ago', read: false }
  ]);

  const [resetParams, setResetParams] = useState<{ uid: string; token: string } | null>(null);

  const [aiLanguage, setAiLanguage] = useState<LanguageCode>('en');
  const [theme, setTheme] = useState<ThemePreference>('dark');

  useEffect(() => {
    const savedUser = localStorage.getItem('gc365_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedTheme = localStorage.getItem('gc365_theme') as ThemePreference;
    setTheme(savedTheme || 'dark');

    const bootstrapUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('gc365_user', JSON.stringify(currentUser));
      } catch (error) {
        clearTokens();
        localStorage.removeItem('gc365_user');
      }
    };

    if (localStorage.getItem('gc365_access_token')) {
      bootstrapUser();
    }
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messages = await getSystemMessages();
        if (messages.length === 0) return;
        const mapped: ToastNotification[] = messages.map((msg) => ({
          id: String(msg.id),
          title: msg.title,
          message: msg.body,
          type: msg.level === 'success' ? 'success' : msg.level === 'warning' ? 'error' : 'info',
          timestamp: new Date(msg.created_at).toLocaleDateString(),
          read: false,
        }));
        setCenterNotifications(mapped);
      } catch (error) {
        // Keep default notifications when API is unavailable.
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const uid = url.searchParams.get('uid');
    const token = url.searchParams.get('token');
    if (url.pathname.includes('/reset-password') && uid && token) {
      setResetParams({ uid, token });
      setShowAuthModal(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (targetTheme: 'light' | 'dark') => {
      if (targetTheme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    };
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);
    } else {
      applyTheme(theme);
    }
    localStorage.setItem('gc365_theme', theme);
  }, [theme]);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('gc365_user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gc365_user');
    clearTokens();
    setCurrentStage(StageId.HOME);
    setIsMenuOpen(false);
    setShowProfileModal(false);
  };

  const handleStageChange = (id: StageId) => {
    const restrictedStages = [
      StageId.BIBLE_STUDY, 
      StageId.FAITH_BUILDER, 
      StageId.TIMELINE, 
      StageId.EVIDENCE, 
      StageId.DECEPTION_VAULT, 
      StageId.QUESTION_VAULT
    ];

    if (restrictedStages.includes(id) && !user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentStage(id);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    switch (currentStage) {
      case StageId.HOME: return <Home onNavigate={handleStageChange} />;
      case StageId.BLOG: return <Blog />;
      case StageId.FAITH_BUILDER: return user ? <FaithBuilder /> : <Home onNavigate={handleStageChange} />;
      case StageId.BIBLE_STUDY: return user ? <BibleStudyJourney /> : <Home onNavigate={handleStageChange} />;
      case StageId.TIMELINE: return user ? <PropheticTimeline activeTimelineId={activeTimelineId} setActiveTimelineId={setActiveTimelineId} onNavigate={handleStageChange} /> : <Home onNavigate={handleStageChange} />;
      case StageId.EVIDENCE: return user ? <EvidenceVault /> : <Home onNavigate={handleStageChange} />;
      case StageId.DECEPTION_VAULT: return user ? <DeceptionVault /> : <Home onNavigate={handleStageChange} />;
      case StageId.QUESTION_VAULT: return user ? <QuestionVault /> : <Home onNavigate={handleStageChange} />;
      case StageId.MEDIA: return <MediaProjects />;
      case StageId.TESTIMONIES: return <Testimonies />;
      case StageId.SHOP: return <Shop />;
      case StageId.LIBRARY: return <Library />;
      case StageId.EVENTS: return <Events />;
      case StageId.NEWS: return <News />;
      case StageId.PRAYERS: return <Prayers aiLanguage={aiLanguage} />;
      case StageId.DONATE: return <Donations />;
      case StageId.ABOUT: return <AboutUs />;
      default: return <Home onNavigate={handleStageChange} />;
    }
  };

  const unreadCount = centerNotifications.filter(n => !n.read).length;
  const isImmersive = currentStage === StageId.TIMELINE && user;
  
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 overflow-hidden">
      <ToastContainer notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      
      <NotificationCenter 
        isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} notifications={centerNotifications}
        onMarkAllRead={() => setCenterNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setCenterNotifications([])} onDismiss={(id) => setCenterNotifications(prev => prev.filter(n => n.id !== id))}
        onNavigateToEvent={() => { handleStageChange(StageId.EVENTS); setIsNotificationOpen(false); }}
      />

      <LanguageCenter isOpen={isLanguageOpen} onClose={() => setIsLanguageOpen(false)} currentLanguage={aiLanguage} onLanguageChange={setAiLanguage} />
      <ThemeCenter isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentTheme={theme} onThemeChange={setTheme} />

      {/* Floating Tools - Available for everyone now to increase engagement on Homepage */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3 pointer-events-auto">
        <HistoryTool aiLanguage={aiLanguage} onGoToTimeline={() => handleStageChange(StageId.TIMELINE)} />
        <QuestionTool onGoToVault={() => handleStageChange(StageId.QUESTION_VAULT)} />
        <DeceptionTool onGoToVault={() => handleStageChange(StageId.DECEPTION_VAULT)} />
        <EvidenceTool onGoToVault={() => handleStageChange(StageId.EVIDENCE)} />
      </div>

      {showAuthModal && (
        <Auth
          onLogin={handleLogin}
          onClose={() => {
            setShowAuthModal(false);
            if (resetParams) {
              setResetParams(null);
              window.history.replaceState({}, '', '/');
            }
          }}
          resetParams={resetParams}
          onResetComplete={() => {
            setResetParams(null);
            window.history.replaceState({}, '', '/');
          }}
        />
      )}
      {showProfileModal && user && <ProfileModal user={user} onLogout={handleLogout} onClose={() => setShowProfileModal(false)} />}

      <Sidebar 
        currentStage={currentStage} onStageChange={handleStageChange} stages={stages}
        isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} onLogout={handleLogout}
        onShowProfile={() => { setIsMenuOpen(false); setShowProfileModal(true); }}
        onShowAuth={() => { setIsMenuOpen(false); setShowAuthModal(true); }}
      />

      <div className="relative z-10 flex h-screen overflow-hidden">
        <main className="flex-1 flex flex-col relative w-full h-full bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl">
          {!isImmersive && (
            <header className="fixed top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-[50] bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsMenuOpen(true)} className="p-3.5 text-slate-900 dark:text-white bg-white/90 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 backdrop-blur-md rounded-full transition-all border border-slate-200 dark:border-white/10 shadow-xl group">
                  <Menu size={22} className="group-hover:text-gold-500 transition-colors" />
                </button>
                <div onClick={() => handleStageChange(StageId.HOME)} className="hidden md:flex items-center cursor-pointer group hover:scale-105 transition-all">
                  <img src="/Logo.png" alt="God Cares 365" className="h-24 w-auto" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                 {/* <button onClick={() => setIsLanguageOpen(!isLanguageOpen)} className="p-3.5 rounded-full bg-white/90 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white transition-all shadow-xl hover:bg-gold-400/10"><Languages size={18} /></button> */}
                 <button onClick={() => setIsThemeOpen(!isThemeOpen)} className="p-3.5 rounded-full bg-white/90 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white transition-all shadow-xl hover:bg-gold-400/10">{theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}</button>
                 <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className={`relative p-3.5 rounded-full backdrop-blur-md border transition-all shadow-xl ${isNotificationOpen ? 'bg-gold-500 text-slate-900 border-gold-400' : 'bg-white/90 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white'}`}><Bell size={18} />{unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>}</button>
                 {!user && (
                   <button onClick={() => setShowAuthModal(true)} className="hidden md:flex px-8 py-3 bg-gold-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl">Ingia</button>
                 )}
              </div>
            </header>
          )}

          <div 
            ref={mainContentRef}
            className="flex-1 overflow-y-auto scroll-smooth scrollbar-hide pt-20"
          >
            {renderContent()}
            {!isImmersive && <Footer onNavigate={handleStageChange} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
