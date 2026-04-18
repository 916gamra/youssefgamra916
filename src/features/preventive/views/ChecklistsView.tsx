import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, ListChecks, ShieldAlert, CheckCircle2, ChevronRight, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/core/db';
import { PmChecklistSchema, PmTaskSchema } from '../schema/preventive.schema';
import { cn } from '@/shared/utils';

export function ChecklistsView() {
  const checklists = useLiveQuery(() => db.pmChecklists.toArray());
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
    try {
      const newChecklist = PmChecklistSchema.parse({
        id: crypto.randomUUID(),
        name: newListName,
        description: newListDesc,
        createdAt: new Date().toISOString()
      });

      await db.pmChecklists.add(newChecklist);
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
    try {
      if (!window.confirm('Are you sure? This will delete the checklist and all its tasks.')) return;
      
      await db.transaction('rw', db.pmChecklists, db.pmTasks, async () => {
        await db.pmTasks.where('checklistId').equals(id).delete(); // Cascade delete tasks
        await db.pmChecklists.delete(id);
      });
      
      toast.success('Checklist deleted');
      if (selectedChecklistId === id) setSelectedChecklistId(null);
    } catch (err) {
      toast.error('Failed to delete checklist');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChecklistId) return;

    try {
      // Calculate next order
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
      toast.success('Task added to protocol');
      setNewTaskDesc('');
      setNewTaskIsCritical(false);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await db.pmTasks.delete(taskId);
      toast.success('Task removed');
    } catch (err) {
      toast.error('Failed to remove task');
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
      
      {/* LEFT PANEL: Checklists Catalog */}
      <div className="w-full md:w-1/3 flex flex-col h-full bg-black/40 backdrop-blur-md rounded-3xl border border-emerald-500/20 overflow-hidden shadow-2xl shrink-0">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-emerald-500/5">
          <h2 className="text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-2">
            <LayoutList className="w-5 h-5" />
            Protocols Hub
          </h2>
          <button 
            onClick={() => setIsCreatingList(!isCreatingList)}
            className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          <AnimatePresence>
            {isCreatingList && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateChecklist}
                className="bg-black/50 p-4 rounded-2xl border border-emerald-500/30 mb-4"
              >
                <input 
                  type="text" 
                  placeholder="Checklist Name" 
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white mb-2 text-sm focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
                <textarea 
                  placeholder="Description (Optional)" 
                  value={newListDesc}
                  onChange={e => setNewListDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white mb-3 text-sm focus:border-emerald-500 focus:outline-none resize-none h-20"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsCreatingList(false)} className="flex-1 px-3 py-2 text-xs font-medium text-white/50 bg-white/5 rounded-lg hover:bg-white/10">Cancel</button>
                  <button type="submit" disabled={!newListName.trim()} className="flex-1 px-3 py-2 text-xs font-bold text-black bg-emerald-500 rounded-lg hover:bg-emerald-400 disabled:opacity-50">Create</button>
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
            <div 
              key={list.id} 
              onClick={() => setSelectedChecklistId(list.id)}
              className={cn(
                "group cursor-pointer p-4 rounded-2xl border transition-all duration-300",
                selectedChecklistId === list.id 
                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h3 className={cn("font-bold text-sm", selectedChecklistId === list.id ? "text-emerald-400" : "text-white")}>{list.name}</h3>
                  {list.description && <p className="text-xs text-white/40 mt-1 line-clamp-1">{list.description}</p>}
                </div>
                <button 
                  onClick={(e) => handleDeleteChecklist(list.id, e)}
                  className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Checklist Tasks Builder */}
      <div className="flex-1 h-full bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
        {!selectedChecklistId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
            <LayoutList className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-lg font-medium tracking-widest uppercase">Select a Protocol</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-transparent">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedChecklist?.name}</h2>
              <p className="text-sm text-emerald-400/70">{selectedChecklist?.description || 'No description provided.'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {selectedTasks?.length === 0 ? (
                <div className="text-center py-10">
                   <ShieldAlert className="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
                   <p className="text-white/50">This protocol has no operational tasks.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTasks?.map((task, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={task.id} 
                      className="group flex items-center justify-between p-4 bg-white/5 hover:bg-emerald-500/5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-xs font-bold text-white/50">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{task.taskDescription}</p>
                          {task.isCritical && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400">
                              <ShieldAlert className="w-3 h-3" /> Critical Step
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Task Form */}
            <div className="p-5 border-t border-white/10 bg-black/60">
              <form onSubmit={handleCreateTask} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-emerald-400/70 mb-2 uppercase tracking-wider">New Operation Task</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Inspect oil pressure gauge and record values..." 
                    value={newTaskDesc}
                    onChange={e => setNewTaskDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <label className="flex flex-col items-center justify-center h-full pb-2 cursor-pointer group">
                  <span className="text-[10px] font-bold text-white/40 mb-2 uppercase tracking-widest group-hover:text-red-400 transition-colors">Critical</span>
                  <div className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                    newTaskIsCritical ? "bg-red-500/20 border-red-500/50 text-red-500" : "bg-white/5 border-white/10 text-transparent"
                  )}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <input type="checkbox" className="hidden" checked={newTaskIsCritical} onChange={e => setNewTaskIsCritical(e.target.checked)} />
                </label>
                <button 
                  type="submit" 
                  disabled={!newTaskDesc.trim()}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  Add Task <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
