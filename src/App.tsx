
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
import { Sun, Moon, Menu, Bell, User, Monitor, ChevronDown, LogOut } from 'lucide-react';
import { clearTokens, getCurrentUser } from './services/authService';
import { getSystemMessages } from './services/systemMessageService';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, SiteSettings } from './services/siteSettingsService';

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
  const [authEntryMode, setAuthEntryMode] = useState<'login' | 'register'>('login');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const [centerNotifications, setCenterNotifications] = useState<ToastNotification[]>([]);

  const [resetParams, setResetParams] = useState<{ uid: string; token: string } | null>(null);

  const [aiLanguage, setAiLanguage] = useState<LanguageCode>('en');
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const fallbackLogoSrc = `${import.meta.env.BASE_URL}Logo.png`;
  const logoSrc = siteSettings.logo_url || fallbackLogoSrc;

  useEffect(() => {
    const savedUser = localStorage.getItem('gc365_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedTheme = localStorage.getItem('gc365_theme') as ThemePreference;
    setTheme(savedTheme || 'system');

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
        setCenterNotifications([]);
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch (error) {
        // Keep defaults when API is unavailable.
      }
    };

    loadSiteSettings();
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
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (targetTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(targetTheme);
    };

    const resolveTheme = () =>
      theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;

    const syncTheme = () => {
      applyTheme(resolveTheme());
    };

    syncTheme();
    if (theme === 'system') {
      media.addEventListener('change', syncTheme);
    }

    localStorage.setItem('gc365_theme', theme);

    return () => {
      media.removeEventListener('change', syncTheme);
    };
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthEntryMode(mode);
    setShowAuthModal(true);
    setIsAccountMenuOpen(false);
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('gc365_user', JSON.stringify(userData));
    setShowAuthModal(false);
    setAuthEntryMode('login');
    setIsAccountMenuOpen(false);
    setNotifications((prev) => [
      {
        id: `verify-${Date.now()}`,
        title: 'Karibu God Cares 365 🎉',
        message: 'Hongera kwa kuingia! Tafadhali nenda kwenye Profile ukamilishe verification ya email yako.',
        type: 'info',
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gc365_user');
    clearTokens();
    setCurrentStage(StageId.HOME);
    setIsMenuOpen(false);
    setShowProfileModal(false);
    setIsAccountMenuOpen(false);
    setAuthEntryMode('login');
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
      openAuthModal('login');
      return;
    }
    setIsAccountMenuOpen(false);
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
    <div className="relative min-h-screen bg-[color:var(--page-bg)] text-[color:var(--text-primary)] font-sans transition-colors duration-500 overflow-hidden">
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
      <div className="fixed bottom-6 right-6 z-[90] pointer-events-auto">
        <div className="gc-floating-tools flex flex-col gap-3 saturate-75">
          <HistoryTool aiLanguage={aiLanguage} onGoToTimeline={() => handleStageChange(StageId.TIMELINE)} />
          <QuestionTool onGoToVault={() => handleStageChange(StageId.QUESTION_VAULT)} />
          <DeceptionTool onGoToVault={() => handleStageChange(StageId.DECEPTION_VAULT)} />
          <EvidenceTool onGoToVault={() => handleStageChange(StageId.EVIDENCE)} />
        </div>
      </div>

      {showAuthModal && (
        <Auth
          logoSrc={logoSrc}
          initialMode={authEntryMode}
          onLogin={handleLogin}
          onClose={() => {
            setShowAuthModal(false);
            setAuthEntryMode('login');
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
      {showProfileModal && user && (
        <ProfileModal
          user={user}
          supportEmail={siteSettings.support_email}
          onLogout={handleLogout}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      <Sidebar 
        currentStage={currentStage} onStageChange={handleStageChange} stages={stages}
        logoSrc={logoSrc}
        siteSettings={siteSettings}
        isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} onLogout={handleLogout}
        onShowProfile={() => { setIsMenuOpen(false); setShowProfileModal(true); }}
        onShowAuth={() => { setIsMenuOpen(false); openAuthModal('login'); }}
      />

      <div className="relative z-10 flex h-screen overflow-hidden">
        <main className="flex-1 flex flex-col relative w-full h-full bg-[color:var(--page-surface)] backdrop-blur-md">
          {!isImmersive && (
            <header className="fixed top-0 left-0 right-0 h-20 px-5 md:px-10 flex items-center justify-between z-[50] gc-header">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="gc-icon-button p-3.5 rounded-full group"
                  aria-label="Open menu"
                >
                  <Menu size={22} className="group-hover:text-[color:var(--accent)] transition-colors" />
                </button>
                <div onClick={() => handleStageChange(StageId.HOME)} className="hidden md:flex items-center gap-3 cursor-pointer group">
                  <img src={logoSrc} alt={siteSettings.site_name} className="h-12 md:h-14 w-auto" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-display tracking-[0.2em] text-[color:var(--text-primary)]">{siteSettings.site_name}</span>
                    <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-muted)]">{siteSettings.site_tagline}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 {/* <button onClick={() => setIsLanguageOpen(!isLanguageOpen)} className="p-3.5 rounded-full bg-white/90 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white transition-all shadow-xl hover:bg-gold-400/10"><Languages size={18} /></button> */}
                 <button
                   onClick={() => setIsThemeOpen(!isThemeOpen)}
                   className="gc-icon-button p-3.5 rounded-full"
                   aria-label="Theme"
                 >
                   {theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
                 </button>
                 <button
                   onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                   className={`relative gc-icon-button p-3.5 rounded-full ${isNotificationOpen ? 'is-active' : ''}`}
                   aria-label="Notifications"
                 >
                   <Bell size={18} />
                   {unreadCount > 0 && (
                     <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[color:var(--accent)] rounded-full"></span>
                   )}
                 </button>
                 <div ref={accountMenuRef} className="relative">
                   <button
                     onClick={() => {
                       setIsAccountMenuOpen((prev) => !prev);
                     }}
                     className={`gc-icon-button rounded-full pl-1.5 pr-2 py-1.5 flex items-center gap-2 ${isAccountMenuOpen ? 'is-active' : ''}`}
                     aria-label={user ? 'Akaunti yako' : 'Menyu ya akaunti'}
                     aria-expanded={isAccountMenuOpen}
                   >
                     <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-gold-700 text-[#020617] flex items-center justify-center overflow-hidden shadow-sm">
                       {user ? (
                         <img
                           src={localStorage.getItem('gc365_profile_pic') || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=eab308&color=020617&bold=true`}
                           alt="Akaunti"
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <User size={18} />
                       )}
                     </span>
                     <div className="hidden md:flex flex-col items-start leading-none pr-1">
                       <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[color:var(--text-primary)]">
                         {user ? user.name.split(' ')[0] : 'Mgeni'}
                       </span>
                       <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                         {user ? 'Akaunti' : 'Ingia/Jisajili'}
                       </span>
                     </div>
                     <ChevronDown size={14} className={`text-[color:var(--text-muted)] transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                   </button>

                   {isAccountMenuOpen && (
                     <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] shadow-2xl overflow-hidden z-[80]">
                       {user ? (
                         <>
                           <button
                             onClick={() => {
                               setShowProfileModal(true);
                               setIsAccountMenuOpen(false);
                             }}
                             className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-3)] transition-colors"
                           >
                             Akaunti Yangu
                           </button>
                           <button
                             onClick={handleLogout}
                             className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-red-500 hover:bg-[color:var(--surface-3)] transition-colors inline-flex items-center gap-2"
                           >
                             <LogOut size={14} />
                             Ondoka
                           </button>
                         </>
                       ) : (
                         <>
                           <button
                             onClick={() => openAuthModal('login')}
                             className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-3)] transition-colors"
                           >
                             Ingia
                           </button>
                           <button
                             onClick={() => openAuthModal('register')}
                             className="w-full text-left px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[color:var(--accent)] hover:bg-[color:var(--surface-3)] transition-colors"
                           >
                             Jisajili
                           </button>
                         </>
                       )}
                     </div>
                   )}
                 </div>
              </div>
            </header>
          )}

          <div 
            ref={mainContentRef}
            className="gc-content-scroll flex-1 overflow-y-auto scroll-smooth pt-20 pb-16"
          >
            {renderContent()}
            {!isImmersive && <Footer onNavigate={handleStageChange} siteSettings={siteSettings} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
