
import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, CheckCircle, Clock, 
  Users, Filter, Sparkles, ChevronRight, 
  X, Download, Bell, Share2, AlertCircle,
  FileText, Play, User, ArrowRight, Info, Star
} from 'lucide-react';

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

const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Global Mission Summit 2025',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 43200000),
    location: 'Dar es Salaam / Live Stream',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    description: 'Mkutano mkuu wa wamisionari wa kidijitali Afrika Mashariki. Lengo ni kuwapa vifaa na mbinu za kisasa vijana na wahubiri kutumia mitandao ya kijamii kufikisha injili ya milele kwa kila lugha na kabila.',
    type: 'Virtual',
    category: 'Summit',
    attendees: 1240,
    maxAttendees: 5000,
    speakers: [
      { name: 'Pr. John Mark', role: 'Mkurugenzi wa Misheni', img: 'https://i.pravatar.cc/150?u=1', bio: 'Mtaalamu wa teolojia na uongozi wa misheni kwa miaka 20.' },
      { name: 'Sarah J.', role: 'Digital Strategist', img: 'https://i.pravatar.cc/150?u=2', bio: 'Mtaalamu wa mawasiliano ya digitali na uinjilisti wa mitandao.' }
    ],
    resources: [
      { name: 'Mkakati wa Digitali 2025', type: 'PDF', url: '#' },
      { name: 'Intro Video', type: 'Video', url: '#' }
    ]
  },
  {
    id: '2',
    title: 'Unabii: Danieli na Ufunuo',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    location: 'Arusha Convention Centre',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=1200',
    description: 'Uchambuzi wa kina wa unabii wa Biblia kwa kutumia ushahidi wa kihistoria na akiolojia. Somo hili litaangazia sanamu ya Danieli 2 na wanyama wanne wa Danieli 7 kuelekea marejeo ya mara ya pili ya Kristo.',
    type: 'Physical',
    category: 'Seminar',
    attendees: 450,
    maxAttendees: 500,
    speakers: [{ name: 'Dr. David E.', role: 'Mtaalamu wa Akiolojia', img: 'https://i.pravatar.cc/150?u=3', bio: 'Mchunguzi wa mabaki ya kale ya Biblia Mashariki ya Kati.' }],
    resources: [{ name: 'Ramani ya Unabii', type: 'PDF', url: '#' }]
  },
  {
    id: '3',
    title: 'Mwanza Revival Week',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: 'Rock City Grounds',
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1200',
    description: 'Wiki ya uamsho wa kiroho na ubatizo mkubwa. Tutakuwa na vipindi vya maombi, nyimbo za sifa, na mafundisho ya neno la Mungu yanayolenga kurejesha upendo wa kwanza kwa Kristo.',
    type: 'Physical',
    category: 'Revival',
    attendees: 1950,
    maxAttendees: 2000,
    speakers: [{ name: 'Ev. Peter Malisa', role: 'Mwinjilisti wa Kimataifa', img: 'https://i.pravatar.cc/150?u=4', bio: 'Amezunguka nchi nyingi akitangaza ujumbe wa malaika watatu.' }],
    resources: [{ name: 'Nyimbo za Sifa', type: 'Link', url: '#' }]
  }
];

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
  const [filter, setFilter] = useState<'All' | 'Virtual' | 'Physical'>('All');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const upcomingEvent = INITIAL_EVENTS.reduce((prev, curr) => 
    (curr.date.getTime() < prev.date.getTime() && curr.date.getTime() > Date.now()) ? curr : prev
  , INITIAL_EVENTS[0]);

  const filtered = INITIAL_EVENTS.filter(e => filter === 'All' || e.type === filter);

  const handleRegister = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!registeredIds.includes(id)) {
      setRegisteredIds([...registeredIds, id]);
      // Link to notification system simulation
      const ev = INITIAL_EVENTS.find(event => event.id === id);
      alert(`Imekamilika! Tukio la "${ev?.title}" limeongezwa kwenye ratiba yako na utapata taarifa (Notification) saa 24 kabla.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-32">
      
      {/* 1. UPCOMING HIGHLIGHT - Minimum Bevel */}
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
        {filtered.map(event => (
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
                  </div>
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
                    className={`px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${registeredIds.includes(event.id) ? 'bg-green-600 text-white' : 'bg-primary-950 text-gold-400 hover:bg-gold-500 hover:text-primary-950'}`}
                  >
                    {registeredIds.includes(event.id) ? 'Registered' : 'Join Now'}
                  </button>
               </div>
            </div>
          </div>
        ))}
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
                                   <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
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
                            className={`w-full py-5 rounded-sm font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md ${registeredIds.includes(selectedEvent.id) ? 'bg-green-600 text-white' : 'bg-primary-950 text-gold-400 hover:bg-gold-500 hover:text-primary-950'}`}
                          >
                             {registeredIds.includes(selectedEvent.id) ? 'Already Registered' : 'Secure My Seat'}
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
