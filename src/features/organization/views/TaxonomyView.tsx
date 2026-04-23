import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FolderTree, Component, Info, Search, Plus, Trash2, Tag, Archive } from 'lucide-react';
import { useMasterCatalogEngine } from '../hooks/useMasterCatalogEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';

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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="mb-8 pt-2">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3 uppercase">
          <FolderTree className="w-8 h-8 text-amber-500" /> Taxonomy & Schematics
        </h1>
        <p className="text-slate-400 text-lg font-bold uppercase tracking-widest text-[10px] opacity-80">
          Define hierarchical data structures for technical assets and parts.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Families Section */}
        <div className="space-y-6">
          <div className="bg-[#0a0f18] border border-amber-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-400" /> Define Part Family
            </h2>
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Classification Name</label>
                <input 
                  required value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} 
                  placeholder="e.g. Electrical Motors" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Technical Scope (Optional)</label>
                <textarea 
                  value={newFamilyDesc} onChange={e => setNewFamilyDesc(e.target.value)} rows={2} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none" 
                  placeholder="Description of the component family..." 
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-[10px] rounded-xl py-3 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Plus className="w-4 h-4" /> Instantiate Family
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Classifications</h3>
            <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[400px]">
              {families?.map(f => (
                <div key={f.id} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between hover:border-amber-500/30 transition-colors shadow-inner group">
                  <div>
                    <p className="font-bold text-slate-100 font-mono tracking-wide">{f.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{f.description || 'No specific technical scope defined.'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2.5 py-1 bg-white/5 rounded-md border border-white/10 text-[9px] text-amber-500 font-mono tracking-widest uppercase opacity-70">
                      ID: {f.id.split('-')[0]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                      {templates?.filter(t => t.familyId === f.id).length || 0} Templates
                    </span>
                  </div>
                </div>
              ))}
              {families?.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No Families Defined</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="space-y-6">
          <div className="bg-[#0a0f18] border border-amber-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Component className="w-4 h-4 text-amber-400" /> Define Technical Template
            </h2>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Parent Classification</label>
                <select 
                  required value={selectedFamilyId} onChange={e => setSelectedFamilyId(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none"
                >
                  <option value="" disabled>--- SELECT FAMILY ---</option>
                  {families?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Template Class</label>
                  <input 
                    required value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} 
                    placeholder="e.g. Rolling Bearing" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">SKU Prefix</label>
                  <input 
                    required value={newTemplateSku} onChange={e => setNewTemplateSku(e.target.value)} 
                    placeholder="e.g. BEAR-RLM" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-[10px] rounded-xl py-3 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Plus className="w-4 h-4" /> Instantiate Template
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3 h-3" /> Deployed Templates
            </h3>
            <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[400px]">
              {templates?.map(t => {
                const fam = families?.find(f => f.id === t.familyId);
                return (
                  <div key={t.id} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between hover:border-amber-500/30 transition-colors shadow-inner">
                    <div>
                      <div className="text-[9px] font-bold tracking-widest uppercase text-amber-500 mb-1 flex items-center gap-1.5">
                        <FolderTree className="w-3 h-3" /> {fam?.name || 'Unknown'}
                      </div>
                      <p className="font-bold text-slate-100 font-mono">{t.name}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-[#0a0f18] rounded-xl text-xs font-mono text-amber-400 border border-amber-500/20 tracking-wider font-bold shadow-inner">
                      {t.skuBase}
                    </span>
                  </div>
                )
              })}
              {templates?.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
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
