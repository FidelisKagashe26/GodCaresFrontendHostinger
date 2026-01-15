
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, ScrollText, Sunrise, Cross, Calculator, Navigation,
  Anchor, Crown, Maximize2, Minimize2, 
  ChevronRight, Info, Shield, BookOpen, ExternalLink,
  Clock, Search, Eye, Database, Hexagon, Globe, 
  MapPin, MessageCircle, BarChart3, Binary, Brackets,
  Cpu, Fingerprint, Layers, Link2, Microscope, 
  Network, Ruler, Scale, Settings, Share2, 
  Terminal, Waves, Workflow, Activity, Archive,
  ShieldCheck, HelpCircle, AlertTriangle, Lightbulb,
  ArrowRight, Box, Compass, Database as DbIcon,
  Search as SearchIcon, Church, Hourglass, Lock,
  CloudSun, Star, Download, FileText, ArrowLeft,
  ChevronUp, ChevronDown, List, Grid, MoreHorizontal,
  PlayCircle, Video, ChevronLeft
} from 'lucide-react';
import { StageId } from '../types';

interface Milestone {
  id: string;
  year: string;
  title: string;
  swahiliTitle: string;
  description: string;
  category: 'Past' | 'Present' | 'Future';
  image: string;
  verse: string;
  fullStory: string;
  swahiliDeep: string;
  didYouKnow: string;
  evidenceId?: string;
  videoUrl?: string; // Added video URL support
}

interface TimelineSection {
  id: string;
  name: string;
  swahiliName: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  milestones: Milestone[];
}

const TypewriterText = ({ text, delay = 15, className = "" }: { text: string, delay?: number, className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <p className={className}>{displayedText}</p>;
};

const TIMELINES: TimelineSection[] = [
  {
    id: 'creation',
    name: 'Creation',
    swahiliName: '1. Uumbaji',
    icon: <Sunrise size={20} />,
    color: '#10b981',
    description: 'Mwanzo wa ulimwengu na wanadamu.',
    milestones: [
      { id: 'c1', year: 'Siku 1', title: 'Nuru', swahiliTitle: 'Nuru ya Kwanza', description: 'Mungu alitenga nuru na giza.', category: 'Past', image: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000', verse: 'Mwanzo 1:3', fullStory: 'Hapo mwanzo, dunia ilikuwa ukiwa na utupu, na giza lilikuwa juu ya uso wa vilindi. Nuru ndiyo ilikuwa hatua ya kwanza ya kuondoa machafuko hayo. Mungu alisema, "Iwe Nuru," na nuru ikawako, ikitenganisha siku na usiku.', swahiliDeep: 'Nuru hii inawakilisha Kristo, "Nuru ya Ulimwengu." Kabla ya jua kuumbwa siku ya nne, nuru ya utukufu wa Mungu iliangaza dunia. Hii inatufundisha kuwa nuru ya kiroho hutangulia nuru ya kimwili; lazima kwanza tuangaziwe na Kristo kabla hatujazaa matunda.', didYouKnow: 'Nuru ilikuwepo kabla ya jua kuumbwa siku ya 4, ikithibitisha kuwa Mungu ndiye chanzo cha nuru, si jua.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'c4', year: 'Siku 4', title: 'Lights', swahiliTitle: 'Jua, Mwezi na Nyota', description: 'Taa angani kwa ajili ya majira.', category: 'Past', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000', verse: 'Mwanzo 1:14', fullStory: 'Siku ya nne, Mungu aliumba mianga mikuu miwili: jua ili litawale mchana na mwezi utawale usiku. Pia alizifanya nyota. Hizi ziliwekwa ili kuwa ishara, majira, siku na miaka.', swahiliDeep: 'Jua linawakilisha Kristo ("Jua la Haki"), na mwezi unawakilisha Kanisa (au Biblia), ambalo halina nuru yake lenyewe bali huakisi nuru ya Jua. Nyota ni watumishi wa Mungu (Danieli 12:3) wanaong\'aa gizani.', didYouKnow: 'Nyota zinatumika pia kama ishara za nyakati za mwisho (Mathayo 24:29).' },
      { id: 'c6', year: 'Siku 6', title: 'Adamu & Hawa', swahiliTitle: 'Uumbaji wa Mtu', description: 'Mwanadamu kwa mfano wa Mungu.', category: 'Past', image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1000', verse: 'Mwanzo 1:26', fullStory: 'Baada ya kuandaa makao, Mungu alimuumba mwanadamu kwa mfano wake. Alimfanyia Adamu msaidizi, Hawa, na kuwapa mamlaka juu ya viumbe vyote.', swahiliDeep: 'Thamani yetu haitokani na mageuzi, bali kwa kuwa tumeumbwa kwa mfano wa Mungu. Ndoa ya kwanza ilifungwa Edeni, ikionyesha utakatifu wa taasisi hiyo.', didYouKnow: 'Adamu alipewa jukumu la kisayansi la kuwapa majina wanyama wote kabla ya kupewa mke.' },
      { id: 'c7', year: 'Siku 7', title: 'Sabbath', swahiliTitle: 'Sabato Takatifu', description: 'Mungu alistarehe and kubariki siku ya saba.', category: 'Past', image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1000', verse: 'Mwanzo 2:1-3', fullStory: 'Mungu alipomaliza kazi zake zote, alistarehe siku ya saba. Akaibariki na kuitakasa kama ukumbusho wa uumbaji wake kwa wanadamu wote, hata kabla ya dhambi kuingia.', swahiliDeep: 'Sabato ni "Hekalu la Muda." Tofauti na maeneo matakatifu, Sabato inatufuata popote tulipo kila wiki. Ni ishara ya mamlaka ya Mungu muumbaji na kupumzika kwetu ndani ya kazi yake kamilifu.', didYouKnow: 'Hii ndiyo sikukuu ya kwanza kabisa katika historia ya mwanadamu, na ilitolewa kwa wanadamu wote, si Wayahudi pekee.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
    ]
  },
  {
    id: 'flood_babel',
    name: 'Flood to Babel',
    swahiliName: '2. Gharika & Babeli',
    icon: <Waves size={20} />,
    color: '#3b82f6',
    description: 'Hukumu ya maji and mtawanyiko wa lugha.',
    milestones: [
      { id: 'fb1', year: '2348 BC', title: 'The Great Flood', swahiliTitle: 'Gharika Kuu', description: 'Dunia yasafishwa kwa maji.', category: 'Past', image: 'https://images.unsplash.com/photo-1518107612744-298f21427d35?auto=format&fit=crop&q=80&w=1000', verse: 'Mwanzo 7', fullStory: 'Maovu yalipozidi, Mungu alighairi kumuumba mwanadamu. Hata hivyo, Nuhu alipata neema. Mungu alileta gharika ya maji kusafisha dunia, lakini akahifadhi uzao kupitia Safina.', swahiliDeep: 'Safina inawakilisha wokovu ndani ya Yesu Kristo. Wale walioingia safinani walisalimika kwa neema, si kwa uwezo wao wa kuogelea. Mlango wa safina ulifungwa na Mungu mwenyewe.', didYouKnow: 'Mvua ilinyesha kwa siku 40 mfululizo, na maji yalifunika milima yote mirefu.' },
      { id: 'fb2', year: '2242 BC', title: 'Tower of Babel', swahiliTitle: 'Mnara wa Babeli', description: 'Kiburi cha mwanadamu na lugha.', category: 'Past', image: 'https://images.unsplash.com/photo-1599596378252-474026337f71?q=80&w=1000', verse: 'Mwanzo 11', fullStory: 'Wanadamu walijaribu kujijengea jina na mnara ufikao mbinguni ili wasitawanyike, kinyume na agizo la Mungu. Mungu alichafua lugha zao, wakatawanyika duniani kote.', swahiliDeep: 'Babeli ("Machafuko") inawakilisha juhudi za mwanadamu kujiokoa mwenyewe na kujenga umoja bila Mungu. Ni mwanzo wa dini zote za uongo zinazotegemea matendo badala ya imani.', didYouKnow: 'Babeli ndio asili ya neno "Babylon" linalomaanisha machafuko na pia "Lango la Miungu" kwa lugha yao.' }
    ]
  },
  {
    id: 'patriarchs',
    name: 'Patriarchal',
    swahiliName: '3. Mababu',
    icon: <Anchor size={20} />,
    color: '#a855f7',
    description: 'Wito wa Ibrahimu, Isaka na Yakobo.',
    milestones: [
      { id: 'p1', year: '1921 BC', title: 'Call of Abraham', swahiliTitle: 'Wito wa Ibrahimu', description: 'Kutoka Uri kwenda Kanaani.', category: 'Past', image: 'https://images.unsplash.com/photo-1510440842629-a05c440fc75b?q=80&w=1000', verse: 'Mwanzo 12', fullStory: 'Mungu alimwita Abramu atoke katika nchi ya ibada ya sanamu (Uri) aende nchi ambayo Mungu atamwonyesha. Alimtii Mungu kwa imani, asijue aendako.', swahiliDeep: 'Ibrahimu ni "Baba wa Imani." Wito wake unatuonyesha kuwa kumfuata Mungu kunagharimu kuacha vya kale (mapokeo, starehe) na kutembea kwa imani katika ahadi zake.', didYouKnow: 'Ibrahimu aliitwa "Rafiki wa Mungu" mara tatu katika Biblia.' },
      { id: 'p3', year: '1760 BC', title: 'Jacob\'s Ladder', swahiliTitle: 'Ngazi ya Yakobo', description: 'Ndoto ya ngazi inayofika mbinguni.', category: 'Past', image: 'https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?q=80&w=1000', verse: 'Mwanzo 28:12', fullStory: 'Yakobo, akimkimbia Esau, aliota ndoto ya ngazi iliyosimama duniani na ncha yake mbinguni, na malaika wakipanda na kushuka. Mungu alirudia ahadi ya Ibrahimu kwake.', swahiliDeep: 'Yesu alijitambulisha kama ile ngazi (Yohana 1:51). Yeye ndiye kiunganishi pekee kati ya mbingu na dunia iliyoanguka. Bila Yeye, hakuna mawasiliano na Mungu.', didYouKnow: 'Mahali hapo paliitwa Betheli, maana yake "Nyumba ya Mungu".' },
      { id: 'p2', year: '1728 BC', title: 'Joseph in Egypt', swahiliTitle: 'Yusufu Misri', description: 'Kutoka gerezani hadi ikulu.', category: 'Past', image: 'https://images.unsplash.com/photo-1539193143244-c83d9436d633?q=80&w=1000', verse: 'Mwanzo 41', fullStory: 'Yusufu aliuzwa na ndugu zake, akafungwa gerezani kwa uongo, lakini Mungu alikuwa naye. Hatimaye alitafsiri ndoto ya Farao na kuwa Waziri Mkuu, akiokoa familia yake na njaa.', swahiliDeep: 'Maisha ya Yusufu ni kivuli cha Yesu: Alikataliwa na ndugu zake, aliteswa, lakini akafanyika mwokozi wa ulimwengu (Misri) na hatimaye ndugu zake walimsujudia.', didYouKnow: 'Yusufu aliuzwa kwa vipande 20 vya fedha, bei ya mtumwa wakati huo.' },
      { id: 'p4', year: '1491 BC', title: 'Exodus', swahiliTitle: 'Kutoka Misri', description: 'Kuvuka Bahari ya Shamu.', category: 'Past', image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=1000', verse: 'Kutoka 14', fullStory: 'Baada ya mapigo kumi, Farao aliwaruhusu Israeli kuondoka. Mungu aliwagawanyia Bahari ya Shamu, wakapita pakavu, huku jeshi la Farao likiangamia majini.', swahiliDeep: 'Kutoka ni ukombozi kutoka utumwa wa dhambi (Misri). Bahari ya Shamu ni ubatizo (1 Wakorintho 10:2). Mungu hutupigania tunaponyamaza kimya.', didYouKnow: 'Nguzo ya moto na wingu iliwatenga Wamisri na Waisraeli usiku kucha kabla ya kuvuka.' }
    ]
  },
  {
    id: 'levitical',
    name: 'Levitical',
    swahiliName: '4. Walawi & Sheria',
    icon: <ScrollText size={20} />,
    color: '#eab308',
    description: 'Kutoka, Sinai, na Huduma ya Hema.',
    milestones: [
      { id: 'l1', year: '1445 BC', title: 'Ten Commandments', swahiliTitle: 'Amri Kumi', description: 'Sheria ya Mungu Sinai.', category: 'Past', image: 'https://images.unsplash.com/photo-1543336783-bb59efd935a6?q=80&w=1000', verse: 'Kutoka 20', fullStory: 'Katika Mlima Sinai, Mungu alizungumza na kuandika Amri Kumi kwa kidole chake mwenyewe juu ya mbao mbili za mawe. Hii ndiyo katiba ya ufalme wake.', swahiliDeep: 'Sheria si njia ya wokovu, bali ni kioo (Warumi 3:20) kinachoonyesha dhambi na hitaji letu la Mwokozi. Ni tabia ya Mungu iliyoandikwa.', didYouKnow: 'Mungu aliandika amri kumi kwa kidole chake mwenyewe, tofauti na sheria zingine zilizoandikwa na Musa.' },
      { id: 'l2', year: '1444 BC', title: 'The Sanctuary', swahiliTitle: 'Hema ya Kukutania', description: 'Mungu akaa na wanadamu.', category: 'Past', image: 'https://images.unsplash.com/photo-1543336783-bb59efd935a6?q=80&w=1000', verse: 'Kutoka 25:8', fullStory: 'Mungu aliagiza, "Nao wanifanyie patakatifu, ili nipate kukaa kati yao." Hema ilikuwa na ua, patakatifu, na patakatifu pa patakatifu, ikionyesha ramani ya wokovu.', swahiliDeep: 'Kila kifaa cha hema kilimwakilisha Yesu: Kondoo wa sadaka, Kuhani Mkuu, Mkate wa Uzima, Nuru ya Vinara, na Sanduku la Agano.', didYouKnow: 'Rangi za hema (bluu, zambarau, nyekundu) zote zilikuwa na maana maalum za kiunabii kuhusu Kristo.' }
    ]
  },
  {
    id: 'christian',
    name: 'Christian Disp.',
    swahiliName: '5. Ukristo',
    icon: <Cross size={20} />,
    color: '#ef4444',
    description: 'Maisha ya Yesu na Kanisa la Kwanza.',
    milestones: [
      { id: 'cd1', year: '4 BC', title: 'Birth of Jesus', swahiliTitle: 'Kuzaliwa kwa Yesu', description: 'Neno alifanyika mwili.', category: 'Past', image: 'https://images.unsplash.com/photo-1512117187123-f365d9c227ba?q=80&w=1000', verse: 'Luka 2', fullStory: 'Kwa utimilifu wa wakati, Mungu alimtuma Mwanawe. Yesu alizaliwa Betlehemu, akaishi maisha makamilifu yasiyo na dhambi, akitufunulia tabia ya Baba.', swahiliDeep: 'Kuzaliwa kwa Yesu ni muujiza wa "Incarnation" - Mungu kuvaa ubinadamu ili aweze kutukomboa. Alishuka chini ili atuinue juu.', didYouKnow: 'Yesu hakuzaliwa Desemba 25; wachungaji hawangekuwa na kondoo nje wakati wa baridi kali ya Israeli.' },
      { id: 'cd2', year: '31 AD', title: 'The Cross', swahiliTitle: 'Msalaba', description: 'Sadaka ya dhambi.', category: 'Past', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000', verse: 'Yohana 19', fullStory: 'Kwenye msalaba, Yesu alibeba dhambi za ulimwengu. Alikufa kifo cha pili badala yetu, akisema "Imekwisha." Pazia la hekalu likapasuka.', swahiliDeep: 'Msalaba ni mahali ambapo haki na rehema za Mungu zilibusu. Sheria ilidai kifo cha mwenye dhambi, na Upendo ulitoa uhai wa Mungu mwenyewe.', didYouKnow: 'Giza liliufunika uso wa nchi wakati wa kusulubiwa, likimficha Baba asimuone Mwana akibeba dhambi.' },
      { id: 'cd3', year: '31 AD', title: 'Pentecost', swahiliTitle: 'Pentekoste', description: 'Kushuka kwa Roho Mtakatifu.', category: 'Past', image: 'https://images.unsplash.com/photo-1472552944129-b035e9ea6fb4?q=80&w=1000', verse: 'Matendo 2', fullStory: 'Siku 50 baada ya Pasaka, wanafunzi walipokuwa wamekusanyika kwa umoja, Roho Mtakatifu alishuka kama ndimi za moto. Walipata ujasiri wa kuhubiri injili.', swahiliDeep: 'Pentekoste ni "Mvua ya Masika" iliyoandaa mavuno ya kwanza ya kanisa. Tunaishi tukiingojea "Mvua ya Vuli" kwa ajili ya mavuno ya mwisho.', didYouKnow: 'Watu 3000 walibatizwa siku hiyo moja baada ya mahubiri ya Petro.' },
      { id: 'cd4', year: '34 AD', title: 'Stoning of Stephen', swahiliTitle: 'Kupigwa kwa Stefano', description: 'Mwisho wa kipindi cha Wayahudi.', category: 'Past', image: 'https://images.unsplash.com/photo-1594904351111-a072f80b1a71?q=80&w=1000', verse: 'Matendo 7', fullStory: 'Stefano, shemasi wa kwanza, alipigwa mawe kwa kuhubiri ukweli. Kifo chake kiliashiria mwisho wa kipindi cha neema cha kipekee kwa taifa la Israeli (miaka 490).', swahiliDeep: 'Wakati Stefano alipokufa, aliona mbingu zimefunguka na Yesu akiwa amesimama (si ameketi) mkono wa kuume wa Mungu, akionyesha Yesu alisimama kumpokea shahidi wake.', didYouKnow: 'Sauli (ambaye baadaye aliitwa Paulo) alikuwa akishikilia nguo za waliompiga Stefano.' }
    ]
  },
  {
    id: 'kingdoms',
    name: 'Kingdoms',
    swahiliName: '6. Falme za Dunia',
    icon: <Crown size={20} />,
    color: '#f97316',
    description: 'Unabii wa Danieli 2 - Sanamu.',
    milestones: [
      { id: 'k1', year: '605 BC', title: 'Babylon', swahiliTitle: 'Babeli (Dhahabu)', description: 'Kichwa cha Dhahabu.', category: 'Past', image: 'https://images.unsplash.com/photo-1599596378252-474026337f71?q=80&w=1000', verse: 'Danieli 2:32', fullStory: 'Ufalme wa Nebukadreza uliwakilishwa na kichwa cha dhahabu. Babeli ilikuwa kitovu cha utajiri, elimu, na ibada ya sanamu, ikitawala dunia kwa fahari.', swahiliDeep: 'Dhahabu inawakilisha utajiri, lakini pia ibada ya uongo. Babeli ya kiroho katika Ufunuo ni mfumo wa dini uliomwacha Mungu.', didYouKnow: 'Babeli ilijulikana kwa bustani zake zinazoelea, moja ya maajabu saba ya dunia ya kale.' },
      { id: 'k2', year: '539 BC', title: 'Medo-Persia', swahiliTitle: 'Umedi na Uajemi', description: 'Kifua cha Fedha.', category: 'Past', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1000', verse: 'Danieli 2:32', fullStory: 'Kama ilivyotabiriwa, Babeli ilianguka mikononi mwa Koreshi (Uajemi) na Dario (Umedi). Ufalme huu wa fedha ulikuwa mpana zaidi lakini duni kwa fahari kuliko Babeli.', swahiliDeep: 'Fedha ni duni kuliko dhahabu lakini ngumu zaidi. Hii inaonyesha kupungua kwa utukufu wa kweli kadiri historia inavyosonga mbele.', didYouKnow: 'Koreshi alitabiriwa kwa jina na nabii Isaya miaka 150 kabla hajazaliwa (Isaya 45:1).' },
      { id: 'k3', year: '331 BC', title: 'Greece', swahiliTitle: 'Ugiriki (Shaba)', description: 'Tumbo la Shaba.', category: 'Past', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000', verse: 'Danieli 2:32', fullStory: 'Alexander Mkuu aliteka dunia kwa kasi ya ajabu, akiwakilishwa na shaba (na chui katika Danieli 7). Ugiriki ilileta falsafa na lugha iliyotumika kueneza Injili baadaye.', swahiliDeep: 'Shaba inawakilisha falsafa ya kibinadamu na akili. Ugiriki inatufundisha kuwa hekima ya dunia ni upumbavu mbele za Mungu.', didYouKnow: 'Alexander alikufa akiwa kijana sana (miaka 32) na ufalme wake ukagawanyika mara nne.' },
      { id: 'k4', year: '168 BC', title: 'Rome', swahiliTitle: 'Rumi (Chuma)', description: 'Miguu ya Chuma.', category: 'Past', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000', verse: 'Danieli 2:33', fullStory: 'Dola ya Rumi ilitawala kwa nguvu ya chuma, ikivunja na kuponda. Hii ndiyo dola iliyomsulubisha Yesu na kutesa kanisa la kwanza.', swahiliDeep: 'Chuma inawakilisha nguvu ya kisheria na kijeshi isiyo na huruma. Miguu mirefu inaashiria muda mrefu wa utawala wa Rumi (kipagani na kipadri).', didYouKnow: 'Rumi haikuangushwa na ufalme mwingine mmoja, bali iligawanyika vipande vipande (vidole vya sanamu).' }
    ]
  },
  {
    id: 'seven_churches',
    name: '7 Churches',
    swahiliName: '7. Makanisa 7',
    icon: <Church size={20} />,
    color: '#06b6d4',
    description: 'Ufunuo 2 & 3: Historia ya Kanisa.',
    milestones: [
      { id: 'sc1', year: '31-100 AD', title: 'Ephesus', swahiliTitle: 'Efeso', description: 'Kanisa la Kwanza lenye upendo.', category: 'Past', image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=1000', verse: 'Ufunuo 2:1', fullStory: 'Efeso inawakilisha kanisa la Mitume. Walikuwa na juhudi, walichukia uovu, lakini walionywa kuwa wameacha upendo wao wa kwanza.', swahiliDeep: 'Hali ya Efeso ni onyo kwa kila mwamini: Unaweza kuwa na mafundisho sahihi na bidii ya kazi, lakini ukakosa upendo wa dhati kwa Kristo.', didYouKnow: 'Efeso ilimaanisha "Inayotamanika".' },
      { id: 'sc7', year: '1844-Leo', title: 'Laodicea', swahiliTitle: 'Laodikia', description: 'Kanisa la Hukumu (Vuguvugu).', category: 'Present', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000', verse: 'Ufunuo 3:14', fullStory: 'Laodikia ni kanisa la mwisho. Wanajiona matajiri na hawahitaji kitu, kumbe ni wanyonge, maskini, vipofu na uchi. Mungu anawatapika kwa kuwa vuguvugu.', swahiliDeep: 'Dawa ya Laodikia ni kununua dhahabu (imani), mavazi meupe (haki ya Kristo) na dawa ya macho (Roho Mtakatifu). Yesu yuko mlangoni anabisha.', didYouKnow: 'Laodikia inamaanisha "Watu waliohukumiwa" au "Haki ya Watu" (demokrasia ya kidini).' }
    ]
  },
  {
    id: 'seven_seals',
    name: '7 Seals',
    swahiliName: '8. Mihuri 7',
    icon: <Lock size={20} />,
    color: '#8b5cf6',
    description: 'Ufunuo 6: Historia ya Ukristo.',
    milestones: [
      { id: 'ss1', year: 'Seal 1', title: 'White Horse', swahiliTitle: 'Farasi Mweupe', description: 'Ushindi wa Injili safi.', category: 'Past', image: 'https://images.unsplash.com/photo-1534234828563-02599392cc2a?q=80&w=1000', verse: 'Ufunuo 6:2', fullStory: 'Farasi mweupe anawakilisha kanisa la kwanza katika usafi wake, likiendelea kushinda na kuteka dunia kwa injili.', swahiliDeep: 'Upinde mkononi mwa mpanda farasi unaashiria Neno la Mungu linalochoma mioyo. Taji inashiria ushindi wa mwisho wa Kristo.', didYouKnow: 'Rangi nyeupe katika Biblia daima huwakilisha usafi na haki.' },
      { id: 'ss4', year: 'Seal 4', title: 'Pale Horse', swahiliTitle: 'Farasi wa Kijivujivu', description: 'Mauti na Kuzimu.', category: 'Past', image: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000', verse: 'Ufunuo 6:8', fullStory: 'Farasi wa kijivujivu (rangi ya maiti) anaashiria kipindi cha giza kuu (Dark Ages) ambapo ukweli ulizikwa na mauti ya kiroho ilitawala.', swahiliDeep: 'Matokeo ya kuacha Neno la Mungu (Farasi Mweusi) ni kifo cha kiroho. Mamlaka ilipewa kuua kwa upanga, njaa, na tauni.', didYouKnow: 'Inakadiriwa kuwa mamilioni ya Wakristo waliuawa kwa ajili ya imani yao katika kipindi hiki.' }
    ]
  },
  {
    id: 'eschatology',
    name: 'Eschatology',
    swahiliName: '9. Siku za Mwisho',
    icon: <Hourglass size={20} />,
    color: '#ec4899',
    description: 'Matukio ya mwisho wa dunia.',
    milestones: [
      { id: 'esc1', year: 'Future', title: 'Sunday Law', swahiliTitle: 'Sheria ya Jumapili', description: 'Alama ya Mnyama.', category: 'Future', image: 'https://images.unsplash.com/photo-1555462542-a72a7c47f722?q=80&w=1000', verse: 'Ufunuo 13', fullStory: 'Utabiri unaonyesha kuwa kutatungwa sheria ya kulazimisha ibada ya uongo (Jumapili) kinyume na Sabato ya Mungu. Hii itakuwa alama ya utii kwa mwanadamu dhidi ya Mungu.', swahiliDeep: 'Huu ndio mtihani mkuu wa mwisho. Je, tutamtii Mungu au wanadamu? Alama ya Mnyama si \'chip\' ya kompyuta, ni suala la utii na ibada.', didYouKnow: 'Hii itaanza Marekani (Mnyama wa pili) na kuenea duniani kote.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'esc3', year: 'Future', title: '7 Last Plagues', swahiliTitle: 'Mapigo 7 ya Mwisho', description: 'Ghadhabu ya Mungu kwa wasiotubu.', category: 'Future', image: 'https://images.unsplash.com/photo-1463130436662-3162799c0a37?q=80&w=1000', verse: 'Ufunuo 16', fullStory: 'Baada ya mlango wa rehema kufungwa, mapigo saba yatamwagwa kwa wale wenye alama ya mnyama. Hii ni hukumu ya haki ya Mungu.', swahiliDeep: 'Wakati huu, wenye haki watakuwa wamelindwa (kama Waisraeli Gosheni), ingawa watapita katika "taabu ya Yakobo".', didYouKnow: 'Hakuna neema wala toba tena wakati mapigo yanapoanza kumwagwa.' },
      { id: 'esc2', year: 'Future', title: 'Second Coming', swahiliTitle: 'Kuja kwa Yesu', description: 'Mfalme wa Wafalme.', category: 'Future', image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=1200', verse: 'Ufunuo 1:7', fullStory: 'Yesu atarejea si kama mtoto, bali kama Mfalme na Bwana. Kila jicho litamuona. Wafu katika Kristo watafufuliwa, na walio hai watabadilishwa.', swahiliDeep: 'Hili ndilo tumaini letu lenye baraka. Dunia yote itaona utukufu wake, na waovu hawataweza kustahimili mng\'ao wake.', didYouKnow: 'Kuja huko hakutakuwa kwa siri (Secret Rapture), bali kutakuwa na kelele kuu, tarumbeta, na kuonekana na wote.' }
    ]
  },
  {
    id: 'millennium',
    name: 'The Millennium',
    swahiliName: '10. Miaka 1000',
    icon: <CloudSun size={20} />,
    color: '#0ea5e9',
    description: 'Miaka elfu moja na dunia mpya.',
    milestones: [
      { id: 'mil1', year: 'Future', title: 'Satan Bound', swahiliTitle: 'Kufungwa kwa Shetani', description: 'Dunia ikiwa ukiwa.', category: 'Future', image: 'https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=1000', verse: 'Ufunuo 20:2', fullStory: 'Wenye haki wakienda mbinguni na waovu wakiwa wamekufa, dunia inabaki ukiwa. Shetani anafungwa kwa "mnyororo wa mazingira" - hana mtu wa kumdanganya kwa miaka 1000.', swahiliDeep: 'Hii ni Sabato ya dunia ya kupumzika kutokana na dhambi. Wenye haki mbinguni watashiriki katika hukumu ya waovu na malaika waasi.', didYouKnow: 'Neno "shimo la kuzimu" hapa linamaanisha dunia iliyoaribika na kuwa giza, kama ilivyokuwa mwanzo.' },
      { id: 'mil2', year: 'Future', title: 'New Jerusalem', swahiliTitle: 'Yerusalemu Mpya', description: 'Kushuka kwa Mji Mtakatifu.', category: 'Future', image: 'https://images.unsplash.com/photo-1549558549-415fe4c37b60?q=80&w=1000', verse: 'Ufunuo 21', fullStory: 'Baada ya miaka 1000, Mji Mtakatifu unashuka. Waovu wanafufuliwa, Shetani anawadanganya kuushambulia mji, na moto unashuka kuwateketeza milele. Dunia inafanywa mpya.', swahiliDeep: 'Hii ndiyo "Arusi ya Mwanakondoo". Mungu anafanya maskani yake pamoja na wanadamu milele. Hakuna kifo, maumivu wala kilio tena.', didYouKnow: 'Mji huo una misingi 12 ya vito vya thamani na malango 12 ya lulu.' }
    ]
  },
  {
    id: '2300_days',
    name: '2300 Days',
    swahiliName: '11. Siku 2300',
    icon: <Calculator size={20} />,
    color: '#6366f1',
    description: 'Unabii mrefu zaidi wa wakati.',
    milestones: [
      { id: 'dy1', year: '457 BC', title: 'Decree', swahiliTitle: 'Amri ya Kujenga', description: 'Kuanza kwa unabii.', category: 'Past', image: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?q=80&w=1000', verse: 'Danieli 8:14', fullStory: 'Mfalme Artashasta alitoa amri ya kutengeneza na kujenga upya Yerusalemu. Hii ndiyo nukta ya kuanzia ya unabii wa Siku 2300 na majuma 70.', swahiliDeep: 'Unabii huu unathibitisha kwa usahihi wa kihistoria muda wa kubatizwa na kusulubiwa kwa Masihi (Yesu).', didYouKnow: 'Hii ndiyo nanga ya unabii wa Masihi, ikitabiri mwaka haswa wa kuanza huduma yake (27 AD).' },
      { id: 'dy2', year: '1844 AD', title: 'Cleansing', swahiliTitle: 'Kutakaswa Patakatifu', description: 'Mwisho wa Siku 2300.', category: 'Past', image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=400', verse: 'Danieli 8:14', fullStory: 'Unabii uliishia 1844. Haukumaanisha mwisho wa dunia, bali kuanza kwa "Hukumu ya Upelelezi" mbinguni (Siku ya Upatanisho). Yesu aliingia Patakatifu pa Patakatifu.', swahiliDeep: 'Tunaishi katika wakati wa hukumu. Yesu anapitia vitabu vya uzima. Ni wakati wa kutubu na kuhakikisha majina yetu yamo kitabuni.', didYouKnow: 'Kukosea kuelewa tukio hili kulileta "Kukatishwa Tamaa Kuu" (Great Disappointment), lakini kulizaa vuguvugu la kujifunza Biblia kwa kina.' }
    ]
  },
  {
    id: '1260_days',
    name: '1260 Days',
    swahiliName: '12. Siku 1260',
    icon: <Clock size={20} />,
    color: '#14b8a6',
    description: 'Miaka ya Giza (538-1798 AD).',
    milestones: [
      { id: 'dk1', year: '538 AD', title: 'Papal Rise', swahiliTitle: 'Kuinuka kwa Papa', description: 'Mwanzo wa mamlaka.', category: 'Past', image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=1000', verse: 'Danieli 7:25', fullStory: 'Baada ya kung\'olewa kwa pembe tatu (falme za Arian), Askofu wa Rumi alipewa mamlaka ya kisiasa na kidini na Justinian. Hii ilianza kipindi cha mateso ya miaka 1260.', swahiliDeep: 'Muunganiko wa kanisa na serikali daima huzaa mateso kwa wale wanaosimamia uhuru wa dhamiri.', didYouKnow: 'Biblia iliita kipindi hiki "wakati, na nyakati, na nusu ya wakati".' },
      { id: 'dk2', year: '1798 AD', title: 'Deadly Wound', swahiliTitle: 'Jeraha la Mauti', description: 'Mwisho wa Siku 1260.', category: 'Past', image: 'https://images.unsplash.com/photo-1555462542-a72a7c47f722?q=80&w=1000', verse: 'Ufunuo 13:3', fullStory: 'Jeshi la Ufaransa chini ya Jenerali Berthier lilimkamata Papa Pius VI na kumpeleka uhamishoni, likivunja mamlaka ya kisiasa ya upapa kama ilivyotabiriwa.', swahiliDeep: 'Mungu huweka mipaka kwa nguvu za giza. Unabii ulitimia "siku" ileile iliyopangwa.', didYouKnow: 'Jeraha hili la mauti lilianza kupona 1929 kupitia Mkataba wa Lateran.' }
    ]
  }
];

interface PropheticTimelineProps {
  activeTimelineId: string;
  setActiveTimelineId: (id: string) => void;
  onNavigate?: (id: StageId) => void;
}

export const PropheticTimeline: React.FC<PropheticTimelineProps> = ({ activeTimelineId, setActiveTimelineId, onNavigate }) => {
  const [selected, setSelected] = useState<Milestone | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTimelineList, setShowTimelineList] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeTimelineIndex = useMemo(() => TIMELINES.findIndex(t => t.id === activeTimelineId), [activeTimelineId]);
  const activeTimeline = TIMELINES[activeTimelineIndex !== -1 ? activeTimelineIndex : 0];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setScrollProgress(scrollTop / (scrollHeight - clientHeight));
    }
  };

  const handleDownload = () => {
    alert("Study Guide Download Started...");
  };

  // Simple Navigation Logic
  const handleNextTimeline = () => {
    const nextIndex = (activeTimelineIndex + 1) % TIMELINES.length;
    setActiveTimelineId(TIMELINES[nextIndex].id);
  };

  const handlePrevTimeline = () => {
    const prevIndex = (activeTimelineIndex - 1 + TIMELINES.length) % TIMELINES.length;
    setActiveTimelineId(TIMELINES[prevIndex].id);
  };

  const handleScrollUp = () => {
    if(scrollRef.current) {
      scrollRef.current.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if(scrollRef.current) {
      scrollRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] text-slate-100 font-sans overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] ease-out pointer-events-none"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2500')`,
          transform: `scale(1.1) translateY(${-scrollProgress * 200}px)`,
          filter: `brightness(${0.2 + scrollProgress * 0.1}) blur(${selected ? '30px' : '5px'})`
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/90 via-transparent to-primary-900 pointer-events-none"></div>

      {/* Floating Back Button for Navigation */}
      <div className="fixed top-8 left-8 z-[60] pointer-events-auto">
        <button 
          onClick={() => onNavigate?.(StageId.HOME)}
          className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-all shadow-xl group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Vertical Navigation Controls */}
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col gap-2 scale-90 origin-bottom-right">
         <button onClick={handleScrollUp} className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-gold-500 hover:text-black transition-all group">
            <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform" />
         </button>
         <div className="w-1 h-16 bg-white/10 mx-auto rounded-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 bg-gold-500 rounded-full transition-all duration-300" style={{ height: `${scrollProgress * 100}%` }}></div>
         </div>
         <button onClick={handleScrollDown} className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-gold-500 hover:text-black transition-all group">
            <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
         </button>
      </div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory relative z-20 pb-32"
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-white/10 z-10 pointer-events-none">
          <div 
            className="absolute inset-x-0 h-48 bg-gradient-to-b from-transparent via-white to-transparent animate-photon shadow-[0_0_20px_white]"
            style={{ animationDuration: '4s' }}
          ></div>
        </div>

        <div className="relative pt-24 pb-48">
          {activeTimeline.milestones.map((milestone, idx) => (
            <TimelineScreen 
              key={milestone.id} 
              milestone={milestone} 
              color={activeTimeline.color} 
              onSelect={() => setSelected(milestone)}
              isLeft={idx % 2 === 0}
              onVisible={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Redesigned Bottom Navigation Bar (Dock Style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">
            <button onClick={handlePrevTimeline} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
               <ChevronLeft size={20} />
            </button>
            
            <div className="px-6 py-2 text-center min-w-[200px] border-x border-white/5">
               <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Current Timeline</p>
               <div className="flex items-center justify-center gap-2 text-gold-400">
                  {activeTimeline.icon}
                  <h3 className="text-sm font-black uppercase tracking-wider">{activeTimeline.swahiliName}</h3>
               </div>
            </div>

            <button onClick={handleNextTimeline} className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
               <ChevronRight size={20} />
            </button>

            <button onClick={() => setShowTimelineList(true)} className="p-3 bg-white/10 hover:bg-gold-500 hover:text-black text-white rounded-xl transition-all ml-2">
               <Grid size={20} />
            </button>
         </div>
      </div>

      {/* Timeline Selection Modal (Grid View) */}
      {showTimelineList && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
           <div className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 overflow-y-auto max-h-[90vh]">
              <button onClick={() => setShowTimelineList(false)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-full transition-all text-slate-400">
                 <X size={24} />
              </button>
              
              <div className="text-center mb-10">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tight">Timeline Master Index</h2>
                 <p className="text-slate-500 mt-2 font-medium">Chagua kipindi cha unabii unachotaka kuchunguza</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {TIMELINES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTimelineId(t.id); setShowTimelineList(false); }}
                      className={`p-6 rounded-2xl border text-left transition-all group flex flex-col justify-between h-40 ${
                        activeTimelineId === t.id 
                          ? 'bg-gold-500 text-black border-gold-500' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-gold-500/50'
                      }`}
                    >
                       <div className={`p-3 rounded-xl w-fit ${activeTimelineId === t.id ? 'bg-black/20 text-black' : 'bg-black/40 text-gold-500'}`}>
                          {t.icon}
                       </div>
                       <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeTimelineId === t.id ? 'text-black/60' : 'text-slate-500'}`}>
                             Timeline Sequence
                          </p>
                          <h4 className={`font-black uppercase text-sm ${activeTimelineId === t.id ? 'text-black' : 'text-white group-hover:text-gold-400'}`}>
                             {t.swahiliName}
                          </h4>
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-3xl animate-fade-in">
          {/* Minimum Bevel Modal Container - rounded-2xl */}
          <div className="bg-white dark:bg-slate-950 w-full max-w-[95vw] h-full md:h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up border border-slate-200 dark:border-white/10">
            {/* Image Side - Fixed height on mobile to ensure visibility */}
            <div className="w-full h-[45vh] md:h-auto md:w-1/2 relative bg-slate-950 overflow-hidden border-b md:border-b-0 md:border-r border-slate-900">
              <img src={selected.image} className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] contrast-[1.2] animate-ken-burns" alt={selected.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <div className="absolute top-12 left-12">
                 <div className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white text-[10px] font-black uppercase tracking-[0.4em]">
                   SECURE_ARCHIVE_{selected.id.toUpperCase()}
                 </div>
              </div>

              <div className="absolute bottom-10 left-10 right-10 md:bottom-24 md:left-16 md:right-16 space-y-4 md:space-y-8">
                <div className="inline-block px-6 py-2 md:px-10 md:py-4 bg-gold-400 text-primary-900 text-[10px] md:text-[14px] font-black uppercase rounded-lg tracking-[0.5em] shadow-lg">{selected.year}</div>
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter italic uppercase leading-[0.8]">{selected.title}</h2>
                <div className="flex items-center gap-8 text-gold-400">
                  <ScrollText size={32} className="md:w-14 md:h-14" />
                  <p className="text-xl md:text-3xl lg:text-5xl font-black italic tracking-tight">{selected.verse}</p>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative">
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-950 sticky top-0 z-10">
                <div className="flex items-center gap-6 text-primary-900 dark:text-white font-black text-xs uppercase tracking-[0.6em]">
                  <Shield size={24} /> Maabara ya Nyaraka ya Chronos
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  className="p-3 md:p-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-14 space-y-12">
                
                {/* 1. Did You Know Section - Styled Distinctly */}
                <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Lightbulb size={64} className="text-gold-500" /></div>
                   <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center gap-2 mb-3 relative z-10">
                     <Star size={12} fill="currentColor" /> Did You Know?
                   </h4>
                   {/* Typewriter Effect Applied Here */}
                   <TypewriterText 
                     text={`"${selected.didYouKnow}"`}
                     className="text-slate-700 dark:text-slate-300 italic font-medium text-sm leading-relaxed relative z-10"
                     delay={25}
                   />
                </div>

                {/* 2. Video Section (New) */}
                {selected.videoUrl && (
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Video size={14} className="text-red-500" /> Tazama Video
                     </h4>
                     <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-black">
                        <iframe 
                          src={`${selected.videoUrl}?rel=0`} 
                          className="w-full h-full border-none"
                          allow="autoplay; encrypted-media" 
                          allowFullScreen
                        ></iframe>
                     </div>
                  </div>
                )}

                {/* Narrative - Normal Text */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-4">
                    <Navigation size={20} className="text-primary-600" /> Summary
                  </h4>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selected.fullStory}
                  </p>
                </div>

                {/* Spiritual Insight - Normal Text (Removed Typewriter & Background Icon) */}
                <div className="p-10 bg-primary-900 dark:bg-white/5 rounded-2xl border border-white/5 space-y-6 relative overflow-hidden group shadow-xl">
                  {/* Removed Background Clock Icon */}
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="w-10 h-1 bg-gold-400 rounded-full"></div>
                     <h4 className="text-[11px] font-black text-gold-400 uppercase tracking-[0.5em]">Maelezo ya ziada</h4>
                  </div>
                  {/* Changed from TypewriterText to regular text */}
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium italic relative z-10 pl-4 border-l-2 border-white/20">
                    {selected.swahiliDeep}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-6 pb-20 md:pb-0">
                  <button 
                    onClick={() => { setSelected(null); onNavigate?.(StageId.BIBLE_STUDY); }}
                    className="flex-1 px-10 py-5 bg-primary-900 text-gold-400 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-800 transition-all shadow-xl flex items-center justify-center gap-4"
                  >
                    <BookOpen size={20} /> Start Deep Study
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex-1 px-10 py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-400 hover:text-white transition-all flex items-center justify-center gap-4 group"
                  >
                    <Download size={20} /> Download Guide
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes photon {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        @keyframes ken-burns {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-photon { animation: photon 5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-ken-burns { animation: ken-burns 12s ease-out forwards; }
      `}</style>
    </div>
  );
};

const TimelineScreen: React.FC<{ 
  milestone: Milestone; 
  color: string; 
  onSelect: () => void; 
  isLeft: boolean; 
  onVisible: () => void;
}> = ({ milestone, color, onSelect, isLeft, onVisible }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focalProgress, setFocalProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const rect = entry.boundingClientRect;
        const viewportCenter = window.innerHeight / 2;
        const entryCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - entryCenter);
        const progress = Math.max(0, 1 - (distance / (window.innerHeight / 1.8)));
        setFocalProgress(Math.pow(progress, 3));
        if (progress > 0.1) onVisible();
      });
    }, { threshold: Array.from({ length: 100 }, (_, i) => i / 100) });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-screen w-full flex items-center justify-center snap-center relative perspective-1000">
       <div 
         className={`w-full max-w-6xl flex items-center justify-between px-4 md:px-12 transition-all duration-700 ease-out`}
         style={{ 
           opacity: focalProgress, 
           filter: `blur(${(1 - focalProgress) * 10}px)`,
           transform: `scale(${0.8 + (focalProgress * 0.2)})`
         }}
       >
          <div className="w-1/2 flex justify-end pr-8 md:pr-16 relative">
             {isLeft ? (
                <div className="text-right space-y-2">
                   <div className="flex items-center justify-end gap-4">
                      <span className="text-4xl md:text-6xl font-black text-gold-400 tracking-tighter">{milestone.year}</span>
                      <div className="w-3 h-3 rounded-full bg-gold-400 shadow-[0_0_15px_#eab308]"></div>
                   </div>
                   <h3 className="text-2xl md:text-4xl font-black text-white uppercase italic leading-none">{milestone.title}</h3>
                   <p className="text-slate-400 text-sm font-medium max-w-md ml-auto">{milestone.description}</p>
                </div>
             ) : (
                <div 
                  onClick={onSelect}
                  className="relative group cursor-pointer"
                >
                   <div className="w-48 h-48 md:w-72 md:h-72 rounded-full border-4 border-gold-500 overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.3)] group-hover:shadow-[0_0_100px_rgba(234,179,8,0.6)] transition-all duration-500">
                      <img src={milestone.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={milestone.title} />
                      {/* Play Icon Overlay if video exists */}
                      {milestone.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <PlayCircle size={48} className="text-white drop-shadow-lg" />
                        </div>
                      )}
                   </div>
                </div>
             )}
          </div>

          <div className="w-1/2 flex justify-start pl-8 md:pl-16 relative">
             {isLeft ? (
                <div 
                  onClick={onSelect}
                  className="relative group cursor-pointer"
                >
                   <div className="w-48 h-48 md:w-72 md:h-72 rounded-full border-4 border-gold-500 overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.3)] group-hover:shadow-[0_0_100px_rgba(234,179,8,0.6)] transition-all duration-500">
                      <img src={milestone.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={milestone.title} />
                      {/* Play Icon Overlay if video exists */}
                      {milestone.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <PlayCircle size={48} className="text-white drop-shadow-lg" />
                        </div>
                      )}
                   </div>
                </div>
             ) : (
                <div className="text-left space-y-2">
                   <div className="flex items-center justify-start gap-4">
                      <div className="w-3 h-3 rounded-full bg-gold-400 shadow-[0_0_15px_#eab308]"></div>
                      <span className="text-4xl md:text-6xl font-black text-gold-400 tracking-tighter">{milestone.year}</span>
                   </div>
                   <h3 className="text-2xl md:text-4xl font-black text-white uppercase italic leading-none">{milestone.title}</h3>
                   <p className="text-slate-400 text-sm font-medium max-w-md mr-auto">{milestone.description}</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
