
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Globe, Users, BookOpen, ShieldCheck, 
  Target, Star, Lightbulb, User, 
  Mail, Phone, Church, Microscope, Clock, Download,
  Activity, Zap, MapPin, Quote, FileText, CheckCircle2,
  BarChart3, Layers, ArrowRight
} from 'lucide-react';
import { getTeamMembers } from '../../services/content/aboutService';

interface TeamLeader {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  accentColor: string;
}

const DEFAULT_LEADERS: TeamLeader[] = [
  {
    id: 'lead-1',
    name: 'Frank Majibwene',
    role: 'Rais',
    email: 'president@godcares365.org',
    phone: '+255 744 780 244',
    avatarUrl: '',
    accentColor: '#eab308',
  },
  {
    id: 'lead-2',
    name: 'Nobert Goodluck',
    role: 'Makamu wa Rais',
    email: 'vp@godcares365.org',
    phone: '+255 655 464 655',
    avatarUrl: '',
    accentColor: '#2563eb',
  },
  {
    id: 'lead-3',
    name: 'Neema Athuman',
    role: 'Katibu',
    email: 'secretary@godcares365.org',
    phone: '+255 713 000 000',
    avatarUrl: '',
    accentColor: '#475569',
  },
  {
    id: 'lead-4',
    name: 'Elson Salala',
    role: 'Mkur. Uinjilisti na Uenezi',
    email: 'evangelism@godcares365.org',
    phone: '+255 700 000 000',
    avatarUrl: '',
    accentColor: '#059669',
  },
];

export const AboutUs: React.FC = () => {
  const [teamLeaders, setTeamLeaders] = useState<TeamLeader[]>(DEFAULT_LEADERS);
  const [teamError, setTeamError] = useState('');

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const data = await getTeamMembers();
        const mapped: TeamLeader[] = data.map((member) => ({
          id: String(member.id),
          name: member.name,
          role: member.role,
          email: member.email || '',
          phone: member.phone || '',
          avatarUrl: member.avatar_url || '',
          accentColor: member.accent_color || '#eab308',
        }));
        if (mapped.length) {
          setTeamLeaders(mapped);
        }
      } catch {
        setTeamError('Imeshindikana kupakua taarifa za viongozi. Tunaonyesha data ya msingi.');
      }
    };

    loadTeam();
  }, []);

  const leaders = useMemo(
    () => (teamLeaders.length ? teamLeaders : DEFAULT_LEADERS),
    [teamLeaders]
  );
  const featuredLeader = leaders[0] || DEFAULT_LEADERS[0];

  return (
    <div className="space-y-12 md:space-y-16 animate-fade-in pb-28 md:pb-32 max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
       
       {/* 1. Philosophy Section (Now Main Header - Centered, No Image Card) */}
       <section className="max-w-3xl mx-auto text-center space-y-5 md:space-y-6">
          <div className="flex items-center justify-center gap-2 text-gold-500 font-black text-xs sm:text-sm uppercase tracking-[0.14em]">
             <Lightbulb size={14} /> Falsafa Yetu
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
             Mungu Anajali, <br/><span className="text-gold-500">Ukweli Ni Muhimu.</span>
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
             <p>
                 Tunaishi katika kipindi ambacho ukweli unapotoshwa na kupuuzwa. God Cares 365 ilizaliwa kwa mzigo wa kuwasaidia watu wanaopotea na kuwaonyesha kwamba Mungu hajawaacha; ukweli wake ndio uhuru wa kweli.
             </p>
             <div className="inline-block px-6 py-2 border-l-2 border-r-2 border-gold-500/30 italic text-slate-500 text-sm bg-slate-50 dark:bg-white/5 rounded-lg">
                "Hatuhubiri dini, tunahubiri Kristo na Neno lake lililo hai."
             </div>
          </div>
          
          {/* Independent Ministry Disclaimer */}
          <div className="pt-2 flex justify-center">
             <div className="flex gap-2 items-center opacity-70">
                <Church size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.08em] leading-tight">
                   God Cares 365 ni huduma huru inayofuata miongozo ya Kanisa la Waadventista Wasabato.
                </p>
             </div>
          </div>
       </section>

       {/* 2. Leadership Section - Square/Boxy Cards */}
       <section className="space-y-6 pt-4 md:pt-8">
          <div className="text-center space-y-2">
             <h3 className="text-xs sm:text-sm font-black text-gold-500 uppercase tracking-[0.2em]">TIMU YA UONGOZI</h3>
             <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Viongozi Wetu</h2>
          </div>

          {teamError && (
            <div className="text-center text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {teamError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
             {leaders.map((leader) => (
                <div key={leader.id} className="flex flex-col items-center justify-center text-center gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:border-gold-500/30 hover:shadow-lg transition-all group relative overflow-hidden min-h-[228px] sm:aspect-square">
                   <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: leader.accentColor }}></div>
                    
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform mb-1 overflow-hidden" style={{ backgroundColor: leader.accentColor }}>
                       {leader.avatarUrl ? (
                         <img src={leader.avatarUrl} alt={leader.name} className="w-full h-full object-cover" />
                       ) : (
                         <User size={24} />
                       )}
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{leader.name}</h4>
                      <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] leading-tight w-full px-2">{leader.role}</p>
                    </div>

                    <div className="flex gap-3 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                       {leader.email && (
                        <a href={`mailto:${leader.email}`} className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10"><Mail size={14}/></a>
                       )}
                       {leader.phone && (
                        <a href={`tel:${leader.phone}`} className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-green-600 hover:bg-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/10"><Phone size={14}/></a>
                       )}
                    </div>
                </div>
             ))}
          </div>
        </section>

       {/* 3. Message from the President - Full Text Restored */}
       <section className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12">
             {/* Left Column: Profile */}
             <div className="lg:col-span-3 bg-slate-50 dark:bg-black/20 p-6 sm:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-0.5 bg-gradient-to-tr from-gold-400 to-gold-600 shadow-md mb-3">
                   <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative flex items-center justify-center">
                      {featuredLeader.avatarUrl ? (
                        <img src={featuredLeader.avatarUrl} alt={featuredLeader.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-white/50" />
                      )}
                    </div>
                 </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight text-center">{featuredLeader.name}</h4>
                <p className="text-xs sm:text-sm font-black text-gold-500 uppercase tracking-[0.1em] text-center">{featuredLeader.role}</p>
             </div>

             {/* Right Column: The Message */}
             <div className="lg:col-span-9 p-5 sm:p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                   <div className="h-[2px] w-6 bg-gold-500"></div>
                   <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">
                      Ujumbe Kutoka kwa Rais
                   </h3>
                </div>
                
                <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed font-serif">
                   <p>
                      "Habari, rafiki! Umechanganyikiwa? Umedanganywa? Unautafuta ukweli? Una roho ya udadisi? Unataka kujifunza zaidi? Je, unajua uko ndani kabisa ya moyo wa Mungu?"
                   </p>
                   <p className="font-bold text-slate-900 dark:text-white">
                      "Jukwaa hili limetengenezwa mahususi kwa ajili yako. Hapa utapata mambo yatakayokusaidia kuujua ukweli."
                   </p>
                   <p>
                      "Katika pambano kuu kati ya wema na uovu, hii ndiyo changamoto kubwa tunayopaswa kuitatua: <span className="text-gold-600 dark:text-gold-400 italic">kuugundua ukweli, kuuishi ukweli, na kuufuata ukweli.</span>"
                   </p>
                   <p>
                      "Timu ya God Cares 365 inakutakia safari njema unapotumia jukwaa hili lililoandaliwa kwa ajili yako na kugundua mengi yaliyofichwa nyuma ya pazia kupitia nuru ya Neno la Mungu."
                   </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-start justify-between gap-3">
                   <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.08em] leading-relaxed">
                      "Amani ya Bwana wetu Yesu Kristo, na upendo wa Mungu Baba, na ushirika wa Roho Mtakatifu uwe pamoja nawe. Amina."
                   </p>
                   <div className="text-gold-500 opacity-50">
                      <Quote size={16} />
                   </div>
                </div>
             </div>
          </div>
       </section>

       {/* 4. Compact Impact & Features Dashboard */}
       <section className="bg-[color:var(--surface-2)] dark:bg-slate-950 rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="relative z-10 space-y-8">
             
             {/* Section Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 text-gold-500 font-black text-xs sm:text-sm uppercase tracking-[0.18em]">
                   <Activity size={12} className="animate-pulse" /> Hali
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                   Takwimu & Nyenzo
                </h3>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                 
                 {/* LEFT: Compact Stats */}
                 <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                      <h4 className="text-xs sm:text-sm font-black text-slate-700 dark:text-white uppercase tracking-[0.12em]">Mwenendo</h4>
                      <div className="flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                         <span className="text-xs font-bold text-green-500 uppercase">Sasa</span>
                      </div>
                   </div>

                    {/* Tighter Grid for Circles */}
                   <div className="grid grid-cols-3 gap-3 sm:gap-4">
                       {/* Circular Item 1 */}
                       <div className="flex flex-col items-center gap-2 group">
                         <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                               <path className="text-slate-200 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                               <path className="text-gold-500" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                               <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">100%</span>
                            </div>
                         </div>
                         <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-white uppercase text-center">Biblia</p>
                       </div>

                       {/* Circular Item 2 */}
                       <div className="flex flex-col items-center gap-2 group">
                         <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                               <path className="text-slate-200 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                               <path className="text-blue-500" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                               <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">7+</span>
                            </div>
                         </div>
                         <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-white uppercase text-center">Lugha</p>
                       </div>

                       {/* Circular Item 3 */}
                       <div className="flex flex-col items-center gap-2 group">
                         <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-900">
                            <div className="text-center">
                               <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white block">50K</span>
                            </div>
                         </div>
                         <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-white uppercase text-center">Watu</p>
                       </div>
                    </div>

                    {/* Compact Bar */}
                   <div className="bg-[color:var(--surface-1)] dark:bg-white/5 p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-white/5">
                       <div className="flex justify-between items-end mb-1">
                         <h5 className="text-xs sm:text-sm font-black text-slate-700 dark:text-white uppercase tracking-[0.08em]">Mataifa</h5>
                         <span className="text-base sm:text-lg font-black text-gold-500">12+</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gold-500 w-3/4 rounded-full"></div>
                       </div>
                    </div>
                 </div>

                 {/* RIGHT: Compact Tools Grid */}
                 <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                      <h4 className="text-xs sm:text-sm font-black text-slate-700 dark:text-white uppercase tracking-[0.12em]">Zana</h4>
                      <Zap size={14} className="text-gold-500" />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      {[
                         { icon: <Microscope size={16} />, title: "Uchambuzi", desc: "Uchunguzi wa kina.", color: "text-purple-500 dark:text-purple-400" },
                         { icon: <Clock size={16} />, title: "Nyakati", desc: "Ramani za nyakati.", color: "text-blue-500 dark:text-blue-400" },
                         { icon: <ShieldCheck size={16} />, title: "Ufichuzi", desc: "Kufichua uongo.", color: "text-red-500 dark:text-red-400" },
                         { icon: <Download size={16} />, title: "Upakuaji", desc: "Maktaba ya bure.", color: "text-green-500 dark:text-green-400" },
                         { icon: <Target size={16} />, title: "Imani", desc: "Mashujaa wa imani.", color: "text-gold-500" },
                         { icon: <Activity size={16} />, title: "Maendeleo", desc: "Maendeleo yako.", color: "text-cyan-500 dark:text-cyan-400" }
                      ].map((tool, i) => (
                         <div key={i} className="bg-[color:var(--surface-1)] dark:bg-white/5 hover:bg-[color:var(--surface-3)] dark:hover:bg-white/10 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-white/5 transition-all group cursor-default">
                            <div className={`mb-2 ${tool.color} bg-white dark:bg-white/5 w-fit p-2 rounded-lg group-hover:scale-110 transition-transform shadow-sm`}>{tool.icon}</div>
                            <h5 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{tool.title}</h5>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-snug font-medium">{tool.desc}</p>
                         </div>
                      ))}
                   </div>
                </div>

             </div>
          </div>
       </section>

       {/* 6. Newsletter Subscription (Replaces Call to Action) */}
       <section className="text-center space-y-6 pt-4 pb-2">
          <div className="max-w-xl mx-auto space-y-2">
             <div className="inline-flex items-center gap-2 text-gold-500 font-black text-xs sm:text-sm uppercase tracking-[0.14em] mb-1">
                <Mail size={14} /> Taarifa za Kila Wiki
             </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                 Jiunge na Jarida Letu
              </h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">
                 Pata uchambuzi wa unabii, habari za misheni, na mafundisho mapya moja kwa moja kwenye barua pepe yako kila wiki.
              </p>
          </div>

          <div className="max-w-md mx-auto relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 to-primary-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative flex flex-col sm:flex-row sm:items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-white/10 shadow-xl gap-1.5 sm:gap-0">
                <div className="pl-3 sm:pl-4 text-slate-400 hidden sm:block">
                   <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Weka barua pepe yako hapa..."
                  className="w-full bg-transparent px-3 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
                <button className="bg-primary-900 text-gold-400 px-4 sm:px-6 py-2.5 rounded-lg font-black text-xs sm:text-sm uppercase tracking-[0.1em] hover:bg-gold-500 hover:text-primary-950 transition-all shadow-lg shrink-0 flex items-center justify-center gap-1 group/btn w-full sm:w-auto">
                   Jiunge <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.08em]">
             Hatutumi spam. Unaweza kujiondoa wakati wowote.
          </p>
       </section>

    </div>
  );
};


