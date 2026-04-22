import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquareQuote,
  CheckCircle,
  Send,
  Heart,
  ThumbsUp,
  MapPin,
  X,
  Video,
  ListVideo,
  FileText,
  Play,
  ChevronDown,
  ChevronUp,
  Camera,
  Share2,
  Sparkles,
  Quote,
} from 'lucide-react';
import { getTestimonies, reactToTestimony, submitTestimony } from '../../services/content/testimonyService';
import { getApiBaseUrl, resolveApiAssetUrl } from '../../services/core/urlService';

interface Testimony {
  id: number;
  name: string;
  location: string;
  story: string;
  stars: number;
  date: string;
  type: 'text' | 'video';
  profileImage?: string;
  thumbnail?: string;
  videoUrl?: string;
  category: 'Miracle' | 'Conversion' | 'Healing';
  reactions: { amen: number; praise: number; love: number };
}

const API_BASE_URL = getApiBaseUrl();
const STORY_PREVIEW_LENGTH = 220;

const resolveAssetUrl = (value?: string) => resolveApiAssetUrl(value || '', API_BASE_URL);

const extractYoutubeId = (url?: string) => {
  const value = (url || '').trim();
  if (!value) return '';

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
  if (preferred) return preferred;

  const youtubeId = extractYoutubeId(videoUrl);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return '';
};

const copyToClipboard = async (value: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    return copied;
  } catch {
    return false;
  }
};

const categoryLabel = (value: 'Miracle' | 'Conversion' | 'Healing'): string => {
  const map: Record<'Miracle' | 'Conversion' | 'Healing', string> = {
    Miracle: 'Muujiza',
    Conversion: 'Mabadiliko ya Maisha',
    Healing: 'Uponyaji',
  };

  return map[value] || value;
};

export const Testimonies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Video' | 'Text'>('All');
  const [showForm, setShowForm] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
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
    if (!actionMessage) return;
    const timer = window.setTimeout(() => setActionMessage(''), 2200);
    return () => window.clearTimeout(timer);
  }, [actionMessage]);

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
          stars: item.stars,
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('sw-TZ') : 'Hakuna tarehe',
          type: item.testimony_type,
          category: item.category,
          profileImage: item.profile_image,
          thumbnail: item.thumbnail,
          videoUrl: item.video_url,
          reactions: item.reactions || { amen: 0, praise: 0, love: 0 },
        }));
        setTestimonies(mapped);
      } catch {
        setErrorMessage('Imeshindikana kupakua shuhuda. Jaribu tena.');
        setTestimonies([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTestimonies();
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
    setSubmitError('');
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

  const closeForm = () => {
    setShowForm(false);
    setIsSent(false);
    setSubmitting(false);
    resetForm();
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

  const handleSendToTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitError('');
    setSubmitting(true);

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
      window.setTimeout(() => {
        closeForm();
      }, 2300);
    } catch {
      setSubmitError('Imeshindikana kutuma shuhuda. Tafadhali jaribu tena.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactAmen = async (testimonyId: number) => {
    if (reactingId !== null) return;

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
      setErrorMessage('Imeshindikana kuweka Amina kwa sasa. Jaribu tena.');
    } finally {
      setReactingId(null);
    }
  };

  const handleShare = async (item: Testimony) => {
    const url = `${window.location.origin}${window.location.pathname}#shuhuda-${item.id}`;
    const text = `${item.name}: ${item.story.slice(0, 140)}${item.story.length > 140 ? '...' : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shuhuda - God Cares 365',
          text,
          url,
        });
        setActionMessage('Shuhuda imeshirikishwa.');
        return;
      } catch {
        // fallback below
      }
    }

    const copied = await copyToClipboard(`${text}\n${url}`);
    if (copied) {
      setActionMessage('Kiungo cha shuhuda kimenakiliwa.');
      return;
    }

    window.prompt('Nakili link hii ya kushare:', url);
  };

  const toggleExpanded = (testimonyId: number) => {
    setExpandedById((prev) => ({ ...prev, [testimonyId]: !prev[testimonyId] }));
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-20 max-w-6xl mx-auto animate-fade-in">
      <section className="p-4 sm:p-6 md:p-12">
        <div className="relative overflow-hidden rounded-3xl border border-green-200/80 dark:border-slate-700 bg-gradient-to-br from-[#f5fbef] to-white dark:from-slate-900 dark:to-slate-950 p-6 sm:p-8 md:p-12 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-300/20 blur-3xl" aria-hidden></div>
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-green-300/20 blur-3xl" aria-hidden></div>

          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200">
                <Sparkles size={13} /> Neno la Ushuhuda
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Shuhuda Za Maisha
                <span className="block text-gold-700 dark:text-gold-400">Yaliyobadilishwa</span>
              </h1>
              <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                Sikiliza simulizi za kweli kutoka jamii yetu, pata tumaini, na shiriki kile Mungu amekufanyia kwa hekima na unyenyekevu.
              </p>
            </div>

            <button
              onClick={() => {
                setShowForm(true);
                setIsSent(false);
                setSubmitError('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-300 bg-gold-100 px-5 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-gold-900 hover:bg-gold-200 transition-colors"
            >
              <MessageSquareQuote size={15} /> Tuma Shuhuda
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-12 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="inline-flex min-w-max bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-4 sm:px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'All'
                  ? 'bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              Zote
            </button>
            <button
              onClick={() => setActiveTab('Video')}
              className={`px-4 sm:px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'Video'
                  ? 'bg-white dark:bg-slate-800 shadow text-red-600'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              <ListVideo size={13} /> Video
            </button>
            <button
              onClick={() => setActiveTab('Text')}
              className={`px-4 sm:px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-1.5 ${
                activeTab === 'Text'
                  ? 'bg-white dark:bg-slate-800 shadow text-blue-700 dark:text-blue-300'
                  : 'text-slate-500 dark:text-slate-300'
              }`}
            >
              <FileText size={13} /> Maandishi
            </button>
          </div>

          <p className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-[0.12em]">
            Inaonyesha shuhuda {filtered.length}
          </p>
        </div>

        {actionMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-xs font-bold px-4 py-2 rounded-lg">
            {actionMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}

        {loading && (
          <div className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">
            Inapakia shuhuda...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-lg">
            Hakuna taarifa za shuhuda kwa sasa.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {filtered.map((item) => {
            const avatarImage = resolveAssetUrl(item.profileImage);
            const videoThumb = getVideoThumbnail(item.videoUrl, item.thumbnail);
            const totalReactions = item.reactions.amen + item.reactions.love + item.reactions.praise;
            const isLongStory = item.story.length > STORY_PREVIEW_LENGTH;
            const isExpanded = Boolean(expandedById[item.id]);
            const displayStory = isExpanded || !isLongStory
              ? item.story
              : `${item.story.slice(0, STORY_PREVIEW_LENGTH)}...`;

            return (
              <article
                key={item.id}
                id={`shuhuda-${item.id}`}
                className="group rounded-2xl border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 overflow-hidden shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] hover:border-gold-400/80 hover:shadow-[0_14px_28px_rgba(212,154,20,0.12)] transition-all flex flex-col"
              >
                {item.type === 'video' && (
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    {videoThumb ? (
                      <img
                        src={videoThumb}
                        className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                        alt={item.name}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                        Hakuna picha ya video
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"></div>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.videoUrl) {
                          window.open(item.videoUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      disabled={!item.videoUrl}
                      className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Cheza ushuhuda wa video"
                    >
                      <Play size={22} fill="currentColor" className="ml-0.5" />
                    </button>
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/45 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">
                      <Video size={11} /> Video
                    </span>
                  </div>
                )}

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 shrink-0 rounded-full border border-green-200 dark:border-slate-700 bg-green-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-sm font-black text-green-800 dark:text-slate-200">
                        {avatarImage ? (
                          <img src={avatarImage} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{item.name}</h3>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-[0.08em] inline-flex items-center gap-1">
                          <MapPin size={11} /> {item.location || 'Bila eneo'}
                        </p>
                      </div>
                    </div>

                    {item.type === 'text' && (
                      <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                        <Quote size={17} />
                      </div>
                    )}
                  </div>

                  <p className="text-slate-700 dark:text-slate-200 text-sm leading-7 italic whitespace-pre-line">
                    "{displayStory}"
                  </p>

                  {isLongStory && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="mt-3 self-start inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.08em] text-gold-700 dark:text-gold-400 hover:text-gold-600"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {isExpanded ? 'Funga' : 'Soma zaidi'}
                    </button>
                  )}

                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-200">
                      {categoryLabel(item.category)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-[0.08em]">
                      {item.date}
                    </span>
                  </div>

                  <div className="mt-auto pt-5 border-t border-green-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleReactAmen(item.id)}
                      disabled={reactingId === item.id}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-slate-800 text-primary-700 dark:text-slate-100 hover:bg-gold-500 hover:text-primary-950 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-60"
                    >
                      <ThumbsUp size={14} />
                      {reactingId === item.id ? 'Inahifadhi...' : `${item.reactions.amen} Amina`}
                    </button>

                    <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500 dark:text-slate-300">
                      <Heart size={12} className="text-red-500" fill="currentColor" />
                      {totalReactions} Baraka
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void handleShare(item);
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:border-gold-400 hover:text-gold-700 transition-colors"
                      aria-label="Shiriki shuhuda"
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[600] flex items-start md:items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-up relative max-h-[92vh] overflow-y-auto my-4">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-red-600 hover:text-white transition-all"
              aria-label="Funga fomu"
            >
              <X size={18} />
            </button>

            <div className="bg-gradient-to-r from-green-900 via-primary-900 to-primary-950 p-6 md:p-10 text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-500 text-primary-950 rounded-xl shadow-lg">
                  <MessageSquareQuote size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Shiriki Ushuhuda</h3>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                Andika kwa ufupi, kwa heshima na kwa lugha safi ili ujumbe wako uwatie wengine moyo.
              </p>
            </div>

            {isSent ? (
              <div className="p-16 text-center space-y-5 animate-fade-in">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl">
                  <CheckCircle size={38} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase text-slate-900 dark:text-white">Asante Sana</h4>
                  <p className="text-slate-500 dark:text-slate-300 text-sm">Tumepokea shuhuda yako kikamilifu.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendToTeam} className="p-6 md:p-10 space-y-6">
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold px-4 py-2 rounded-lg">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jina Lako</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all"
                      placeholder="Mfano: Mtafuta Ukweli"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Eneo (Mkoa/Mji)</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all"
                      placeholder="Dar es Salaam"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Picha ya Wasifu (Hiari)</label>
                  <label className="w-full flex items-center gap-3 px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-gold-500 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-primary-950 text-gold-400 flex items-center justify-center shrink-0">
                      <Camera size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider truncate">
                        {formData.profileImageUpload?.name || 'Chagua picha ya mhusika'}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">PNG/JPG/WEBP</p>
                    </div>
                    {profilePreview && (
                      <img
                        src={profilePreview}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleProfileUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Aina ya Ushuhuda</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'text' })}
                      className={`flex items-center justify-center gap-2 py-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                        formData.type === 'text'
                          ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-lg'
                          : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      <FileText size={16} /> Maandishi
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'video' })}
                      className={`flex items-center justify-center gap-2 py-4 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                        formData.type === 'video'
                          ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-lg'
                          : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      <Video size={16} /> Kiungo cha Video
                    </button>
                  </div>
                </div>

                {formData.type === 'video' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kiungo cha Video</label>
                    <input
                      required={formData.type === 'video'}
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Miracle' | 'Conversion' | 'Healing' })}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all"
                  >
                    <option value="Conversion">Mabadiliko ya Maisha</option>
                    <option value="Miracle">Muujiza</option>
                    <option value="Healing">Uponyaji</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ushuhuda Wako / Maelezo</label>
                  <textarea
                    required
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    className="w-full h-40 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:border-gold-500 transition-all resize-none"
                    placeholder="Elezea kwa ufupi kile Mungu alichokufanyia..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gold-500 text-primary-950 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send size={18} /> {submitting ? 'Inatuma...' : 'WASILISHA SHUHUDA'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
