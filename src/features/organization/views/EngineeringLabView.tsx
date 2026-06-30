import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tabs from '@radix-ui/react-tabs';
import { Search, Folder, Layers, Hash, AlertCircle, Plus, Trash2, Database, Wrench, RefreshCw, Component, CheckCircle, ShieldAlert, Cpu, Zap, Droplet, Wind, X, History } from 'lucide-react';
import { useMachineLibrary } from '../hooks/useMachineLibrary';
import { GlassCard } from '@/shared/components/GlassCard';
import { MachineLibraryCard } from '../components/MachineLibraryCard';
import { db } from '@/core/db';
import { useVirtualizer } from '@tanstack/react-virtual';
import { MachineModals, ModalType } from '../components/MachineModals';
import { useLiveQuery } from 'dexie-react-hooks';
import { BlueprintAssemblyModal } from '../components/BlueprintAssemblyModal';
import { toast } from 'sonner';
import { useTabStore } from '@/app/store';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';
import { runDatabaseSeed } from '@/core/db/useDatabaseSeeder';
import { ConfirmationModal } from '@/shared/components/ConfirmationModal';
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export function EngineeringLabView({ tabId, user }: { tabId: string, user?: User | null }) {
  const { families, templates, blueprints, templateCounts, blueprintCounts, isLoading } = useMachineLibrary();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [deleteContext, setDeleteContext] = useState<{ type: ModalType, id: string } | null>(null);
  const [activeTab, setActiveTab ] = useState('families');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // Navigation State
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Queries for Standard Components
  const standardComponents = useLiveQuery(() => db.standardComponents.toArray(), []) || [];
  const genericTasks = useLiveQuery(() => db.preventiveTasks.toArray(), []) || [];
  const pdrTemplates = useLiveQuery(() => db.pdrTemplates.toArray(), []) || [];
  const standardActions = useLiveQuery(() => db.standardActions.toArray(), []) || [];
  const allExecutions = useLiveQuery(() => db.taskExecutions.toArray(), []) || [];
  const machines = useLiveQuery(() => db.machines.toArray(), []) || [];

  // State for Blueprint Assembly configuration
  const [selectedBlueprintIdForAssembly, setSelectedBlueprintIdForAssembly] = useState<string | null>(null);

  // State for Component Management
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compFamily, setCompFamily] = useState<'MEC' | 'ELE' | 'HYD' | 'PNU' | 'ELN'>('MEC');
  const [compTaskIds, setCompTaskIds] = useState<string[]>([]);
  const [compCriticality, setCompCriticality] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [compPartTemplateIds, setCompPartTemplateIds] = useState<string[]>([]);

  // State for Standard Actions Management
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionName, setActionName] = useState('');
  const [actionType, setActionType] = useState<'PREV' | 'CORR' | 'BOTH'>('PREV');
  const [actionDesc, setActionDesc] = useState('');

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

  const handleSyncLaboratory = async () => {
    try {
      setIsSyncing(true);
      setShowSyncModal(false);
      await logEvent({
        userId: user?.id || 'GUEST',
        userName: user?.name || 'Guest User',
        action: 'UPDATE',
        entityType: 'KNOWLEDGE_BASE',
        entityId: 'GENETIC_INJECTION',
        details: 'Manual synchronization of machine taxonomy and laboratory assets.',
        severity: 'INFO'
      });

      const seedFunc = runDatabaseSeed(true); 
      await seedFunc();
      
      toast.success('Laboratory Synchronized', {
        description: 'New industrial genes injected. Reloading laboratory system...'
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error('Injection Failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredFamilies = useMemo(() => {
    return families
      .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [families, searchTerm]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (selectedFamilyId && t.familyId !== selectedFamilyId) return false;
      const f = families.find(fam => fam.id === t.familyId);
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.skuBase.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFamily = f ? (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())) : false;
      return selectedFamilyId ? matchesSearch : (matchesSearch || matchesFamily);
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [templates, families, searchTerm, selectedFamilyId]);

  // Sovereign Life History state
  const [lifeHistoryComponentId, setLifeHistoryComponentId] = useState<string | null>(null);

  const filteredBlueprints = useMemo(() => {
    return blueprints.filter(b => {
      const t = templates.find(tpl => tpl.id === b.templateId);
      if (selectedTemplateId && b.templateId !== selectedTemplateId) return false;
      if (selectedFamilyId && (!t || t.familyId !== selectedFamilyId)) return false;
      
      const f = t ? families.find(fam => fam.id === t.familyId) : null;
      const matchesSearch = b.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTemplate = t ? (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.skuBase.toLowerCase().includes(searchTerm.toLowerCase())) : false;
      const matchesFamily = f ? (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())) : false;
      return (selectedTemplateId || selectedFamilyId) ? matchesSearch : (matchesSearch || matchesTemplate || matchesFamily);
    }).sort((a, b) => a.reference.localeCompare(b.reference));
  }, [blueprints, templates, families, searchTerm, selectedFamilyId, selectedTemplateId]);

  const filteredComponents = useMemo(() => {
    return standardComponents.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [standardComponents, searchTerm]);

  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: filteredBlueprints.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90, // approximate height of list item in vertical mode
    overscan: 5,
  });

  const handleDelete = (type: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteContext({ type: type as any, id });
  };

  const confirmDelete = async () => {
    if (!deleteContext) return;
    
    const { type, id } = deleteContext;
    
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
      } else if (type === ('standard-component' as any)) {
        const item = standardComponents.find(c => c.id === id);
        await db.standardComponents.delete(id);
        
        // Dissolve component from all assemblies
        const bps = await db.machineBlueprints.toArray();
        for (const bp of bps) {
          if (bp.componentIds?.includes(id)) {
            const updated = bp.componentIds.filter(cid => cid !== id);
            await db.machineBlueprints.update(bp.id, { componentIds: updated });
          }
        }

        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'DELETE',
          entityType: 'STANDARD_COMPONENT',
          entityId: id,
          details: `Deleted Standard modular component: ${item?.name || id}`,
          severity: 'WARNING'
        });
      } else if (type === ('standard-action' as any)) {
        const item = standardActions.find(a => a.id === id);
        await db.standardActions.delete(id);
        
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'DELETE',
          entityType: 'STANDARD_ACTION',
          entityId: id,
          details: `Deleted Standard Industrial Action (Verb): ${item?.name || id}`,
          severity: 'WARNING'
        });
      }
      toast.success('Record purged successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Deletion failed.');
    } finally {
      setDeleteContext(null);
    }
  };

   const handleCreateStandardComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
       toast.error('Component Name is required.');
       return;
    }

    try {
       const newComponent = {
          id: crypto.randomUUID(),
          name: compName.trim(),
          family: compFamily,
          taskIds: compTaskIds,
          criticality: compCriticality,
          linkedPartTemplateIds: compPartTemplateIds,
          createdAt: new Date().toISOString()
       };

       await db.standardComponents.add(newComponent);

       await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'CREATE',
          entityType: 'STANDARD_COMPONENT',
          entityId: newComponent.id,
          details: `Created standard modular component: ${newComponent.name} [${newComponent.family}] (${compCriticality}) with ${newComponent.taskIds.length} generic tasks and ${compPartTemplateIds.length} raw parts linked.`,
          severity: 'INFO'
       });

       toast.success('Modular Component Registered', {
          description: `"${newComponent.name}" added to master library.`
       });

       // Reset fields
       setCompName('');
       setCompFamily('MEC');
       setCompTaskIds([]);
       setCompCriticality('MEDIUM');
       setCompPartTemplateIds([]);
       setIsComponentModalOpen(false);
    } catch (error: any) {
       console.error(error);
       toast.error('Failed to create component: ' + error.message);
    }
  };

  const handleCreateStandardAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionName.trim()) {
      toast.error('Action verb name is required.');
      return;
    }

    try {
      const newAction = {
        id: crypto.randomUUID(),
        name: actionName.trim(),
        type: actionType,
        description: actionDesc.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      await db.standardActions.add(newAction);

      await logEvent({
        userId: user?.id || 'GUEST',
        userName: user?.name || 'Guest User',
        action: 'CREATE',
        entityType: 'STANDARD_ACTION',
        entityId: newAction.id,
        details: `Created Standard Action (Verb): ${newAction.name} [Type: ${newAction.type}]`,
        severity: 'INFO'
      });

      toast.success('Action Verb Registered', {
        description: `"${newAction.name}" has been registered in the global action library.`
      });

      // Reset
      setActionName('');
      setActionType('PREV');
      setActionDesc('');
      setIsActionModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to register action: ' + err.message);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading Engineering Lab...</div>;
  }

  const isAdmin = user?.role === 'System Administrator' || user?.isSystemRoot;

  const getAddButtonTitle = () => {
    switch (activeTab) {
      case 'families': return null;
      case 'templates': return null;
      case 'blueprints': return 'New Blueprint';
      default: return null;
    }
  };

  const openAddModal = () => {
    switch (activeTab) {
      case 'blueprints': setActiveModal('blueprint'); break;
    }
  };

  const openBlueprintDetail = (blueprintId: string, reference: string) => {
    setSelectedBlueprintIdForAssembly(blueprintId);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col gap-6 relative z-10"
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
          <StatCompact icon={<Component className="w-4 h-4 text-emerald-500" />} label="Components" value={standardComponents.length.toString()} />
        </div>
      </motion.header>

      <MachineModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        families={families} 
        templates={templates} 
        blueprints={blueprints}
        user={user}
      />

      <motion.div variants={itemVariants} className="flex flex-col flex-1 min-h-0">
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(val) => {
            setActiveTab(val);
            setSearchTerm('');
            if (val === 'families') {
              setSelectedFamilyId(null);
              setSelectedTemplateId(null);
            } else if (val === 'templates') {
              setSelectedTemplateId(null);
            }
          }} 
          className="flex flex-col min-h-0 flex-1"
        >
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
                  <Tabs.Trigger 
                    value="components"
                    className="flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 text-slate-400 hover:text-white"
                  >
                    <Component className="w-4 h-4 shrink-0" />
                    Components
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{standardComponents.length}</span>
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="actions"
                    className="flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400 text-slate-400 hover:text-white"
                  >
                    <Wrench className="w-4 h-4 shrink-0" />
                    Actions
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{standardActions.length}</span>
                  </Tabs.Trigger>
                </Tabs.List>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setShowSyncModal(true)}
                    disabled={isSyncing}
                    className="titan-button bg-black/40 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 shrink-0 !py-2.5 flex items-center justify-center gap-2 group/sync disabled:opacity-50"
                    title="Genetic Injection: Synchronize with Master Data"
                  >
                    <RefreshCw className={cn("w-4 h-4 group-hover/sync:rotate-180 transition-transform duration-500", isSyncing && "animate-spin")} />
                    <span className="hidden sm:inline">Sync Lab</span>
                  </button>
                  
                  { activeTab === 'blueprints' && (
                    <button 
                      onClick={openAddModal}
                      className="titan-button bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 !py-2.5 flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                      <Plus className="w-4 h-4" />
                      {getAddButtonTitle()}
                    </button>
                  )}

                  { activeTab === 'components' && (
                    <button 
                      onClick={() => {
                        setCompName('');
                        setCompFamily('MEC');
                        setCompTaskIds([]);
                        setCompCriticality('MEDIUM');
                        setCompPartTemplateIds([]);
                        setIsComponentModalOpen(true);
                      }}
                      className="titan-button bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 !py-2.5 flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                      <Plus className="w-4 h-4" />
                      New Component
                    </button>
                  )}

                  { activeTab === 'actions' && (
                    <button 
                      onClick={() => {
                        setActionName('');
                        setActionType('PREV');
                        setActionDesc('');
                        setIsActionModalOpen(true);
                      }}
                      className="titan-button bg-purple-600 hover:bg-purple-500 text-white shrink-0 !py-2.5 flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                      <Plus className="w-4 h-4" />
                      New Action Verb
                    </button>
                  )}
                </div>
              </div>

              {/* Hierarchical Navigation Breadcrumb / Filter Status */}
              {(selectedFamilyId || selectedTemplateId) && (activeTab === 'templates' || activeTab === 'blueprints') && (
                <div className="flex flex-wrap items-center gap-2 mt-4 text-sm font-medium">
                  {selectedFamilyId && (
                    <button 
                      onClick={() => {
                        setActiveTab('families');
                        setSelectedFamilyId(null);
                        setSelectedTemplateId(null);
                        setSearchTerm('');
                      }}
                      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 shadow-sm"
                    >
                      <Folder className="w-4 h-4" />
                      {families.find(f => f.id === selectedFamilyId)?.code || 'Family'}
                      <span className="text-[10px] uppercase font-bold opacity-60 ml-1 bg-indigo-500/20 px-1.5 rounded">clear</span>
                    </button>
                  )}
                  {selectedTemplateId && activeTab === 'blueprints' && (
                    <>
                      <div className="text-slate-600">/</div>
                      <button 
                        onClick={() => {
                          setActiveTab('templates');
                          setSelectedTemplateId(null);
                          setSearchTerm('');
                        }}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-sm"
                      >
                        <Layers className="w-4 h-4" />
                        {templates.find(t => t.id === selectedTemplateId)?.skuBase || 'Template'}
                        <span className="text-[10px] uppercase font-bold opacity-60 ml-1 bg-blue-500/20 px-1.5 rounded">clear</span>
                      </button>
                    </>
                  )}
                </div>
              )}
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
                      {filteredFamilies.map((family, idx) => (
                        <motion.div
                          key={family.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full"
                        >
                          <MachineLibraryCard 
                            onClick={() => { setActiveTab('templates'); setSelectedFamilyId(family.id); setSearchTerm(''); }}
                            className="flex flex-col group/card relative border-l-4 border-l-indigo-500 transition-all duration-500 hover:border-y-indigo-500/30 hover:border-r-indigo-500/30 hover:shadow-[0_15px_40px_-10px_rgba(6,182,212,0.2)] hover:bg-indigo-500/[0.03] min-h-[140px] h-full cursor-pointer"
                          >
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
                        </motion.div>
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
                      {filteredTemplates.map((template, idx) => {
                        const parentFamily = families.find(f => f.id === template.familyId);
                        return (
                          <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full"
                          >
                            <MachineLibraryCard 
                              onClick={() => { setActiveTab('blueprints'); setSelectedTemplateId(template.id); setSearchTerm(''); }}
                              className="flex flex-col group/card relative border-l-4 border-l-indigo-500 transition-all duration-500 hover:border-y-indigo-500/30 hover:border-r-indigo-500/30 hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.2)] hover:bg-blue-500/[0.03] min-h-[160px] h-full cursor-pointer"
                            >
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
                                   template.type === 'S' ? 'Semi-Electric / Special' : 'Manual'}
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
                          </motion.div>
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
                                  <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: (virtualRow.index % 10) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full"
                                  >
                                    <MachineLibraryCard onClick={() => openBlueprintDetail(blueprint.id, blueprint.reference)} className="flex flex-col group overflow-hidden relative border border-white/5 transition-all duration-700 hover:border-white/20 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] hover:bg-white/[0.02] p-0 bg-black/20 cursor-pointer rounded-2xl">
                                     {/* Animated Gradient Border Top */}
                                     <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                     
                                     <div className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 gap-6 relative z-10">
                                       <div className="flex items-start gap-5">
                                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-105 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                            <Hash className="w-5 h-5 text-indigo-400" />
                                         </div>
                                         <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-3">
                                              <h3 className="text-lg font-mono font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors uppercase">{blueprint.reference}</h3>
                                              {blueprint.model && (
                                                <span className="text-[9px] uppercase tracking-widest text-indigo-400/80 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">{blueprint.model}</span>
                                              )}
                                            </div>
                                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{parentTemplate?.name || 'Standard Blueprint'}</span>
                                            
                                            {/* Technical details pill */}
                                            {(blueprint.powerOrForce || blueprint.technicalSpecs) && (
                                              <div className="flex items-center gap-3 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {blueprint.powerOrForce && (
                                                  <span className="text-xs font-mono text-slate-300">⚡ {blueprint.powerOrForce}</span>
                                                )}
                                                {blueprint.technicalSpecs && (
                                                  <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span className="text-xs font-mono text-slate-300">{blueprint.technicalSpecs}</span>
                                                  </>
                                                )}
                                              </div>
                                            )}
                                         </div>
                                       </div>
                                       
                                       <div className="flex gap-6 items-center md:pr-10 relative md:ml-auto">
                                          <button onClick={(e) => handleDelete('blueprint', blueprint.id, e)} className="absolute right-0 p-2.5 rounded-xl bg-red-500/10 border border-red-500/0 hover:border-red-500/30 hover:bg-red-500/20 text-red-500/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>
                                     </div>
                                     
                                     {/* Card Background Glow */}
                                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/0 group-hover:from-indigo-500/[0.02] group-hover:to-transparent transition-colors duration-700 pointer-events-none" />
                                  </MachineLibraryCard>
                                  </motion.div>
                              </div>
                            );
                         })}
                      </div>
                    )}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="components" className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {filteredComponents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <Component className="w-16 h-16 text-slate-700 mb-4 stroke-1 animate-pulse" />
                        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No modular components found</h3>
                        <p className="text-xs text-slate-500 mt-2 text-center max-w-sm">Create component blocks (Matières Standard) to construct complex machine blueprints elegantly.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredComponents.map(comp => {
                           // Find tasks and parts for this component
                           const compTasks = genericTasks.filter(t => comp.taskIds?.includes(t.id));
                           const linkedParts = pdrTemplates.filter(t => comp.linkedPartTemplateIds?.includes(t.id));
                           const compCriticalityVal = comp.criticality || 'MEDIUM';
                           const ComponentIcon = comp.family === 'MEC' ? Wrench : comp.family === 'ELE' ? Zap : comp.family === 'HYD' ? Droplet : comp.family === 'PNU' ? Wind : Cpu;
                           const colSchema = comp.family === 'MEC' ? 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400' :
                                             comp.family === 'ELE' ? 'from-yellow-405/10 to-transparent border-yellow-400/20 text-yellow-400' :
                                             comp.family === 'HYD' ? 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400' :
                                             comp.family === 'PNU' ? 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400' :
                                             'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400';

                           let critColor = 'bg-slate-500/15 text-slate-400';
                           if (compCriticalityVal === 'CRITICAL') critColor = 'bg-red-500/20 text-red-400 border border-red-500/30';
                           else if (compCriticalityVal === 'HIGH') critColor = 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
                           else if (compCriticalityVal === 'MEDIUM') critColor = 'bg-amber-500/15 text-amber-500 border border-amber-500/20';

                           return (
                             <div key={comp.id} className="relative group bg-[#111218]/40 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between">
                               <div>
                                 <div className="flex items-start justify-between mb-4">
                                   <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colSchema.split(' ').slice(0, 3).join(' ')} flex items-center justify-center border shrink-0`}>
                                        <ComponentIcon className="w-5 h-5 flex-shrink-0" />
                                     </div>
                                     <div>
                                       <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{comp.name}</h4>
                                       <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                         <span className={`text-[8px] font-mono tracking-widest font-bold px-1.5 py-0.5 rounded uppercase border ${colSchema.split(' ').slice(3).join(' ')}`}>
                                            {comp.family}
                                         </span>
                                         <span className={`text-[8px] font-mono tracking-widest font-extrabold px-1.5 py-0.5 rounded uppercase ${critColor}`}>
                                            {compCriticalityVal}
                                         </span>
                                       </div>
                                     </div>
                                   </div>
                                   <div className="flex flex-col gap-1 items-end">
                                     <button onClick={(e) => { e.stopPropagation(); setLifeHistoryComponentId(comp.id); }} className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/10 text-indigo-400 text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 whitespace-nowrap">
                                        Life History
                                     </button>
                                     <button onClick={(e) => handleDelete('standard-component', comp.id, e)} className="p-1.5 rounded bg-red-500/5 hover:bg-red-500/25 border border-red-500/0 hover:border-red-500/10 text-red-500 transition-all flex items-center justify-center">
                                       <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                   </div>
                                 </div>

                                 <div className="border-t border-white/5 pt-3 mt-3">
                                   <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">
                                     <span>Task Catalog Linked DNA</span>
                                     <span className="font-mono text-emerald-400">{compTasks.length} Plans</span>
                                   </div>
                                   
                                   {compTasks.length === 0 ? (
                                     <p className="text-[10px] text-slate-500 italic pb-2">No tasks connected to this block</p>
                                   ) : (
                                     <div className="space-y-1.5 max-h-[110px] overflow-y-auto custom-scrollbar pr-1 mb-3">
                                       {compTasks.map(t => (
                                         <div key={t.id} className="flex items-center justify-between text-[10px] text-slate-300 bg-white/[0.01] px-2 py-1 rounded border border-white/5 truncate font-medium">
                                            <span className="truncate">{t.title}</span>
                                            <span className="text-[9px] text-slate-500 font-mono ml-2 shrink-0">{t.frequencyValue}d</span>
                                         </div>
                                       ))}
                                     </div>
                                   )}
                                 </div>
                               </div>

                               <div className="border-t border-white/5 pt-3 mt-1">
                                 <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">
                                   <span>PDR Spare Parts</span>
                                   <span className="font-mono text-cyan-400">{linkedParts.length} Parts</span>
                                 </div>
                                 
                                 {linkedParts.length === 0 ? (
                                   <p className="text-[10px] text-slate-505 italic text-slate-600">No spare parts attached</p>
                                 ) : (
                                   <div className="flex flex-wrap gap-1">
                                     {linkedParts.map(part => (
                                       <span key={part.id} className="text-[9px] px-2 py-0.5 rounded bg-cyan-95/30 text-cyan-400 border border-cyan-500/20 font-sans tracking-wide">
                                         {part.name}
                                       </span>
                                     ))}
                                   </div>
                                 )}
                               </div>
                             </div>
                           );
                        })}
                      </div>
                    )}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="actions" className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {standardActions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <Wrench className="w-16 h-16 text-slate-700 mb-4 stroke-1" />
                        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No Action Verbs Found</h3>
                        <p className="text-xs text-slate-500 mt-2 text-center max-w-sm">Register action verbs (surgeries) inside your Engineering Lab to control exact maintenance types.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {standardActions.map(act => {
                           let typeBadgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                           let typeText = 'Preventive Plan';
                           if (act.type === 'CORR') {
                             typeBadgeColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
                             typeText = 'Corrective Fix';
                           } else if (act.type === 'BOTH') {
                             typeBadgeColor = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
                             typeText = 'Hybrid Assembly';
                           }

                           return (
                             <div key={act.id} className="relative group bg-[#111218]/40 border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-300 flex flex-col justify-between">
                               <div>
                                 <div className="flex items-start justify-between mb-3">
                                   <div className="flex items-center gap-3">
                                     <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                        <Wrench className="w-4 h-4 text-purple-400" />
                                     </div>
                                     <div>
                                       <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{act.name}</h4>
                                       <span className={`text-[8px] font-mono tracking-widest font-extrabold px-1.5 py-0.5 rounded uppercase mt-1.5 inline-block ${typeBadgeColor}`}>
                                          {typeText}
                                       </span>
                                     </div>
                                   </div>
                                   <button onClick={(e) => handleDelete('standard-action', act.id, e)} className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/25 border border-red-500/0 hover:border-red-500/10 text-red-500 transition-all">
                                     <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                 </div>

                                 <div className="border-t border-white/5 pt-3 mt-3">
                                   <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                     {act.description || 'No description provided for this verb action.'}
                                   </p>
                                 </div>
                               </div>

                               <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest border-t border-white/5 pt-2 mt-4 flex items-center justify-between">
                                 <span>Action ID</span>
                                 <span className="truncate max-w-[120px]">{act.id.slice(0, 8)}...</span>
                                </div>
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

      {/* Standard Component Creation Modal */}
      <AnimatePresence>
        {isComponentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsComponentModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0e1017] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Component className="w-5 h-5 text-emerald-400" /> New Component Block
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">Standardize physical machine modules with pre-packaged diagnostic task genes.</p>

              <form onSubmit={handleCreateStandardComponent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Component Block Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Moteur Électrique 45kW, Groupe Hydraulique"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="titan-input py-2 px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Component Family</label>
                    <select
                      value={compFamily}
                      onChange={(e) => setCompFamily(e.target.value as any)}
                      className="titan-input py-2 px-3 text-sm bg-black"
                    >
                      <option value="MEC">MEC (Mechanical)</option>
                      <option value="ELE">ELE (Electrical)</option>
                      <option value="HYD">HYD (Hydraulic)</option>
                      <option value="PNU">PNU (Pneumatic)</option>
                      <option value="ELN">ELN (Electronic)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Criticality level</label>
                    <select
                      value={compCriticality}
                      onChange={(e) => setCompCriticality(e.target.value as any)}
                      className="titan-input py-2 px-3 text-sm bg-black"
                    >
                      <option value="LOW">LOW (Utility)</option>
                      <option value="MEDIUM">MEDIUM (Operational)</option>
                      <option value="HIGH">HIGH (High Risk)</option>
                      <option value="CRITICAL">CRITICAL (Line Stop Risk)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">DNA: Spare Parts (PDR)</label>
                      <span className="text-[10px] text-cyan-400 font-bold">{compPartTemplateIds.length} Selected</span>
                    </div>
                    
                    <div className="max-h-[140px] overflow-y-auto border border-white/5 rounded-xl p-2 bg-black/40 space-y-1 custom-scrollbar">
                      {pdrTemplates.map(part => {
                        const isChecked = compPartTemplateIds.includes(part.id);
                        return (
                          <div 
                            key={part.id} 
                            onClick={() => {
                              setCompPartTemplateIds(prev => 
                                prev.includes(part.id) ? prev.filter(pid => pid !== part.id) : [...prev, part.id]
                              );
                            }}
                            className={`p-1.5 rounded-lg text-[11px] cursor-pointer flex items-center justify-between border transition-all ${
                              isChecked ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'border-transparent text-slate-400 hover:bg-white/[0.02]'
                            }`}
                          >
                            <span className="truncate">{part.name}</span>
                            <span className="font-mono text-[8px] uppercase ml-2 px-1 text-slate-500">{part.skuBase}</span>
                          </div>
                        );
                      })}
                      {pdrTemplates.length === 0 && (
                        <p className="text-[9px] text-slate-600 italic py-2 text-center">No raw parts loaded yet</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">DNA: Linked Tasks</label>
                    <span className="text-[10px] text-emerald-400 font-bold">{compTaskIds.length} Selected</span>
                  </div>
                  
                  <div className="max-h-[140px] overflow-y-auto border border-white/5 rounded-xl p-2 bg-black/40 space-y-1 custom-scrollbar">
                    {genericTasks.map(task => {
                      const isChecked = compTaskIds.includes(task.id);
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => {
                            setCompTaskIds(prev => 
                              prev.includes(task.id) ? prev.filter(tid => tid !== task.id) : [...prev, task.id]
                            );
                          }}
                          className={`p-1.5 rounded-lg text-[11px] cursor-pointer flex items-center justify-between border transition-all ${
                            isChecked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-transparent text-slate-400 hover:bg-white/[0.02]'
                          }`}
                        >
                          <span className="truncate">{task.title}</span>
                          <span className="font-mono text-[8px] uppercase ml-2 px-1 text-slate-500">{task.family}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsComponentModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium text-xs uppercase"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                  >
                    Register Component
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standard Action creation Modal */}
      <AnimatePresence>
        {isActionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsActionModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e1017] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-400" /> Register Action Verb
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-medium">Add high-fidelity surgical actions to govern standard maintenance entry behavior.</p>

              <form onSubmit={handleCreateStandardAction} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Action Name (Verb)</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Lubrification, Remplacement Crépine, Réalignement"
                    value={actionName}
                    onChange={(e) => setActionName(e.target.value)}
                    className="titan-input py-2 px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Action Nature (System Type)</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="titan-input py-2 px-3 text-sm bg-black"
                  >
                    <option value="PREV">PREV (Preventive: Lubricate, Clean, Scheduled Swap)</option>
                    <option value="CORR">CORR (Corrective: Emergency Repair, Sudden Swap)</option>
                    <option value="BOTH">BOTH (Hybrid: Montage, Installation, Upgrades)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Description & Guidelines</label>
                  <textarea 
                    placeholder="Describe exact procedural parameters..."
                    value={actionDesc}
                    onChange={(e) => setActionDesc(e.target.value)}
                    rows={3}
                    className="titan-input py-2 px-3 text-sm bg-black font-sans resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsActionModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium text-xs uppercase"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-[0_4px_12px_rgba(168,85,247,0.2)]"
                  >
                    Register Verb
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blueprint Assembly Configuration Overlay Modal */}
      <AnimatePresence>
        {selectedBlueprintIdForAssembly && (
          <BlueprintAssemblyModal
            blueprintId={selectedBlueprintIdForAssembly}
            onClose={() => setSelectedBlueprintIdForAssembly(null)}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* Sovereign Life History Modal */}
      <AnimatePresence>
        {lifeHistoryComponentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLifeHistoryComponentId(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-[#0d0e15] border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-400" /> Component Life History (Sovereign View)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Across all factory machinery</p>
                </div>
                <button onClick={() => setLifeHistoryComponentId(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(() => {
                const comp = standardComponents.find(c => c.id === lifeHistoryComponentId);
                const execs = allExecutions.filter(e => e.componentId === lifeHistoryComponentId).sort((a,b) => new Date(b.executedAt || b.scheduledDate).getTime() - new Date(a.executedAt || a.scheduledDate).getTime());
                return (
                  <div className="space-y-6">
                    <div className="p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-2xl flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-black text-indigo-300 uppercase tracking-widest">{comp?.name || 'Unknown Component'}</h3>
                        <p className="text-[10px] text-indigo-200/50 uppercase font-mono mt-1">Total Sovereign Operations: {execs.length}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Component className="w-6 h-6 text-indigo-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {execs.length === 0 ? (
                        <p className="text-sm text-slate-500 italic text-center py-10">No service records found across the industrial floor for this Component.</p>
                      ) : (
                        execs.map(ex => {
                          const machine = machines.find(m => m.id === ex.machineId);
                          const action = standardActions.find(a => a.id === ex.actionId);
                          const isCorr = ex.serviceType === 'CORR';
                          return (
                            <div key={ex.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${isCorr ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                    {isCorr ? 'Corrective Surgery' : 'Preventive Care'}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">{ex.executedAt ? new Date(ex.executedAt).toLocaleString() : 'Pending'}</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-200 mt-1 uppercase tracking-wide">
                                  Action: <span className={isCorr ? 'text-red-300' : 'text-emerald-300'}>{action?.name || ex.taskId}</span>
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">"{ex.notes || 'No extensive notes provided'}"</p>
                              </div>
                              <div className="md:text-right shrink-0">
                                <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Target Host</span>
                                <span className="block text-sm font-mono font-black text-indigo-300">{machine?.referenceCode || 'System Unlinked'}</span>
                                <span className="block text-[10px] text-slate-500 mt-1 max-w-[150px] truncate">{machine?.serialNumber || 'N/A'}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onConfirm={handleSyncLaboratory}
        variant="warning"
        title="Knowledge Base Injection"
        description="This protocol will synchronize your laboratory with the latest industrial definitions from the master file. New families and machine templates will be injected. Existing custom records remain untouched. Continue injection?"
        confirmText="Confirm Sync"
        cancelText="Abort"
        isLoading={isSyncing}
        requireVerification="SYNC"
      />

      <ConfirmationModal
        isOpen={!!deleteContext}
        onClose={() => setDeleteContext(null)}
        onConfirm={confirmDelete}
        variant="danger"
        title="Execute Permanant Deletion"
        description="Attention: You are about to purge this record from the Engineering Lab. This action is irreversible and may affect cross-linked operational data. Confirm deletion of the selected entity?"
        confirmText="Purge Record"
        cancelText="Abort Deletion"
      />
    </motion.div>
  );
}
