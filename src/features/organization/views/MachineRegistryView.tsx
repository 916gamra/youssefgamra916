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
          <h1 className="text-3xl font-bold text-[var(--text-bright)] tracking-tight mb-2 flex items-center gap-3 uppercase">
            <Factory className="w-8 h-8 text-blue-500" /> Machine Registry
          </h1>
          <p className="text-[var(--text-dim)] text-lg font-medium opacity-80">Digital Twin Hub: Register and monitor physical assets across sectors.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-[var(--glass-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-bright)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all w-64 shadow-inner"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_15px_rgba(37,99,235,0.3)] shrink-0"
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
            <h3 className="text-xl font-medium text-[var(--text-bright)] mb-2">Null Results Detected</h3>
            <p className="text-[var(--text-dim)]">No assets matching your query or registry is empty.</p>
            <button
               onClick={() => setIsModalOpen(true)}
               className="mt-6 px-6 py-2 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors uppercase tracking-widest text-[10px] font-bold"
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
              >
                <GlassCard className="relative overflow-hidden group h-full flex flex-col hover:border-blue-500/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
                  
                  <div className="mb-4 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono font-bold text-blue-400 tracking-wider shadow-sm">
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
                    <h3 className="text-lg font-bold text-[var(--text-bright)] leading-none mb-1.5 tracking-tight uppercase truncate">{machine.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                      <Activity className="w-3.5 h-3.5 opacity-40" /> {machine.sectorName}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#14161f] border border-white/10 shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-tight">
                    <Cpu className="w-6 h-6 text-blue-500" />
                    {editingId ? 'Modify digital twin' : 'Register new asset'}
                  </h3>
                  <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/5 text-[var(--text-dim)] hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-[0.2em] ml-1">Asset Identity</label>
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Turbine X-400"
                        className="titan-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-[0.2em] ml-1">Serial/Ref Code</label>
                      <input 
                        type="text" required value={referenceCode} onChange={e => setReferenceCode(e.target.value)}
                        placeholder="e.g. SN-99-01"
                        className="titan-input font-mono text-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-[0.2em] ml-1">Operational Sector</label>
                    <select
                      required value={sectorId} onChange={e => setSectorId(e.target.value)}
                      className="titan-input appearance-none transition-all cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#14161f]">Select primary sector...</option>
                      {sectors.map(s => <option key={s.id} value={s.id} className="bg-[#14161f]">{s.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-[0.2em] ml-1">Classification (Family)</label>
                      <input 
                        type="text" required value={family} onChange={e => setFamily(e.target.value)}
                        placeholder="e.g. Hydraulic"
                        className="titan-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-[0.2em] ml-1">Model (Template)</label>
                      <input 
                        type="text" required value={template} onChange={e => setTemplate(e.target.value)}
                        placeholder="e.g. Standard V2"
                        className="titan-input"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-4">
                    <button type="button" onClick={handleClose} className="px-6 py-2.5 rounded-xl border border-white/5 text-[var(--text-dim)] hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest text-[#94a3b8]">
                      Abort
                    </button>
                    <button type="submit" className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-3">
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
