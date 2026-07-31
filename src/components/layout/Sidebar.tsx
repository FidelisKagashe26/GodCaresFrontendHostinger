
import React, { useEffect, useState, useRef } from 'react';
import { StageConfig, StageId } from '../../types';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../../services/core/siteSettingsService';
import { 
  Home, BookCheck, Microscope, ShieldAlert, MessageSquare, 
  ShoppingBag, Library, Newspaper, Heart, Gift, Info, Calendar, PlayCircle, 
  MessageSquareQuote, X, LayoutGrid, BookOpen, Clock,
  Compass, Star, ChevronRight, Menu, User, Settings, 
  Award, Trophy, ShieldCheck, GraduationCap, MapPin, 
  LogOut, Bell, CreditCard, ChevronLeft, Eye, Shield,
  Activity, CheckCircle2, Medal, Book, Archive, Camera, Cross,
  Globe, Zap, ExternalLink, Baby, Users
} from 'lucide-react';

const MAX_PROFILE_PIC_STORAGE_LENGTH = 350_000;

const safeRemoveStorageItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage write/delete errors.
  }
};

const readStorageValue = (key: string, fallback = ''): string => {
  try {
    const value = localStorage.getItem(key);
    return typeof value === 'string' ? value : fallback;
  } catch {
    return fallback;
  }
};

const readCompletedModulesCount = (): number => {
  try {
    const parsed = JSON.parse(readStorageValue('gc365_completed_modules', '[]'));
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

const normalizeDisplayName = (value: unknown): string => {
  if (typeof value !== 'string') return 'Mtumiaji';
  const cleaned = value.trim();
  return cleaned || 'Mtumiaji';
};

const normalizeOptionalUrl = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const toSentenceCase = (value: string): string => {
  const trimmed = (value || '').trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

const readProfilePicFromStorage = (): string => {
  const value = readStorageValue('gc365_profile_pic');
  if (!value) {
    return '';
  }
  if (value.length > MAX_PROFILE_PIC_STORAGE_LENGTH) {
    safeRemoveStorageItem('gc365_profile_pic');
    return '';
  }
  return value;
};

interface SidebarProps {
  currentStage: StageId;
  onStageChange: (id: StageId) => void;
  stages: StageConfig[];
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
  onShowProfile?: () => void;
  onShowAuth?: () => void;
  logoSrc?: string;
  siteSettings?: SiteSettings;
}

export const ProfileModal: React.FC<{ user: any; onLogout: () => void; onClose: () => void; supportEmail?: string }> = ({ user, onLogout, onClose, supportEmail }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState<string>(() => readProfilePicFromStorage());
  
  const completedModulesCount = readCompletedModulesCount();
  const kpPoints = completedModulesCount * 1500;
  const streak = 12;
  const displayName = normalizeDisplayName(user?.name);

  const getUserTitle = () => {
    if (completedModulesCount === 0) return 'Mtafuta Ukweli';
    if (completedModulesCount === 1) return 'Mwanafunzi wa Unabii';
    if (completedModulesCount === 2) return 'Mchambuzi wa Kweli';
    return 'Balozi wa Kristo';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Picha ni kubwa sana. Tafadhali tumia picha chini ya 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (!base64 || base64.length > MAX_PROFILE_PIC_STORAGE_LENGTH) {
          alert("Picha haikuhifadhiwa kwa sababu ni kubwa sana kwa simu nyingi. Tumia picha ndogo.");
          safeRemoveStorageItem('gc365_profile_pic');
          setProfilePic('');
          return;
        }
        setProfilePic(base64);
        localStorage.setItem('gc365_profile_pic', base64);
        window.dispatchEvent(new Event('gc365_profile_pic_updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureClick = (feature: string) => {
    if (feature === 'Faragha') {
      alert("Mpangilio wa faragha: Data zako zimesimbwa. Unaweza kufuta historia yako ya masomo hapa.");
    } else if (feature === 'Ulinzi') {
      alert("Hali ya ulinzi: Akaunti yako imelindwa na itifaki ya GC-Shield. Hakuna uingiaji mgeni uliogundulika.");
    } else if (feature === 'Msaada') {
      const email = supportEmail || "support@godcares365.org";
      window.location.href = `mailto:${email}?subject=Msaada wa Akaunti`;
    } else if (feature === 'Mipangilio') {
      alert("Mipangilio ya mfumo: Unaweza kubadili lugha na mandhari kupitia sehemu ya juu ya ukurasa.");
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl animate-fade-in" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-xl overflow-hidden border border-white/5 shadow-2xl animate-scale-up">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 pb-4 relative border-b border-white/5">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-lg">
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 group">
              <div className="w-20 h-20 p-0.5 rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-600 shadow-lg">
                <div className="w-full h-full rounded-full bg-[#020617] overflow-hidden relative">
                  <img 
                    src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=020617&color=eab308&bold=true&size=128`} 
                    className="w-full h-full object-cover" 
                    alt="Wasifu wa mtumiaji"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Camera size={20} />
                  </button>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <div className="absolute -bottom-1 -right-1 bg-gold-500 text-slate-950 p-1 rounded-full border-2 border-[#0f172a] shadow-sm">
                <ShieldCheck size={12} />
              </div>
            </div>
            
            <div className="space-y-0.5">
              <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{displayName}</h3>
              <p className="text-xs font-bold text-gold-500 uppercase tracking-[0.14em] mb-1 italic">{getUserTitle()}</p>
              <div className="flex gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-black uppercase tracking-[0.14em] border border-blue-500/20">Akaunti Hai</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.14em] mb-1">Pointi (KP)</p>
              <p className="text-xs font-bold text-white">{kpPoints.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.14em] mb-1">Mfululizo</p>
              <p className="text-sm font-bold text-white">{streak} <span className="text-[10px] text-orange-500">Siku</span></p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.14em] mb-1">Ngazi</p>
              <p className="text-sm font-bold text-white">{completedModulesCount + 1}</p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.14em]">Maendeleo ya Masomo</h4>
              <span className="text-xs font-black text-gold-500">{completedModulesCount}/3 Moduli</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gold-600 to-white transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                style={{ width: `${(completedModulesCount / 3) * 100}%` }}
              ></div>
            </div>
            <div className="flex gap-2 pt-1 overflow-x-auto scrollbar-hide">
              {[<Medal size={14}/>, <Trophy size={14}/>, <Star size={14}/>, <Award size={14}/>].map((icon, i) => (
                <div key={i} className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${i < completedModulesCount ? 'bg-gold-500/10 border-gold-500/20 text-gold-500' : 'bg-white/5 border-white/5 text-slate-700'}`}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Faragha', id: 'Faragha', icon: <Shield size={14} />, color: 'text-blue-400' },
              { label: 'Ulinzi', id: 'Ulinzi', icon: <Archive size={14} />, color: 'text-green-400' },
              { label: 'Msaada', id: 'Msaada', icon: <MessageSquare size={14} />, color: 'text-purple-400' },
              { label: 'Mipangilio', id: 'Mipangilio', icon: <Settings size={14} />, color: 'text-slate-400' }
            ].map((item, i) => (
              <button key={i} onClick={() => handleFeatureClick(item.id)} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-transparent hover:border-gold-500/30 hover:bg-white/[0.08] transition-all group">
                <div className={`${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.14em]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 pt-2 flex flex-col gap-3 bg-black/20 border-t border-white/5">
          <button onClick={onLogout} className="w-full py-4 bg-red-500/10 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 border border-red-500/20 flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5">
            <LogOut size={16} /> Toka Kwenye Akaunti
          </button>
        </div>
      </div>
    </div>
  );
};

const getIcon = (id: StageId) => {
  switch (id) {
    case StageId.HOME: return <Home size={20} />;
    case StageId.BLOG: return <BookOpen size={20} />;
    case StageId.BIBLE_STUDY: return <BookCheck size={20} />;
    case StageId.TIMELINE: return <Clock size={20} />;
    case StageId.SHOP: return <ShoppingBag size={20} />;
    case StageId.LIBRARY: return <Library size={20} />;
    case StageId.EVENTS: return <Calendar size={20} />;
    case StageId.NEWS: return <Newspaper size={20} />;
    case StageId.PRAYERS: return <Heart size={20} />;
    case StageId.DONATE: return <Gift size={20} />;
    case StageId.ABOUT: return <Info size={20} />;
    case StageId.MEDIA: return <PlayCircle size={20} />;
    case StageId.TESTIMONIES: return <MessageSquareQuote size={20} />;
    case StageId.EVIDENCE: return <Microscope size={20} />;
    case StageId.DECEPTION_VAULT: return <ShieldAlert size={20} />;
    case StageId.QUESTION_VAULT: return <MessageSquare size={20} />;
    case StageId.FAITH_BUILDER: return <BookOpen size={20} />;
    default: return <BookCheck size={20} />;
  }
};

interface TileProps {
  stage: StageConfig;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

const Tile: React.FC<TileProps> = ({ stage, isActive, onClick, index }) => {
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 45}ms` }}
      className={`group relative flex h-[68px] w-full items-center gap-3.5 rounded-2xl border px-4 text-left transition-all duration-300 animate-morph-in shadow-sm ${
        isActive
          ? 'border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-[color:var(--accent-ink)] shadow-[0_10px_24px_rgba(238,183,32,0.28)]'
          : 'border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-3)]'
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-black/10 text-[color:var(--accent-ink)]'
          : 'bg-[color:var(--surface-3)] text-[color:var(--text-primary)] group-hover:bg-[color:var(--accent-soft)] group-hover:text-[color:var(--accent-strong)]'
      }`}>
        {getIcon(stage.id)}
      </div>

      <h3 className={`min-w-0 flex-1 truncate text-[13.5px] font-bold leading-tight transition-colors ${
        isActive ? '' : 'group-hover:text-[color:var(--accent-strong)]'
      }`}>
        {toSentenceCase(stage.title)}
      </h3>

      <ChevronRight
        size={15}
        className={`shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-60 ${isActive ? 'translate-x-0 opacity-70' : ''}`}
      />
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentStage, 
  onStageChange, 
  stages, 
  isOpen,
  onClose,
  onLogout,
  user,
  onShowProfile,
  onShowAuth,
  logoSrc,
  siteSettings
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [profilePic, setProfilePic] = useState<string>(() => readProfilePicFromStorage());
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resolvedSettings = siteSettings || DEFAULT_SITE_SETTINGS;
  const resolvedLogoSrc = logoSrc || resolvedSettings.logo_url || `${import.meta.env.BASE_URL}Logo.png`;

  const handleMenuScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    setScrollProgress(scrollable > 0 ? Math.min(100, Math.max(0, (el.scrollTop / scrollable) * 100)) : 0);
  };

  useEffect(() => {
    const handleProfilePicSync = () => {
      setProfilePic(readProfilePicFromStorage());
    };
    window.addEventListener('storage', handleProfilePicSync);
    window.addEventListener('gc365_profile_pic_updated', handleProfilePicSync as EventListener);
    return () => {
      window.removeEventListener('storage', handleProfilePicSync);
      window.removeEventListener('gc365_profile_pic_updated', handleProfilePicSync as EventListener);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden'; 
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500); 
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const sections = [
    {
      title: "Menyu Kuu",
      ids: [StageId.HOME, StageId.MEDIA, StageId.BIBLE_STUDY, StageId.BLOG, StageId.SHOP, StageId.DONATE]
    },
    {
      title: "Zana za Kiroho",
      ids: [StageId.FAITH_BUILDER, StageId.TIMELINE, StageId.PRAYERS, StageId.LIBRARY]
    },
    {
      title: "Uchunguzi wa Kiungu",
      ids: [StageId.EVIDENCE, StageId.DECEPTION_VAULT, StageId.QUESTION_VAULT]
    },
    {
      title: "Taarifa na Jumuiya",
      ids: [StageId.EVENTS, StageId.NEWS, StageId.ABOUT, StageId.TESTIMONIES]
    }
  ];

  if (!isVisible && !isOpen) return null;

  const mainWebsiteUrl = normalizeOptionalUrl(resolvedSettings.website_main_url);
  const kidsWebsiteUrl = normalizeOptionalUrl(resolvedSettings.website_kids_url);
  const outreachWebsiteUrl = normalizeOptionalUrl(resolvedSettings.website_outreach_url);

  const externalWebsites = [
    {
      name: "PAMBANO KUU YESU ANASHINDA SHETANI ANASHINDWA",
      url: mainWebsiteUrl,
      desc: "Ushindi wa Milele",
      icon: <ShieldCheck size={18} className="text-gold-600 dark:text-gold-400" />
    },
    {
      name: "GODCARES 365 KIDS",
      url: kidsWebsiteUrl,
      desc: "Ukweli kwa Wadogo",
      icon: <Baby size={18} className="text-blue-600 dark:text-blue-300" />
    },
    {
      name: "GODCARES 365 OUTREACH",
      url: outreachWebsiteUrl,
      desc: "Huduma kwa Jamii",
      icon: <Users size={18} className="text-green-600 dark:text-green-400" />
    }
  ].filter((web) => web.url.length > 0);

  const displayName = normalizeDisplayName(user?.name);
  const displayFirstName = displayName.split(/\s+/)[0] || 'Mtumiaji';

  return (
    <div className={`fixed inset-0 z-[200] bg-[color:var(--page-bg)] flex flex-col transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative z-10 flex h-14 items-center justify-end border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] px-4 py-2 md:px-8">
        <div onClick={() => { onStageChange(StageId.HOME); onClose(); }} className="absolute left-1/2 -translate-x-1/2 flex items-center cursor-pointer group md:hidden">
           <img src={resolvedLogoSrc} alt={resolvedSettings.site_name} className="h-10 w-auto group-hover:scale-105 transition-transform" />
        </div>
        <button onClick={onClose} className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-3)] p-2 text-[color:var(--text-muted)] transition-all hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]">
          <X size={19} />
        </button>
        {/* Scroll progress: fills as the sections below are scrolled through */}
        <div
          className="absolute bottom-0 left-0 h-[3px] bg-[color:var(--accent)] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop-only logo panel: fixed in the viewport (never scrolls/moves), centered
          in the reserved left column between the header and footer bars. */}
      <div
        onClick={() => { onStageChange(StageId.HOME); onClose(); }}
        className="hidden cursor-pointer md:fixed md:left-0 md:top-14 md:bottom-20 md:z-20 md:flex md:w-52 md:items-center md:justify-center lg:w-64 2xl:w-72 group"
      >
        <img src={resolvedLogoSrc} alt={resolvedSettings.site_name} className="h-40 lg:h-52 w-auto group-hover:scale-105 transition-transform" />
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleMenuScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scrollbar-hide"
      >
        <div className="p-6 md:p-10 md:pl-56 lg:pl-72 2xl:pl-80 max-w-[1600px] animate-fade-in space-y-12">
          {/* Main Content Sections */}
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
                <h3 className="flex items-center gap-4 px-1 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--accent-strong)]">
                  <span>{section.title}</span>
                  <div className="h-px flex-1 bg-[color:var(--border-strong)]"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {isOpen && section.ids.map((id, idx) => {
                    const s = stages.find(st => st.id === id);
                    if (!s) return null;
                    return (
                      <Tile key={s.id} stage={s} isActive={currentStage === s.id} index={idx + (sIdx * 6)} onClick={() => { onStageChange(s.id); onClose(); }} />
                    );
                  })}
                </div>
            </div>
          ))}

          {/* OUR WEBSITES SECTION (only when at least one is configured in Site Settings) */}
          {externalWebsites.length > 0 && (
          <div className="space-y-6 pt-4 pb-12">
             <h3 className="flex items-center gap-4 px-1 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--accent-strong)]">
                 <span>Tovuti Zetu</span>
                <div className="h-px flex-1 bg-[color:var(--border-strong)]"></div>
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
                {externalWebsites.map((web, idx) => (
                  <a
                    key={idx}
                    href={web.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex min-h-[64px] items-center gap-3 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-3)]"
                  >
                    <div className="shrink-0 rounded-xl bg-[color:var(--surface-3)] p-2.5 text-[color:var(--text-primary)] transition-all group-hover:bg-[color:var(--accent-soft)] group-hover:text-[color:var(--accent-strong)]">
                       {web.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="line-clamp-2 text-xs font-black uppercase leading-tight tracking-tight text-[color:var(--text-primary)] transition-colors group-hover:text-[color:var(--accent-strong)]">
                          {web.name}
                       </h4>
                       <p className="mt-1 hidden truncate text-[11px] font-bold uppercase text-[color:var(--text-muted)] sm:block">
                          {web.desc}
                       </p>
                    </div>
                    <div className="shrink-0 text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--accent-strong)]">
                       <ExternalLink size={14} />
                    </div>
                  </a>
                ))}
             </div>
          </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 items-center justify-end border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] px-4 py-2.5 md:px-12 md:py-3">
        {user ? (
          <button onClick={onShowProfile} className="group flex items-center gap-2.5 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-3)] p-1 pr-3.5 shadow-sm transition-all hover:border-[color:var(--accent)]">
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-500 to-gold-700 flex items-center justify-center text-[#020617] shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                <img src={profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eab308&color=020617&bold=true`} className="w-full h-full object-cover" alt="" />
             </div>
             <div className="text-left pr-1.5">
               <p className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-tight text-[color:var(--text-primary)]">{displayFirstName}</p>
               <p className="text-[10px] font-black uppercase leading-none tracking-[0.14em] text-[color:var(--accent-strong)]">Akaunti</p>
             </div>
          </button>
        ) : (
          <button
            onClick={onShowAuth}
            className="group flex items-center gap-2.5 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-3)] p-1 pr-3.5 shadow-sm transition-all hover:border-[color:var(--accent)]"
          >
             <div className="w-9 h-9 rounded-full bg-[color:var(--surface-2)] flex items-center justify-center text-[color:var(--text-primary)] group-hover:text-[color:var(--accent-strong)] transition-colors shadow-sm">
                <User size={18} />
             </div>
             <div className="text-left pr-1.5">
               <p className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-tight text-[color:var(--text-primary)]">Mgeni</p>
               <p className="text-[10px] font-black uppercase leading-none tracking-[0.14em] text-[color:var(--accent-strong)]">Ingia Sasa</p>
             </div>
          </button>
        )}
      </div>

      <style>{`
        @keyframes morphIn {
          0% { opacity: 0; transform: scale(0.6) translateY(40px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .animate-morph-in { 
          animation: morphIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        @media (max-width: 767px), (prefers-reduced-motion: reduce) {
          .animate-morph-in { animation: none; }
        }
      `}</style>
    </div>
  );
};
