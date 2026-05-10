import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Zap, Settings2, Sparkles, Search, 
  Cpu, Droplets, Activity, ChevronRight, CheckCircle2, BatteryCharging,
  Plus, ArrowRight
} from 'lucide-react';
import { GlassCard } from '@/shared/components/GlassCard';
import { PDR_FAMILIES, PDR_TEMPLATES, generatePdrSlotId, PdrTemplateDef } from '@/core/config/pdrMatrix';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { useMasterCatalogEngine } from '@/features/organization/hooks/useMasterCatalogEngine';
import { useStockEngine } from '@/features/pdr-engine/hooks/useStockEngine';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export function ComponentCatalogView() {
  const { showSuccess, showError } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  
  // Modals state
  const [creatingForTemplate, setCreatingForTemplate] = useState<PdrTemplateDef | null>(null);
  const [activatingBlueprintId, setActivatingBlueprintId] = useState<string | null>(null);
  
  // Create Blueprint form
  const [newRef, setNewRef] = useState('');
  const [newUnit, setNewUnit] = useState('Pcs');
  
  // Activate Instance form
  const [initialQuantity, setInitialQuantity] = useState(0);
  const [storageLocation, setStorageLocation] = useState('');
  const [minThreshold, setMinThreshold] = useState(2);
  
  const { blueprints, createBlueprint } = useMasterCatalogEngine();
  const { inventory, addStock } = useStockEngine();

  const filteredFamilies = useMemo(() => {
    return PDR_FAMILIES.filter(f => 
      (selectedFamily === null || f.id === selectedFamily) &&
      (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       PDR_TEMPLATES.some(t => t.familyId === f.id && t.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm, selectedFamily]);

  const toggleFamily = (id: string) => {
    setSelectedFamily(selectedFamily === id ? null : id);
  };

  const handleCreateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatingForTemplate || !newRef) return;
    
    // Find the next available slot index 1..999
    const templateBlueprints = blueprints.filter(b => b.templateId === creatingForTemplate.id);
    const existingIds = templateBlueprints.map(b => b.id);
    let nextSlotIndex = 1;
    let newId = '';
    
    while(nextSlotIndex <= 999) {
      newId = generatePdrSlotId(creatingForTemplate.code, nextSlotIndex);
      if (!existingIds.includes(newId)) {
        break;
      }
      nextSlotIndex++;
    }

    if (nextSlotIndex > 999) {
      showError('Capacity Reached', 'This template has exhausted all 999 slots.');
      return;
    }

    try {
      await createBlueprint({
        id: newId,
        templateId: creatingForTemplate.id,
        reference: newRef,
        unit: newUnit,
        minThreshold: 0 // Will be set in stock
      });
      showSuccess('Blueprint Created', `Dormant slot ${newId} initialized in catalog.`);
      setCreatingForTemplate(null);
      setNewRef('');
    } catch(err: any) {
      showError('Creation Failed', err.message);
    }
  };

  const handleActivateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activatingBlueprintId) return;
    
    const blueprint = blueprints.find(b => b.id === activatingBlueprintId);
    if (!blueprint) return;

    try {
      await addStock({
        blueprintId: blueprint.id,
        quantityCurrent: initialQuantity,
        locationDetails: storageLocation || 'To Be Assigned',
        warehouseId: 'WH-MAIN'
      });
      
      showSuccess('Instance Activated', `${blueprint.id} is now alive in factory stock.`);
      setActivatingBlueprintId(null);
      setInitialQuantity(0);
      setStorageLocation('');
      setMinThreshold(2);
    } catch(err: any) {
      showError('Activation Failed', err.message);
    }
  };

  const getFamilyIcon = (code: string) => {
    if (code.startsWith('DIS') || code.startsWith('CON') || code.startsWith('REL')) return <Zap className="w-5 h-5" />;
    if (code.startsWith('SEN') || code.startsWith('AUT')) return <Cpu className="w-5 h-5" />;
    if (code.startsWith('PNU')) return <Droplets className="w-5 h-5" />;
    if (code.startsWith('VAR') || code.startsWith('MOT')) return <Activity className="w-5 h-5" />;
    if (code.startsWith('DIV')) return <Package className="w-5 h-5" />;
    return <Settings2 className="w-5 h-5" />;
  };

  const getFamilyColor = (code: string) => {
    if (code.startsWith('DIS') || code.startsWith('CON') || code.startsWith('REL')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (code.startsWith('SEN') || code.startsWith('AUT')) return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20';
    if (code.startsWith('PNU')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (code.startsWith('VAR') || code.startsWith('MOT')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (code.startsWith('DIV')) return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-8 h-full overflow-y-auto custom-scrollbar bg-[#0a0a0f] text-slate-200">
      
      {/* Header */}
      <motion.header className="mb-10 space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-3 font-sans">
          <Sparkles className="w-8 h-8 text-indigo-400" /> Catalog Engineering
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg opacity-80">
          Global industrial matrix. Define Blueprints then activate them to <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Live Stock</span>.
        </p>
        
        <div className="flex gap-4 mt-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by specification, family, or template..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white font-medium hover:bg-white/[0.05] transition-colors"
            />
          </div>
        </div>
      </motion.header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredFamilies.map((family) => {
            const familyColorClass = getFamilyColor(family.code);
            return (
            <motion.div key={family.id} variants={cardVariants} layout>
              <GlassCard 
                className={`p-6 cursor-pointer border-t md:border-t-0 md:border-l-4 transition-all duration-500 group overflow-hidden ${selectedFamily === family.id ? 'border-indigo-500 bg-white/[0.03]' : 'border-white/10 hover:border-white/30'}`}
                onClick={() => toggleFamily(family.id)}
              >
                {/* Background Glow */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-0 blur-3xl transition-opacity duration-700 ${selectedFamily === family.id ? 'opacity-20 ' + familyColorClass.split(' ')[0] : 'group-hover:opacity-10 ' + familyColorClass.split(' ')[0]}`} />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`p-3 rounded-2xl border ${familyColorClass} backdrop-blur-md shadow-lg`}>
                    {getFamilyIcon(family.code)}
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 bg-black/60 px-2.5 py-1 rounded-md border border-white/10">
                    {family.code}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 tracking-wide font-sans relative z-10">{family.name}</h3>
                
                <AnimatePresence>
                  {selectedFamily === family.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 flex flex-col gap-2 relative z-10"
                    >
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                      
                      {PDR_TEMPLATES.filter(t => t.familyId === family.id).map(temp => {
                        const tempBlueprints = blueprints.filter(b => b.templateId === temp.id);
                        return (
                        <div key={temp.id} className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{temp.name}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setCreatingForTemplate(temp); }}
                              className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="space-y-1.5">
                            {tempBlueprints.length === 0 && (
                               <div className="text-[10px] text-slate-600 font-medium italic border border-dashed border-white/5 p-2 rounded -mx-1 text-center">No blueprints defined yet.</div>
                            )}
                            {tempBlueprints.map(bp => {
                               const inStock = inventory.some(i => i.blueprintId === bp.id);
                               return (
                                 <div 
                                   key={bp.id}
                                   onClick={(e) => { e.stopPropagation(); if(!inStock) setActivatingBlueprintId(bp.id); }}
                                   className={`group/bp flex flex-col gap-1 p-2 rounded relative overflow-hidden transition-all duration-300 ${inStock ? 'bg-emerald-500/5 border border-emerald-500/20 cursor-default' : 'bg-slate-800/40 border border-slate-700 hover:border-indigo-500/40 hover:bg-indigo-500/10 cursor-pointer'}`}
                                 >
                                    {/* Indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${inStock ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
                                    
                                    <div className="flex items-center justify-between pl-2">
                                      <span className="text-[10px] font-mono font-bold text-slate-300 truncate pr-2" title={bp.reference}>{bp.reference}</span>
                                      <span className={`text-[9px] font-bold uppercase tracking-widest shrink-0 ${inStock ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {inStock ? 'Active' : 'Dormant'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between pl-2">
                                      <span className="text-[9px] font-mono text-slate-500 opacity-60 tracking-wider mix-blend-screen">{bp.id}</span>
                                      {!inStock && <ArrowRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover/bp:opacity-100 group-hover/bp:translate-x-1 transition-all" />}
                                    </div>
                                 </div>
                               )
                            })}
                          </div>
                        </div>
                      )})}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          )})}
        </AnimatePresence>
      </div>

      {/* Blueprint Creation Modal */}
      <AnimatePresence>
        {creatingForTemplate && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setCreatingForTemplate(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0f111a] border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden relative"
            >
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1 font-sans">{creatingForTemplate.name}</h2>
                    <p className="text-xs text-indigo-400 font-mono font-bold tracking-widest uppercase">Create Blueprint (Catalog)</p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>

                <form onSubmit={handleCreateBlueprint} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">
                      Technical Reference Engine
                    </label>
                    <input 
                      type="text"
                      required
                      value={newRef}
                      onChange={e => setNewRef(e.target.value)}
                      placeholder="e.g. 24VDC 3NO 1NC"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">
                      Unit of Measure
                    </label>
                    <select 
                      value={newUnit}
                      onChange={e => setNewUnit(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                    >
                      <option value="Pcs">Pieces (Pcs)</option>
                      <option value="Meters">Meters (m)</option>
                      <option value="Liters">Liters (L)</option>
                      <option value="Kg">Kilograms (Kg)</option>
                    </select>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
                     <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-xs leading-relaxed text-slate-300">
                       System will assign the next available deterministic ID (e.g., <span className="font-mono text-amber-500 font-bold">{creatingForTemplate.code.replace('-', '')}-001</span>). This adds the item to the abstract catalog, not to physical stock.
                     </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setCreatingForTemplate(null)}
                      className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit"
                      disabled={!newRef}
                      className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50"
                    >
                       Forge Blueprint
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activation Modal */}
      <AnimatePresence>
        {activatingBlueprintId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActivatingBlueprintId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0f111a] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden relative"
            >
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1 font-sans">
                      {blueprints.find(b => b.id === activatingBlueprintId)?.reference}
                    </h2>
                    <p className="text-xs text-emerald-400 font-mono font-bold tracking-widest uppercase">Activate Instance / Stock</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <BatteryCharging className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                <form onSubmit={handleActivateInstance} className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">
                        Initial Quantity
                      </label>
                      <input 
                        type="number"
                        min="0"
                        required
                        value={initialQuantity}
                        onChange={e => setInitialQuantity(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-mono text-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">
                        Minimum Threshold
                      </label>
                      <input 
                        type="number"
                        min="0"
                        required
                        value={minThreshold}
                        onChange={e => setMinThreshold(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-mono text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">
                      Storage Location / Bin
                    </label>
                    <input 
                      type="text"
                      required
                      value={storageLocation}
                      onChange={e => setStorageLocation(e.target.value)}
                      placeholder="e.g. Aisle 3 - Shelf D2"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setActivatingBlueprintId(null)}
                      className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                    >
                       Activate to Live Stock
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
