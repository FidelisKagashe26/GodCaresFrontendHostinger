
import React, { useEffect, useState } from 'react';
import { Globe, Check, X, Sparkles, RefreshCw, Search } from 'lucide-react';
import { Language, LanguageCode } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', greeting: 'Hello' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿', greeting: 'Hujambo' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', greeting: 'Bonjour' },
  { code: 'es', name: 'Español', flag: '🇪🇸', greeting: 'Hola' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', greeting: 'Olá' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', greeting: 'Ahlan' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', greeting: 'Hallo' },
  { code: 'ru', name: 'Pусский', flag: '🇷🇺', greeting: 'Privet' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', greeting: 'Ni Hao' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', greeting: 'Namaste' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', greeting: 'Annyeong' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', greeting: 'Konnichiwa' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦', greeting: 'Hallo' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱', greeting: 'Përshëndetje' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹', greeting: 'ሰላም' },
  { code: 'hy', name: 'Armenian', flag: '🇦🇲', greeting: 'Barev' },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿', greeting: 'Salam' },
  { code: 'eu', name: 'Basque', flag: '🇪🇸', greeting: 'Kaixo' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', greeting: 'Namaskar' },
  { code: 'bs', name: 'Bosnian', flag: '🇧🇦', greeting: 'Zdravo' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', greeting: 'Zdrasti' },
  { code: 'ca', name: 'Catalan', flag: '🇪🇸', greeting: 'Hola' },
  { code: 'ceb', name: 'Cebuano', flag: '🇵🇭', greeting: 'Kumusta' },
  { code: 'ny', name: 'Chichewa', flag: '🇲🇼', greeting: 'Moni' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼', greeting: 'Ni Hao' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', greeting: 'Zdravo' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', greeting: 'Ahoj' },
  { code: 'da', name: 'Danish', flag: '🇩🇰', greeting: 'Hej' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', greeting: 'Hallo' },
  { code: 'eo', name: 'Esperanto', flag: '🌍', greeting: 'Saluton' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪', greeting: 'Tere' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭', greeting: 'Kumusta' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', greeting: 'Hei' },
  { code: 'gl', name: 'Galician', flag: '🇪🇸', greeting: 'Ola' },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪', greeting: 'Gamarjoba' },
  { code: 'el', name: 'Greek', flag: '🇬🇷', greeting: 'Yiasou' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', greeting: 'Namaste' },
  { code: 'ht', name: 'Haitian Creole', flag: '🇭🇹', greeting: 'Bonjou' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', greeting: 'Sannu' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱', greeting: 'Shalom' },
  { code: 'hmn', name: 'Hmong', flag: '🇨🇳', greeting: 'Nyob zoo' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺', greeting: 'Szia' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸', greeting: 'Halló' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬', greeting: 'Nnọọ' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', greeting: 'Halo' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪', greeting: 'Dia dhuit' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', greeting: 'Ciao' },
  { code: 'jw', name: 'Javanese', flag: '🇮🇩', greeting: 'Halo' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳', greeting: 'Namaskara' },
  { code: 'kk', name: 'Kazakh', flag: '🇰🇿', greeting: 'Salem' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭', greeting: 'Suostei' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦', greeting: 'Sabaidee' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻', greeting: 'Sveiki' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', greeting: 'Sveiki' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰', greeting: 'Zdravo' },
  { code: 'mg', name: 'Malagasy', flag: '🇲🇬', greeting: 'Manao ahoana' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', greeting: 'Halo' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳', greeting: 'Namaskaram' },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹', greeting: 'Merħba' },
  { code: 'mi', name: 'Maori', flag: '🇳🇿', greeting: 'Kia ora' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳', greeting: 'Namaskar' },
  { code: 'mn', name: 'Mongolian', flag: '🇲🇳', greeting: 'Sain baina uu' },
  { code: 'my', name: 'Myanmar', flag: '🇲🇲', greeting: 'Mingalaba' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵', greeting: 'Namaste' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴', greeting: 'Hei' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷', greeting: 'Salaam' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', greeting: 'Cześć' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳', greeting: 'Sat Sri Akal' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', greeting: 'Salut' },
  { code: 'so', name: 'Somali', flag: '🇸🇴', greeting: 'Salam' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', greeting: 'Hej' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', greeting: 'Vanakkam' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', greeting: 'Namaskaram' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', greeting: 'Sawasdee' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', greeting: 'Merhaba' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', greeting: 'Pryvit' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', greeting: 'Adaab' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', greeting: 'Xin chào' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', greeting: 'Helo' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦', greeting: 'Sawubona' }
].sort((a, b) => a.name.localeCompare(b.name));

export const LanguageCenter: React.FC<Props> = ({ isOpen, onClose, currentLanguage, onLanguageChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sync internal state with Google Translate Cookie on mount
  useEffect(() => {
    const getCookie = (name: string) => {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
    };
    
    const googleCookie = getCookie('googtrans');
    if (googleCookie) {
      // format is usually /auto/en or /en/sw
      const parts = googleCookie.split('/');
      const langCode = parts[parts.length - 1] as LanguageCode;
      
      if (langCode && LANGUAGES.some(l => l.code === langCode) && langCode !== currentLanguage) {
        onLanguageChange(langCode);
      }
    }
  }, []);

  if (!isOpen) return null;

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const changeGoogleTranslateLanguage = (langCode: string) => {
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.warn('Google Translate combo not found. It might be hidden or not loaded yet.');
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    // 1. Set AI Language for Gemini (App State)
    onLanguageChange(lang.code);
    
    // 2. Set Google Translate Cookie manually to ensure persistence
    // Standard format /auto/targetLang or /source/targetLang. We use /auto/
    const cookieValue = `/auto/${lang.code}`;
    const domain = window.location.hostname;
    
    // Clear existing cookies
    document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    
    // Set new cookie with broad domain coverage if possible, or just root
    document.cookie = `googtrans=${cookieValue}; path=/`;
    
    // Also set simply for root just in case
    if (domain !== 'localhost') {
        document.cookie = `googtrans=${cookieValue}; path=/; domain=.${domain}`;
    }

    // 3. Trigger Google Translate Widget Instantly
    changeGoogleTranslateLanguage(lang.code);
  };

  const handleReset = () => {
    // 1. Reset AI Language
    onLanguageChange('en');

    // 2. Clear Google Translate Cookies
    const domain = window.location.hostname;
    document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    
    if (domain !== 'localhost') {
        document.cookie = `googtrans=; path=/; domain=.${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    }

    // 3. Trigger Widget to 'en'
    changeGoogleTranslateLanguage('en');
    
    // Force reload if needed to clear iframe residue
    setTimeout(() => {
        window.location.reload(); 
    }, 500);
  };

  return (
    <>
      <div className="fixed inset-0 z-[80]" onClick={onClose}></div>
      <div className="fixed top-24 right-4 md:right-24 w-80 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[90] overflow-hidden flex flex-col animate-scale-in origin-top-right">
         {/* Header */}
         <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
           <div className="flex items-center gap-2">
             <Globe size={16} className="text-gold-400" />
             <h3 className="font-bold text-white text-sm uppercase tracking-wider">Language Center</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><X size={14}/></button>
         </div>
  
         {/* AI Integration Info */}
         <div className="p-3 bg-gold-500/10 border-b border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-1">
                <Sparkles size={10} /> Global Translation Active
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
                Selected language will translate the entire interface and AI responses.
            </p>
         </div>

         {/* Search */}
         <div className="p-3 border-b border-white/5 bg-white/5">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
               <input 
                 type="text" 
                 placeholder="Tafuta lugha..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-gold-400 outline-none transition-colors"
               />
            </div>
         </div>

         {/* List */}
         <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
             <div className="divide-y divide-white/5">
               {filteredLanguages.map(lang => (
                 <button 
                    key={lang.code} 
                    onClick={() => handleLanguageSelect(lang)}
                    className={`w-full p-4 hover:bg-white/5 transition-colors flex items-center justify-between group ${currentLanguage === lang.code ? 'bg-white/10' : ''}`}
                 >
                    <div className="flex items-center gap-3">
                       <span className="text-xl">{lang.flag}</span>
                       <div className="text-left">
                          <p className={`text-sm font-bold ${currentLanguage === lang.code ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{lang.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{lang.greeting}</p>
                       </div>
                    </div>
                    {currentLanguage === lang.code && <Check size={16} className="text-gold-400" />}
                 </button>
               ))}
               {filteredLanguages.length === 0 && (
                 <div className="p-8 text-center text-slate-500 text-xs">
                    Hakuna lugha iliyopatikana.
                 </div>
               )}
             </div>
         </div>

         {/* Footer Actions */}
         <div className="p-3 bg-black/40 border-t border-white/10">
            <button 
              onClick={handleReset}
              className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              <RefreshCw size={12} /> Rudisha Lugha ya Mwanzo (Kiingereza)
            </button>
         </div>
      </div>
    </>
  )
}
