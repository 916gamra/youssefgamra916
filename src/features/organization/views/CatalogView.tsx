import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as Tabs from '@radix-ui/react-tabs';
import { Folder, Layers, Hash, Plus, AlertCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { GlassCard } from '@/shared/components/GlassCard';

export function CatalogView() {
  const [activeTab, setActiveTab] = useState('families');
  
  // Queries
  const families = useLiveQuery(() => db.pdrFamilies.toArray());
  const templates = useLiveQuery(() => db.pdrTemplates.toArray());
  const blueprints = useLiveQuery(() => db.pdrBlueprints.toArray());

  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDesc, setNewFamilyDesc] = useState('');

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSku, setNewTemplateSku] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState('');

  const [newBlueprintRef, setNewBlueprintRef] = useState('');
  const [newBlueprintUnit, setNewBlueprintUnit] = useState('Pcs');
  const [newBlueprintThreshold, setNewBlueprintThreshold] = useState('10');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName) return;
    await db.pdrFamilies.add({
      id: crypto.randomUUID(),
      name: newFamilyName,
      description: newFamilyDesc,
      createdAt: new Date().toISOString()
    });
    setNewFamilyName('');
    setNewFamilyDesc('');
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName || !newTemplateSku || !selectedFamilyId) return;
    await db.pdrTemplates.add({
      id: crypto.randomUUID(),
      familyId: selectedFamilyId,
      name: newTemplateName,
      skuBase: newTemplateSku,
      createdAt: new Date().toISOString()
    });
    setNewTemplateName('');
    setNewTemplateSku('');
  };

  const handleCreateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlueprintRef || !selectedTemplateId) return;
    await db.pdrBlueprints.add({
      id: crypto.randomUUID(),
      templateId: selectedTemplateId,
      reference: newBlueprintRef,
      unit: newBlueprintUnit,
      minThreshold: parseInt(newBlueprintThreshold) || 0,
      createdAt: new Date().toISOString()
    });
    setNewBlueprintRef('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-6 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">Master Catalog & Blueprints</h1>
          <p className="text-[var(--text-dim)] text-lg">Define families, templates, and exact part blueprints independent of stock.</p>
        </div>
      </header>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <Tabs.List className="flex items-center p-1.5 bg-black/20 backdrop-blur-md rounded-xl border border-[var(--glass-border)] w-max">
          <Tabs.Trigger value="families" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-[var(--text-bright)] text-[var(--text-dim)]">
             <Folder className="w-4 h-4" /> Families
          </Tabs.Trigger>
          <Tabs.Trigger value="templates" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-[var(--text-bright)] text-[var(--text-dim)]">
             <Layers className="w-4 h-4" /> Templates
          </Tabs.Trigger>
          <Tabs.Trigger value="blueprints" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-[var(--text-bright)] text-[var(--text-dim)]">
             <Hash className="w-4 h-4" /> Blueprints
          </Tabs.Trigger>
        </Tabs.List>

        <GlassCard className="p-6">
          <Tabs.Content value="families">
             <div className="flex gap-8">
                <div className="w-1/3 border-r border-[var(--glass-border)] pr-8">
                   <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Folder className="text-amber-400" /> New Family</h3>
                   <form onSubmit={handleCreateFamily} className="space-y-4">
                      <div>
                         <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Family Name</label>
                         <input required value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" placeholder="e.g. Electrical Components" />
                      </div>
                      <div>
                         <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Description (Optional)</label>
                         <textarea value={newFamilyDesc} onChange={e => setNewFamilyDesc(e.target.value)} rows={3} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" placeholder="Family description..." />
                      </div>
                      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg py-2.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                         <Plus className="w-4 h-4" /> Create Family
                      </button>
                   </form>
                </div>
                <div className="w-2/3">
                   <h3 className="text-lg font-semibold text-white mb-4">Existing Families</h3>
                   <div className="space-y-2">
                     {families?.map(f => (
                       <div key={f.id} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors">
                          <div>
                            <p className="font-semibold text-white text-sm">{f.name}</p>
                            <p className="text-xs text-[var(--text-dim)] mt-0.5">{f.description || 'No description'}</p>
                          </div>
                          <span className="text-[10px] text-[var(--text-dim)] font-mono">{f.id.split('-')[0]}</span>
                       </div>
                     ))}
                   </div>
                </div>
             </div>
          </Tabs.Content>

          <Tabs.Content value="templates">
             <div className="flex gap-8">
                <div className="w-1/3 border-r border-[var(--glass-border)] pr-8">
                   <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Layers className="text-amber-400" /> New Template</h3>
                   <form onSubmit={handleCreateTemplate} className="space-y-4">
                      <div>
                         <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Parent Family</label>
                         <select required value={selectedFamilyId} onChange={e => setSelectedFamilyId(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                            <option value="">-- Select Family --</option>
                            {families?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Template Name</label>
                         <input required value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" placeholder="e.g. Rolling Bearing" />
                      </div>
                      <div>
                         <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">SKU Base</label>
                         <input required value={newTemplateSku} onChange={e => setNewTemplateSku(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" placeholder="e.g. RLM-6200" />
                      </div>
                      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg py-2.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                         <Plus className="w-4 h-4" /> Create Template
                      </button>
                   </form>
                </div>
                <div className="w-2/3">
                   <h3 className="text-lg font-semibold text-white mb-4">Existing Templates</h3>
                   <div className="space-y-2">
                     {templates?.map(t => {
                       const fam = families?.find(f => f.id === t.familyId);
                       return (
                         <div key={t.id} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors">
                            <div>
                               <div className="text-[10px] text-amber-500/80 mb-0.5">{fam?.name || 'Unknown Family'}</div>
                               <p className="font-semibold text-white text-sm">{t.name}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-black/40 rounded-md text-xs font-mono text-white/70 border border-white/5">{t.skuBase}</span>
                         </div>
                       )
                     })}
                   </div>
                </div>
             </div>
          </Tabs.Content>

          <Tabs.Content value="blueprints">
             <div className="flex gap-8">
                <div className="w-1/3 border-r border-[var(--glass-border)] pr-8">
                   <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Hash className="text-amber-400" /> New Blueprint</h3>
                   <form onSubmit={handleCreateBlueprint} className="space-y-4">
                      <div>
                         <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Parent Template</label>
                         <select required value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                            <option value="">-- Select Template --</option>
                            {templates?.map(t => <option key={t.id} value={t.id}>{t.name} ({t.skuBase})</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Exact Reference (Part No)</label>
                         <input required value={newBlueprintRef} onChange={e => setNewBlueprintRef(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" placeholder="e.g. 6205-2RS-C3" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Unit</label>
                           <select value={newBlueprintUnit} onChange={e => setNewBlueprintUnit(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                              <option>Pcs</option>
                              <option>Liters</option>
                              <option>Kg</option>
                              <option>Meters</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Min Threshold</label>
                           <input type="number" required value={newBlueprintThreshold} onChange={e => setNewBlueprintThreshold(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                        </div>
                      </div>
                      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg py-2.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                         <Plus className="w-4 h-4" /> Finalize Blueprint
                      </button>
                      <p className="text-[10px] text-[var(--text-dim)] text-center">Blueprints defined here become available for stock creation in the PDR Engine.</p>
                   </form>
                </div>
                <div className="w-2/3">
                   <h3 className="text-lg font-semibold text-white mb-4">Active Blueprints</h3>
                   <div className="grid grid-cols-2 gap-3">
                     {blueprints?.map(b => {
                       const tmpl = templates?.find(t => t.id === b.templateId);
                       return (
                         <div key={b.id} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-50"><Hash className="w-8 h-8 text-[var(--text-dim)]" /></div>
                            <div className="relative z-10">
                               <div className="text-[10px] text-amber-500/80 mb-1">{tmpl?.name || 'Unknown Template'}</div>
                               <p className="font-mono font-bold text-white text-lg tracking-tight mb-2">{b.reference}</p>
                               <div className="flex gap-3">
                                 <div>
                                   <p className="text-[9px] uppercase text-[var(--text-dim)]">Unit</p>
                                   <p className="text-xs text-white">{b.unit}</p>
                                 </div>
                                 <div className="w-px bg-white/10" />
                                 <div>
                                   <p className="text-[9px] uppercase text-[var(--text-dim)]">Min Threshold</p>
                                   <p className="text-xs text-amber-400 font-mono">{b.minThreshold}</p>
                                 </div>
                               </div>
                            </div>
                         </div>
                       )
                     })}
                   </div>
                </div>
             </div>
          </Tabs.Content>
        </GlassCard>
      </Tabs.Root>
    </motion.div>
  );
}
