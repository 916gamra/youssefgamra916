import React from 'react';
import { ExcelManager } from '@/shared/components/ExcelManager';
import { FileSpreadsheet, ShieldCheck, Download, Upload } from 'lucide-react';
import { motion } from 'motion/react';

export function ShieldExcelHubView() {
  return (
    <div className="w-full h-full flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar bg-[#0a0a0f]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto w-full"
      >
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic">
              <FileSpreadsheet className="w-10 h-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              INTEGRATION HUB
            </h1>
            <p className="text-[#8b9bb4] uppercase tracking-[0.3em] text-[10px] mt-4 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
              Universal Data Mapping & Synchronization
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner flex items-center gap-4 group hover:border-emerald-500/30 transition-all cursor-default overflow-hidden relative">
                <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <Download className="w-5 h-5 text-emerald-500 opacity-60" />
                <div>
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Format</span>
                   <span className="text-white font-mono text-xs">XLSX / CSV</span>
                </div>
             </div>
             <div className="bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner flex items-center gap-4 group hover:border-cyan-500/30 transition-all cursor-default overflow-hidden relative">
                <div className="absolute inset-0 bg-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <Upload className="w-5 h-5 text-cyan-500 opacity-60" />
                <div>
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Status</span>
                   <span className="text-white font-mono text-xs">Ready</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-1 space-y-6">
              <div className="titan-card p-6 bg-emerald-500/[0.02] border-emerald-500/20">
                 <h3 className="text-xs font-black text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Shield Protocol
                 </h3>
                 <p className="text-[11px] text-[#8b9bb4] italic leading-relaxed">
                    Import master schedules and historical work orders. Ensure columns match the tactical schema for successful synchronization.
                 </p>
              </div>
              
              <div className="titan-card p-6 bg-white/[0.01]">
                 <h4 className="text-[10px] font-black text-white/40 mb-3 uppercase tracking-widest">Supported Entities</h4>
                 <div className="space-y-2">
                    {['PM Schedules', 'Protocol Checklists', 'Machine Blueprints', 'Asset History'].map(entity => (
                      <div key={entity} className="flex items-center gap-2 text-[10px] font-bold text-[#8b9bb4]">
                         <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                         {entity}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-3">
              <div className="titan-card p-0 overflow-hidden bg-black/40 border-white/10 group min-h-[500px]">
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                   <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Data Management Terminal</span>
                   <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/60 transition-all duration-700" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-all duration-700 delay-100" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-700 delay-200" />
                   </div>
                </div>
                <div className="p-8">
                  <ExcelManager portalId="ShieldOps" />
                </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

