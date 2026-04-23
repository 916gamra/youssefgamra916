import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HardHat, Clock, CheckCircle2, Circle, AlertTriangle, Cpu, ShieldCheck, Check, ChevronRight, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { cn } from '@/shared/utils';
import { useAuditTrail } from '../../system/hooks/useAuditTrail';

interface WorkOrdersViewProps {
  user: User | null;
}

export function WorkOrdersView({ user }: WorkOrdersViewProps) {
  const workOrders = useLiveQuery(() => db.pmWorkOrders.reverse().sortBy('scheduledDate'));
  const machines = useLiveQuery(() => db.machines.toArray());
  const checklists = useLiveQuery(() => db.pmChecklists.toArray());
  const { logEvent } = useAuditTrail();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const selectedOrder = workOrders?.find(o => o.id === selectedOrderId);
  
  const selectedTasks = useLiveQuery(
    () => selectedOrder ? db.pmTasks.where('checklistId').equals(selectedOrder.checklistId).sortBy('order') : [],
    [selectedOrder?.checklistId]
  );

  const [checkedTaskIds, setCheckedTaskIds] = useState<Set<string>>(new Set());

  const handleSelectOrder = async (order: any) => {
    setSelectedOrderId(order.id);
    setCheckedTaskIds(new Set()); 
    
    if (order.status === 'PENDING') {
      try {
        await db.pmWorkOrders.update(order.id, { status: 'IN_PROGRESS' });
        if (user) {
          await logEvent({
            userId: user.id || 0,
            userName: user.name,
            action: 'UPDATE',
            entityType: 'PM_WORK_ORDER',
            entityId: order.id,
            details: { status: 'IN_PROGRESS' },
            severity: 'INFO'
          });
        }
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
    if (!selectedOrder || !user) return;
    try {
      await db.pmWorkOrders.update(selectedOrder.id, {
        status: 'COMPLETED',
        completedDate: new Date().toISOString()
      });

      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'UPDATE',
        entityType: 'PM_WORK_ORDER',
        entityId: selectedOrder.id,
        details: { 
          status: 'COMPLETED',
          tasksCompletedCount: checkedTaskIds.size,
          machineId: selectedOrder.machineId
        },
        severity: 'INFO'
      });

      toast.success('Operation Protocol Completed successfully!', {
        icon: <ShieldCheck className="text-emerald-400" />
      });
      setSelectedOrderId(null); 
    } catch (err) {
      toast.error('Failed to finalize Work Order');
    }
  };

  const getMachineName = (id: string) => machines?.find(m => m.id === id)?.name || 'Unknown Machine';
  const getChecklistName = (id: string) => checklists?.find(c => c.id === id)?.name || 'Unknown Protocol';

  const pendingOrders = workOrders?.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS') || [];
  const completedOrders = workOrders?.filter(o => o.status === 'COMPLETED') || [];

  const allCriticalTasksDone = selectedTasks?.filter(t => t.isCritical).every(t => checkedTaskIds.has(t.id)) ?? false;
  const isCompletionReady = (selectedTasks?.length || 0) > 0 && allCriticalTasksDone;

  return (
    <div className="w-full h-full flex flex-col md:flex-row p-6 lg:p-8 gap-8 overflow-hidden bg-transparent">
      
      {/* LEFT PANEL: Deployment List */}
      <div className="w-full md:w-[32%] flex flex-col h-full titan-card p-0 overflow-hidden shrink-0 border-white/10 bg-black/40">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-3">
            <HardHat className="w-4 h-4 text-emerald-500 " />
            DEPLOYMENT QUEUE
          </h2>
          <span className="text-[10px] text-blue-500 font-mono font-bold">ACTIVE OPS</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
          {(!workOrders || workOrders.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full opacity-30 px-6 text-center">
               <ShieldCheck className="w-16 h-16 mb-4 text-[#8b9bb4]" />
               <p className="text-xs font-bold uppercase tracking-widest text-[#8b9bb4]">Zero Active Deployments</p>
               <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b9bb4]">All equipment maintenance is up to date</p>
            </div>
          )}

          {/* Pending Group */}
          {pendingOrders.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-[#8b9bb4] font-bold mb-4 ml-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE DEPLOYMENTS
              </h3>
              <div className="space-y-3">
                {pendingOrders.map(order => (
                  <button 
                    key={order.id} 
                    onClick={() => handleSelectOrder(order)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 relative overflow-hidden group",
                      selectedOrderId === order.id 
                        ? "bg-emerald-500/10 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                        : "bg-white/[0.01] border border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                    )}
                  >
                    {selectedOrderId === order.id && (
                       <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    )}
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 shadow-inner",
                      order.status === 'IN_PROGRESS' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-white/5 text-white/50 border-white/10"
                    )}>
                      {order.status === 'IN_PROGRESS' ? <Clock className="w-6 h-6 " /> : <HardHat className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn("font-bold text-sm tracking-tight truncate transition-colors", selectedOrderId === order.id ? "text-white" : "text-[#8b9bb4]")}>
                        {getMachineName(order.machineId)}
                      </h4>
                      <p className="text-[10px] text-[#8b9bb4]/60 truncate font-bold uppercase tracking-tight mt-0.5">{getChecklistName(order.checklistId)}</p>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 transition-all opacity-0 group-hover:opacity-100", selectedOrderId === order.id ? "text-emerald-500 translate-x-0" : "text-[#8b9bb4] -translate-x-2")} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Completed Group */}
          {completedOrders.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-[#8b9bb4] font-bold mb-4 ml-2 opacity-50">ARCHIVED MISSIONS</h3>
              <div className="space-y-2">
                {completedOrders.map(order => (
                  <button 
                    key={order.id} 
                    onClick={() => handleSelectOrder(order)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 opacity-60 grayscale hover:grayscale-0",
                      selectedOrderId === order.id 
                        ? "bg-white/10 border border-white/20" 
                        : "bg-transparent border border-transparent hover:bg-white/5"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5 text-white/20 border border-white/10 shadow-inner">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-white/60 truncate">{getMachineName(order.machineId)}</h4>
                      <p className="text-[9px] text-[#8b9bb4] font-mono tracking-widest">{new Date(order.completedDate || '').toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANEL: Terminal */}
      <div className="flex-1 h-full titan-card p-0 flex flex-col bg-black/60 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {!selectedOrderId || !selectedOrder ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-32 h-32 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-10 overflow-hidden relative group">
                 <div className="absolute inset-0 bg-emerald-500/5 rotate-45 scale-150 transition-all group-hover:rotate-90 duration-700" />
                 <Cpu className="w-14 h-14 text-[#8b9bb4] opacity-20 relative z-10" />
              </div>
              <p className="text-xl font-bold tracking-widest uppercase text-slate-400">Select Work Order</p>
              <p className="text-[10px] mt-4 font-bold text-[#8b9bb4] uppercase tracking-widest max-w-xs opacity-60">Select an active deployment from the queue to initiate review</p>
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col h-full"
            >
              <div className="p-10 border-b border-white/5 relative overflow-hidden bg-white/[0.01]">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                
                <div className="flex items-center gap-4 mb-6">
                  <span className={cn("px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm",
                    selectedOrder.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                    selectedOrder.status === 'IN_PROGRESS' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                    "bg-white/5 text-[#8b9bb4] border-white/10"
                  )}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] text-[#8b9bb4] font-mono tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                    DEPLOYED: {new Date(selectedOrder.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
                
                <h2 className="text-3xl font-bold text-white tracking-tight mb-2 uppercase leading-none">
                  {getMachineName(selectedOrder.machineId)}
                </h2>
                
                <div className="flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-widest text-[10px]">
                  <Activity className="w-4 h-4 shadow-[0_0_10px_#10b981aa]" />
                  {getChecklistName(selectedOrder.checklistId)}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                
                {selectedOrder.status !== 'COMPLETED' && (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-md">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-widest">Protocol Requirements</h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">All checked items must be physically verified. Critical markers require mandatory confirmation for order completion.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedTasks?.map((task, index) => {
                    const isChecked = checkedTaskIds.has(task.id) || selectedOrder.status === 'COMPLETED';
                    return (
                      <button 
                        key={task.id}
                        disabled={selectedOrder.status === 'COMPLETED'}
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "w-full text-left p-6 rounded-3xl border transition-all duration-500 flex items-start gap-6 group relative overflow-hidden",
                          isChecked 
                            ? "bg-emerald-500/[0.03] border-emerald-500/40 shadow-[inner_0_0_15px_rgba(16,185,129,0.05)]" 
                            : "bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.04]",
                          selectedOrder.status === 'COMPLETED' ? "opacity-70 cursor-default grayscale" : ""
                        )}
                      >
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[40px] font-bold text-white/[0.02] -z-10 select-none group-hover:text-white/[0.04] transition-all">
                            {(index + 1).toString().padStart(2, '0')}
                         </div>
                         
                        <div className={cn("mt-1 shrink-0 transition-all duration-500 group-hover:scale-110", 
                           isChecked ? "text-emerald-500 " : "text-[#8b9bb4]/30 group-hover:text-[#8b9bb4]/60"
                        )}>
                          {isChecked ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm font-bold tracking-tight transition-colors", isChecked ? "text-white" : "text-[#8b9bb4]/80")}>
                            {task.taskDescription}
                          </p>
                          {task.isCritical && (
                            <div className={cn(
                              "flex items-center gap-1.5 mt-3 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg w-max border shadow-sm",
                              isChecked ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20 "
                            )}>
                              <AlertTriangle className="w-3 h-3" /> Mandatory Validation
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedOrder.status !== 'COMPLETED' && (
                <div className="p-8 border-t border-white/5 bg-black/40 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col">
                    {!isCompletionReady && selectedTasks && selectedTasks.length > 0 && (
                      <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-amber-500 " />
                         PENDING CRITICAL CHECKS
                      </span>
                    )}
                    <span className="text-[9px] text-[#8b9bb4] font-medium tracking-[0.1em] opacity-40 mt-0.5">
                       {checkedTaskIds.size} of {selectedTasks?.length} steps validated
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleCompleteWorkOrder}
                    disabled={!isCompletionReady}
                    className={cn(
                      "px-8 py-3 font-bold tracking-widest uppercase text-xs rounded-xl transition-all duration-500 relative overflow-hidden shadow-lg flex items-center gap-3",
                      isCompletionReady 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" 
                        : "bg-white/5 text-[#8b9bb4]/30 border border-white/5"
                    )}
                  >
                    FINALIZE WORK ORDER <Check className="w-4 h-4" />
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

