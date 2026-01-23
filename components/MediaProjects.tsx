
import React, { useEffect, useState } from 'react';
import { 
  Play, Globe, Users, ArrowRight, Film, Mic2, Tv, 
  Clock, Star, PlayCircle, MoreVertical, Share2, 
  ThumbsUp, MessageSquare, Bell, Search, Filter, X, 
  ListVideo, ChevronLeft, Layout
} from 'lucide-react';
import { getMediaPlaylists } from '../services/mediaService';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  postedAt: string;
  embedUrl: string;
}

interface Playlist {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  videos: Video[];
}

const PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    title: 'Siri za Unabii wa Danieli',
    category: 'Unabii',
    description: 'Mfululizo wa masomo yanayochambua sanamu ya Danieli na falme za dunia.',
    thumbnail: 'https://images.unsplash.com/photo-1599596378252-474026337f71?auto=format&fit=crop&q=80&w=800',
    videoCount: 12,
    videos: [
      { id: 'v1-1', title: 'Sura ya 1: Uaminifu Katika Jaribu', duration: '45:12', views: '12K', postedAt: '2 days ago', thumbnail: 'https://images.unsplash.com/photo-1599596378252-474026337f71?q=80&w=800' },
      { id: 'v1-2', title: 'Sura ya 2: Sanamu ya Nebukadreza', duration: '55:30', views: '25K', postedAt: '1 week ago', thumbnail: 'https://images.unsplash.com/photo-1543165731-0d29792694b8?q=80&w=800' },
      { id: 'v1-3', title: 'Sura ya 7: Wanyama Wanne na Pembe Ndogo', duration: '1:02:15', views: '18K', postedAt: '2 weeks ago', thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=800' }
    ]
  },
  {
    id: 'p2',
    title: 'Afya na Uponyaji wa Kiungu',
    category: 'Afya',
    description: 'Kanuni nane za asili za afya na jinsi ya kuepuka magonjwa ya kisasa.',
    thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800',
    videoCount: 8,
    videos: [
      { id: 'v2-1', title: 'Maji: Dawa ya Bure Kutoka kwa Mungu', duration: '15:45', views: '8K', postedAt: '1 month ago', thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800' },
      { id: 'v2-2', title: 'Chakula Bora: Rudi Kwenye Bustani ya Edeni', duration: '22:10', views: '15K', postedAt: '2 months ago', thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800' }
    ]
  },
  {
    id: 'p3',
    title: 'Shuhuda za Ushindi',
    category: 'Shuhuda',
    description: 'Watu mbalimbali wakishuhudia jinsi ukweli wa neno la Mungu ulivyobadili maisha yao.',
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    videoCount: 24,
    videos: [
      { id: 'v3-1', title: 'Nilivyotoka Kwenye Mafundisho ya Uongo', duration: '12:40', views: '45K', postedAt: '5 days ago', thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800' },
      { id: 'v3-2', title: 'Ukweli wa Sabato Ulivyonipa Amani', duration: '18:15', views: '32K', postedAt: '3 weeks ago', thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=800' }
    ]
  }
];

export const MediaProjects: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Zote');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>(PLAYLISTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Zote', 'Unabii', 'Afya', 'Shuhuda', 'Elimu'];

  useEffect(() => {
    const loadPlaylists = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMediaPlaylists();
        const mapped: Playlist[] = data.map((playlist) => ({
          id: String(playlist.id),
          title: playlist.title,
          category: playlist.category || 'General',
          description: playlist.description || '',
          thumbnail: playlist.thumbnail || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=800',
          videoCount: playlist.video_count ?? playlist.videos.length,
          videos: playlist.videos.map((video) => ({
            id: String(video.id),
            title: video.title,
            thumbnail: video.thumbnail || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=800',
            duration: video.duration || '00:00',
            views: video.views || '0',
            postedAt: video.posted_at || '',
            embedUrl: video.embed_url,
          })),
        }));
        if (mapped.length > 0) {
          setPlaylists(mapped);
        }
      } catch (err: any) {
        setError(err?.message || 'Imeshindikana kupata playlists.');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  const filteredPlaylists = playlists.filter(p => activeCategory === 'Zote' || p.category === activeCategory);

  if (selectedPlaylist) {
    return (
      <div className="bg-slate-50 dark:bg-[#020617] min-h-screen text-slate-900 dark:text-white pb-20 animate-fade-in transition-colors duration-500">
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 sticky top-0 z-40 px-4 md:px-8 py-4 flex items-center gap-4 transition-colors">
           <button onClick={() => { setSelectedPlaylist(null); setPlayingVideo(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-slate-200"><ChevronLeft size={24} /></button>
           <div>
             <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedPlaylist.title}</h2>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{selectedPlaylist.videoCount} Videos</p>
           </div>
        </div>
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              {playingVideo ? (
                <div className="space-y-6 animate-fade-in">
                   <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
                     <iframe src={`${playingVideo.embedUrl}?autoplay=1`} className="w-full h-full border-none" allowFullScreen></iframe>
                   </div>
                   <div className="space-y-2">
                      <h1 className="text-2xl font-black leading-tight text-slate-900 dark:text-white">{playingVideo.title}</h1>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-primary-950 font-black text-sm">GC</div>
                            <div>
                               <h4 className="font-bold text-sm text-slate-900 dark:text-white">God Cares 365</h4>
                               <p className="text-xs text-slate-500 dark:text-slate-400">Official Publisher</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button className="p-3 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"><ThumbsUp size={18} /></button>
                            <button className="p-3 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300"><Share2 size={18} /></button>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="bg-slate-200 dark:bg-white/5 aspect-video rounded-3xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-4 border-dashed border-slate-300 dark:border-white/10">
                   <ListVideo size={64} className="mb-4" />
                   <p className="font-bold uppercase tracking-widest text-center px-4">Chagua video pembeni kuanza kutazama</p>
                </div>
              )}
           </div>
           <div className="lg:col-span-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden h-fit sticky top-24 shadow-sm transition-colors">
              <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                 <h3 className="font-black text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400">Orodha ya Video</h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
                 {selectedPlaylist.videos.map((v, idx) => (
                    <div 
                      key={v.id} 
                      onClick={() => setPlayingVideo(v)} 
                      className={`flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-all border-b border-slate-50 dark:border-white/5 ${playingVideo?.id === v.id ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}
                    >
                       <div className="w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                          <img src={v.thumbnail} className="w-full h-full object-cover" alt="" />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">{v.duration}</div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold leading-tight line-clamp-2 ${playingVideo?.id === v.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{v.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">{v.views} views</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#020617] min-h-screen text-slate-900 dark:text-white pb-20 animate-fade-in pt-8 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 space-y-12">
        <section className="space-y-4">
           <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase border-l-8 border-red-600 pl-6 text-slate-900 dark:text-white">Playlists za <span className="text-gold-500">Ukweli</span></h1>
           <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)} 
                  className={`px-6 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    activeCategory === cat 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' 
                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </section>

        {loading && (
          <div className="py-4 text-center text-xs font-black uppercase tracking-widest text-slate-400">Inapakia playlists...</div>
        )}
        {error && (
          <div className="py-2 text-center text-xs font-black uppercase tracking-widest text-red-500">{error}</div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPlaylists.map((playlist) => (
            <div key={playlist.id} onClick={() => setSelectedPlaylist(playlist)} className="group cursor-pointer flex flex-col gap-4">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-white/5">
                <div className="absolute top-0 right-0 w-full h-full bg-slate-300 dark:bg-slate-800 -translate-y-1 scale-95 rounded-xl"></div>
                <div className="relative z-10 w-full h-full">
                  <img src={playlist.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
                     <p className="font-black text-lg">{playlist.videoCount}</p>
                     <ListVideo size={24} />
                  </div>
                </div>
              </div>
              <div className="px-1 space-y-1">
                <h4 className="font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-tight">{playlist.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{playlist.category} • Full Playlist</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
