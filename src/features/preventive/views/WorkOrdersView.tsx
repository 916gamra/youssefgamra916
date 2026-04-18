import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HardHat, Clock, CheckCircle2, Circle, AlertTriangle, Cpu, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/core/db';
import { cn } from '@/shared/utils';

export function WorkOrdersView() {
  const workOrders = useLiveQuery(() => db.pmWorkOrders.reverse().sortBy('scheduledDate'));
  const machines = useLiveQuery(() => db.machines.toArray());
  const checklists = useLiveQuery(() => db.pmChecklists.toArray());
  // Fetch tasks only if an order is selected
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const selectedOrder = workOrders?.find(o => o.id === selectedOrderId);
  
  const selectedTasks = useLiveQuery(
    () => selectedOrder ? db.pmTasks.where('checklistId').equals(selectedOrder.checklistId).sortBy('order') : [],
    [selectedOrder?.checklistId]
  );

  // Local state to track checked tasks during the operation
  const [checkedTaskIds, setCheckedTaskIds] = useState<Set<string>>(new Set());

  const handleSelectOrder = async (order: any) => {
    setSelectedOrderId(order.id);
    setCheckedTaskIds(new Set()); // Reset checklist for the newly opened order
    
    // Automatically shift to IN_PROGRESS if it was PENDING when viewed
    if (order.status === 'PENDING') {
      try {
        await db.pmWorkOrders.update(order.id, { status: 'IN_PROGRESS' });
      } catch (err) {
        console.error('Failed to update order status');
      }
    }
  };

  const toggleTask = (taskId: string) => {
    const newSet = new Set(checkedTaskIds);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setCheckedTaskIds(newSet);
  };

  const handleCompleteWorkOrder = async () => {
    if (!selectedOrder) return;
    try {
      await db.pmWorkOrders.update(selectedOrder.id, {
        status: 'COMPLETED',
        completedDate: new Date().toISOString()
      });
      toast.success('Operation Protocol Completed successfully!', {
        icon: <ShieldCheck className="text-emerald-400" />
      });
      setSelectedOrderId(null); // Return to list view
    } catch (err) {
      toast.error('Failed to finalize Work Order');
    }
  };

  const getMachineName = (id: string) => machines?.find(m => m.id === id)?.name || 'Unknown Machine';
  const getMachineCode = (id: string) => machines?.find(m => m.id === id)?.referenceCode || '---';
  const getChecklistName = (id: string) => checklists?.find(c => c.id === id)?.name || 'Unknown Protocol';

  // Windows 11 style grouping
  const pendingOrders = workOrders?.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS') || [];
  const completedOrders = workOrders?.filter(o => o.status === 'COMPLETED') || [];

  const allCriticalTasksDone = selectedTasks?.filter(t => t.isCritical).every(t => checkedTaskIds.has(t.id)) ?? false;
  const isCompletionReady = (selectedTasks?.length || 0) > 0 && allCriticalTasksDone;

  return (
    <div className="w-full h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
      
      {/* LEFT PANEL: Windows 11 Explorer Style List */}
      <div className="w-full md:w-[35%] flex flex-col h-full bg-black/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl shrink-0">
        <div className="p-5 border-b border-white/5 flex items-center bg-white/5">
          <h2 className="text-white font-semibold tracking-widest uppercase flex items-center gap-2">
            <HardHat className="w-5 h-5 text-emerald-400" />
            Field Operations
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
          {(!workOrders || workOrders.length === 0) && (
            <div className="text-center p-8 text-white/30 text-sm flex flex-col items-center">
               <ShieldCheck className="w-12 h-12 mb-3 opacity-20" />
               No work orders assigned.<br/>Systems nominal.
            </div>
          )}

          {/* Pending Group */}
          {pendingOrders.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-2 ml-2">Active & Pending</h3>
              <div className="space-y-1">
                {pendingOrders.map(order => (
                  <button 
                    key={order.id} 
                    onClick={() => handleSelectOrder(order)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl transition-all duration-300 flex items-center gap-4",
                      selectedOrderId === order.id 
                        ? "bg-emerald-500/20 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                        : "bg-transparent border border-transparent hover:bg-white/5"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner border",
                      order.status === 'IN_PROGRESS' ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-white/5 text-white/50 border-white/10"
                    )}>
                      {order.status === 'IN_PROGRESS' ? <Clock className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn("font-medium text-sm truncate", selectedOrderId === order.id ? "text-emerald-400" : "text-white")}>
                        {getMachineName(order.machineId)}
                      </h4>
                      <p className="text-xs text-white/40 truncate">{getChecklistName(order.checklistId)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Completed Group */}
          {completedOrders.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-2 ml-2">Completed Logs</h3>
              <div className="space-y-1">
                {completedOrders.map(order => (
                  <button 
                    key={order.id} 
                    onClick={() => handleSelectOrder(order)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl transition-all duration-300 flex items-center gap-4 opacity-70",
                      selectedOrderId === order.id 
                        ? "bg-emerald-500/10 border border-emerald-500/20" 
                        : "bg-transparent border border-transparent hover:bg-white/5"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-400/50 border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-white/60 truncate">{getMachineName(order.machineId)}</h4>
                      <p className="text-xs text-white/40 truncate">{new Date(order.completedDate || '').toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANEL: Windows Settings Style Detail */}
      <div className="flex-1 h-full bg-black/50 backdrop-blur-3xl rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative">
        <AnimatePresence mode="wait">
          {!selectedOrderId || !selectedOrder ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-white/20"
            >
              <Cpu className="w-24 h-24 mb-6 opacity-30" />
              <p className="text-xl font-medium tracking-widest uppercase">Command Details</p>
              <p className="text-sm mt-2 font-normal opacity-60">Select an operation to review tasks</p>
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                    selectedOrder.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    selectedOrder.status === 'IN_PROGRESS' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-white/5 text-white/50 border-white/10"
                  )}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-white/30 font-medium font-mono uppercase">
                    {new Date(selectedOrder.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight mb-1">{getMachineName(selectedOrder.machineId)}</h2>
                <div className="flex items-center gap-2 text-emerald-400/80 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  {getChecklistName(selectedOrder.checklistId)}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                {selectedOrder.status !== 'COMPLETED' && (
                  <p className="text-sm text-white/50 mb-6">
                    Please perform the following inspection steps. Critical steps <span className="text-red-400 inline-flex items-center"><AlertTriangle className="w-3 h-3 mx-1"/> must</span> be completed.
                  </p>
                )}

                <div className="space-y-3">
                  {selectedTasks?.map(task => {
                    const isChecked = checkedTaskIds.has(task.id) || selectedOrder.status === 'COMPLETED';
                    return (
                      <button 
                        key={task.id}
                        disabled={selectedOrder.status === 'COMPLETED'}
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 group",
                          isChecked 
                            ? "bg-emerald-500/5 border-emerald-500/30" 
                            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10",
                          selectedOrder.status === 'COMPLETED' ? "opacity-70 cursor-default" : ""
                        )}
                      >
                        <div className={cn("mt-0.5 shrink-0 transition-colors", 
                           isChecked ? "text-emerald-400" : "text-white/30 group-hover:text-white/50"
                        )}>
                          {isChecked ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm font-medium transition-colors", isChecked ? "text-white" : "text-white/80")}>
                            {task.taskDescription}
                          </p>
                          {task.isCritical && (
                            <div className="flex items-center gap-1 mt-2 text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full w-max">
                              <AlertTriangle className="w-3 h-3" /> Critical Step
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedOrder.status !== 'COMPLETED' && (
                <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end items-center gap-4">
                  {!isCompletionReady && selectedTasks && selectedTasks.length > 0 && (
                    <span className="text-xs text-amber-400/80 font-medium flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4" /> All critical tasks must be checked
                    </span>
                  )}
                  <button 
                    onClick={handleCompleteWorkOrder}
                    disabled={!isCompletionReady}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-widest uppercase text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-30 disabled:shadow-none disabled:hover:bg-emerald-500 flex items-center gap-2"
                  >
                    Confirm Operation <Check className="w-4 h-4" />
                  </button>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
