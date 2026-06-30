import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X, Save, Component, Wrench, Cpu, Zap, Droplet, Wind, ShieldAlert, BadgeInfo, CheckCircle2 } from 'lucide-react';
import { db, MachineBlueprint, StandardComponent, PreventiveTask } from '@/core/db';
import { usePreventiveEngine } from '@/features/preventive/hooks/usePreventiveEngine';
import { toast } from 'sonner';

interface BlueprintAssemblyModalProps {
  blueprintId: string | null;
  onClose: () => void;
  user: any;
}

const FAMILY_ICONS: Record<string, any> = {
  MEC: Wrench,
  ELE: Zap,
  HYD: Droplet,
  PNU: Wind,
  ELN: Cpu
};

const FAMILY_COLORS: Record<string, { badge: string, icon: string }> = {
  MEC: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: 'text-amber-500' },
  ELE: { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: 'text-yellow-400' },
  HYD: { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'text-blue-500' },
  PNU: { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: 'text-cyan-400' },
  ELN: { badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: 'text-purple-500' }
};

export function BlueprintAssemblyModal({ blueprintId, onClose, user }: BlueprintAssemblyModalProps) {
  const { linkTaskToBlueprint, unlinkTaskFromBlueprint } = usePreventiveEngine();
  
  // Queries
  const blueprint = useLiveQuery(() => 
    blueprintId ? db.machineBlueprints.get(blueprintId) : null
  , [blueprintId]);

  const components = useLiveQuery(() => db.standardComponents.toArray(), []) || [];
  const allTasks = useLiveQuery(() => db.preventiveTasks.toArray(), []) || [];

  // Local State
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with db loaded model
  useEffect(() => {
    if (blueprint) {
      setSelectedComponentIds(blueprint.componentIds || []);
    }
  }, [blueprint]);

  if (!blueprintId || !blueprint) return null;

  // Compute calculated preventive tasks that would be inherited
  const selectedComponents = components.filter(c => selectedComponentIds.includes(c.id));
  
  // Aggregate tasks
  const inheritedTaskIds = Array.from(new Set(selectedComponents.flatMap(c => c.taskIds)));
  const inheritedTasks = allTasks.filter(t => inheritedTaskIds.includes(t.id));

  const handleToggleComponent = (componentId: string) => {
    setSelectedComponentIds(prev => 
      prev.includes(componentId) 
        ? prev.filter(id => id !== componentId) 
        : [...prev, componentId]
    );
  };

  const handleSaveAssembly = async () => {
    setIsSaving(true);
    try {
      // 1. Get original linked task IDs to calculate delta
      const originalComponentIds = blueprint.componentIds || [];
      const originalComponents = components.filter(c => originalComponentIds.includes(c.id));
      const originalTaskIds = Array.from(new Set(originalComponents.flatMap(c => c.taskIds)));

      // 2. Identify delta
      const tasksToAdd = inheritedTaskIds.filter(id => !originalTaskIds.includes(id));
      const tasksToRemove = originalTaskIds.filter(id => !inheritedTaskIds.includes(id));

      await db.transaction('rw', [
        db.machineBlueprints, 
        db.blueprintTasks, 
        db.machineTasks, 
        db.machines, 
        db.auditLogs
      ], async () => {
        // Update components assembly
        await db.machineBlueprints.update(blueprint.id, {
          componentIds: selectedComponentIds
        });

        // Cascade link additions
        for (const taskId of tasksToAdd) {
          await linkTaskToBlueprint(blueprint.id, taskId);
        }

        // Cascade link removals
        for (const taskId of tasksToRemove) {
          await unlinkTaskFromBlueprint(blueprint.id, taskId);
        }

        // Add audit trail log
        await db.auditLogs.add({
          id: crypto.randomUUID(),
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'ASSEMBLE_BLUEPRINT',
          entityType: 'MACHINE_BLUEPRINT',
          entityId: blueprint.id,
          details: `Assembled components [${selectedComponents.map(c => c.name).join(', ')}] on blueprint ${blueprint.reference}. Added ${tasksToAdd.length} tasks, removed ${tasksToRemove.length} tasks.`,
          timestamp: new Date().toISOString(),
          severity: 'INFO',
          deviceInfo: navigator.userAgent
        });
      });

      toast.success('Blueprint Assembly successful', {
        description: `Associated standard components and dynamically cascaded ${inheritedTasks.length} tasks down to machines.`
      });
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to save blueprint assembly', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-4xl max-h-[85vh] h-full glass-panel-heavy rounded-3xl overflow-hidden flex flex-col bg-[#0b0c13] border border-white/10"
      >
        {/* Top Glare Edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Component className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                Configure Blueprint <span className="text-indigo-400 font-mono">[{blueprint.reference}]</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Assemble machine model out of global component library</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column: Component Assembly */}
          <div className="p-6 border-r border-white/5 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                ⚙️ Assembly Blocks (Matières Standard)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">Select elements composing this physical model. Adding elements will inherit their specific preventive plans.</p>
            </div>

            {components.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl p-8 bg-white/[0.01] min-h-[220px]">
                <Component className="w-12 h-12 text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">No components defined</p>
                <p className="text-xs text-slate-500 text-center mt-1">Add modular components first in the Components Library.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {components.map(comp => {
                  const compFamilyConfig = FAMILY_COLORS[comp.family] || { badge: 'bg-slate-500/10 text-slate-400', icon: '' };
                  const ComponentIcon = FAMILY_ICONS[comp.family] || Component;
                  const isChecked = selectedComponentIds.includes(comp.id);

                  return (
                    <div 
                      key={comp.id}
                      onClick={() => handleToggleComponent(comp.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'bg-indigo-505/10 border-indigo-500/40 bg-indigo-500/[0.04] shadow-[0_4px_20px_rgba(99,102,241,0.1)]' 
                          : 'bg-black/30 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${compFamilyConfig.badge.split(' ')[0]}`}>
                          <ComponentIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{comp.name}</h4>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${compFamilyConfig.badge} mt-1 inline-block`}>
                            {comp.family}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">{comp.taskIds?.length || 0} Tasks</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'bg-indigo-500 border-indigo-500 text-[#050508]' 
                            : 'border-white/20'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Dynamic DNA Inherited Tasks Preview */}
          <div className="p-6 bg-black/30 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                🧬 Live Preventive Plan Preview
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">Dynamic inheritance results based on current assembly selection.</p>
            </div>

            {inheritedTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl p-8 min-h-[220px]">
                <ShieldAlert className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Empty Preventive DNA</p>
                <p className="text-xs text-slate-500 text-center mt-1">Select components on the left to inherits standard preventive tasks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inheritedTasks.map(task => {
                  const taskFamilyConfig = FAMILY_COLORS[task.family] || { badge: 'bg-slate-500/10 text-slate-400', icon: '' };
                  const TaskIcon = FAMILY_ICONS[task.family] || Wrench;

                  return (
                    <div key={task.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${taskFamilyConfig.badge}`}>
                        <TaskIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[8px] uppercase tracking-wider px-1 px-1.5 py-0.5 rounded border font-mono font-bold ${taskFamilyConfig.badge}`}>
                            {task.family}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">Frequency: {task.frequencyValue} Days</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer Area */}
        <div className="p-6 border-t border-white/5 flex gap-3 bg-white/[0.01]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAssembly}
            disabled={isSaving}
            className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-[#050508] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Assembling...' : 'Apply Modular Assembly'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
