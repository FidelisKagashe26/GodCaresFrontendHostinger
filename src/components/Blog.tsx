
import React, { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Share2, User, Clock, Bookmark, Search } from 'lucide-react';
import { getBlogPost, getBlogPosts } from '../services/blogService';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  likes: number;
  comments: number;
  image: string;
  tags: string[];
}

export const Blog: React.FC = () => {
  const [activePost, setActivePost] = useState<number | null>(null);
   const [posts, setPosts] = useState<BlogPost[]>([]);
   const [likes, setLikes] = useState<Record<number, number>>({});
   const [loading, setLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const [detail, setDetail] = useState<string | null>(null);

   const mapPost = (post: any): BlogPost => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      date: post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Hakuna taarifa',
      readTime: post.read_time || 'Hakuna taarifa',
      likes: post.likes || 0,
      comments: post.comments || 0,
      image: post.image || '',
      tags: post.tags || [],
   });

   useEffect(() => {
      const loadPosts = async () => {
         setLoading(true);
         setErrorMessage('');
         try {
            const data = await getBlogPosts();
            const mapped = data.map(mapPost);
            setPosts(mapped);
            setLikes(mapped.reduce((acc, post) => ({ ...acc, [post.id]: post.likes }), {}));
         } catch (error) {
            setErrorMessage('Imeshindikana kupakua makala.');
            setPosts([]);
            setLikes({});
         } finally {
            setLoading(false);
         }
      };

      loadPosts();
   }, []);

  const handleLike = (id: number) => {
    setLikes(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

   useEffect(() => {
      const loadDetail = async () => {
         if (!activePost) {
            setDetail(null);
            return;
         }
         const post = posts.find(p => p.id === activePost);
         if (!post) return;
         try {
            const data = await getBlogPost(post.id);
            setDetail(data.content || data.excerpt || 'Hakuna taarifa.');
         } catch (error) {
            setDetail(post.excerpt || 'Hakuna taarifa.');
         }
      };

      loadDetail();
   }, [activePost, posts]);

  const trendingTags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).slice(0, 8),
    [posts]
  );
  const editors = useMemo(
    () => Array.from(new Set(posts.map((post) => post.author).filter(Boolean))).slice(0, 6),
    [posts]
  );

  if (activePost) {
      const post = posts.find(p => p.id === activePost);
      if (!post) {
        return (
          <div className="max-w-3xl mx-auto bg-white min-h-screen text-slate-900 pb-20 animate-fade-in">
            <div className="p-8 space-y-6">
              <button onClick={() => setActivePost(null)} className="text-slate-500 hover:text-slate-900 font-bold text-sm">
                Rudi kwenye Makala
              </button>
              <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">Hakuna taarifa.</div>
            </div>
          </div>
        );
      }

    return (
      <div className="max-w-3xl mx-auto bg-white min-h-screen text-slate-900 pb-20 animate-fade-in">
        <div className="p-8">
          <button onClick={() => setActivePost(null)} className="text-slate-500 hover:text-slate-900 mb-8 font-bold text-sm">
            ← Rudi kwenye Makala
          </button>
          
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">{post.title}</h1>
          
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                   <User size={20} className="text-slate-500" />
                </div>
                <div>
                   <p className="font-bold text-sm">{post.author}</p>
                   <p className="text-slate-500 text-xs">{post.date} · {post.readTime}</p>
                </div>
             </div>
             <div className="flex gap-4 text-slate-400">
                <Share2 size={20} className="hover:text-slate-900 cursor-pointer" />
                <Bookmark size={20} className="hover:text-slate-900 cursor-pointer" />
             </div>
          </div>

          {post.image ? (
            <img src={post.image} className="w-full h-96 object-cover rounded-xl mb-10" alt={post.title} />
          ) : (
            <div className="w-full h-96 rounded-xl mb-10 bg-slate-100 flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-400">
              Hakuna picha
            </div>
          )}

               <div className="prose prose-lg prose-slate max-w-none">
                   <p className="font-serif text-xl leading-relaxed text-slate-700">
                      {detail || post.excerpt || 'Hakuna taarifa.'}
                   </p>
               </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-8">
             <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                <Heart size={24} className={likes[post.id] > post.likes ? "fill-red-500 text-red-500" : ""} />
                <span>{likes[post.id] ?? post.likes}</span>
             </button>
             <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                <MessageCircle size={24} />
                <span>{post.comments}</span>
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20 max-w-6xl mx-auto">
      <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight">God Cares <span className="text-gold-500">Blog</span></h1>
         <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tafuta makala..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm outline-none focus:ring-1 focus:ring-slate-300"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 p-8 md:p-12">
         {/* Main Feed */}
         <div className="md:col-span-2 space-y-12">
                  {loading && (
                     <div className="text-xs uppercase tracking-widest text-slate-400 font-black">Inapakia makala...</div>
                  )}
                  {errorMessage && (
                     <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                        {errorMessage}
                     </div>
                  )}
                  {!loading && posts.length === 0 && (
                     <div className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-lg">
                        Hakuna taarifa za makala kwa sasa.
                     </div>
                  )}
                  {posts.map(post => (
               <div key={post.id} className="flex flex-col md:flex-row gap-6 group cursor-pointer" onClick={() => setActivePost(post.id)}>
                  <div className="flex-1 space-y-3">
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <User size={12} /> <span>{post.author}</span>
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900 group-hover:text-gold-600 transition-colors leading-tight">
                        {post.title}
                     </h2>
                     <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-serif">
                        {post.excerpt}
                     </p>
                     <div className="pt-2 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                           <span>{post.date}</span>
                           <span>·</span>
                           <span>{post.readTime}</span>
                                        {post.tags?.[0] && (
                                           <span className="px-2 py-1 bg-slate-100 rounded-full text-slate-600">{post.tags[0]}</span>
                                        )}
                        </div>
                        <Bookmark size={16} className="text-slate-400 hover:text-slate-800" />
                     </div>
                  </div>
                  <div className="w-full md:w-48 h-32 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                     {post.image ? (
                       <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                         Hakuna picha
                       </div>
                     )}
                  </div>
               </div>
            ))}
         </div>

         {/* Sidebar */}
         <div className="space-y-8 border-l border-slate-100 pl-8 hidden md:block">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900">Mada Zinazovuma</h3>
            <div className="flex flex-wrap gap-2">
               {trendingTags.length === 0 && (
                 <span className="text-xs font-bold text-slate-400">Hakuna taarifa.</span>
               )}
               {trendingTags.map(tag => (
                  <span key={tag} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-slate-800 cursor-pointer transition-colors">
                     {tag}
                  </span>
               ))}
            </div>

            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 pt-8">Wahariri Wetu</h3>
            <div className="space-y-4">
               {editors.length === 0 && (
                 <p className="text-sm font-bold text-slate-400">Hakuna taarifa.</p>
               )}
               {editors.map((author, i) => (
                  <div key={i} className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                     <p className="text-sm font-bold text-slate-700">{author}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
