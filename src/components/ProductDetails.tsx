import React, { useState, useEffect, useRef } from 'react';
import { Product, UserProfile, PantryItem, PriceInfo } from '../types';
import { fetchAlternatives } from '../lib/api';
import { verifyIngredientsFromImage } from '../lib/ai';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Leaf, 
  Plus, 
  Calendar, 
  ArrowRight,
  ChevronRight,
  FlaskConical,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShoppingBag,
  Zap,
  ExternalLink,
  Package,
  Tag,
  MapPin,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailsProps {
  product: Product;
  userProfile: UserProfile;
  locationCity: string | null;
  isSmartMode: boolean;
  onClose: () => void;
  onSaveToPantry: (item: Omit<PantryItem, 'id' | 'addedAt' | 'uid'>) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  product, 
  userProfile, 
  locationCity,
  isSmartMode,
  onClose,
  onSaveToPantry
}) => {
  const [isMarketingView, setIsMarketingView] = useState(true);
  const [activeTab, setActiveTab] = useState<'health' | 'prices'>('health');
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [showPantryForm, setShowPantryForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [prices, setPrices] = useState<PriceInfo[]>([]);

  useEffect(() => {
    // Simulate price fetching
    const generatePrices = () => {
      const stores = [
        { name: 'Blinkit', color: '#F7D01B', baseUrl: 'https://blinkit.com/s/?q=' },
        { name: 'Zepto', color: '#5B21B6', baseUrl: 'https://www.zeptonow.com/search?q=' },
        { name: 'Instamart', color: '#FF5200', baseUrl: 'https://www.swiggy.com/instamart/search?query=' },
        { name: 'Amazon', color: '#FF9900', baseUrl: 'https://www.amazon.in/s?k=' },
        { name: 'BigBasket', color: '#84C225', baseUrl: 'https://www.bigbasket.com/ps/?q=' }
      ];

      // Base price range based on category or random
      const basePrice = Math.floor(Math.random() * 200) + 50;
      
      const simulatedPrices = stores.map(store => ({
        storeName: store.name,
        price: Math.round(basePrice + (Math.random() * 40 - 20)),
        availability: Math.random() > 0.1,
        url: `${store.baseUrl}${encodeURIComponent(product.name)}`,
        color: store.color
      }));

      setPrices(simulatedPrices);
    };

    generatePrices();
  }, [product.name]);
  
  const [pantryData, setPantryData] = useState({
    quantity: 1,
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const flaggedIngredients = userProfile.restrictions.filter(r => 
    product.ingredients.toLowerCase().includes(r.toLowerCase())
  );

  const isSafe = flaggedIngredients.length === 0;

  useEffect(() => {
    if (!isSafe && product.categories.length > 0) {
      fetchAlternatives(product.categories[0]).then(setAlternatives);
    }
  }, [isSafe, product.categories]);

  const handleVerifyLabel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await verifyIngredientsFromImage(base64, product.ingredients);
        setVerificationResult(result);
        setIsVerifying(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    onSaveToPantry({
      ...product,
      ...pantryData
    });
    setShowPantryForm(false);
  };

  const isUnsafe = ['d', 'e'].includes(product.nutritionGrade.toLowerCase());
  const deliverySearchQuery = (isSmartMode && isUnsafe) ? (alternatives[0]?.name || 'Healthy ' + product.name) : product.name;
  const blinkitUrl = `https://blinkit.com/s/?q=${encodeURIComponent(deliverySearchQuery)}`;
  const zeptoUrl = `https://www.zeptonow.com/search?q=${encodeURIComponent(deliverySearchQuery)}`;
  const instamartUrl = `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(deliverySearchQuery)}`;
  const amazonUrl = `https://www.amazon.in/s?k=${encodeURIComponent(deliverySearchQuery)}`;
  const buyButtonText = (isSmartMode && isUnsafe) ? 'Buy Healthy Alternative' : 'Buy Now';

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed inset-0 z-50 flex flex-col bg-white rounded-t-[2.5rem] overflow-hidden ${isSafe ? 'shadow-[0_-20px_50px_-12px_rgba(16,185,129,0.15)]' : 'shadow-[0_-20px_50px_-12px_rgba(239,68,68,0.15)]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 glass-effect border-b">
        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-95">
          <ArrowRight className="rotate-180 text-slate-600" size={20} />
        </button>
        <h2 className="font-black text-slate-900 truncate max-w-[200px] tracking-tight">{product.name}</h2>
        <button 
          onClick={() => setIsMarketingView(!isMarketingView)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all active:scale-95 ${isMarketingView ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-900 text-white'}`}
        >
          {isMarketingView ? <Eye size={14} /> : <EyeOff size={14} />}
          {isMarketingView ? 'REALITY' : 'MARKETING'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        {/* Tab Navigation */}
        <div className="flex gap-6 px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('health')}
            className={`pb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'health' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            Health & Eco
            {activeTab === 'health' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('prices')}
            className={`pb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 ${activeTab === 'prices' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Tag size={12} />
            Price Comparison
            {activeTab === 'prices' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'health' ? (
            <motion.div
              key="health-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Product Image */}
        <div className="relative h-80 bg-slate-50 flex items-center justify-center p-12">
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1506617564039-2f3b650ad701?auto=format&fit=crop&q=80&w=800'} 
            alt={product.name}
            className={`max-w-full max-h-full object-contain transition-all duration-700 ${!isMarketingView ? 'grayscale blur-xl opacity-10' : ''}`}
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute bottom-8 left-6 right-6 flex justify-center">
            <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-sm tracking-tight ${isSafe ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              {isSafe ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
              {isSafe ? 'SAFE TO CONSUME' : 'RESTRICTION ALERT'}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* AI Verification Section */}
          <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 space-y-4 soft-shadow">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-indigo-700 font-black text-sm uppercase tracking-widest">
                <ShieldCheck size={18} />
                <span>AI Verification</span>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isVerifying}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
                Verify Label
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleVerifyLabel} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {verificationResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border-2 ${verificationResult.match ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}
              >
                <div className="flex items-center gap-2 mb-3 font-black text-xs uppercase tracking-widest">
                  {verificationResult.match ? (
                    <ShieldCheck className="text-emerald-600" size={16} />
                  ) : (
                    <ShieldAlert className="text-amber-600" size={16} />
                  )}
                  <span className={verificationResult.match ? 'text-emerald-700' : 'text-amber-700'}>
                    {verificationResult.match ? 'Label Verified' : 'Discrepancy Detected'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 font-medium">{verificationResult.explanation}</p>
                {verificationResult.hiddenIngredients?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Unlisted Ingredients:</p>
                    <div className="flex flex-wrap gap-2">
                      {verificationResult.hiddenIngredients.map((ing: string) => (
                        <span key={ing} className="px-3 py-1 bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black uppercase">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Restriction Alerts */}
          {!isSafe && (
            <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 soft-shadow">
              <h3 className="text-red-800 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                <AlertTriangle size={18} />
                Restricted Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {flaggedIngredients.map(ing => (
                  <span key={ing} className="px-5 py-2 bg-red-200 text-red-900 rounded-2xl text-xs font-black uppercase tracking-tight">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Marketing vs Reality View */}
          <AnimatePresence mode="wait">
            {isMarketingView ? (
              <motion.div 
                key="marketing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <p className="text-indigo-600 text-[10px] uppercase tracking-[0.3em] font-black">{product.brand}</p>
                  <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-[2rem] bg-white border border-slate-100 soft-shadow space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FlaskConical size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nutri-Score</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-4xl font-black uppercase ${['a', 'b'].includes(product.nutritionGrade.toLowerCase()) ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {product.nutritionGrade}
                      </span>
                      <div className="h-2.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${['a', 'b'].includes(product.nutritionGrade.toLowerCase()) ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${(101 - (product.nutritionGrade.charCodeAt(0) - 65) * 20)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-white border border-slate-100 soft-shadow space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Leaf size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Eco-Score</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-black uppercase text-indigo-600">{product.ecoscore}</span>
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400">
                        <Leaf size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="reality"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 bg-slate-900 text-white p-8 rounded-[2.5rem] soft-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                    <FlaskConical className="text-indigo-400" size={24} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xl font-black tracking-tight">Molecular Reality</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scientific Breakdown</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex justify-between items-center p-5 bg-white/5 rounded-[1.5rem] border border-white/10">
                    <div className="flex items-center gap-3">
                      <Loader2 className="text-indigo-400" size={18} />
                      <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Processing (NOVA)</span>
                    </div>
                    <span className={`px-5 py-2 rounded-xl font-black text-xs uppercase ${product.novaScore > 2 ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      Level {product.novaScore}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FlaskConical size={14} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Chemical Additives</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.additives.length > 0 ? (
                        product.additives.map(add => (
                          <span key={add} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono font-bold text-indigo-300">
                            {add}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400 text-sm font-black italic">Pure - No additives found</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Package size={14} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Raw Ingredients</p>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300 italic font-medium bg-white/5 p-5 rounded-[1.5rem] border border-white/10">
                      {product.ingredients || 'Information not available'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price Comparison Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest text-xs">
                <Tag className="text-indigo-600" size={18} />
                Price Comparison
              </h3>
              {locationCity && (
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                  <MapPin size={10} strokeWidth={3} />
                  <span>{locationCity}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {prices.map(store => (
                <a 
                  key={store.storeName}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] soft-shadow active:scale-95 transition-all group"
                  style={{ borderLeft: `6px solid ${store.color}` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-lg tracking-tight">{store.storeName}</span>
                      <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-black uppercase tracking-widest ${store.availability ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${store.availability ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {store.availability ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xl font-black text-slate-900">₹{store.price}</span>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {buyButtonText} <ChevronRight size={12} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
            
            <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-widest opacity-50">
              * Prices simulated for your current location (within 5km)
            </p>
          </div>

          {/* Alternatives */}
          {!isSafe && alternatives.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest text-xs">
                <ShieldCheck className="text-emerald-500" size={18} />
                Healthier Swaps
              </h3>
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                {alternatives.map(alt => (
                  <div key={alt.barcode} className="min-w-[260px] snap-start bg-white border border-slate-100 rounded-[2.5rem] p-6 soft-shadow space-y-4">
                    <div className="h-36 bg-slate-50 rounded-[2rem] p-4 flex items-center justify-center">
                      <img src={alt.imageUrl} alt={alt.name} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{alt.brand}</p>
                      <p className="font-black text-base text-slate-900 truncate tracking-tight">{alt.name}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-black px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl uppercase tracking-widest">Grade {alt.nutritionGrade}</span>
                      <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            </div>
          </motion.div>
        ) : (
            <motion.div
              key="prices-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8 space-y-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-widest">
                  <Tag size={18} className="text-indigo-600" />
                  <span>Live Availability</span>
                </div>
                {locationCity && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-700 uppercase tracking-widest border border-indigo-100">
                    <MapPin size={10} />
                    {locationCity}
                  </div>
                )}
              </div>

              {/* Horizontal Store List */}
              <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-8 px-8">
                {prices.map(store => (
                  <a 
                    key={store.storeName}
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-48 p-6 bg-white rounded-[2.5rem] border border-slate-100 soft-shadow group transition-all hover:scale-[1.02] hover:shadow-xl"
                    style={{ borderTop: `6px solid ${store.color}` }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <p className="font-black text-slate-900 text-lg">{store.storeName}</p>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${store.availability ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${store.availability ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {store.availability ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Price</p>
                      <p className="text-3xl font-black text-slate-900">₹{store.price}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        <span>{buyButtonText}</span>
                        <ExternalLink size={12} />
                      </div>
                      <ShoppingCart size={16} className="text-slate-200 group-hover:text-indigo-200 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Branded Quick Buy Buttons */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Quick Buy</h3>
                <div className="grid grid-cols-1 gap-3">
                  <a 
                    href={blinkitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-[#F7D01B] rounded-[2rem] soft-shadow active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-slate-900">
                        <ShoppingBag size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-lg tracking-tight">Blinkit</span>
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest opacity-60">
                          {buyButtonText}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-900 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <a 
                    href={zeptoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-[#52298F] text-white rounded-[2rem] soft-shadow active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                        <Zap size={24} fill="currentColor" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-white text-lg tracking-tight">Zepto</span>
                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest opacity-60">
                          {buyButtonText}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
                  </a>

                  <a 
                    href={instamartUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-[#FF5200] text-white rounded-[2rem] soft-shadow active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                        <ShoppingBag size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-white text-lg tracking-tight">Instamart</span>
                        <span className="text-[10px] font-black text-orange-100 uppercase tracking-widest opacity-60">
                          {buyButtonText}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
                  </a>

                  <a 
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-[#FF9900] text-black rounded-[2rem] soft-shadow active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-black">
                        <ShoppingCart size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-black text-lg tracking-tight">Amazon</span>
                        <span className="text-[10px] font-black text-black uppercase tracking-widest opacity-60">
                          {buyButtonText}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-black group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
                {locationCity && (
                  <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-widest opacity-50 pt-2">
                    * Calculated for your current location (within 5km)
                  </p>
                )}
              </div>

              <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] mb-4 opacity-80">
                    <Zap size={16} />
                    <span>Smart Savings Alert</span>
                  </div>
                  <p className="text-lg font-medium leading-relaxed mb-6">
                    Buying this on <span className="font-black underline decoration-indigo-300 underline-offset-4">{prices.sort((a, b) => a.price - b.price)[0]?.storeName}</span> saves you approximately <span className="font-black text-emerald-300">₹{Math.max(...prices.map(p => p.price)) - Math.min(...prices.map(p => p.price))}</span> compared to other stores in {locationCity || 'your area'}.
                  </p>
                  <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
                    Restock via Best Value
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price Trend</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900">Stable</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-4 rounded-full ${i < 4 ? 'bg-indigo-500' : 'bg-slate-200'}`} />)}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Demand</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900">High</span>
                    <Zap size={16} className="text-amber-500 fill-amber-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-8 glass-effect border-t flex gap-4 z-50 rounded-t-[2.5rem] soft-shadow">
        <button 
          onClick={() => setShowPantryForm(true)}
          className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 active:scale-95 transition-all"
        >
          <Plus size={24} />
          SAVE TO PANTRY
        </button>
      </div>

      {/* Pantry Form Modal */}
      <AnimatePresence>
        {showPantryForm && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 space-y-8 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900">Add to Pantry</h3>
                <button onClick={() => setShowPantryForm(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <ArrowRight className="rotate-90" size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Quantity</label>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setPantryData(d => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))}
                      className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center font-black text-2xl text-slate-600 hover:border-indigo-200 transition-colors"
                    >-</button>
                    <span className="text-3xl font-black text-slate-900">{pantryData.quantity}</span>
                    <button 
                      onClick={() => setPantryData(d => ({ ...d, quantity: d.quantity + 1 }))}
                      className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center font-black text-2xl text-slate-600 hover:border-indigo-200 transition-colors"
                    >+</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Manufacture</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                      <input 
                        type="date" 
                        value={pantryData.manufactureDate}
                        onChange={e => setPantryData(d => ({ ...d, manufactureDate: e.target.value }))}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Expiry</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                      <input 
                        type="date" 
                        value={pantryData.expiryDate}
                        onChange={e => setPantryData(d => ({ ...d, expiryDate: e.target.value }))}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 focus:ring-2 ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-transform"
              >
                CONFIRM ADDITION
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
