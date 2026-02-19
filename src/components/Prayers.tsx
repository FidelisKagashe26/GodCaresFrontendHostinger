
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Heart, Send, BookOpen, Users, CheckCircle2, Clock, 
  Share2, X, ShieldCheck, MessageSquare, 
  Eye, EyeOff, Sparkles, ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LanguageCode } from '../types';
import { getAnsweredPrayers, getPublicPrayers, submitPrayer } from '../services/prayerService';

interface PrayerRequest {
  id: string;
  name: string;
  category: string;
  request: string;
  prayingCount: number;
  timeAgo: string;
  isAnswered?: boolean;
}

interface Props {
  aiLanguage?: LanguageCode;
}

export const Prayers: React.FC<Props> = ({ aiLanguage = 'en' }) => {
  const [request, setRequest] = useState('');
  const [activeTab, setActiveTab] = useState<'wall' | 'answered'>('wall');
  const [isPublic, setIsPublic] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrayer, setAiPrayer] = useState('');
  const [submitted, setSubmitted] = useState(false);
   const [publicRequests, setPublicRequests] = useState<PrayerRequest[]>([]);
   const [isLoadingWall, setIsLoadingWall] = useState(false);
   const [wallError, setWallError] = useState('');
   const [answeredRequests, setAnsweredRequests] = useState<PrayerRequest[]>([]);
   const [isLoadingAnswered, setIsLoadingAnswered] = useState(false);
   const [answeredError, setAnsweredError] = useState('');

   const formatTimeAgo = (isoDate: string) => {
      const created = new Date(isoDate).getTime();
      const diff = Math.max(0, Date.now() - created);
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Hivi punde';
      if (minutes < 60) return `${minutes} dk`; 
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} saa`; 
      const days = Math.floor(hours / 24);
      return `${days} siku`;
   };

   const mapPrayerItem = (item: any): PrayerRequest => ({
      id: String(item.id),
      name: item.name || 'Mgeni',
      category: item.category || 'Maombi',
      request: item.request,
      prayingCount: item.praying_count || 0,
      timeAgo: formatTimeAgo(item.created_at),
   });

   const mappedWall = useMemo(() => publicRequests, [publicRequests]);

   useEffect(() => {
      const loadWall = async () => {
         setIsLoadingWall(true);
         setWallError('');
         try {
            const data = await getPublicPrayers();
            setPublicRequests(data.map(mapPrayerItem));
         } catch (error) {
            setWallError('Imeshindikana kupakua maombi ya umma.');
            setPublicRequests([]);
         } finally {
            setIsLoadingWall(false);
         }
      };

      const loadAnswered = async () => {
         setIsLoadingAnswered(true);
         setAnsweredError('');
         try {
            const data = await getAnsweredPrayers();
            setAnsweredRequests(data.map(mapPrayerItem));
         } catch (error) {
            setAnsweredError('Imeshindikana kupakua maombi yaliyojibiwa.');
            setAnsweredRequests([]);
         } finally {
            setIsLoadingAnswered(false);
         }
      };

      loadWall();
      loadAnswered();
   }, []);

  const handleGeneratePrayer = async () => {
    if (!request.trim()) return;
    setIsGenerating(true);
    setShowAiModal(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Andika ombi fupi la maombi ya Kikristo (maneno max 80) kwa Kiswahili kuhusu: "${request}". Ongeza mstari mmoja wa Biblia mwishoni.`
      });
      setAiPrayer(response.text || "Bwana, sikia ombi letu...");
    } catch (e) {
      setAiPrayer("Bwana unajua hitaji la moyo wake. Lete amani na majibu kulingana na mapenzi yako. Amina.");
    } finally {
      setIsGenerating(false);
    }
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      try {
         setSubmitted(true);
         const created = await submitPrayer({
            name: 'Mgeni',
            request,
            is_public: isPublic,
            category: 'Maombi',
         });
         if (isPublic) {
            const newEntry = mapPrayerItem(created);
            setPublicRequests((prev) => [newEntry, ...prev]);
         }
         setTimeout(() => {
            setSubmitted(false);
            setRequest('');
            setIsPublic(true);
         }, 3500);
      } catch (error) {
         setSubmitted(false);
         setWallError('Imeshindikana kutuma ombi. Jaribu tena.');
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 md:space-y-12 animate-fade-in pb-28 md:pb-32 px-4">
      {/* Hero Section - Minimum Bevel */}
      <section className="relative bg-primary-950 rounded-2xl p-6 md:p-20 overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute inset-0 opacity-20">
           <img src="https://images.unsplash.com/photo-1512412023212-f05419bb100d?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/80 to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-6">
           <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none italic">
             Ukuta wa <span className="text-gold-500">Maombi.</span>
           </h1>
           <p className="text-slate-300 text-sm sm:text-base md:text-xl font-medium leading-relaxed italic border-l-4 border-gold-500/50 pl-4 md:pl-6">
             "Lakini wewe usalipo, ingia katika chumba chako cha ndani..." - Mathayo 6:6.
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT: SUBMISSION FORM */}
        <div className="lg:col-span-5">
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-white/5 shadow-2xl lg:sticky lg:top-28">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-primary-950 text-gold-400 rounded-xl flex items-center justify-center shadow-lg"><MessageSquare size={24} /></div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Wasilisha Hitaji</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kuelekea kwa Timu ya Maombi</p>
                 </div>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-6 animate-scale-up bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                   <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl animate-bounce"><CheckCircle2 size={32} /></div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white">Imepokelewa</h4>
                      <p className="text-sm text-slate-500 px-8 italic">Mungu amesikia ombi lako. Timu yetu itakuwa ikikuombea masaa 24 kuanzia sasa.</p>
                   </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Elezea Hitaji Lako</label>
                      <textarea 
                        required
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                        className="w-full h-44 p-6 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-medium text-sm focus:border-gold-500 transition-all resize-none"
                        placeholder="Andika hapa kile unachopitia..."
                      />
                   </div>

                   <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         {isPublic ? <Eye className="text-gold-500" size={18} /> : <EyeOff className="text-slate-400" size={18} />}
                         <div>
                            <p className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Public Wall</p>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Ukuta wa Umma - wengine waione?</p>
                         </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? 'bg-gold-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'left-7' : 'left-1'}`}></div>
                      </button>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button 
                         type="button"
                         onClick={handleGeneratePrayer}
                         className="py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-500/10 hover:text-gold-600 transition-all flex items-center justify-center gap-2"
                      >
                         <Sparkles size={14} /> Neno la Faraja
                      </button>
                      <button 
                         type="submit"
                         className="py-4 bg-primary-950 text-gold-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 hover:text-primary-950 transition-all shadow-xl flex items-center justify-center gap-2"
                      >
                         <Send size={14} /> Tuma Maombi
                      </button>
                   </div>

                   <div className="flex items-center gap-2 text-slate-400 justify-center">
                      <ShieldCheck size={14} className="text-green-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Timu yetu ya maombi inapitia maombi yote ndani ya dakika 30.</span>
                   </div>
                </form>
              )}
           </div>
        </div>

        {/* RIGHT: WALL & TESTIMONIES */}
        <div className="lg:col-span-7 space-y-6">
           <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl w-full md:w-fit border border-slate-200 dark:border-white/10 shadow-inner overflow-x-auto">
              <button 
                 onClick={() => setActiveTab('wall')}
                 className={`flex-1 md:flex-none px-4 sm:px-6 md:px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'wall' ? 'bg-white dark:bg-slate-800 text-primary-950 dark:text-white shadow-xl' : 'text-slate-500'}`}
              >
                 <Users size={14} /> Ukuta wa Maombi
              </button>
              <button 
                 onClick={() => setActiveTab('answered')}
                 className={`flex-1 md:flex-none px-4 sm:px-6 md:px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'answered' ? 'bg-white dark:bg-slate-800 text-green-600 shadow-xl' : 'text-slate-500'}`}
              >
                 <CheckCircle2 size={14} /> Yaliyojibiwa
              </button>
           </div>

                <div className="space-y-4">
                     {activeTab === 'wall' ? (
                        <>
                           {isLoadingWall && (
                              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-50 dark:border-white/5 text-slate-400 text-xs uppercase tracking-widest font-black">Inapakia...</div>
                           )}
                           {wallError && (
                              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                                 {wallError}
                              </div>
                           )}
                           {!isLoadingWall && mappedWall.length === 0 && (
                              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-50 dark:border-white/5 text-slate-400 text-xs uppercase tracking-widest font-black">
                                Hakuna taarifa za maombi ya umma kwa sasa.
                              </div>
                           )}
                           {mappedWall.map((req) => (
                  <div key={req.id} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-50 dark:border-white/5 shadow-sm group hover:border-gold-500/20 transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary-950 dark:text-gold-500 font-black border border-slate-100 dark:border-white/10">{req.name.charAt(0)}</div>
                           <div>
                              <h4 className="font-black text-slate-900 dark:text-white text-sm">{req.name}</h4>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> {req.timeAgo}</p>
                           </div>
                        </div>
                        <div className="px-3 py-1 bg-primary-950 text-gold-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"><Heart size={10} fill="currentColor"/> {req.prayingCount} Praying</div>
                     </div>
                     <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic font-medium">"{req.request}"</p>
                  </div>
                           ))}
                        </>
              ) : (
                isLoadingAnswered ? (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-50 dark:border-white/5 text-slate-400 text-xs uppercase tracking-widest font-black">
                    Inapakia...
                  </div>
                ) : answeredError ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                    {answeredError}
                  </div>
                ) : answeredRequests.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-50 dark:border-white/5 text-slate-400 text-xs uppercase tracking-widest font-black">
                    Hakuna taarifa za maombi yaliyojibiwa kwa sasa.
                  </div>
                ) : (
                answeredRequests.map((ans) => (
                  <div key={ans.id} className="bg-green-500/5 dark:bg-green-500/10 p-6 md:p-8 rounded-2xl border border-green-500/20 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 text-green-500/10 rotate-12 group-hover:scale-110 transition-transform"><CheckCircle2 size={100} /></div>
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white"><CheckCircle2 size={16}/></div>
                           <h4 className="text-sm font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Ombi Lililojibiwa: {ans.name}</h4>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 text-base md:text-lg font-serif italic leading-relaxed">"{ans.request}"</p>
                        <div className="flex items-center justify-between pt-4 border-t border-green-500/10">
                           <span className="text-[9px] font-bold text-slate-500 uppercase">Imepublishwa: {ans.timeAgo}</span>
                           <button className="text-green-600 hover:text-green-700 transition-colors"><Share2 size={16}/></button>
                        </div>
                     </div>
                  </div>
                ))
                )
              )}

              <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] hover:border-gold-500/50 hover:text-gold-500 transition-all flex items-center justify-center gap-2">
                 Shiriki Ushuhuda Wako Hapa <ChevronRight size={14}/>
              </button>
           </div>
        </div>
      </div>

      {/* NENO LA FARAJA MODAL */}
      {showAiModal && (
         <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in">
            <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl p-6 md:p-14 text-center space-y-8 shadow-[0_0_80px_rgba(234,179,8,0.2)] border border-white/10 animate-scale-up relative max-h-[92vh] overflow-y-auto">
               <button onClick={() => setShowAiModal(false)} className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all"><X size={20}/></button>
               <div className="space-y-4">
                  <div className="w-20 h-20 bg-gold-400 text-primary-950 rounded-2xl flex items-center justify-center mx-auto shadow-2xl group transition-all"><BookOpen size={32} /></div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Neno la <span className="text-gold-500">Faraja</span></h3>
               </div>
               
               <div className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl min-h-[150px] flex items-center justify-center relative overflow-hidden">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anaandaa Ombi...</p>
                    </div>
                  ) : (
                    <p className="text-slate-700 dark:text-slate-200 text-lg font-serif italic leading-relaxed">"{aiPrayer}"</p>
                  )}
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => setShowAiModal(false)} className="w-full py-5 bg-primary-950 text-gold-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 hover:text-primary-950 transition-all shadow-xl">OMBA SASA</button>
                  <button className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Copy Text</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

