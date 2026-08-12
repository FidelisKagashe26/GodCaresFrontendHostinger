import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Newspaper, ArrowRight, X, Share2, Eye, User } from 'lucide-react';
import { NewsItemApi, getNewsItems, registerNewsView } from '../../services/content/newsService';
import { subscribeNewsletter } from '../../services/content/newsletterService';
import { useDetailCrumbs } from '../system/Breadcrumbs';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage?: string;
  views: number;
  featured?: boolean;
}

const renderImage = (image: string, title: string, className: string) => {
  if (!image) {
    return (
      <div className={`${className} bg-slate-200 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500`}>
        Hakuna picha
      </div>
    );
  }
  return <img src={image} className={className} alt={title} />;
};

const AuthorAvatar: React.FC<{ name: string; image?: string; className?: string; iconSize?: number }> = ({
  name,
  image,
  className = 'w-10 h-10',
  iconSize = 18,
}) => (
  <div className={`${className} shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center`}>
    {image ? (
      <img src={image} alt={name} className="h-full w-full object-cover" />
    ) : (
      <User size={iconSize} className="text-slate-500" />
    )}
  </div>
);

const translateCategory = (category: string): string => {
  const key = (category || '').trim().toLowerCase();
  if (!key) return 'Habari';

  const map: Record<string, string> = {
    global: 'Dunia',
    prophecy: 'Unabii',
    church: 'Kanisa',
    events: 'Matukio',
    news: 'Habari',
  };

  return map[key] || category;
};

const containsHtml = (value: string): boolean => /<[a-z][\s\S]*>/i.test(value || '');

const formatNewsDate = (value: string): string => {
  if (!value) return 'Hakuna taarifa';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Hakuna taarifa';
  return parsed.toLocaleDateString('sw-TZ');
};

const mapNewsFromApi = (item: NewsItemApi): NewsItem => ({
  id: Number(item.id),
  title: (item.title || '').trim() || 'Hakuna kichwa cha habari',
  date: formatNewsDate(item.published_at),
  category: (item.category || 'Habari').trim() || 'Habari',
  image: item.image || '',
  excerpt: item.excerpt || 'Hakuna taarifa.',
  content: item.content || '',
  author: (item.author || 'Hakuna taarifa').trim() || 'Hakuna taarifa',
  authorImage: item.author_image || '',
  views: Number(item.views || 0),
  featured: Boolean(item.featured),
});

const getNewsIdFromHash = (): number | null => {
  const hash = (window.location.hash || '').trim();
  const match = hash.match(/^#habari-(\d+)$/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

export const News: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  useDetailCrumbs(selectedNews ? [{ label: selectedNews.title }] : []);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    items.forEach((item) => {
      const category = (item.category || '').trim();
      if (!category) return;
      const key = category.toLowerCase();
      if (!unique.has(key)) unique.set(key, category);
    });
    return ['all', ...Array.from(unique.values())];
  }, [items]);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await getNewsItems();
        setItems(data.map(mapNewsFromApi));
      } catch {
        setErrorMessage('Imeshindikana kupakua habari.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const hashNewsId = getNewsIdFromHash();
    if (!hashNewsId) return;
    const matched = items.find((item) => item.id === hashNewsId);
    if (matched) {
      setSelectedNews((prev) => (prev?.id === matched.id ? prev : matched));
    }
  }, [items]);

  const openNews = (news: NewsItem) => {
    setSelectedNews(news);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#habari-${news.id}`);
  };

  const closeNews = () => {
    setSelectedNews(null);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  };

  useEffect(() => {
    if (!selectedNews) return;
    let cancelled = false;
    const selectedNewsId = selectedNews.id;

    const saveView = async () => {
      try {
        const payload = await registerNewsView(selectedNewsId);
        if (cancelled) return;

        const mappedItem = payload.item ? mapNewsFromApi(payload.item) : null;

        setItems((prev) => prev.map((item) => {
          if (item.id !== selectedNewsId) return item;
          if (mappedItem) return { ...item, ...mappedItem, views: payload.views };
          return { ...item, views: payload.views };
        }));
        setSelectedNews((prev) => {
          if (!prev || prev.id !== selectedNewsId) return prev;
          if (mappedItem) return { ...prev, ...mappedItem, views: payload.views };
          return { ...prev, views: payload.views };
        });
      } catch {
        // View counter is optional.
      }
    };

    saveView();

    return () => {
      cancelled = true;
    };
  }, [selectedNews?.id]);

  const handleShare = async (news: NewsItem) => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#habari-${news.id}`;
    const text = `${news.title}\n\n${news.excerpt}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: news.title,
          text,
          url,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert('Link ya habari imenakiliwa kwenye clipboard.');
        return;
      }

      window.prompt('Nakili link hii ya kushare:', url);
    } catch {
      // Ignore user cancel/abort.
    }
  };

  const filteredNews = activeCategory === 'all'
    ? items
    : items.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());
  const featuredNews = items.filter((item) => item.featured);
  const topHeadlineItem = featuredNews[0] || items[0] || null;
  const topHeadline = topHeadlineItem?.title || 'Hakuna taarifa za habari kwa sasa.';

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <section className="space-y-8 pt-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-3 rounded-xl text-primary-900">
              <Newspaper size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Habari <span className="text-gold-500">GC365</span></h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Taarifa rasmi za huduma</p>
            </div>
          </div>

          <div
            onClick={() => {
              if (topHeadlineItem) openNews(topHeadlineItem);
            }}
            className={`w-full bg-red-600 text-white rounded-xl p-1 shadow-lg shadow-red-600/20 overflow-hidden relative group ${topHeadlineItem ? 'cursor-pointer' : ''}`}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="relative flex items-center gap-4 py-3 px-4">
              <div className="bg-white text-red-600 text-[10px] font-black uppercase px-3 py-1 rounded animate-pulse shadow-sm shrink-0">
                TAHADHARI
              </div>
              <div className="h-4 w-px bg-white/30 hidden md:block"></div>
              <p className="text-xs md:text-sm font-bold uppercase tracking-wide truncate flex-1">{topHeadline}</p>
              <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {!loading && featuredNews.length === 0 && (
            <div className="lg:col-span-2 bg-slate-100 border border-slate-200 rounded-3xl p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Hakuna taarifa za habari maalum kwa sasa.
            </div>
          )}
          {featuredNews.map((news) => (
            <div
              key={news.id}
              onClick={() => openNews(news)}
              className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl border border-slate-200 hover:shadow-2xl transition-all"
            >
              {renderImage(news.image, news.title, 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-110')}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>

              <div className="absolute top-6 left-6">
                <span className="px-3 py-1 bg-gold-500 text-primary-950 text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg">
                  Muhimu
                </span>
              </div>

              <div className="absolute bottom-0 left-0 p-8 space-y-3 w-full">
                <div className="flex items-center gap-3 text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                  <span className="text-gold-400">{translateCategory(news.category)}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {news.date}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1"><Eye size={10} /> {news.views}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight group-hover:text-gold-400 transition-colors line-clamp-2">{news.title}</h2>
                <p className="text-slate-300 text-sm font-medium line-clamp-2 max-w-lg">{news.excerpt}</p>
                <div className="pt-4 flex items-center text-white text-xs font-black uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Soma Habari Kamili <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'bg-primary-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Habari Zote
          </button>
          {categories.filter((cat) => cat !== 'all').map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {translateCategory(cat)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-xs uppercase tracking-widest text-slate-400 font-black">Inapakia habari...</div>
        )}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        {!loading && filteredNews.length === 0 && (
          <div className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-lg">
            Hakuna taarifa za habari kwa sasa.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              onClick={() => openNews(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-gold-500/30 transition-all group flex flex-col h-full cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                {renderImage(item.image, item.title, 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500')}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary-900 shadow-sm">
                  {translateCategory(item.category)}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-1">
                  <Calendar size={12} /> {item.date}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-4">
                  <Eye size={12} /> Imeonekana {item.views}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-3 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1 line-clamp-3 font-medium">{item.excerpt}</p>
                <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 border border-slate-100">
                  <AuthorAvatar name={item.author} image={item.authorImage} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mwandishi</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{item.author}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-900 group-hover:text-gold-600 transition-colors mt-auto">
                  Soma Habari Kamili <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Pata Habari Kwanza</h2>
          <p className="text-slate-400 text-sm font-medium">
            Pokea habari za huduma kila wiki kwenye barua pepe yako.
          </p>
          <div className="flex gap-2 p-1 bg-white/10 rounded-xl border border-white/10">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Weka barua pepe yako..."
              className="flex-1 bg-transparent px-4 py-3 text-white text-sm outline-none placeholder:text-slate-400"
            />
            <button
              onClick={async () => {
                setNewsletterMessage('');
                try {
                  await subscribeNewsletter(email);
                  setNewsletterMessage('Asante! Umejiunga kikamilifu.');
                  setEmail('');
                } catch {
                  setNewsletterMessage('Imeshindikana kujiunga.');
                }
              }}
              className="bg-gold-500 text-primary-900 px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg"
            >
              Jiunge
            </button>
          </div>
          {newsletterMessage && (
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">{newsletterMessage}</p>
          )}
        </div>
      </section>

      {selectedNews && (
        <div className="fixed inset-0 z-[500] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-950 w-full h-full md:h-[94vh] md:max-w-6xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-scale-up">
            <div className="relative h-64 md:h-80 shrink-0">
              {renderImage(selectedNews.image, selectedNews.title, 'w-full h-full object-cover')}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <button
                onClick={closeNews}
                className="absolute top-4 right-4 bg-black/40 hover:bg-red-600 text-white p-2 rounded-full transition-all backdrop-blur-md z-10"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="px-3 py-1 bg-gold-500 text-primary-950 text-[10px] font-black uppercase tracking-widest rounded mb-4 inline-block">
                  {translateCategory(selectedNews.category)}
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-white leading-tight uppercase tracking-tight shadow-sm">
                  {selectedNews.title}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <AuthorAvatar name={selectedNews.author} image={selectedNews.authorImage} className="w-12 h-12" iconSize={20} />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{selectedNews.author}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {selectedNews.date} | Imeonekana {selectedNews.views}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleShare(selectedNews)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary-900 text-white rounded-lg hover:bg-gold-500 hover:text-primary-900 transition-all shrink-0"
                >
                  <Share2 size={14} /> Shiriki
                </button>
              </div>

              {containsHtml(selectedNews.content) ? (
                <div
                  className="prose prose-slate dark:prose-invert max-w-none [&_*]:text-slate-700 dark:[&_*]:text-slate-200"
                  dangerouslySetInnerHTML={{ __html: selectedNews.content || '<p>Hakuna taarifa.</p>' }}
                ></div>
              ) : (
                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
                  {selectedNews.content || 'Hakuna taarifa.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


