import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquareQuote,
  CheckCircle,
  Quote,
  Send,
  Heart,
  Sparkles,
  ThumbsUp,
  MapPin,
  ShieldCheck,
  X,
  Video,
  ListVideo,
  FileText,
  Play,
  ChevronDown,
  ChevronUp,
  Camera,
  Share2,
} from 'lucide-react';
import { getTestimonies, reactToTestimony, submitTestimony } from '../services/testimonyService';

interface Testimony {
  id: number;
  name: string;
  location: string;
  story: string;
  verified: boolean;
  stars: number;
  date: string;
  type: 'text' | 'video';
  profileImage?: string;
  thumbnail?: string;
  videoUrl?: string;
  category: 'Miracle' | 'Conversion' | 'Healing';
  reactions: { amen: number; praise: number; love: number };
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
const STORY_PREVIEW_LENGTH = 210;

const resolveAssetUrl = (value?: string) => {
  const raw = (value || '').trim();
  if (!raw) {
    return '';
  }
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
    return raw;
  }
  return `${API_BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

const extractYoutubeId = (url?: string) => {
  const value = (url || '').trim();
  if (!value) {
    return '';
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{6,})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return '';
};

const getVideoThumbnail = (videoUrl?: string, thumbnail?: string) => {
  const preferred = resolveAssetUrl(thumbnail);
  if (preferred) {
    return preferred;
  }

  const youtubeId = extractYoutubeId(videoUrl);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return '';
};

export const Testimonies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Video' | 'Text'>('All');
  const [showForm, setShowForm] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    story: '',
    location: '',
    type: 'text' as 'text' | 'video',
    videoUrl: '',
    category: 'Conversion' as 'Miracle' | 'Conversion' | 'Healing',
    profileImageUpload: null as File | null,
  });
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(false);
  const [reactingId, setReactingId] = useState<number | null>(null);
  const [expandedById, setExpandedById] = useState<Record<number, boolean>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const filtered = useMemo(
    () =>
      testimonies.filter((t) =>
        activeTab === 'All' ? true : t.type.toLowerCase() === activeTab.toLowerCase(),
      ),
    [testimonies, activeTab],
  );

  useEffect(() => {
    const loadTestimonies = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await getTestimonies();
        const mapped: Testimony[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          location: item.location,
          story: item.story,
          verified: item.verified,
          stars: item.stars,
          date: new Date(item.created_at).toLocaleDateString(),
          type: item.testimony_type,
          category: item.category,
          profileImage: item.profile_image,
          thumbnail: item.thumbnail,
          videoUrl: item.video_url,
          reactions: item.reactions || { amen: 0, praise: 0, love: 0 },
        }));
        setTestimonies(mapped);
      } catch {
        setErrorMessage('Imeshindikana kupakua shuhuda.');
        setTestimonies([]);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonies();
  }, []);

  useEffect(() => {
    return () => {
      if (profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const resetForm = () => {
    if (profilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePreview);
    }
    setProfilePreview('');
    setFormData({
      name: '',
      story: '',
      location: '',
      type: 'text',
      videoUrl: '',
      category: 'Conversion',
      profileImageUpload: null,
    });
  };

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
        profile_image_upload: formData.profileImageUpload || undefined,
      });

      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setShowForm(false);
        resetForm();
      }, 2800);
    } catch {
      setErrorMessage('Imeshindikana kutuma shuhuda.');
    }
  };

  const handleProfileUpload = (file: File | null) => {
    if (profilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePreview);
    }

    if (!file) {
      setProfilePreview('');
      setFormData((prev) => ({ ...prev, profileImageUpload: null }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
    setFormData((prev) => ({ ...prev, profileImageUpload: file }));
  };

  const handleReactAmen = async (testimonyId: number) => {
    if (reactingId !== null) {
      return;
    }

    setReactingId(testimonyId);
    try {
      const payload = await reactToTestimony(testimonyId, 'amen');
      setTestimonies((prev) =>
        prev.map((item) =>
          item.id === testimonyId
            ? {
                ...item,
                reactions: payload.reactions,
              }
            : item,
        ),
      );
    } catch {
      setErrorMessage('Imeshindikana kuweka baraka kwa sasa. Jaribu tena.');
    } finally {
      setReactingId(null);
    }
  };

  const toggleExpanded = (testimonyId: number) => {
    setExpandedById((prev) => ({ ...prev, [testimonyId]: !prev[testimonyId] }));
  };

  return (
    <div className="space-y-10 md:space-y-12 animate-fade-in pb-28 md:pb-32 max-w-7xl mx-auto px-4 md:px-6">
      <section className="relative bg-primary-950 rounded-xl p-6 md:p-20 overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=2000')] bg-cover"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/90 to-transparent"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-lg text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={12} className="animate-pulse" /> Nguvu ya Ushuhuda
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              Maisha <span className="text-gold-500 italic">Yaliyoguswa.</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-xl font-medium leading-relaxed italic border-l-4 border-gold-500/50 pl-4 md:pl-6">
              "Nao walimshinda kwa damu ya Mwanakondoo, na kwa neno la ushuhuda wao..." - Ufunuo 12:11
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gold-500 text-primary-950 px-7 md:px-10 py-3.5 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl"
            >
              Tuma Ushuhuda Wako
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6 border-b border-slate-200 dark:border-white/5 pb-5 md:pb-6">
        <div className="w-full md:w-auto overflow-x-auto pb-1">
          <div className="inline-flex min-w-max bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-4 sm:px-6 md:px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'All' ? 'bg-white dark:bg-slate-800 shadow-lg text-primary-900 dark:text-white' : 'text-slate-500'}`}
          >
            Zote
          </button>
          <button
            onClick={() => setActiveTab('Video')}
            className={`px-4 sm:px-6 md:px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'Video' ? 'bg-white dark:bg-slate-800 shadow-lg text-red-600' : 'text-slate-500'}`}
          >
            <ListVideo size={14} /> Video
          </button>
          <button
            onClick={() => setActiveTab('Text')}
            className={`px-4 sm:px-6 md:px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'Text' ? 'bg-white dark:bg-slate-800 shadow-lg text-blue-600' : 'text-slate-500'}`}
          >
            <FileText size={14} /> Maandishi
          </button>
        </div>
        </div>
        <p className="w-full md:w-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">Inaonyesha shuhuda {filtered.length} zilizothibitishwa</p>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
          {errorMessage}
        </div>
      )}

      {loading && <div className="text-xs uppercase tracking-widest text-slate-400 font-black">Inapakia shuhuda...</div>}

      {!loading && filtered.length === 0 && (
        <div className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-lg">
          Hakuna taarifa za shuhuda kwa sasa.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {filtered.map((t) => {
          const avatarImage = resolveAssetUrl(t.profileImage);
          const videoThumb = getVideoThumbnail(t.videoUrl, t.thumbnail);
          const totalReactions = t.reactions.amen + t.reactions.love + t.reactions.praise;
          const isLongStory = t.story.length > STORY_PREVIEW_LENGTH;
          const isExpanded = Boolean(expandedById[t.id]);
          const displayStory = isExpanded || !isLongStory ? t.story : `${t.story.slice(0, STORY_PREVIEW_LENGTH)}...`;

          return (
            <div key={t.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col h-full">
              {t.type === 'video' ? (
                <div className="relative aspect-video overflow-hidden bg-black">
                  {videoThumb ? (
                    <img src={videoThumb} className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-all duration-700" alt={t.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Hakuna picha ya video
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (t.videoUrl) {
                          window.open(t.videoUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"
                    >
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest">
                    Video Testimony
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8 pb-0">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-2">
                    <Quote size={24} />
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5 md:mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 font-black border border-slate-100 dark:border-white/10 overflow-hidden">
                      {avatarImage ? (
                        <img src={avatarImage} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        t.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base leading-none flex items-center gap-2">
                        {t.name}
                        {t.verified && <CheckCircle size={14} className="text-blue-500" fill="currentColor" />}
                      </h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                        <MapPin size={10} /> {t.location || 'Bila eneo'}
                      </p>
                    </div>
                  </div>
                </div>

                <p className={`text-slate-600 dark:text-slate-400 leading-relaxed italic mb-3 ${t.type === 'video' ? 'line-clamp-2 text-sm' : 'text-base font-medium'}`}>
                  "{displayStory}"
                </p>

                {isLongStory && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(t.id)}
                    className="mb-6 self-start inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gold-600 hover:text-gold-500"
                  >
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {isExpanded ? 'Funga Ushuhuda' : 'Soma Zaidi'}
                  </button>
                )}

                <div className="mt-auto pt-5 md:pt-6 border-t border-slate-50 dark:border-white/5 flex flex-wrap items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleReactAmen(t.id)}
                    disabled={reactingId === t.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-white/5 text-primary-700 dark:text-slate-200 hover:bg-gold-500 hover:text-primary-950 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-60"
                  >
                    <ThumbsUp size={14} />
                    {reactingId === t.id ? 'Inahifadhi...' : `${t.reactions.amen} Amina`}
                  </button>

                  <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <Heart size={12} className="text-red-500" fill="currentColor" />
                    {totalReactions} Baraka
                  </div>

                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-lg hover:bg-gold-500 hover:text-primary-950 transition-all"
                    title="Shiriki"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="bg-slate-50 dark:bg-white/5 p-8 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-4">
        <ShieldCheck size={32} className="mx-auto text-gold-500" />
        <div className="max-w-2xl mx-auto space-y-2">
          <h4 className="text-lg font-black uppercase text-slate-900 dark:text-white">Mfumo wa Uhakiki</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium uppercase tracking-widest">
            Shuhuda zote zinazowasilishwa hupokelewa na Timu ya Uhariri ya God Cares 365. Tunazipitia kwa ajili ya usiri na usahihi wa mafundisho kabla ya kuzipublish kwenye platform ili kuwatia wengine moyo.
          </p>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[600] flex items-start md:items-center justify-center p-3 md:p-4 bg-black/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-up relative max-h-[92vh] overflow-y-auto my-4">
            <button onClick={() => { setShowForm(false); resetForm(); }} className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-3 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-red-600 hover:text-white transition-all"><X size={18} /></button>

            <div className="bg-primary-950 p-6 md:p-10 text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-500 text-primary-950 rounded-xl shadow-lg"><MessageSquareQuote size={24} /></div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Shiriki Baraka</h3>
              </div>
              <p className="text-slate-400 text-sm italic">"Neno lako ni nuru kwa mwingine anayepitia giza."</p>
            </div>

            {isSent ? (
              <div className="p-20 text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl animate-bounce"><CheckCircle size={40} /></div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase text-slate-900 dark:text-white">Imepokelewa Vema</h4>
                  <p className="text-slate-500 text-sm">Ushuhuda wako umetumwa kwa Timu ya Uhariri. Utapokea taarifa punde utakapokuwa Live.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendToTeam} className="p-6 md:p-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jina Lako</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all" placeholder="Mtafuta Ukweli" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Eneo (Mkoa)</label>
                    <input required type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all" placeholder="Dar es Salaam" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Picha ya Profile (Hiari)</label>
                  <label className="w-full flex items-center gap-3 px-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-gold-500 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-primary-950 text-gold-400 flex items-center justify-center shrink-0">
                      <Camera size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider truncate">{formData.profileImageUpload?.name || 'Chagua picha ya mhusika'}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">PNG/JPG/WEBP</p>
                    </div>
                    {profilePreview && <img src={profilePreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10" />}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProfileUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aina ya Ushuhuda</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setFormData({ ...formData, type: 'text' })} className={`flex items-center justify-center gap-2 py-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'text' ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-lg' : 'bg-transparent border-slate-200 text-slate-400'}`}>
                      <FileText size={16} /> Maandishi
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, type: 'video' })} className={`flex items-center justify-center gap-2 py-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === 'video' ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-lg' : 'bg-transparent border-slate-200 text-slate-400'}`}>
                      <Video size={16} /> Video Link
                    </button>
                  </div>
                </div>

                {formData.type === 'video' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link ya Video</label>
                    <input type="url" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all" placeholder="https://youtube.com/..." />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategoria</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Miracle' | 'Conversion' | 'Healing' })} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all">
                    <option value="Conversion">Mabadiliko ya Maisha</option>
                    <option value="Miracle">Muujiza</option>
                    <option value="Healing">Uponyaji</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Habari Yako / Maelezo</label>
                  <textarea required value={formData.story} onChange={(e) => setFormData({ ...formData, story: e.target.value })} className="w-full h-40 p-5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:border-gold-500 transition-all resize-none" placeholder="Elezea kwa ufupi kile Bwana alichokufanyia..." />
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
