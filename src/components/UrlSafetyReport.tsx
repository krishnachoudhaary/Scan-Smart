import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { UrlSafetyResult } from '../types';

interface UrlSafetyReportProps {
  result: UrlSafetyResult;
  onClose: () => void;
}

export const UrlSafetyReport: React.FC<UrlSafetyReportProps> = ({ result, onClose }) => {
  const getRiskColor = () => {
    switch (result.riskLevel) {
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getRiskIcon = () => {
    switch (result.riskLevel) {
      case 'low': return <ShieldCheck className="text-emerald-500" size={32} />;
      case 'medium': return <AlertTriangle className="text-amber-500" size={32} />;
      case 'high': return <ShieldAlert className="text-red-500" size={32} />;
      default: return <Info className="text-slate-500" size={32} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-white rounded-[3rem] overflow-hidden soft-shadow flex flex-col max-h-[90vh]">
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-2xl text-indigo-600">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Truth Report</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {/* Risk Badge */}
          <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center text-center space-y-4 ${getRiskColor()}`}>
            {getRiskIcon()}
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Risk Assessment</p>
              <h3 className="text-3xl font-black capitalize">{result.riskLevel} Risk</h3>
            </div>
          </div>

          {/* URL Info */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Scanned Link</p>
            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-600 truncate flex-1">{result.url}</span>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white text-indigo-600 rounded-xl shadow-sm hover:scale-110 transition-all"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Info size={16} className="text-indigo-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Details</p>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
              {result.explanation}
            </p>
          </div>

          {/* Threats */}
          {result.threatType.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Potential Threats</p>
              <div className="flex flex-wrap gap-2">
                {result.threatType.map((threat, i) => (
                  <span key={i} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
                    {threat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommendation</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
              <p className="text-sm font-bold text-emerald-900">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-xl shadow-slate-200 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            Dismiss Report
          </button>
        </div>
      </div>
    </motion.div>
  );
};
