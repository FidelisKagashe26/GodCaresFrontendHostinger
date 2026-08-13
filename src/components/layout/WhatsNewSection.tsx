import React, { useEffect, useState } from 'react';
import { StageId } from '../../types';
import { getApiBaseUrl } from '../../services/core/urlService';
import { ArrowRight, Calendar, User, Newspaper } from 'lucide-react';

interface WhatsNewSectionProps {
  onNavigate: (id: StageId, search?: string) => void;
}

const MONTHS_SWAHILI = [
  'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
  'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'
];

const formatSwahiliDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = MONTHS_SWAHILI[d.getMonth()];
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch {
    return dateString;
  }
};

export const WhatsNewSection: React.FC<WhatsNewSectionProps> = ({ onNavigate }) => {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${getApiBaseUrl()}/api/news/`).then(res => res.json()).catch(() => []),
      fetch(`${getApiBaseUrl()}/api/events/`).then(res => res.json()).catch(() => [])
    ])
    .then(([newsData, eventsData]) => {
      const newsList = Array.isArray(newsData) ? newsData : (newsData?.results || []);
      const eventsList = Array.isArray(eventsData) ? eventsData : (eventsData?.results || []);

      const normalizedNews = newsList.map((item: any) => ({
        ...item,
        isEvent: false,
        displayDate: item.published_at,
        displayDesc: item.excerpt,
        displayAuthor: item.author || 'Admin',
        navStage: StageId.NEWS,
        navQuery: `?news=${item.id}`
      }));

      const normalizedEvents = eventsList.map((item: any) => ({
        ...item,
        isEvent: true,
        displayDate: item.starts_at,
        displayDesc: item.description,
        displayAuthor: item.location || 'Online',
        navStage: StageId.EVENTS,
        navQuery: `?event=${item.id}`
      }));

      setNewsItems([...normalizedNews, ...normalizedEvents]);
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch news and events", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-4 md:px-10 bg-[color:var(--page-bg)] border-t border-[color:var(--line-strong)]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 xl:col-span-8 h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 md:h-[180px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <section className="py-16 md:py-24 px-4 md:px-10 bg-[color:var(--surface-1)] border-t border-[color:var(--line-strong)]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h3 className="text-3xl md:text-4xl font-black text-[color:var(--text-primary)] tracking-tight">
                Habari Mpya
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-[color:var(--line-strong)] rounded-3xl bg-[color:var(--surface-2)]">
            <div className="w-16 h-16 rounded-full bg-[color:var(--surface-3)] flex items-center justify-center mb-4 text-[color:var(--text-muted)]">
              <Newspaper size={32} />
            </div>
            <h4 className="text-xl font-bold text-[color:var(--text-primary)] mb-2">Hakuna Habari Mpya</h4>
            <p className="text-[color:var(--text-muted)] text-center max-w-md">
              Kwa sasa hakuna matukio au habari mpya zilizowekwa. Tafadhali rudi tena baadaye.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Panga zote kulingana na tarehe (mpya zaidi juu)
  const sortedByDate = [...newsItems].sort((a, b) => new Date(b.displayDate || 0).getTime() - new Date(a.displayDate || 0).getTime());
  
  // Tafuta ile iliyochaguliwa kama 'featured' (kwa ajili ya kadi kubwa), la sivyo chukua ya kwanza mpya kabisa
  const mainEvent = sortedByDate.find(item => item.featured) || sortedByDate[0];
  
  // Chukua 4 mpya kabisa, ukitoa ile iliyotumika kwenye kadi kubwa
  const sideEvents = sortedByDate.filter(item => item.id !== mainEvent.id || item.isEvent !== mainEvent.isEvent).slice(0, 4);

  return (
    <section className="py-16 md:py-24 px-4 md:px-10 bg-[color:var(--surface-1)] border-t border-[color:var(--line-strong)]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h3 className="text-3xl md:text-4xl font-black text-[color:var(--text-primary)] tracking-tight">
              Habari Mpya
            </h3>
          </div>
          <button onClick={() => onNavigate(StageId.NEWS)} className="flex items-center gap-2 text-sm font-bold text-[color:var(--accent)] hover:text-[color:var(--text-primary)] transition-colors group">
            Tazama habari zote <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Main Large Card (Left) */}
          <div 
            className="lg:col-span-6 group cursor-pointer flex flex-col bg-[color:var(--surface-2)] rounded-3xl border border-[color:var(--line-strong)] hover:border-[color:var(--accent)] hover:shadow-2xl transition-all duration-300 overflow-hidden"
            onClick={() => onNavigate(mainEvent.navStage, mainEvent.navQuery)}
          >
            <div className="relative w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-slate-900">
              <img 
                src={mainEvent.image || "/Logo.png"} 
                alt={mainEvent.title} 
                className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${mainEvent.image ? 'object-cover' : 'object-contain p-12 opacity-20'}`} 
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col flex-grow">
              <h4 className="text-2xl md:text-3xl font-black text-[color:var(--text-primary)] mb-4 group-hover:text-[color:var(--accent)] transition-colors">
                {mainEvent.title}
              </h4>
              {mainEvent.displayDesc && (
                <p className="text-[color:var(--text-muted)] text-base md:text-lg mb-6 line-clamp-3">
                  {mainEvent.displayDesc}
                </p>
              )}
              <div className="mt-auto flex items-center gap-4 text-xs font-bold text-[color:var(--text-muted)] opacity-80 pt-4 border-t border-[color:var(--line-strong)]">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[color:var(--accent)]" />
                  <span>{formatSwahiliDate(mainEvent.displayDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--line-strong)]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-[color:var(--accent)]" />
                  <span>{mainEvent.displayAuthor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Small Cards Grid (Right) */}
          {sideEvents.length > 0 && (
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sideEvents.map((event: any, idx: number) => (
                <div 
                  key={event.id ? `${event.isEvent ? 'ev' : 'nw'}_${event.id}` : idx} 
                  className="group cursor-pointer flex flex-col bg-[color:var(--surface-2)] rounded-2xl lg:rounded-3xl border border-[color:var(--line-strong)] hover:border-[color:var(--accent)] hover:shadow-xl transition-all duration-300 overflow-hidden"
                  onClick={() => onNavigate(event.navStage, event.navQuery)}
                >
                  <div className="relative w-full aspect-video sm:aspect-square lg:aspect-auto lg:h-[180px] overflow-hidden bg-slate-900">
                    <img 
                      src={event.image || "/Logo.png"} 
                      alt={event.title} 
                      className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${event.image ? 'object-cover' : 'object-contain p-6 opacity-20'}`} 
                    />
                  </div>
                  <div className="p-4 md:p-5 flex flex-col flex-grow">
                    <h4 className="text-sm md:text-base font-black text-[color:var(--text-primary)] mb-3 group-hover:text-[color:var(--accent)] transition-colors line-clamp-3">
                      {event.title}
                    </h4>
                    <div className="mt-auto flex flex-col gap-1.5 text-[10px] md:text-xs font-bold text-[color:var(--text-muted)] opacity-80 pt-3 border-t border-[color:var(--line-strong)]">
                      <div className="flex items-center gap-1.5">
                        <span>{formatSwahiliDate(event.displayDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[color:var(--accent)]">
                        <span className="w-1.5 h-1.5 rounded-sm bg-current opacity-50" />
                        <span className="truncate">{event.displayAuthor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
