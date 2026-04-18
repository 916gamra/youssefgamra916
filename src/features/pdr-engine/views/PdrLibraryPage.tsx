import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tabs from '@radix-ui/react-tabs';
import { Search, Folder, Layers, Hash, AlertCircle } from 'lucide-react';
import { usePdrLibrary } from '../hooks/usePdrLibrary';
import { PdrCard } from '../components/PdrCard';
import { db } from '@/core/db';
import { useVirtualizer } from '@tanstack/react-virtual';

export function PdrLibraryPage({ tabId }: { tabId: string }) {
  const { families, templates, blueprints, templateCounts, blueprintCounts, isLoading } = usePdrLibrary();
  const [activeTab, setActiveTab] = useState('families');
  const [searchTerm, setSearchTerm] = useState('');

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

  if (isLoading) {
    return <div className="p-8 text-[var(--text-dim)]">Loading PDR Library...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-6xl mx-auto space-y-6 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">PDR Engine Library</h1>
          <p className="text-[var(--text-dim)] text-lg">Browse the hierarchical structure of spare parts.</p>
        </div>
        
        <div className="relative w-full md:w-80 z-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input 
            type="text" 
            placeholder="Search registry..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 backdrop-blur-md border border-[var(--glass-border)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-dim)]"
          />
        </div>
      </header>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <Tabs.List className="flex items-center p-1.5 bg-black/20 backdrop-blur-md rounded-xl border border-[var(--glass-border)] w-max">
          <Tabs.Trigger 
            value="families"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-[var(--text-bright)] data-[state=active]:shadow-sm text-[var(--text-dim)] hover:text-[var(--text-bright)]"
          >
            <Folder className="w-4 h-4" />
            Families
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{families.length}</span>
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="templates"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-[var(--text-bright)] data-[state=active]:shadow-sm text-[var(--text-dim)] hover:text-[var(--text-bright)]"
          >
            <Layers className="w-4 h-4" />
            Templates
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{templates.length}</span>
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="blueprints"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:text-[var(--text-bright)] data-[state=active]:shadow-sm text-[var(--text-dim)] hover:text-[var(--text-bright)]"
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
                  <div className="py-12 text-center text-[var(--text-dim)] bg-white/5 backdrop-blur-md border border-[var(--glass-border)] rounded-2xl">No families found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredFamilies.map(family => (
                      <PdrCard key={family.id} className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-[var(--text-bright)]">{family.name}</h3>
                          <div className="px-2.5 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-semibold flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            {templateCounts.get(family.id) || 0} Templates
                          </div>
                        </div>
                        <p className="text-[var(--text-dim)] text-sm flex-1 leading-relaxed">
                          {family.description}
                        </p>
                      </PdrCard>
                    ))}
                  </div>
                )}
              </Tabs.Content>

              <Tabs.Content value="templates" className="outline-none">
                {filteredTemplates.length === 0 ? (
                  <div className="py-12 text-center text-[var(--text-dim)] bg-white/5 backdrop-blur-md border border-[var(--glass-border)] rounded-2xl">No templates found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTemplates.map(template => {
                      const parentFamily = families.find(f => f.id === template.familyId);
                      return (
                        <PdrCard key={template.id} className="flex flex-col h-full">
                          <div className="mb-4">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider flex items-center gap-1.5 mb-1">
                              <Folder className="w-3 h-3" />
                              {parentFamily?.name || 'Unknown Family'}
                            </span>
                            <h3 className="text-[15px] font-semibold text-[var(--text-bright)] mb-0.5">{template.name}</h3>
                          </div>
                          
                          <div className="mt-auto flex items-center justify-between">
                            <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-[var(--glass-border)]">
                              <span className="text-[10px] text-[var(--text-dim)] uppercase mr-2">SKU Base</span>
                              <span className="font-mono text-sm text-[var(--text-bright)] tracking-wider">{template.skuBase}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
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
                    <div className="py-12 text-center text-[var(--text-dim)] bg-white/5 backdrop-blur-md border border-[var(--glass-border)] rounded-2xl">No blueprints found.</div>
                  ) : (
                    <div 
                      style={{ 
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative'
                      }}
                    >
                       {rowVirtualizer.getVirtualItems().map(virtualRow => {
                          // We are rendering rows of 4 items each, or 1 item if we simplify, but let's do a simple vertical list for the demo of virtualizer
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
                                <PdrCard className="flex flex-row items-center justify-between group overflow-hidden relative border border-white/5 hover:border-cyan-500/30 transition-all p-4 bg-black/40">
                                   <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-inner">
                                        <Hash className="w-5 h-5 text-cyan-400" />
                                     </div>
                                     <div>
                                        <h3 className="text-lg font-mono font-bold text-white tracking-tight">{blueprint.reference}</h3>
                                        <span className="text-[11px] uppercase tracking-widest text-white/50">{parentTemplate?.name || 'Unknown Template'}</span>
                                     </div>
                                   </div>
                                   <div className="flex gap-8 items-center pr-4">
                                      <div className="text-right">
                                        <span className="block text-[10px] text-white/40 uppercase mb-0.5">Unit</span>
                                        <span className="text-[13px] font-medium text-white/80">{blueprint.unit}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="block text-[10px] text-white/40 uppercase mb-0.5">Min Threshold</span>
                                        <span className="text-[13px] font-mono font-bold text-emerald-400">{blueprint.minThreshold}</span>
                                      </div>
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
