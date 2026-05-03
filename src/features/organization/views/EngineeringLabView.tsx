import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tabs from '@radix-ui/react-tabs';
import { Search, Folder, Layers, Hash, AlertCircle, Plus, Trash2, Database, Wrench } from 'lucide-react';
import { useMachineLibrary } from '../hooks/useMachineLibrary';
import { GlassCard } from '@/shared/components/GlassCard';
import { MachineLibraryCard } from '../components/MachineLibraryCard';
import { db } from '@/core/db';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MachineModals, ModalType } from '../components/MachineModals';
import { toast } from 'sonner';
import { useTabStore } from '@/app/store';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';

function StatCompact({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-base font-bold text-white -mt-0.5">{value}</span>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

export function EngineeringLabView({ tabId, user }: { tabId: string, user?: User | null }) {
  const { families, templates, blueprints, templateCounts, blueprintCounts, isLoading } = useMachineLibrary();
  const [activeTab, setActiveTab] = useState('families');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { openTab } = useTabStore();
  const { logEvent } = useAuditTrail();

  React.useEffect(() => {
    const handleOpen = () => {
       setActiveTab('blueprints'); // switch to blueprint
       setActiveModal('blueprint');
    };
    document.addEventListener('open-add-machine-blueprint', handleOpen);
    return () => document.removeEventListener('open-add-machine-blueprint', handleOpen);
  }, []);

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
        await db.machineFamilies.delete(id);
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'DELETE',
          entityType: 'MACHINE_FAMILY',
          entityId: id,
          details: `Deleted Machine Family: ${item?.name || id}`,
          severity: 'WARNING'
        });
      } else if (type === 'template') {
        const item = templates.find(t => t.id === id);
        await db.machineTemplates.delete(id);
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'DELETE',
          entityType: 'MACHINE_TEMPLATE',
          entityId: id,
          details: `Deleted Machine Template: ${item?.name || id}`,
          severity: 'WARNING'
        });
      } else if (type === 'blueprint') {
        const item = blueprints.find(b => b.id === id);
        await db.machineBlueprints.delete(id);
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'DELETE',
          entityType: 'MACHINE_BLUEPRINT',
          entityId: id,
          details: `Deleted Machine Blueprint: ${item?.reference || id}`,
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
    return <div className="p-8 text-slate-400">Loading Engineering Lab...</div>;
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

  const openBlueprintDetail = (blueprintId: string, reference: string) => {
    // We can open a specific machine blueprint detail view here later
    console.log(`Open blueprint ${reference}`);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-auto flex flex-col gap-6 relative z-10"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
             <Wrench className="w-8 h-8 text-indigo-400" /> Engineering Lab
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">
             Master data and genetic code for your machinery.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <StatCompact icon={<Folder className="w-4 h-4 text-indigo-500" />} label="Families" value={families.length.toString()} />
          <StatCompact icon={<Layers className="w-4 h-4 text-blue-500" />} label="Templates" value={templates.length.toString()} />
          <StatCompact icon={<Hash className="w-4 h-4 text-violet-500" />} label="Blueprints" value={blueprints.length.toString()} />
        </div>
      </motion.header>

      <MachineModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        families={families} 
        templates={templates} 
        user={user}
      />

      <motion.div variants={itemVariants} className="flex flex-col flex-1 min-h-0">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col min-h-0 flex-1">
        <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl flex flex-col flex-1 min-h-0">
          <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01] shrink-0 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Hierarchy</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Master Data Directory</p>
              </div>
            </div>
            
            <div className="relative group w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search database..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="titan-input py-2.5 pl-11 pr-3 w-full lg:w-64 shadow-none"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-black/20 overflow-hidden relative z-0">
            <div className="p-6 md:p-8 pb-0 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Tabs.List className="flex items-center p-1.5 bg-[#121318] rounded-xl border border-white/10 w-full md:w-max shadow-inner overflow-x-auto">
                  <Tabs.Trigger 
                    value="families"
                    className="flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400 text-slate-400 hover:text-white"
                  >
                    <Folder className="w-4 h-4 shrink-0" />
                    Families
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{families.length}</span>
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="templates"
                    className="flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400 text-slate-400 hover:text-white"
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    Templates
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{templates.length}</span>
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="blueprints"
                    className="flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 text-slate-400 hover:text-white"
                  >
                    <Hash className="w-4 h-4 shrink-0" />
                    Blueprints
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{blueprints.length}</span>
                  </Tabs.Trigger>
                </Tabs.List>
                
                <button 
                  onClick={openAddModal}
                  className="titan-button bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 !py-2.5 flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  {getAddButtonTitle()}
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full"
                >
                <Tabs.Content value="families" className="outline-none min-h-0 flex-1 overflow-auto custom-scrollbar flex flex-col p-6 md:p-8 pr-3 pb-6">
                  {filteredFamilies.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02] flex-1 min-h-[300px]">
                      <Database className="w-16 h-16 text-slate-600 mb-4" />
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">{searchTerm ? 'No families match search' : 'No Families Found'}</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Create a new family grouping to organize your templates.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-fit">
                      {filteredFamilies.map(family => (
                        <MachineLibraryCard key={family.id} className="flex flex-col group/card relative border-l-4 border-l-indigo-500 transition-all duration-500 hover:border-y-indigo-500/30 hover:border-r-indigo-500/30 hover:shadow-[0_15px_40px_-10px_rgba(6,182,212,0.2)] hover:bg-indigo-500/[0.03] min-h-[140px]">
                          <button onClick={(e) => handleDelete('family', family.id, e)} className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500/50 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-all z-10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="flex items-start justify-between mb-3 pr-8">
                            <div className="flex flex-col relative group/info">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-white">{family.name}</h3>
                                {family.technicalDescription && (
                                  <div className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center cursor-help">
                                    <AlertCircle className="w-2.5 h-2.5 text-indigo-400" />
                                    {/* Italy Lux info box */}
                                    <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#0a0b10] border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-20 pointer-events-none translate-y-1 group-hover/info:translate-y-0 text-left">
                                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Mechanical Identity</div>
                                      <p className="text-xs text-slate-300 leading-relaxed italic font-sans">{family.technicalDescription}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-[0.2em]">{family.code}</span>
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold flex items-center gap-1.5 h-fit">
                              <Layers className="w-3.5 h-3.5" />
                              {templateCounts.get(family.id) || 0}
                            </div>
                          </div>
                          {family.technicalDescription && (
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-3 italic line-clamp-2">
                              "{family.technicalDescription}"
                            </p>
                          )}
                          <p className="text-slate-500 text-[10px] flex-1 line-clamp-1 italic">
                            {family.description}
                          </p>
                        </MachineLibraryCard>
                      ))}
                    </div>
                  )}
                </Tabs.Content>

                <Tabs.Content value="templates" className="outline-none min-h-0 flex-1 overflow-auto custom-scrollbar flex flex-col p-6 md:p-8 pr-3 pb-6">
                  {filteredTemplates.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02] flex-1 min-h-[300px]">
                      <Database className="w-16 h-16 text-slate-600 mb-4" />
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">{searchTerm ? 'No templates match search' : 'No Templates Found'}</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Create a new template to define base specifications for parts.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 h-fit">
                      {filteredTemplates.map(template => {
                        const parentFamily = families.find(f => f.id === template.familyId);
                        return (
                          <MachineLibraryCard key={template.id} className="flex flex-col group/card relative border-l-4 border-l-indigo-500 transition-all duration-500 hover:border-y-indigo-500/30 hover:border-r-indigo-500/30 hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.2)] hover:bg-blue-500/[0.03] min-h-[160px]">
                            <button onClick={(e) => handleDelete('template', template.id, e)} className="absolute top-4 right-4 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500/50 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-all z-10">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="mb-4 pr-8 flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                                  <Folder className="w-3 h-3" />
                                  {parentFamily?.name || 'Unknown Family'}
                                </span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider",
                                  template.type === 'A' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                  template.type === 'I' ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" :
                                  template.type === 'H' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                  template.type === 'P' ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                                  template.type === 'E' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                  template.type === 'S' ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                                  "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                )}>
                                  {template.type === 'A' ? 'Automatic' : 
                                   template.type === 'I' ? 'Injection' : 
                                   template.type === 'H' ? 'Hydraulic' : 
                                   template.type === 'P' ? 'Pneumatic' : 
                                   template.type === 'E' ? 'Electric' : 
                                   template.type === 'S' ? 'Special/Unique' : 'Manual'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-0.5 group/tinfo relative">
                                <h3 className="text-[15px] font-semibold text-white">{template.name}</h3>
                                {template.technicalDescription && (
                                  <AlertCircle className="w-3 h-3 text-slate-500 cursor-help" />
                                )}
                                {template.technicalDescription && (
                                  <div className="absolute bottom-full left-0 mb-1.5 w-56 p-2.5 bg-[#0a0b10] border border-white/10 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover/tinfo:opacity-100 group-hover/tinfo:visible transition-all z-20 pointer-events-none translate-y-1 group-hover/tinfo:translate-y-0">
                                    <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Functional Identity</div>
                                    <p className="text-[11px] text-slate-300 leading-snug italic">{template.technicalDescription}</p>
                                  </div>
                                )}
                              </div>
                              {template.technicalDescription && (
                                <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1 opacity-70 group-hover/tinfo:opacity-100 transition-opacity">
                                  {template.technicalDescription}
                                </p>
                              )}
                            </div>
                            
                            <div className="mt-auto flex items-center justify-between shrink-0">
                              <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="text-[10px] text-slate-400 uppercase mr-2">SKU Base</span>
                                <span className="font-mono text-sm text-white tracking-wider">{template.skuBase}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Hash className="w-3.5 h-3.5" />
                                {blueprintCounts.get(template.id) || 0} BPs
                              </div>
                            </div>
                          </MachineLibraryCard>
                        );
                      })}
                    </div>
                  )}
                </Tabs.Content>

                <Tabs.Content value="blueprints" className="outline-none min-h-0 flex-1 flex flex-col overflow-hidden p-6 md:p-8">
                  <div className="flex-1 overflow-auto custom-scrollbar pr-3 pb-6" ref={parentRef}>
                    {filteredBlueprints.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02] flex-1 min-h-[300px]">
                        <Database className="w-16 h-16 text-slate-600 mb-4" />
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">{searchTerm ? 'No blueprints match search' : 'No Blueprints Found'}</p>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Create your first specific part blueprint to start using the inventory.</p>
                      </div>
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
                                  <MachineLibraryCard onClick={() => openBlueprintDetail(blueprint.id, blueprint.reference)} className="flex flex-row items-center justify-between group overflow-hidden relative border border-white/5 transition-all duration-500 hover:border-y-violet-500/30 hover:border-r-violet-500/30 hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.2)] hover:bg-violet-500/[0.03] border-l-4 border-l-violet-500 p-4 md:p-5 bg-black/5 cursor-pointer rounded-2xl">
                                     <div className="flex items-center gap-4">
                                       <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-105 transition-transform">
                                          <Hash className="w-5 h-5 text-indigo-400" />
                                       </div>
                                       <div>
                                          <h3 className="text-sm md:text-base font-mono font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{blueprint.reference}</h3>
                                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{parentTemplate?.name || 'Item'}</span>
                                       </div>
                                     </div>
                                     <div className="flex gap-4 md:gap-8 items-center pr-10 relative">
                                        <button onClick={(e) => handleDelete('blueprint', blueprint.id, e)} className="absolute right-0 p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                     </div>
                                  </MachineLibraryCard>
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
          </div>
        </GlassCard>
      </Tabs.Root>
      </motion.div>
    </motion.div>
  );
}
