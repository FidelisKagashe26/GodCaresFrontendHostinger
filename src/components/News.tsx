
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Tag, ChevronRight, Globe, AlertTriangle, Church, Clock, Newspaper, ArrowRight, X, Share2, Bookmark } from 'lucide-react';
import { getNewsItems } from '../services/newsService';
import { subscribeNewsletter } from '../services/newsletterService';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  author: string;
  featured?: boolean;
}

const CATEGORIES = ['Global', 'Prophecy', 'Church', 'Events'];

const NEWS_ITEMS: NewsItem[] = [
  { 
    id: 1, 
    title: 'Global Mission Summit 2025 Announced', 
    date: 'Oct 24, 2024', 
    category: 'Events', 
    author: 'Admin',
    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Join missionaries from around the world for a virtual gathering focusing on digital evangelism strategies.',
    content: `
      <p>The Global Mission Summit 2025 is set to be the largest gathering of digital evangelists in history. Scheduled for mid-2025, this event aims to equip believers with cutting-edge tools to spread the Gospel in the digital age.</p>
      <p>Key topics will include:</p>
      <ul>
        <li>AI in Evangelism: Leveraging technology for good.</li>
        <li>Social Media Discipleship: Moving beyond likes to life change.</li>
        <li>Cross-Cultural Communication: Reaching unreached people groups online.</li>
      </ul>
      <p>Registration is now open for early bird tickets. Don't miss this opportunity to be part of the movement.</p>
    `,
    featured: true
  },
  { 
    id: 2, 
    title: 'New Translation of Bible Study Guides', 
    date: 'Oct 20, 2024', 
    category: 'Church', 
    author: 'Editorial Team',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    excerpt: 'We have now launched our foundational guides in Swahili, French, and Spanish to reach more souls.',
    content: `
      <p>In our effort to fulfill the Great Commission, God Cares 365 is proud to announce the release of our fundamental Bible study guides in three new languages: Swahili, French, and Spanish.</p>
      <p>This initiative targets over 500 million native speakers worldwide, providing them with access to accurate, Sola Scriptura-based teachings in their heart language.</p>
      <p>Volunteers are needed to help distribute these digital resources. If you are fluent in any of these languages and wish to help moderate community discussions, please contact us.</p>
    `
  },
  { 
    id: 3, 
    title: 'Natural Disasters Increasing: A Sign?', 
    date: 'Oct 15, 2024', 
    category: 'Prophecy', 
    author: 'Dr. J. Smith',
    image: 'https://images.unsplash.com/photo-1454789476662-bdd7104d27f5?auto=format&fit=crop&q=80&w=800',
    excerpt: 'Analysis of recent global events in light of Matthew 24 predictions. Are we seeing the birth pains?',
    content: `
      <p>Recent data from global geological and meteorological institutes confirms a sharp rise in the frequency and intensity of natural disasters. From earthquakes in unexpected regions to unprecedented floods, the earth seems to be groaning.</p>
      <p>Matthew 24:7-8 states, "For nation shall rise against nation, and kingdom against kingdom: and there shall be famines, and pestilences, and earthquakes, in divers places. All these are the beginning of sorrows."</p>
      <p>This article explores the statistical correlation between current events and biblical prophecy, urging believers to be watchful and prepared, not fearful, but hopeful for the coming redemption.</p>
    `,
    featured: true
  },
  { 
    id: 4, 
    title: 'Digital Evangelism Reaches Remote Villages', 
    date: 'Oct 12, 2024', 
    category: 'Global', 
    author: 'Mission Desk',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    excerpt: 'How solar-powered tablets are bringing the gospel to off-grid communities in East Africa.',
    content: `
      <p>In a groundbreaking initiative, solar-powered tablets pre-loaded with the God Cares 365 curriculum are being distributed to remote villages in East Africa that lack electricity and internet access.</p>
      <p>These "Mission Stations" allow entire communities to gather around a single device to watch prophecy seminars, health talks, and bible stories.</p>
      <p>Early reports indicate that over 50 new home churches have been planted as a direct result of this project in the last 3 months alone.</p>
    `
  },
  { 
    id: 5, 
    title: 'Understanding the 2300 Days Prophecy', 
    date: 'Oct 10, 2024', 
    category: 'Prophecy', 
    author: 'Theology Dept',
    image: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&q=80&w=800',
    excerpt: 'A deep dive into the longest time prophecy in the Bible and its relevance today.',
    content: `
      <p>Daniel 8:14 contains the longest time prophecy in the Bible: "Unto two thousand and three hundred days; then shall the sanctuary be cleansed."</p>
      <p>This study breaks down the timeline starting from 457 BC, the decree to rebuild Jerusalem, all the way to 1844 AD. We explore the meaning of the Investigative Judgment and what Jesus is doing right now in the Most Holy Place of the heavenly sanctuary.</p>
      <p>Understanding this prophecy is crucial for understanding the times we live in and the urgency of the hour.</p>
    `
  },
];

export const News: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
   const [items, setItems] = useState<NewsItem[]>(NEWS_ITEMS);
   const [loading, setLoading] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
   const [email, setEmail] = useState('');
   const [newsletterMessage, setNewsletterMessage] = useState('');
   const categories = useMemo(() => {
      const unique = new Set(items.map(item => item.category));
      return ['All', ...Array.from(unique)];
   }, [items]);

   useEffect(() => {
      const loadNews = async () => {
         setLoading(true);
         setErrorMessage('');
         try {
            const data = await getNewsItems();
            if (data.length) {
               const mapped: NewsItem[] = data.map(item => ({
                  id: item.id,
                  title: item.title,
                  date: new Date(item.published_at).toLocaleDateString(),
                  category: item.category,
                  image: item.image,
                  excerpt: item.excerpt,
                  content: item.content,
                  author: item.author,
                  featured: item.featured,
               }));
               setItems(mapped);
            }
         } catch (error) {
            setErrorMessage('Imeshindikana kupakua habari.');
         } finally {
            setLoading(false);
         }
      };

      loadNews();
   }, []);
  
   const filteredNews = activeCategory === 'All' 
      ? items 
      : items.filter(n => n.category === activeCategory);

   const featuredNews = items.filter(n => n.featured);

  return (
    <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto px-4 md:px-0">
      {/* Header & Breaking News */}
      <section className="space-y-8 pt-8">
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-3 rounded-xl text-primary-900">
                <Newspaper size={24} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Prophetic <span className="text-gold-500">News</span></h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Updates from the Frontline</p>
              </div>
           </div>
           
           {/* New Breaking News Bar */}
           <div className="w-full bg-red-600 text-white rounded-xl p-1 shadow-lg shadow-red-600/20 overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="relative flex items-center gap-4 py-3 px-4">
                 <div className="bg-white text-red-600 text-[10px] font-black uppercase px-3 py-1 rounded animate-pulse shadow-sm shrink-0">
                    LIVE ALERT
                 </div>
                 <div className="h-4 w-px bg-white/30 hidden md:block"></div>
                 <p className="text-xs md:text-sm font-bold uppercase tracking-wide truncate flex-1">
                    Breaking: Peace Treaty Talks in Middle East Intensify • Signs of the Times...
                 </p>
                 <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
           </div>
        </div>

        {/* Featured Stories Carousel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {featuredNews.map((news) => (
             <div 
                key={news.id} 
                onClick={() => setSelectedNews(news)}
                className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl border border-slate-200 hover:shadow-2xl transition-all"
             >
               <img src={news.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={news.title} />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>
               
               <div className="absolute top-6 left-6">
                  <span className="px-3 py-1 bg-gold-500 text-primary-950 text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg">
                    Featured
                  </span>
               </div>

               <div className="absolute bottom-0 left-0 p-8 space-y-3 w-full">
                  <div className="flex items-center gap-3 text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-1">
                     <span className="text-gold-400">{news.category}</span>
                     <span>•</span>
                     <span className="flex items-center gap-1"><Clock size={10} /> {news.date}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight group-hover:text-gold-400 transition-colors line-clamp-2">{news.title}</h2>
                  <p className="text-slate-300 text-sm font-medium line-clamp-2 max-w-lg">{news.excerpt}</p>
                  <div className="pt-4 flex items-center text-white text-xs font-black uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                     Soma Habari Kamili <ArrowRight size={14} />
                  </div>
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* Main Feed Section */}
      <section className="space-y-8">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
           <button 
             onClick={() => setActiveCategory('All')}
             className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory === 'All' ? 'bg-primary-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
           >
             All News
           </button>
                {categories.filter(cat => cat !== 'All').map(cat => (
             <button 
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
             >
               {cat}
             </button>
           ))}
        </div>

            {loading && (
               <div className="text-xs uppercase tracking-widest text-slate-400 font-black">Inapakia habari...</div>
            )}
            {errorMessage && (
               <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                  {errorMessage}
               </div>
            )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {filteredNews.map((item) => (
             <div 
               key={item.id} 
               onClick={() => setSelectedNews(item)}
               className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-gold-500/30 transition-all group flex flex-col h-full cursor-pointer"
             >
                <div className="h-48 overflow-hidden relative">
                   <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary-900 shadow-sm">
                      {item.category}
                   </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                   <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-3">
                      <Calendar size={12} /> {item.date}
                   </div>
                   <h3 className="text-lg font-black text-slate-900 mb-3 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">{item.title}</h3>
                   <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3 font-medium">{item.excerpt}</p>
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-900 group-hover:text-gold-600 transition-colors mt-auto">
                      Read Full Story <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-primary-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
         
         <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Stay Ahead of the Times</h2>
            <p className="text-slate-400 text-sm font-medium">
               Get weekly prophetic updates and mission reports directly to your inbox. No spam, just truth.
            </p>
            <div className="flex gap-2 p-1 bg-white/10 rounded-xl border border-white/10">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email..." className="flex-1 bg-transparent px-4 py-3 text-white text-sm outline-none placeholder:text-slate-400" />
                      <button
                         onClick={async () => {
                            setNewsletterMessage('');
                            try {
                               await subscribeNewsletter(email);
                               setNewsletterMessage('Asante! Umejiunga kikamilifu.');
                               setEmail('');
                            } catch (error) {
                               setNewsletterMessage('Imeshindikana kujiunga.');
                            }
                         }}
                         className="bg-gold-500 text-primary-900 px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                      >
                         Subscribe
                      </button>
            </div>
                  {newsletterMessage && (
                     <p className="text-xs font-bold uppercase tracking-widest text-gold-400">{newsletterMessage}</p>
                  )}
         </div>
      </section>

      {/* NEWS DETAIL MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-[500] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-scale-up">
              
              {/* Modal Header Image */}
              <div className="relative h-64 md:h-80 shrink-0">
                 <img src={selectedNews.image} className="w-full h-full object-cover" alt={selectedNews.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                 <button 
                   onClick={() => setSelectedNews(null)}
                   className="absolute top-4 right-4 bg-black/40 hover:bg-red-600 text-white p-2 rounded-full transition-all backdrop-blur-md z-10"
                 >
                   <X size={20} />
                 </button>
                 <div className="absolute bottom-0 left-0 p-8 w-full">
                    <span className="px-3 py-1 bg-gold-500 text-primary-950 text-[10px] font-black uppercase tracking-widest rounded mb-4 inline-block">
                       {selectedNews.category}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black text-white leading-tight uppercase tracking-tight shadow-sm">
                       {selectedNews.title}
                    </h2>
                 </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 text-xs">
                          {selectedNews.author.charAt(0)}
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{selectedNews.author}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedNews.date}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 text-slate-400 hover:text-primary-900 transition-colors"><Bookmark size={20} /></button>
                       <button className="p-2 text-slate-400 hover:text-primary-900 transition-colors"><Share2 size={20} /></button>
                    </div>
                 </div>

                 <div 
                   className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: selectedNews.content }}
                 ></div>

                 <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-50 p-6 rounded-2xl">
                    <div>
                       <h4 className="font-black text-slate-900 uppercase text-sm">Share this story</h4>
                       <p className="text-xs text-slate-500 mt-1">Spread the truth to your network.</p>
                    </div>
                    <div className="flex gap-3">
                       <button className="px-6 py-3 bg-primary-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-primary-900 transition-all shadow-lg">
                          Share Now
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
