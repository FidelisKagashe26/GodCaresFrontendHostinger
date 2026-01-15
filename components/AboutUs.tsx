
import React from 'react';
import { 
  Globe, Users, BookOpen, ShieldCheck, 
  Target, Star, Lightbulb, User, 
  Mail, Phone, Church, Microscope, Clock, Download,
  Activity, Zap, MapPin, Quote, FileText, CheckCircle2,
  BarChart3, Layers, ArrowRight
} from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="space-y-16 animate-fade-in pb-32 max-w-7xl mx-auto px-4 md:px-6 pt-12">
       
       {/* 1. Philosophy Section (Now Main Header - Centered, No Image Card) */}
       <section className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-gold-500 font-black text-[9px] uppercase tracking-[0.2em]">
             <Lightbulb size={12} /> Falsafa Yetu
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
             Mungu Anajali, <br/><span className="text-gold-500">Ukweli Ni Muhimu.</span>
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
             <p>
                Tunaishi katika kipindi cha <strong>"Post-Truth"</strong>. God Cares 365 ilizaliwa kwa mzigo wa kusaidia watu wanaopotea, kuwaonyesha kuwa Mungu hakukuacha na Ukweli wake ndio uhuru pekee.
             </p>
             <div className="inline-block px-6 py-2 border-l-2 border-r-2 border-gold-500/30 italic text-slate-500 text-xs bg-slate-50 dark:bg-white/5 rounded-lg">
                "Hatuhubiri dini, tunahubiri Kristo na Neno lake lililo hai."
             </div>
          </div>
          
          {/* Independent Ministry Disclaimer */}
          <div className="pt-2 flex justify-center">
             <div className="flex gap-2 items-center opacity-70">
                <Church size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[8px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wide leading-tight">
                   God Cares 365 is an independent ministry following the guidelines of the Seventh-day Adventist Church.
                </p>
             </div>
          </div>
       </section>

       {/* 2. Leadership Section - Square/Boxy Cards */}
       <section className="space-y-6 pt-8">
          <div className="text-center space-y-2">
             <h3 className="text-[8px] font-black text-gold-500 uppercase tracking-[0.4em]">TIMU YA UONGOZI</h3>
             <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Viongozi Wetu</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
                { 
                  name: "Frank Majibwene", 
                  role: "President", 
                  icon: <User size={20} />, 
                  color: "bg-gold-500",
                  email: "president@godcares365.org",
                  phone: "+255 744 780 244"
                },
                { 
                  name: "Nobert Goodluck", 
                  role: "Vice President", 
                  icon: <User size={20} />, 
                  color: "bg-primary-600",
                  email: "vp@godcares365.org",
                  phone: "+255 655 464 655"
                },
                { 
                  name: "Neema Athuman", 
                  role: "Secretary", 
                  icon: <User size={20} />, 
                  color: "bg-slate-600",
                  email: "secretary@godcares365.org",
                  phone: "+255 713 000 000"
                },
                { 
                  name: "Elson Salala", 
                  role: "Dir. Evangelism & Outreach", 
                  icon: <User size={20} />, 
                  color: "bg-emerald-600",
                  email: "evangelism@godcares365.org",
                  phone: "+255 700 000 000"
                }
             ].map((leader, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:border-gold-500/30 hover:shadow-lg transition-all group relative overflow-hidden aspect-square">
                   {/* Top Color Line */}
                   <div className={`absolute top-0 left-0 w-full h-1 ${leader.color}`}></div>
                   
                   <div className={`w-14 h-14 rounded-2xl ${leader.color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform mb-1`}>
                      {leader.icon}
                   </div>
                   
                   <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{leader.name}</h4>
                      <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate w-full px-2">{leader.role}</p>
                   </div>

                   <div className="flex gap-3 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <a href={`mailto:${leader.email}`} className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-white transition-all border border-transparent hover:border-slate-100"><Mail size={12}/></a>
                      <a href={`tel:${leader.phone}`} className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-white transition-all border border-transparent hover:border-slate-100"><Phone size={12}/></a>
                   </div>
                </div>
             ))}
          </div>
       </section>

       {/* 3. Message from the President - Full Text Restored */}
       <section className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12">
             {/* Left Column: Profile */}
             <div className="lg:col-span-3 bg-slate-50 dark:bg-black/20 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/5">
                <div className="w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-gold-400 to-gold-600 shadow-md mb-3">
                   <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative flex items-center justify-center">
                      <User size={48} className="text-white/50" />
                   </div>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight text-center">Frank Majibwene</h4>
                <p className="text-[8px] font-black text-gold-500 uppercase tracking-widest text-center">President & Founder</p>
             </div>

             {/* Right Column: The Message */}
             <div className="lg:col-span-9 p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                   <div className="h-[2px] w-6 bg-gold-500"></div>
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                      Ujumbe Kutoka kwa Rais
                   </h3>
                </div>
                
                <div className="space-y-4 text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed font-serif">
                   <p>
                      "Habari rafiki! Umechanagnyikiwa? Umedanganywa? Unautafuta Ukweli? Una roho ya Udadisi? Unataka kujifunza zaidi? Je! Unajua upo ndani kabisa kwenye Moyo wa Mungu?"
                   </p>
                   <p className="font-bold text-slate-900 dark:text-white">
                      "Platform hii imetengenezwa Mahususi kwa ajili yako, hapa utapata kila kitu kitakachokusaidia kuujua ukweli."
                   </p>
                   <p>
                      "Kwenye Pambano Kuu kati ya Wema na Uovu hii ndio Changamoto kubwa Tunayopaswa kuitatua: <span className="text-gold-600 dark:text-gold-400 italic">Kuugundua ukweli, Kuuishi ukweli na Kuufuata ukweli.</span>"
                   </p>
                   <p>
                      "Timu ya GodCares365 inakutakia safari njema unaposafiri kwenye platform hii iliyoandaliwa kwa ajili yako na kugundua Mengi yaliyofichwa nyuma ya Pazia na Gizani kupitia nuru ya Neno la Mungu."
                   </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      "Amani ya Bwana wetu Yesu Kristo na upendo wa Mungu Baba na Ushirika wa Roho Mtakatifu uwe Pamoja nawe. Amina."
                   </p>
                   <div className="text-gold-500 opacity-50">
                      <Quote size={16} />
                   </div>
                </div>
             </div>
          </div>
       </section>

       {/* 4. Compact Impact & Features Dashboard */}
       <section className="bg-slate-950 rounded-2xl p-6 relative overflow-hidden border border-slate-800 shadow-xl">
          <div className="relative z-10 space-y-8">
             
             {/* Section Header */}
             <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 text-gold-500 font-black text-[9px] uppercase tracking-[0.3em]">
                   <Activity size={12} className="animate-pulse" /> Status
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                   Takwimu & Nyenzo
                </h3>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT: Compact Stats */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Impact</h4>
                      <div className="flex gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                         <span className="text-[8px] font-bold text-green-500 uppercase">Live</span>
                      </div>
                   </div>

                   {/* Tighter Grid for Circles */}
                   <div className="grid grid-cols-3 gap-2">
                      {/* Circular Item 1 */}
                      <div className="flex flex-col items-center gap-2 group">
                         <div className="relative w-16 h-16 md:w-20 md:h-20">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                               <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                               <path className="text-gold-500" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                               <span className="text-xs font-black text-white">100%</span>
                            </div>
                         </div>
                         <p className="text-[8px] font-bold text-white uppercase text-center">Biblia</p>
                      </div>

                      {/* Circular Item 2 */}
                      <div className="flex flex-col items-center gap-2 group">
                         <div className="relative w-16 h-16 md:w-20 md:h-20">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                               <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                               <path className="text-blue-500" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                               <span className="text-xs font-black text-white">7+</span>
                            </div>
                         </div>
                         <p className="text-[8px] font-bold text-white uppercase text-center">Lugha</p>
                      </div>

                      {/* Circular Item 3 */}
                      <div className="flex flex-col items-center gap-2 group">
                         <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-900">
                            <div className="text-center">
                               <span className="text-xs font-black text-white block">50K</span>
                            </div>
                         </div>
                         <p className="text-[8px] font-bold text-white uppercase text-center">Watu</p>
                      </div>
                   </div>

                   {/* Compact Bar */}
                   <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                      <div className="flex justify-between items-end mb-1">
                         <h5 className="text-[9px] font-black text-white uppercase tracking-widest">Mataifa</h5>
                         <span className="text-sm font-black text-gold-500">12+</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-gold-500 w-3/4 rounded-full"></div>
                      </div>
                   </div>
                </div>

                {/* RIGHT: Compact Tools Grid */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Zana (Tools)</h4>
                      <Zap size={12} className="text-gold-500" />
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                      {[
                         { icon: <Microscope size={14} />, title: "Analysis", desc: "Uchunguzi wa kina.", color: "text-purple-400" },
                         { icon: <Clock size={14} />, title: "Timelines", desc: "Ramani za nyakati.", color: "text-blue-400" },
                         { icon: <ShieldCheck size={14} />, title: "Detection", desc: "Kufichua uongo.", color: "text-red-400" },
                         { icon: <Download size={14} />, title: "Downloads", desc: "Maktaba ya bure.", color: "text-green-400" },
                         { icon: <Target size={14} />, title: "Faith", desc: "Mashujaa wa imani.", color: "text-gold-400" },
                         { icon: <Activity size={14} />, title: "Tracking", desc: "Maendeleo yako.", color: "text-cyan-400" }
                      ].map((tool, i) => (
                         <div key={i} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/5 transition-all group cursor-default">
                            <div className={`mb-1 ${tool.color} bg-white/5 w-fit p-1 rounded group-hover:scale-110 transition-transform`}>{tool.icon}</div>
                            <h5 className="text-[9px] font-black text-white uppercase tracking-widest mb-0.5">{tool.title}</h5>
                            <p className="text-[7px] text-slate-400 leading-tight font-medium">{tool.desc}</p>
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
             <div className="inline-flex items-center gap-2 text-gold-500 font-black text-[9px] uppercase tracking-[0.2em] mb-1">
                <Mail size={12} /> Weekly Updates
             </div>
             <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Jiunge na Jarida Letu
             </h3>
             <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
                Pata uchambuzi wa unabii, habari za misheni, na mafundisho mapya moja kwa moja kwenye email yako kila wiki.
             </p>
          </div>

          <div className="max-w-md mx-auto relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-gold-500 to-primary-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-white/10 shadow-xl">
                <div className="pl-4 text-slate-400">
                   <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Weka email yako hapa..."
                  className="w-full bg-transparent p-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
                <button className="bg-primary-900 text-gold-400 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 hover:text-primary-950 transition-all shadow-lg shrink-0 flex items-center gap-1 group/btn">
                   Jiunge <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
          
          <p className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
             Hatutumi spam. Unaweza kujiondoa wakati wowote.
          </p>
       </section>

    </div>
  );
};
