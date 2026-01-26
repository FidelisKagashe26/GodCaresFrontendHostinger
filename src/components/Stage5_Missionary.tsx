
import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, BookOpen, CheckCircle, Navigation, 
  Plus, Clock, BarChart3, Droplets, BookMarked, 
  Search, Save, Info, ChevronRight, LayoutGrid,
  ShieldCheck, Map as MapIcon, Layers, Trash2, Edit3
} from 'lucide-react';

interface Resident {
  name: string;
  role: string;
}

interface HouseVisit {
  id: string;
  familyHead: string;
  residents: Resident[];
  address: string;
  lastTopic: string;
  progress: number;
  booksDistributed: number;
  interestedInBaptism: boolean;
  studyClassOpened: boolean;
  notes: string;
  lastVisited: string;
  coordinates: { lat: number; lng: number };
}

const PROFESSIONAL_STRATEGIES = [
  { title: "Mbinu ya 'Rafiki Kwanza'", desc: "Usihubiri mlangoni. Uliza hitaji la familia kwanza na utoe msaada au maombi.", icon: <ShieldCheck size={18} /> },
  { title: "Mbinu ya 'Ushuhuda'", desc: "Tumia dakika 2 kuelezea jinsi Yesu alivyobadilisha maisha yako badala ya kubishana dini.", icon: <BookOpen size={18} /> },
  { title: "Mbinu ya 'Swali la Kichokozi'", desc: "Anza na: 'Je, umewahi kujiuliza kwa nini dunia ina mambo mengi hivi sasa?'", icon: <Info size={18} /> }
];

export const StageFiveMissionary: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [visits, setVisits] = useState<HouseVisit[]>([
    {
      id: '1',
      familyHead: 'Familia ya John M.',
      residents: [{ name: 'John', role: 'Baba' }, { name: 'Sarah', role: 'Mama' }],
      address: 'Mbezi Beach, House 44',
      lastTopic: 'Hali ya Wafu',
      progress: 65,
      booksDistributed: 3,
      interestedInBaptism: true,
      studyClassOpened: true,
      notes: 'Wana kiu ya kujifunza kuhusu Unabii.',
      lastVisited: '2024-10-20',
      coordinates: { lat: -6.712, lng: 39.234 }
    }
  ]);

  const [selectedHouse, setSelectedHouse] = useState<HouseVisit | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);

  const totalBooks = visits.reduce((acc, curr) => acc + curr.booksDistributed, 0);
  const totalBaptisms = visits.filter(v => v.interestedInBaptism).length;
  const totalClasses = visits.filter(v => v.studyClassOpened).length;

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-slate-800">
          <div className="p-3 bg-primary-500/20 rounded-2xl text-primary-400"><MapPin size={24} /></div>
          <div><p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Nyumba</p><p className="text-2xl font-bold">{visits.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-gold-100 rounded-2xl text-gold-600"><BookMarked size={24} /></div>
          <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Vitabu</p><p className="text-2xl font-bold text-slate-800">{totalBooks}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><Droplets size={24} /></div>
          <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Ubatizo</p><p className="text-2xl font-bold text-slate-800">{totalBaptisms}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-2xl text-green-600"><LayoutGrid size={24} /></div>
          <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Madarasa</p><p className="text-2xl font-bold text-slate-800">{totalClasses}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-200 h-[400px] rounded-3xl relative overflow-hidden border border-slate-300 shadow-inner group">
             <div className={`absolute inset-0 bg-cover transition-opacity duration-500 ${isSatellite ? 'bg-[url("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/static/39.234,-6.712,14/1200x600?access_token=none")]' : 'bg-[url("https://api.mapbox.com/styles/v1/mapbox/light-v10/static/39.234,-6.712,14/1200x600?access_token=none")]'}`}></div>
             
             <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={() => setIsSatellite(!isSatellite)} className="bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg hover:bg-white text-slate-700">
                   <Layers size={20} />
                </button>
             </div>

             {visits.map((v, i) => (
                <button 
                  key={v.id}
                  onClick={() => setSelectedHouse(v)}
                  className="absolute p-1 bg-white rounded-full shadow-lg border-2 border-primary-500 hover:scale-125 transition-transform z-20"
                  style={{ left: '45%', top: '40%' }}
                >
                  <MapPin size={20} className="text-primary-600" fill="currentColor" />
                </button>
             ))}

             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-lg">
                <div className="flex items-center gap-2">
                  <Navigation size={18} className="text-primary-600 animate-bounce" />
                  <span className="text-xs font-bold text-slate-700">Inafuatilia Njia (Route Active)</span>
                </div>
                <button className="bg-primary-600 text-white p-2 rounded-xl hover:bg-primary-700 shadow-lg">
                  <Plus size={20} />
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROFESSIONAL_STRATEGIES.map((s, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg w-fit mb-3">{s.icon}</div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">{s.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {selectedHouse ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-slide-in">
              <div className="bg-primary-600 p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-white/20 rounded-2xl"><Users size={24} /></div>
                   <button onClick={() => setSelectedHouse(null)} className="text-white/60 hover:text-white"><Plus className="rotate-45" /></button>
                </div>
                <h3 className="text-2xl font-bold">{selectedHouse.familyHead}</h3>
                <p className="text-primary-100 text-xs mt-1">{selectedHouse.address}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Last Memory</p>
                   <p className="font-bold text-slate-800 italic">"Aliishia: {selectedHouse.lastTopic}"</p>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-end">
                      <h4 className="text-xs font-bold text-slate-400 uppercase">Imani Progress</h4>
                      <span className="text-primary-600 font-bold">{selectedHouse.progress}%</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${selectedHouse.progress}%` }}></div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <button className={`p-4 rounded-2xl border text-center transition-all ${selectedHouse.interestedInBaptism ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-400'}`}>
                      <Droplets className="mx-auto mb-2" size={24} />
                      <p className="text-[10px] font-bold uppercase">Ubatizo</p>
                   </button>
                   <button className={`p-4 rounded-2xl border text-center transition-all ${selectedHouse.studyClassOpened ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-100 text-slate-400'}`}>
                      <BookOpen className="mx-auto mb-2" size={24} />
                      <p className="text-[10px] font-bold uppercase">Darasa</p>
                   </button>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-900/10">
                   <Save size={18} /> Update Records
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 border-dashed text-center flex flex-col items-center justify-center h-full min-h-[400px]">
               <MapPin size={32} className="text-slate-200 mb-4" />
               <p className="text-slate-400 text-sm font-medium">Bonyeza nyumba ili uone rekodi.</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
         <button 
           onClick={onComplete}
           className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
         >
            Finalize Report & Graduate <ChevronRight size={20} className="text-primary-600" />
         </button>
      </div>
    </div>
  );
};
