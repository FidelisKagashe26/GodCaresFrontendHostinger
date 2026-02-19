
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { Sun, Moon, Menu, Bell, User, Monitor, ChevronDown, LogOut, ArrowLeft, ChevronRight } from 'lucide-react';
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

const NOTIFICATION_STATE_KEY = 'gc365_center_notification_state_v1';
const STAGE_HASH_PREFIX = '#/';
const STAGE_ID_SET = new Set(Object.values(StageId) as StageId[]);

type StageNavigationOptions = {
  pushHistory?: boolean;
  trackHistory?: boolean;
  scrollBehavior?: ScrollBehavior;
};

const getStageFromHash = (hashValue: string): StageId | null => {
  const normalized = (hashValue || '').replace(/^#\/?/, '').trim() as StageId;
  if (!normalized) {
    return null;
  }
  return STAGE_ID_SET.has(normalized) ? normalized : null;
};

const buildStageHash = (stage: StageId) => `${STAGE_HASH_PREFIX}${stage}`;

interface NotificationStorageState {
  dismissedIds: string[];
  readIds: string[];
}

const loadNotificationStorageState = (): NotificationStorageState => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STATE_KEY);
    if (!raw) {
      return { dismissedIds: [], readIds: [] };
    }
    const parsed = JSON.parse(raw) as Partial<NotificationStorageState>;
    return {
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds.map(String) : [],
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds.map(String) : [],
    };
  } catch {
    return { dismissedIds: [], readIds: [] };
  }
};

const saveNotificationStorageState = (state: NotificationStorageState) => {
  localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(state));
};

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
  const stageHistoryRef = useRef<StageId[]>([StageId.HOME]);

  const [centerNotifications, setCenterNotifications] = useState<ToastNotification[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);

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
    const stageFromUrl = getStageFromHash(window.location.hash) || StageId.HOME;
    setCurrentStage(stageFromUrl);
    stageHistoryRef.current = [stageFromUrl];
    setCanGoBack(false);

    const targetHash = buildStageHash(stageFromUrl);
    const targetUrl = `${window.location.pathname}${window.location.search}${targetHash}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState({ gcStage: stageFromUrl }, '', targetUrl);
    } else {
      window.history.replaceState({ ...(window.history.state || {}), gcStage: stageFromUrl }, '', window.location.href);
    }
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storageState = loadNotificationStorageState();
        const dismissedSet = new Set(storageState.dismissedIds);
        const readSet = new Set(storageState.readIds);

        const messages = await getSystemMessages({
          stage: currentStage,
          userEmail: user?.email || undefined,
        });
        const mapped: ToastNotification[] = messages
          .filter((msg) => !dismissedSet.has(String(msg.id)))
          .map((msg) => ({
            id: String(msg.id),
          title: msg.title,
          message: msg.body,
          type: msg.level === 'success' ? 'success' : msg.level === 'warning' ? 'error' : 'info',
          timestamp: new Date(msg.created_at).toLocaleDateString(),
            read: readSet.has(String(msg.id)),
          }));
        setCenterNotifications(mapped);
      } catch (error) {
        setCenterNotifications([]);
      }
    };

    loadMessages();
  }, [currentStage, user?.email]);

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
    const homeHash = buildStageHash(StageId.HOME);
    window.history.replaceState({ gcStage: StageId.HOME }, '', `${window.location.pathname}${window.location.search}${homeHash}`);
    stageHistoryRef.current = [StageId.HOME];
    setCanGoBack(false);
    setCurrentStage(StageId.HOME);
    setIsMenuOpen(false);
    setShowProfileModal(false);
    setIsAccountMenuOpen(false);
    setAuthEntryMode('login');
  };

  const navigateToStage = (
    id: StageId,
    options: StageNavigationOptions = {},
  ) => {
    const {
      pushHistory = true,
      trackHistory = true,
      scrollBehavior = 'smooth',
    } = options;

    const restrictedStages = [
      StageId.BIBLE_STUDY,
      StageId.FAITH_BUILDER,
      StageId.TIMELINE,
      StageId.EVIDENCE,
      StageId.DECEPTION_VAULT,
      StageId.QUESTION_VAULT,
    ];

    if (restrictedStages.includes(id) && !user) {
      openAuthModal('login');
      if (currentStage !== StageId.HOME) {
        setCurrentStage(StageId.HOME);
      }
      if (window.location.hash !== buildStageHash(StageId.HOME)) {
        window.history.replaceState(
          { gcStage: StageId.HOME },
          '',
          `${window.location.pathname}${window.location.search}${buildStageHash(StageId.HOME)}`,
        );
      }
      stageHistoryRef.current = [StageId.HOME];
      setCanGoBack(false);
      return;
    }

    setIsAccountMenuOpen(false);
    setIsMenuOpen(false);
    setCurrentStage(id);

    const targetHash = buildStageHash(id);
    if (pushHistory && window.location.hash !== targetHash) {
      window.history.pushState(
        { gcStage: id },
        '',
        `${window.location.pathname}${window.location.search}${targetHash}`,
      );
    }

    if (trackHistory) {
      const lastStage = stageHistoryRef.current[stageHistoryRef.current.length - 1];
      if (lastStage !== id) {
        stageHistoryRef.current = [...stageHistoryRef.current, id];
      }
      setCanGoBack(stageHistoryRef.current.length > 1);
    }

    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: scrollBehavior });
    }
  };

  const handleStageChange = (id: StageId) => {
    if (id === currentStage) {
      setIsMenuOpen(false);
      setIsAccountMenuOpen(false);
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    navigateToStage(id, { pushHistory: true, trackHistory: true, scrollBehavior: 'smooth' });
  };

  useEffect(() => {
    const syncStageFromUrl = () => {
      const stageFromUrl = getStageFromHash(window.location.hash) || StageId.HOME;
      const historyTrail = stageHistoryRef.current;
      const lastStage = historyTrail[historyTrail.length - 1];

      if (lastStage !== stageFromUrl) {
        if (historyTrail.length > 1 && historyTrail[historyTrail.length - 2] === stageFromUrl) {
          stageHistoryRef.current = historyTrail.slice(0, -1);
        } else {
          stageHistoryRef.current = [...historyTrail, stageFromUrl];
        }
      }
      setCanGoBack(stageHistoryRef.current.length > 1);

      if (stageFromUrl !== currentStage) {
        navigateToStage(stageFromUrl, {
          pushHistory: false,
          trackHistory: false,
          scrollBehavior: 'auto',
        });
      }
    };

    window.addEventListener('hashchange', syncStageFromUrl);
    window.addEventListener('popstate', syncStageFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncStageFromUrl);
      window.removeEventListener('popstate', syncStageFromUrl);
    };
  }, [currentStage, user]);

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
  const currentStageLabel = useMemo(
    () => stages.find((stage) => stage.id === currentStage)?.title || 'Nyumbani',
    [currentStage],
  );

  const handleGlobalBack = () => {
    if (canGoBack) {
      window.history.back();
      return;
    }

    if (currentStage !== StageId.HOME) {
      navigateToStage(StageId.HOME, { pushHistory: true, trackHistory: true, scrollBehavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative min-h-screen bg-[color:var(--page-bg)] text-[color:var(--text-primary)] font-sans transition-colors duration-500 overflow-hidden">
      <ToastContainer notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      
      <NotificationCenter 
        isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} notifications={centerNotifications}
        onMarkAllRead={() => {
          setCenterNotifications((prev) => {
            const next = prev.map((n) => ({ ...n, read: true }));
            const storageState = loadNotificationStorageState();
            const readSet = new Set(storageState.readIds);
            next.forEach((item) => readSet.add(item.id));
            saveNotificationStorageState({
              dismissedIds: storageState.dismissedIds,
              readIds: Array.from(readSet),
            });
            return next;
          });
        }}
        onClearAll={() => {
          const idsToDismiss = centerNotifications.map((item) => item.id);
          const storageState = loadNotificationStorageState();
          const dismissedSet = new Set(storageState.dismissedIds);
          idsToDismiss.forEach((id) => dismissedSet.add(id));
          saveNotificationStorageState({
            dismissedIds: Array.from(dismissedSet),
            readIds: storageState.readIds,
          });
          setCenterNotifications([]);
        }}
        onDismiss={(id) => {
          const storageState = loadNotificationStorageState();
          const dismissedSet = new Set(storageState.dismissedIds);
          dismissedSet.add(id);
          saveNotificationStorageState({
            dismissedIds: Array.from(dismissedSet),
            readIds: storageState.readIds,
          });
          setCenterNotifications((prev) => prev.filter((n) => n.id !== id));
        }}
        onNavigateToEvent={() => { handleStageChange(StageId.EVENTS); setIsNotificationOpen(false); }}
      />

      <LanguageCenter isOpen={isLanguageOpen} onClose={() => setIsLanguageOpen(false)} currentLanguage={aiLanguage} onLanguageChange={setAiLanguage} />
      <ThemeCenter isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} currentTheme={theme} onThemeChange={setTheme} />

      {/* Floating Tools - Available for everyone now to increase engagement on Homepage */}
      <div
        className="fixed right-3 md:right-6 z-[90] pointer-events-auto"
        style={{ bottom: 'max(0.85rem, env(safe-area-inset-bottom))' }}
      >
        <div className="gc-floating-tools flex flex-col gap-2 md:gap-3 saturate-75 scale-90 md:scale-100 origin-bottom-right">
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
            <header className="fixed top-0 left-0 right-0 h-20 px-3 sm:px-5 md:px-10 flex items-center justify-between z-[50] gc-header">
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="gc-icon-button p-2.5 md:p-3.5 rounded-full group"
                  aria-label="Open menu"
                >
                  <Menu size={20} className="group-hover:text-[color:var(--accent)] transition-colors" />
                </button>
                <div onClick={() => handleStageChange(StageId.HOME)} className="hidden md:flex items-center gap-3 cursor-pointer group">
                  <img src={logoSrc} alt={siteSettings.site_name} className="h-12 md:h-14 w-auto" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-display tracking-[0.2em] text-[color:var(--text-primary)]">{siteSettings.site_name}</span>
                    <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-muted)]">{siteSettings.site_tagline}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 md:gap-3">
                 {/* <button onClick={() => setIsLanguageOpen(!isLanguageOpen)} className="p-3.5 rounded-full bg-white/90 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white transition-all shadow-xl hover:bg-gold-400/10"><Languages size={18} /></button> */}
                 <button
                   onClick={() => setIsThemeOpen(!isThemeOpen)}
                   className="gc-icon-button p-2.5 md:p-3.5 rounded-full"
                   aria-label="Theme"
                 >
                   {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
                 </button>
                 <button
                   onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                   className={`relative gc-icon-button p-2.5 md:p-3.5 rounded-full ${isNotificationOpen ? 'is-active' : ''}`}
                   aria-label="Notifications"
                 >
                   <Bell size={16} />
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

          {!isImmersive && (
            <div className="fixed top-20 left-0 right-0 h-12 px-4 md:px-10 z-[45] bg-[color:var(--page-surface)]/90 backdrop-blur-md border-b border-[color:var(--line-strong)]">
              <div className="h-full flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGlobalBack}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] inline-flex items-center justify-center hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!canGoBack && currentStage === StageId.HOME}
                  aria-label="Rudi hatua moja nyuma"
                >
                  <ArrowLeft size={16} />
                </button>

                <div className="min-w-0 inline-flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                  <button
                    type="button"
                    onClick={() => handleStageChange(StageId.HOME)}
                    className="hover:text-[color:var(--accent)] transition-colors"
                  >
                    Nyumbani
                  </button>
                  {currentStage !== StageId.HOME && (
                    <>
                      <ChevronRight size={12} />
                      <span className="text-[color:var(--text-primary)] truncate">{currentStageLabel}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div 
            ref={mainContentRef}
            className={`gc-content-scroll flex-1 overflow-y-auto scroll-smooth pb-16 ${isImmersive ? 'pt-20' : 'pt-32'}`}
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
