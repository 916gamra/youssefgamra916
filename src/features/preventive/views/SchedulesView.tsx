import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarClock, Plus, Trash2, Power, Briefcase, Zap, AlertTriangle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { PmScheduleSchema, PmWorkOrderSchema } from '../schema/preventive.schema';
import { cn } from '@/shared/utils';
import { useAuditTrail } from '../../system/hooks/useAuditTrail';

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
    <div className="w-full h-full p-6 lg:p-8 flex flex-col overflow-hidden bg-[#0a0a0f]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3 uppercase">
            <CalendarClock className="w-8 h-8 text-blue-500" />
            PM Scheduler
          </h1>
          <p className="text-slate-400 uppercase tracking-widest text-xs mt-2 font-semibold flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
            Automated Maintenance Assignments
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          disabled={!isDataReady}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Initialize Schedule
        </button>
      </div>

      {!isDataReady && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8 flex items-start gap-4 backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-widest">Configuration Required</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">To establish a maintenance schedule, register at least one Machine and one Maintenance Protocol.</p>
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
            <form onSubmit={handleCreateSchedule} className="titan-card p-6 border-emerald-500/30 flex flex-col md:flex-row gap-8 bg-emerald-500/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
              
              <div className="flex-1 space-y-5">
                <div>
                  <label className="titan-label text-[10px] mb-2">Target Asset / Machine</label>
                  <select 
                    value={machineId} onChange={e => setMachineId(e.target.value)} required
                    className="w-full titan-input py-2.5 text-sm"
                  >
                    <option value="" disabled>Select target system...</option>
                    {machines?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="titan-label text-[10px] mb-2">Deployed Protocol</label>
                  <select 
                    value={checklistId} onChange={e => setChecklistId(e.target.value)} required
                    className="w-full titan-input py-2.5 text-sm"
                  >
                    <option value="" disabled>Select checklist blueprint...</option>
                    {checklists?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="w-px h-auto bg-white/5 mx-2 hidden md:block" />

              <div className="flex-1 space-y-5">
                <div>
                  <label className="titan-label text-[10px] mb-2">Deployment Cycle (Days)</label>
                  <input 
                    type="number" min="1" max="3650" required
                    value={frequencyDays} onChange={e => setFrequencyDays(parseInt(e.target.value))}
                    className="w-full titan-input py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="titan-label text-[10px] mb-2">First Invariant Date</label>
                  <input 
                    type="date" required
                    value={nextDueDate} onChange={e => setNextDueDate(e.target.value)}
                    className="w-full titan-input py-2.5 text-sm [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3 pt-4 md:pt-0 min-w-[200px]">
                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8b9bb4] hover:text-white bg-white/5 rounded-xl border border-white/5 transition-all">Cancel</button>
                <button type="submit" className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-black bg-emerald-500 rounded-xl hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2">
                   Establish Mission <ChevronRight className="w-3 h-3" />
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedules Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
        {schedules?.length === 0 && !isCreating ? (
           <div className="w-full h-80 flex flex-col items-center justify-center titan-card border-dashed bg-white/[0.01]">
              <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                <CalendarClock className="w-10 h-10 text-white/20" />
              </div>
              <p className="text-[#8b9bb4] text-xs font-bold uppercase tracking-widest opacity-40">No Maintenance Bonds Configured</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schedules?.map(schedule => {
              const machineName = getMachineName(schedule.machineId);
              const checklistName = getChecklistName(schedule.checklistId);
              const dueDate = new Date(schedule.nextDueDate);
              const isOverdue = dueDate < new Date() && schedule.isActive;

              return (
                <motion.div 
                  layout
                  key={schedule.id}
                  className={cn(
                    "titan-card relative p-0 overflow-hidden flex flex-col group transition-all duration-500 h-[300px]",
                    schedule.isActive 
                      ? isOverdue ? "border-rose-500/40 bg-rose-500/[0.03] shadow-[0_0_25px_rgba(244,63,94,0.05)]" : "border-emerald-500/20 hover:border-emerald-500/50 bg-white/[0.01] hover:bg-emerald-500/[0.02]"
                      : "opacity-60 grayscale border-white/5 bg-black/40"
                  )}
                >
                  <div className={cn(
                    "h-1.5 w-full",
                    schedule.isActive ? (isOverdue ? "bg-rose-500" : "bg-emerald-500") : "bg-white/10"
                  )} />

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-105",
                          schedule.isActive 
                            ? (isOverdue ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-blue-500/10 border-blue-500/30 text-blue-500") 
                            : "bg-white/5 border-white/10 text-white/20 shadow-inner"
                        )}>
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          {isOverdue && schedule.isActive && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1 mb-1">
                              <AlertTriangle className="w-3 h-3 animate-pulse" /> Maintenance Overdue
                            </span>
                          )}
                          <h3 className="font-bold text-white text-lg leading-tight tracking-tight drop-shadow-md">{machineName}</h3>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleToggleStatus(schedule.id, schedule.isActive, e)}
                          title={schedule.isActive ? "Pause System" : "Activate System"}
                          className="p-2.5 bg-black/40 hover:bg-white/10 rounded-xl text-white/30 hover:text-white border border-white/5 transition-all active:scale-95 shadow-inner"
                        >
                          <Power className={cn("w-4 h-4", schedule.isActive ? "text-emerald-400 " : "text-white/20")} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                          title="Purge Link"
                          className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/10 transition-all active:scale-95 shadow-inner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 mb-auto">
                      <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-[#8b9bb4] font-bold mb-1 ml-1 opacity-60">Maintenance Protocol</p>
                        <p className="text-xs font-bold text-white/90 line-clamp-1 ml-1">{checklistName}</p>
                      </div>
                      
                      <div className="flex gap-6 px-1">
                        <div className="flex-1">
                          <p className="text-[9px] uppercase tracking-widest text-[#8b9bb4] font-bold mb-1 opacity-50">Frequency</p>
                          <p className="text-sm font-bold text-white uppercase">{schedule.frequencyDays} Days</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] uppercase tracking-widest text-[#8b9bb4] font-bold mb-1 opacity-50">Next Service Due</p>
                          <p className={cn("text-sm font-bold", isOverdue && schedule.isActive ? "text-rose-400" : "text-blue-400")}>
                            {dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                      <button 
                        onClick={(e) => handleTriggerWorkOrder(schedule, e)}
                        disabled={!schedule.isActive}
                        className={cn(
                          "w-full py-3 font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border relative",
                          isOverdue && schedule.isActive 
                            ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-500/20" 
                            : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500/50 shadow-md shadow-blue-500/20"
                        )}
                      >
                        <Zap className="w-4 h-4" />
                        {isOverdue && schedule.isActive ? "Execute Overdue Service" : "Generate Work Order"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

