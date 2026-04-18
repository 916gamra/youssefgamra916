import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarClock, Plus, Trash2, Power, Briefcase, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/core/db';
import { PmScheduleSchema, PmWorkOrderSchema } from '../schema/preventive.schema';
import { cn } from '@/shared/utils';

export function SchedulesView() {
  const machines = useLiveQuery(() => db.machines.toArray());
  const checklists = useLiveQuery(() => db.pmChecklists.toArray());
  const schedules = useLiveQuery(() => db.pmSchedules.toArray());

  const [isCreating, setIsCreating] = useState(false);
  const [machineId, setMachineId] = useState('');
  const [checklistId, setChecklistId] = useState('');
  const [frequencyDays, setFrequencyDays] = useState<number>(30);
  
  // Format today's date for default input value
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [nextDueDate, setNextDueDate] = useState<string>(todayDateStr);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!machineId || !checklistId) {
        toast.error('Please select both a machine and a protocol.');
        return;
      }

      // Convert date string back to ISO for storage
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
    if (!window.confirm('Delete this maintenance schedule? Future work orders will stop generating.')) return;
    try {
      await db.pmSchedules.delete(id);
      toast.success('Schedule deleted successfully');
    } catch (err) {
      toast.error('Failed to delete schedule');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.pmSchedules.update(id, { isActive: !currentStatus });
      toast.info(`Schedule ${!currentStatus ? 'Activated' : 'Paused'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Generate a work order instantly from schedule and push the next due date forward
  const handleTriggerWorkOrder = async (schedule: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.transaction('rw', db.pmSchedules, db.pmWorkOrders, async () => {
        // 1. Create a Work Order
        const newOrder = PmWorkOrderSchema.parse({
          id: crypto.randomUUID(),
          scheduleId: schedule.id,
          machineId: schedule.machineId,
          checklistId: schedule.checklistId,
          status: 'PENDING',
          scheduledDate: schedule.nextDueDate // Order is generated for the current due date
        });
        
        await db.pmWorkOrders.add(newOrder);

        // 2. Advance the schedule's next due date
        const currentDue = new Date(schedule.nextDueDate);
        currentDue.setDate(currentDue.getDate() + schedule.frequencyDays);
        
        await db.pmSchedules.update(schedule.id, {
          lastPerformedAt: new Date().toISOString(),
          nextDueDate: currentDue.toISOString()
        });
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
    <div className="w-full h-full p-6 lg:p-8 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400 tracking-tight flex items-center gap-3">
            <CalendarClock className="w-8 h-8" />
            Maintenance Schedules
          </h1>
          <p className="text-[var(--text-dim)] uppercase tracking-widest text-sm mt-2 font-medium">
            Automated Protocol Deployment Engine
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          disabled={!isDataReady}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-sm rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> New Schedule
        </button>
      </div>

      {!isDataReady && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h3 className="text-amber-400 font-bold">Preparation Required</h3>
            <p className="text-amber-400/70 text-sm mt-1">To create a schedule, you must first register at least one Machine in the Master Data module and create at least one Preventive Protocol (Checklist).</p>
          </div>
        </div>
      )}

      {/* Creation Form */}
      <AnimatePresence>
        {isCreating && isDataReady && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mb-8"
          >
            <form onSubmit={handleCreateSchedule} className="bg-black/60 border border-emerald-500/30 p-6 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row gap-6">
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-400/70 mb-2 uppercase tracking-wider">Target Machine</label>
                  <select 
                    value={machineId} onChange={e => setMachineId(e.target.value)} required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none appearance-none"
                  >
                    <option value="" disabled>Select a machine...</option>
                    {machines?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-emerald-400/70 mb-2 uppercase tracking-wider">Protocol (Checklist)</label>
                  <select 
                    value={checklistId} onChange={e => setChecklistId(e.target.value)} required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none appearance-none"
                  >
                    <option value="" disabled>Select a protocol...</option>
                    {checklists?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="w-px h-auto bg-white/5 mx-2 hidden md:block" />

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-400/70 mb-2 uppercase tracking-wider">Frequency (Days)</label>
                  <input 
                    type="number" min="1" max="3650" required
                    value={frequencyDays} onChange={e => setFrequencyDays(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-400/70 mb-2 uppercase tracking-wider">First Due Date</label>
                  <input 
                    type="date" required
                    value={nextDueDate} onChange={e => setNextDueDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3 pt-4 md:pt-0">
                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 text-xs font-medium text-white/50 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 text-sm font-bold text-black bg-emerald-500 rounded-xl hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">Establish Link</button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedules Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {schedules?.length === 0 && !isCreating ? (
           <div className="w-full h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <CalendarClock className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/40 uppercase tracking-widest font-medium">No Schedules Configured</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules?.map(schedule => {
              const machineName = getMachineName(schedule.machineId);
              const checklistName = getChecklistName(schedule.checklistId);
              const dueDate = new Date(schedule.nextDueDate);
              const isOverdue = dueDate < new Date() && schedule.isActive;

              return (
                <div 
                  key={schedule.id}
                  className={cn(
                    "relative p-6 rounded-3xl border backdrop-blur-md flex flex-col h-[280px] transition-all group overflow-hidden",
                    schedule.isActive 
                      ? isOverdue ? "bg-red-500/5 border-red-500/30" : "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50"
                      : "bg-white/5 border-white/10 opacity-70 grayscale"
                  )}
                >
                  {/* Overdue Glow Effect */}
                  {isOverdue && schedule.isActive && (
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none" />
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", 
                        schedule.isActive ? (isOverdue ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400") : "bg-white/10 border-white/20 text-white/50"
                      )}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        {isOverdue && schedule.isActive && <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1 mb-0.5"><AlertTriangle className="w-3 h-3" /> Overdue</span>}
                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{machineName}</h3>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleToggleStatus(schedule.id, schedule.isActive, e)}
                        title={schedule.isActive ? "Pause Schedule" : "Activate Schedule"}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                      >
                        <Power className={cn("w-4 h-4", schedule.isActive ? "text-emerald-400" : "text-white/40")} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteSchedule(schedule.id, e)}
                        title="Delete Schedule"
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-auto">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-1">Protocol / Checklist</p>
                      <p className="text-sm font-medium text-white/80 line-clamp-1">{checklistName}</p>
                    </div>
                    
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-1">Frequency</p>
                        <p className="text-sm font-bold text-white/80">{schedule.frequencyDays} Days</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-1">Next Due</p>
                        <p className={cn("text-sm font-bold", isOverdue && schedule.isActive ? "text-red-400" : "text-emerald-400")}>
                          {dueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <button 
                      onClick={(e) => handleTriggerWorkOrder(schedule, e)}
                      disabled={!schedule.isActive}
                      className="w-full py-3 bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 border border-transparent hover:border-amber-500/50 text-white/60 font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white/60 disabled:hover:border-transparent group/btn"
                    >
                      <Zap className="w-4 h-4 group-hover/btn:fill-amber-400/20" /> Generate Work Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
