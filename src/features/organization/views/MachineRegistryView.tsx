import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Factory, Cpu, Plus, X, Search, Activity, Box, Tag, Trash2, Edit3, Save, Wrench } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { MachineBomModal } from '../components/MachineBomModal';
import { cn } from '@/shared/utils';

export function MachineRegistryView() {
  const { machines, sectors, createMachine, updateMachine, deleteMachine } = useOrganizationEngine();
  const { showSuccess, showError } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMachineForBom, setSelectedMachineForBom] = useState<{ id: string, name: string } | null>(null);

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
    
    try {
      if (editingId) {
        await updateMachine(editingId, { name, sectorId, family, template, referenceCode });
        showSuccess('Machine Updated', `${name} digital twin updated.`);
      } else {
        await createMachine(name, sectorId, family, template, referenceCode);
        showSuccess('Machine Created', `${name} added to the registry.`);
      }
      
      handleClose();
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const handleEdit = (machine: any) => {
    setEditingId(machine.id);
    setName(machine.name);
    setReferenceCode(machine.referenceCode);
    setSectorId(machine.sectorId);
    setFamily(machine.family);
    setTemplate(machine.template);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Decommission machine ${name}? This action is irreversible.`)) {
      await deleteMachine(id);
      showSuccess('Machine Removed', `${name} has been decommissioned.`);
    }
  };

  const handleClose = () => {
    setEditingId(null);
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
          <h1 className="text-3xl font-bold text-[var(--text-bright)] tracking-tighter mb-2 flex items-center gap-3 italic uppercase">
            <Factory className="w-8 h-8 text-fuchsia-400" /> Machine Registry
          </h1>
          <p className="text-[var(--text-dim)] text-lg italic font-medium">Digital Twin Hub: Register and monitor physical assets across sectors.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-[var(--glass-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-bright)] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 transition-all w-64 shadow-inner"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Asset
          </button>
        </div>
      </header>

      {/* Machines Grid */}
      {filteredMachines.length === 0 ? (
         <div className="p-16 text-center border border-[var(--glass-border)] rounded-2xl bg-white/[0.02]">
            <Cpu className="w-16 h-16 text-[var(--text-dim)] mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-medium text-[var(--text-bright)] mb-2 italic">Null Results Detected</h3>
            <p className="text-[var(--text-dim)]">No assets matching your query or registry is empty.</p>
            <button
               onClick={() => setIsModalOpen(true)}
               className="mt-6 px-6 py-2 rounded-full border border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/10 transition-colors uppercase tracking-[0.2em] text-[9px] font-black"
            >
               + Sync First Machine
            </button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMachines.map((machine, idx) => (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
              >
                <GlassCard className="relative overflow-hidden group h-full flex flex-col hover:border-fuchsia-500/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl group-hover:bg-fuchsia-500/10 transition-colors pointer-events-none" />
                  
                  <div className="mb-4 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono font-bold text-fuchsia-300 tracking-[0.2em] shadow-sm">
                        {machine.referenceCode}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedMachineForBom({ id: machine.id, name: machine.name })}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/10 transition-all"
                          title="BOM Configuration"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(machine)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(machine.id, machine.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/50 hover:text-red-400 transition-colors border border-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-bright)] leading-none mb-1.5 italic tracking-tighter uppercase truncate">{machine.name}</h3>
                    <p className="text-xs font-semibold text-[var(--accent)] flex items-center gap-1.5 opacity-80 uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5" /> {machine.sectorName}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest relative z-10">
                    <div className="flex items-center gap-1.5" title="Family">
                      <Box className="w-3.5 h-3.5 text-white/20" />
                      <span className="truncate max-w-[80px]">{machine.family}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Template">
                      <Tag className="w-3.5 h-3.5 text-white/20" />
                      <span className="truncate max-w-[80px]">{machine.template}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Machine Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
               onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-[#050508] border border-white/10 border-t-fuchsia-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
              
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-white flex items-center gap-3 italic uppercase tracking-tighter">
                    <Cpu className="w-6 h-6 text-fuchsia-400" />
                    {editingId ? 'Modify Digital Twin' : 'Register New Asset'}
                  </h3>
                  <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/5 text-[var(--text-dim)] hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-[0.2em] ml-1">Asset Identity</label>
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Turbine X-400"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-[0.2em] ml-1">Serial/Ref Code</label>
                      <input 
                        type="text" required value={referenceCode} onChange={e => setReferenceCode(e.target.value)}
                        placeholder="e.g. SN-99-01"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3 text-sm font-mono text-fuchsia-300 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-[0.2em] ml-1">Operational Sector</label>
                    <select
                      required value={sectorId} onChange={e => setSectorId(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-fuchsia-500/50 outline-none appearance-none transition-all cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#050508]">Select primary sector...</option>
                      {sectors.map(s => <option key={s.id} value={s.id} className="bg-[#050508]">{s.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-[0.2em] ml-1">Classification (Family)</label>
                      <input 
                        type="text" required value={family} onChange={e => setFamily(e.target.value)}
                        placeholder="e.g. Hydraulic"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-fuchsia-500/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-[0.2em] ml-1">Model (Template)</label>
                      <input 
                        type="text" required value={template} onChange={e => setTemplate(e.target.value)}
                        placeholder="e.g. Standard V2"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-fuchsia-500/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-4">
                    <button type="button" onClick={handleClose} className="px-6 py-3 rounded-2xl border border-white/5 text-[var(--text-dim)] hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest">
                      Abort
                    </button>
                    <button type="submit" className="px-8 py-3 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(217,70,239,0.3)] hover:shadow-[0_15px_40px_rgba(217,70,239,0.5)] transition-all flex items-center gap-3">
                       <Save className="w-4 h-4"/> {editingId ? 'Push Update' : 'Apply Registration'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMachineForBom && (
          <MachineBomModal 
            machineId={selectedMachineForBom.id}
            machineName={selectedMachineForBom.name}
            onClose={() => setSelectedMachineForBom(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
