
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
  const [profilePic, setProfilePic] = useState<string>(localStorage.getItem('gc365_profile_pic') || '');
  
  const completedModulesCount = JSON.parse(localStorage.getItem('gc365_completed_modules') || '[]').length;
  const kpPoints = completedModulesCount * 1500;
  const streak = 12;

  const getUserTitle = () => {
    if (completedModulesCount === 0) return 'Mtafuta Ukweli';
    if (completedModulesCount === 1) return 'Mwanafunzi wa Unabii';
    if (completedModulesCount === 2) return 'Mchambuzi wa Kweli';
    return 'Balozi wa Kristo';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePic(base64);
        localStorage.setItem('gc365_profile_pic', base64);
        window.dispatchEvent(new Event('gc365_profile_pic_updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureClick = (feature: string) => {
    if (feature === 'Privacy') {
      alert("Mpangilio wa faragha: Data zako zimesimbwa. Unaweza kufuta historia yako ya masomo hapa.");
    } else if (feature === 'Security') {
      alert("Hali ya ulinzi: Akaunti yako imelindwa na itifaki ya GC-Shield. Hakuna uingiaji mgeni uliogundulika.");
    } else if (feature === 'Support') {
      const email = supportEmail || "support@godcares365.org";
      window.location.href = `mailto:${email}?subject=Msaada wa Akaunti`;
    } else if (feature === 'Settings') {
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
                    src={profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=020617&color=eab308&bold=true&size=128`} 
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
              <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{user.name}</h3>
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
              { label: 'Faragha', id: 'Privacy', icon: <Shield size={14} />, color: 'text-blue-400' },
              { label: 'Ulinzi', id: 'Security', icon: <Archive size={14} />, color: 'text-green-400' },
              { label: 'Msaada', id: 'Support', icon: <MessageSquare size={14} />, color: 'text-purple-400' },
              { label: 'Mipangilio', id: 'Settings', icon: <Settings size={14} />, color: 'text-slate-400' }
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
      style={{ animationDelay: `${index * 60}ms` }}
      className={`group relative flex h-[64px] w-full items-center justify-start gap-2 rounded-2xl border px-3.5 py-2 text-left transition-all duration-300 animate-morph-in shadow-sm sm:h-[108px] sm:flex-col sm:items-center sm:justify-center sm:gap-3 sm:px-4 sm:py-5 sm:text-center ${
        isActive 
          ? 'bg-gradient-to-br from-gold-200 to-gold-300 text-green-950 border-gold-500 shadow-[0_12px_22px_rgba(212,154,20,0.22)]'
          : 'bg-white/95 dark:bg-[color:var(--surface-3)]/88 border-green-200/80 dark:border-[color:var(--border-subtle)] hover:-translate-y-0.5 hover:border-gold-400/70 hover:bg-white'
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:h-12 sm:w-12 sm:rounded-2xl ${
         isActive
           ? 'bg-white/75 text-green-900 shadow-sm'
           : 'bg-green-100 text-green-700 dark:bg-green-900/25 dark:text-green-300 group-hover:bg-gold-100 group-hover:text-gold-700'
      }`}>
         {getIcon(stage.id)}
      </div>

      <div className="w-full min-w-0">
        <h3 className={`line-clamp-2 text-[15px] sm:text-xs font-black uppercase tracking-[0.04em] sm:tracking-[0.12em] leading-tight transition-colors ${
            isActive ? 'text-green-900' : 'text-slate-800 dark:text-slate-100 group-hover:text-gold-700 dark:group-hover:text-gold-300'
        }`}>
          {stage.title}
        </h3>
      </div>
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
  const [profilePic, setProfilePic] = useState<string>(localStorage.getItem('gc365_profile_pic') || '');
  const resolvedSettings = siteSettings || DEFAULT_SITE_SETTINGS;
  const resolvedLogoSrc = logoSrc || resolvedSettings.logo_url || `${import.meta.env.BASE_URL}Logo.png`;

  useEffect(() => {
    const handleProfilePicSync = () => {
      setProfilePic(localStorage.getItem('gc365_profile_pic') || '');
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

  if (!isVisible && !isOpen) return null;

  const sections = [
    {
      title: "Sehemu za Msingi",
      ids: [StageId.HOME, StageId.BLOG, StageId.ABOUT, StageId.BIBLE_STUDY, StageId.FAITH_BUILDER]
    },
    {
      title: "Uchunguzi wa Kiungu",
      ids: [StageId.TIMELINE, StageId.EVIDENCE, StageId.DECEPTION_VAULT, StageId.QUESTION_VAULT, StageId.LIBRARY]
    },
    {
      title: "Jumuiya ya Kimataifa",
      ids: [StageId.MEDIA, StageId.TESTIMONIES, StageId.PRAYERS, StageId.EVENTS, StageId.NEWS, StageId.SHOP, StageId.DONATE]
    }
  ];

  const externalWebsites = [
    {
      name: "PAMBANO KUU YESU ANASHINDA SHETANI ANASHINDWA",
      url: resolvedSettings.website_main_url,
      desc: "Ushindi wa Milele",
      icon: <ShieldCheck size={18} className="text-gold-600 dark:text-gold-400" />
    },
    {
      name: "GODCARES 365 KIDS",
      url: resolvedSettings.website_kids_url,
      desc: "Ukweli kwa Wadogo",
      icon: <Baby size={18} className="text-blue-600 dark:text-blue-300" />
    },
    {
      name: "GODCARES 365 OUTREACH",
      url: resolvedSettings.website_outreach_url,
      desc: "Huduma kwa Jamii",
      icon: <Users size={18} className="text-green-600 dark:text-green-400" />
    }
  ].filter((web) => Boolean(web.url && web.url.trim()));

  return (
    <div className={`fixed inset-0 z-[200] bg-[color:var(--surface-0)]/98 md:bg-[color:var(--surface-1)]/95 backdrop-blur-sm md:backdrop-blur-md flex flex-col transition-all duration-700 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative z-10 flex items-center justify-end px-4 py-2.5 md:p-6 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] backdrop-blur-md h-16 md:h-20">
        <div onClick={() => { onStageChange(StageId.HOME); onClose(); }} className="absolute left-1/2 -translate-x-1/2 flex items-center cursor-pointer group">
           <img src={resolvedLogoSrc} alt={resolvedSettings.site_name} className="h-14 md:h-20 w-auto group-hover:scale-105 transition-transform" />
        </div>
        <button onClick={onClose} className="p-2.5 md:p-3 bg-[color:var(--surface-3)] text-[color:var(--text-soft)] hover:text-[color:var(--accent-strong)] transition-all rounded-xl border border-[color:var(--border-subtle)] hover:border-[color:var(--accent)]/45">
          <X size={21} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scrollbar-hide">
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 animate-fade-in">
          {/* Main Content Sections */}
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
                <h3 className="text-sm sm:text-sm font-black text-green-700 dark:text-green-300 uppercase tracking-[0.1em] sm:tracking-[0.2em] px-1 flex items-center gap-4">
                  <span>{section.title}</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-green-400/70 dark:from-green-500/50 to-transparent"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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

          {/* OUR WEBSITES SECTION */}
          <div className="space-y-6 pt-4 pb-12">
             <h3 className="text-sm sm:text-sm font-black text-green-700 dark:text-green-300 uppercase tracking-[0.1em] sm:tracking-[0.2em] px-1 flex items-center gap-4">
                 <span>Tovuti Zetu</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-green-400/70 dark:from-green-500/50 to-transparent"></div>
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
                {externalWebsites.map((web, idx) => (
                  <a 
                    key={idx} 
                    href={web.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative flex min-h-[64px] items-center gap-3 p-3 bg-white/95 dark:bg-[color:var(--surface-3)]/80 border border-[color:var(--border-subtle)] rounded-2xl hover:border-green-500/55 hover:shadow-[0_14px_32px_rgba(47,104,51,0.16)] backdrop-blur-md transition-all duration-300"
                  >
                    <div className="p-2.5 bg-green-100/65 dark:bg-green-900/25 rounded-xl text-green-700 dark:text-green-300 group-hover:text-gold-700 dark:group-hover:text-gold-300 group-hover:bg-gold-100/80 dark:group-hover:bg-gold-900/25 transition-all shrink-0">
                       {web.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors line-clamp-2">
                          {web.name}
                       </h4>
                       <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1 truncate">
                          {web.desc}
                       </p>
                    </div>
                    <div className="text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors shrink-0">
                       <ExternalLink size={14} />
                    </div>
                  </a>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 md:px-12 md:py-5 border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] backdrop-blur-md flex justify-end items-center relative z-10 shrink-0">
        {user ? (
          <button onClick={onShowProfile} className="group flex items-center gap-2.5 bg-[color:var(--surface-3)] p-1 pr-3.5 rounded-full border border-[color:var(--border-subtle)] hover:border-gold-500 transition-all shadow-xl backdrop-blur-md">
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-500 to-gold-700 flex items-center justify-center text-[#020617] shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                <img src={profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=eab308&color=020617&bold=true`} className="w-full h-full object-cover" alt="" />
             </div>
             <div className="text-left pr-1.5">
               <p className="text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-tight leading-none mb-0.5">{user.name.split(' ')[0]}</p>
               <p className="text-[10px] font-black uppercase text-gold-500 tracking-[0.14em] leading-none">Akaunti</p>
             </div>
          </button>
        ) : (
          <button 
            onClick={onShowAuth}
            className="group flex items-center gap-2.5 bg-[color:var(--surface-3)] p-1 pr-3.5 rounded-full border border-[color:var(--border-subtle)] hover:border-gold-500 transition-all shadow-xl backdrop-blur-md"
          >
             <div className="w-9 h-9 rounded-full bg-green-100/75 dark:bg-green-900/25 flex items-center justify-center text-green-700 dark:text-green-300 group-hover:text-gold-500 transition-colors shadow-lg">
                <User size={18} />
             </div>
             <div className="text-left pr-1.5">
               <p className="text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-tight leading-none mb-0.5">Mgeni</p>
               <p className="text-[10px] font-black uppercase text-gold-500 tracking-[0.14em] leading-none">Ingia Sasa</p>
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
