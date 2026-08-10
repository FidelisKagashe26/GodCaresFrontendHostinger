import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { StageId } from '../../types';

interface NavItem {
  id: StageId;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: StageId.HOME, label: 'Mwanzo' },
  { id: StageId.MEDIA, label: 'Tazama' },
  { id: StageId.BIBLE_STUDY, label: 'Jifunze' },
  { id: StageId.BLOG, label: 'Makala' },
  { id: StageId.ABOUT, label: 'Kuhusu Sisi' },
  { id: StageId.SHOP, label: 'Duka' },
];

interface Props {
  currentStage: StageId;
  isScrolled: boolean;
  onNavigate: (id: StageId) => void;
}

export const AutoOverflowNav: React.FC<Props> = ({ currentStage, isScrolled, onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const changiaBtnRef = useRef<HTMLButtonElement>(null);
  
  const [visibleCount, setVisibleCount] = useState(NAV_ITEMS.length);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (itemsRef.current.length !== NAV_ITEMS.length) {
    itemsRef.current = Array(NAV_ITEMS.length).fill(null);
  }

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculate = () => {
      const containerWidth = container.clientWidth;
      
      const gap = window.innerWidth >= 1280 ? 20 : 12; // gap-3 (12px) on md/lg, gap-5 (20px) on xl
      const changiaWidth = changiaBtnRef.current?.offsetWidth || 100;
      const moreBtnWidth = moreBtnRef.current?.offsetWidth || 80;
      
      const itemWidths = NAV_ITEMS.map((_, i) => itemsRef.current[i]?.offsetWidth || 0);
      
      let totalItemsWidth = 0;
      for (let i = 0; i < NAV_ITEMS.length; i++) {
        totalItemsWidth += itemWidths[i] + (i > 0 ? gap : 0);
      }
      
      const totalRequiredWithAll = totalItemsWidth + gap + 4 + changiaWidth; // +4 for ml-1
      
      if (totalRequiredWithAll <= containerWidth) {
         setVisibleCount(NAV_ITEMS.length);
         return;
      }

      let currentWidth = 0;
      let newVisibleCount = 0;
      
      for (let i = 0; i < NAV_ITEMS.length; i++) {
        const itemWidth = itemWidths[i];
        const nextWidth = currentWidth + itemWidth + (i > 0 ? gap : 0);
        const requiredSpace = nextWidth + gap + moreBtnWidth + gap + 4 + changiaWidth;
        
        if (requiredSpace > containerWidth) {
           break;
        }
        
        currentWidth = nextWidth;
        newVisibleCount = i + 1;
      }
      
      setVisibleCount(newVisibleCount);
    };

    // Calculate immediately on mount/layout
    calculate();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => calculate());
    });
    
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [isScrolled]);

  const visibleItems = NAV_ITEMS.slice(0, visibleCount);
  const hiddenItems = NAV_ITEMS.slice(visibleCount);

  const getBtnClass = (id: StageId, isDropdownItem = false) => {
    const isSelected = currentStage === id;
    
    if (isDropdownItem) {
      return `px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-colors ${
        isSelected 
          ? 'text-[color:var(--accent)] bg-[color:var(--surface-1)]' 
          : 'text-[color:var(--text-primary)] hover:bg-[color:var(--surface-3)] hover:text-[color:var(--accent)]'
      }`;
    }

    return `text-[11px] xl:text-[12px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
      isSelected 
        ? 'text-[color:var(--accent)] drop-shadow-md' 
        : (!isScrolled && currentStage === StageId.HOME
            ? 'text-white drop-shadow-md hover:text-[color:var(--accent)]'
            : 'text-[color:var(--text-primary)] hover:text-[color:var(--accent)]')
    }`;
  };

  return (
    <div className="flex-1 min-w-0 flex items-center justify-end h-full relative overflow-visible" ref={containerRef}>
      <div 
        className="absolute top-0 left-0 flex items-center gap-3 xl:gap-5 opacity-0 pointer-events-none -z-10 whitespace-nowrap" 
        aria-hidden="true"
      >
        {NAV_ITEMS.map((item, index) => (
          <button 
            key={`measure-${item.id}`} 
            ref={(el) => { itemsRef.current[index] = el; }} 
            className={getBtnClass(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button ref={moreBtnRef} className={getBtnClass(StageId.HOME)}>Zaidi <ChevronDown size={14} className="inline ml-1"/></button>
        <button ref={changiaBtnRef} className="px-4 py-2 ml-1 text-[11px] xl:text-[12px] font-black uppercase tracking-widest border border-transparent shrink-0 whitespace-nowrap">
          Changia
        </button>
      </div>

      <nav className="flex items-center gap-3 xl:gap-5 justify-end">
        {visibleItems.map(item => (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={getBtnClass(item.id)}
          >
            {item.label}
          </button>
        ))}

        {hiddenItems.length > 0 && (
          <div className="relative flex items-center" ref={dropdownRef}>
            <button 
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
                isMoreOpen 
                  ? 'text-[color:var(--accent)] drop-shadow-md' 
                  : (!isScrolled && currentStage === StageId.HOME 
                      ? 'text-white drop-shadow-md hover:text-[color:var(--accent)]' 
                      : 'text-[color:var(--text-primary)] hover:text-[color:var(--accent)]')
              }`}
            >
              Zaidi
              <ChevronDown size={14} className={`transition-transform duration-300 ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMoreOpen && (
              <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-48 rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] shadow-2xl overflow-hidden z-[90] flex flex-col py-1">
                {hiddenItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={getBtnClass(item.id, true)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button 
          onClick={() => onNavigate(StageId.DONATE)} 
          className="px-4 py-2 ml-1 bg-[color:var(--accent)] text-[color:var(--accent-ink)] rounded-full text-[11px] xl:text-[12px] font-black uppercase tracking-widest hover:bg-[color:var(--accent-strong)] hover:shadow-lg transition-all border border-transparent whitespace-nowrap shrink-0"
        >
          Changia
        </button>
      </nav>
    </div>
  );
};
