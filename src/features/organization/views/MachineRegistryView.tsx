import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Factory, Cpu, Plus, X, Search, Activity, Box, Tag, Trash2, Edit3, Save, Wrench } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { MachineBomModal } from '../components/MachineBomModal';
import { cn } from '@/shared/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-8 pb-12 px-4 relative z-10 lg:px-8"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <Factory className="w-8 h-8 text-indigo-500" /> Machine Registry
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">Digital Twin Hub: Register and monitor physical assets across sectors.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <StatCompact icon={<Factory className="w-4 h-4 text-indigo-500" />} label="Total Machines" value={machines.length.toString()} />
          <StatCompact icon={<Cpu className="w-4 h-4 text-emerald-500" />} label="Monitored" value={machines.length.toString()} />
        </div>
      </motion.header>

      <motion.div variants={itemVariants}>
        <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl h-full flex flex-col">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Machinary Directory</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Asset Overview</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="titan-input py-2.5 pl-11 pr-3 w-64 shadow-none"
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="titan-button titan-button-primary bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0 !py-2.5"
              >
                <Plus className="w-4 h-4" /> New Asset
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black/10 p-8">
            {filteredMachines.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                <Cpu className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest mb-2 mt-4">Null Results Detected</h3>
                <p className="text-slate-400 text-sm font-medium">No assets matching your query or registry is empty.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-8 px-6 py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors uppercase tracking-widest text-xs font-bold"
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
                      <GlassCard className="!p-0 relative overflow-hidden group h-full flex flex-col hover:border-indigo-500/30 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                        
                        <div className="p-6 relative z-10 flex-1">
                          <div className="flex justify-between items-start mb-5">
                            <span className="inline-block px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-[10px] font-mono font-bold text-indigo-400 tracking-widest shadow-sm">
                              {machine.referenceCode}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-lg">
                              <button 
                                onClick={() => setSelectedMachineForBom({ id: machine.id, name: machine.name })}
                                className="p-1.5 rounded-md hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                                title="BOM Configuration"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleEdit(machine)}
                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(machine.id, machine.name)}
                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                            <h3 className="text-xl font-bold text-slate-100 leading-none tracking-tight uppercase truncate">{machine.name}</h3>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest mt-3">
                            <Activity className="w-3.5 h-3.5 opacity-40 text-indigo-400" /> {machine.sectorName}
                          </p>
                        </div>
                        
                        <div className="mt-auto grid grid-cols-2 divide-x divide-white/5 border-t border-white/5 bg-white/[0.02] text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                          <div className="p-4 flex items-center gap-2 justify-center" title="Family">
                            <Box className="w-4 h-4 text-slate-500" />
                            <span className="truncate">{machine.family}</span>
                          </div>
                          <div className="p-4 flex items-center gap-2 justify-center" title="Template">
                            <Tag className="w-4 h-4 text-slate-500" />
                            <span className="truncate">{machine.template}</span>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

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
              className="relative w-full max-w-lg bg-[#0a0f18] border border-white/10 shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-tight">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-indigo-500" />
                    </div>
                    {editingId ? 'Modify Digital Twin' : 'Register New Asset'}
                  </h3>
                  <button onClick={handleClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Asset Identity</label>
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Turbine X-400"
                        className="titan-input py-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Serial/Ref Code</label>
                      <input 
                        type="text" required value={referenceCode} onChange={e => setReferenceCode(e.target.value)}
                        placeholder="e.g. SN-99-01"
                        className="titan-input font-mono text-indigo-400 py-3"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Operational Sector</label>
                    <select
                      required value={sectorId} onChange={e => setSectorId(e.target.value)}
                      className="titan-input appearance-none transition-all cursor-pointer py-3"
                    >
                      <option value="" disabled className="bg-[#14161f]">Select primary sector...</option>
                      {sectors.map(s => <option key={s.id} value={s.id} className="bg-[#14161f]">{s.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Classification (Family)</label>
                      <input 
                        type="text" required value={family} onChange={e => setFamily(e.target.value)}
                        placeholder="e.g. Hydraulic"
                        className="titan-input py-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Model (Template)</label>
                      <input 
                        type="text" required value={template} onChange={e => setTemplate(e.target.value)}
                        placeholder="e.g. Standard V2"
                        className="titan-input py-3"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                    <button type="button" onClick={handleClose} className="titan-button titan-button-outline !px-6 !py-2.5">
                      Abort
                    </button>
                    <button type="submit" className="titan-button titan-button-primary !px-8 !py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
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
