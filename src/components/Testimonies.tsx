
import React, { useEffect, useMemo, useState } from 'react';
import { 
  MessageSquareQuote, CheckCircle, User, Star, Plus, Send, 
  Heart, Sparkles, PlayCircle, Share2, ThumbsUp, Flame, 
  MapPin, Quote, ShieldCheck, X, Camera, Video, Users,
  ListVideo, FileText, ChevronRight, Play
} from 'lucide-react';
import { getTestimonies, submitTestimony } from '../services/testimonyService';

interface Testimony {
  id: number;
  name: string;
  location: string;
  story: string;
  verified: boolean;
  stars: number;
  date: string;
  type: 'text' | 'video';
  thumbnail?: string;
  videoUrl?: string;
  category: 'Miracle' | 'Conversion' | 'Healing';
  reactions: { amen: number; praise: number; love: number };
}

const INITIAL_TESTIMONIES: Testimony[] = [
  {
    id: 1,
    name: 'Sarah Joseph',
    location: 'Dodoma, Tanzania',
    story: 'Nilikuwa na maswali mengi juu ya hali ya wafu. Baada ya hatua ya tatu, nuru ya ajabu iliingia moyoni mwangu. Sasa nina amani na tumaini la kweli!',
    verified: true,
    stars: 5,
    date: 'Oct 24, 2024',
    type: 'text',
    category: 'Conversion',
    reactions: { amen: 124, praise: 45, love: 89 }
  },
  {
    id: 2,
    name: 'David Emmanuel',
    location: 'Nairobi, Kenya',
    story: 'Kujifunza unabii kupitia platform hii kumenifanya nijue kuwa Mungu yuko kwenye usukani wa historia ya dunia.',
    verified: true,
    stars: 5,
    date: 'Oct 22, 2024',
    type: 'video',
    category: 'Miracle',
    thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    reactions: { amen: 560, praise: 120, love: 230 }
  },
  {
    id: 3,
    name: 'John Malisa',
    location: 'Mbeya, Tanzania',
    story: 'Nimekuwa Mkristo kwa miaka 20 lakini sikuwa nawahi kuelewa maana ya Sabato hadi nilipopitia darasa hapa.',
    verified: false,
    stars: 5,
    date: 'Oct 20, 2024',
    type: 'text',
    category: 'Healing',
    reactions: { amen: 88, praise: 12, love: 34 }
  }
];

export const Testimonies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Video' | 'Text'>('All');
  const [showForm, setShowForm] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', story: '', location: '', type: 'text' as 'text' | 'video', videoUrl: '', category: 'Conversion' as 'Miracle' | 'Conversion' | 'Healing' });
  const [testimonies, setTestimonies] = useState<Testimony[]>(INITIAL_TESTIMONIES);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const filtered = useMemo(() => (
    testimonies.filter(t =>
      activeTab === 'All' ? true : t.type.toLowerCase() === activeTab.toLowerCase()
    )
  ), [testimonies, activeTab]);

  useEffect(() => {
    const loadTestimonies = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await getTestimonies();
        if (data.length) {
          const mapped: Testimony[] = data.map(item => ({
            id: item.id,
            name: item.name,
            location: item.location,
            story: item.story,
            verified: item.verified,
            stars: item.stars,
            date: new Date(item.created_at).toLocaleDateString(),
            type: item.testimony_type,
            category: item.category,
            thumbnail: item.thumbnail,
            videoUrl: item.video_url,
            reactions: item.reactions,
          }));
          setTestimonies(mapped);
        }
      } catch (error) {
        setErrorMessage('Imeshindikana kupakua shuhuda.');
      } finally {
        setLoading(false);
      }
    };

    loadTestimonies();
  }, []);

  const handleSendToTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitTestimony({
        name: formData.name,
        location: formData.location,
        story: formData.story,
        testimony_type: formData.type,
        video_url: formData.type === 'video' ? formData.videoUrl : undefined,
        category: formData.category,
      });
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setShowForm(false);
        setFormData({ name: '', story: '', location: '', type: 'text', videoUrl: '', category: 'Conversion' });
      }, 3000);
    } catch (error) {
      setErrorMessage('Imeshindikana kutuma shuhuda.');
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-32 max-w-7xl mx-auto px-4 md:px-6">
      
      {/* 1. HERO SECTION - MINIMUM BEVEL */}
      <section className="relative bg-primary-950 rounded-xl p-10 md:p-20 overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=2000')] bg-cover"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/90 to-transparent"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-lg text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={12} className="animate-pulse" /> Nguvu ya Ushuhuda
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              Maisha <span className="text-gold-500 italic">Yaliyoguswa.</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-gold-500/50 pl-6">
              "Nao walimshinda kwa damu ya Mwanakondoo, na kwa neno la ushuhuda wao..." — Ufunuo 12:11
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-gold-500 text-primary-950 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl"
            >
              Tuma Ushuhuda Wako
            </button>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200 dark:border-white/5 pb-6">
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
          <button 
            onClick={() => setActiveTab('All')}
            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'All' ? 'bg-white dark:bg-slate-800 shadow-lg text-primary-900 dark:text-white' : 'text-slate-500'}`}
          >Zote</button>
          <button 
            onClick={() => setActiveTab('Video')}
            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'Video' ? 'bg-white dark:bg-slate-800 shadow-lg text-red-600' : 'text-slate-500'}`}
          ><ListVideo size={14}/> Video</button>
          <button 
            onClick={() => setActiveTab('Text')}
            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'Text' ? 'bg-white dark:bg-slate-800 shadow-lg text-blue-600' : 'text-slate-500'}`}
          ><FileText size={14}/> Maandishi</button>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inaonyesha shuhuda {filtered.length} zilizothibitishwa</p>
      </div>

      {/* 3. CONTENT FEED */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
          {errorMessage}
        </div>
      )}
      {loading && (
        <div className="text-xs uppercase tracking-widest text-slate-400 font-black">Inapakia shuhuda...</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered.map((t) => (
          <div key={t.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col h-full">
            {t.type === 'video' ? (
              <div className="relative aspect-video overflow-hidden bg-black">
                <img src={t.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-700" alt="" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play size={24} fill="currentColor" className="ml-1" />
                   </div>
                </div>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest">
                   Video Testimony
                </div>
              </div>
            ) : (
              <div className="p-8 pb-0">
                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-2">
                    <Quote size={24} />
                 </div>
              </div>
            )}

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 font-black border border-slate-100 dark:border-white/10 group-hover:bg-gold-500 group-hover:text-primary-950 transition-colors">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base leading-none flex items-center gap-2">
                      {t.name}
                      {t.verified && <CheckCircle size={14} className="text-blue-500" fill="currentColor" />}
                    </h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                      <MapPin size={10} /> {t.location}
                    </p>
                  </div>
                </div>
                <div className="flex text-gold-500">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                </div>
              </div>

              <p className={`text-slate-600 dark:text-slate-400 leading-relaxed italic mb-8 ${t.type === 'video' ? 'line-clamp-2 text-sm' : 'text-base font-medium'}`}>
                "{t.story}"
              </p>

              <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-500/10 border-2 border-white dark:border-slate-900 flex items-center justify-center text-primary-600"><ThumbsUp size={14} /></div>
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 border-2 border-white dark:border-slate-900 flex items-center justify-center text-red-500"><Heart size={14} fill="currentColor" /></div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {t.reactions.amen + t.reactions.love} Baraka
                  </span>
                </div>
                <button className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-lg hover:bg-gold-500 hover:text-primary-950 transition-all">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. MODERATION INFO */}
      <section className="bg-slate-50 dark:bg-white/5 p-8 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-4">
         <ShieldCheck size={32} className="mx-auto text-gold-500" />
         <div className="max-w-2xl mx-auto space-y-2">
            <h4 className="text-lg font-black uppercase text-slate-900 dark:text-white">Mfumo wa Uhakiki</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium uppercase tracking-widest">
               Shuhuda zote zinazowasilishwa hupokelewa na Timu ya Uhariri ya God Cares 365. Tunazipitia kwa ajili ya usiri na usahihi wa mafundisho kabla ya kuzipublish kwenye platform ili kuwatia wengine moyo.
            </p>
         </div>
      </section>

      {/* 5. SUBMISSION MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
           <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-up relative">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-3 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-red-600 hover:text-white transition-all"><X size={20}/></button>
              
              <div className="bg-primary-950 p-10 text-white space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-gold-500 text-primary-950 rounded-xl shadow-lg"><MessageSquareQuote size={24}/></div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Shiriki Baraka</h3>
                 </div>
                 <p className="text-slate-400 text-sm italic">"Neno lako ni nuru kwa mwingine anayepitia giza."</p>
              </div>

              {isSent ? (
                <div className="p-20 text-center space-y-6 animate-fade-in">
                   <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl animate-bounce"><CheckCircle size={40}/></div>
                   <div className="space-y-2">
                      <h4 className="text-2xl font-black uppercase text-slate-900 dark:text-white">Imepokelewa Vema</h4>
                      <p className="text-slate-500 text-sm">Ushuhuda wako umetumwa kwa Timu ya Uhariri. Utapokea taarifa punde utakapokuwa 'Live'!</p>
                   </div>
                </div>
              ) : (
                <form onSubmit={handleSendToTeam} className="p-10 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jina Lako</label>
                         <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all" placeholder="Mtafuta Ukweli"/>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Eneo (Mkoa)</label>
                         <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all" placeholder="Dar es Salaam"/>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aina ya Ushuhuda</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button type="button" onClick={() => setFormData({...formData, type: 'text'})} className={`flex items-center justify-center gap-2 py-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'text' ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-lg' : 'bg-transparent border-slate-200 text-slate-400'}`}>
                            <FileText size={16}/> Maandishi
                         </button>
                         <button type="button" onClick={() => setFormData({...formData, type: 'video'})} className={`flex items-center justify-center gap-2 py-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'video' ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-lg' : 'bg-transparent border-slate-200 text-slate-400'}`}>
                            <Video size={16}/> Video Link
                         </button>
                      </div>
                   </div>

                   {formData.type === 'video' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link ya Video</label>
                      <input type="url" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all" placeholder="https://youtube.com/..." />
                    </div>
                   )}

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategoria</label>
                     <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all">
                      <option value="Conversion">Mabadiliko ya Maisha</option>
                      <option value="Miracle">Muujiza</option>
                      <option value="Healing">Uponyaji</option>
                     </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Habari Yako / Maelezo</label>
                      <textarea required value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} className="w-full h-40 p-5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:border-gold-500 transition-all resize-none" placeholder="Elezea kwa ufupi kile Bwana alichokufanyia..."/>
                   </div>

                   <button type="submit" className="w-full py-5 bg-gold-500 text-primary-950 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3">
                      <Send size={18} /> WASILISHA KWA TIMU
                   </button>
                </form>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
