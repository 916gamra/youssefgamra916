import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, ListChecks, ShieldAlert, CheckCircle2, ChevronRight, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { PmChecklistSchema, PmTaskSchema } from '../schema/preventive.schema';
import { cn } from '@/shared/utils';
import { useAuditTrail } from '../../system/hooks/useAuditTrail';

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
      <div className="w-full md:w-1/3 flex flex-col h-full titan-card overflow-hidden shrink-0">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-emerald-500/5">
            <h2 className="text-emerald-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
              <LayoutList className="w-4 h-4" />
              Maintenance Protocols
            </h2>
            <button 
              onClick={() => setIsCreatingList(!isCreatingList)}
              className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-all active:scale-95 border border-emerald-500/20"
            >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          <AnimatePresence>
            {isCreatingList && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateChecklist}
                className="bg-black/60 p-4 rounded-2xl border border-emerald-500/30 mb-4 shadow-inner"
              >
                <div className="space-y-3">
                  <div>
                    <label className="titan-label text-[10px] mb-1.5">Checklist Name</label>
                    <input 
                      type="text" 
                      placeholder="E.g., Monthly Pump Inspection" 
                      value={newListName}
                      onChange={e => setNewListName(e.target.value)}
                      className="w-full titan-input text-sm py-2"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="titan-label text-[10px] mb-1.5">Description (Optional)</label>
                    <textarea 
                      placeholder="Brief purpose of this protocol..." 
                      value={newListDesc}
                      onChange={e => setNewListDesc(e.target.value)}
                      className="w-full titan-input text-sm py-2 resize-none h-16"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setIsCreatingList(false)} className="flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#8b9bb4] hover:text-white bg-white/5 rounded-lg border border-white/5 transition-all">Cancel</button>
                    <button type="submit" disabled={!newListName.trim()} className="flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-black bg-emerald-500 rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-all">Create</button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {checklists?.length === 0 && !isCreatingList && (
            <div className="text-center p-8 text-white/30 text-sm">
              <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-20" />
              No protocols found.<br/>Create your first checklist.
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
                  : "bg-white/[0.02] border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.05]"
              )}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="flex-1 pr-4">
                  <h3 className={cn("font-bold text-sm tracking-tight", selectedChecklistId === list.id ? "text-emerald-400" : "text-white/90")}>{list.name}</h3>
                  {list.description && <p className="text-[10px] text-[#8b9bb4] mt-1 line-clamp-1">{list.description}</p>}
                </div>
                <button 
                  onClick={(e) => handleDeleteChecklist(list.id, e)}
                  className="p-1.5 text-white/10 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
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
      </div>

      {/* RIGHT PANEL: Checklist Tasks Builder */}
      <div className="flex-1 h-full titan-card overflow-hidden flex flex-col relative">
        {!selectedChecklistId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10 p-12">
            <div className="w-32 h-32 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
              <LayoutList className="w-16 h-16 opacity-30" />
            </div>
            <p className="text-sm font-bold tracking-widest uppercase opacity-40">Protocol Builder</p>
            <p className="text-xs text-[#8b9bb4] mt-2">Select a checklist to manage its tasks</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Active Schema</span>
                <h2 className="text-xl font-bold text-white tracking-tight">{selectedChecklist?.name}</h2>
              </div>
              <p className="text-sm text-slate-400 font-medium">{selectedChecklist?.description || 'No description provided.'}</p>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
                <ShieldAlert className="w-16 h-16" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {selectedTasks?.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                     <ShieldAlert className="w-16 h-16 text-[#8b9bb4]/10 mx-auto mb-4" />
                     <p className="text-slate-400 text-sm">This protocol has no defined tasks.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {selectedTasks?.map((task, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        key={task.id} 
                        className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 shadow-inner shrink-0">
                            {(index + 1).toString().padStart(2, '0')}
                          </div>
                          <div>
                            <p className="text-white/90 text-sm font-medium tracking-tight group-hover:text-white transition-colors">{task.taskDescription}</p>
                            {task.isCritical && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Critical Checkpoint</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-white/10 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
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
            <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
              <form onSubmit={handleCreateTask} className="flex gap-6 items-end">
                <div className="flex-1">
                  <label className="titan-label text-[10px] mb-2">New Maintenance Task</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Analyze vibration metrics on primary rotor assembly..." 
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    className="w-full titan-input py-3"
                  />
                </div>
                <div className="flex flex-col items-center gap-2 pb-1">
                   <label className="text-[10px] font-bold text-[#8b9bb4] uppercase tracking-widest">Critical</label>
                   <button
                     type="button"
                     onClick={() => setNewTaskIsCritical(!newTaskIsCritical)}
                     className={cn(
                       "w-12 h-12 rounded-xl border flex items-center justify-center transition-all active:scale-90",
                       newTaskIsCritical 
                         ? "bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                         : "bg-white/5 border-white/10 text-white/10 hover:border-white/20"
                     )}
                   >
                     <ShieldAlert className="w-6 h-6" />
                   </button>
                </div>
                <button 
                  type="submit" 
                  disabled={!newTaskDesc.trim()}
                  className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 shrink-0"
                >
                  Append Task <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

