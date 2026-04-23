import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Hash, Search, Plus, Filter, Database, FileText, Settings2, BarChart2, Info } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { useNotifications } from '@/shared/hooks/useNotifications';

export function PartMasterView() {
  const blueprints = useLiveQuery(() => db.pdrBlueprints.toArray());
  const templates = useLiveQuery(() => db.pdrTemplates.toArray());
  const families = useLiveQuery(() => db.pdrFamilies.toArray());
  const { showSuccess, showError } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [newBlueprintRef, setNewBlueprintRef] = useState('');
  const [newBlueprintUnit, setNewBlueprintUnit] = useState('Pcs');
  const [newBlueprintThreshold, setNewBlueprintThreshold] = useState('10');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const filteredBlueprints = useMemo(() => {
    if (!blueprints) return [];
    return blueprints.filter(b => b.reference.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [blueprints, searchTerm]);

  const handleCreateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlueprintRef || !selectedTemplateId) return;
    try {
      await db.pdrBlueprints.add({
        id: crypto.randomUUID(),
        templateId: selectedTemplateId,
        reference: newBlueprintRef.toUpperCase(),
        unit: newBlueprintUnit,
        minThreshold: parseInt(newBlueprintThreshold) || 0,
        createdAt: new Date().toISOString()
      });
      setNewBlueprintRef('');
      setIsAdding(false);
      showSuccess('Master Blueprint Created', `Ref: ${newBlueprintRef.toUpperCase()} successfully initialized.`);
    } catch (err: any) {
      showError('System Error', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3 uppercase">
            <Database className="w-8 h-8 text-amber-500" /> Part Master Catalog
          </h1>
          <p className="text-slate-400 text-lg font-bold uppercase tracking-widest text-[10px] opacity-80">
            Central repository for exact engineering specifications and digital twins.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reference..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all w-64 shadow-inner"
            />
          </div>
          <button className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
            >
              <Plus className="w-4 h-4" /> Draft Blueprint
            </button>
          )}
        </div>
      </header>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20, height: 0 }} 
          animate={{ opacity: 1, y: 0, height: 'auto' }} 
          className="bg-[#0a0f18] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-amber-400" /> Define New Engineering Blueprint
          </h2>
          
          <form onSubmit={handleCreateBlueprint} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Parent Template</label>
                <select 
                  required value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 appearance-none"
                >
                  <option value="" disabled>--- SELECT TEMPLATE ---</option>
                  {templates?.map(t => <option key={t.id} value={t.id}>{t.name} ({t.skuBase})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Exact MFR Part. No</label>
                <input 
                  required value={newBlueprintRef} onChange={e => setNewBlueprintRef(e.target.value)} 
                  placeholder="e.g. 6205-2RS-C3" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500 transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Measurement Unit</label>
                <select 
                  value={newBlueprintUnit} onChange={e => setNewBlueprintUnit(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 appearance-none"
                >
                  <option>Pcs</option>
                  <option>Liters</option>
                  <option>Kg</option>
                  <option>Meters</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Critical Threshold (Min Alert)</label>
                <input 
                  type="number" required value={newBlueprintThreshold} onChange={e => setNewBlueprintThreshold(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3" /> Blueprints act as the master record for physical parts globally.
              </p>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  <Database className="w-3 h-3" /> Commit Data
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBlueprints.map((blueprint) => {
          const tmpl = templates?.find(t => t.id === blueprint.templateId);
          const fam = families?.find(f => f.id === tmpl?.familyId);
          
          return (
            <motion.div 
              key={blueprint.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col group relative"
            >
              <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:text-amber-500 transition-all duration-500 pointer-events-none">
                <Hash className="w-24 h-24" />
              </div>
              
              <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {fam?.name || 'GEN'}
                      </span>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">/</span>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-slate-300">
                        {tmpl?.name || 'N/A'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white font-mono tracking-tight group-hover:text-amber-400 transition-colors">
                      {blueprint.reference}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Base Unit</p>
                    <p className="text-sm font-bold text-white">{blueprint.unit}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5"><BarChart2 className="w-3 h-3" /> Min Alert</p>
                    <p className="text-sm font-bold text-amber-400 font-mono">{blueprint.minThreshold}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-black/20 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>SYS_ID: {blueprint.id.substring(0,8)}</span>
                <button className="text-amber-500 hover:text-amber-400 uppercase tracking-widest font-bold px-3 py-1 bg-amber-500/10 rounded-md transition-colors">Details</button>
              </div>
            </motion.div>
          );
        })}
        {filteredBlueprints.length === 0 && !isAdding && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <Database className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Master Catalog Empty</p>
            <p className="text-xs text-slate-500 mt-2">Initialize your first engineering blueprint to start building the inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
