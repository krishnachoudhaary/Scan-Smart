import React, { useState } from 'react';
import { Product } from '../types';
import { storage } from '../lib/storage';
import { X, Save, PackagePlus } from 'lucide-react';
import { motion } from 'motion/react';

interface DiscoveryModalProps {
  barcode: string;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({ barcode, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    ingredients: '',
    nutritionGrade: 'c'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      barcode,
      name: formData.name,
      brand: formData.brand,
      ingredients: formData.ingredients,
      nutritionGrade: formData.nutritionGrade,
      ecoscore: 'unknown',
      imageUrl: 'https://images.unsplash.com/photo-1506617564039-2f3b650ad701?auto=format&fit=crop&q=80&w=800',
      novaScore: 0,
      additives: [],
      categories: []
    };
    
    storage.saveCommunityProduct(newProduct);
    onSaved(newProduct);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden soft-shadow border border-slate-50"
      >
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 text-white">
            <PackagePlus size={120} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <PackagePlus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-none">Product Not Found</h2>
              <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mt-1">Be the first to add it!</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barcode</p>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{barcode}</span>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Product Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border-0 font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="e.g. Organic Almond Milk"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Brand</label>
              <input 
                required
                type="text" 
                value={formData.brand}
                onChange={e => setFormData(d => ({ ...d, brand: e.target.value }))}
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border-0 font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="e.g. PureNature"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Ingredients</label>
              <textarea 
                required
                value={formData.ingredients}
                onChange={e => setFormData(d => ({ ...d, ingredients: e.target.value }))}
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border-0 font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none h-28 resize-none transition-all placeholder:text-slate-300"
                placeholder="List ingredients..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Nutrition Grade</label>
              <div className="relative">
                <select 
                  value={formData.nutritionGrade}
                  onChange={e => setFormData(d => ({ ...d, nutritionGrade: e.target.value }))}
                  className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border-0 font-bold text-slate-900 focus:ring-2 ring-indigo-500 outline-none appearance-none transition-all"
                >
                  <option value="a">Grade A (Excellent)</option>
                  <option value="b">Grade B (Good)</option>
                  <option value="c">Grade C (Average)</option>
                  <option value="d">Grade D (Poor)</option>
                  <option value="e">Grade E (Bad)</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <PackagePlus size={16} />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] soft-shadow flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700"
          >
            <Save size={20} strokeWidth={3} />
            CONTRIBUTE DATA
          </button>
        </form>
      </motion.div>
    </div>
  );
};
