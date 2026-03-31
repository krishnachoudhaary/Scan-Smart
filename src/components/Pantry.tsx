import React, { useState } from 'react';
import { PantryItem, PriceInfo } from '../types';
import { 
  Trash2, 
  Package, 
  Calendar, 
  AlertCircle, 
  ShoppingCart, 
  ExternalLink,
  Tag,
  Zap,
  MapPin,
  RefreshCw,
  Plus
} from 'lucide-react';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface PantryProps {
  items: PantryItem[];
  locationCity: string | null;
  onRemove: (id: string) => void;
  onCheckPrices: () => void;
}

export const Pantry: React.FC<PantryProps> = ({ items, locationCity, onRemove, onCheckPrices }) => {
  const [showRestockAnalysis, setShowRestockAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    stores: { name: string; total: number; color: string; items: { name: string; price: number }[] }[];
    bestStore: string;
    savings: number;
  } | null>(null);
  const [showPriceBreakup, setShowPriceBreakup] = useState(false);

  const handleRestockAnalysis = () => {
    onCheckPrices();
    
    // Simulate multi-store price analysis for the entire pantry
    const stores = [
      { name: 'Blinkit', color: '#F7D01B', multiplier: 1.1 },
      { name: 'Zepto', color: '#5B21B6', multiplier: 1.05 },
      { name: 'Instamart', color: '#FF5200', multiplier: 1.08 },
      { name: 'Amazon', color: '#FF9900', multiplier: 0.95 },
      { name: 'BigBasket', color: '#84C225', multiplier: 1.0 }
    ];

    const storeTotals = stores.map(store => {
      const itemPrices = items.map(item => ({
        name: item.name,
        price: Math.round(150 * store.multiplier + (Math.random() * 40 - 20))
      }));
      
      const total = itemPrices.reduce((sum, item) => sum + item.price, 0);

      return {
        name: store.name,
        total,
        color: store.color,
        items: itemPrices
      };
    });

    const sorted = [...storeTotals].sort((a, b) => a.total - b.total);
    
    setAnalysisData({
      stores: storeTotals,
      bestStore: sorted[0].name,
      savings: sorted[sorted.length - 1].total - sorted[0].total
    });
    
    setShowRestockAnalysis(true);
  };
  const blinkitGroceryUrl = "https://blinkit.com/s/?q=groceries";

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pantry</h1>
          <p className="text-slate-500 font-medium">Manage your scanned items</p>
        </div>
        <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest soft-shadow">
          {items.length} Items
        </span>
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          <button 
            onClick={handleRestockAnalysis}
            className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-between shadow-2xl shadow-indigo-200 active:scale-[0.98] transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={24} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Smart Restock</p>
                <p className="text-lg font-black">Find Best Price for Full List</p>
              </div>
            </div>
            <RefreshCw size={20} className="relative z-10 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <AnimatePresence>
            {showRestockAnalysis && analysisData && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-8 soft-shadow">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                      <Zap size={14} />
                      <span>Savings Analysis</span>
                    </div>
                    {locationCity && (
                      <div className="flex items-center gap-1 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        <MapPin size={10} />
                        {locationCity}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {analysisData.stores.map(store => (
                      <div 
                        key={store.name}
                        className={`p-4 rounded-2xl border ${store.name === analysisData.bestStore ? 'bg-indigo-500/20 border-indigo-500' : 'bg-white/5 border-white/10'}`}
                      >
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{store.name}</p>
                        <p className="text-lg font-black">₹{store.total}</p>
                        {store.name === analysisData.bestStore && (
                          <div className="mt-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest">Best Value</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                      <Tag size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Potential Savings</p>
                      <p className="text-sm font-medium">Restock all items on <span className="font-black text-white">{analysisData.bestStore}</span> to save <span className="font-black text-emerald-400">₹{analysisData.savings}</span> today.</p>
                    </div>
                    <button 
                      onClick={() => setShowPriceBreakup(!showPriceBreakup)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      {showPriceBreakup ? 'Hide Breakup' : 'View Breakup'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showPriceBreakup && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t border-white/10"
                      >
                        <div className="overflow-x-auto no-scrollbar">
                          <table className="w-full text-left text-[10px] font-medium text-slate-400">
                            <thead>
                              <tr className="border-b border-white/5">
                                <th className="pb-2 font-black uppercase tracking-widest">Product</th>
                                {analysisData.stores.map(s => (
                                  <th key={s.name} className="pb-2 font-black uppercase tracking-widest text-right">{s.name}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {items.map((item, idx) => (
                                <tr key={item.id}>
                                  <td className="py-2 text-white font-bold truncate max-w-[100px]">{item.name}</td>
                                  {analysisData.stores.map(s => (
                                    <td key={s.name} className="py-2 text-right text-slate-300">₹{s.items[idx].price}</td>
                                  ))}
                                </tr>
                              ))}
                              <tr className="border-t border-white/10 font-black text-white">
                                <td className="py-3 uppercase tracking-widest">Total Bill</td>
                                {analysisData.stores.map(s => (
                                  <td key={s.name} className={`py-3 text-right ${s.name === analysisData.bestStore ? 'text-emerald-400' : ''}`}>₹{s.total}</td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
                    Checkout Full List
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-8 text-center bg-white rounded-[2.5rem] soft-shadow border border-slate-50">
          <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200 soft-shadow">
            <Package size={64} strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <p className="font-black text-xl text-slate-900 tracking-tight">Your pantry is empty</p>
            <p className="text-sm font-medium text-slate-400 max-w-[200px]">Scan items to track their health and sustainability impact</p>
          </div>
          <a 
            href={blinkitGroceryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-[#F7D01B] text-slate-900 rounded-[1.5rem] font-black text-sm soft-shadow hover:-translate-y-1 transition-all active:scale-95"
          >
            <ShoppingCart size={20} />
            SHOP ON BLINKIT
            <ExternalLink size={16} />
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map(item => {
            const isExpired = isPast(parseISO(item.expiryDate));
            
            return (
              <div key={item.id} className="bg-white p-5 rounded-[2.5rem] soft-shadow flex gap-5 border border-slate-50 group hover:border-indigo-100 transition-colors">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex-shrink-0 p-3 soft-shadow group-hover:scale-105 transition-transform">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-black text-slate-900 truncate tracking-tight">{item.name}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.brand}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full ${isExpired ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                      <Calendar size={12} />
                      <span>{isExpired ? 'Expired' : `Exp: ${item.expiryDate}`}</span>
                    </div>
                    {isExpired && (
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between py-1">
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-2.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                  <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl soft-shadow">
                    x{item.quantity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
