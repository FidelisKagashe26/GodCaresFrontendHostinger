
import React, { useEffect, useMemo, useState } from 'react';
import { 
  ShoppingCart, Star, Truck, CheckCircle2, ChevronRight, Search, 
  Filter, ShoppingBag, Heart, ArrowUpRight, X, Minus, Plus, 
  CreditCard, Smartphone, ShieldCheck, MapPin, Package, Clock, Eye
} from 'lucide-react';
import { getShopProducts, trackShopOrder } from '../services/shopService';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  sold: number;
  isChoice: boolean;
  freeShipping: boolean;
  description: string;
  colors: string[];
  specs: string[];
}

export const Shop: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Browse' | 'Tracking'>('Browse');
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState('Zote');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderStep, setOrderStep] = useState<'Detail' | 'Checkout' | 'Success'>('Detail');
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.category).filter(Boolean));
    return ['Zote', ...Array.from(unique)];
  }, [products]);
  const filteredProducts = useMemo(
    () => products.filter((product) => activeCategory === 'Zote' || product.category === activeCategory),
    [products, activeCategory]
  );

  const formatPrice = (amount: number) => {
    if (amount === 0) return "BURE";
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount).replace('TZS', 'TZS ');
  };

  const toggleWishlist = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const addToCartAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCartCount(prev => prev + 1);
  };

  const handlePlaceOrder = () => {
    setOrderStep('Success');
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      setProductsError(null);
      try {
        const data = await getShopProducts();
        const mapped = data.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          originalPrice: item.original_price,
          image: item.image || '',
          category: item.category || 'Hakuna taarifa',
          rating: Number(item.rating || 0),
          reviews: item.reviews || 0,
          sold: item.sold || 0,
          isChoice: item.is_choice,
          freeShipping: item.free_shipping,
          description: item.description || '',
          colors: item.colors || [],
          specs: item.specs?.length ? item.specs : [],
        }));
        setProducts(mapped);
      } catch (err: any) {
        setProductsError(err?.message || 'Imeshindikana kupata bidhaa.');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (activeCategory !== 'Zote' && !categories.includes(activeCategory)) {
      setActiveCategory('Zote');
    }
  }, [activeCategory, categories]);

  const handleTrackOrder = async () => {
    if (!trackingId) return;
    setTrackingError(null);
    setTrackingResult(null);
    try {
      const result = await trackShopOrder(trackingId.trim());
      setTrackingResult(result);
    } catch (err: any) {
      setTrackingError(err?.message || 'Imeshindikana kupata oda.');
    }
  };

  const OrderTrackingView = () => (
    <div className="max-w-2xl mx-auto space-y-8 py-12 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
        <div className="text-center space-y-2">
           <Package size={48} className="mx-auto text-gold-500" />
           <h2 className="text-2xl font-black uppercase tracking-tight">Fuatilia Mzigo Wako</h2>
           <p className="text-slate-500 text-sm">Ingiza namba ya oda uliyopewa wakati wa kulipia.</p>
        </div>
        <div className="flex gap-2">
           <input 
             type="text" 
             value={trackingId}
             onChange={(e) => setTrackingId(e.target.value)}
             placeholder="Mfano: GC-99238-TZ"
             className="flex-1 px-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none font-mono text-sm focus:border-gold-500"
           />
            <button onClick={handleTrackOrder} className="bg-primary-950 text-gold-400 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-primary-950 transition-all">Tafuta</button>
        </div>
      </div>

        {trackingError && (
          <div className="text-center text-xs font-black uppercase tracking-widest text-red-500">{trackingError}</div>
        )}

        {trackingResult && (
        <div className="space-y-4 animate-slide-up">
           <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={20}/></div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-green-600">Hali ya Sasa</p>
                  <p className="font-bold text-slate-800 dark:text-white">{trackingResult.status}</p>
                 </div>
              </div>
              <p className="text-xs font-bold text-slate-400">Oda: #{trackingResult.tracking_code}</p>
           </div>
           
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
              {trackingResult.items.map((step: any, i: number) => (
                <div key={i} className="flex gap-4 relative pb-8 last:pb-0">
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-gold-500 border-gold-500 text-primary-950">
                    <CheckCircle2 size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-slate-800 dark:text-white">{step.title}</p>
                    <p className="text-[10px] text-slate-500">Kiasi: {formatPrice(step.line_total)}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in pb-32 max-w-7xl mx-auto px-4">
      
      {/* Header & Cart Status */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-8 py-12 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 text-gold-600 dark:text-gold-400 rounded-lg text-[10px] font-black uppercase tracking-[0.3em]">
             <ShoppingBag size={12} /> Official Store
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Duka la <span className="text-gold-500">Ukweli</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
              <button 
                onClick={() => setActiveTab('Browse')}
                className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Browse' ? 'bg-white dark:bg-slate-800 shadow-lg text-primary-900 dark:text-white' : 'text-slate-500'}`}
              >Katalogi</button>
              <button 
                onClick={() => setActiveTab('Tracking')}
                className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Tracking' ? 'bg-white dark:bg-slate-800 shadow-lg text-primary-900 dark:text-white' : 'text-slate-500'}`}
              >Track</button>
           </div>
           <button className="relative p-5 bg-primary-950 text-gold-400 rounded-xl hover:bg-gold-500 hover:text-primary-950 transition-all shadow-2xl group active:scale-90">
              <ShoppingCart size={24} />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-lg">{cartCount}</span>}
           </button>
        </div>
      </section>

      {activeTab === 'Tracking' ? <OrderTrackingView /> : (
        <>
          {/* Category Navigation */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide py-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeCategory === cat ? 'bg-primary-950 text-gold-400 border-primary-900 shadow-xl' : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:border-gold-500/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Discovery Grid - Compact sizes */}
          {loadingProducts && (
            <div className="py-4 text-center text-xs font-black uppercase tracking-widest text-slate-400">Inapakia bidhaa...</div>
          )}
          {productsError && (
            <div className="py-2 text-center text-xs font-black uppercase tracking-widest text-red-500">{productsError}</div>
          )}
          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="py-6 text-center text-xs font-black uppercase tracking-widest text-slate-400">
              Hakuna taarifa za bidhaa kwa sasa.
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 pt-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => { setSelectedProduct(product); setOrderStep('Detail'); setOrderQuantity(1); setSelectedColor(product.colors[0] || ''); }}
                className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-gold-500/30 cursor-pointer"
              >
                {/* Image Section - Compact */}
                <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-lg m-1.5">
                  {product.image ? (
                    <img src={product.image} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt={product.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Hakuna picha
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all duration-500"></div>
                  
                  {/* Floating Badges - Smaller */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {product.isChoice && <div className="px-2 py-1 bg-primary-950 text-gold-400 text-[7px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-lg"><Star size={8} fill="currentColor" /> CHOICE</div>}
                  </div>

                  {/* Hover Quick Actions - Compact */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                     <button 
                       onClick={addToCartAction}
                       className="flex-1 bg-white text-primary-950 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-gold-500 transition-all shadow-xl active:scale-95"
                     >
                       <ShoppingCart size={12} /> Add
                     </button>
                     <button 
                       onClick={(e) => toggleWishlist(e, product.id)}
                       className={`p-2 rounded-lg transition-all shadow-xl border backdrop-blur-md active:scale-90 ${wishlist.includes(product.id) ? 'bg-red-500 text-white border-red-400' : 'bg-white/10 text-white border-white/20'}`}
                     >
                       <Heart size={14} className={wishlist.includes(product.id) ? 'fill-current' : ''} />
                     </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col space-y-2">
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <p className="text-[8px] font-black text-gold-600 dark:text-gold-500 uppercase tracking-widest">{product.category}</p>
                      <div className="flex items-center gap-0.5 text-gold-500 text-[8px] font-black"><Star size={10} fill="currentColor"/> {product.rating}</div>
                    </div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight line-clamp-2 min-h-[2rem] group-hover:text-gold-600 transition-colors">{product.title}</h3>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-white/5">
                     <p className="text-sm font-black text-primary-950 dark:text-white">{formatPrice(product.price)}</p>
                     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{product.sold} Sold</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* DETAIL & CHECKOUT MODAL - Compact & Space Efficient */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-fade-in overflow-hidden">
           <div className="bg-white dark:bg-slate-950 w-full max-w-4xl h-auto max-h-[90vh] md:h-[80vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 relative">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-red-600 text-white transition-all rounded-lg active:scale-90"><X size={18} /></button>

              {/* LEFT: Image Section */}
              <div className="w-full md:w-2/5 h-[250px] md:h-auto relative bg-slate-900 overflow-hidden shrink-0">
                 {selectedProduct.image ? (
                   <img src={selectedProduct.image} className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] transition-transform duration-1000 hover:scale-105" alt="" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-400">
                     Hakuna picha
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent"></div>
                 <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex gap-2 mb-2">
                       <button onClick={(e) => toggleWishlist(e, selectedProduct.id)} className={`p-2 rounded-lg border backdrop-blur-md transition-all ${wishlist.includes(selectedProduct.id) ? 'bg-red-500 text-white border-red-400' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}><Heart size={16} className={wishlist.includes(selectedProduct.id) ? 'fill-current' : ''}/></button>
                    </div>
                    <p className="text-gold-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{selectedProduct.category}</p>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{selectedProduct.title}</h2>
                 </div>
              </div>

              {/* RIGHT: Action Section */}
              <div className="flex-1 overflow-y-auto scrollbar-hide p-6 md:p-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                 {orderStep === 'Detail' && (
                   <div className="space-y-6 animate-fade-in h-full flex flex-col">
                      <section className="space-y-4">
                         <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black text-primary-950 dark:text-white">{formatPrice(selectedProduct.price)}</h3>
                            <div className="flex items-center gap-2 text-gold-500">
                               <Star size={16} fill="currentColor" />
                               <span className="text-sm font-black">{selectedProduct.rating}</span>
                               <span className="text-[10px] text-slate-400 font-medium">({selectedProduct.reviews} reviews)</span>
                            </div>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic border-l-2 border-gold-500 pl-4 line-clamp-3">
                            "{selectedProduct.description}"
                         </p>
                      </section>

                      <div className="flex-1 space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <section className="space-y-2">
                               <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Rangi</h4>
                               <div className="flex flex-wrap gap-2">
                                  {selectedProduct.colors.map(color => (
                                    <button 
                                      key={color} 
                                      onClick={() => setSelectedColor(color)}
                                      className={`px-3 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${selectedColor === color ? 'bg-primary-950 text-gold-400 border-primary-900 shadow-sm' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 hover:border-gold-500'}`}
                                    >
                                      {color}
                                    </button>
                                  ))}
                                  {selectedProduct.colors.length === 0 && (
                                    <span className="text-[10px] font-bold text-slate-400">Hakuna taarifa.</span>
                                  )}
                               </div>
                            </section>

                            <section className="space-y-2">
                               <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Idadi</h4>
                               <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 w-fit p-1">
                                  <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-slate-500"><Minus size={14}/></button>
                                  <span className="text-sm font-black w-6 text-center">{orderQuantity}</span>
                                  <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-slate-500"><Plus size={14}/></button>
                               </div>
                            </section>
                         </div>
                      </div>

                      <div className="pt-6 mt-auto border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
                         <div className="flex items-center gap-2 text-xs">
                            <Truck size={16} className="text-gold-500" />
                            <span className="font-bold">{selectedProduct.freeShipping ? 'Free Shipping' : 'Standard Shipping'}</span>
                            <span className="text-slate-500 text-[10px] ml-auto">2-5 Siku za Kazi</span>
                         </div>
                         <button 
                           onClick={() => setOrderStep('Checkout')}
                           className="w-full py-4 bg-primary-950 text-gold-400 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-500 hover:text-primary-950 transition-all shadow-xl active:scale-[0.98]"
                         >Endelea na Malipo</button>
                      </div>
                   </div>
                 )}

                 {orderStep === 'Checkout' && (
                   <div className="space-y-6 animate-slide-in h-full flex flex-col">
                      <header className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-white/5">
                         <button onClick={() => setOrderStep('Detail')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"><ChevronRight className="rotate-180" size={18} /></button>
                         <h3 className="text-xl font-black uppercase tracking-tight">Kamilisha Oda</h3>
                      </header>

                      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                         <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                               <span>Bidhaa (x{orderQuantity})</span>
                               <span>{formatPrice(selectedProduct.price * orderQuantity)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                               <span>Shipping</span>
                               <span className={selectedProduct.freeShipping ? 'text-green-600' : ''}>{selectedProduct.freeShipping ? 'BURE' : formatPrice(5000)}</span>
                            </div>
                            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                               <span className="text-xs font-black uppercase tracking-widest">Jumla</span>
                               <span className="text-xl font-black text-primary-950 dark:text-white">{formatPrice((selectedProduct.price * orderQuantity) + (selectedProduct.freeShipping ? 0 : 5000))}</span>
                            </div>
                         </div>

                         <section className="space-y-3">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Taarifa za Kutuma</h4>
                            <div className="space-y-3">
                               <div className="flex gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus-within:border-gold-500 transition-all">
                                  <MapPin size={16} className="text-primary-950 dark:text-gold-500 shrink-0" />
                                  <input type="text" placeholder="Mkoa, Wilaya, Mtaa" className="bg-transparent border-none outline-none text-xs font-bold w-full text-slate-900 dark:text-white" />
                               </div>
                               <div className="flex gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus-within:border-gold-500 transition-all">
                                  <Smartphone size={16} className="text-primary-950 dark:text-gold-500 shrink-0" />
                                  <input type="tel" placeholder="+255 7XX XXX XXX" className="bg-transparent border-none outline-none text-xs font-bold w-full text-slate-900 dark:text-white" />
                               </div>
                            </div>
                         </section>

                         <section className="space-y-3">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Malipo</h4>
                            <div className="grid grid-cols-2 gap-3">
                               <button className="p-4 border-2 border-primary-950 rounded-xl flex flex-col items-center gap-2 bg-primary-950/5 shadow-sm active:scale-95 transition-all">
                                  <Smartphone size={20} className="text-primary-950 dark:text-gold-500" />
                                  <span className="text-[9px] font-black uppercase tracking-wider">Mobile</span>
                               </button>
                               <button className="p-4 border border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition-all opacity-60">
                                  <CreditCard size={20} className="text-slate-400" />
                                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Card</span>
                               </button>
                            </div>
                         </section>
                      </div>

                      <button 
                        onClick={handlePlaceOrder}
                        className="w-full py-4 bg-gold-500 text-primary-950 rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-gold-500/20 active:scale-[0.98] mt-auto"
                      >Lipa Sasa</button>
                   </div>
                 )}

                 {orderStep === 'Success' && (
                   <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-scale-up">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl animate-bounce">
                         <CheckCircle2 size={40} />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-3xl font-black tracking-tighter uppercase leading-none italic">Imepokelewa!</h3>
                         <p className="text-slate-500 text-xs max-w-xs mx-auto font-medium">Oda yako inashughulikiwa. Utapokea ujumbe mfupi hivi punde.</p>
                      </div>
                      <div className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-xs shadow-inner">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tracking ID</p>
                         <p className="text-2xl font-black text-primary-950 dark:text-gold-500 font-mono tracking-tight">GC-20492-TZ</p>
                         <p className="text-[9px] text-slate-500 mt-2 italic font-bold">Tumia namba hii kufuatilia.</p>
                      </div>
                      <button 
                        onClick={() => { setSelectedProduct(null); setActiveTab('Tracking'); setTrackingId('GC-TEST'); }}
                        className="px-10 py-4 bg-primary-950 text-gold-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 hover:text-primary-950 transition-all shadow-xl"
                      >Fuatilia Oda</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

