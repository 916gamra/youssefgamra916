import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Factory, Cpu, Hash, X, Wrench, Layers } from 'lucide-react';
import { GlassCard } from '@/shared/components/GlassCard';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { usePdrLibrary } from '@/features/pdr-engine/hooks/usePdrLibrary';
import { useTabStore } from '@/app/store';
import { PdrCard } from '@/features/pdr-engine/components/PdrCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

export function MachineDetailsView({ tabId }: { tabId: string }) {
  const machineId = tabId.replace('machine-detail:', '');
  const { machines } = useOrganizationEngine();
  const { blueprints, getMachineBOM, templates } = usePdrLibrary();
  const { openTab } = useTabStore();
  
  const machine = machines.find(m => m.id === machineId);
  const machineParts = getMachineBOM(machineId) || [];

  if (!machine) {
    return <div className="p-8 text-slate-400">Loading Digital Twin...</div>;
  }

  const openPartDetail = (blueprintId: string, reference: string) => {
    openTab({
      id: `part-detail:${blueprintId}`,
      portalId: 'PDR',
      title: `Part: ${reference}`,
      component: 'part-detail'
    });
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-auto flex flex-col gap-6 relative z-10 pb-12 lg:px-8 pt-4"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-start justify-between gap-6 shrink-0 relative">
        <div className="absolute -top-20 -left-10 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex gap-6 items-start relative z-10">
           <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
             <Cpu className="w-10 h-10 text-indigo-400" />
           </div>
           <div>
             <div className="flex items-center gap-3 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Digital Twin</span>
             </div>
             <h1 className="text-4xl font-bold text-slate-100 tracking-tight uppercase truncate max-w-2xl">{machine.name}</h1>
             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2 font-mono text-indigo-400/80">Ref: {machine.referenceCode}</p>
           </div>
        </div>

        <button 
           onClick={() => openTab({ id: 'machine-registry', portalId: 'FACTORY', title: 'Machine Registry', component: 'machine-registry' })}
           className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all absolute top-0 right-0 sm:relative z-10"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.header>

      {/* Machine Tech Specs / Metadata Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <GlassCard className="p-4 border-l-2 border-l-indigo-500 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Factory className="w-5 h-5 text-indigo-400" />
              <div>
                 <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Sector</span>
                 <span className="text-sm font-bold text-white uppercase">{machine.sectorName}</span>
                 {machine.managerName && (
                   <span className="block text-[9px] uppercase tracking-widest text-indigo-400 font-bold mt-1.5 flex items-center gap-1">
                     <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                     {machine.managerName}
                   </span>
                 )}
              </div>
            </div>
         </GlassCard>
         <GlassCard className="p-4 border-l-2 border-l-indigo-500 flex items-center gap-4">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
               <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Family</span>
               <span className="text-sm font-bold text-white uppercase">{machine.familyName}</span>
            </div>
         </GlassCard>
         <GlassCard className="p-4 border-l-2 border-l-indigo-500 flex items-center gap-4">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <div>
               <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Template</span>
               <span className="text-sm font-bold text-white uppercase">{machine.templateName}</span>
            </div>
         </GlassCard>
         <GlassCard className="p-4 border-l-2 border-l-emerald-500 flex items-center gap-4">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <div>
               <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">BOM Count</span>
               <span className="text-sm font-bold text-emerald-400 uppercase">{machineParts.length} Parts</span>
            </div>
         </GlassCard>
      </motion.div>

      {/* SPARE PARTS RADAR */}
      <motion.div variants={itemVariants} className="flex-1 mt-4">
         <div className="flex items-center gap-3 mb-6">
            <Hash className="w-6 h-6 text-cyan-500" />
            <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Spare Parts Radar</h2>
         </div>

         {machineParts.length === 0 ? (
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center border-dashed border-white/10">
               <Wrench className="w-12 h-12 text-slate-600 mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest">No Parts Linked</p>
               <p className="text-slate-500 text-sm mt-2">Use the Machine Registry bom configuration tool to link blueprints.</p>
            </GlassCard>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {machineParts.map(part => {
                 const partTemplate = templates.find(t => t.id === part.templateId);
                 return (
                  <PdrCard 
                    key={part.id} 
                    onClick={() => openPartDetail(part.id, part.reference)} 
                    className="flex flex-row items-center justify-between group overflow-hidden relative border border-white/5 transition-all duration-500 hover:border-y-cyan-500/30 hover:border-r-cyan-500/30 hover:shadow-[0_15px_40px_-10px_rgba(6,182,212,0.2)] hover:bg-cyan-500/[0.03] border-l-4 border-l-cyan-500 p-4 shrink-0"
                  >
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform border border-cyan-500/20">
                          <Hash className="w-4 h-4 text-cyan-400" />
                       </div>
                       <div>
                          <h3 className="text-sm font-mono font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{part.reference}</h3>
                          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-0.5 block truncate max-w-[120px]">{partTemplate?.name || 'Component'}</span>
                       </div>
                     </div>
                  </PdrCard>
                 );
               })}
            </div>
         )}
      </motion.div>
    </motion.div>
  );
}
