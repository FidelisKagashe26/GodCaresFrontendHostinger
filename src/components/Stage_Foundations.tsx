import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Church,
  Compass,
  Cross,
  Droplets,
  Flame,
  GraduationCap,
  Heart,
  MessageCircle,
  ScrollText,
  Sparkles,
  Star,
  Sunrise,
  Trophy,
  Users
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  focus: string;
  summary: string;
  verse: string;
  takeaway: string;
  checkpoints: string[];
  icon: React.ReactNode;
}

const FOUNDATION_LESSONS: Lesson[] = [
  {
    id: 'f-1',
    title: 'Biblia ni Neno la Mungu',
    focus: 'Mamlaka na ufunuo',
    summary: 'Biblia ni msingi wa imani; hutufundisha ukweli kuhusu Mungu, mwanadamu, na wokovu.',
    verse: '2 Timotheo 3:16-17',
    takeaway: 'Soma kila siku na pima kila fundisho kwa Neno.',
    checkpoints: ['Soma Yohana 1', 'Andika ahadi 3 kuhusu wokovu', 'Omba uelewa kabla ya kusoma'],
    icon: <BookOpen size={18} />
  },
  {
    id: 'f-2',
    title: 'Mungu ni nani?',
    focus: 'Tabia ya Mungu',
    summary: 'Mungu ni upendo, haki, na rehema; tabia yake ndiyo kipimo cha maisha ya imani.',
    verse: '1 Yohana 4:8',
    takeaway: 'Onyesha upendo na haki katika maamuzi ya leo.',
    checkpoints: ['Orodhesha sifa 5 za Mungu', 'Soma Kutoka 34:6-7', 'Tafakari kuhusu uaminifu wake'],
    icon: <Sparkles size={18} />
  },
  {
    id: 'f-3',
    title: 'Uumbaji na thamani ya mtu',
    focus: 'Asili na kusudi',
    summary: 'Tumeumbwa kwa mfano wa Mungu; kila maisha yana thamani na kusudi.',
    verse: 'Mwanzo 1:26-27',
    takeaway: 'Heshimu maisha yako na ya wengine.',
    checkpoints: ['Soma Zaburi 139', 'Andika kusudi lako kuu', 'Shukuru kwa uumbaji'],
    icon: <Compass size={18} />
  },
  {
    id: 'f-4',
    title: 'Dhambi na matokeo',
    focus: 'Uasi na maumivu',
    summary: 'Dhambi ilileta maumivu duniani; inatutenganisha na Mungu.',
    verse: 'Warumi 3:23',
    takeaway: 'Kubali hitaji la msamaha na toba.',
    checkpoints: ['Soma Mwanzo 3', 'Taja matokeo 3 ya dhambi', 'Omba msamaha'],
    icon: <AlertTriangle size={18} />
  },
  {
    id: 'f-5',
    title: 'Yesu ni Mwokozi',
    focus: 'Msalaba na upatanisho',
    summary: 'Yesu alikufa na kufufuka ili kutuokoa; ndiye njia ya uzima.',
    verse: 'Yohana 3:16',
    takeaway: 'Mtazame Yesu kama msingi wa tumaini.',
    checkpoints: ['Soma Luka 23-24', 'Andika maana ya msalaba kwako', 'Shukuru kwa neema'],
    icon: <Cross size={18} />
  },
  {
    id: 'f-6',
    title: 'Neema na imani',
    focus: 'Kuokolewa kwa neema',
    summary: 'Wokovu ni zawadi; hatuokolewi kwa matendo yetu bali kwa neema kupitia imani.',
    verse: 'Waefeso 2:8-9',
    takeaway: 'Amini na utegemee neema ya Kristo.',
    checkpoints: ['Soma Warumi 5', 'Andika tofauti ya neema na kazi', 'Omba imani mpya'],
    icon: <Heart size={18} />
  },
  {
    id: 'f-7',
    title: 'Sheria ya Mungu',
    focus: 'Misingi ya maadili',
    summary: 'Amri kumi ni kioo cha tabia ya Mungu na mwongozo wa maisha ya uaminifu.',
    verse: 'Kutoka 20:1-17',
    takeaway: 'Shika sheria kama njia ya upendo.',
    checkpoints: ['Soma Amri Kumi', 'Chagua amri moja uishie leo', 'Omba utii'],
    icon: <ScrollText size={18} />
  },
  {
    id: 'f-8',
    title: 'Sabato ya Bwana',
    focus: 'Ibada na pumziko',
    summary: 'Sabato ni alama ya uhusiano wa Mungu na watu wake; ni siku ya pumziko na ibada.',
    verse: 'Kutoka 20:8-11',
    takeaway: 'Tenga muda wa ibada na pumziko la roho.',
    checkpoints: ['Soma Isaya 58:13-14', 'Panga ibada ya familia', 'Pumzika bila kazi nzito'],
    icon: <Sunrise size={18} />
  },
  {
    id: 'f-9',
    title: 'Maombi',
    focus: 'Uhusiano binafsi',
    summary: 'Maombi ni mazungumzo ya moyo kwa Mungu; yanatupa amani na mwelekeo.',
    verse: 'Wafilipi 4:6-7',
    takeaway: 'Omba kwa uaminifu na shukrani.',
    checkpoints: ['Soma Mathayo 6:5-13', 'Andika orodha ya maombi', 'Omba asubuhi na jioni'],
    icon: <MessageCircle size={18} />
  },
  {
    id: 'f-10',
    title: 'Roho Mtakatifu',
    focus: 'Uongozi wa ndani',
    summary: 'Roho Mtakatifu hutufundisha, hututia nguvu, na hutufanya watakatifu.',
    verse: 'Yohana 14:26',
    takeaway: 'Sikiliza sauti ya Roho katika maamuzi ya leo.',
    checkpoints: ['Soma Matendo 1-2', 'Tafakari matunda ya Roho', 'Omba kujazwa upya'],
    icon: <Flame size={18} />
  },
  {
    id: 'f-11',
    title: 'Ubatizo',
    focus: 'Agano jipya',
    summary: 'Ubatizo ni ishara ya kuzaliwa upya na kuanza maisha mapya ndani ya Kristo.',
    verse: 'Warumi 6:4',
    takeaway: 'Jipange kwa utii na upya wa maisha.',
    checkpoints: ['Soma Matendo 8', 'Andika maana ya ubatizo', 'Omba uongozi wa hatua yako'],
    icon: <Droplets size={18} />
  },
  {
    id: 'f-12',
    title: 'Kanisa',
    focus: 'Mwili wa Kristo',
    summary: 'Kanisa ni familia ya waamini inayoabudu, kujifunza, na kutumikia pamoja.',
    verse: 'Waebrania 10:25',
    takeaway: 'Ungana na jumuiya ya imani kwa uwazi.',
    checkpoints: ['Hudhuria ibada', 'Jitolee kusaidia', 'Ombea kanisa lako'],
    icon: <Church size={18} />
  },
  {
    id: 'f-13',
    title: 'Huduma na karama',
    focus: 'Kuitwa kutumikia',
    summary: 'Kila muamini ana karama; karama hizo ni kwa ajili ya kujenga na kuponya jamii.',
    verse: '1 Petro 4:10',
    takeaway: 'Tumia karama zako kwa upendo na unyenyekevu.',
    checkpoints: ['Taja karama zako', 'Tafuta sehemu ya huduma', 'Ombea uongozi wa Mungu'],
    icon: <Users size={18} />
  },
  {
    id: 'f-14',
    title: 'Ujio wa pili',
    focus: 'Tumaini la mwisho',
    summary: 'Yesu atarudi; tumaini hili hutupa nguvu, uaminifu, na moyo wa utayari.',
    verse: 'Yohana 14:1-3',
    takeaway: 'Ishi kwa uaminifu na matumaini kila siku.',
    checkpoints: ['Soma Mathayo 24', 'Andika ahadi ya ujio', 'Tafakari uaminifu wako'],
    icon: <Star size={18} />
  }
];

export const StageFoundations: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [showFinish, setShowFinish] = useState(false);

  const totalLessons = FOUNDATION_LESSONS.length;
  const progress = Math.round((completed.length / totalLessons) * 100);
  const activeIndex = activeId ? FOUNDATION_LESSONS.findIndex((l) => l.id === activeId) : -1;
  const activeLesson = activeIndex >= 0 ? FOUNDATION_LESSONS[activeIndex] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < totalLessons - 1 ? FOUNDATION_LESSONS[activeIndex + 1] : null;

  const handleCompleteLesson = (lessonId: string) => {
    if (completed.includes(lessonId)) return;
    const nextCompleted = [...completed, lessonId];
    setCompleted(nextCompleted);
    if (nextCompleted.length === totalLessons) {
      setShowFinish(true);
    }
  };

  if (showFinish) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-6 animate-fade-in">
        <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[2.5rem] p-10 text-center space-y-8 border border-white/10 shadow-2xl">
          <div className="w-24 h-24 bg-gold-500/10 text-gold-500 rounded-full flex items-center justify-center mx-auto border border-gold-500/20">
            <Trophy size={48} />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Hongera!</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Umehitimisha Academic Level I: Foundations. Sasa umejenga msingi imara wa imani.
            </p>
          </div>
          <div className="p-8 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10">
            <GraduationCap size={40} className="mx-auto text-gold-500 mb-3" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">GC365 ACADEMY CERTIFICATE</p>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mt-2">Foundation Scholar</h3>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">Imani, uaminifu, na utayari</p>
          </div>
          <button
            onClick={() => {
              setShowFinish(false);
              onComplete();
            }}
            className="w-full py-5 bg-gold-500 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl"
          >
            ENDELEA LEVEL II (UNABII)
          </button>
        </div>
      </div>
    );
  }

  if (activeLesson) {
    const isCompleted = completed.includes(activeLesson.id);

    return (
      <div className="fixed inset-0 z-[120] bg-slate-950 text-white flex flex-col animate-fade-in">
        <header className="h-16 md:h-20 border-b border-white/10 bg-black/60 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-between shrink-0">
          <button
            onClick={() => setActiveId(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Rudi</span>
          </button>
          <span className="text-[10px] md:text-[11px] font-black text-gold-400 uppercase tracking-widest">
            Foundations {activeIndex + 1}/{totalLessons}
          </span>
          <div className="hidden md:flex text-[10px] font-bold uppercase text-slate-500">Lesson Focus</div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
            <div className="rounded-3xl p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-black border border-white/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300">
                Academic Level I
              </div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-4">{activeLesson.title}</h1>
              <p className="text-slate-300 mt-3 text-lg">{activeLesson.focus}</p>
            </div>

            <section className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Muhtasari</h4>
              <p className="text-lg text-slate-200 leading-relaxed">{activeLesson.summary}</p>
            </section>

            <section className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kipimo cha somo</h4>
              <div className="grid gap-3">
                {activeLesson.checkpoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                    <CheckCircle2 size={16} className="text-gold-400 mt-1" />
                    <p className="text-sm text-slate-200">{point}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kifungu cha msingi</h4>
              <p className="text-xl text-gold-300 italic">{activeLesson.verse}</p>
            </section>

            <section className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hatua ya leo</h4>
              <p className="text-base text-slate-300">{activeLesson.takeaway}</p>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => handleCompleteLesson(activeLesson.id)}
                disabled={isCompleted}
                className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-gold-500 text-slate-900 hover:bg-white shadow-xl'
                }`}
              >
                {isCompleted ? 'SOMO LIMETHIBITISHWA' : 'THIBITISHA SOMO'}
              </button>
              {nextLesson && (
                <button
                  onClick={() => setActiveId(nextLesson.id)}
                  className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 text-white border border-white/10 hover:border-gold-400/40 transition-all"
                >
                  SOMO LINALOFUATA
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 md:p-10 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-10 shadow-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 text-gold-500 border border-gold-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
              Academic Level I
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Misingi ya Imani</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Safarisha imani yako kwa masomo ya msingi yanayoelekeza katika neno, maombi, na uhusiano wa kina na Kristo.
            </p>
          </div>
          <div className="w-full lg:w-72 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <span>Progress</span>
              <span>{completed.length}/{totalLessons}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold-500 to-gold-300" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Maliza masomo yote ili kufungua Level II.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {FOUNDATION_LESSONS.map((lesson, idx) => {
            const isCompleted = completed.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveId(lesson.id)}
                className={`group text-left rounded-2xl border p-6 transition-all shadow-lg ${
                  isCompleted
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-white/5 hover:border-gold-400/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gold-500/10 text-gold-500'}`}>
                    {lesson.icon}
                  </div>
                  {isCompleted && <CheckCircle2 size={18} className="text-emerald-500" />}
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{lesson.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{lesson.focus}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed line-clamp-2">{lesson.summary}</p>
                <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Somo {idx + 1}</span>
                  <span>{isCompleted ? 'Completed' : 'Start'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
