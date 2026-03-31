import React from 'react';
import { PantryItem } from '../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { isPast, parseISO, differenceInDays } from 'date-fns';
import { AlertCircle, TrendingUp, Heart, Trash2 } from 'lucide-react';

interface DashboardProps {
  items: PantryItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  // Healthy vs Unhealthy (based on Nutri-Score A/B vs others)
  const healthyCount = items.filter(i => ['a', 'b'].includes(i.nutritionGrade.toLowerCase())).length;
  const unhealthyCount = items.length - healthyCount;
  const healthScore = items.length > 0 ? Math.round((healthyCount / items.length) * 100) : 0;
  const wasteSaved = (items.length * 0.45).toFixed(1);

  const pieData = [
    { name: 'Healthy', value: healthyCount || 1, color: '#10B981' },
    { name: 'Unhealthy', value: unhealthyCount || (items.length === 0 ? 0 : 0.1), color: '#EF4444' }
  ];

  // Expiring soon
  const expiringSoon = items
    .filter(i => {
      const days = differenceInDays(parseISO(i.expiryDate), new Date());
      return days >= 0 && days <= 7;
    })
    .sort((a, b) => parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime());

  // Projected Waste Saved (Mock logic for demo)
  const lineData = [
    { name: 'Week 1', saved: Math.max(0, items.length - 10) },
    { name: 'Week 2', saved: Math.max(0, items.length - 5) },
    { name: 'Week 3', saved: Math.max(0, items.length - 2) },
    { name: 'Week 4', saved: items.length },
  ];

  return (
    <div className="p-6 space-y-8 pb-32 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Impact</h1>
        <p className="text-slate-500 font-medium">Your health and sustainability journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-indigo-600 text-white rounded-[2.5rem] soft-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={64} />
          </div>
          <TrendingUp size={24} className="mb-4" />
          <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">Waste Saved</p>
          <p className="text-3xl font-black">{wasteSaved}<span className="text-lg opacity-80 ml-1">kg</span></p>
        </div>
        <div className="p-6 bg-emerald-500 text-white rounded-[2.5rem] soft-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Heart size={64} />
          </div>
          <Heart size={24} className="mb-4" />
          <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mb-1">Health Score</p>
          <p className="text-3xl font-black">{healthScore}<span className="text-lg opacity-80 ml-1">%</span></p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border-0 soft-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Pantry Health</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Healthy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Unhealthy</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-0 soft-shadow">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight mb-6">Prevention Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saved" 
                  stroke="#4F46E5" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={16} />
            Critical Expiry
          </h3>
          <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-full uppercase tracking-tighter">
            Next 7 Days
          </span>
        </div>
        <div className="space-y-3">
          {expiringSoon.length > 0 ? (
            expiringSoon.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-[2rem] soft-shadow border border-slate-50">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl p-2 flex-shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-amber-600 font-bold">Expires in {differenceInDays(parseISO(item.expiryDate), new Date())} days</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
            ))
          ) : (
            <div className="p-8 bg-slate-50 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-bold italic">All items are fresh!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
