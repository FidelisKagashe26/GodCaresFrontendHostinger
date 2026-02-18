
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Calendar, MapPin, CheckCircle, Clock, 
  Users, Filter, Sparkles, ChevronRight, 
  X, Download, Bell, Share2, AlertCircle,
  FileText, Play, User, ArrowRight, Info, Star
} from 'lucide-react';
import { EventApi, getEvents, registerForEvent } from '../services/eventService';

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

const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = +targetDate - +new Date();
      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
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

export const Events: React.FC = () => {
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Virtual' | 'Physical'>('All');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [eventsError, setEventsError] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      setEventsError('');
      try {
        const data = await getEvents();
        const mapped = data.map((item): Event => ({
          id: String(item.id),
          title: item.title,
          date: toDate(item.starts_at) || new Date(),
          endDate: toDate(item.ends_at || null),
          location: item.location,
          image: item.image,
          description: item.description,
          type: item.event_type,
          category: item.category,
          attendees: item.attendees,
          maxAttendees: item.max_attendees,
          speakers: item.speakers || [],
          resources: item.resources || [],
        }));
        setEvents(mapped);
      } catch (error) {
        setEventsError('Imeshindikana kupata matukio.');
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
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

  const filtered = events.filter(e => filter === 'All' || e.type === filter);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const resolveRegistrant = (): { name: string; email: string } | null => {
    try {
      const raw = localStorage.getItem('gc365_user');
      const parsed = raw ? JSON.parse(raw) : null;
      const name = (parsed?.name || '').toString().trim();
      const email = (parsed?.email || '').toString().trim();
      if (name && email && isValidEmail(email)) {
        return { name, email };
      }
    } catch {
      // Fall back to prompt.
    }

    const name = window.prompt('Weka jina lako kamili kwa usajili wa tukio:');
    if (!name || !name.trim()) {
      return null;
    }

    const email = window.prompt('Weka barua pepe yako (email):');
    if (!email || !isValidEmail(email.trim())) {
      alert('Email uliyoingiza si sahihi.');
      return null;
    }

    return { name: name.trim(), email: email.trim() };
  };

  const handleRegister = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (registeredIds.includes(id) || registeringId === id) return;

    const ev = events.find(event => event.id === id);
    if (!ev) return;

    const registrant = resolveRegistrant();
    if (!registrant) return;

    setRegisteringId(id);
    try {
      await registerForEvent(Number(id), registrant);
      setRegisteredIds((prev) => prev.includes(id) ? prev : [...prev, id]);
      alert(`Usajili umekamilika kwa "${ev.title}". Utaarifiwa kabla ya tukio.`);
    } catch (error: any) {
      alert(error?.message || 'Imeshindikana kusajili.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-32">
      {eventsError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
          {eventsError}
        </div>
      )}
      
      {/* 1. UPCOMING HIGHLIGHT - Minimum Bevel */}
      {upcomingEvent && (
        <section 
          onClick={() => setSelectedEvent(upcomingEvent)}
          className="relative bg-slate-900 rounded-sm p-8 md:p-12 text-white overflow-hidden border border-white/5 cursor-pointer group hover:border-gold-500/30 transition-all shadow-xl"
        >
        <div className="absolute top-0 right-0 w-full h-full">
           <img src={upcomingEvent.image} className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-1000" alt="" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500 text-primary-950 rounded-sm text-[9px] font-black uppercase tracking-widest">
                 <Star size={12} fill="currentColor" /> UPCOMING_EVENT_URGENT
              </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight">{upcomingEvent.title}</h2>
              <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2 text-gold-400"><Calendar size={14}/> {upcomingEvent.date.toLocaleDateString()}</div>
                 <div className="flex items-center gap-2"><Clock size={14}/> {formatTimeRange(upcomingEvent.date, upcomingEvent.endDate)}</div>
                 <div className="flex items-center gap-2"><MapPin size={14}/> {upcomingEvent.location}</div>
              </div>
           </div>
           
           <div className="bg-white/5 backdrop-blur-md p-6 rounded-sm border border-white/10 space-y-4">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Countdown kwa Event</p>
                <CountdownTimer targetDate={upcomingEvent.date} />
              <button className="w-full py-3 bg-white text-primary-950 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 transition-all shadow-lg">Maelezo Kamili</button>
           </div>
        </div>
          </section>
          )}

      {/* 2. FILTERS */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
        <div className="flex gap-2">
           {['All', 'Virtual', 'Physical'].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f as any)}
               className={`px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary-950 text-gold-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
        <button className="flex items-center gap-2 text-slate-400 hover:text-primary-900 transition-colors">
          <Filter size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
        </button>
      </div>

      {/* 3. EVENTS GRID - Minimum Bevel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loadingEvents && (
          <div className="col-span-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-50 dark:border-white/5 text-slate-400 text-xs uppercase tracking-widest font-black">Inapakia matukio...</div>
        )}
        {filtered.map(event => {
          const daysLeft = getDaysLeft(event.date);

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
                  <span className="px-2 py-1 bg-black/80 text-[9px] font-black text-white uppercase tracking-widest rounded-sm">{event.type}</span>
                  <span className="px-2 py-1 bg-gold-500 text-primary-950 text-[9px] font-black uppercase tracking-widest rounded-sm">{event.category}</span>
               </div>
            </div>

            <div className="p-8 flex-1 flex flex-col space-y-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gold-500">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-1">Speakers</p>
                  <div className="space-y-3">
                    {event.speakers.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                         <img src={s.img} className="w-9 h-9 rounded-sm object-cover grayscale group-hover:grayscale-0 transition-all border border-slate-200 dark:border-white/10" alt={s.name} />
                         <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">{s.name}</p>
                            <p className="text-[9px] text-slate-500 uppercase font-medium">{s.role}</p>
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
                    onClick={(e) => handleRegister(e, event.id)}
                    disabled={registeringId === event.id}
                    className={`px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${registeredIds.includes(event.id) ? 'bg-green-600 text-white' : 'bg-primary-950 text-gold-400 hover:bg-gold-500 hover:text-primary-950'}`}
                  >
                    {registeredIds.includes(event.id) ? 'Registered' : registeringId === event.id ? 'Inasajili...' : 'Join Now'}
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

      {/* EVENT DETAIL OVERLAY - Minimum Bevel Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-fade-in">
           <div className="bg-white dark:bg-slate-950 w-full max-w-5xl h-full md:h-[90vh] rounded-sm overflow-hidden flex flex-col shadow-2xl border border-white/10 relative">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 z-50 p-4 bg-black/40 hover:bg-red-600 text-white transition-all rounded-sm"
              >
                <X size={24} />
              </button>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                 <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                    <img src={selectedEvent.image} className="w-full h-full object-cover brightness-[0.3]" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent"></div>
                    <div className="absolute bottom-10 left-10 space-y-4">
                       <div className="flex gap-2">
                          <span className="px-3 py-1 bg-gold-500 text-primary-950 text-[9px] font-black uppercase tracking-widest rounded-sm">{selectedEvent.category}</span>
                          <span className="px-3 py-1 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-sm">{selectedEvent.type}</span>
                       </div>
                       <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{selectedEvent.title}</h2>
                    </div>
                 </div>

                 <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-12">
                       <section className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                             <Info size={16} className="text-gold-500" /> Event Synthesis
                          </h4>
                          <p className="text-xl md:text-2xl text-slate-800 dark:text-slate-200 leading-relaxed font-medium border-l-4 border-gold-500 pl-8">
                             {selectedEvent.description}
                          </p>
                       </section>

                       <section className="space-y-8">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Official Speakers</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {selectedEvent.speakers.map((s, i) => (
                               <div key={i} className="flex gap-6 bg-slate-50 dark:bg-white/5 p-6 border border-slate-100 dark:border-white/5 rounded-sm">
                                  <img src={s.img} className="w-24 h-24 rounded-sm object-cover grayscale shadow-md" alt="" />
                                  <div className="space-y-1">
                                     <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.name}</h5>
                                     <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest mb-2">{s.role}</p>
                                     <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 italic">{s.bio}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </section>

                       <section className="space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Prophetic Resources</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {selectedEvent.resources.map((res, i) => (
                               <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-sm group hover:border-gold-500/50 transition-all shadow-sm">
                                  <div className="flex items-center gap-4">
                                     <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-sm">
                                        {res.type === 'PDF' ? <FileText size={20}/> : <Play size={20}/>}
                                     </div>
                                     <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{res.name}</span>
                                  </div>
                                  <Download size={18} className="text-slate-300 group-hover:text-gold-500 cursor-pointer" />
                               </div>
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
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time & Date</p>
                                   <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatTimeRange(selectedEvent.date, selectedEvent.endDate)}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-900 flex items-center justify-center text-primary-900 dark:text-gold-500 border border-white/10 rounded-sm shadow-sm">
                                   <MapPin size={24} />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location Hub</p>
                                   <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedEvent.location}</p>
                                </div>
                             </div>
                          </div>

                          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-sm text-center space-y-3 shadow-inner">
                             <Users size={32} className="mx-auto text-slate-300" />
                             <h5 className="text-2xl font-black text-slate-900 dark:text-white">{selectedEvent.attendees} / {selectedEvent.maxAttendees}</h5>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Spots: {selectedEvent.maxAttendees - selectedEvent.attendees}</p>
                             <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gold-500" style={{ width: `${(selectedEvent.attendees / selectedEvent.maxAttendees) * 100}%` }}></div>
                             </div>
                          </div>

                          <button 
                            onClick={(e) => handleRegister(e, selectedEvent.id)}
                            disabled={registeringId === selectedEvent.id}
                            className={`w-full py-5 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md ${registeredIds.includes(selectedEvent.id) ? 'bg-green-600 text-white' : 'bg-primary-950 text-gold-400 hover:bg-gold-500 hover:text-primary-950'}`}
                          >
                             {registeredIds.includes(selectedEvent.id) ? 'Already Registered' : registeringId === selectedEvent.id ? 'Inasajili...' : 'Secure My Seat'}
                          </button>
                       </div>

                       <div className="p-8 bg-gold-500 text-primary-950 rounded-sm relative overflow-hidden group shadow-lg">
                          <div className="absolute top-0 right-0 p-8 opacity-10"><AlertCircle size={80}/></div>
                          <h5 className="text-lg font-black uppercase italic leading-none mb-3">Notice!</h5>
                          <p className="text-xs font-bold leading-relaxed">System notifications will be sent to your verified email and Notification Center before the start.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50 dark:bg-black/20">
                 <div className="flex items-center gap-3">
                    <Share2 size={20} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-[0.2em]">Broadcast Event to Network</span>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setSelectedEvent(null)} className="px-10 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-lg">Funga</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
