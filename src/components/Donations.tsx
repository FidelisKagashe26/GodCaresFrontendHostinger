
import React, { useEffect, useState } from 'react';
import { 
  Heart, CreditCard, Gift, ShieldCheck, Cross, 
  Smartphone, Globe, BookOpen, Radio, Users, 
  ArrowRight, CheckCircle2, PieChart, TrendingUp, Info, X, 
  Sparkles, Shield, LayoutGrid, CircleDollarSign
} from 'lucide-react';
import { getDonationProjects, submitDonation } from '../services/donationService';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  icon: React.ReactNode;
}

const PROJECTS: Project[] = [];

export const Donations: React.FC = () => {
  const [donationType, setDonationType] = useState<'general' | 'project'>('general');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [errorMessage, setErrorMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  const formatTZS = (val: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(val).replace('TZS', 'TSh');
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getDonationProjects();
        const mapped: Project[] = data.map((project, index) => ({
          id: String(project.id),
          title: project.title,
          description: project.description,
          image: project.image,
          goal: project.goal,
          raised: project.raised,
          icon: index % 3 === 0 ? <BookOpen size={18} /> : index % 3 === 1 ? <Radio size={18} /> : <Users size={18} />,
        }));
        setProjects(mapped);
        if (!selectedProject && mapped.length) {
          setSelectedProject(mapped[0].id);
        }
      } catch (error) {
        setErrorMessage('Imeshindikana kupata miradi.');
      }
    };

    loadProjects();
  }, []);

  const handleDonate = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      await submitDonation({
        project: donationType === 'project' && selectedProject ? Number(selectedProject) : null,
        donor_name: donorName || undefined,
        donor_email: donorEmail || undefined,
        amount,
        payment_method: paymentMethod,
      });
      setShowSuccess(true);
      if (donationType === 'project' && selectedProject) {
        setProjects(prev => prev.map(p => p.id === selectedProject ? { ...p, raised: p.raised + amount } : p));
      }
      setDonorName('');
      setDonorEmail('');
    } catch (error) {
      setErrorMessage('Imeshindikana kutuma sadaka.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProjectSelect = (id: string) => {
    setSelectedProject(id);
    setDonationType('project');
  };

  return (
    <div className="space-y-16 animate-fade-in pb-32 max-w-7xl mx-auto px-4 md:px-6">
      
      {/* 1. CINEMATIC HERO SECTION - Minimum Bevel rounded-2xl */}
      <section className="relative bg-primary-950 rounded-2xl p-10 md:p-20 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5">
        <div className="absolute inset-0 opacity-40">
           <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/80 to-transparent"></div>
        
        <div className="relative z-10 space-y-6 max-w-3xl">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-400 rounded-lg text-[9px] font-black uppercase tracking-[0.3em]">
              <Heart size={12} fill="currentColor" className="animate-pulse" /> Sadaka ya Upendo
           </div>
           <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-lg">
             Ushirika wa <span className="text-gold-500">Upendo.</span>
           </h1>
           <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-gold-500/50 pl-6">
             "Toeni, nanyi mtapewa; kipimo cha kujaa, na kushindiliwa, na kusukwasukwa, hata kumwagika..." — Luka 6:38
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: PROJECTS SELECTION */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3 px-2">
             <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Miradi ya Injili</h3>
             <p className="text-slate-500 text-sm font-medium">Chagua mradi unaotaka kusaidia au changia mfuko wa kawaida.</p>
          </div>

          <div className={`space-y-4 transition-all duration-500 ${donationType === 'general' ? 'opacity-60 grayscale' : 'opacity-100'}`}>
             {projects.map((project) => (
               <div 
                 key={project.id}
                 onClick={() => handleProjectSelect(project.id)}
                 className={`group relative bg-white dark:bg-slate-900/50 rounded-xl border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col md:flex-row ${
                   selectedProject === project.id && donationType === 'project' 
                     ? 'border-gold-500 shadow-2xl scale-[1.01] bg-slate-50 dark:bg-white/5' 
                     : 'border-slate-100 dark:border-white/5 hover:border-gold-500/30 shadow-sm'
                 }`}
               >
                 <div className="w-full md:w-52 h-44 md:h-auto overflow-hidden relative">
                    <img src={project.image} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-primary-900/10"></div>
                 </div>
                 <div className="p-6 md:p-8 flex-1 space-y-5">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gold-600 dark:text-gold-500">
                             {project.icon}
                             <span className="text-[9px] font-black uppercase tracking-widest">Digital_Mission_Project</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{project.title}</h4>
                       </div>
                       <div className={`p-2 rounded-full transition-all ${selectedProject === project.id && donationType === 'project' ? 'bg-gold-500 text-primary-950' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                          <CheckCircle2 size={16} />
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gold-500 shadow-[0_0_10px_#eab308] transition-all duration-1000" 
                            style={{ width: `${(project.raised / project.goal) * 100}%` }}
                          ></div>
                       </div>
                       <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mchango wa Sasa</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">{formatTZS(project.raised)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Goal</p>
                            <p className="text-xs font-bold text-slate-500 uppercase">{formatTZS(project.goal)}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* RIGHT: DONATION FORM - Minimum Bevel rounded-xl */}
        <div className="lg:col-span-5">
           <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-2xl p-8 md:p-10 space-y-8">
              
              {/* Type Selection */}
              <div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl flex">
                 <button 
                   onClick={() => { setDonationType('general'); setSelectedProject(null); }}
                   className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${donationType === 'general' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                 >
                    <CircleDollarSign size={14} /> Sadaka ya Kawaida
                 </button>
                 <button 
                   onClick={() => { setDonationType('project'); if(!selectedProject && projects.length) setSelectedProject(projects[0].id); }}
                   className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${donationType === 'project' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                 >
                    <LayoutGrid size={14} /> Kupitia Mradi
                 </button>
              </div>

              <div className="space-y-2 text-center">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    {donationType === 'general' ? 'Mfuko wa Huduma' : selectedProject ? projects.find(p => p.id === selectedProject)?.title : 'Chagua Mradi'}
                 </h3>
                 <div className="h-0.5 w-12 bg-gold-500 mx-auto"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-2">
                    {donationType === 'general' ? 'Sadaka yako inasaidia uendeshaji wa huduma kwa ujumla.' : 'Sadaka yako itaenda moja kwa moja kwenye mradi huu.'}
                  </p>
              </div>

                {errorMessage && (
                 <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                  {errorMessage}
                 </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jina (Hiari)</label>
                    <input value={donorName} onChange={(e) => setDonorName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all" placeholder="Mtoa Sadaka" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Hiari)</label>
                    <input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold text-slate-900 dark:text-white focus:border-gold-500 transition-all" placeholder="email@mfano.com" />
                  </div>
                </div>

              {/* Amount Selection */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kiasi cha Kuchangia (TSh)</p>
                 <div className="grid grid-cols-2 gap-2">
                    {[5000, 10000, 50000, 100000].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => setAmount(amt)}
                        className={`py-3 rounded-lg font-black text-[11px] border transition-all ${amount === amt ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-xl' : 'bg-transparent text-slate-500 border-slate-100 dark:border-white/5 hover:border-gold-500/50'}`}
                      >
                        {formatTZS(amt)}
                      </button>
                    ))}
                 </div>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">TSh</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white font-black text-lg focus:border-gold-500 transition-all"
                      placeholder="Kiasi kingine..."
                    />
                 </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Njia ya Malipo</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentMethod('mobile')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all ${paymentMethod === 'mobile' ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-lg' : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-400'}`}
                    >
                       <Smartphone size={24} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Mobile Pay</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all ${paymentMethod === 'card' ? 'bg-primary-950 text-gold-400 border-primary-950 shadow-lg' : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-400'}`}
                    >
                       <CreditCard size={24} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Bank Card</span>
                    </button>
                 </div>
              </div>

              <button 
                onClick={handleDonate}
                disabled={isProcessing}
                className="w-full py-5 bg-gold-500 text-primary-950 rounded-xl font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50 active:scale-95"
              >
                {isProcessing ? 'INACHAKATA...' : 'TOA SASA'}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-400">
                 <ShieldCheck size={14} className="text-green-500" />
                 <span className="text-[8px] font-black uppercase tracking-[0.2em]">SSL Secured 256-bit Connection</span>
              </div>
           </div>
        </div>
      </div>

      {/* 3. SCIENTIFIC TRANSPARENCY SECTION - Minimum Bevel rounded-xl */}
      <section className="space-y-12 py-16">
         <div className="text-center space-y-4">
            <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em]">KITAALAMU & UWAZI</h3>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Matumizi ya Kila Shilingi</h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full"></div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <PieChart size={24} />, title: "90% Misheni", desc: "Fedha huenda moja kwa moja kwenye miradi ya uinjilisti bila kupitia urasimu wa ofisi." },
              { icon: <TrendingUp size={24} />, title: "Ukuaji", desc: "Kila Shilingi 1,000 inatusaidia kufikisha ujumbe kwa watu wapya wasiopungua watano duniani." },
              { icon: <Shield size={24} />, title: "Uwajibikaji", desc: "Kila mfadhili hupata ripoti ya kila robo mwaka ikionyesha picha na takwimu za mradi husika." }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-white/5 p-8 rounded-xl border border-slate-100 dark:border-white/5 space-y-5 group hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all shadow-sm hover:shadow-xl">
                 <div className="p-4 bg-primary-950 text-gold-400 rounded-lg w-fit group-hover:scale-110 transition-transform shadow-lg">{item.icon}</div>
                 <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">"{item.desc}"</p>
              </div>
            ))}
         </div>
      </section>

      {/* 4. SUCCESS MODAL - Minimum Bevel rounded-3xl */}
      {showSuccess && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
           <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-3xl p-10 md:p-14 text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 animate-scale-up">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-bounce">
                 <CheckCircle2 size={48} />
              </div>
              <div className="space-y-4">
                 <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase leading-none italic">Barikiwa!</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Mungu amekutumia leo kuwa nuru kwa wengine. Sadaka yako imethibitishwa na imepokelewa kwa usalama.</p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stakabadhi No:</p>
                 <p className="text-2xl font-black text-primary-950 dark:text-gold-500 font-mono">GC-GIFT-8839</p>
                 <p className="text-[10px] font-bold uppercase text-slate-500 mt-2">
                    {donationType === 'general' ? 'Mfuko wa Kawaida' : 'Mradi Maalum'}
                 </p>
              </div>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-5 bg-primary-950 text-gold-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 hover:text-primary-950 transition-all shadow-xl"
              >Rudi Kwenye Huduma</button>
           </div>
        </div>
      )}

    </div>
  );
};
