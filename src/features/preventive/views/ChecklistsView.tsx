import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, ListChecks, ShieldAlert, CheckCircle2, ChevronRight, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { PmChecklistSchema, PmTaskSchema } from '../schema/preventive.schema';
import { cn } from '@/shared/utils';
import { useAuditTrail } from '../../system/hooks/useAuditTrail';
import { GlassCard } from '@/shared/components/GlassCard';

interface ChecklistsViewProps {
  user: User | null;
}

export function ChecklistsView({ user }: ChecklistsViewProps) {
  const checklists = useLiveQuery(() => db.pmChecklists.toArray());
  const { logEvent } = useAuditTrail();
  
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskIsCritical, setNewTaskIsCritical] = useState(false);

  // Fetch tasks only for the selected checklist
  const selectedTasks = useLiveQuery(
    () => selectedChecklistId ? db.pmTasks.where('checklistId').equals(selectedChecklistId).sortBy('order') : [],
    [selectedChecklistId]
  );

  const selectedChecklist = checklists?.find(c => c.id === selectedChecklistId);

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const newChecklist = PmChecklistSchema.parse({
        id: crypto.randomUUID(),
        name: newListName,
        description: newListDesc,
        createdAt: new Date().toISOString()
      });

      await db.pmChecklists.add(newChecklist);
      
      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'CREATE',
        entityType: 'PM_CHECKLIST',
        entityId: newChecklist.id,
        details: { name: newChecklist.name, description: newChecklist.description },
        severity: 'INFO'
      });

      toast.success('Protocol Checklist created successfully');
      setNewListName('');
      setNewListDesc('');
      setIsCreatingList(false);
      setSelectedChecklistId(newChecklist.id);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Validation failed');
    }
  };

  const handleDeleteChecklist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      if (!window.confirm('Are you sure? This will delete the checklist and all its tasks.')) return;
      
      const checklistToDelete = checklists?.find(c => c.id === id);

      await db.transaction('rw', db.pmChecklists, db.pmTasks, async () => {
        await db.pmTasks.where('checklistId').equals(id).delete(); // Cascade delete tasks
        await db.pmChecklists.delete(id);
      });
      
      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'DELETE',
        entityType: 'PM_CHECKLIST',
        entityId: id,
        details: { name: checklistToDelete?.name },
        severity: 'WARNING'
      });

      toast.success('Checklist deleted');
      if (selectedChecklistId === id) setSelectedChecklistId(null);
    } catch (err) {
      toast.error('Failed to delete checklist');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChecklistId || !user) return;

    try {
      const currentTasks = await db.pmTasks.where('checklistId').equals(selectedChecklistId).toArray();
      const nextOrder = currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.order)) + 1 : 0;

      const newTask = PmTaskSchema.parse({
        id: crypto.randomUUID(),
        checklistId: selectedChecklistId,
        order: nextOrder,
        taskDescription: newTaskDesc,
        isCritical: newTaskIsCritical
      });

      await db.pmTasks.add(newTask);
      
      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'UPDATE', // Adding a task to a checklist is effectively updating the protocol
        entityType: 'PM_CHECKLIST_TASK',
        entityId: newTask.id,
        details: { checklistId: selectedChecklistId, description: newTask.taskDescription, critical: newTask.isCritical },
        severity: 'INFO'
      });

      toast.success('Task added to protocol');
      setNewTaskDesc('');
      setNewTaskIsCritical(false);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await db.pmTasks.delete(taskId);
      
      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'DELETE',
        entityType: 'PM_CHECKLIST_TASK',
        entityId: taskId,
        details: 'Task removed from protocol',
        severity: 'WARNING'
      });

      toast.success('Task removed');
    } catch (err) {
      toast.error('Failed to remove task');
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
      
      {/* LEFT PANEL: Checklists Catalog */}
      <div className="w-full md:w-1/3 flex flex-col h-full shrink-0">
        <GlassCard className="!p-0 flex flex-col h-full overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border-emerald-500/10">
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-emerald-500/5 backdrop-blur-sm relative z-10">
              <h2 className="text-emerald-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                <LayoutList className="w-4 h-4" />
                Maintenance Protocols
              </h2>
              <button 
                onClick={() => setIsCreatingList(!isCreatingList)}
                className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-all active:scale-95 border border-emerald-500/20 shadow-sm"
              >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 relative z-10">
            <AnimatePresence>
              {isCreatingList && (
                <motion.form 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  onSubmit={handleCreateChecklist}
                  className="bg-black/60 p-5 rounded-2xl border border-emerald-500/30 mb-4 shadow-inner overflow-hidden"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Checklist Name</label>
                      <input 
                        type="text" 
                        placeholder="E.g., Monthly Pump Inspection" 
                        value={newListName}
                        onChange={e => setNewListName(e.target.value)}
                        className="w-full titan-input py-2.5"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description (Optional)</label>
                      <textarea 
                        placeholder="Brief purpose of this protocol..." 
                        value={newListDesc}
                        onChange={e => setNewListDesc(e.target.value)}
                        className="w-full titan-input py-2.5 resize-none h-20"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setIsCreatingList(false)} className="titan-button titan-button-outline flex-1 !px-3 !py-2.5">Cancel</button>
                      <button type="submit" disabled={!newListName.trim()} className="titan-button border-0 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] flex-1 !px-3 !py-2.5 disabled:opacity-50">Create</button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {checklists?.length === 0 && !isCreatingList && (
              <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <ListChecks className="w-12 h-12 mb-4 text-emerald-500/20" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No protocols found</p>
                <p className="text-xs text-slate-400 mt-1">Create your first checklist</p>
              </div>
            )}

            {checklists?.map(list => (
              <motion.div 
                layout
                key={list.id} 
                onClick={() => setSelectedChecklistId(list.id)}
                className={cn(
                  "group cursor-pointer p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                  selectedChecklistId === list.id 
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-[inset_0_1px_rgba(255,255,255,0.05),_0_0_20px_rgba(16,185,129,0.05)]" 
                    : "bg-white/[0.02] border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex-1 pr-4">
                    <h3 className={cn("font-bold text-sm tracking-tight", selectedChecklistId === list.id ? "text-emerald-400" : "text-slate-200")}>{list.name}</h3>
                    {list.description && <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{list.description}</p>}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteChecklist(list.id, e)}
                    className="p-1.5 text-white/10 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {selectedChecklistId === list.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* RIGHT PANEL: Checklist Tasks Builder */}
      <div className="flex-1 h-full flex flex-col shrink-0">
        <GlassCard className="!p-0 flex flex-col h-full overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border-white/5 relative">
          {!selectedChecklistId ? (
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-12">
              <div className="w-32 h-32 rounded-3xl bg-white/[0.01] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                <LayoutList className="w-12 h-12 text-slate-600" />
              </div>
              <p className="text-sm font-bold tracking-widest uppercase text-slate-500">Protocol Builder</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Select a checklist to manage its tasks</p>
            </div>
          ) : (
            <>
              <div className="p-8 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20 shadow-sm">Active Schema</span>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedChecklist?.name}</h2>
                </div>
                <p className="text-sm text-slate-400 font-medium max-w-2xl">{selectedChecklist?.description || 'No description provided.'}</p>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                  <ShieldAlert className="w-24 h-24 text-emerald-500" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar relative z-10">
                <AnimatePresence mode="popLayout">
                  {selectedTasks?.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl bg-white/[0.01]"
                    >
                       <ShieldAlert className="w-12 h-12 text-slate-600 mb-4" />
                       <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Empty Protocol</p>
                       <p className="text-slate-400 text-xs font-medium">This protocol has no defined tasks.</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTasks?.map((task, index) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          key={task.id} 
                          className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-sm font-mono font-bold text-emerald-400 shadow-inner shrink-0 group-hover:scale-105 transition-transform group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
                              {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <div>
                              <p className="text-slate-200 text-sm font-medium tracking-tight group-hover:text-white transition-colors">{task.taskDescription}</p>
                              {task.isCritical && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-rose-400">Critical Checkpoint</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2.5 text-white/10 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Add Task Form */}
              <div className="p-8 border-t border-white/5 bg-white/[0.01] relative z-10 shrink-0">
                <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-5 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">New Maintenance Task</label>
                    <input 
                      type="text" 
                      placeholder="E.g., Analyze vibration metrics on primary rotor assembly..." 
                      value={newTaskDesc}
                      onChange={e => setNewTaskDesc(e.target.value)}
                      className="w-full titan-input py-3"
                    />
                  </div>
                  <div className="flex gap-5 shrink-0 w-full sm:w-auto">
                    <div className="flex flex-col items-center gap-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Critical</label>
                       <button
                         type="button"
                         onClick={() => setNewTaskIsCritical(!newTaskIsCritical)}
                         className={cn(
                           "flex-1 w-full min-w-[3rem] rounded-xl border flex items-center justify-center transition-all active:scale-95 py-3",
                           newTaskIsCritical 
                             ? "bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                             : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-white"
                         )}
                       >
                         <ShieldAlert className="w-5 h-5" />
                       </button>
                    </div>
                    <button 
                      type="submit" 
                      disabled={!newTaskDesc.trim()}
                      className="titan-button border-0 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] !px-8 h-[46px] self-end shrink-0 disabled:opacity-50 !py-0"
                    >
                      Append Task
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </GlassCard>
      </div>

    </div>
  );
}

