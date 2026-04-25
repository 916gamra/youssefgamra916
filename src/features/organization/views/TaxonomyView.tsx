import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FolderTree, Component, Info, Search, Plus, Trash2, Tag, Archive } from 'lucide-react';
import { useMasterCatalogEngine } from '../hooks/useMasterCatalogEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { GlassCard } from '@/shared/components/GlassCard';

export function TaxonomyView() {
  const { families, templates, createFamily, createTemplate } = useMasterCatalogEngine();
  const { showSuccess, showError } = useNotifications();

  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDesc, setNewFamilyDesc] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSku, setNewTemplateSku] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState('');

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName) return;
    try {
      await createFamily({
        name: newFamilyName,
        description: newFamilyDesc
      });
      setNewFamilyName('');
      setNewFamilyDesc('');
      showSuccess('Taxonomy Updated', 'New family classification added.');
    } catch (err: any) {
      showError('System Error', err.message);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName || !newTemplateSku || !selectedFamilyId) return;
    try {
      await createTemplate({
        familyId: selectedFamilyId,
        name: newTemplateName,
        skuBase: newTemplateSku
      });
      setNewTemplateName('');
      setNewTemplateSku('');
      showSuccess('Template Created', 'Base SKU template initialized.');
    } catch (err: any) {
      showError('System Error', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 relative z-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <FolderTree className="w-8 h-8 text-amber-500" /> Taxonomy & Schematics
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">
            Define hierarchical data structures for technical assets and parts.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Families Section */}
        <div className="space-y-6">
          <GlassCard className="!p-8 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border-amber-500/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-400" /> Define Part Family
            </h2>
            <form onSubmit={handleCreateFamily} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Classification Name</label>
                <input 
                  required value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} 
                  placeholder="e.g. Electrical Motors" 
                  className="titan-input py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Technical Scope (Optional)</label>
                <textarea 
                  value={newFamilyDesc} onChange={e => setNewFamilyDesc(e.target.value)} rows={2} 
                  className="titan-input py-3 resize-none" 
                  placeholder="Description of the component family..." 
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-[10px] rounded-xl py-3 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Plus className="w-4 h-4" /> Instantiate Family
              </button>
            </form>
          </GlassCard>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Active Classifications</h3>
            <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[400px] pr-2">
              {families?.map(f => (
                <div key={f.id} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between hover:border-amber-500/30 transition-all shadow-inner group duration-300 hover:bg-white/[0.02]">
                  <div>
                    <p className="font-bold text-slate-100 font-mono tracking-wide">{f.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{f.description || 'No specific technical scope defined.'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-[9px] text-amber-500/70 font-mono tracking-widest uppercase shadow-sm">
                      ID: {f.id.split('-')[0]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5 group-hover:text-amber-400 transition-colors">
                      {templates?.filter(t => t.familyId === f.id).length || 0} Templates
                    </span>
                  </div>
                </div>
              ))}
              {families?.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No Families Defined</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="space-y-6">
          <GlassCard className="!p-8 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border-emerald-500/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Component className="w-4 h-4 text-emerald-400" /> Define Technical Template
            </h2>
            <form onSubmit={handleCreateTemplate} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Parent Classification</label>
                <select 
                  required value={selectedFamilyId} onChange={e => setSelectedFamilyId(e.target.value)} 
                  className="titan-input py-3 appearance-none"
                >
                  <option value="" disabled className="bg-[#14161f]">--- SELECT FAMILY ---</option>
                  {families?.map(f => <option key={f.id} value={f.id} className="bg-[#14161f]">{f.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Template Class</label>
                  <input 
                    required value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} 
                    placeholder="e.g. Rolling Bearing" 
                    className="titan-input py-3"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SKU Prefix</label>
                  <input 
                    required value={newTemplateSku} onChange={e => setNewTemplateSku(e.target.value)} 
                    placeholder="e.g. BEAR-RLM" 
                    className="titan-input py-3 text-emerald-400 uppercase"
                  />
                </div>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-[10px] rounded-xl py-3 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Plus className="w-4 h-4" /> Instantiate Template
              </button>
            </form>
          </GlassCard>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
              <Tag className="w-3.5 h-3.5 text-emerald-500/50" /> Deployed Templates
            </h3>
            <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[400px] pr-2">
              {templates?.map(t => {
                const fam = families?.find(f => f.id === t.familyId);
                return (
                  <div key={t.id} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-colors shadow-inner hover:bg-white/[0.02] group duration-300">
                    <div>
                      <div className="text-[9px] font-bold tracking-widest uppercase text-emerald-500/70 mb-1.5 flex items-center gap-1.5">
                        <FolderTree className="w-3 h-3" /> {fam?.name || 'Unknown'}
                      </div>
                      <p className="font-bold text-slate-100 font-mono tracking-wide">{t.name}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-[#0a0f18] rounded-xl text-xs font-mono text-emerald-400 border border-emerald-500/20 tracking-wider font-bold shadow-inner group-hover:border-emerald-500/40 transition-colors">
                      {t.skuBase}
                    </span>
                  </div>
                )
              })}
              {templates?.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No Templates Registered</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
