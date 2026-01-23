
import React, { useEffect, useState } from 'react';
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

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Kuelewa Unabii wa Danieli katika Karne ya 21",
    excerpt: "Jinsi matukio ya sasa ya ulimwengu yanavyoendana na sanamu ya Danieli sura ya 2 na maana yake kwetu leo.",
    author: "Pr. Juma M.",
    date: "Oct 25, 2026",
    readTime: "5 min read",
    likes: 1240,
    comments: 85,
    image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=800",
    tags: ["Unabii", "Historia"]
  },
  {
    id: 2,
    title: "Afya Bora: Dawa ya Mungu kwa Magonjwa",
    excerpt: "Kanuni nane za afya na jinsi zinavyoweza kubadilisha maisha yako na kukuweka huru kutoka kwa magonjwa ya kisasa.",
    author: "Dr. Sarah K.",
    date: "Oct 20, 2026",
    readTime: "7 min read",
    likes: 856,
    comments: 42,
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800",
    tags: ["Afya", "Maisha"]
  },
  {
    id: 3,
    title: "Siri ya Sabato ya Kweli",
    excerpt: "Je, siku ya ibada ilibadilishwa lini na nani? Uchunguzi wa kihistoria na kibiblia juu ya siku ya Bwana.",
    author: "Ev. Peter D.",
    date: "Oct 15, 2026",
    readTime: "10 min read",
    likes: 2100,
    comments: 320,
    image: "https://images.unsplash.com/photo-1543336783-bb59efd935a6?q=80&w=800",
    tags: ["Mafundisho", "Sheria"]
  },
  {
    id: 4,
    title: "Nguvu ya Maombi ya Familia",
    excerpt: "Ushuhuda wa jinsi maombi yalivyookoa ndoa yangu na kuleta amani nyumbani.",
    author: "Maria J.",
    date: "Oct 10, 2026",
    readTime: "4 min read",
    likes: 540,
    comments: 28,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800",
    tags: ["Ushuhuda", "Familia"]
  }
];

export const Blog: React.FC = () => {
  const [activePost, setActivePost] = useState<number | null>(null);
   const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
   const [likes, setLikes] = useState<Record<number, number>>(
      BLOG_POSTS.reduce((acc, post) => ({ ...acc, [post.id]: post.likes }), {})
   );
   const [loading, setLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const [detail, setDetail] = useState<string | null>(null);

   const mapPost = (post: any): BlogPost => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      date: new Date(post.published_at).toLocaleDateString(),
      readTime: post.read_time || '5 min read',
      likes: post.likes || 0,
      comments: post.comments || 0,
      image: post.image,
      tags: post.tags || [],
   });

   useEffect(() => {
      const loadPosts = async () => {
         setLoading(true);
         setErrorMessage('');
         try {
            const data = await getBlogPosts();
            if (data.length) {
               const mapped = data.map(mapPost);
               setPosts(mapped);
               setLikes(mapped.reduce((acc, post) => ({ ...acc, [post.id]: post.likes }), {}));
            }
         } catch (error) {
            setErrorMessage('Imeshindikana kupakua makala.');
         } finally {
            setLoading(false);
         }
      };

      loadPosts();
   }, []);

  const handleLike = (id: number) => {
    setLikes(prev => ({ ...prev, [id]: prev[id] + 1 }));
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
            setDetail(data.content || data.excerpt);
         } catch (error) {
            setDetail(post.excerpt);
         }
      };

      loadDetail();
   }, [activePost, posts]);

   if (activePost) {
      const post = posts.find(p => p.id === activePost);
      if (!post) return null;

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

          <img src={post.image} className="w-full h-96 object-cover rounded-xl mb-10" alt={post.title} />

               <div className="prose prose-lg prose-slate max-w-none">
                   <p className="font-serif text-xl leading-relaxed text-slate-700">
                      {detail || post.excerpt}
                   </p>
               </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-8">
             <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                <Heart size={24} className={likes[post.id] > post.likes ? "fill-red-500 text-red-500" : ""} />
                <span>{likes[post.id]}</span>
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
                     <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                  </div>
               </div>
            ))}
         </div>

         {/* Sidebar */}
         <div className="space-y-8 border-l border-slate-100 pl-8 hidden md:block">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900">Mada Zinazovuma</h3>
            <div className="flex flex-wrap gap-2">
               {['Unabii', 'Afya', 'Mahusiano', 'Sheria', 'Imani', 'Historia'].map(tag => (
                  <span key={tag} className="px-4 py-2 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-slate-800 cursor-pointer transition-colors">
                     {tag}
                  </span>
               ))}
            </div>

            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 pt-8">Wahariri Wetu</h3>
            <div className="space-y-4">
               {['Pr. Juma M.', 'Dr. Sarah K.', 'Ev. Peter D.'].map((author, i) => (
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
