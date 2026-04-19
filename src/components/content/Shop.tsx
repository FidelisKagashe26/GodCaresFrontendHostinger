import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Heart,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Star,
  X,
} from 'lucide-react';
import { createShopOrder, getShopProducts, ShopOrderTrackApi, trackShopOrder } from '../../services/content/shopService';

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
  description: string;
  colors: string[];
  specs: string[];
}

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

const SHIPPING_FEE = 5000;

const getInitialCheckoutForm = (): CheckoutFormState => {
  try {
    const raw = localStorage.getItem('gc365_user');
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      fullName: typeof parsed?.name === 'string' ? parsed.name : '',
      email: typeof parsed?.email === 'string' ? parsed.email : '',
      phone: '',
      address: '',
      city: '',
      country: 'Tanzania',
    };
  } catch {
    return {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Tanzania',
    };
  }
};

export const Shop: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'tracking'>('browse');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Zote');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderStep, setOrderStep] = useState<'detail' | 'checkout' | 'success'>('detail');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormState>(() => getInitialCheckoutForm());
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSubmitError, setOrderSubmitError] = useState<string | null>(null);
  const [lastTrackingCode, setLastTrackingCode] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<ShopOrderTrackApi | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('TZS', 'TSh');

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.category).filter(Boolean));
    return ['Zote', ...Array.from(unique)];
  }, [products]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatch = activeCategory === 'Zote' || product.category === activeCategory;
        if (!categoryMatch) return false;
        if (!normalizedSearch) return true;
        const haystack = `${product.title} ${product.description} ${product.category}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      }),
    [products, activeCategory, normalizedSearch],
  );

  const featuredProducts = useMemo(
    () => [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 4),
    [products],
  );

  const subtotalAmount = selectedProduct ? selectedProduct.price * orderQuantity : 0;
  const totalAmount = selectedProduct ? subtotalAmount + SHIPPING_FEE : 0;

  const resetOrderFlow = () => {
    setOrderStep('detail');
    setOrderQuantity(1);
    setOrderSubmitError(null);
    setLastTrackingCode('');
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    resetOrderFlow();
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0] || '');
    resetOrderFlow();
  };

  const toggleWishlist = (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct || isPlacingOrder) return;

    const fullName = checkoutForm.fullName.trim();
    const email = checkoutForm.email.trim();
    const phone = checkoutForm.phone.trim();
    const address = checkoutForm.address.trim();
    const city = checkoutForm.city.trim();
    const country = checkoutForm.country.trim();

    if (!fullName || !email || !phone || !address || !city || !country) {
      setOrderSubmitError('Jaza taarifa zote za mteja na anwani kabla ya kutuma oda.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setOrderSubmitError('Tafadhali weka barua pepe sahihi.');
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setOrderSubmitError('Weka namba sahihi ya simu.');
      return;
    }

    setIsPlacingOrder(true);
    setOrderSubmitError(null);

    try {
      const selectedTitle = selectedColor ? `${selectedProduct.title} (${selectedColor})` : selectedProduct.title;
      const created = await createShopOrder({
        full_name: fullName,
        email,
        phone,
        address,
        city,
        country,
        items: [{ product_id: selectedProduct.id, quantity: orderQuantity, title: selectedTitle }],
      });

      setLastTrackingCode(created.tracking_code);
      setTrackingId(created.tracking_code);
      setTrackingResult(created);
      setOrderStep('success');
      setCartCount((prev) => prev + orderQuantity);
    } catch (error: unknown) {
      setOrderSubmitError(error instanceof Error ? error.message : 'Imeshindikana kutuma oda.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleTrackOrder = async () => {
    const code = trackingId.trim();
    if (!code) {
      setTrackingError('Weka namba ya ufuatiliaji kwanza.');
      setTrackingResult(null);
      return;
    }

    setTrackingError(null);
    setTrackingResult(null);
    try {
      const result = await trackShopOrder(code);
      setTrackingResult(result);
    } catch (error: unknown) {
      setTrackingError(error instanceof Error ? error.message : 'Imeshindikana kupata oda.');
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      setProductsError(null);
      try {
        const data = await getShopProducts();
        setProducts(
          data.map((item) => ({
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
            description: item.description || '',
            colors: item.colors || [],
            specs: item.specs || [],
          })),
        );
      } catch (error: unknown) {
        setProductsError(error instanceof Error ? error.message : 'Imeshindikana kupata bidhaa.');
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    if (activeCategory !== 'Zote' && !categories.includes(activeCategory)) {
      setActiveCategory('Zote');
    }
  }, [activeCategory, categories]);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-20 max-w-6xl mx-auto">
      <div className="p-4 sm:p-6 md:p-12 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/60 bg-gold-100/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gold-800">
            <ShoppingBag size={12} />
            Duka Rasmi
          </p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            God Cares <span className="text-gold-500">Duka</span>
          </h1>
        </div>

        <div className="w-full md:w-[22rem] space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tafuta bidhaa..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-full text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 p-1.5 flex">
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Katalogi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tracking')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${
                  activeTab === 'tracking'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Fuatilia
              </button>
            </div>
            <div className="relative inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary-950 text-gold-400">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black inline-flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'tracking' ? (
        <div className="p-3 sm:p-4 md:p-12">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 p-5 sm:p-6">
              <div className="text-center space-y-2 mb-5">
                <Package size={40} className="mx-auto text-gold-500" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Fuatilia Oda</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Weka tracking code uliyopewa baada ya kuagiza.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingId}
                  onChange={(event) => setTrackingId(event.target.value)}
                  placeholder="Mfano: GC-99238-TZ"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono text-sm focus:border-gold-500"
                />
                <button
                  type="button"
                  onClick={handleTrackOrder}
                  className="px-6 py-3 rounded-xl bg-primary-950 text-gold-400 text-[10px] font-black uppercase tracking-[0.14em] hover:bg-gold-500 hover:text-primary-950 transition-colors"
                >
                  Tafuta
                </button>
              </div>
            </div>

            {trackingError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600">
                {trackingError}
              </div>
            )}

            {trackingResult && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500 text-white inline-flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-green-700">Hali ya Oda</p>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">{trackingResult.status}</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500">{trackingResult.tracking_code}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-4">
                  {trackingResult.items.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Idadi: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200">{formatPrice(item.line_total)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 p-3 sm:p-4 md:p-12">
          <div className="md:col-span-2 space-y-5">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border transition-colors ${
                    activeCategory === category
                      ? 'border-primary-950 bg-primary-950 text-gold-400'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-gold-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {loadingProducts && (
              <div className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black">Inapakia bidhaa...</div>
            )}
            {productsError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg">
                {productsError}
              </div>
            )}
            {!loadingProducts && filteredProducts.length === 0 && (
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-lg">
                Hakuna bidhaa zilizoendana na utafutaji wako.
              </div>
            )}

            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group cursor-pointer rounded-2xl border border-green-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 p-3.5 sm:p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_26px_rgba(2,6,23,0.38)] hover:border-gold-400/80 hover:shadow-[0_14px_28px_rgba(212,154,20,0.12)] transition-all"
                onClick={() => openProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProduct(product);
                  }
                }}
              >
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-400/20 dark:text-gold-200">
                          <ShoppingBag size={13} />
                        </span>
                        {product.category}
                      </span>
                      {product.isChoice && (
                        <span className="px-2 py-1 rounded-full border border-gold-300/80 bg-gold-100/70 text-[10px] font-black uppercase tracking-[0.08em] text-gold-800">
                          Chaguo
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-gold-700 dark:group-hover:text-gold-300 transition-colors leading-tight">
                      {product.title}
                    </h2>

                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 leading-relaxed font-serif">
                      {product.description || 'Bidhaa hii inapatikana dukani. Bonyeza kuona maelezo kamili.'}
                    </p>

                    <div className="pt-1 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Star size={12} className="text-gold-500 fill-gold-500" />
                          {product.rating || 0}
                        </span>
                        <span>{product.reviews} maoni</span>
                        <span>{product.sold} zimeuzwa</span>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => toggleWishlist(event, product.id)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                          wishlist.includes(product.id)
                            ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/35 dark:text-red-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-slate-100'
                        }`}
                      >
                        <Heart size={15} className={wishlist.includes(product.id) ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-48 md:h-32 min-h-[10.5rem] md:min-h-0 shrink-0 rounded-xl overflow-hidden bg-green-50 dark:bg-slate-800 border border-green-100 dark:border-slate-700 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        className="block w-full h-auto md:h-full object-contain md:object-cover md:group-hover:scale-105 transition-transform duration-500"
                        alt={product.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Hakuna picha
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-green-100/90 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-slate-100">{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs font-bold text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openProduct(product);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold-300/80 bg-gold-100/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-gold-800 hover:bg-gold-200/80 transition-colors"
                  >
                    Angalia
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-8 border-l border-slate-100 dark:border-slate-800 pl-8 hidden md:block">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-slate-100">Mauzo Yanayovuma</h3>
            <div className="space-y-4">
              {featuredProducts.length === 0 && (
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Hakuna taarifa.</p>
              )}
              {featuredProducts.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3">
                  <p className="text-[11px] font-black text-slate-900 dark:text-slate-100 line-clamp-2">{item.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{item.sold} zimeuzwa</span>
                    <span className="font-black text-slate-700 dark:text-slate-200">{formatPrice(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-slate-100 pt-4">Huduma</h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-3">
                <p className="text-xs font-black text-slate-700 dark:text-slate-200">Usafirishaji wa kawaida</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">TSh {SHIPPING_FEE.toLocaleString('en-TZ')} | siku 2-5 za kazi</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-3">
                <p className="text-xs font-black text-slate-700 dark:text-slate-200">Usalama wa oda</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Taarifa zako zinalindwa kwa SSL.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-900 dark:text-slate-100">
                {orderStep === 'detail' ? 'Maelezo ya Bidhaa' : orderStep === 'checkout' ? 'Kamilisha Oda' : 'Oda Imepokelewa'}
              </h3>
              <button
                type="button"
                onClick={closeProductModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-red-600 hover:border-red-300 dark:hover:border-red-500/50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-74px)]">
              {orderStep === 'detail' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-h-[14rem] flex items-center justify-center">
                      {selectedProduct.image ? (
                        <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hakuna picha</div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gold-700">{selectedProduct.category}</p>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">{selectedProduct.title}</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedProduct.description || 'Hakuna maelezo ya ziada kwa sasa.'}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Star size={13} className="text-gold-500 fill-gold-500" />
                          {selectedProduct.rating}
                        </span>
                        <span>{selectedProduct.reviews} maoni</span>
                        <span>{selectedProduct.sold} zimeuzwa</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">{formatPrice(selectedProduct.price)}</p>
                        {selectedProduct.originalPrice > selectedProduct.price && (
                          <p className="text-xs font-bold text-slate-400 line-through">{formatPrice(selectedProduct.originalPrice)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Rangi</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.length > 0 ? (
                          selectedProduct.colors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setSelectedColor(color)}
                              className={`px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-[0.08em] transition-colors ${
                                selectedColor === color
                                  ? 'border-primary-950 bg-primary-950 text-gold-400'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gold-400'
                              }`}
                            >
                              {color}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Hakuna taarifa.</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Idadi</p>
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-2">
                        <button type="button" onClick={() => setOrderQuantity((prev) => Math.max(1, prev - 1))} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-black">{orderQuantity}</span>
                        <button type="button" onClick={() => setOrderQuantity((prev) => prev + 1)} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Jumla ya bidhaa</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">{formatPrice(subtotalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Usafiri wa kawaida</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">{formatPrice(SHIPPING_FEE)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-200">Jumla ya kulipa</span>
                      <span className="text-lg font-black text-primary-950 dark:text-gold-400">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderSubmitError(null);
                      setOrderStep('checkout');
                    }}
                    className="w-full py-3.5 rounded-xl bg-primary-950 text-gold-400 text-[11px] font-black uppercase tracking-[0.16em] hover:bg-gold-500 hover:text-primary-950 transition-colors"
                  >
                    Endelea na Oda
                  </button>
                </div>
              )}

              {orderStep === 'checkout' && (
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => setOrderStep('detail')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <ChevronRight size={14} className="rotate-180" />
                    Rudi
                  </button>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Bidhaa x{orderQuantity}</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">{formatPrice(subtotalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300">Usafiri</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">{formatPrice(SHIPPING_FEE)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-200">Jumla</span>
                      <span className="text-lg font-black text-primary-950 dark:text-gold-400">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={checkoutForm.fullName} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Jina kamili" className="sm:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-sm outline-none focus:border-gold-500" />
                    <input type="email" value={checkoutForm.email} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Barua pepe" className="sm:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-sm outline-none focus:border-gold-500" />
                    <input type="tel" value={checkoutForm.phone} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Namba ya simu" className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-sm outline-none focus:border-gold-500" />
                    <input type="text" value={checkoutForm.city} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, city: event.target.value }))} placeholder="Mkoa / Wilaya" className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-sm outline-none focus:border-gold-500" />
                    <input type="text" value={checkoutForm.address} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, address: event.target.value }))} placeholder="Anwani kamili" className="sm:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-sm outline-none focus:border-gold-500" />
                    <input type="text" value={checkoutForm.country} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, country: event.target.value }))} placeholder="Nchi" className="sm:col-span-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-3 text-sm outline-none focus:border-gold-500" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Njia ya malipo</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="rounded-xl border border-primary-950 bg-primary-950/5 px-3 py-3 text-xs font-black uppercase tracking-[0.08em] inline-flex items-center justify-center gap-1.5">
                        <Smartphone size={14} />
                        Simu
                      </button>
                      <button type="button" className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 text-xs font-black uppercase tracking-[0.08em] inline-flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed">
                        <CreditCard size={14} />
                        Kadi
                      </button>
                    </div>
                  </div>

                  {orderSubmitError && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600">
                      {orderSubmitError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full py-3.5 rounded-xl bg-gold-500 text-primary-950 text-[11px] font-black uppercase tracking-[0.16em] hover:bg-gold-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? 'Inatuma oda...' : 'Wasilisha Oda'}
                  </button>
                </div>
              )}

              {orderStep === 'success' && (
                <div className="text-center space-y-5 py-6">
                  <div className="mx-auto h-16 w-16 rounded-full bg-green-500 text-white inline-flex items-center justify-center">
                    <CheckCircle2 size={30} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Oda Imepokelewa</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Tumeipokea oda yako. Tumia tracking code kufuatilia hatua inayofuata.</p>
                  </div>
                  <div className="max-w-sm mx-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Tracking code</p>
                    <p className="mt-1 text-xl font-black font-mono text-primary-950 dark:text-gold-400 break-all">{lastTrackingCode || 'Hakuna'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeProductModal();
                      setActiveTab('tracking');
                      if (lastTrackingCode) {
                        setTrackingId(lastTrackingCode);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-950 text-gold-400 px-6 py-3 text-[11px] font-black uppercase tracking-[0.14em] hover:bg-gold-500 hover:text-primary-950 transition-colors"
                  >
                    Fuatilia Oda
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-3 sm:px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Usafiri wa Kawaida',
              desc: 'Oda zote zinasafirishwa kwa utaratibu wa kawaida na gharama ya usafiri huongezwa kwenye oda.',
              icon: Clock,
            },
            {
              title: 'Ufuatiliaji wa Oda',
              desc: 'Baada ya kuagiza utapokea tracking code ya kufuatilia hatua ya oda yako wakati wowote.',
              icon: Package,
            },
            {
              title: 'Muamala Salama',
              desc: 'Taarifa zako zinapitia mfumo salama wa SSL kulinda oda na mawasiliano yako.',
              icon: ShieldCheck,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-5"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
                <item.icon size={14} />
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
