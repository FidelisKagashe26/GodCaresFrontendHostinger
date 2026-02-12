
import React, { useEffect, useState } from 'react';
import { 
  FileText, Download, PlayCircle, BookOpen, Headphones, 
  Video, Search, Filter, Sparkles, ChevronRight, 
  ArrowDownToLine, Clock, Layers, Star, Image as ImageIcon,
  ExternalLink, Play, Eye, FileDigit, X, ArrowLeft, Maximize2,
  Volume2, Music, Pause, ChevronLeft, Share2, FolderHeart, LayoutGrid
} from 'lucide-react';
import { getLibraryItems } from '../services/libraryService';

interface LibraryItem {
  id: number | string;
  type: 'PDF' | 'Audio' | 'Video' | 'Image';
  title: string;
  swahiliTitle: string;
  description: string;
  sizeOrDuration: string;
  image: string;
  category: string;
  contentUrl?: string;
  albumName?: string; // Imeongezwa kwa ajili ya kupanga picha
}

export const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Zote' | 'PDF' | 'Video' | 'Audio' | 'Image'>('Zote');
  const [search, setSearch] = useState('');
  const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLibraryItems();
        const mapped = data.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          swahiliTitle: item.swahili_title || 'Hakuna taarifa',
          description: item.description || '',
          sizeOrDuration: item.size_or_duration || '',
          image: item.image || '',
          category: item.category || 'Hakuna taarifa',
          contentUrl: item.content_url || undefined,
          albumName: item.album_name || undefined,
        }));
        setItems(mapped);
      } catch (err: any) {
        setError(err?.message || 'Imeshindikana kupata maktaba.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'Zote' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.swahiliTitle.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderPdfList = (items: LibraryItem[]) => (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-gold-500/50 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <FileText size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{item.swahiliTitle} • {item.sizeOrDuration}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewingItem(item)} className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-gold-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 hover:text-primary-950 transition-all"><BookOpen size={14} /> Soma</button>
            <button className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-lg hover:text-slate-900 dark:hover:text-white transition-all"><Download size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAudioList = (items: LibraryItem[]) => (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-gold-500/50 transition-all group">
          <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Headphones size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{item.swahiliTitle} • {item.sizeOrDuration || 'Hakuna taarifa'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewingItem(item)} className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-gold-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 hover:text-primary-950 transition-all"><Play size={14} /> Sikiliza</button>
          </div>
        </div>
      ))}
    </div>
  );

  // Gallery view for images grouped by albums
  const renderImageGallery = (items: LibraryItem[]) => {
    const albums = items.reduce((acc, item) => {
      const album = item.albumName || 'Hakuna taarifa';
      if (!acc[album]) acc[album] = [];
      acc[album].push(item);
      return acc;
    }, {} as Record<string, LibraryItem[]>);

    return (
      <div className="space-y-12">
        {Object.entries(albums).map(([albumName, albumItems]) => (
          <div key={albumName} className="space-y-4">
            <div className="flex items-center gap-3 px-1 border-l-4 border-gold-500 pl-4">
              <FolderHeart size={18} className="text-gold-500" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">{albumName}</h3>
              <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{albumItems.length} Picha</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {albumItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setViewingItem(item)}
                  className="group relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer border border-transparent hover:border-gold-500/50 transition-all"
                >
                  {item.image ? (
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Hakuna picha
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[8px] font-black text-white truncate uppercase tracking-tighter">{item.swahiliTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGrid = (items: LibraryItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden group hover:border-gold-500/30 transition-all">
          <div className="relative aspect-video overflow-hidden">
            {item.image ? (
              <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            ) : (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                Hakuna picha
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1">
              {item.type === 'Video' ? <Video size={10} /> : <ImageIcon size={10} />} {item.type}
            </div>
            {item.type === 'Video' && (
              <div onClick={() => setViewingItem(item)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl"><Play size={24} fill="currentColor" /></div>
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-[9px] font-black text-gold-500 uppercase tracking-[0.2em] mb-1">{item.category}</p>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2">{item.title}</h4>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
              <button onClick={() => setViewingItem(item)} className="text-[10px] font-black text-slate-500 hover:text-gold-500 uppercase tracking-widest flex items-center gap-1 transition-colors">
                {item.type === 'Video' ? <><Play size={12} /> Watch Now</> : <><Eye size={12} /> View Item</>}
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><ArrowDownToLine size={16} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-10 md:p-14 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12"><Layers size={250} /></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.3em]">Digital Assets Repository</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Maktaba ya <span className="text-gold-500">Ukweli</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl">Vifaa vya utafiti, mafundisho ya sauti, video na nyumba ya picha zote katika sehemu moja.</p>
          <div className="pt-6 relative max-w-xl">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input type="text" placeholder="Tafuta faili yoyote..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:bg-white/10 focus:border-gold-500/50 transition-all text-sm"/>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-white/5 pb-6">
        {(['Zote', 'PDF', 'Video', 'Audio', 'Image'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary-950 text-gold-400 shadow-xl' : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{tab}</button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-12">
        {loading && (
          <div className="py-10 text-center text-xs font-black uppercase tracking-widest text-slate-400">Inapakia maktaba...</div>
        )}
        {error && (
          <div className="py-4 text-center text-xs font-black uppercase tracking-widest text-red-500">{error}</div>
        )}
        {(activeTab === 'Zote' || activeTab === 'PDF') && filteredItems.filter(i => i.type === 'PDF').length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1 text-red-500"><FileDigit size={20}/><h3 className="text-xs font-black uppercase tracking-[0.3em]">Nyaraka na Vitabu (PDF)</h3></div>
            {renderPdfList(filteredItems.filter(i => i.type === 'PDF'))}
          </section>
        )}

        {(activeTab === 'Zote' || activeTab === 'Video') && filteredItems.filter(i => i.type === 'Video').length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1 text-gold-500"><PlayCircle size={20}/><h3 className="text-xs font-black uppercase tracking-[0.3em]">Video na Documentary</h3></div>
            {renderGrid(filteredItems.filter(i => i.type === 'Video'))}
          </section>
        )}

        {(activeTab === 'Zote' || activeTab === 'Audio') && filteredItems.filter(i => i.type === 'Audio').length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1 text-blue-500"><Headphones size={20}/><h3 className="text-xs font-black uppercase tracking-[0.3em]">Sauti na Masomo</h3></div>
            {renderAudioList(filteredItems.filter(i => i.type === 'Audio'))}
          </section>
        )}

        {(activeTab === 'Zote' || activeTab === 'Image') && filteredItems.filter(i => i.type === 'Image').length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1 text-emerald-500"><LayoutGrid size={20}/><h3 className="text-xs font-black uppercase tracking-[0.3em]">Gallery ya Picha na Albamu</h3></div>
            {renderImageGallery(filteredItems.filter(i => i.type === 'Image'))}
          </section>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="py-24 text-center space-y-4 opacity-30"><Search size={48} className="mx-auto"/><p className="font-black uppercase tracking-widest text-xs">Hakuna faili iliyopatikana</p></div>
        )}
      </div>

      {/* VIEWER MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-6xl h-full rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border border-white/10 relative">
             <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${viewingItem.type === 'PDF' ? 'bg-red-500/20 text-red-500' : viewingItem.type === 'Video' ? 'bg-red-600 text-white' : viewingItem.type === 'Image' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>{viewingItem.type === 'PDF' ? <FileText size={20}/> : viewingItem.type === 'Video' ? <Video size={20}/> : viewingItem.type === 'Image' ? <ImageIcon size={20}/> : <Headphones size={20}/>}</div>
                  <div><h3 className="text-lg font-black text-white tracking-tight uppercase leading-none">{viewingItem.title}</h3><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{viewingItem.category} • {viewingItem.type}</p></div>
                </div>
                <button onClick={() => { setViewingItem(null); setIsPlaying(false); }} className="p-3 bg-white/5 hover:bg-red-500 text-white rounded-xl transition-all"><X size={20}/></button>
             </div>
             <div className="flex-1 overflow-hidden relative bg-black flex items-center justify-center">
                {viewingItem.type === 'PDF' && viewingItem.contentUrl && <iframe src={`${viewingItem.contentUrl}#toolbar=0`} className="w-full h-full border-none" title={viewingItem.title}></iframe>}
                {viewingItem.type === 'Video' && viewingItem.contentUrl && <iframe src={`${viewingItem.contentUrl}?autoplay=1`} className="w-full max-w-4xl aspect-video rounded-xl" allow="autoplay; encrypted-media" allowFullScreen></iframe>}
                {viewingItem.type === 'Audio' && (
                  <div className="w-full max-w-3xl bg-slate-900/60 p-6 rounded-2xl border border-white/10">
                    <audio controls className="w-full" src={viewingItem.contentUrl}></audio>
                  </div>
                )}
                {viewingItem.type === 'Image' && (
                  viewingItem.image ? (
                    <img src={viewingItem.image} className="max-w-full max-h-full object-contain shadow-2xl" alt={viewingItem.title}/>
                  ) : (
                    <div className="text-sm font-black uppercase tracking-widest text-slate-400">Hakuna picha</div>
                  )
                )}
             </div>
             <div className="p-6 bg-slate-900 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400 font-medium italic">"{viewingItem.description}"</p>
                <div className="flex gap-4">
                   <button className="px-6 py-2 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"><Share2 size={14}/> Shiriki</button>
                   <button className="px-6 py-2 bg-gold-500 text-primary-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"><Download size={14}/> Pakua</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};


