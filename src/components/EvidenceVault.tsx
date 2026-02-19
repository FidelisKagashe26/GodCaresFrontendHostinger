
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Microscope, Search, ArrowLeft, ShieldCheck, BookOpen, 
  ZoomIn, ZoomOut, RotateCcw, Download, Scan, Fingerprint, 
  Activity, Globe, Frame, Lock, CheckCircle2, FileText, 
  Scale, Book, AlertTriangle, Eye, X, ChevronRight, GraduationCap,
  Move, Minimize, Maximize, UserCheck, Quote, User, Crosshair,
  Folder, FolderOpen, ChevronLeft, Play, Pause, Grid, Layers, PlayCircle
} from 'lucide-react';
import { EvidenceItemApi, getEvidenceItems } from '../services/vaultService';

// --- TYPES ---

type MediaType = 'PDF' | 'Audio' | 'Video' | 'Image';

interface Annotation {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string; // Context text
}

interface EvidenceMetadata {
  page: number;
  totalPages: number;
  annotations: Annotation[]; 
  confidence: number;
  extractionMethod: string;
  sourceHash: string;
  scanDate: string;
  originalLanguage: string;
}

interface AuthorProfile {
  name: string;
  role: string;
  authority: string; 
  organization: string;
  image: string;
  bio?: string;
}

interface EvidenceItem {
  id: string;
  category: string;
  subCategory: string; // Grouping within the folder
  hint: string; // Teaser text shown on hover
  type: MediaType;
  title: string;
  swahiliTitle: string;
  description: string;
  fact: string;
  sourceBook: string;
  publisher: string;
  author: AuthorProfile;
  yearPublished: string;
  translations: {
    original: string;
    en: string;
    sw: string;
  };
  heroImage: string; 
  evidenceData: EvidenceMetadata;
  videoUrl?: string; // Added optional video URL
}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.bmp']);
const PDF_EXTENSIONS = new Set(['.pdf']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mkv']);

const getFileExtension = (value: string): string => {
  const raw = (value || '').trim();
  if (!raw) {
    return '';
  }
  const [withoutHash] = raw.split('#');
  const [withoutQuery] = withoutHash.split('?');
  const idx = withoutQuery.lastIndexOf('.');
  return idx >= 0 ? withoutQuery.slice(idx).toLowerCase() : '';
};

const isPdfSource = (url: string, type: MediaType): boolean => type === 'PDF' || PDF_EXTENSIONS.has(getFileExtension(url));
const isImageSource = (url: string, type: MediaType): boolean => type === 'Image' || IMAGE_EXTENSIONS.has(getFileExtension(url));
const isVideoSource = (url: string, type: MediaType): boolean => type === 'Video' || VIDEO_EXTENSIONS.has(getFileExtension(url));
const isAudioSource = (url: string, type: MediaType): boolean => type === 'Audio' || AUDIO_EXTENSIONS.has(getFileExtension(url));

const normalizeVideoUrl = (value: string): string => {
  const raw = (value || '').trim();
  if (!raw) {
    return '';
  }
  if (raw.includes('youtube.com/watch?v=')) {
    const id = raw.split('v=')[1]?.split('&')[0];
    return id ? `https://www.youtube.com/embed/${id}` : raw;
  }
  if (raw.includes('youtu.be/')) {
    const id = raw.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : raw;
  }
  return raw;
};

const isIframeVideoSource = (value: string): boolean => {
  const normalized = normalizeVideoUrl(value);
  return /youtube\.com\/embed|player\.vimeo\.com|drive\.google\.com\/file/i.test(normalized);
};

const withAutoplay = (value: string): string => {
  const normalized = normalizeVideoUrl(value);
  if (!normalized) {
    return '';
  }
  const separator = normalized.includes('?') ? '&' : '?';
  return `${normalized}${separator}autoplay=1`;
};

const clampPage = (page: number, totalPages: number): number => {
  const parsed = Number.isFinite(page) ? Math.floor(page) : 1;
  if (parsed < 1) {
    return 1;
  }
  if (totalPages > 0 && parsed > totalPages) {
    return totalPages;
  }
  return parsed;
};

const buildPdfPageUrl = (url: string, page: number): string => {
  if (!url) {
    return '';
  }
  const base = url.split('#')[0];
  return `${base}#page=${Math.max(1, Math.floor(page))}&view=FitH`;
};

const getMediaBadge = (item: EvidenceItem): { icon: JSX.Element; label: string } => {
  if (isPdfSource(item.heroImage, item.type)) {
    return { icon: <FileText size={22} />, label: 'PDF Evidence' };
  }
  if (isVideoSource(item.heroImage, item.type)) {
    return { icon: <PlayCircle size={22} />, label: 'Video Evidence' };
  }
  if (isAudioSource(item.heroImage, item.type)) {
    return { icon: <Activity size={22} />, label: 'Audio Evidence' };
  }
  return { icon: <Eye size={22} />, label: 'Image Evidence' };
};

const renderMediaCover = (item: EvidenceItem, className: string) => {
  if (isImageSource(item.heroImage, item.type)) {
    return <img src={item.heroImage} className={className} alt={item.title} />;
  }

  const badge = getMediaBadge(item);
  return (
    <div className={`${className} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center gap-3 text-slate-200`}>
      <div className="w-12 h-12 rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-400 flex items-center justify-center">
        {badge.icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-200">{badge.label}</p>
    </div>
  );
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');

// --- MOCK DATA ---

const VAULT_ITEMS: EvidenceItem[] = [
  {
    id: 'convert-catechism',
    category: 'Sabato',
    subCategory: 'Catholic Confessions',
    hint: 'Sabato Ilibadilishwa',
    type: 'PDF',
    title: "The Convertâ€™s Catechism",
    swahiliTitle: 'Katekisimu ya Mafundisho',
    description: 'Kukiri rasmi kuhusu mabadiliko ya Sabato kutoka Jumamosi kwenda Jumapili.',
    fact: "Kanisa linakiri kuwa Jumamosi ndiyo Sabato.",
    sourceBook: "The Convert's Catechism of Catholic Doctrine",
    publisher: "B. Herder Book Co.",
    author: {
      name: "Rev. Peter Geiermann",
      role: "Priest & Author",
      authority: "Imprimatur: Sept 16, 1946",
      organization: "C.SS.R. (Redemptorist)",
      image: "https://ui-avatars.com/api/?name=Peter+Geiermann&background=0f172a&color=eab308",
      bio: "Padre Geiermann alikuwa mwanatheolojia mashuhuri wa shirika la Redemptorist aliyeandika kwa uwazi kuhusu mafundisho ya Kanisa Katoliki katika karne ya 20."
    },
    yearPublished: "1946 Edition",
    translations: {
      original: "Q. Which is the Sabbath day?\nA. Saturday is the Sabbath day.\nQ. Why do we observe Sunday?\nA. Because the Catholic Church transferred the solemnity...",
      en: "Q. Which is the Sabbath day?\nA. Saturday is the Sabbath day.\nQ. Why do we observe Sunday?\nA. Because the Catholic Church transferred the solemnity from Saturday to Sunday.",
      sw: "S. Siku ya Sabato ni ipi?\nJ. Jumamosi ndiyo siku ya Sabato.\nS. Kwa nini tunaadhimisha Jumapili?\nJ. Kwa sababu Kanisa Katoliki lilihamisha utakatifu kutoka Jumamosi kwenda Jumapili."
    },
    heroImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1200",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    evidenceData: {
      page: 50,
      totalPages: 145,
      annotations: [
        { x: 10, y: 25, w: 80, h: 10, text: "Swali: Siku ya Sabato ni ipi?" },
        { x: 10, y: 38, w: 60, h: 10, text: "Jibu: Jumamosi ndiyo siku ya Sabato." },
        { x: 10, y: 52, w: 80, h: 10, text: "Swali: Kwanini tunaadhimisha Jumapili?" },
        { x: 10, y: 65, w: 85, h: 20, text: "Kukiri: Kanisa lilihamisha utakatifu." }
      ],
      confidence: 0.99,
      extractionMethod: "OCR + Manual Verification",
      sourceHash: "a1b2c3d4-verified-ledger",
      scanDate: "2023-10-15",
      originalLanguage: "English"
    }
  },
  {
    id: 'catholic-priest',
    category: 'Makufuru ya Papa',
    subCategory: 'Priestly Authority',
    hint: 'Kasisi ni Mungu?',
    type: 'PDF',
    title: "The Catholic Priest",
    swahiliTitle: 'Kasisi wa Katoliki',
    description: 'Nyaraka inayoelezea mamlaka makubwa ya makasisi.',
    fact: "Inafundisha kuwa kasisi ana nguvu ya kuwaokoa watu.",
    sourceBook: "The Catholic Priest",
    publisher: "Kreuzer Brothers",
    author: {
      name: "Michael MÃ¼ller",
      role: "Redemptorist Priest",
      authority: "Ecclesiastical Approval",
      organization: "C.SS.R.",
      image: "https://ui-avatars.com/api/?name=Michael+Muller&background=0f172a&color=eab308",
      bio: "Mwandishi mashuhuri aliyesisitiza hadhi na nguvu ya ukasisi katika karne ya 19, akidai kasisi ana mamlaka sawa na Mungu katika kusamehe dhambi."
    },
    yearPublished: "1876",
    translations: {
      original: "God himself is obliged to abide by the judgment of his priests, and either not to forgive or to forgive.",
      en: "God himself is obliged to abide by the judgment of his priests, and either not to forgive or to forgive.",
      sw: "Mungu mwenyewe analazimika kufuata hukumu ya makasisi wake, kusamehe au kutosamehe."
    },
    heroImage: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&q=80&w=1200",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    evidenceData: {
      page: 78,
      totalPages: 450,
      annotations: [
        { x: 15, y: 40, w: 70, h: 10, text: "Mungu analazimika kufuata hukumu ya makasisi" },
        { x: 15, y: 55, w: 60, h: 15, text: "Nguvu ya kusamehe dhambi" }
      ],
      confidence: 0.98,
      extractionMethod: "Archival Scan Analysis",
      sourceHash: "f9e8d7c6-verified-ledger",
      scanDate: "2023-09-22",
      originalLanguage: "English"
    }
  },
  {
    id: 'constantine-law',
    category: 'Upagani wa Ukatoliki',
    subCategory: 'Roman Law',
    hint: 'Ibada ya Jua',
    type: 'Image',
    title: "Edict of Constantine",
    swahiliTitle: 'Amri ya Konstantino',
    description: 'Sheria ya kwanza ya kiraia inayolazimisha mapumziko siku ya Jumapili.',
    fact: "Jumapili iliitwa 'Siku ya Jua yenye kuheshimika' (Venerable Day of the Sun).",
    sourceBook: "Codex Justinianus",
    publisher: "Roman Empire Archives",
    author: {
      name: "Emperor Constantine I",
      role: "Roman Emperor",
      authority: "Pontifex Maximus",
      organization: "Roman Empire",
      image: "https://ui-avatars.com/api/?name=Constantine+I&background=581c87&color=eab308",
      bio: "Mfalme wa kwanza wa Kirumi kukubali Ukristo, ambaye alichanganya ibada za kipagani za jua na Ukristo ili kuleta umoja katika himaya yake."
    },
    yearPublished: "321 AD",
    translations: {
      original: "On the venerable Day of the Sun let the magistrates and people residing in cities rest, and let all workshops be closed.",
      en: "On the venerable Day of the Sun let the magistrates and people residing in cities rest, and let all workshops be closed.",
      sw: "Katika Siku ya Jua yenye kuheshimika, mahakimu na watu waishio mijini na wapumzike, na karakana zote zifungwe."
    },
    heroImage: "https://images.unsplash.com/photo-1555462542-a72a7c47f722?auto=format&fit=crop&q=80&w=1200",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    evidenceData: {
      page: 1,
      totalPages: 12,
      annotations: [
        { x: 10, y: 20, w: 80, h: 20, text: "Venerable Day of the Sun (Siku ya Jua)" },
        { x: 10, y: 45, w: 80, h: 20, text: "Amri ya kupumzika kwa mahakimu" }
      ],
      confidence: 0.99,
      extractionMethod: "Historical Text Analysis",
      sourceHash: "codex-justinianus-lib3-tit12",
      scanDate: "2023-12-01",
      originalLanguage: "Latin"
    }
  },
  {
    id: 'council-laodicea',
    category: 'Sabato',
    subCategory: 'Church Councils',
    hint: 'Laana ya Sabato',
    type: 'PDF',
    title: "Synod of Laodicea",
    swahiliTitle: 'Mtaguso wa Laodikia',
    description: 'Kanisa lilikataza Wakristo kutunza Sabato ya Biblia (Jumamosi) na kuamuru wafanye kazi siku hiyo.',
    fact: "Utunzaji wa Sabato uliitwa 'Uyahudi' na kulaaniwa.",
    sourceBook: "Nicene and Post-Nicene Fathers",
    publisher: "Catholic Church Councils",
    author: {
      name: "Regional Bishops",
      role: "Ecclesiastical Council",
      authority: "Canon Law 29",
      organization: "Early Church",
      image: "https://ui-avatars.com/api/?name=Council+Laodicea&background=0f172a&color=eab308",
      bio: "Mkutano wa maaskofu wa eneo la Phrygia uliofanyika ili kuweka taratibu za kanisa, ambapo walipiga marufuku utunzaji wa Sabato ya kibiblia."
    },
    yearPublished: "c. 364 AD",
    translations: {
      original: "Christians must not judaize by resting on the Sabbath, but must work on that day, rather honouring the Lord's Day; and, if they can, resting then as Christians. But if any shall be found to be judaizers, let them be anathema from Christ.",
      en: "Christians must not judaize by resting on the Sabbath, but must work on that day... But if any shall be found to be judaizers, let them be anathema from Christ.",
      sw: "Wakristo hawapaswi 'kufanya Uyahudi' kwa kupumzika siku ya Sabato, bali lazima wafanye kazi siku hiyo... Lakini yeyote atakayepatikana akifanya Uyahudi (kutunza Sabato), na alaaniwe mbali na Kristo."
    },
    heroImage: "https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&q=80&w=1200",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    evidenceData: {
      page: 29,
      totalPages: 60,
      annotations: [
        { x: 15, y: 35, w: 70, h: 10, text: "Marufuku kupumzika Sabato" },
        { x: 15, y: 50, w: 70, h: 15, text: "Tishio la laana (Anathema)" }
      ],
      confidence: 0.98,
      extractionMethod: "Archive Scan",
      sourceHash: "laodicea-canon-29",
      scanDate: "2024-01-15",
      originalLanguage: "Greek/Latin"
    }
  },
  {
    id: 'cyrus-cylinder',
    category: 'Historia ya Kanisa',
    subCategory: 'Archaeology',
    hint: 'Unabii wa Koreshi',
    type: 'Image',
    title: "Cyrus Cylinder",
    swahiliTitle: 'Silinda ya Koreshi',
    description: 'Ushahidi wa kiakiolojia unaothibitisha amri ya Mfalme Koreshi kuruhusu Wayahudi kurudi Yerusalemu.',
    fact: "Inathibitisha simulizi la Ezra 1:1-4 na utabiri wa Isaya kuhusu Koreshi.",
    sourceBook: "British Museum Archives",
    publisher: "British Museum",
    author: {
      name: "King Cyrus II",
      role: "King of Persia",
      authority: "Royal Decree",
      organization: "Achaemenid Empire",
      image: "https://ui-avatars.com/api/?name=Cyrus+The+Great&background=b45309&color=fff",
      bio: "Mfalme wa Uajemi aliyetabiriwa na Isaya miaka 150 kabla ya kuzaliwa kwake, ambaye alishinda Babeli na kuwaruhusu watu wa Mungu kurudi."
    },
    yearPublished: "539 BC",
    translations: {
      original: "...I returned to [these] sacred cities on the other side of the Tigris, the sanctuaries of which have been ruins for a long time... I (also) gathered all their (former) inhabitants and returned (to them) their habitations.",
      en: "I returned to these sacred cities... I gathered all their inhabitants and returned to them their habitations.",
      sw: "...Nilirudisha kwenye miji hii mitakatifu upande wa pili wa Tigris... sanamu zilizokuwa magofu... Nilikusanya wenyeji wao wote na kuwarudishia makazi yao."
    },
    heroImage: "https://images.unsplash.com/photo-1599596378252-474026337f71?auto=format&fit=crop&q=80&w=1200",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    evidenceData: {
      page: 1,
      totalPages: 1,
      annotations: [
        { x: 10, y: 20, w: 80, h: 30, text: "Maandishi ya Kurejesha Watu" },
        { x: 20, y: 60, w: 60, h: 20, text: "Jina la Mfalme Koreshi" }
      ],
      confidence: 0.99,
      extractionMethod: "3D Scan & Translation",
      sourceHash: "cyrus-cylinder-bm-90920",
      scanDate: "1879 (Discovered)",
      originalLanguage: "Akkadian Cuneiform"
    }
  }
];

// --- SUB-COMPONENTS ---

// 1. EVIDENCE SUMMARY MODAL (Intermediate Step)
const EvidenceSummary: React.FC<{ 
  item: EvidenceItem; 
  onClose: () => void; 
  onPreview: () => void; 
  onAuthority: () => void; 
}> = ({ item, onClose, onPreview, onAuthority }) => {
  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-full transition-all z-50">
          <X size={20} />
        </button>

        {/* Left: Image Context */}
        <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-black overflow-hidden group">
          {renderMediaCover(item, 'w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700')}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500 text-black rounded text-[9px] font-black uppercase tracking-widest mb-3">
               <Fingerprint size={12} /> ID: {item.id.toUpperCase()}
             </div>
             <h2 className="text-2xl font-black text-white uppercase italic leading-none">{item.title}</h2>
          </div>
        </div>

        {/* Right: Content & Actions */}
        <div className="flex-1 p-8 md:p-12 flex flex-col">
           <div className="space-y-6 flex-1">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                   <Quote size={14} className="text-gold-500" /> Nukuu Halisi (Quote)
                 </h3>
                 <div className="pl-4 border-l-4 border-gold-500/30">
                    <p className="text-lg font-serif text-white italic leading-relaxed">
                       "{item.translations.original}"
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-widest text-right">
                       â€” {item.sourceBook}, Pg. {item.evidenceData.page}
                    </p>
                 </div>
              </div>

              <div className="space-y-3 pt-2">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                   <Globe size={14} className="text-blue-500" /> Tafsiri ya Kiswahili
                 </h3>
                 <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">
                       "{item.translations.sw}"
                    </p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
              <button 
                onClick={onPreview}
                className="py-4 bg-gold-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg group"
              >
                 <Scan size={16} className="group-hover:scale-110 transition-transform"/> Kagua Hati
              </button>
              <button 
                onClick={onAuthority}
                className="py-4 bg-white/5 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
              >
                 <UserCheck size={16} className="text-blue-400 group-hover:scale-110 transition-transform"/> Mamlaka
              </button>
           </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

// 2. AUTHORITY PROFILE VIEW
const AuthorityProfile: React.FC<{ item: EvidenceItem; onBack: () => void; onClose: () => void }> = ({ item, onBack, onClose }) => {
  return createPortal(
    <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-xl animate-fade-in flex items-center justify-center p-4 font-sans">
       <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="h-40 bg-slate-900 relative shrink-0">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-red-500/20 text-white hover:text-red-500 rounded-full transition-all"><X size={20}/></button>
             <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-white/10 text-white rounded-full transition-all flex items-center gap-2 px-4 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> <span className="text-[10px] font-black uppercase">Rudi Nyuma</span>
             </button>
          </div>

          <div className="px-8 md:px-12 pb-12 flex-1 overflow-y-auto scrollbar-hide -mt-16 relative z-10">
             <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-32 h-32 rounded-full border-4 border-[#0a0a0a] shadow-xl overflow-hidden bg-slate-800">
                   <img src={item.author.image} className="w-full h-full object-cover" alt={item.author.name} />
                </div>
                
                <div className="space-y-2">
                   <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{item.author.name}</h2>
                   <p className="text-gold-500 font-bold text-xs uppercase tracking-widest">{item.author.role}</p>
                   <div className="inline-block px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-400 font-mono border border-white/5">
                      {item.author.organization}
                   </div>
                </div>

                <div className="w-full h-px bg-white/10"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Scale size={14} /> Mamlaka ya Kikanisa
                      </h4>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                         <p className="text-sm font-serif italic text-slate-300">"{item.author.authority}"</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Book size={14} /> Chanzo cha Hati
                      </h4>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                         <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Kitabu:</span>
                            <span className="text-white font-bold">{item.sourceBook}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Mchapishaji:</span>
                            <span className="text-white">{item.publisher}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Mwaka:</span>
                            <span className="text-white">{item.yearPublished}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="w-full space-y-4 text-left">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Wasifu / Muktadha</h4>
                   <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      {item.author.bio || "Wasifu haupatikani kwa sasa."}
                   </p>
                </div>
             </div>
          </div>
       </div>
    </div>,
    document.body
  );
};

// 3. DOCUMENT PREVIEW (The Forensic Viewer)
const DocumentPreview: React.FC<{ item: EvidenceItem; onBack: () => void; onClose: () => void }> = ({ item, onBack, onClose }) => {
  const primaryEvidenceUrl = item.type === 'Video' ? (item.videoUrl || item.heroImage || '') : (item.heroImage || '');
  const normalizedPrimaryVideoUrl = normalizeVideoUrl(primaryEvidenceUrl);
  const normalizedVideoUrl = normalizeVideoUrl(item.videoUrl || '');

  const isPdfDocument = isPdfSource(primaryEvidenceUrl, item.type);
  const isImageDocument = isImageSource(primaryEvidenceUrl, item.type);
  const isVideoDocument = isVideoSource(primaryEvidenceUrl, item.type);
  const isAudioDocument = isAudioSource(primaryEvidenceUrl, item.type);

  const hasSeparateAnalysisVideo = Boolean(normalizedVideoUrl) && normalizedVideoUrl !== normalizedPrimaryVideoUrl;
  const hasAnnotations = Array.isArray(item.evidenceData.annotations) && item.evidenceData.annotations.length > 0;
  const canImageForensics = isImageDocument && hasAnnotations;

  const citedPage = Math.max(1, Math.floor(Number(item.evidenceData.page || 1)));
  const configuredTotalPages = Math.max(0, Math.floor(Number(item.evidenceData.totalPages || 0)));
  const totalPages = configuredTotalPages > 0 ? Math.max(configuredTotalPages, citedPage) : 0;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState<'provenance' | 'navigating' | 'verified'>('provenance');
  const [showHighlight, setShowHighlight] = useState(true);
  const [activeAnnotationIndex, setActiveAnnotationIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [pdfPage, setPdfPage] = useState(citedPage);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const safePdfPage = clampPage(pdfPage, totalPages);
  const pdfViewerUrl = isPdfDocument ? buildPdfPageUrl(primaryEvidenceUrl, safePdfPage) : '';

  const fallbackQuote =
    (item.translations?.original || item.translations?.sw || item.description || item.fact || '').trim();
  const activeAnnotation = hasAnnotations
    ? item.evidenceData.annotations[activeAnnotationIndex]
    : { x: 0, y: 0, w: 0, h: 0, text: fallbackQuote || 'Hakuna nukuu iliyowekwa.' };
  const quoteText = (activeAnnotation?.text || fallbackQuote || 'Hakuna nukuu iliyowekwa bado.').trim();

  const autoZoomToEvidence = (index: number) => {
    if (!containerRef.current || !canImageForensics) return;

    const targetAnnotation = item.evidenceData.annotations[index];
    if (!targetAnnotation) return;

    const { w, x, y, h } = targetAnnotation;
    const paddingFactor = 0.6;
    const targetScale = (100 / Math.max(w, 1)) * paddingFactor;
    const safeScale = Math.min(Math.max(targetScale, 1.5), 3.5);

    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;

    const offsetX = ((50 - centerX) / 100) * containerW * safeScale;
    const offsetY = ((50 - centerY) / 100) * containerH * safeScale;

    setScale(safeScale);
    setPosition({ x: offsetX, y: offsetY });
  };

  const nextAnnotation = () => {
    if (!hasAnnotations) return;
    setActiveAnnotationIndex((prev) => (prev + 1) % item.evidenceData.annotations.length);
  };

  const prevAnnotation = () => {
    if (!hasAnnotations) return;
    setActiveAnnotationIndex((prev) => (prev - 1 + item.evidenceData.annotations.length) % item.evidenceData.annotations.length);
  };

  const handleManualNavigation = (direction: 'next' | 'prev') => {
    setIsAutoPlaying(false);
    if (isPdfDocument) {
      const delta = direction === 'next' ? 1 : -1;
      setPdfPage((prev) => clampPage(prev + delta, totalPages));
      return;
    }
    if (direction === 'next') nextAnnotation();
    else prevAnnotation();
  };

  const handleReset = () => {
    setIsAutoPlaying(false);
    if (isPdfDocument) {
      setPdfPage(citedPage);
      return;
    }
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setStage('verified');
  };

  const handleManualZoom = (delta: number) => {
    if (!isImageDocument) return;
    setIsAutoPlaying(false);
    setScale((value) => Math.min(Math.max(value + delta, 1), 6));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!isImageDocument || isPdfDocument || isVideoDocument || isAudioDocument) return;
    setIsDragging(true);
    setIsAutoPlaying(false);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isImageDocument) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const onMouseUp = () => setIsDragging(false);

  const handleJumpToCitationPage = () => {
    setIsAutoPlaying(false);
    setPdfPage(citedPage);
  };

  const handleDownload = (mode: 'full' | 'page' = 'full') => {
    if (mode === 'page' && isPdfDocument) {
      const endpoint = `${API_BASE_URL}/api/evidence-vault/${encodeURIComponent(item.id)}/page-pdf/?page=${safePdfPage}`;
      const link = document.createElement('a');
      link.href = endpoint;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const source = (primaryEvidenceUrl || normalizedVideoUrl || '').split('#')[0];
    if (!source) return;

    const ext = getFileExtension(source) || (isPdfDocument ? '.pdf' : '.jpg');
    const link = document.createElement('a');
    link.href = source;
    link.download = `${item.id}-evidence${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    setPdfPage((prev) => clampPage(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (stage !== 'provenance') {
      return;
    }

    let verifyTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => {
      if (canImageForensics) {
        setStage('navigating');
        autoZoomToEvidence(0);
        verifyTimer = setTimeout(() => setStage('verified'), 900);
      } else {
        setStage('verified');
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (verifyTimer) clearTimeout(verifyTimer);
    };
  }, [stage, canImageForensics]);

  useEffect(() => {
    if (!(stage === 'verified' && canImageForensics && item.evidenceData.annotations.length > 1 && isAutoPlaying && !showVideo)) {
      return;
    }
    const interval = setInterval(() => {
      nextAnnotation();
    }, 5000);
    return () => clearInterval(interval);
  }, [stage, canImageForensics, item.evidenceData.annotations.length, isAutoPlaying, showVideo]);

  useEffect(() => {
    if (stage === 'verified' && canImageForensics && !showVideo) {
      autoZoomToEvidence(activeAnnotationIndex);
    }
  }, [activeAnnotationIndex, stage, canImageForensics, showVideo]);

  return createPortal(
    <div className="fixed inset-0 z-[300] bg-[#050505] text-slate-200 flex flex-col animate-fade-in font-sans">
      <header className="h-16 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-4 md:px-6 shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-2 group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> <span className="text-[10px] font-black uppercase">Rudi</span>
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <h2 className="text-[10px] md:text-xs font-black text-gold-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} /> Forensic Preview
            </h2>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
              UKURASA {isPdfDocument ? safePdfPage : citedPage} • SCAN {item.evidenceData.scanDate || 'N/A'}
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Activity size={14} className={stage === 'verified' ? 'text-green-500' : 'text-gold-500 animate-pulse'} />
            STATUS: <span className={`font-bold ${stage === 'verified' ? 'text-green-500' : 'text-white'}`}>{stage.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Fingerprint size={14} />
            HASH: <span className="text-white">{(item.evidenceData.sourceHash || 'N/A').substring(0, 8)}...</span>
          </div>
        </div>

        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-lg transition-all">
          <X size={20} />
        </button>
      </header>

      <main
        className="flex-1 relative bg-[#020202] overflow-hidden flex items-center justify-center z-10"
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: isImageDocument && !isPdfDocument && !isVideoDocument && !isAudioDocument ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <div
          className="relative transition-transform duration-[400ms] ease-out origin-center will-change-transform"
          style={
            isImageDocument && !isPdfDocument && !isVideoDocument && !isAudioDocument
              ? {
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              : {
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
          }
        >
          {isPdfDocument && (
            <div className="w-full h-full flex items-center justify-center px-3 md:px-6 py-4 md:py-6">
              {pdfViewerUrl ? (
                <iframe
                  title={`${item.title} PDF Preview`}
                  src={pdfViewerUrl}
                  className="w-full max-w-6xl h-full rounded-xl border border-white/15 bg-[#0d1117] shadow-[0_0_80px_rgba(0,0,0,0.6)]"
                />
              ) : (
                <div className="w-full max-w-2xl p-8 rounded-xl border border-white/10 bg-white/5 text-center space-y-3">
                  <FileText size={24} className="mx-auto text-gold-400" />
                  <p className="text-sm text-slate-300">Hakuna PDF source iliyowekwa kwa item hii.</p>
                </div>
              )}
            </div>
          )}

          {isImageDocument && !isPdfDocument && !isVideoDocument && !isAudioDocument && (
            <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <img
                src={primaryEvidenceUrl}
                alt="Evidence Document"
                draggable={false}
                className={`max-w-none w-auto h-[60vh] md:h-[85vh] object-contain transition-all duration-700 ${stage === 'provenance' ? 'blur-sm opacity-50 grayscale' : 'blur-0 opacity-100 grayscale-0'}`}
              />

              {showHighlight && canImageForensics && stage !== 'provenance' && (
                <div
                  className="absolute border-2 border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-gold-500/10 mix-blend-overlay transition-all duration-1000 ease-in-out z-20"
                  style={{
                    top: `${activeAnnotation.y}%`,
                    left: `${activeAnnotation.x}%`,
                    width: `${activeAnnotation.w}%`,
                    height: `${activeAnnotation.h}%`,
                    opacity: stage === 'verified' ? 1 : 0,
                    transform: stage === 'verified' ? 'scale(1)' : 'scale(1.1)',
                  }}
                >
                  <div className="absolute -top-8 left-0 bg-black/90 backdrop-blur-md text-gold-400 text-[10px] font-semibold px-3 py-1.5 rounded-md flex items-center gap-2 shadow-lg border border-gold-500/30 whitespace-nowrap z-30 transition-all duration-300 transform -translate-y-2">
                    <Crosshair size={10} className="text-gold-500" />
                    {activeAnnotation.text || 'Verified Segment'}
                  </div>
                </div>
              )}
            </div>
          )}

          {isVideoDocument && !isPdfDocument && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="w-full max-w-6xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                {isIframeVideoSource(normalizedPrimaryVideoUrl) ? (
                  <iframe
                    src={normalizedPrimaryVideoUrl}
                    className="w-full h-full border-none"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video src={primaryEvidenceUrl} className="w-full h-full" controls />
                )}
              </div>
            </div>
          )}

          {isAudioDocument && !isPdfDocument && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0b1120] p-8 md:p-10 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 text-gold-400">
                  <Activity size={20} />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Audio Evidence</p>
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.description || 'Sikiliza ushahidi huu wa sauti moja kwa moja.'}</p>
                <audio src={primaryEvidenceUrl} controls className="w-full" />
              </div>
            </div>
          )}

          {!isPdfDocument && !isImageDocument && !isVideoDocument && !isAudioDocument && (
            <div className="w-full max-w-2xl p-8 rounded-xl border border-white/10 bg-white/5 text-center space-y-3">
              <AlertTriangle size={24} className="mx-auto text-gold-400" />
              <p className="text-sm text-slate-300">Aina ya media haijatambulika. Tafadhali hakikisha source URL ni sahihi.</p>
            </div>
          )}
        </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        ></div>

        {stage === 'provenance' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-6 z-50 pointer-events-none">
            <div className="w-16 h-16 border-4 border-white/10 rounded-full relative">
              <div className="absolute inset-0 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gold-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Inahakiki Chanzo...</p>
          </div>
        )}

        {stage === 'verified' && (
          <div className="absolute top-20 left-4 right-4 md:left-6 md:right-auto md:max-w-xl bg-black/75 backdrop-blur-xl border border-white/10 rounded-xl p-4 z-40 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-400 flex items-center gap-2">
                <Quote size={12} /> Nukuu ya Ushahidi
              </p>
              {isPdfDocument && (
                <button
                  onClick={handleJumpToCitationPage}
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gold-500/30 text-gold-400 hover:bg-gold-500/10 transition-colors"
                >
                  Nenda Pg {citedPage}
                </button>
              )}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">{quoteText}</p>
          </div>
        )}

        {showVideo && hasSeparateAnalysisVideo && (
          <div className="absolute inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-red-600 rounded-full transition-all z-20"
              >
                <X size={24} />
              </button>
              {isIframeVideoSource(normalizedVideoUrl) ? (
                <iframe
                  src={withAutoplay(normalizedVideoUrl)}
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video src={normalizedVideoUrl} className="w-full h-full" controls autoPlay />
              )}
            </div>
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#0a0a0a]/92 backdrop-blur-md border border-white/10 p-1.5 md:p-2 rounded-xl flex items-center gap-1 md:gap-2 shadow-2xl z-50 max-w-[95vw] overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleManualNavigation('prev')}
            className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
            title={isPdfDocument ? 'Ukurasa Uliopita' : 'Nukuu Iliyopita'}
          >
            <ChevronLeft size={18} />
          </button>

          <div className="px-2 min-w-[74px] text-center text-[10px] font-mono text-slate-400">
            {isPdfDocument
              ? totalPages > 0
                ? `Pg ${safePdfPage}/${totalPages}`
                : `Pg ${safePdfPage}`
              : hasAnnotations
                ? `${activeAnnotationIndex + 1}/${item.evidenceData.annotations.length}`
                : '1/1'}
          </div>

          <button
            onClick={() => handleManualNavigation('next')}
            className="p-2 md:p-3 bg-white/10 hover:bg-gold-500 hover:text-black text-white rounded-lg transition-colors"
            title={isPdfDocument ? 'Ukurasa Unaofuata' : 'Nukuu Inayofuata'}
          >
            <ChevronRight size={18} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-0.5 md:mx-1"></div>

          {isImageDocument && !isPdfDocument && (
            <>
              <button onClick={() => handleManualZoom(-0.5)} className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 transition-colors" title="Punguza Zoom">
                <ZoomOut size={18} />
              </button>
              <span className="text-[9px] md:text-[10px] font-mono w-10 text-center text-slate-500">{Math.round(scale * 100)}%</span>
              <button onClick={() => handleManualZoom(0.5)} className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 transition-colors" title="Ongeza Zoom">
                <ZoomIn size={18} />
              </button>

              <button
                onClick={() => setShowHighlight((prev) => !prev)}
                className={`p-2 md:p-3 rounded-lg transition-colors ${showHighlight ? 'text-gold-400 bg-gold-500/10' : 'text-slate-300 hover:bg-white/10'}`}
                title="Onyesha/Ficha Highlight"
              >
                <Crosshair size={18} />
              </button>
            </>
          )}

          <button onClick={handleReset} className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 transition-colors" title={isPdfDocument ? 'Rudi Citation Page' : 'Reset View'}>
            <RotateCcw size={18} />
          </button>

          {isPdfDocument && (
            <button
              onClick={handleJumpToCitationPage}
              className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 hover:text-gold-400 transition-colors"
              title={`Nenda moja kwa moja kwenye page ${citedPage}`}
            >
              <BookOpen size={18} />
            </button>
          )}

          {hasSeparateAnalysisVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 hover:text-gold-500 transition-colors"
              title="Tazama Analysis Video"
            >
              <PlayCircle size={18} />
            </button>
          )}

          <button onClick={() => handleDownload('full')} className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 transition-colors" title="Pakua Hati Nzima">
            <Download size={18} />
          </button>

          {isPdfDocument && (
            <button
              onClick={() => handleDownload('page')}
              className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 hover:text-gold-400 transition-colors"
              title="Fungua/Pakua Ukurasa Huu"
            >
              <FileText size={18} />
            </button>
          )}

          <button onClick={() => setIsAutoPlaying((prev) => !prev)} className="p-2 md:p-3 hover:bg-white/10 rounded-lg text-slate-300 transition-colors" title="Washa/Zima Auto">
            {isAutoPlaying ? <Pause size={16} className="text-green-500 animate-pulse" /> : <Play size={16} className="text-slate-500" />}
          </button>
        </div>
      </main>
    </div>,
    document.body
  );
};

// --- MAIN VAULT COMPONENT (UPDATED TO FOLDER VIEW) ---

export const EvidenceVault: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'document' | 'authority'>('summary');
  const [vaultItems, setVaultItems] = useState<EvidenceItem[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [vaultError, setVaultError] = useState('');

  useEffect(() => {
    const loadVault = async () => {
      setLoadingVault(true);
      setVaultError('');
      try {
        const data: EvidenceItemApi[] = await getEvidenceItems();
        const mapped = data.map((item) => ({
          id: item.id,
          category: item.category || 'Hakuna taarifa',
          subCategory: item.subCategory || 'Hakuna taarifa',
          hint: item.hint || '',
          type: item.type || 'PDF',
          title: item.title || 'Hakuna taarifa',
          swahiliTitle: item.swahiliTitle || '',
          description: item.description || '',
          fact: item.fact || '',
          sourceBook: item.sourceBook || '',
          publisher: item.publisher || '',
          author: {
            name: item.author?.name || 'Hakuna taarifa',
            role: item.author?.role || '',
            authority: item.author?.authority || '',
            organization: item.author?.organization || '',
            image: item.author?.image || '',
            bio: item.author?.bio || '',
          },
          yearPublished: item.yearPublished || '',
          translations: {
            original: item.translations?.original || '',
            en: item.translations?.en || '',
            sw: item.translations?.sw || '',
          },
          heroImage: item.heroImage || '',
          videoUrl: item.videoUrl || '',
          evidenceData: {
            page: Number(item.evidenceData?.page || 0),
            totalPages: Number(item.evidenceData?.totalPages || 0),
            annotations: Array.isArray(item.evidenceData?.annotations) ? item.evidenceData.annotations : [],
            confidence: Number(item.evidenceData?.confidence || 0),
            extractionMethod: item.evidenceData?.extractionMethod || '',
            sourceHash: item.evidenceData?.sourceHash || '',
            scanDate: item.evidenceData?.scanDate || '',
            originalLanguage: item.evidenceData?.originalLanguage || '',
          },
        }));
        setVaultItems(mapped);
      } catch (error: any) {
        setVaultItems([]);
        setVaultError(error?.message || 'Imeshindikana kupakua evidence vault.');
      } finally {
        setLoadingVault(false);
      }
    };

    loadVault();
  }, []);
  
  // Extract unique categories for folders
  const folders = Array.from(new Set(vaultItems.map(i => i.category)));

  // Filter items based on active folder
  const folderItems = activeFolder ? vaultItems.filter(i => i.category === activeFolder) : [];

  useEffect(() => {
    if (activeFolder && !folders.includes(activeFolder)) {
      setActiveFolder(null);
    }
  }, [activeFolder, folders]);

  const handleClose = () => {
    setSelectedItem(null);
    setViewMode('summary'); 
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto px-4">
      
      {/* RENDER MODALS BASED ON VIEW MODE */}
      {selectedItem && viewMode === 'summary' && (
        <EvidenceSummary 
          item={selectedItem} 
          onClose={handleClose} 
          onPreview={() => setViewMode('document')}
          onAuthority={() => setViewMode('authority')}
        />
      )}

      {selectedItem && viewMode === 'document' && (
        <DocumentPreview 
          item={selectedItem} 
          onBack={() => setViewMode('summary')}
          onClose={handleClose}
        />
      )}

      {selectedItem && viewMode === 'authority' && (
        <AuthorityProfile 
          item={selectedItem} 
          onBack={() => setViewMode('summary')}
          onClose={handleClose}
        />
      )}

      {/* HEADER SECTION */}
      <section className="relative h-[250px] md:h-[300px] rounded-xl overflow-hidden bg-slate-900 border border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 to-black"></div>
        <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-16 space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 text-gold-400">
            <Microscope size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Forensic Archives</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
            Hifadhi ya <span className="text-slate-500">Ushahidi</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-lg max-w-xl font-medium mx-auto md:mx-0">
            Nyumba ya ushahidi uliothibitishwa wa kihistoria, kiakiolojia, na matamko rasmi.
          </p>
        </div>
      </section>

      {/* NAVIGATION / FOLDERS VIEW */}
      {!activeFolder && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {vaultError && (
             <div className="col-span-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
               {vaultError}
             </div>
           )}
           {loadingVault && (
             <div className="col-span-full py-6 text-center text-xs font-black uppercase tracking-widest text-slate-400">
               Inapakia evidence...
             </div>
           )}
           {!loadingVault && folders.length === 0 && (
             <div className="col-span-full py-6 text-center text-xs font-black uppercase tracking-widest text-slate-400">
               Hakuna taarifa za evidence kwa sasa.
             </div>
           )}
           {folders.map(folder => {
             const count = vaultItems.filter(i => i.category === folder).length;
             return (
               <button 
                 key={folder}
                 onClick={() => setActiveFolder(folder)}
                 className="group bg-slate-900/40 border border-white/5 p-8 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-slate-800/60 hover:border-gold-500/30 transition-all duration-300"
               >
                  <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 group-hover:text-gold-400 group-hover:bg-gold-500/10 transition-colors">
                     <Folder size={32} fill="currentColor" className="opacity-80" />
                  </div>
                  <div className="text-center space-y-1">
                     <h3 className="font-bold text-white text-sm uppercase tracking-wider">{folder}</h3>
                     <p className="text-[10px] text-slate-500 font-mono">{count} Files</p>
                  </div>
               </button>
             );
           })}
        </div>
      )}

      {/* ITEMS LIST (INSIDE A FOLDER) - GALLERY STYLE WITH CATEGORY GROUPING */}
      {activeFolder && (
        <div className="space-y-8 animate-slide-up">
           <div className="flex items-center gap-4 pb-4 border-b border-white/5">
              <button 
                onClick={() => setActiveFolder(null)}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-2"
              >
                 <ArrowLeft size={18} /> <span className="text-xs font-bold uppercase">Back to Folders</span>
              </button>
              <div className="h-6 w-px bg-white/10"></div>
              <div className="flex items-center gap-2 text-gold-500">
                 <FolderOpen size={18} />
                 <span className="text-sm font-black uppercase tracking-widest">{activeFolder}</span>
              </div>
           </div>

           {/* Iterate through Sub-Categories */}
           {Array.from(new Set(folderItems.map(i => i.subCategory))).map(subCat => (
             <div key={subCat} className="space-y-6 mb-12">
                {/* Updated Divider Style */}
                <div className="flex items-center gap-4">
                   <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 whitespace-nowrap">
                      {subCat}
                   </h3>
                   <div className="h-px bg-gold-500/30 flex-1 max-w-md"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {folderItems.filter(i => i.subCategory === subCat).map((item, index) => (
                    <div 
                      key={item.id} 
                      onClick={() => { setSelectedItem(item); setViewMode('summary'); }}
                      className="group relative bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden hover:border-gold-500/50 transition-all duration-500 cursor-pointer flex flex-col animate-scale-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute top-2 right-2 z-10">
                         <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                            <Search size={12} />
                         </div>
                      </div>

                      <div className="aspect-[4/5] relative overflow-hidden bg-black">
                        {renderMediaCover(item, 'w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110')}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        
                        {/* Reveal Hint Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                           <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 px-4 text-center">
                              <div className="w-8 h-0.5 bg-gold-500 mx-auto mb-2"></div>
                              <p className="text-gold-400 font-black text-[10px] uppercase tracking-widest mb-1">Ushahidi</p>
                              <p className="text-white font-bold text-sm leading-tight italic">"{item.hint}"</p>
                           </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 z-10">
                           <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-tight leading-tight line-clamp-2">{item.title}</h3>
                           
                           <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                             <div className="flex items-center gap-1">
                                <img src={item.author.image} className="w-4 h-4 rounded-full border border-white/10" alt="" />
                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80px]">{item.author.name}</span>
                             </div>
                             <div className="flex items-center gap-1 text-[7px] font-black text-green-500 uppercase tracking-widest ml-auto">
                                <CheckCircle2 size={8} /> Verified
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};


