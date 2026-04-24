import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tabs from '@radix-ui/react-tabs';
import { Search, Folder, Layers, Hash, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { usePdrLibrary } from '../hooks/usePdrLibrary';
import { PdrCard } from '../components/PdrCard';
import { db } from '@/core/db';
import { useVirtualizer } from '@tanstack/react-virtual';
import { PdrModals, ModalType } from '../components/PdrModals';
import { toast } from 'sonner';
import { useTabStore } from '@/app/store';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';
import type { User } from '@/core/db';

export function PdrLibraryPage({ tabId, user }: { tabId: string, user?: User | null }) {
  const { families, templates, blueprints, templateCounts, blueprintCounts, isLoading } = usePdrLibrary();
  const [activeTab, setActiveTab] = useState('families');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { openTab } = useTabStore();
  const { logEvent } = useAuditTrail();

  const filteredFamilies = useMemo(() => {
    return families.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [families, searchTerm]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.skuBase.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [templates, searchTerm]);

  const filteredBlueprints = useMemo(() => {
    return blueprints.filter(b => b.reference.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [blueprints, searchTerm]);

  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: filteredBlueprints.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90, // approximate height of list item in vertical mode
    overscan: 5,
  });

  const handleDelete = async (type: ModalType, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you certain you want to delete this entity? This may break relationships with other records.')) {
      return;
    }
    
    try {
      if (type === 'family') {
        const item = families.find(f => f.id === id);
        await db.pdrFamilies.delete(id);
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'DELETE',
          entityType: 'PDR_FAMILY',
          entityId: id,
          details: `Deleted PDR Family: ${item?.name || id}`,
          severity: 'WARNING'
        });
      } else if (type === 'template') {
        const item = templates.find(t => t.id === id);
        await db.pdrTemplates.delete(id);
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'DELETE',
          entityType: 'PDR_TEMPLATE',
          entityId: id,
          details: `Deleted PDR Template: ${item?.name || id}`,
          severity: 'WARNING'
        });
      } else if (type === 'blueprint') {
        const item = blueprints.find(b => b.id === id);
        await db.pdrBlueprints.delete(id);
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'DELETE',
          entityType: 'PDR_BLUEPRINT',
          entityId: id,
          details: `Deleted PDR Blueprint: ${item?.reference || id}`,
          severity: 'WARNING'
        });
      }
      toast.success('Record purged successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Deletion failed.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading PDR Library...</div>;
  }

  const getAddButtonTitle = () => {
    switch (activeTab) {
      case 'families': return 'New Family';
      case 'templates': return 'New Template';
      case 'blueprints': return 'New Blueprint';
      default: return 'New Item';
    }
  };

  const openAddModal = () => {
    switch (activeTab) {
      case 'families': setActiveModal('family'); break;
      case 'templates': setActiveModal('template'); break;
      case 'blueprints': setActiveModal('blueprint'); break;
    }
  };

  const openPartDetail = (blueprintId: string, reference: string) => {
    openTab({
      id: `part-detail:${blueprintId}`,
      title: `Part: ${reference}`,
      component: 'part-detail'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-6xl mx-auto space-y-8 pb-12 px-4"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 uppercase">PDR Engine Library</h1>
          <p className="text-slate-400 text-lg font-medium opacity-80">Catalog management for spare parts hierarchy and industrial assets.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 items-center z-10 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search database..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="titan-input pl-10 h-10 w-full text-sm"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            {getAddButtonTitle()}
          </button>
        </div>
      </header>

      <PdrModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        families={families} 
        templates={templates} 
        user={user}
      />

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <Tabs.List className="flex items-center p-1.5 bg-black/20 backdrop-blur-md rounded-xl border border-white/10 w-max">
          <Tabs.Trigger 
            value="families"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 hover:text-white"
          >
            <Folder className="w-4 h-4" />
            Families
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{families.length}</span>
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="templates"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 hover:text-white"
          >
            <Layers className="w-4 h-4" />
            Templates
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{templates.length}</span>
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="blueprints"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 hover:text-white"
          >
            <Hash className="w-4 h-4" />
            Blueprints
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{blueprints.length}</span>
          </Tabs.Trigger>
        </Tabs.List>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
            >
              <Tabs.Content value="families" className="outline-none">
                {filteredFamilies.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">No families found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredFamilies.map(family => (
                      <PdrCard key={family.id} className="flex flex-col h-full group/card relative">
                        <button onClick={(e) => handleDelete('family', family.id, e)} className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500/50 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-all z-10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-start justify-between mb-3 pr-8">
                          <h3 className="text-lg font-semibold text-white">{family.name}</h3>
                          <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-semibold flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            {templateCounts.get(family.id) || 0} Templates
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm flex-1 leading-relaxed">
                          {family.description}
                        </p>
                      </PdrCard>
                    ))}
                  </div>
                )}
              </Tabs.Content>

              <Tabs.Content value="templates" className="outline-none">
                {filteredTemplates.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">No templates found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTemplates.map(template => {
                      const parentFamily = families.find(f => f.id === template.familyId);
                      return (
                        <PdrCard key={template.id} className="flex flex-col h-full group/card relative">
                          <button onClick={(e) => handleDelete('template', template.id, e)} className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500/50 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-all z-10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="mb-4 pr-8">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
                              <Folder className="w-3 h-3" />
                              {parentFamily?.name || 'Unknown Family'}
                            </span>
                            <h3 className="text-[15px] font-semibold text-white mb-0.5">{template.name}</h3>
                          </div>
                          
                          <div className="mt-auto flex items-center justify-between">
                            <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                              <span className="text-[10px] text-slate-400 uppercase mr-2">SKU Base</span>
                              <span className="font-mono text-sm text-white tracking-wider">{template.skuBase}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Hash className="w-3.5 h-3.5" />
                              {blueprintCounts.get(template.id) || 0} BPs
                            </div>
                          </div>
                        </PdrCard>
                      );
                    })}
                  </div>
                )}
              </Tabs.Content>

              <Tabs.Content value="blueprints" className="outline-none h-[600px] overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto custom-scrollbar pr-2" ref={parentRef}>
                  {filteredBlueprints.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">No blueprints found.</div>
                  ) : (
                    <div 
                      style={{ 
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative'
                      }}
                    >
                       {rowVirtualizer.getVirtualItems().map(virtualRow => {
                          const blueprint = filteredBlueprints[virtualRow.index];
                          const parentTemplate = templates.find(t => t.id === blueprint.templateId);
                          
                          return (
                            <div 
                              key={virtualRow.key}
                              data-index={virtualRow.index}
                              ref={rowVirtualizer.measureElement}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`
                              }}
                              className="pb-4"
                            >
                                <PdrCard onClick={() => openPartDetail(blueprint.id, blueprint.reference)} className="flex flex-row items-center justify-between group overflow-hidden relative border border-white/5 hover:border-blue-500/20 transition-all p-5 bg-black/5 hover:bg-black/10 cursor-pointer rounded-2xl">
                                   <div className="flex items-center gap-4">
                                     <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner group-hover:scale-105 transition-transform">
                                        <Hash className="w-5 h-5 text-blue-400" />
                                     </div>
                                     <div>
                                        <h3 className="text-base font-mono font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase">{blueprint.reference}</h3>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{parentTemplate?.name || 'Item'}</span>
                                     </div>
                                   </div>
                                   <div className="flex gap-8 items-center pr-12 relative">
                                      <div className="text-right">
                                        <span className="block text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-0.5">Unit</span>
                                        <span className="text-xs font-bold text-slate-200">{blueprint.unit}</span>
                                      </div>
                                      <div className="text-right flex-shrink-0 min-w[80px]">
                                        <span className="block text-[9px] text-slate-600 font-bold uppercase tracking-widest mb-0.5">Threshold</span>
                                        <span className="text-xs font-mono font-bold text-emerald-500">{blueprint.minThreshold}</span>
                                      </div>
                                      <button onClick={(e) => handleDelete('blueprint', blueprint.id, e)} className="absolute right-0 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                   </div>
                                </PdrCard>
                            </div>
                          );
                       })}
                    </div>
                  )}
                </div>
              </Tabs.Content>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs.Root>
    </motion.div>
  );
}
