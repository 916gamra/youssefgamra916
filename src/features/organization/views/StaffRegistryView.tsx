import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, UserCircle2, Pocket, Fingerprint, Lock } from 'lucide-react';
import { GlassCard } from '@/shared/components/GlassCard';
import { useAuthSlots } from '@/features/auth/hooks/useAuthSlots';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

export function StaffRegistryView() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const allSlots = useAuthSlots();
  const activeTechnicians = allSlots.filter(s => s.id.startsWith('TC') && s.isActive);

  const filteredStaff = activeTechnicians.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.realBadgeId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col gap-6 relative z-10"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <Users className="w-8 h-8 text-indigo-500" /> Operational Staff
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">Active Maintenance Personnel Directory.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <StatCompact icon={<Users className="w-4 h-4 text-indigo-500" />} label="Total Slots" value="10" />
          <StatCompact icon={<UserCircle2 className="w-4 h-4 text-emerald-500" />} label="Active Personnel" value={activeTechnicians.length.toString()} />
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="flex-1 min-h-0 flex flex-col">
        <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl h-full flex flex-col">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Staff Directory</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Personnel Registry</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search personnel..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="titan-input py-2.5 pl-11 pr-3 w-64 shadow-none"
                />
              </div>
              <div className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold uppercase flex items-center gap-2">
                <Lock className="w-3 h-3" /> Managed in System Config
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-black/10 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredStaff.map((tech) => (
                    <motion.div 
                      key={tech.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="titan-card overflow-hidden flex flex-col group relative shadow-2xl p-0 hover:border-indigo-500/30 transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                      
                      {/* ID Header Plaque */}
                      <div className="flex justify-between items-center bg-white/[0.02] p-4 border-b border-white/5 relative z-10">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                           <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">{tech.id}</span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col items-center text-center relative z-10 flex-1">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-semibold shadow-[inset_0_0_20px_rgba(14,165,233,0.15)] group-hover:scale-105 transition-transform duration-500 text-white ${tech.color} bg-opacity-20 border border-white/10 mb-5`}>
                          {tech.initials}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white tracking-wide mb-2 uppercase">{tech.name}</h3>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-400/90 mb-5 bg-indigo-500/10 px-3 py-1.5 rounded-md border border-indigo-500/20 uppercase tracking-widest font-bold">
                          <Pocket className="w-3.5 h-3.5" />
                          <span>Technical Execution</span>
                        </div>
                        
                        <div className="w-full bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col gap-2 mt-auto text-left">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-1.5">
                            <Fingerprint className="w-3.5 h-3.5 text-emerald-500" /> Physical Badge ID
                          </span>
                          <div className="text-sm font-bold text-slate-200 font-mono uppercase tracking-tight">
                             {tech.realBadgeId || 'NOT CONFIGURED'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
              {filteredStaff.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <Users className="w-12 h-12 text-slate-600 mb-4" />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No Active Personnel</p>
                  <p className="text-xs text-slate-500 mt-2">Active slots list is currently empty.</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function StatCompact({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-base font-bold text-white -mt-0.5">{value}</span>
      </div>
    </div>
  );
}

