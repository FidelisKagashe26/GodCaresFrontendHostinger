import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Heart,
  LayoutGrid,
  Loader2,
  Radio,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { getDonationProjects, submitDonation } from '../../services/content/donationService';

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
const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000, 200000];

const sanitizeAmountInput = (value: string) => value.replace(/[^\d]/g, '');
const normalizeAmountInput = (value: string) => {
  const digits = sanitizeAmountInput(value);
  if (!digits) return '';
  return digits.replace(/^0+(?=\d)/, '');
};
const parseAmount = (value: string): number => {
  const normalized = sanitizeAmountInput(value).replace(/^0+(?=\d)/, '');
  if (!normalized) return 0;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const Donations: React.FC = () => {
  const [donationType, setDonationType] = useState<'general' | 'project'>('general');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState('10000');
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [providerOrderId, setProviderOrderId] = useState('');
  const [successMessage, setSuccessMessage] = useState('Asante kwa sadaka yako.');

  const amount = useMemo(() => parseAmount(amountInput), [amountInput]);
  const activeProject = useMemo(
    () => projects.find((project) => project.id === selectedProject) || null,
    [projects, selectedProject],
  );

  const formatTZS = (value: number) =>
    new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace('TZS', 'TSh');

  const progressPercent = (goal: number, raised: number) => {
    if (!goal) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      setErrorMessage('');
      try {
        const data = await getDonationProjects();
        const mapped: Project[] = data.map((project, index) => ({
          id: String(project.id),
          title: project.title,
          description: project.description,
          image: project.image,
          goal: project.goal,
          raised: project.raised,
          icon:
            index % 3 === 0
              ? <BookOpen size={16} />
              : index % 3 === 1
                ? <Radio size={16} />
                : <Users size={16} />,
        }));
        setProjects(mapped);
        setSelectedProject((current) => current || (mapped.length ? mapped[0].id : null));
      } catch {
        setProjects([]);
        setErrorMessage('Imeshindikana kupata miradi ya kuchangia.');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    void loadProjects();
  }, []);

  const handleAmountChange = (raw: string) => {
    setAmountInput(normalizeAmountInput(raw));
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleDonate = async () => {
    setErrorMessage('');

    if (amount <= 0) {
      setErrorMessage('Weka kiasi halali kinachozidi sifuri.');
      return;
    }

    if (donationType === 'project' && !selectedProject) {
      setErrorMessage('Chagua mradi kwanza.');
      return;
    }

    const phoneDigits = donorPhone.replace(/\D/g, '');
    if (paymentMethod === 'mobile' && phoneDigits.length !== 10 && phoneDigits.length !== 12) {
      setErrorMessage('Weka namba sahihi ya simu (mfano 07XXXXXXXX au 2557XXXXXXXX).');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await submitDonation({
        project: donationType === 'project' && selectedProject ? Number(selectedProject) : null,
        donor_name: donorName || undefined,
        donor_email: donorEmail || undefined,
        donor_phone: paymentMethod === 'mobile' ? donorPhone : undefined,
        amount,
        payment_method: paymentMethod,
      });

      if (donationType === 'project' && selectedProject) {
        const newRaised = Number(result.new_raised || 0);
        if (newRaised > 0) {
          setProjects((prev) =>
            prev.map((item) => (item.id === selectedProject ? { ...item, raised: newRaised } : item)),
          );
        }
      }

      setPaymentStatus(result.payment_status || (result.requires_ussd_approval ? 'processing' : 'completed'));
      setProviderOrderId(result.provider_order_id || '');
      setSuccessMessage(
        result.requires_ussd_approval
          ? 'Ombi la malipo limetumwa kwenye simu yako. Kubali USSD prompt kwa kuingiza PIN ya mtandao wako.'
          : result.detail || 'Asante kwa sadaka yako.',
      );
      setShowSuccess(true);
      setDonorName('');
      setDonorEmail('');
      if (paymentMethod !== 'mobile') {
        setDonorPhone('');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Imeshindikana kutuma sadaka.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-20 max-w-6xl mx-auto">
      <div className="p-4 sm:p-6 md:p-12 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/60 bg-gold-100/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gold-800">
            <Heart size={12} className="fill-current" />
            Sadaka ya Upendo
          </p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            God Cares <span className="text-gold-500">Changia</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Toa sadaka kwa mfuko wa huduma au mradi maalum, kisha lipia kwa simu kwa USSD moja kwa moja.
          </p>
        </div>

        <div className="w-full md:w-72 rounded-2xl border border-green-200/80 dark:border-slate-700 bg-green-50/70 dark:bg-slate-900/70 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700 dark:text-green-300">
            Lengo Lililochaguliwa
          </p>
          <p className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
            {donationType === 'general' ? 'Mfuko wa Huduma' : activeProject?.title || 'Chagua Mradi'}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {donationType === 'general'
              ? 'Mchango wako utaendesha huduma kwa ujumla.'
              : 'Mchango wako utaenda moja kwa moja kwenye mradi huu.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 p-3 sm:p-4 md:p-12">
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/70 p-1.5 flex">
            <button
              type="button"
              onClick={() => setDonationType('general')}
              className={`flex-1 rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] transition-colors inline-flex items-center justify-center gap-2 ${
                donationType === 'general'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CircleDollarSign size={14} />
              Mfuko wa Kawaida
            </button>
            <button
              type="button"
              onClick={() => {
                setDonationType('project');
                if (!selectedProject && projects.length > 0) {
                  setSelectedProject(projects[0].id);
                }
              }}
              className={`flex-1 rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] transition-colors inline-flex items-center justify-center gap-2 ${
                donationType === 'project'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid size={14} />
              Mradi Maalum
            </button>
          </div>

          {isLoadingProjects && (
            <div className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">
              Inapakia miradi...
            </div>
          )}
          {!isLoadingProjects && projects.length === 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Hakuna miradi ya kuonyesha kwa sasa.
            </div>
          )}

          <div className={`space-y-4 transition-opacity ${donationType === 'general' ? 'opacity-60' : 'opacity-100'}`}>
            {projects.map((project) => (
              <article
                key={project.id}
                className={`group cursor-pointer rounded-2xl border bg-white/95 dark:bg-slate-900/90 p-3.5 sm:p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] transition-all ${
                  selectedProject === project.id && donationType === 'project'
                    ? 'border-gold-400/90'
                    : 'border-green-200/80 dark:border-slate-700 hover:border-gold-400/80'
                }`}
                onClick={() => {
                  setSelectedProject(project.id);
                  setDonationType('project');
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProject(project.id);
                    setDonationType('project');
                  }
                }}
              >
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-400/20 dark:text-gold-200">
                          {project.icon}
                        </span>
                        Mradi wa Huduma
                      </div>
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                          selectedProject === project.id && donationType === 'project'
                            ? 'border-gold-500 bg-gold-500 text-primary-950'
                            : 'border-slate-300 dark:border-slate-600 text-slate-500'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {project.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="space-y-2">
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all duration-700"
                          style={{ width: `${progressPercent(project.goal, project.raised)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-bold">{formatTZS(project.raised)} imekusanywa</span>
                        <span className="font-semibold">Lengo: {formatTZS(project.goal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-48 md:h-32 min-h-[10.5rem] md:min-h-0 shrink-0 rounded-xl overflow-hidden bg-green-50 dark:bg-slate-800 border border-green-100 dark:border-slate-700 flex items-center justify-center">
                    {project.image ? (
                      <img
                        src={project.image}
                        className="block w-full h-auto md:h-full object-contain md:object-cover md:group-hover:scale-105 transition-transform duration-500"
                        alt={project.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Hakuna picha
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-green-100/90 dark:border-slate-700 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    Chagua mradi huu
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/80 bg-gold-100/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-gold-800">
                    Endelea
                    <ArrowRight size={13} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="md:sticky md:top-28 space-y-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)]">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Kiasi cha Sasa
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                {amount > 0 ? formatTZS(amount) : 'TSh 0'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Jina (Hiari)
                </label>
                <input
                  value={donorName}
                  onChange={(event) => setDonorName(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-gold-500"
                  placeholder="Mtoa sadaka"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Barua Pepe (Hiari)
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(event) => setDonorEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-gold-500"
                  placeholder="barua.pepe@mfano.com"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Namba ya Simu {paymentMethod === 'mobile' ? '(Lazima)' : '(Hiari)'}
                </label>
                <input
                  value={donorPhone}
                  onChange={(event) => setDonorPhone(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-gold-500"
                  placeholder="07XXXXXXXX au 2557XXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Chagua Kiasi (TSh)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAmountChange(String(preset))}
                    className={`rounded-lg border px-2 py-2 text-xs font-black transition-colors ${
                      amount === preset
                        ? 'border-primary-950 bg-primary-950 text-gold-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gold-400'
                    }`}
                  >
                    {formatTZS(preset)}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  TSh
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountInput}
                  onFocus={(event) => event.currentTarget.select()}
                  onBlur={() => {
                    const nextAmount = parseAmount(amountInput);
                    setAmountInput(nextAmount > 0 ? String(nextAmount) : '');
                  }}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-12 pr-3 py-3 text-base font-black text-slate-900 dark:text-slate-100 outline-none focus:border-gold-500"
                  placeholder="Weka kiasi..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Njia ya Malipo
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mobile')}
                  className={`rounded-xl border px-3 py-3 text-xs font-black uppercase tracking-[0.08em] transition-colors inline-flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'mobile'
                      ? 'border-primary-950 bg-primary-950 text-gold-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gold-400'
                  }`}
                >
                  <Smartphone size={14} />
                  Simu
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`rounded-xl border px-3 py-3 text-xs font-black uppercase tracking-[0.08em] transition-colors inline-flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'card'
                      ? 'border-primary-950 bg-primary-950 text-gold-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gold-400'
                  }`}
                >
                  <CreditCard size={14} />
                  Kadi
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold px-3 py-2 rounded-lg">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleDonate}
              disabled={isProcessing}
              className="w-full rounded-xl bg-gold-500 text-primary-950 py-4 text-[11px] font-black uppercase tracking-[0.24em] hover:bg-gold-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Inachakata...
                </>
              ) : (
                'Toa Sasa'
              )}
            </button>

            <p className="inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <ShieldCheck size={12} className="text-emerald-600" />
              Muamala Salama wa SSL
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'USSD Moja kwa Moja',
              desc: 'Ukichagua malipo ya simu, request inatumwa kwenye simu yako moja kwa moja kuthibitisha kwa PIN.',
            },
            {
              title: 'Uwajibikaji',
              desc: 'Kila sadaka huhifadhiwa na kufuatiliwa ili kuonyesha maendeleo ya mradi kwa uwazi.',
            },
            {
              title: 'Kipaumbele cha Misheni',
              desc: 'Michango ya mradi maalum huenda moja kwa moja kwenye lengo ulilochagua.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-5"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900 dark:text-slate-100">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-8 text-center space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500 text-white inline-flex items-center justify-center">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Muamala Umetumwa</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{successMessage}</p>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-left space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Hali ya Malipo
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase">{paymentStatus}</p>
              {providerOrderId && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 pt-1">
                    Namba ya Oda
                  </p>
                  <p className="text-xs font-mono font-bold break-all text-slate-800 dark:text-slate-200">{providerOrderId}</p>
                </>
              )}
            </div>

            {paymentStatus === 'processing' && (
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Tafadhali fungua USSD prompt kwenye simu yako na weka PIN kuthibitisha muamala.
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="w-full rounded-xl bg-primary-950 text-gold-400 py-3 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-colors"
            >
              Endelea
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
