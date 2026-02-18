
import React from 'react';
import { Facebook, Instagram, Youtube, Phone, Mail, Gift } from 'lucide-react';
import { StageId } from '../types';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../services/siteSettingsService';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const XIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
     <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

interface FooterProps {
  onNavigate?: (id: StageId) => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, siteSettings }) => {
  const settings = siteSettings || DEFAULT_SITE_SETTINGS;
  const siteName = settings.site_name || DEFAULT_SITE_SETTINGS.site_name;
  const contactPhone = settings.contact_phone || DEFAULT_SITE_SETTINGS.contact_phone;
  const contactEmail = settings.contact_email || DEFAULT_SITE_SETTINGS.contact_email;
  const logoSrc = settings.logo_url?.trim() ? settings.logo_url : `${import.meta.env.BASE_URL}Logo.png`;

  const socialItems = [
    { icon: Facebook, link: settings.facebook_url },
    { icon: XIcon, link: settings.x_url },
    { icon: Instagram, link: settings.instagram_url },
    { icon: TikTokIcon, link: settings.tiktok_url },
    { icon: Youtube, link: settings.youtube_url },
    { icon: WhatsAppIcon, link: settings.whatsapp_url },
  ].filter((item) => Boolean(item.link && item.link.trim()));

  return (
    <footer className="bg-slate-950 border-t border-white/5 py-16 w-full">
      <div className="container mx-auto px-6 flex flex-col items-center justify-center space-y-12">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => onNavigate?.(StageId.HOME)}
          className="flex flex-col items-center gap-4 cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform overflow-hidden">
             <img src={logoSrc} alt={siteName} className="h-12 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase">
            {siteName}
          </h2>
        </div>

        {/* Navigation Grid in Swahili */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center">
           <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Misingi</h4>
              <ul className="space-y-2">
                 <li onClick={() => onNavigate?.(StageId.ABOUT)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Maono Yetu</li>
                 <li onClick={() => onNavigate?.(StageId.BIBLE_STUDY)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Mtaala wa Biblia</li>
                 <li onClick={() => onNavigate?.(StageId.TESTIMONIES)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Shuhuda</li>
              </ul>
           </div>
           <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Ujasusi</h4>
              <ul className="space-y-2">
                 <li onClick={() => onNavigate?.(StageId.TIMELINE)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Ramani ya Unabii</li>
                 <li onClick={() => onNavigate?.(StageId.EVIDENCE)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Hifadhi ya Ushahidi</li>
                 <li onClick={() => onNavigate?.(StageId.DECEPTION_VAULT)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Fichua Uongo</li>
              </ul>
           </div>
           <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Ungana</h4>
              <ul className="space-y-2">
                 <li onClick={() => onNavigate?.(StageId.NEWS)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Portal ya Habari</li>
                 <li onClick={() => onNavigate?.(StageId.MEDIA)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Video Hub</li>
                 <li onClick={() => onNavigate?.(StageId.SHOP)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Duka la Kiroho</li>
              </ul>
           </div>
           <div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Misheni</h4>
              <ul className="space-y-2">
                 <li onClick={() => onNavigate?.(StageId.DONATE)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Changia Injili</li>
                 <li onClick={() => onNavigate?.(StageId.PRAYERS)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Ukuta wa Maombi</li>
                 <li onClick={() => onNavigate?.(StageId.LIBRARY)} className="text-xs font-bold text-slate-400 hover:text-gold-400 cursor-pointer transition-colors">Maktaba ya Bure</li>
              </ul>
           </div>
        </div>

        {/* Contact & Support Section */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 border-y border-white/5 py-10 w-full max-w-4xl">
           <a href={`tel:${contactPhone}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer group">
              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-primary-900 group-hover:text-gold-400 transition-all"><Phone size={18} /></div>
              <span className="text-sm font-bold tracking-tight">{contactPhone}</span>
           </a>
           <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer group">
              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-primary-900 group-hover:text-gold-400 transition-all"><Mail size={18} /></div>
              <span className="text-sm font-bold tracking-tight">{contactEmail}</span>
           </a>
           <button 
             onClick={() => onNavigate?.(StageId.DONATE)}
             className="flex items-center gap-3 text-gold-500 hover:text-gold-400 transition-colors cursor-pointer group border border-gold-500/20 px-8 py-3 rounded-lg hover:bg-gold-500/10"
           >
              <Gift size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Changia Injili</span>
           </button>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          {socialItems.map((Item, i) => (
            <a 
              key={i} 
              href={Item.link}
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-gold-400 hover:bg-gold-400/10 hover:scale-110 transition-all"
            >
              <Item.icon size={20} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] text-center">
            © 2026 Mradi wa Wamishenari wa Kidijitali wa God Cares 365.
          </p>
          <p className="text-slate-700 text-[8px] font-bold uppercase tracking-widest">
            Sola Scriptura • Sola Gratia • Sola Fide
          </p>
        </div>

      </div>
    </footer>
  );
};
