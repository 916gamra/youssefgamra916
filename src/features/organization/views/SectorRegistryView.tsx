import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Plus, Trash2, Edit3, Save, X, Search, Activity, Users, Cpu } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { GlassCard } from '@/shared/components/GlassCard';
import { cn } from '@/shared/utils';

export function SectorRegistryView() {
  const { sectors, machines, technicians, createSector, updateSector, deleteSector } = useOrganizationEngine();
  const { showSuccess, showError } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const filteredSectors = sectors.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      if (editingId) {
        await updateSector(editingId, { name, description });
        showSuccess('Zone Updated', `${name} parameters adjusted.`);
      } else {
        await createSector(name, description);
        showSuccess('Zone Initialized', `${name} is active.`);
      }
      handleCancel();
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const handleEdit = (sector: any) => {
    setEditingId(sector.id);
    setName(sector.name);
    setDescription(sector.description || '');
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const hasMachines = machines.some(m => m.sectorId === id);
    const hasTechs = technicians.some(t => t.sectorId === id);
    
    if (hasMachines || hasTechs) {
      showError('Constraint Violation', 'Cannot delete zone containing active machines or personnel. Reassign them first.');
      return;
    }

    if (window.confirm(`Decommission Zone: ${name}?`)) {
      try {
        await deleteSector(id);
        showSuccess('Zone Decommissioned', `${name} has been removed.`);
      } catch (err: any) {
        showError('Action Failed', err.message);
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setDescription('');
  };

  return (
    <div className="w-full space-y-8 pb-12 px-4 relative z-10 lg:px-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <Network className="w-8 h-8 text-indigo-500" /> Production Zones
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">Macro-Level Facility Organization & Area Management.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <StatCompact icon={<Network className="w-4 h-4 text-indigo-500" />} label="Zones" value={sectors.length.toString()} />
          <StatCompact icon={<Cpu className="w-4 h-4 text-cyan-500" />} label="Machines" value={machines.length.toString()} />
          <StatCompact icon={<Users className="w-4 h-4 text-emerald-500" />} label="Personnel" value={technicians.length.toString()} />
        </div>
      </header>
      
      <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl h-full flex flex-col">
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Network className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Zone Directory</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Sector Registry</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search zones..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="titan-input py-2.5 pl-11 pr-3 w-48 shadow-none"
              />
            </div>
            {!isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="titan-button titan-button-primary bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0 !py-2.5"
              >
                <Plus className="w-4 h-4" /> Initialize Zone
              </button>
            )}
          </div>
        </div>

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="border-b border-white/5 bg-white/[0.02]"
          >
            <div className="p-8 relative">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> {editingId ? 'Reconfigure Zone Parameters' : 'Deploy New Zone'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Zone Designation</label>
                    <input 
                      required 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., PACKAGING SECTOR A" 
                      className="titan-input py-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Operational Directive (Optional)</label>
                    <input 
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Primary bottling line and secondary packaging." 
                      className="titan-input py-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="titan-button titan-button-outline !px-6"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit" 
                    className="titan-button titan-button-primary bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] !px-8"
                  >
                    <Save className="w-4 h-4" /> {editingId ? 'Commit Changes' : 'Initialize'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        <div className="flex-1 bg-black/10 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSectors.map((sector) => {
                const zoneTechs = technicians.filter(t => t.sectorId === sector.id).length;
                const zoneMachines = machines.filter(m => m.sectorId === sector.id).length;
                
                return (
                  <motion.div 
                    key={sector.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="titan-card overflow-hidden flex flex-col group relative shadow-2xl p-0 hover:border-indigo-500/30 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                    
                    <div className="p-6 relative z-10 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <Network className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white tracking-tight uppercase">{sector.name}</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold mt-0.5">ID: {sector.id.substring(0, 8)}</p>
                          </div>
                        </div>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-300 gap-1 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-lg">
                          <button 
                            onClick={() => handleEdit(sector)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Edit Zone"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(sector.id, sector.name)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                            title="Decommission Zone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-400 font-medium line-clamp-2 h-8 leading-relaxed">
                        {sector.description || 'No direct operational parameters defined. Following universal factory protocol.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-white/5 bg-white/[0.02] border-t border-white/5 mt-auto relative z-10">
                      <div className="p-4 flex flex-col items-center justify-center gap-1 group/stat hover:bg-white/[0.02] transition-colors">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-500/70 group-hover/stat:text-emerald-400 transition-colors" /> Staff
                        </div>
                        <span className="text-lg font-bold font-mono text-slate-200">{zoneTechs}</span>
                      </div>
                      <div className="p-4 flex flex-col items-center justify-center gap-1 group/stat hover:bg-white/[0.02] transition-colors">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                           <Cpu className="w-3.5 h-3.5 text-cyan-500/70 group-hover/stat:text-cyan-400 transition-colors" /> Machines
                        </div>
                        <span className="text-lg font-bold font-mono text-slate-200">{zoneMachines}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredSectors.length === 0 && !isAdding && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                <Network className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No Zones Registered</p>
                <p className="text-xs text-slate-500 mt-2">Initialize the first production zone to continue.</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
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

