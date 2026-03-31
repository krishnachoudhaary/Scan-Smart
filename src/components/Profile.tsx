import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Shield, Plus, X, Heart } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const COMMON_RESTRICTIONS = [
  'Palm Oil',
  'Added Sugar',
  'Gluten',
  'Dairy',
  'Peanuts',
  'Soy',
  'High Fructose Corn Syrup',
  'MSG',
  'Artificial Colors'
];

export const Profile: React.FC<ProfileProps> = ({ profile, onUpdate }) => {
  const [newRestriction, setNewRestriction] = useState('');

  const addRestriction = (res: string) => {
    if (!res || profile.restrictions.includes(res)) return;
    onUpdate({
      ...profile,
      restrictions: [...profile.restrictions, res]
    });
    setNewRestriction('');
  };

  const removeRestriction = (res: string) => {
    onUpdate({
      ...profile,
      restrictions: profile.restrictions.filter(r => r !== res)
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto pb-32">
      <div className="flex items-center gap-6 p-6 bg-white rounded-[2.5rem] soft-shadow border border-slate-50">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white soft-shadow">
          <User size={40} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile</h1>
          <p className="text-slate-500 font-medium">Personalize your health experience</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield size={16} className="text-indigo-600" />
          <h2 className="font-black uppercase text-[10px] tracking-widest">Dietary Restrictions</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {profile.restrictions.map(res => (
            <span 
              key={res} 
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-xs font-black tracking-tight animate-in fade-in zoom-in duration-300 soft-shadow"
            >
              {res}
              <button onClick={() => removeRestriction(res)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={12} strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Add custom restriction..."
            value={newRestriction}
            onChange={e => setNewRestriction(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addRestriction(newRestriction)}
            className="flex-1 px-6 py-4 rounded-[1.5rem] border-0 bg-white soft-shadow focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm transition-all placeholder:text-slate-300"
          />
          <button 
            onClick={() => addRestriction(newRestriction)}
            className="p-4 bg-indigo-600 text-white rounded-[1.5rem] soft-shadow active:scale-95 transition-all"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_RESTRICTIONS.filter(r => !profile.restrictions.includes(r)).map(res => (
              <button 
                key={res}
                onClick={() => addRestriction(res)}
                className="px-4 py-2 bg-white border border-slate-100 text-slate-600 rounded-full text-[11px] font-black hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all soft-shadow"
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 space-y-3 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10 text-indigo-600">
          <Heart size={120} />
        </div>
        <div className="flex items-center gap-2 text-indigo-700 font-black uppercase text-[10px] tracking-widest">
          <Heart size={16} />
          <span>Health Tip</span>
        </div>
        <p className="text-sm text-indigo-900/70 font-bold leading-relaxed relative z-10">
          ScanSmart helps you identify hidden ingredients. Always check the "Reality" view for NOVA processing levels!
        </p>
      </div>
    </div>
  );
};
