import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Network, Plus, Trash2, Edit3, Save, X, Search, Activity, Users, Cpu } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';

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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3 uppercase">
            <Network className="w-8 h-8 text-indigo-500" /> Production Zones
          </h1>
          <p className="text-slate-400 text-lg font-bold opacity-80 uppercase tracking-widest text-[10px]">Macro-Level Facility Organization & Area Management</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search zones..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all w-64 shadow-inner"
            />
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]"
            >
              <Plus className="w-4 h-4" /> Initialize Zone
            </button>
          )}
        </div>
      </header>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-[#0a0f18] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> {editingId ? 'Reconfigure Zone Parameters' : 'Deploy New Zone'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Zone Designation</label>
                <input 
                  required 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., PACKAGING SECTOR A" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Operational Directive (Optional)</label>
                <input 
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Primary bottling line and secondary packaging." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-bold tracking-wider"
              >
                <X className="w-4 h-4" /> Abort
              </button>
              <button 
                type="submit" 
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] tracking-wider"
              >
                <Save className="w-4 h-4" /> {editingId ? 'Commit Changes' : 'Initialize'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSectors.map((sector) => {
          const zoneTechs = technicians.filter(t => t.sectorId === sector.id).length;
          const zoneMachines = machines.filter(m => m.sectorId === sector.id).length;
          
          return (
            <motion.div 
              key={sector.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col group relative"
            >
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Network className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-mono tracking-wide">{sector.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Zone ID: {sector.id.substring(0, 8)}</p>
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
                
                <p className="text-xs text-slate-400 font-medium line-clamp-2 h-8">
                  {sector.description || 'No direct operational parameters defined. Following universal factory protocol.'}
                </p>
              </div>

              {/* Status Footer */}
              <div className="grid grid-cols-2 divide-x divide-white/10 bg-black/20 mt-auto">
                <div className="p-4 flex flex-col items-center justify-center gap-1 group/stat hover:bg-white/[0.02] transition-colors">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                    <Users className="w-3 h-3 group-hover/stat:text-indigo-400" /> Assigned Personnel
                  </div>
                  <span className="text-xl font-bold font-mono text-slate-200">{zoneTechs}</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center gap-1 group/stat hover:bg-white/[0.02] transition-colors">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                     <Cpu className="w-3 h-3 group-hover/stat:text-indigo-400" /> Active Machines
                  </div>
                  <span className="text-xl font-bold font-mono text-slate-200">{zoneMachines}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredSectors.length === 0 && !isAdding && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <Network className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No Zones Registered</p>
            <p className="text-xs text-slate-500 mt-2">Initialize the first production zone to continue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
