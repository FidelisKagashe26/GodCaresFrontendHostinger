
import React, { useEffect, useMemo, useState } from 'react';
import { 
  MessageSquare, Search, BookOpen, ChevronRight, HelpCircle, 
  X, Info, Book, Send, Clock, ShieldCheck, PlusCircle, 
  ArrowLeft, RefreshCw, PlayCircle, Youtube, Share2, FileText, Check
} from 'lucide-react';
import { getQuestionVaultItems, QuestionVaultItemApi, submitQuestionVaultQuestion } from '../../services/tools/vaultService';

interface QuestionItem {
  id: number;
  category: string;
  q: string;
  a: string;
  detailedResponse: string;
  ref: string;
  tags: string[];
  isPopular?: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
}

const questionHashPrefix = '#swali-';

const getQuestionIdFromHash = (): number | null => {
  const hash = (window.location.hash || '').trim();
  if (!hash.toLowerCase().startsWith(questionHashPrefix)) {
    return null;
  }
  const raw = hash.slice(questionHashPrefix.length);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildQuestionHash = (id: number): string => `${questionHashPrefix}${id}`;

const normalizeVideoUrl = (value: string): string => {
  const raw = (value || '').trim();
  if (!raw) {
    return '';
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;

    if (host.includes('youtu.be')) {
      const id = path.replace(/^\/+/, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : raw;
    }

    if (host.includes('youtube.com')) {
      if (path.startsWith('/embed/')) {
        return raw;
      }
      if (path.startsWith('/watch')) {
        const id = url.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : raw;
      }
      if (path.startsWith('/shorts/')) {
        const id = path.split('/')[2];
        return id ? `https://www.youtube.com/embed/${id}` : raw;
      }
    }
  } catch {
    return raw;
  }

  return raw;
};

const withAutoplay = (value: string): string => {
  const normalized = normalizeVideoUrl(value);
  if (!normalized) {
    return normalized;
  }
  return `${normalized}${normalized.includes('?') ? '&' : '?'}autoplay=1`;
};

const isIframeVideoSource = (value: string): boolean => {
  const normalized = normalizeVideoUrl(value);
  return /youtube\.com\/embed|player\.vimeo\.com/i.test(normalized);
};

export const QuestionVault: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Zote');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [activeView, setActiveView] = useState<'text' | 'video'>('text');
  const [showAskForm, setShowAskForm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [askName, setAskName] = useState('');
  const [askEmail, setAskEmail] = useState('');
  const [askQuestion, setAskQuestion] = useState('');
  const [askSubmitting, setAskSubmitting] = useState(false);
  const [askError, setAskError] = useState('');
  const [askSuccess, setAskSuccess] = useState('');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState('');

  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      setQuestionsError('');
      try {
        const data: QuestionVaultItemApi[] = await getQuestionVaultItems();
        setQuestions(data.map((item) => ({
          id: item.id,
          category: item.category || 'Hakuna taarifa',
          q: item.q,
          a: item.a,
          detailedResponse: item.detailedResponse || '',
          ref: item.ref || 'Hakuna taarifa',
          tags: item.tags || [],
          isPopular: item.isPopular,
          videoUrl: normalizeVideoUrl(item.videoUrl || ''),
          videoThumbnail: item.videoThumbnail || '',
        })));
      } catch (error: any) {
        setQuestions([]);
        setQuestionsError(error?.message || 'Imeshindikana kupakua maswali.');
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    if (!questions.length) return;
    const questionIdFromHash = getQuestionIdFromHash();
    if (!questionIdFromHash) return;
    const found = questions.find((item) => item.id === questionIdFromHash);
    if (found) {
      setSelectedQuestion(found);
      setActiveView('text');
    }
  }, [questions]);

  const categories = useMemo(
    () => ['Zote', ...Array.from(new Set(questions.map((item) => item.category).filter(Boolean)))],
    [questions]
  );

  useEffect(() => {
    if (activeCategory !== 'Zote' && !categories.includes(activeCategory)) {
      setActiveCategory('Zote');
    }
  }, [activeCategory, categories]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.q.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Zote' || q.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, questions]);
  const topHeadline = filteredQuestions[0]?.q || questions[0]?.q || 'Hakuna maswali mapya kwa sasa.';

  const openQuestion = (item: QuestionItem) => {
    setSelectedQuestion(item);
    setActiveView('text');
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${buildQuestionHash(item.id)}`);
  };

  const closeQuestion = () => {
    setSelectedQuestion(null);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  };

  const handleShare = async (item: QuestionItem) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}${buildQuestionHash(item.id)}`;
    const shareData = {
      title: `God Cares 365: ${item.q}`,
      text: `${item.q}\n\nJibu la Biblia: ${item.a}`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        return;
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!showAskForm) return;
    setAskError('');
    setAskSuccess('');
    try {
      const raw = localStorage.getItem('gc365_user');
      const parsed = raw ? JSON.parse(raw) : null;
      if (!askName && typeof parsed?.name === 'string') setAskName(parsed.name);
      if (!askEmail && typeof parsed?.email === 'string') setAskEmail(parsed.email);
    } catch {
      // ignore parse errors
    }
  }, [showAskForm]);

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuestion.trim()) {
      setAskError('Andika swali kabla ya kutuma.');
      return;
    }
    if (askEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(askEmail.trim())) {
      setAskError('Barua pepe si sahihi.');
      return;
    }

    setAskSubmitting(true);
    setAskError('');
    try {
      await submitQuestionVaultQuestion({
        name: askName.trim(),
        email: askEmail.trim(),
        question: askQuestion.trim(),
      });
      setAskSuccess('Swali lako limetumwa kwa timu ya uhariri.');
      setAskQuestion('');
      setTimeout(() => {
        setShowAskForm(false);
        setAskSuccess('');
      }, 1200);
    } catch (error: any) {
      setAskError(error?.message || 'Imeshindikana kutuma swali.');
    } finally {
      setAskSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-20 max-w-6xl mx-auto animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="p-4 sm:p-6 md:p-12 border-b border-slate-100 dark:border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl text-primary-900 dark:text-gold-400 border border-slate-200 dark:border-slate-800">
              <MessageSquare size={22} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                Maswali na <span className="text-gold-600 dark:text-gold-400">Majibu</span>
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">
                Hazina ya majibu ya Biblia kwa uchunguzi wa kiungu
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAskForm(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-primary-950 hover:bg-gold-400 transition-colors"
          >
            <PlusCircle size={14} />
            Uliza Swali
          </button>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 flex items-center gap-3">
          <span className="shrink-0 px-2 py-1 rounded-full bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            Mada
          </span>
          <p className="min-w-0 flex-1 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
            {topHeadline}
          </p>
          <ChevronRight size={16} className="shrink-0 text-slate-500 dark:text-slate-300" />
        </div>
      </div>
      
      {/* Search & Fixed Filter Bar - Solid background to prevent see-through "moving" effect */}
      <section className="mx-3 mt-4 sm:mx-4 md:mx-8 bg-white dark:bg-[#020617] p-4 rounded-xl border border-slate-200 dark:border-slate-800 sticky top-20 z-40 shadow-lg dark:shadow-2xl ring-1 ring-slate-100 dark:ring-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-4 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-gold-500 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tafuta mada au swali..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-gold-500 shadow-inner transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
          <div className="lg:col-span-8 flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border shrink-0 ${
                  activeCategory === cat 
                    ? 'bg-gold-500 text-primary-950 border-gold-500 shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-5 px-3 sm:px-4 md:px-8">
        <div className="lg:col-span-8 space-y-4">
           {questionsError && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
               {questionsError}
             </div>
           )}
           {loadingQuestions && (
             <div className="py-6 text-center text-xs font-black uppercase tracking-widest text-slate-500">
               Inapakia maswali...
             </div>
           )}
            {filteredQuestions.map((item) => (
              <article 
                key={item.id} 
                onClick={() => openQuestion(item)}
                className="group cursor-pointer rounded-2xl border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] hover:border-gold-400/80 hover:shadow-[0_14px_28px_rgba(212,154,20,0.12)] transition-all"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openQuestion(item);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-slate-200 dark:border-slate-700">
                    {item.category}
                  </span>
                  <ChevronRight size={16} className="text-slate-400 dark:text-slate-600 group-hover:text-gold-500 transition-colors group-hover:translate-x-1" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-3 group-hover:text-gold-700 dark:group-hover:text-gold-300 transition-colors">
                  {item.q}
                </h3>
               <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic line-clamp-2 font-serif">
                 "{item.a}"
               </p>
               <div className="mt-4 pt-3 border-t border-green-100/90 dark:border-slate-700 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"><BookOpen size={12} /> {item.ref}</span>
                  {item.videoUrl ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      <Youtube size={11}/>
                      Video
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openQuestion(item);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/80 bg-gold-100/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-gold-800 hover:bg-gold-200/80 transition-colors"
                    >
                      Zaidi
                      <ChevronRight size={13} />
                    </button>
                  )}
               </div>
             </article>
           ))}
           {!loadingQuestions && filteredQuestions.length === 0 && (
             <div className="py-20 text-center space-y-4 opacity-30">
               <Search size={48} className="mx-auto" />
               <p className="font-black uppercase tracking-widest text-xs">Hakuna swali lililopatikana</p>
             </div>
           )}
        </div>

        {/* Sidebar Panel - Fixed Static Position */}
        <div className="lg:col-span-4">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl text-slate-900 dark:text-white shadow-[0_12px_26px_rgba(15,23,42,0.08)] border border-green-200/80 dark:border-slate-700 space-y-5 sticky top-44">
              <h4 className="text-sm font-black tracking-widest uppercase italic flex items-center gap-2">
                 <ShieldCheck size={18} className="text-gold-500" /> Kanuni ya Kweli
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] font-medium leading-relaxed italic">
                Majibu yote kwenye vault hii yamehakikiwa kwa chujio la "Andiko kwa Andiko". Hatutumii mapokeo ya wanadamu.
              </p>
              <div className="h-px bg-slate-200 dark:bg-slate-800 w-full"></div>
              <button 
                onClick={() => setShowAskForm(true)}
                className="w-full py-3.5 bg-gold-500 text-primary-950 rounded-full font-black text-[11px] uppercase tracking-[0.1em] hover:bg-gold-400 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <PlusCircle size={14} /> Uliza Swali Lako
              </button>
           </div>
        </div>
      </div>

      {/* Detailed Modal - Using Fixed Positioning for Stability */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
          <div className="bg-slate-900 w-full max-w-5xl h-full md:h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-up border border-slate-800">
            
            {/* Header / Control Bar - Fixed Positions to prevent Shifting */}
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
               <div className="flex items-center gap-4 w-1/3">
                  <button onClick={closeQuestion} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all"><ArrowLeft size={18} /></button>
                  <span className="hidden md:block text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Namba ya Swali: #{selectedQuestion.id}</span>
               </div>
               
               <div className="flex bg-black/40 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => setActiveView('text')}
                    className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'text' ? 'bg-gold-500 text-primary-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    <FileText size={14} /> Maelezo
                  </button>
                  {selectedQuestion.videoUrl && (
                    <button 
                      onClick={() => setActiveView('video')}
                      className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'video' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Youtube size={14} /> Video
                    </button>
                  )}
               </div>

               <div className="flex justify-end w-1/3 gap-3">
                 <button 
                   onClick={() => handleShare(selectedQuestion)} 
                   className={`p-2 rounded-xl transition-all border border-slate-800 flex items-center gap-2 ${isCopied ? 'bg-green-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                 >
                   {isCopied ? <Check size={16}/> : <Share2 size={16}/>}
                    <span className="hidden lg:block text-[9px] font-black uppercase tracking-widest">{isCopied ? 'Imenakiliwa' : 'Shiriki'}</span>
                  </button>
                </div>
            </div>

            {/* Modal Content - Scrollable stable container */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900">
               {/* Left Context (Hidden on Mobile) */}
               <aside className="hidden md:flex w-[280px] bg-black/20 border-r border-slate-800 p-8 flex-col justify-between shrink-0">
                  <div className="space-y-8">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rejekta Kuu</p>
                        <p className="text-2xl font-black text-gold-500 italic">{selectedQuestion.ref}</p>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mada Husika</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedQuestion.tags.map(t => <span key={t} className="px-2 py-1 bg-white/5 rounded text-[8px] font-black uppercase text-slate-500 border border-slate-800">{t}</span>)}
                        </div>
                     </div>
                  </div>
                  <div className="p-5 bg-white/5 rounded-xl border border-slate-800">
                     <p className="text-[10px] text-slate-500 leading-relaxed italic">"Nanyi mtaifahamu kweli, nayo hiyo kweli itawaweka huru." - Yohana 8:32</p>
                  </div>
               </aside>

               {/* Main Viewport */}
               <div className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-14">
                  {activeView === 'text' ? (
                    <div className="space-y-12 animate-fade-in">
                       <section className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2"><Info size={16} className="text-gold-500" /> Muhtasari wa Jibu</h4>
                          <p className="text-2xl md:text-3xl font-bold text-slate-200 leading-relaxed italic border-l-4 border-gold-500 pl-8">"{selectedQuestion.a}"</p>
                       </section>
                       <section className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2"><Book size={16} className="text-primary-600" /> Uchambuzi wa Kina</h4>
                          <div className="text-slate-400 text-lg leading-relaxed font-light space-y-6">
                             {selectedQuestion.detailedResponse.split('\n\n').map((p, i) => <p key={i} className="first-letter:text-2xl first-letter:font-black first-letter:text-gold-500">{p}</p>)}
                          </div>
                       </section>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center animate-slide-up">
                       <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl relative border border-slate-800">
                          {isIframeVideoSource(selectedQuestion.videoUrl || '') ? (
                            <iframe 
                              src={withAutoplay(selectedQuestion.videoUrl || '')} 
                              className="w-full h-full border-none"
                              allow="autoplay; encrypted-media; picture-in-picture" 
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video src={selectedQuestion.videoUrl || ''} className="w-full h-full" controls autoPlay />
                          )}
                       </div>
                       <div className="mt-8 text-center space-y-2">
                          <h4 className="text-xl font-black text-white uppercase tracking-tighter">Sikiliza Maelezo</h4>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">Midia ya Umisheni wa Kidijitali</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Modal Footer - Fixed Height */}
            <div className="p-5 border-t border-slate-800 flex justify-between items-center bg-black/40 shrink-0">
               <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Uadilifu Uliothibitishwa</span>
               </div>
               <button onClick={closeQuestion} className="px-10 py-3 bg-gold-500 text-primary-950 rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">Funga</button>
             </div>
          </div>
        </div>
      )}

      {/* Ask Form Popup */}
      {showAskForm && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-scale-up border border-slate-800 relative">
             <button onClick={() => setShowAskForm(false)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-all"><X size={24} /></button>
             <div className="bg-primary-950 p-10 text-white">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">Uliza <span className="text-gold-500">Biblia</span></h3>
             </div>
             <form onSubmit={handleAskSubmit} className="p-8 space-y-4">
                <input
                  type="text"
                  value={askName}
                  onChange={(e) => setAskName(e.target.value)}
                  placeholder="Jina (hiari)"
                  className="w-full p-4 bg-black/40 border border-slate-800 rounded-xl outline-none focus:border-gold-500 transition-all text-sm font-medium text-white"
                />
                <input
                  type="email"
                  value={askEmail}
                  onChange={(e) => setAskEmail(e.target.value)}
                  placeholder="Barua pepe (hiari)"
                  className="w-full p-4 bg-black/40 border border-slate-800 rounded-xl outline-none focus:border-gold-500 transition-all text-sm font-medium text-white"
                />
                <textarea
                  required
                  value={askQuestion}
                  onChange={(e) => setAskQuestion(e.target.value)}
                  placeholder="Andika swali lako hapa kwa kina..."
                  className="w-full h-40 p-5 bg-black/40 border border-slate-800 rounded-xl outline-none focus:border-gold-500 transition-all text-sm font-medium text-white"
                />
                {askError && <div className="text-[10px] font-black uppercase tracking-widest text-red-500">{askError}</div>}
                {askSuccess && <div className="text-[10px] font-black uppercase tracking-widest text-green-500">{askSuccess}</div>}
                <button type="submit" disabled={askSubmitting} className="w-full py-4 bg-gold-500 text-primary-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                   <Send size={16} /> {askSubmitting ? 'Inatuma...' : 'Tuma Swali'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};




