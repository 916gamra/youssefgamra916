import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Factory, Cpu, Plus, X, Search, Activity, Box, Tag } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { cn } from '@/shared/utils';

export function MachineRegistryView() {
  const { machines, sectors, createMachine } = useOrganizationEngine();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [family, setFamily] = useState('');
  const [template, setTemplate] = useState('');

  const filteredMachines = useMemo(() => {
    if (!searchTerm) return machines;
    const lower = searchTerm.toLowerCase();
    return machines.filter(m => 
      m.name.toLowerCase().includes(lower) || 
      m.referenceCode.toLowerCase().includes(lower) ||
      m.sectorName.toLowerCase().includes(lower)
    );
  }, [machines, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !referenceCode || !sectorId || !family || !template) return;
    
    await createMachine(name, sectorId, family, template, referenceCode);
    
    // Reset and close
    setName('');
    setReferenceCode('');
    setSectorId('');
    setFamily('');
    setTemplate('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2 flex items-center gap-3">
            <Factory className="w-8 h-8 text-fuchsia-400" /> Machine Registry
          </h1>
          <p className="text-[var(--text-dim)] text-lg">Digital Twin Hub: Register and monitor physical assets across sectors.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input 
              type="text" 
              placeholder="Search machines..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/20 border border-[var(--glass-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-bright)] focus:outline-none focus:border-fuchsia-500/50 transition-all w-64"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Enregistrer une Machine
          </button>
        </div>
      </header>

      {/* Machines Grid */}
      {filteredMachines.length === 0 ? (
         <div className="p-16 text-center border border-[var(--glass-border)] rounded-2xl bg-white/[0.02]">
            <Cpu className="w-16 h-16 text-[var(--text-dim)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-[var(--text-bright)] mb-2">No Machines Registered.</h3>
            <p className="text-[var(--text-dim)]">Create your first digital twin to connect assets to their sectors.</p>
            <button
               onClick={() => setIsModalOpen(true)}
               className="mt-6 px-6 py-2 rounded-full border border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/10 transition-colors"
            >
               + Register Machine
            </button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMachines.map((machine, idx) => (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <GlassCard className="relative overflow-hidden group h-full flex flex-col hover:border-fuchsia-500/30 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl group-hover:bg-fuchsia-500/10 transition-colors" />
                  
                  <div className="mb-4">
                    <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-fuchsia-300 mb-3 block w-fit">
                      {machine.referenceCode}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-bright)] leading-tight mb-1">{machine.name}</h3>
                    <p className="text-sm font-medium text-[var(--accent)] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> Sector: {machine.sectorName}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-[var(--glass-border)] flex items-center justify-between text-xs text-[var(--text-dim)]">
                    <div className="flex items-center gap-1.5" title="Family">
                      <Box className="w-3.5 h-3.5" />
                      {machine.family}
                    </div>
                    <div className="flex items-center gap-1.5" title="Template">
                      <Tag className="w-3.5 h-3.5" />
                      {machine.template}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Machine Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-base)]/90 backdrop-blur-2xl border border-[var(--glass-border)] border-t-fuchsia-500/30 shadow-2xl rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-[var(--text-bright)] flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-fuchsia-400" />
                    Register New Asset
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-dim)] hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-semibold text-[var(--text-dim)] tracking-wider">Asset Name</label>
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Main Conveyor Belt"
                        className="w-full bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-fuchsia-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-semibold text-[var(--text-dim)] tracking-wider">Reference Code</label>
                      <input 
                        type="text" required value={referenceCode} onChange={e => setReferenceCode(e.target.value)}
                        placeholder="e.g. CVY-001"
                        className="w-full bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-bright)] focus:border-fuchsia-500/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-semibold text-[var(--text-dim)] tracking-wider">Operating Sector</label>
                    <select
                      required value={sectorId} onChange={e => setSectorId(e.target.value)}
                      className="w-full bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-fuchsia-500/50 outline-none appearance-none"
                    >
                      <option value="" disabled>Assign to a physical sector...</option>
                      {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-semibold text-[var(--text-dim)] tracking-wider">Equipment Family</label>
                      <input 
                        type="text" required value={family} onChange={e => setFamily(e.target.value)}
                        placeholder="e.g. Pompes"
                        className="w-full bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-fuchsia-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase font-semibold text-[var(--text-dim)] tracking-wider">Template / Type</label>
                      <input 
                        type="text" required value={template} onChange={e => setTemplate(e.target.value)}
                        placeholder="e.g. Centrifuge"
                        className="w-full bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-fuchsia-500/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-[var(--glass-border)] text-[var(--text-dim)] hover:text-white transition-colors font-medium text-sm">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-medium text-sm shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all flex items-center gap-2">
                       <Cpu className="w-4 h-4"/> Confirm Registration
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
