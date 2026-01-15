import React from 'react';
import { Award, Share2, Download } from 'lucide-react';

interface Props {
  userName: string;
  date: string;
}

export const Certificate: React.FC<Props> = ({ userName, date }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Missionary Certificate',
          text: `I have completed the God Cares 365 journey and am now a certified Digital Missionary!`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback or ignore
      }
    } else {
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="animate-fade-in p-8 flex flex-col items-center">
      <div className="bg-white p-2 shadow-2xl rounded-lg max-w-3xl w-full relative border-8 border-double border-slate-200">
        <div className="border-4 border-gold-500 p-10 text-center relative overflow-hidden">
           {/* Watermark */}
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
             <Award size={400} />
           </div>

           <div className="relative z-10">
             <div className="flex justify-center mb-6">
                <div className="bg-gold-500 text-white p-4 rounded-full">
                    <Award size={48} />
                </div>
             </div>
             
             <h1 className="text-4xl md:text-5xl font-serif text-slate-800 font-bold mb-2">Certificate of Completion</h1>
             <p className="text-slate-500 uppercase tracking-widest text-sm mb-12">God Cares 365 Academy</p>
             
             <p className="text-xl text-slate-600 mb-2">This certifies that</p>
             <h2 className="text-3xl md:text-4xl font-serif text-primary-700 font-bold mb-2 border-b-2 border-slate-200 inline-block px-8 pb-2">
               {userName}
             </h2>
             <p className="text-xl text-slate-600 mt-8 mb-8">
               Has successfully completed the journey from discovery to truth, demonstrating a commitment to Biblical understanding and the Great Commission.
             </p>

             <div className="flex justify-between items-end mt-16 px-10">
               <div className="text-center">
                 <div className="w-40 border-b border-slate-400 mb-2"></div>
                 <p className="text-sm text-slate-500 font-serif">Date: {date}</p>
               </div>
               <div className="text-center">
                  <div className="w-24 h-24 bg-gold-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg mx-auto mb-2">
                    SEAL
                  </div>
               </div>
               <div className="text-center">
                 <div className="w-40 border-b border-slate-400 mb-2"></div>
                 <p className="text-sm text-slate-500 font-serif">Program Director</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
          <Download size={20} /> Download PDF
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
          <Share2 size={20} /> Share Achievement
        </button>
      </div>
    </div>
  );
};