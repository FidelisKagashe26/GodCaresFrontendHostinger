
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Calendar, MapPin, CheckCircle, Clock, 
  Users, Filter, Sparkles, ChevronRight, Search,
  X, Download, Bell, Share2, AlertCircle,
  FileText, Play, User, ArrowRight, Info, Star
} from 'lucide-react';
import { EventApi, getEvents, registerForEvent } from '../../services/content/eventService';

interface EventResource {
  name: string;
  type: 'PDF' | 'Video' | 'Link';
  url: string;
}

interface Speaker {
  name: string;
  role: string;
  img: string;
  bio?: string;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  endDate: Date | null;
  location: string;
  image: string;
  description: string;
  type: 'Virtual' | 'Physical';
  category: 'Seminar' | 'Summit' | 'Revival';
  attendees: number;
  maxAttendees: number;
  speakers: Speaker[];
  resources: EventResource[];
}

const INITIAL_EVENTS: Event[] = [];

const toDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDaysLeft = (targetDate: Date): number => Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const formatTimeRange = (start: Date, end: Date | null): string => {
  const startText = start.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' });
  if (!end) return startText;
  const endText = end.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' });
  return `${startText} - ${endText}`;
};

const FILTER_LABELS: Record<'All' | 'Virtual' | 'Physical', string> = {
  All: 'Zote',
  Virtual: 'Mtandaoni',
  Physical: 'Ana kwa ana',
};

const EVENT_TYPE_LABELS: Record<'Virtual' | 'Physical', string> = {
  Virtual: 'Mtandaoni',
  Physical: 'Ana kwa ana',
};

const CATEGORY_LABELS: Record<'Seminar' | 'Summit' | 'Revival', string> = {
  Seminar: 'Semina',
  Summit: 'Mkutano',
  Revival: 'Mwamsho',
};

const mapEventFromApi = (item: EventApi): Event => ({
  id: String(item.id),
  title: item.title,
  date: toDate(item.starts_at) || new Date(),
  endDate: toDate(item.ends_at || null),
  location: item.location || 'Hakuna taarifa',
  image: item.image || '',
  description: item.description || '',
  type: item.event_type,
  category: item.category,
  attendees: Number(item.attendees || 0),
  maxAttendees: Number(item.max_attendees || 0),
  speakers: Array.isArray(item.speakers) ? item.speakers : [],
  resources: Array.isArray(item.resources) ? item.resources : [],
});

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isEventFull = (event: Event): boolean =>
  event.maxAttendees > 0 && event.attendees >= event.maxAttendees;

/** An event is over once its end time (or start, when there is no end) has passed. */
const isEventPast = (event: Event): boolean =>
  (event.endDate || event.date).getTime() < Date.now();

const REGISTERED_EVENTS_KEY = 'gc365_registered_events';

const readRegisteredIds = (): string[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_EVENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const persistRegisteredIds = (ids: string[]) => {
  try {
    localStorage.setItem(REGISTERED_EVENTS_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors.
  }
};

const SpeakerAvatar: React.FC<{ speaker: Speaker; className?: string; iconSize?: number }> = ({
  speaker,
  className = 'w-12 h-12',
  iconSize = 20,
}) => (
  <div className={`${className} shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-sm`}>
    {speaker.img ? (
      <img src={speaker.img} className="w-full h-full object-cover" alt={speaker.name} />
    ) : (
      <User size={iconSize} className="text-slate-500 dark:text-slate-400" />
    )}
  </div>
);

const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    // Compute immediately as well, so the first second isn't shown as 00:00:00,
    // and clamp to zero once the date passes instead of freezing on the last value.
    const tick = () => {
      const diff = +targetDate - +new Date();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-1.5">
      {[
        { label: 'D', val: timeLeft.d },
        { label: 'H', val: timeLeft.h },
        { label: 'M', val: timeLeft.m },
        { label: 'S', val: timeLeft.s }
      ].map((u, i) => (
        <div key={i} className="bg-primary-950/80 px-2 py-1.5 rounded-sm border border-white/5 flex flex-col items-center min-w-[38px] shadow-sm">
          <span className="text-sm font-black text-white leading-none">{u.val.toString().padStart(2, '0')}</span>
          <span className="text-[6px] font-black uppercase text-gold-500 mt-0.5">{u.label}</span>
        </div>
      ))}
    </div>
  );
};

import { AuthUser } from '../../services/core/authService';
import { useDetailCrumbs } from '../system/Breadcrumbs';

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  user: AuthUser | null | undefined;
  onRequireLogin?: () => void;
  onSubmit: (data: { name: string; email: string; phone?: string }) => void;
  isSubmitting: boolean;
}

const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  user,
  onRequireLogin,
  onSubmit,
  isSubmitting
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setEmail(user?.email || '');
      // If user object has phone, we would use it here. We'll leave it empty otherwise.
      setPhone('');
      setFormError('');
    }
  }, [isOpen, user]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Tafadhali weka jina lako.');
      return;
    }
    if (!isValidEmail(email.trim())) {
      setFormError('Weka barua pepe sahihi, mfano jina@mfano.com');
      return;
    }
    setFormError('');
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-black text-white uppercase">Usajili wa Tukio</h3>
          <p className="text-gold-500 text-sm font-bold mt-1 truncate">{event.title}</p>
        </div>

        <div className="p-6 space-y-6">
          {!user && (
            <div className="bg-gold-500/10 border border-gold-500/30 p-4 rounded-lg flex flex-col items-center text-center gap-3">
              <User size={32} className="text-gold-500" />
              <p className="text-sm text-slate-300">
                Je, unayo akaunti? Ingia ili kurahisisha usajili wako.
              </p>
              <button 
                onClick={() => { onClose(); onRequireLogin?.(); }}
                className="px-6 py-2 bg-gold-500 text-slate-900 font-black text-xs uppercase tracking-widest rounded-sm hover:bg-gold-400 transition-colors"
              >
                Ingia / Jisajili
              </button>
            </div>
          )}

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jina Kamili *</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none transition-colors"
                placeholder="Weka jina lako"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barua Pepe *</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none transition-colors"
                placeholder="Weka barua pepe yako"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Namba ya Simu</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold-500 focus:outline-none transition-colors"
                placeholder="Hiari (Mf: 0712...)"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-4 bg-primary-950 text-gold-500 border border-gold-500/30 hover:bg-gold-500 hover:text-slate-900 font-black text-sm uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Inasajili...' : 'Kamilisha Usajili'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const TIME_FILTER_LABELS = {
  All: 'Wakati Wote',
  Ongoing: 'Yanayoendelea',
  Upcoming: 'Yajayo',
  Past: 'Yaliyopita'
};

export interface EventsProps {
  user?: AuthUser | null;
  onRequireLogin?: () => void;
}

export const Events: React.FC<EventsProps> = ({ user, onRequireLogin }) => {
  const [modalEventId, setModalEventId] = useState<string | null>(null);
  // Remembered across reloads, otherwise the page forgets you already joined.
  const [registeredIds, setRegisteredIds] = useState<string[]>(() => readRegisteredIds());
  const [statusMessage, setStatusMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Virtual' | 'Physical'>('All');
  const [timeFilter, setTimeFilter] = useState<'All' | 'Ongoing' | 'Upcoming' | 'Past'>('All');
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  useDetailCrumbs(selectedEvent ? [{ label: selectedEvent.title }] : []);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [eventsError, setEventsError] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const loadEvents = async (query?: string) => {
    setLoadingEvents(true);
    setEventsError('');
    try {
      const data = await getEvents(query);
      setEvents(data.map(mapEventFromApi));
    } catch {
      setEventsError('Imeshindikana kupata matukio.');
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void loadEvents(searchQuery);
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const upcomingEvent = useMemo(() => {
    if (!events.length) return null;
    const now = Date.now();
    const futureEvents = events.filter((event) => event.date.getTime() > now);
    if (!futureEvents.length) return null;
    return futureEvents.reduce((prev, curr) =>
      curr.date.getTime() < prev.date.getTime() ? curr : prev
    , futureEvents[0]);
  }, [events]);

  // Upcoming first (soonest at the top), then past ones newest-first. The API
  // returns every active event sorted by start date ascending, so without this
  // the page led with events that finished long ago.
  const filtered = useMemo(() => {
    let byType = events.filter((e) => filter === 'All' || e.type === filter);
    const now = Date.now();

    if (timeFilter === 'Ongoing') {
      byType = byType.filter(e => e.date.getTime() <= now && (!e.endDate || e.endDate.getTime() >= now));
    } else if (timeFilter === 'Upcoming') {
      byType = byType.filter(e => e.date.getTime() > now);
    } else if (timeFilter === 'Past') {
      byType = byType.filter(e => isEventPast(e));
    }

    const upcoming = byType
      .filter((e) => !isEventPast(e))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const past = byType
      .filter((e) => isEventPast(e))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return [...upcoming, ...past];
  }, [events, filter, timeFilter]);

  const handleRegisterClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (registeredIds.includes(id) || registeringId === id) return;

    const ev = events.find(event => event.id === id);
    if (!ev) return;
    if (isEventPast(ev)) {
      setStatusMessage({ kind: 'error', text: 'Tukio hili limeshapita.' });
      return;
    }
    if (isEventFull(ev)) {
      setStatusMessage({ kind: 'error', text: 'Nafasi za tukio hili zimejaa.' });
      return;
    }

    setStatusMessage(null);
    setModalEventId(id);
  };

  const submitRegistration = async (data: { name: string; email: string; phone?: string }) => {
    if (!modalEventId) return;
    
    setRegisteringId(modalEventId);
    const ev = events.find(event => event.id === modalEventId);
    try {
      const response = await registerForEvent(Number(modalEventId), data);
      setRegisteredIds((prev) => {
        const next = prev.includes(modalEventId) ? prev : [...prev, modalEventId];
        persistRegisteredIds(next);
        return next;
      });

      if (response.event) {
        const mappedEvent = mapEventFromApi(response.event);
        setEvents((prev) => prev.map((eventItem) => (eventItem.id === modalEventId ? mappedEvent : eventItem)));
        setSelectedEvent((prev) => (prev && prev.id === modalEventId ? mappedEvent : prev));
      } else {
        void loadEvents();
      }

      setStatusMessage({
        kind: 'ok',
        text: response.detail || `Usajili umekamilika kwa "${ev?.title}". Utaarifiwa kabla ya tukio.`,
      });
      setModalEventId(null);
    } catch (error: any) {
      setStatusMessage({ kind: 'error', text: error?.message || 'Imeshindikana kusajili.' });
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="animate-fade-in pb-32">
      {(eventsError || statusMessage) && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-4 mb-6 mt-6">
        {eventsError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
            {eventsError}
          </div>
        )}

        {statusMessage && (
          <div
            role="status"
            className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-xs font-semibold ${
              statusMessage.kind === 'ok'
                ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              aria-label="Funga ujumbe"
            >
              <X size={14} />
            </button>
          </div>
        )}
        </div>
      )}
      
      {/* 1. UPCOMING HIGHLIGHT - Minimum Bevel */}
      {upcomingEvent && (
        <section 
          onClick={() => setSelectedEvent(upcomingEvent)}
          className="relative bg-slate-900 w-full text-white overflow-hidden cursor-pointer group mb-12"
        >
        <div className="absolute top-0 right-0 w-full h-full">
           <img src={upcomingEvent.image} className="w-full h-full object-cover opacity-40 transition-all duration-1000" alt="" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500 text-primary-950 rounded-sm text-[9px] font-black uppercase tracking-widest">
                 <Star size={12} fill="currentColor" /> TUKIO LIJALO
              </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">{upcomingEvent.title}</h2>
              <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2 text-gold-400"><Calendar size={14}/> {upcomingEvent.date.toLocaleDateString()}</div>
                 <div className="flex items-center gap-2"><Clock size={14}/> {formatTimeRange(upcomingEvent.date, upcomingEvent.endDate)}</div>
                 <div className="flex items-center gap-2"><MapPin size={14}/> {upcomingEvent.location}</div>
              </div>
           </div>
           
           <div className="bg-white/5 backdrop-blur-sm p-6 rounded-sm border border-white/10 space-y-4">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Muda Uliosalia</p>
                <CountdownTimer targetDate={upcomingEvent.date} />
              <button className="w-full py-3 bg-gold-500 text-slate-900 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg">Maelezo Kamili</button>
           </div>
        </div>
          </section>
          )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
      {/* 2. FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
           {(['All', 'Virtual', 'Physical'] as const).map((f) => (
             <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 md:px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-primary-950 text-gold-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tafuta tukio..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-sm pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-950 text-gold-400 hover:bg-gold-500 hover:text-primary-950 rounded-sm text-[10px] font-black uppercase tracking-widest transition-colors shrink-0">
            Tafuta
          </button>
          
          <div className="relative">
            <button 
              type="button" 
              onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
              className="flex items-center gap-2 text-slate-400 hover:text-primary-900 transition-colors ml-2 shrink-0 h-full py-2"
            >
              <Filter size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{timeFilter === 'All' ? 'Chuja' : TIME_FILTER_LABELS[timeFilter]}</span>
            </button>
            {isTimeFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-sm shadow-xl border border-slate-100 dark:border-white/5 z-50 overflow-hidden">
                {(['All', 'Ongoing', 'Upcoming', 'Past'] as const).map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => { setTimeFilter(tf); setIsTimeFilterOpen(false); }}
                    className={`block w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${timeFilter === tf ? 'bg-slate-50 dark:bg-white/5 text-gold-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    {TIME_FILTER_LABELS[tf]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* 3. EVENTS GRID - Minimum Bevel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loadingEvents && (
          <div className="col-span-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-50 dark:border-white/5 text-slate-400 text-xs uppercase tracking-widest font-black">Inapakia matukio...</div>
        )}
        {filtered.map(event => {
          const daysLeft = getDaysLeft(event.date);
          const full = isEventFull(event);
          const registered = registeredIds.includes(event.id);
          const past = isEventPast(event);

          return (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className="group bg-white dark:bg-slate-900 rounded-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-300 hover:border-gold-500/50 hover:shadow-2xl cursor-pointer flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
               <img src={event.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
               <div className="absolute inset-0 bg-black/20"></div>
               <div className="absolute top-4 left-4 flex gap-1">
                  <span className="px-2 py-1 bg-black/80 text-[9px] font-black text-white uppercase tracking-widest rounded-sm">{EVENT_TYPE_LABELS[event.type]}</span>
                  <span className="px-2 py-1 bg-gold-500 text-primary-950 text-[9px] font-black uppercase tracking-widest rounded-sm">{CATEGORY_LABELS[event.category]}</span>
               </div>
            </div>

            <div className="p-8 flex-1 flex flex-col space-y-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gold-500">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {event.date.toLocaleDateString('sw-TZ', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${daysLeft >= 0 ? 'bg-gold-500/15 text-gold-600 dark:text-gold-400' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>
                      {daysLeft > 0 ? `Siku ${daysLeft}` : daysLeft === 0 ? 'Leo' : 'Imepita'}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {formatTimeRange(event.date, event.endDate)}
                  </p>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight group-hover:text-gold-500 transition-colors">
                    {event.title}
                  </h3>
               </div>

                <div className="space-y-4">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-1">Wazungumzaji</p>
                   <div className="space-y-3">
                    {event.speakers.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Hakuna wasemaji bado.
                      </div>
                    )}
                    {event.speakers.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <SpeakerAvatar speaker={s} className="w-11 h-11" iconSize={16} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase truncate">{s.name}</p>
                          <p className="text-[9px] text-slate-500 uppercase font-medium truncate">{s.role}</p>
                        </div>
                      </div>
                    ))}
                   </div>
                </div>

               <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-[10px] font-bold truncate max-w-[120px] uppercase">{event.location}</span>
                  </div>
                  <button 
                    onClick={(e) => handleRegisterClick(e, event.id)}
                    disabled={registeringId === event.id || past || (full && !registered) || registered}
                    className={`px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed ${registered ? 'bg-green-600 text-white' : past || full ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-primary-950 text-gold-400 hover:bg-gold-500 hover:text-primary-950'}`}
                  >
                    {registered ? 'Umesajiliwa Tayari' : past ? 'Limepita' : full ? 'Nafasi Zimejaa' : registeringId === event.id ? 'Inasajili...' : 'Jiunge Sasa'}
                  </button>
               </div>
            </div>
          </div>
          );
        })}
        {!loadingEvents && !filtered.length && (
          <div className="col-span-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-50 dark:border-white/5 text-slate-500 text-xs uppercase tracking-widest font-black">
            Hakuna matukio ya kuonyesha kwa sasa.
          </div>
        )}
      </div>

      </div>
      
      {/* EVENT DETAIL OVERLAY - Minimum Bevel Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex items-start justify-center px-4 md:px-12 pt-28 pb-0 animate-fade-in">
           <div className="bg-white dark:bg-slate-950 w-full max-w-5xl h-full rounded-sm overflow-hidden flex flex-col shadow-2xl border border-white/10 relative">
              <div className="absolute top-6 right-6 z-50 flex gap-2">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     navigator.clipboard.writeText(window.location.href)
                       .then(() => setStatusMessage({ kind: 'ok', text: 'Link imenakiliwa!' }))
                       .catch(() => setStatusMessage({ kind: 'error', text: 'Imeshindikana kunakili link.' }));
                   }}
                   className="p-4 bg-black/40 hover:bg-gold-500 text-white hover:text-slate-900 transition-all rounded-sm"
                   title="Shiriki Tukio Hili"
                 >
                   <Share2 size={24} />
                 </button>
                 <button 
                   onClick={() => setSelectedEvent(null)}
                   className="p-4 bg-black/40 hover:bg-red-600 text-white transition-all rounded-sm"
                 >
                   <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                 <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                    <img src={selectedEvent.image} className="w-full h-full object-cover brightness-[0.3]" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent"></div>
                    <div className="absolute bottom-10 left-10 space-y-4">
                       <div className="flex gap-2">
                          <span className="px-3 py-1 bg-gold-500 text-primary-950 text-[9px] font-black uppercase tracking-widest rounded-sm">{CATEGORY_LABELS[selectedEvent.category]}</span>
                          <span className="px-3 py-1 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-sm">{EVENT_TYPE_LABELS[selectedEvent.type]}</span>
                       </div>
                       <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{selectedEvent.title}</h2>
                    </div>
                 </div>

                 <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-12">
                       <section className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                             <Info size={16} className="text-gold-500" /> Muhtasari wa Tukio
                          </h4>
                          <p className="text-xl md:text-2xl text-slate-800 dark:text-slate-200 leading-relaxed font-medium border-l-4 border-gold-500 pl-8">
                             {selectedEvent.description}
                          </p>
                       </section>

                        <section className="space-y-8">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Wazungumzaji Wakuu</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {selectedEvent.speakers.length === 0 && (
                               <div className="md:col-span-2 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-6 py-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                 Hakuna taarifa za wazungumzaji kwa sasa.
                               </div>
                             )}
                              {selectedEvent.speakers.map((s, i) => (
                                <div key={i} className="flex gap-6 bg-slate-50 dark:bg-white/5 p-6 border border-slate-100 dark:border-white/5 rounded-3xl">
                                   <SpeakerAvatar speaker={s} className="w-24 h-24" iconSize={28} />
                                   <div className="space-y-2 min-w-0">
                                      <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.name}</h5>
                                      <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">{s.role}</p>
                                      <p className="text-xs text-slate-500 leading-relaxed italic">
                                        {s.bio || 'Mzungumzaji mkuu wa tukio hili.'}
                                      </p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </section>

                       <section className="space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Nyenzo za Unabii</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {selectedEvent.resources.length === 0 && (
                               <div className="md:col-span-2 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-6 py-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                 Hakuna nyenzo za tukio hili kwa sasa.
                               </div>
                             )}
                             {selectedEvent.resources.map((res, i) => (
                               <a
                                 key={i}
                                 href={res.url || '#'}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 onClick={(event) => {
                                   if (!res.url) event.preventDefault();
                                 }}
                                 className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-sm group hover:border-gold-500/50 transition-all shadow-sm no-underline"
                               >
                                 <div className="flex items-center gap-4 min-w-0">
                                    <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-sm">
                                       {res.type === 'PDF' ? <FileText size={20}/> : <Play size={20}/>}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide truncate">
                                      {res.name || 'Rasilimali'}
                                    </span>
                                 </div>
                                 <Download size={18} className="text-slate-300 group-hover:text-gold-500 cursor-pointer shrink-0" />
                               </a>
                             ))}
                          </div>
                       </section>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-6">
                       <div className="bg-slate-50 dark:bg-white/5 p-8 border border-slate-100 dark:border-white/5 rounded-sm space-y-8 shadow-sm">
                          <div className="space-y-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-900 flex items-center justify-center text-primary-900 dark:text-gold-500 border border-white/10 rounded-sm shadow-sm">
                                   <Calendar size={24} />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tarehe na Saa</p>
                                   <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedEvent.date.toLocaleDateString('sw-TZ', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatTimeRange(selectedEvent.date, selectedEvent.endDate)}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-900 flex items-center justify-center text-primary-900 dark:text-gold-500 border border-white/10 rounded-sm shadow-sm">
                                   <MapPin size={24} />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mahali</p>
                                   <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedEvent.location}</p>
                                </div>
                             </div>
                          </div>

                          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-sm text-center space-y-3 shadow-inner">
                             <Users size={32} className="mx-auto text-slate-300" />
                             <h5 className="text-2xl font-black text-slate-900 dark:text-white">
                               {selectedEvent.maxAttendees > 0
                                 ? `${selectedEvent.attendees} / ${selectedEvent.maxAttendees}`
                                 : `${selectedEvent.attendees} Waliojiunga`}
                             </h5>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Nafasi Zilizobaki:{' '}
                                {selectedEvent.maxAttendees > 0
                                  ? Math.max(0, selectedEvent.maxAttendees - selectedEvent.attendees)
                                  : 'Bila kikomo'}
                              </p>
                             <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gold-500"
                                  style={{
                                    width: `${
                                      selectedEvent.maxAttendees > 0
                                        ? Math.min(100, (selectedEvent.attendees / selectedEvent.maxAttendees) * 100)
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                             </div>
                          </div>

                          <button 
                            onClick={(e) => handleRegisterClick(e, selectedEvent.id)}
                            disabled={registeringId === selectedEvent.id || isEventPast(selectedEvent) || (isEventFull(selectedEvent) && !registeredIds.includes(selectedEvent.id)) || registeredIds.includes(selectedEvent.id)}
                            className={`w-full py-5 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${registeredIds.includes(selectedEvent.id) ? 'bg-green-600 text-white' : isEventFull(selectedEvent) ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-primary-950 text-gold-400 hover:bg-gold-500 hover:text-primary-950'}`}
                          >
                             {registeredIds.includes(selectedEvent.id) ? 'Umesajiliwa Tayari' : isEventPast(selectedEvent) ? 'Tukio Limepita' : isEventFull(selectedEvent) ? 'Nafasi Zimejaa' : registeringId === selectedEvent.id ? 'Inasajili...' : 'Hifadhi Nafasi Yangu'}
                          </button>
                       </div>

                       <div className="p-8 bg-gold-500 text-primary-950 rounded-sm relative overflow-hidden group shadow-lg">
                          <div className="absolute top-0 right-0 p-8 opacity-10"><AlertCircle size={80}/></div>
                          <h5 className="text-lg font-black uppercase italic leading-none mb-3">Taarifa!</h5>
                          <p className="text-xs font-bold leading-relaxed">Taarifa za mfumo zitatumwa kwenye barua pepe yako iliyothibitishwa na kwenye Kituo cha Taarifa kabla ya tukio kuanza.</p>
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      )}

      <EventRegistrationModal 
        isOpen={!!modalEventId}
        onClose={() => setModalEventId(null)}
        event={events.find(e => e.id === modalEventId) || null}
        user={user}
        onRequireLogin={onRequireLogin}
        onSubmit={submitRegistration}
        isSubmitting={!!registeringId}
      />
    </div>
  );
};
