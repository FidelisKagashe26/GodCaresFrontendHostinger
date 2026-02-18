
import React, { useState } from 'react';
import { CalendarClock, ChevronRight, ChevronLeft, ArrowRight, X, MapPin, Layers, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { LanguageCode } from '../types';
import { EventApi, getEvents } from '../services/eventService';

interface HistoryEvent {
  id: string;
  month: number;
  day: number;
  year: string;
  title: string;
  description: string;
  significance: string;
  image: string;
  tag: string;
  location: string;
}

const FALLBACK_HISTORY_EVENTS: HistoryEvent[] = [
  {
    id: '1',
    month: 2,
    day: 7,
    year: '321 B.K',
    title: 'Amri ya Jumapili',
    description: "Imemkandikwa Konstantino alitoa amri ya kwanza ya kiraia kulazimisha mapumziko siku ya Jumapili ('Venerable Day of the Sun').",
    significance: 'Mwanzo wa kuingizwa kwa ibada ya jua kanisani kisheria.',
    image: 'https://images.unsplash.com/photo-1555462542-a72a7c47f722?q=80&w=1600',
    tag: 'SHERIA & DINI',
    location: 'Roma, Italia',
  },
  {
    id: '2',
    month: 9,
    day: 31,
    year: '1517',
    title: 'Matengenezo Makuu',
    description: 'Martin Luther alibandika Hoja 95 Wittenberg, akipinga biashara ya vyeti vya msamaha (Indulgences).',
    significance: 'Kurejeshwa kwa Biblia kama mamlaka kuu (Sola Scriptura).',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=1600',
    tag: 'MATENGENEZO',
    location: 'Wittenberg, Ujerumani',
  },
  {
    id: '3',
    month: 9,
    day: 22,
    year: '1844',
    title: 'Kukatishwa Tamaa Kuu',
    description: 'Siku ambayo waumini walitarajia marejeo ya Yesu, kumbe ilikuwa siku ya Yesu kuingia Patakatifu pa Patakatifu.',
    significance: 'Kuanza kwa Hukumu ya Upelelezi mbinguni.',
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1600',
    tag: 'UNABII WA MUDA',
    location: 'New England, Marekani',
  },
];

const GENERIC_EVENT_IMAGE = 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1600';

const mapBackendEvent = (item: EventApi): HistoryEvent | null => {
  const parsed = new Date(item.starts_at);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    id: `event-${item.id}`,
    month: parsed.getMonth(),
    day: parsed.getDate(),
    year: String(parsed.getFullYear()),
    title: item.title || 'Tukio la Kanisa',
    description: item.description || `Tukio la ${item.title} limepangwa kwenye kalenda ya huduma.`,
    significance:
      item.event_type === 'Virtual'
        ? 'Tukio hili linafanyika mtandaoni kwa ushiriki mpana wa waumini.'
        : 'Tukio hili linafanyika kwa kuhudhuria ana kwa ana kwa ajili ya ushirika wa karibu.',
    image: item.image || GENERIC_EVENT_IMAGE,
    tag: `${item.category || 'MATUKIO'} / ${item.event_type || 'GENERAL'}`.toUpperCase(),
    location: item.location || 'Mahali pa tukio',
  };
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveEventByDate = (date: Date, events: HistoryEvent[]) => {
  const month = date.getMonth();
  const day = date.getDate();

  const found = events.find((event) => event.month === month && event.day === day);
  if (found) {
    return found;
  }

  return {
    id: 'generic',
    month,
    day,
    year: 'Historia',
    title: 'Tukio la Kihistoria',
    description: `Katika tarehe hii ya ${date.toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long' })}, matukio mbalimbali ya kiimani yalitokea ulimwenguni kote yakichagiza mpango wa Mungu.`,
    significance: 'Kila siku ni ukurasa mpya katika kitabu cha historia ya ukombozi.',
    image: GENERIC_EVENT_IMAGE,
    tag: 'KUMBUKUMBU',
    location: 'Ulimwenguni',
  };
};

interface Props {
  aiLanguage?: LanguageCode;
  onGoToTimeline?: () => void;
}

export const HistoryTool: React.FC<Props> = ({ onGoToTimeline }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todaysEvent, setTodaysEvent] = useState<HistoryEvent | null>(null);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>(FALLBACK_HISTORY_EVENTS);
  const [eventsError, setEventsError] = useState('');
  const [hasLoadedEvents, setHasLoadedEvents] = useState(false);
  
  const formattedDateDisplay = currentDate.toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long' });
  const dateInputValue = formatDateInput(currentDate);

  const fetchHistoryForDate = (date: Date, sourceEvents: HistoryEvent[] = historyEvents) => {
    setTodaysEvent(resolveEventByDate(date, sourceEvents));
  };

  const loadBackendEvents = async (targetDate: Date) => {
    setLoading(true);
    setEventsError('');
    try {
      const backendEvents = await getEvents();
      const mapped = backendEvents
        .map(mapBackendEvent)
        .filter((event): event is HistoryEvent => Boolean(event));

      const sourceEvents = mapped.length > 0 ? mapped : FALLBACK_HISTORY_EVENTS;
      setHistoryEvents(sourceEvents);
      setHasLoadedEvents(true);
      fetchHistoryForDate(targetDate, sourceEvents);
    } catch {
      setEventsError('Imeshindikana kupakua matukio kutoka backend. Tunaonyesha data ya msingi.');
      setHistoryEvents(FALLBACK_HISTORY_EVENTS);
      setHasLoadedEvents(true);
      fetchHistoryForDate(targetDate, FALLBACK_HISTORY_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    const today = new Date();
    setCurrentDate(today);
    if (hasLoadedEvents && !eventsError) {
      fetchHistoryForDate(today, historyEvents);
      return;
    }
    loadBackendEvents(today);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map((value) => Number(value));
      const newDate = new Date(year, month - 1, day);
      setCurrentDate(newDate);
      fetchHistoryForDate(newDate);
    }
  };

  const navigateDay = (direction: 'next' | 'prev') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
    fetchHistoryForDate(newDate);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-12 h-12 rounded-2xl bg-purple-600/90 backdrop-blur-md border border-white/10 text-white hover:bg-purple-500 hover:scale-105 transition-all flex items-center justify-center shadow-lg shadow-purple-900/40 group relative z-50"
        title="Siku Kama Ya Leo"
      >
        <CalendarClock size={22} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-md animate-fade-in font-sans">
            <div className="relative bg-[#0f172a] w-full max-w-4xl rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scale-up">
                
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-red-500 text-white rounded-full transition-all md:hidden">
                   <X size={18} />
                </button>

                {loading ? (
                  <div className="w-full h-[500px] flex flex-col items-center justify-center space-y-4 text-slate-400">
                     <Loader2 size={40} className="animate-spin text-purple-500" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Inatafuta Kumbukumbu...</p>
                  </div>
                ) : todaysEvent ? (
                  <>
                    {/* Left: Image & Year (Hero Section) */}
                    <div className="w-full md:w-1/2 relative h-64 md:h-auto bg-slate-900 overflow-hidden group">
                       <img 
                         src={todaysEvent.image} 
                         className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" 
                         alt="Event" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
                       
                       <div className="absolute top-6 left-6">
                          <div className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg border backdrop-blur-md bg-purple-600/90 border-purple-500/30 text-white">
                             SIKU KAMA YA LEO
                          </div>
                       </div>

                       {/* Updated Bottom Left Overlay with Line Separator */}
                       <div className="absolute bottom-8 left-8 z-10">
                          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none shadow-black drop-shadow-xl">
                             {todaysEvent.year}
                          </h1>
                          <div className="h-1 w-16 bg-purple-500 my-3 rounded-full"></div>
                          <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-widest shadow-black drop-shadow-md">
                             <MapPin size={14} className="text-purple-500" /> {todaysEvent.location}
                          </div>
                       </div>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 p-6 md:p-10 flex flex-col bg-[#0f172a] relative">
                       <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all hidden md:block">
                          <X size={20} />
                       </button>

                       <div className="flex-1 space-y-6">
                          {eventsError && (
                            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg">
                              {eventsError}
                            </div>
                          )}

                          {/* Date Navigation & Picker */}
                          <div className="flex items-center justify-between bg-purple-900/10 p-2 rounded-xl border border-purple-500/10">
                             <button onClick={() => navigateDay('prev')} className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-300 transition-colors"><ChevronLeft size={16}/></button>
                             
                             <div className="flex items-center gap-2 relative group cursor-pointer">
                                <CalendarIcon size={16} className="text-purple-500" />
                                <span className="text-xs font-black uppercase tracking-widest text-white">{formattedDateDisplay}</span>
                                {/* Date Input Overlay */}
                                <input 
                                  type="date" 
                                  value={dateInputValue}
                                  onChange={handleDateChange}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                             </div>

                             <button onClick={() => navigateDay('next')} className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-300 transition-colors"><ChevronRight size={16}/></button>
                          </div>

                          <div>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{todaysEvent.tag}</span>
                             <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none mt-2 mb-4">
                                {todaysEvent.title}
                             </h3>
                             <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                {todaysEvent.description}
                             </p>
                          </div>

                          <div className="bg-purple-500/10 border-l-4 border-purple-500 p-5 rounded-r-lg">
                             <h4 className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Layers size={12} /> Maana ya Tukio
                             </h4>
                             <p className="text-xs text-slate-300 italic leading-relaxed">
                                "{todaysEvent.significance}"
                             </p>
                          </div>
                       </div>

                       {/* Footer */}
                       <div className="pt-6 mt-6 border-t border-white/5 flex justify-end">
                          {onGoToTimeline && (
                            <button 
                              onClick={() => { setIsOpen(false); onGoToTimeline(); }} 
                              className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 border border-purple-500/30 hover:border-purple-500"
                            >
                              Fungua Timeline Kamili <ArrowRight size={14} />
                            </button>
                          )}
                       </div>
                    </div>
                  </>
                ) : null}
            </div>
        </div>
      )}
    </>
  );
};
