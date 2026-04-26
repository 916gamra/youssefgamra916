import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarClock, Plus, Trash2, Power, Briefcase, Zap, AlertTriangle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { PmScheduleSchema, PmWorkOrderSchema } from '../schema/preventive.schema';
import { cn } from '@/shared/utils';
import { useAuditTrail } from '../../system/hooks/useAuditTrail';
import { GlassCard } from '@/shared/components/GlassCard';

interface SchedulesViewProps {
  user: User | null;
}

export function SchedulesView({ user }: SchedulesViewProps) {
  const machines = useLiveQuery(() => db.machines.toArray());
  const checklists = useLiveQuery(() => db.pmChecklists.toArray());
  const schedules = useLiveQuery(() => db.pmSchedules.toArray());
  const { logEvent } = useAuditTrail();

  const [isCreating, setIsCreating] = useState(false);
  const [machineId, setMachineId] = useState('');
  const [checklistId, setChecklistId] = useState('');
  const [frequencyDays, setFrequencyDays] = useState<number>(30);
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [nextDueDate, setNextDueDate] = useState<string>(todayDateStr);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (!machineId || !checklistId) {
        toast.error('Please select both a machine and a protocol.');
        return;
      }

      const isoDate = new Date(nextDueDate).toISOString();

      const newSchedule = PmScheduleSchema.parse({
        id: crypto.randomUUID(),
        machineId,
        checklistId,
        frequencyDays,
        nextDueDate: isoDate,
        isActive: true
      });

      await db.pmSchedules.add(newSchedule);
      
      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'CREATE',
        entityType: 'PM_SCHEDULE',
        entityId: newSchedule.id,
        details: { 
          machineName: machines?.find(m => m.id === machineId)?.name,
          checklistName: checklists?.find(c => c.id === checklistId)?.name,
          frequency: frequencyDays
        },
        severity: 'INFO'
      });

      toast.success('Maintenance schedule established');
      setIsCreating(false);
      setMachineId('');
      setChecklistId('');
      setFrequencyDays(30);
      setNextDueDate(todayDateStr);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Validation failed');
    }
  };

  const handleDeleteSchedule = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm('Delete this maintenance schedule? Future work orders will stop generating.')) return;
    try {
      const schedule = schedules?.find(s => s.id === id);
      await db.pmSchedules.delete(id);
      
      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'DELETE',
        entityType: 'PM_SCHEDULE',
        entityId: id,
        details: { machineId: schedule?.machineId, checklistId: schedule?.checklistId },
        severity: 'WARNING'
      });

      toast.success('Schedule deleted successfully');
    } catch (err) {
      toast.error('Failed to delete schedule');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await db.pmSchedules.update(id, { isActive: !currentStatus });
      
      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'UPDATE',
        entityType: 'PM_SCHEDULE',
        entityId: id,
        details: { isActive: !currentStatus },
        severity: 'INFO'
      });

      toast.info(`Schedule ${!currentStatus ? 'Activated' : 'Paused'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleTriggerWorkOrder = async (schedule: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await db.transaction('rw', db.pmSchedules, db.pmWorkOrders, async () => {
        const newOrder = PmWorkOrderSchema.parse({
          id: crypto.randomUUID(),
          scheduleId: schedule.id,
          machineId: schedule.machineId,
          checklistId: schedule.checklistId,
          status: 'PENDING',
          scheduledDate: schedule.nextDueDate 
        });
        
        await db.pmWorkOrders.add(newOrder);

        const currentDue = new Date(schedule.nextDueDate);
        currentDue.setDate(currentDue.getDate() + schedule.frequencyDays);
        
        await db.pmSchedules.update(schedule.id, {
          lastPerformedAt: new Date().toISOString(),
          nextDueDate: currentDue.toISOString()
        });
      });

      await logEvent({
        userId: user.id || 0,
        userName: user.name,
        action: 'CREATE',
        entityType: 'PM_WORK_ORDER',
        entityId: schedule.id,
        details: 'Manual work order trigger from schedule',
        severity: 'INFO'
      });

      toast.success('Work Order generated & Next Due Date advanced!', { icon: <Zap className="text-amber-400" /> });
    } catch (err) {
      toast.error('Failed to generate Work Order');
      console.error(err);
    }
  };

  const getMachineName = (id: string) => machines?.find(m => m.id === id)?.name || 'Unknown Machine';
  const getChecklistName = (id: string) => checklists?.find(c => c.id === id)?.name || 'Unknown Protocol';

  const isDataReady = (machines?.length ?? 0) > 0 && (checklists?.length ?? 0) > 0;

  return (
    <div className="w-full h-full p-6 lg:p-8 flex flex-col overflow-hidden bg-transparent">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3 uppercase">
            <CalendarClock className="w-8 h-8 text-emerald-500" />
            PM Scheduler
          </h1>
          <p className="text-slate-400 uppercase tracking-widest text-xs mt-2 font-semibold flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            Automated Maintenance Assignments
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          disabled={!isDataReady}
          className="titan-button bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] !py-3 !px-6 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Initialize Schedule
        </button>
      </div>

      {!isDataReady && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4 backdrop-blur-md shadow-lg shadow-amber-500/5">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h3 className="text-amber-400 text-sm font-bold uppercase tracking-widest">Configuration Required</h3>
            <p className="text-slate-300 text-xs mt-1 font-medium">To establish a maintenance schedule, register at least one Machine and one Maintenance Protocol.</p>
          </div>
        </div>
      )}

      {/* Creation Form */}
      <AnimatePresence>
        {isCreating && isDataReady && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="mb-8"
          >
            <form onSubmit={handleCreateSchedule}>
              <div className="bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 p-8 flex flex-col md:flex-row gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                
                <div className="flex-1 space-y-5 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Target Asset / Machine</label>
                    <select 
                      value={machineId} onChange={e => setMachineId(e.target.value)} required
                      className="w-full titan-input py-3 !bg-black/40"
                    >
                      <option value="" disabled>Select target system...</option>
                      {machines?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Deployed Protocol</label>
                    <select 
                      value={checklistId} onChange={e => setChecklistId(e.target.value)} required
                      className="w-full titan-input py-3 !bg-black/40"
                    >
                      <option value="" disabled>Select checklist blueprint...</option>
                      {checklists?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="w-px h-auto bg-white/10 mx-2 hidden md:block" />

                <div className="flex-1 space-y-5 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Deployment Cycle (Days)</label>
                    <input 
                      type="number" min="1" max="3650" required
                      value={frequencyDays} onChange={e => setFrequencyDays(parseInt(e.target.value))}
                      className="w-full titan-input py-3 !bg-black/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">First Invariant Date</label>
                    <input 
                      type="date" required
                      value={nextDueDate} onChange={e => setNextDueDate(e.target.value)}
                      className="w-full titan-input py-3 !bg-black/40 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-3 pt-4 md:pt-0 min-w-[200px] relative z-10">
                  <button type="button" onClick={() => setIsCreating(false)} className="titan-button titan-button-outline !py-3 !bg-black/40">Cancel</button>
                  <button type="submit" className="titan-button border-0 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] !py-3">
                     Establish Mission <ChevronRight className="w-3 h-3 ml-2 shrink-0" />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedules Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
        {schedules?.length === 0 && !isCreating ? (
           <GlassCard className="w-full h-80 flex flex-col items-center justify-center border border-dashed border-emerald-500/30 rounded-3xl !shadow-none">
              <div className="w-20 h-20 rounded-full bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-6">
                <CalendarClock className="w-8 h-8 text-emerald-500/40" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No Maintenance Bonds Configured</p>
           </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules?.map(schedule => {
              const machineName = getMachineName(schedule.machineId);
              const checklistName = getChecklistName(schedule.checklistId);
              const dueDate = new Date(schedule.nextDueDate);
              const isOverdue = dueDate < new Date() && schedule.isActive;

              return (
                <motion.div 
                  layout
                  key={schedule.id}
                >
                  <GlassCard
                    className={cn(
                      "relative !p-0 overflow-hidden flex flex-col group transition-all duration-500 h-[320px] shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                      schedule.isActive 
                        ? isOverdue ? "border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.05)]" : "border-emerald-500/20 hover:border-emerald-500/40"
                        : "opacity-60 grayscale border-white/5"
                    )}
                  >
                    {schedule.isActive && isOverdue && <div className="absolute inset-0 bg-rose-500/[0.03] pointer-events-none" />}
                    {schedule.isActive && !isOverdue && <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-emerald-500/[0.02] pointer-events-none transition-colors" />}
                    <div className={cn(
                      "h-1 w-full",
                      schedule.isActive ? (isOverdue ? "bg-rose-500" : "bg-emerald-500") : "bg-white/10"
                    )} />

                    <div className="p-6 flex flex-col flex-1 relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-105 shadow-sm",
                            schedule.isActive 
                              ? (isOverdue ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500") 
                              : "bg-white/5 border-white/10 text-slate-500"
                          )}>
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            {isOverdue && schedule.isActive && (
                              <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1 mb-1 bg-rose-500/10 px-2 py-0.5 rounded w-max">
                                <AlertTriangle className="w-3 h-3 animate-pulse" /> Overdue
                              </span>
                            )}
                            <h3 className="font-bold text-slate-200 text-lg leading-tight tracking-tight drop-shadow-md">{machineName}</h3>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleToggleStatus(schedule.id, schedule.isActive, e)}
                            title={schedule.isActive ? "Pause System" : "Activate System"}
                            className="p-2.5 bg-black/20 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95 shadow-sm"
                          >
                            <Power className={cn("w-4 h-4", schedule.isActive ? "text-emerald-400" : "")} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                            title="Purge Link"
                            className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 border border-rose-500/20 transition-all active:scale-95 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 mb-auto">
                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 shadow-inner">
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Maintenance Protocol</p>
                          <p className="text-sm font-bold text-slate-200 line-clamp-1">{checklistName}</p>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="flex-1 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Frequency</p>
                            <p className="text-sm font-bold text-slate-200 uppercase">{schedule.frequencyDays} Days</p>
                          </div>
                          <div className="flex-1 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Next Service</p>
                            <p className={cn("text-sm font-bold", isOverdue && schedule.isActive ? "text-rose-400" : "text-emerald-400")}>
                              {dueDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/5">
                        <button 
                          onClick={(e) => handleTriggerWorkOrder(schedule, e)}
                          disabled={!schedule.isActive}
                          className={cn(
                            "w-full py-3.5 font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border relative overflow-hidden shadow-sm active:scale-[0.98]",
                            isOverdue && schedule.isActive 
                              ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/30 shadow-[inset_0_1px_rgba(255,255,255,0.1)]" 
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[inset_0_1px_rgba(255,255,255,0.1)]"
                          )}
                        >
                          <Zap className="w-4 h-4" />
                          {isOverdue && schedule.isActive ? "Execute Overdue Service" : "Generate Work Order"}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
