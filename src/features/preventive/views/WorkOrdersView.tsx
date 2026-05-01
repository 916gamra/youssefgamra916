import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { HardHat, Clock, CheckCircle2, Circle, AlertTriangle, Cpu, ShieldCheck, Check, ChevronRight, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { cn } from '@/shared/utils';
import { useAuditTrail } from '../../system/hooks/useAuditTrail';
import { GlassCard } from '@/shared/components/GlassCard';

interface WorkOrdersViewProps {
  user: User | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col md:flex-row p-6 lg:p-8 gap-8 overflow-hidden bg-transparent"
    >
      
      {/* LEFT PANEL: Deployment List */}
      <motion.div variants={itemVariants} className="w-full md:w-[32%] flex flex-col h-full shrink-0">
        <GlassCard className="!p-0 flex flex-col h-full overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border-emerald-500/10">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/5 backdrop-blur-sm relative z-10">
            <h2 className="text-emerald-400 text-xs font-bold tracking-widest uppercase flex items-center gap-3">
              <HardHat className="w-4 h-4 text-emerald-500" />
              DEPLOYMENT QUEUE
            </h2>
            <span className="text-[10px] text-emerald-500/70 border border-emerald-500/20 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded shadow-sm">ACTIVE OPS</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 relative z-10">
            {(!workOrders || workOrders.length === 0) && (
              <div className="flex flex-col items-center justify-center h-48 mt-12 opacity-50 px-6 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                 <ShieldCheck className="w-12 h-12 mb-4 text-slate-500" />
                 <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Zero Active Deployments</p>
                 <p className="text-[10px] font-medium text-slate-500">All equipment maintenance is up to date</p>
              </div>
            )}

            {/* Pending Group */}
            {pendingOrders.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-4 ml-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> ACTIVE DEPLOYMENTS
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
                          : "bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.04]"
                      )}
                    >
                      {selectedOrderId === order.id && (
                         <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                      )}
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-105 shadow-inner",
                        order.status === 'IN_PROGRESS' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                      )}>
                        {order.status === 'IN_PROGRESS' ? <Clock className="w-6 h-6 " /> : <HardHat className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={cn("font-bold text-sm tracking-tight truncate transition-colors", selectedOrderId === order.id ? "text-emerald-400" : "text-slate-200")}>
                          {getMachineName(order.machineId)}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-tight mt-1">{getChecklistName(order.checklistId)}</p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 transition-all opacity-0 group-hover:opacity-100", selectedOrderId === order.id ? "text-emerald-500 translate-x-0" : "text-slate-400 -translate-x-2")} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Group */}
            {completedOrders.length > 0 && (
              <div className="pt-4">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 ml-2">ARCHIVED MISSIONS</h3>
                <div className="space-y-3">
                  {completedOrders.map(order => (
                    <button 
                      key={order.id} 
                      onClick={() => handleSelectOrder(order)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 opacity-70 hover:opacity-100 grayscale hover:grayscale-0",
                        selectedOrderId === order.id 
                          ? "bg-white/[0.05] border border-white/10" 
                          : "bg-white/[0.01] border border-white/5 hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/5 text-emerald-500/50 border border-emerald-500/10 shadow-inner">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-300 truncate">{getMachineName(order.machineId)}</h4>
                        <p className="text-[9px] text-slate-500 font-mono tracking-widest mt-1">{new Date(order.completedDate || '').toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </GlassCard>
      </motion.div>

      {/* RIGHT PANEL: Terminal */}
      <motion.div variants={itemVariants} className="flex-1 h-full flex flex-col shrink-0 relative">
        <GlassCard className="!p-0 flex flex-col h-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)] border-white/5 relative">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {!selectedOrderId || !selectedOrder ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center relative z-10"
              >
                <div className="w-32 h-32 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center mb-10 overflow-hidden relative shadow-inner">
                   <div className="absolute inset-0 bg-emerald-500/5 rotate-45 scale-150 transition-all group-hover:rotate-90 duration-700" />
                   <Cpu className="w-12 h-12 text-slate-600 relative z-10" />
                </div>
                <p className="text-xl font-bold tracking-widest uppercase text-slate-400">Select Work Order</p>
                <p className="text-[10px] mt-4 font-bold text-slate-500 uppercase tracking-widest max-w-xs">Select an active deployment from the queue to initiate review</p>
              </motion.div>
            ) : (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="flex-1 flex flex-col h-full relative z-10"
              >
                <div className="p-10 border-b border-white/10 relative overflow-hidden bg-black/60 backdrop-blur-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <span className={cn("px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm",
                      selectedOrder.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      selectedOrder.status === 'IN_PROGRESS' ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                      "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                    )}>
                      {selectedOrder.status.replace('_', ' ')}
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] text-slate-400 font-mono tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
                      DEPLOYED: {new Date(selectedOrder.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-white tracking-tight mb-4 uppercase leading-none drop-shadow-md">
                    {getMachineName(selectedOrder.machineId)}
                  </h2>
                  
                  <div className="flex items-center gap-3 text-emerald-500 font-bold uppercase tracking-widest text-[11px] bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-max shadow-sm">
                    <Activity className="w-4 h-4 shadow-[0_0_10px_#10b981aa]" />
                    {getChecklistName(selectedOrder.checklistId)}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 bg-[#0a0b10]">
                  
                  {selectedOrder.status !== 'COMPLETED' && (
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-amber-500" />
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                          <h4 className="text-amber-400 text-xs font-bold uppercase tracking-widest">Protocol Requirements</h4>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">All checked items must be physically verified. Critical markers require mandatory confirmation for order completion.</p>
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
                            "w-full text-left p-6 rounded-3xl border transition-all duration-300 flex items-start gap-6 group relative overflow-hidden",
                            isChecked 
                              ? "bg-emerald-500/[0.03] border-emerald-500/30 shadow-[inner_0_0_20px_rgba(16,185,129,0.05)]" 
                              : "bg-black/30 border-white/5 hover:border-emerald-500/20 hover:bg-black/40",
                            selectedOrder.status === 'COMPLETED' ? "opacity-70 cursor-default" : "active:scale-[0.99]"
                          )}
                        >
                           <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[50px] font-bold text-white/[0.02] -z-10 select-none group-hover:text-white/[0.03] transition-all">
                              {(index + 1).toString().padStart(2, '0')}
                           </div>
                           
                          <div className={cn("mt-1 shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm rounded-full", 
                             isChecked ? "text-emerald-500 bg-emerald-500/10" : "text-slate-500 group-hover:text-emerald-500/30"
                          )}>
                            {isChecked ? <CheckCircle2 className="w-8 h-8 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> : <Circle className="w-8 h-8" />}
                          </div>
                          <div className="flex-1 relative z-10">
                            <p className={cn("text-base font-medium tracking-wide transition-colors leading-relaxed", isChecked ? "text-white" : "text-slate-400 group-hover:text-slate-200")}>
                              {task.taskDescription}
                            </p>
                            {task.isCritical && (
                              <div className={cn(
                                "flex items-center gap-2 mt-4 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded w-max border shadow-sm",
                                isChecked ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
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
                  <div className="p-8 border-t border-white/10 bg-black/60 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-2xl">
                    <div className="flex flex-col">
                      {!isCompletionReady && selectedTasks && selectedTasks.length > 0 && (
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                           PENDING CRITICAL CHECKS
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium tracking-[0.1em] mt-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
                         {checkedTaskIds.size} of {selectedTasks?.length} steps validated
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleCompleteWorkOrder}
                      disabled={!isCompletionReady}
                      className={cn(
                        "titan-button !px-8 !py-4 font-bold tracking-widest uppercase text-xs transition-all duration-500 flex items-center gap-3",
                        isCompletionReady 
                          ? "bg-emerald-500 hover:bg-emerald-400 text-black border-0 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                          : "titan-button-outline disabled:opacity-50 !bg-black/40"
                      )}
                    >
                      FINALIZE WORK ORDER <Check className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

    </motion.div>
  );
}
