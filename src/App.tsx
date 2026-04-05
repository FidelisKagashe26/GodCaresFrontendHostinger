import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { Sidebar, ProfileModal } from './components/layout/Sidebar';
import { Home } from './components/layout/Home';
import { StageId, ToastNotification, LanguageCode, ThemePreference } from './types';
import { ToastContainer } from './components/ui/Toast';
import { Sun, Moon, Menu, Bell, User, Monitor, ChevronDown, LogOut, ArrowLeft, ChevronRight, Plus, X } from 'lucide-react';
import { AuthUser, clearTokens, getCurrentUser } from './services/core/authService';
import { getSystemMessages } from './services/core/systemMessageService';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, SiteSettings } from './services/core/siteSettingsService';
import {
  STAGES,
  STAGE_ROUTE_ENTRIES,
  getLegacyRedirectPath,
  getStageFromPath,
  getStagePath,
  isRestrictedStage,
  normalizePath,
} from './routes/stageRoutes';

const lazyNamed = <T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  exportName: K,
) =>
  lazy(async () => {
    const module = await loader();
    return {
      default: module[exportName] as React.ComponentType<any>,
    };
  });

const Auth = lazyNamed(() => import('./components/auth/Auth'), 'Auth');
const BibleStudyJourney = lazyNamed(() => import('./components/journey/BibleStudyJourney'), 'BibleStudyJourney');
const Shop = lazyNamed(() => import('./components/content/Shop'), 'Shop');
const Library = lazyNamed(() => import('./components/content/Library'), 'Library');
const Events = lazyNamed(() => import('./components/content/Events'), 'Events');
const News = lazyNamed(() => import('./components/content/News'), 'News');
const Prayers = lazyNamed(() => import('./components/content/Prayers'), 'Prayers');
const Donations = lazyNamed(() => import('./components/content/Donations'), 'Donations');
const AboutUs = lazyNamed(() => import('./components/content/AboutUs'), 'AboutUs');
const MediaProjects = lazyNamed(() => import('./components/content/MediaProjects'), 'MediaProjects');
const Testimonies = lazyNamed(() => import('./components/content/Testimonies'), 'Testimonies');
const EvidenceVault = lazyNamed(() => import('./components/vault/EvidenceVault'), 'EvidenceVault');
const DeceptionVault = lazyNamed(() => import('./components/vault/DeceptionVault'), 'DeceptionVault');
const QuestionVault = lazyNamed(() => import('./components/vault/QuestionVault'), 'QuestionVault');
const PropheticTimeline = lazyNamed(() => import('./components/journey/PropheticTimeline'), 'PropheticTimeline');
const Blog = lazyNamed(() => import('./components/content/Blog'), 'Blog');
const FaithBuilder = lazyNamed(() => import('./components/journey/FaithBuilder'), 'FaithBuilder');
const Footer = lazyNamed(() => import('./components/layout/Footer'), 'Footer');
const HistoryTool = lazyNamed(() => import('./components/tools/HistoryTool'), 'HistoryTool');
const QuestionTool = lazyNamed(() => import('./components/tools/QuestionTool'), 'QuestionTool');
const DeceptionTool = lazyNamed(() => import('./components/tools/DeceptionTool'), 'DeceptionTool');
const EvidenceTool = lazyNamed(() => import('./components/tools/EvidenceTool'), 'EvidenceTool');
const NotificationCenter = lazyNamed(() => import('./components/system/NotificationCenter'), 'NotificationCenter');
const LanguageCenter = lazyNamed(() => import('./components/system/LanguageCenter'), 'LanguageCenter');
const ThemeCenter = lazyNamed(() => import('./components/system/ThemeCenter'), 'ThemeCenter');

const stageLoader = (
  <div className="flex min-h-[40vh] items-center justify-center px-6">
    <div className="rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] px-5 py-4 text-center shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[color:var(--accent)]">Inapakia</p>
      <p className="mt-2 text-sm text-[color:var(--text-muted)]">Tafadhali subiri kidogo.</p>
    </div>
  </div>
);

const NOTIFICATION_STATE_KEY = 'gc365_center_notification_state_v1';
const RESET_PASSWORD_PATH = '/reset-password';

type StageNavigationOptions = {
  replace?: boolean;
  scrollBehavior?: ScrollBehavior;
};

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
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const currentPath = normalizePath(location.pathname);
  const matchedStage = getStageFromPath(currentPath);
  const currentStage = matchedStage || StageId.HOME;

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthBootstrapComplete, setIsAuthBootstrapComplete] = useState(false);
  const [activeTimelineId, setActiveTimelineId] = useState('creation');
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFloatingTools, setShowFloatingTools] = useState(false);
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authEntryMode, setAuthEntryMode] = useState<'login' | 'register'>('login');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const routeHistoryRef = useRef<string[]>([]);

  const [centerNotifications, setCenterNotifications] = useState<ToastNotification[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);

  const [resetParams, setResetParams] = useState<{ uid: string; token: string } | null>(null);

  const [aiLanguage, setAiLanguage] = useState<LanguageCode>('en');
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const fallbackLogoSrc = `${import.meta.env.BASE_URL}Logo.png`;
  const logoSrc = siteSettings.logo_url || fallbackLogoSrc;

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthEntryMode(mode);
    setShowAuthModal(true);
    setIsAccountMenuOpen(false);
  };

  const navigateToStage = (
    id: StageId,
    options: StageNavigationOptions = {},
  ) => {
    const { replace = false, scrollBehavior = 'smooth' } = options;
    const targetPath = normalizePath(getStagePath(id));

    if (isRestrictedStage(id) && !user) {
      openAuthModal('login');
      if (currentPath !== getStagePath(StageId.HOME)) {
        navigate(getStagePath(StageId.HOME), { replace: true });
      }
      return;
    }

    setIsAccountMenuOpen(false);
    setIsMenuOpen(false);

    if (currentPath === targetPath) {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: scrollBehavior });
      }
      return;
    }

    navigate(targetPath, { replace });
  };

  const handleStageChange = (id: StageId) => {
    navigateToStage(id, { replace: false, scrollBehavior: 'smooth' });
  };

  const handleLogin = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('gc365_user', JSON.stringify(userData));
    setShowAuthModal(false);
    setAuthEntryMode('login');
    setIsAccountMenuOpen(false);
    setNotifications((prev) => [
      {
        id: `verify-${Date.now()}`,
        title: 'Karibu God Cares 365!',
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
    routeHistoryRef.current = [getStagePath(StageId.HOME)];
    setCanGoBack(false);
    setIsMenuOpen(false);
    setShowProfileModal(false);
    setIsAccountMenuOpen(false);
    setAuthEntryMode('login');
    navigate(getStagePath(StageId.HOME), { replace: true });
  };

  useEffect(() => {
    const legacyRedirectPath = getLegacyRedirectPath(currentPath);
    if (legacyRedirectPath) {
      navigate(legacyRedirectPath, { replace: true });
      return;
    }

    if (!matchedStage && currentPath !== RESET_PASSWORD_PATH) {
      navigate(getStagePath(StageId.HOME), { replace: true });
    }
  }, [currentPath, matchedStage, navigate]);

  useEffect(() => {
    const savedUser = localStorage.getItem('gc365_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('gc365_user');
      }
    }

    const savedTheme = localStorage.getItem('gc365_theme') as ThemePreference;
    setTheme(savedTheme || 'system');

    const bootstrapUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('gc365_user', JSON.stringify(currentUser));
      } catch {
        clearTokens();
        localStorage.removeItem('gc365_user');
      } finally {
        setIsAuthBootstrapComplete(true);
      }
    };

    if (localStorage.getItem('gc365_access_token')) {
      void bootstrapUser();
      return;
    }

    setIsAuthBootstrapComplete(true);
  }, []);

  useEffect(() => {
    if (!isAuthBootstrapComplete) {
      return;
    }

    if (!user && isRestrictedStage(currentStage)) {
      openAuthModal('login');
      if (currentPath !== getStagePath(StageId.HOME)) {
        navigate(getStagePath(StageId.HOME), { replace: true });
      }
    }
  }, [currentPath, currentStage, isAuthBootstrapComplete, navigate, user]);

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
      } catch {
        setCenterNotifications([]);
      }
    };

    void loadMessages();
  }, [currentStage, user?.email]);

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const settings = await getSiteSettings();
        setSiteSettings(settings);
      } catch {
        // Keep defaults when API is unavailable.
      }
    };

    void loadSiteSettings();
  }, []);

  useEffect(() => {
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    const win = window as any;

    const revealFloatingTools = () => {
      setShowFloatingTools(true);
    };

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(revealFloatingTools, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(revealFloatingTools, 800);
    }

    return () => {
      if (idleId !== null && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');
    const isResetPasswordRoute = currentPath === RESET_PASSWORD_PATH;

    if (isResetPasswordRoute && uid && token) {
      setResetParams({ uid, token });
      setShowAuthModal(true);
      return;
    }

    if (!isResetPasswordRoute) {
      setResetParams(null);
    }
  }, [currentPath, location.search]);

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

  useEffect(() => {
    const historyTrail = routeHistoryRef.current;
    if (historyTrail.length === 0) {
      routeHistoryRef.current = [currentPath];
      setCanGoBack(false);
      return;
    }

    const lastPath = historyTrail[historyTrail.length - 1];
    if (lastPath !== currentPath) {
      if (navigationType === 'POP' && historyTrail.length > 1 && historyTrail[historyTrail.length - 2] === currentPath) {
        routeHistoryRef.current = historyTrail.slice(0, -1);
      } else {
        routeHistoryRef.current = [...historyTrail, currentPath];
      }
    }

    setCanGoBack(routeHistoryRef.current.length > 1);
  }, [currentPath, navigationType]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
    setIsQuickToolsOpen(false);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [currentPath]);

  const renderStageContent = (stage: StageId) => {
    switch (stage) {
      case StageId.HOME: return <Home onNavigate={handleStageChange} siteSettings={siteSettings} />;
      case StageId.BLOG: return <Blog user={user} onRequireLogin={() => openAuthModal('login')} />;
      case StageId.FAITH_BUILDER: return user ? <FaithBuilder /> : <Home onNavigate={handleStageChange} siteSettings={siteSettings} />;
      case StageId.BIBLE_STUDY: return user ? <BibleStudyJourney /> : <Home onNavigate={handleStageChange} siteSettings={siteSettings} />;
      case StageId.TIMELINE: return user ? <PropheticTimeline activeTimelineId={activeTimelineId} setActiveTimelineId={setActiveTimelineId} onNavigate={handleStageChange} /> : <Home onNavigate={handleStageChange} siteSettings={siteSettings} />;
      case StageId.EVIDENCE: return user ? <EvidenceVault /> : <Home onNavigate={handleStageChange} siteSettings={siteSettings} />;
      case StageId.DECEPTION_VAULT: return user ? <DeceptionVault /> : <Home onNavigate={handleStageChange} siteSettings={siteSettings} />;
      case StageId.QUESTION_VAULT: return user ? <QuestionVault /> : <Home onNavigate={handleStageChange} siteSettings={siteSettings} />;
      case StageId.MEDIA: return <MediaProjects />;
      case StageId.TESTIMONIES: return <Testimonies />;
      case StageId.SHOP: return <Shop />;
      case StageId.LIBRARY: return <Library />;
      case StageId.EVENTS: return <Events />;
      case StageId.NEWS: return <News />;
      case StageId.PRAYERS: return <Prayers aiLanguage={aiLanguage} />;
      case StageId.DONATE: return <Donations />;
      case StageId.ABOUT: return <AboutUs />;
      default: return <Home onNavigate={handleStageChange} siteSettings={siteSettings} />;
    }
  };

  const unreadCount = centerNotifications.filter((n) => !n.read).length;
  const isImmersive = currentStage === StageId.TIMELINE && user;
  const showStageBreadcrumb = !isImmersive && currentStage !== StageId.HOME;
  const currentStageLabel = useMemo(
    () => STAGES.find((stage) => stage.id === currentStage)?.title || 'Nyumbani',
    [currentStage],
  );

  const handleGlobalBack = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }

    if (currentPath !== getStagePath(StageId.HOME)) {
      navigateToStage(StageId.HOME, { replace: true, scrollBehavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[color:var(--page-bg)] text-[color:var(--text-primary)] font-sans transition-colors duration-500 overflow-hidden">
      <ToastContainer notifications={notifications} onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))} />

      {isNotificationOpen && (
        <Suspense fallback={null}>
          <NotificationCenter
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={centerNotifications}
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
        </Suspense>
      )}

      {isLanguageOpen && (
        <Suspense fallback={null}>
          <LanguageCenter
            isOpen={isLanguageOpen}
            onClose={() => setIsLanguageOpen(false)}
            currentLanguage={aiLanguage}
            onLanguageChange={setAiLanguage}
          />
        </Suspense>
      )}

      {isThemeOpen && (
        <Suspense fallback={null}>
          <ThemeCenter
            isOpen={isThemeOpen}
            onClose={() => setIsThemeOpen(false)}
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        </Suspense>
      )}

      {showFloatingTools && (
        <div
          className="fixed right-3 md:right-6 z-[90] pointer-events-auto"
          style={{ bottom: 'max(0.85rem, env(safe-area-inset-bottom))' }}
        >
          <Suspense fallback={null}>
            <div className="flex flex-col items-end gap-2 md:gap-3">
              {isQuickToolsOpen && (
                <div className="gc-floating-tools flex flex-col gap-2 md:gap-3 saturate-75 animate-fade-in">
                  <HistoryTool aiLanguage={aiLanguage} onGoToTimeline={() => handleStageChange(StageId.TIMELINE)} />
                  <QuestionTool onGoToVault={() => handleStageChange(StageId.QUESTION_VAULT)} />
                  <DeceptionTool onGoToVault={() => handleStageChange(StageId.DECEPTION_VAULT)} />
                  <EvidenceTool onGoToVault={() => handleStageChange(StageId.EVIDENCE)} />
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsQuickToolsOpen((prev) => !prev)}
                className={`gc-icon-button h-12 w-12 rounded-2xl flex items-center justify-center ${isQuickToolsOpen ? 'is-active' : ''}`}
                aria-label={isQuickToolsOpen ? 'Funga zana za haraka' : 'Fungua zana za haraka'}
                title={isQuickToolsOpen ? 'Funga zana' : 'Zana za haraka'}
              >
                {isQuickToolsOpen ? <X size={19} /> : <Plus size={19} />}
              </button>
            </div>
          </Suspense>
        </div>
      )}

      {showAuthModal && (
        <Suspense fallback={null}>
          <Auth
            logoSrc={logoSrc}
            initialMode={authEntryMode}
            onLogin={handleLogin}
            onClose={() => {
              setShowAuthModal(false);
              setAuthEntryMode('login');
              if (resetParams) {
                setResetParams(null);
                navigate(getStagePath(StageId.HOME), { replace: true });
              }
            }}
            resetParams={resetParams}
            onResetComplete={() => {
              setResetParams(null);
              navigate(getStagePath(StageId.HOME), { replace: true });
            }}
          />
        </Suspense>
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
        currentStage={currentStage}
        onStageChange={handleStageChange}
        stages={STAGES}
        logoSrc={logoSrc}
        siteSettings={siteSettings}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
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

          {showStageBreadcrumb && (
            <div className="fixed top-20 left-0 right-0 h-12 px-4 md:px-10 z-[45] bg-[color:var(--page-surface)]/90 backdrop-blur-md border-b border-[color:var(--line-strong)]">
              <div className="h-full flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGlobalBack}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] inline-flex items-center justify-center hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!canGoBack && currentPath === getStagePath(StageId.HOME)}
                  aria-label="Rudi hatua moja nyuma"
                >
                  <ArrowLeft size={16} />
                </button>

                <div className="min-w-0 inline-flex items-center gap-1.5 text-xs md:text-sm font-black uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                  <button
                    type="button"
                    onClick={() => handleStageChange(StageId.HOME)}
                    className="hover:text-[color:var(--accent)] transition-colors"
                  >
                    Nyumbani
                  </button>
                  <ChevronRight size={12} />
                  <span className="text-[color:var(--text-primary)] truncate">{currentStageLabel}</span>
                </div>
              </div>
            </div>
          )}

          <div
            ref={mainContentRef}
            className={`gc-content-scroll flex-1 overflow-y-auto scroll-smooth pb-16 ${isImmersive ? 'pt-20' : showStageBreadcrumb ? 'pt-32' : 'pt-20'}`}
          >
            <Suspense fallback={stageLoader}>
              <Routes>
                {STAGE_ROUTE_ENTRIES.map(([stage, path]) => (
                  <Route
                    key={stage}
                    path={path}
                    element={renderStageContent(stage)}
                  />
                ))}
                <Route path={RESET_PASSWORD_PATH} element={renderStageContent(StageId.HOME)} />
                <Route path="*" element={<Navigate to={getStagePath(StageId.HOME)} replace />} />
              </Routes>
            </Suspense>
            {!isImmersive && (
              <Suspense fallback={null}>
                <Footer onNavigate={handleStageChange} siteSettings={siteSettings} />
              </Suspense>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
